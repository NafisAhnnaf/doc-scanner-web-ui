const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8050;
const SCAN_DIR = path.join(__dirname, 'scans');

// Ensure scan directory exists
if (!fs.existsSync(SCAN_DIR)) {
    fs.mkdirSync(SCAN_DIR, { recursive: true });
}

app.use(express.static('public'));

app.post('/scan', (req, res) => {
    const filename = `scan_${Date.now()}.png`;
    const filepath = path.join(SCAN_DIR, filename);

    // We use the exact airscan URI that worked in your manual test
    // Note: The quotes around the URI are important because of the spaces/brackets
    const deviceUri = "airscan:e0:HP DeskJet 2600 series [B63D54] (USB)";
    
    // -d specifies the device
    // -o specifies output path
    // -m color (or gray as in your test)
    // --res=300 for resolution
    const command = `hp-scan -d "${deviceUri}" -m color --res=300 -o "${filepath}"`;

    console.log(`Executing: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Scan error: ${stderr}`);
            return res.status(500).json({ error: "Scan failed", details: stderr });
        }
        console.log("Scan successful:", filename);
        res.json({ file: filename });
    });
});

app.get('/download/:file', (req, res) => {
    const filePath = path.join(SCAN_DIR, req.params.file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    res.download(filePath, (err) => {
        if (err) {
            console.error("Download error:", err);
        } else {
            // Delete the file after a small delay to ensure the system has released it
            setTimeout(() => {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted temporary file: ${filePath}`);
                } catch (e) {
                    console.error("Cleanup error:", e);
                }
            }, 1000);
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Scanner server is live at http://localhost:${PORT}`);
});
