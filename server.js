const express = require("express");
const { spawn } = require("child_process");
const { Server } = require("socket.io");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 8050;
const SCAN_DIR = path.join(__dirname, "scans");
if (!fs.existsSync(SCAN_DIR)) fs.mkdirSync(SCAN_DIR, { recursive: true });

const activeJobs = new Map();
app.use(express.json());
app.use(express.static("ui/dist"));
// --- 1. Socket Setup (Telemetry) ---
io.on("connection", (socket) => {
  socket.on("track_job", (jobId) => {
    if (activeJobs.has(jobId)) {
      socket.join(jobId);
      const job = activeJobs.get(jobId);
      // Reconnect: Send the last known progress percentage
      socket.emit("scan_restored", { jobId, progress: job.progress });
    }
  });
});

// --- 2. HTTP POST (Command) ---
app.post("/scan", (req, res) => {
  const jobId = `job_${randomUUID()}`;
  console.log(req.body);
  // Initialize job in memory with progress at 0
  activeJobs.set(jobId, { status: "running", progress: 0 });

  const { format, colorMode, resolution } = req.body;

  const modeMap = {
    "RGB Color": "color",
    Grayscale: "gray",
    "Black & White": "lineart",
  };
  const scanMode = modeMap[colorMode] || "color";
  const scanRes = resolution.split(" ")[0];
  const fileExt = format.toLowerCase();
  const filename = `scan_${Date.now()}.${fileExt}`;
  const filepath = path.join(SCAN_DIR, filename);

  const deviceUri = "airscan:e0:HP DeskJet 2600 series [B63D54] (USB)";

  const scanArgs = [
    "-d",
    deviceUri,
    "-m",
    scanMode,
    `--res=${scanRes}`,
    "-o",
    filepath,
  ];

  const scanProcess = spawn("hp-scan", scanArgs);

  // --- Regex Parsing Logic ---
  const handleOutput = (data) => {
    const text = data.toString();

    // Find all occurrences of 1-3 digits followed by a '%' (e.g., "12%", "100%")
    const matches = [...text.matchAll(/(\d{1,3})%/g)];

    if (matches.length > 0) {
      // Get the very last match in this chunk of data
      const lastMatch = matches[matches.length - 1];
      const percentage = parseInt(lastMatch[1], 10);

      // Sanity check to ensure it's a valid 0-100 progress
      if (percentage >= 0 && percentage <= 100) {
        const job = activeJobs.get(jobId);
        if (job) job.progress = percentage; // Cache it

        io.to(jobId).emit("scan_progress", { progress: percentage }); // Stream it
      }
    }
  };

  // Attach the parser to both output streams
  scanProcess.stdout.on("data", handleOutput);
  scanProcess.stderr.on("data", handleOutput);

  scanProcess.on("close", (code) => {
    if (code === 0) {
      // Force 100% on completion just in case the CLI didn't output it
      io.to(jobId).emit("scan_progress", { progress: 100 });
      io.to(jobId).emit("scan_complete", { file: filename });
    } else {
      io.to(jobId).emit("scan_error", { error: `Exited with code ${code}` });
    }
    setTimeout(() => activeJobs.delete(jobId), 10000);
  });

  res.status(202).json({
    message: "Scan initiated",
    jobId: jobId,
  });
});

// --- 3. HTTP GET (Resource Retrieval) ---
app.get("/download/:file", (req, res) => {
  const filePath = path.join(SCAN_DIR, req.params.file);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");

  res.download(filePath, (err) => {
    if (!err) setTimeout(() => fs.unlinkSync(filePath), 1000);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server live at http://localhost:${PORT}`);
});
