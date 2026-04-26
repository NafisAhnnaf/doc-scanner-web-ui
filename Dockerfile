
FROM node:18 AS ui-builder

WORKDIR /app/ui

COPY ui/package*.json ./
RUN npm install

# Copy the rest of the frontend code and run Vite's build command
# Vite will output the compiled files directly into /app/ui/dist
COPY ui/ ./
RUN npm run build

# ==========================================
# Stage 2: Final Production Server
# ==========================================
FROM node:18-slim

# Install HPLIP and SANE dependencies
RUN apt-get update && apt-get install -y \
    hplip \
    sane-utils \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to the root of your backend
WORKDIR /app

# Install backend Node.js dependencies
COPY package*.json ./
RUN npm install --production

# Copy backend source code
COPY server.js ./
COPY utils/ ./utils/

# Grab the compiled 'dist' folder from Stage 1 and put it exactly where Express expects it
# FROM: /app/ui/dist (in the builder) -> TO: /app/ui/dist (in the final server)
COPY --from=ui-builder /app/ui/dist ./ui/dist

# Ensure the scan output directory exists
RUN mkdir -p scans

EXPOSE 8050
CMD ["node", "server.js"]