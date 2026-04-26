FROM node:18-slim

# Install HPLIP and dependencies
RUN apt-get update && apt-get install -y \
    hplip \
    sane-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8050
CMD ["node", "server.js"]

