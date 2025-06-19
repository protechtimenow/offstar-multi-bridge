# 📱 OFFSTAR Multi-Bridge Mobile Terminal Deployment

Complete guide for deploying the Multi-Bridge Connector on mobile terminals, phones, and any Unix-like system.

## 🎯 Zero-to-Running in 3 Minutes

### Option 1: GitHub Clone (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/protechtimenow/offstar-multi-bridge.git
cd offstar-multi-bridge

# 2. Run auto-installer
./install.sh

# 3. Configure (optional but recommended)
cp config.example.json config.json
nano config.json  # Add your API keys

# 4. Start the bridge
npm start
```

### Option 2: Quick Download & Deploy

```bash
# For systems without git
wget https://github.com/protechtimenow/offstar-multi-bridge/archive/main.zip
unzip main.zip
cd offstar-multi-bridge-main
./install.sh
npm start
```

### Option 3: Direct Terminal Installation

```bash
# One-liner installation
curl -fsSL https://raw.githubusercontent.com/protechtimenow/offstar-multi-bridge/main/install.sh | bash
```

## 🔧 Configuration

### Basic Setup

1. **Copy example config:**
   ```bash
   cp config.example.json config.json
   ```

2. **Add your API keys:**
   ```json
   {
     "apiKeys": {
       "github": "ghp_your_github_token_here",
       "openai": "sk-your_openai_key_here",
       "discord": "your_discord_bot_token"
     }
   }
   ```

3. **Save and restart:**
   ```bash
   npm start
   ```

### Enterprise Configuration

For production/enterprise use, configure additional options:

```json
{
  "enterprise": {
    "enableLogging": true,
    "enableMetrics": true,
    "enableHealthChecks": true
  },
  "security": {
    "corsOrigins": ["https://yourdomain.com"],
    "rateLimit": {
      "windowMs": 900000,
      "max": 1000
    }
  }
}
```

## 🎤 Voice Commands

The Multi-Bridge supports natural language voice commands:

```bash
# GitHub operations
node mobile-bridge.js voice "connect to github"
node mobile-bridge.js voice "show my repositories"

# AI/OpenAI operations  
node mobile-bridge.js voice "create a new app"
node mobile-bridge.js voice "generate code for calculator"

# Terminal operations
node mobile-bridge.js voice "run terminal ls"
node mobile-bridge.js voice "show current directory"

# Custom operations
node mobile-bridge.js voice "send webhook test event"
```

## 🌉 Bridge Usage

### List Available Bridges

```bash
curl http://localhost:3001/bridges
```

### Health Check

```bash
curl http://localhost:3001/health
```

### Universal Bridge API

```bash
# GitHub user info
curl http://localhost:3001/bridge/github/user

# OpenAI completion
curl -X POST http://localhost:3001/bridge/openai/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hello"}]}'

# Send webhook
curl -X POST http://localhost:3001/bridge/webhook/event \\
  -H "Content-Type: application/json" \\
  -d '{"event":"test","data":"hello world"}'
```

## 🤖 MCP Server Integration

### Add MCP Server

Edit `config.json`:

```json
{
  "mcpConnections": [
    {
      "name": "file-server",
      "endpoint": "ws://localhost:8080",
      "autoConnect": true
    }
  ]
}
```

### Use MCP Bridge

```bash
# File operations through MCP
curl -X POST http://localhost:3001/bridge/mcp_file-server/read \\
  -H "Content-Type: application/json" \\
  -d '{"path": "/home/user/document.txt"}'
```

## 📱 Mobile Specific Features

### Voice Processing

```bash
# HTTP endpoint for voice commands
curl -X POST http://localhost:3001/voice \\
  -H "Content-Type: application/json" \\
  -d '{"command": "connect to github"}'
```

### WebSocket Real-time

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

socket.emit('bridge_request', {
  id: 'req-1',
  service: 'github',
  path: 'user'
});

socket.on('bridge_response', (data) => {
  console.log('Response:', data);
});
```

## 🔌 Adding Custom Bridges

### Runtime Bridge Addition

```bash
# Add custom API bridge
curl -X POST http://localhost:3001/admin/bridges \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my-api",
    "config": {
      "type": "api",
      "endpoint": "https://api.myservice.com",
      "headers": {"Authorization": "Bearer token"},
      "active": true
    }
  }'
```

### Programmatic Bridge

```javascript
const { MultiBridgeConnector } = require('./multi-bridge');
const bridge = new MultiBridgeConnector(config);

// Add custom bridge
bridge.addBridge('custom-service', {
  type: 'api',
  endpoint: 'https://api.custom.com',
  headers: { 'Authorization': 'Bearer token' },
  active: true
});
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Kill process on port 3001
   lsof -ti:3001 | xargs kill -9
   
   # Or change port in config.json
   {"bridgePort": 3002}
   ```

2. **Node.js not found:**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Permission denied:**
   ```bash
   # Make install script executable
   chmod +x install.sh
   ```

4. **API rate limits:**
   ```bash
   # Check bridge status
   curl http://localhost:3001/bridges
   
   # Add rate limiting in config.json
   {"security": {"rateLimit": {"max": 100}}}
   ```

### Debug Mode

```bash
# Enable debug logging
DEBUG=bridge:* npm start

# Verbose logging
NODE_ENV=development npm start
```

## 🔒 Security Considerations

### Production Deployment

1. **API Key Security:**
   ```bash
   # Use environment variables
   export GITHUB_TOKEN="ghp_your_token"
   export OPENAI_KEY="sk_your_key"
   ```

2. **Network Security:**
   ```json
   {
     "security": {
       "corsOrigins": ["https://yourdomain.com"],
       "allowedCommands": ["ls", "pwd", "echo"]
     }
   }
   ```

3. **SSL/TLS (Recommended):**
   ```bash
   # Use reverse proxy (nginx, caddy)
   # Or configure HTTPS in Express
   ```

## 📊 Monitoring & Metrics

### Health Monitoring

```bash
# Regular health checks
watch -n 5 'curl -s http://localhost:3001/health | jq'

# Bridge status monitoring
watch -n 10 'curl -s http://localhost:3001/bridges | jq'
```

### Log Monitoring

```bash
# Real-time logs
tail -f logs/bridge.log

# Error monitoring
tail -f logs/error.log
```

## 🚀 Scaling & Production

### Load Balancer Setup

```bash
# Run multiple instances
PORT=3001 BRIDGE_PORT=4001 npm start &
PORT=3002 BRIDGE_PORT=4002 npm start &
PORT=3003 BRIDGE_PORT=4003 npm start &
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/multi-bridge.service
```

```ini
[Unit]
Description=OFFSTAR Multi-Bridge Connector
After=network.target

[Service]
Type=simple
User=bridge
WorkingDirectory=/opt/multi-bridge
ExecStart=/usr/bin/node mobile-bridge.js
Restart=always

[Install]
WantedBy=multi-user.target
```

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/protechtimenow/offstar-multi-bridge/issues)
- **Documentation**: [GitHub Wiki](https://github.com/protechtimenow/offstar-multi-bridge/wiki)
- **Examples**: Check the `examples/` directory

---

## 🎉 Success!

Your OFFSTAR Multi-Bridge Connector is now ready to serve as your Enterprise AGI Business Hub! 

**Next Steps:**
1. Add your API keys to `config.json`
2. Connect your MCP servers
3. Start bridging your applications
4. Build your AGI empire! 🌉🚀