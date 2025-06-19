# 🌉 OFFSTAR Multi-Bridge Connector

Universal connector system for your enterprise AGI business hub. Connect all your apps, MCPs, APIs, and services through a single, unified interface.

## ✨ Features

🌉 **Universal Bridge System**
- Connect to any API, MCP, or service
- Real-time WebSocket communication  
- Voice command integration
- Mobile terminal support
- Enterprise-grade architecture

🔌 **Pre-configured Bridges**
- **APIs**: GitHub, OpenAI, Discord, Slack, Telegram
- **Cloud**: AWS, GCP, Azure
- **Payment**: Stripe, PayPal, Coinbase
- **Productivity**: Notion, Airtable, Google Sheets
- **Custom**: Add any API or service

📱 **Mobile Terminal Ready**
- Voice command processing
- Terminal integration
- Cross-platform deployment
- File system access

🤖 **MCP Integration**
- Connect to MCP servers
- Real-time communication
- Auto-discovery
- Protocol abstraction

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/protechtimenow/offstar-multi-bridge.git
cd offstar-multi-bridge
./install.sh
```

### 2. Configure
```bash
cp config.example.json config.json
# Edit config.json with your API keys
```

### 3. Run
```bash
npm start
```

### 4. Test
```bash
curl http://localhost:3001/health
```

## 📱 Mobile Terminal Deployment

For phone terminal installation:

```bash
# Download and extract
wget https://github.com/protechtimenow/offstar-multi-bridge/archive/main.zip
unzip main.zip
cd offstar-multi-bridge-main

# Install and run
./install.sh
npm start
```

## 🎯 Usage Examples

### Bridge API Calls
```bash
# GitHub user info
curl http://localhost:3001/bridge/github/user

# OpenAI completion
curl -X POST http://localhost:3001/bridge/openai/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hello"}]}'

# Send webhook
curl -X POST http://localhost:3001/bridge/webhook/event \
  -H "Content-Type: application/json" \
  -d '{"event":"test","data":"hello world"}'
```

### Voice Commands
```bash
# Process voice command
node mobile-bridge.js voice "connect to github"
node mobile-bridge.js voice "create new app"
node mobile-bridge.js voice "run terminal ls"
```

### Bridge Management
```bash
# List all bridges
curl http://localhost:3001/bridges

# Health check
curl http://localhost:3001/health
```

## 🔧 Configuration

Edit `config.json`:

```json
{
  "port": 3000,
  "bridgePort": 3001,
  "apiKeys": {
    "github": "ghp_your_token_here",
    "openai": "sk-your_key_here",
    "discord": "your_discord_token"
  },
  "mcpConnections": [
    {
      "name": "my-mcp-server",
      "endpoint": "ws://localhost:8080",
      "autoConnect": true
    }
  ]
}
```

## 🔌 Extending the System

### Add Custom Bridge
```javascript
const bridge = require('./multi-bridge');

// Add custom API bridge
bridge.addBridge('my-service', {
  type: 'api',
  endpoint: 'https://api.myservice.com',
  headers: { 'Authorization': 'Bearer token' },
  active: true
});
```

### Connect MCP Server
```javascript
// Connect to MCP server
await bridge.connectBridge('my-mcp', {
  endpoint: 'ws://localhost:8080',
  protocol: 'websocket'
});
```

### Custom Voice Commands
```javascript
// Override intent parsing
bridge.parseIntent = (command) => {
  if (command.includes('my-app')) {
    return {
      bridge: 'my-service',
      path: 'action',
      data: { command }
    };
  }
  // ... existing logic
};
```

## 🏢 Enterprise Features

- **Hub Directory**: Organized service connections
- **Auto-discovery**: Detect and connect to local services  
- **Load balancing**: Distribute requests across bridges
- **Monitoring**: Real-time bridge health and metrics
- **Security**: Token management and secure connections
- **Scalability**: Handle thousands of concurrent connections

## 🔒 Security

- API key encryption
- Command whitelist for terminal access
- CORS protection
- Rate limiting
- Secure WebSocket connections

## 📊 API Reference

### Bridge Endpoints
- `GET /bridges` - List all bridges and status
- `GET /health` - System health check
- `POST /voice` - Process voice command
- `ALL /bridge/:service/*` - Universal bridge proxy

### WebSocket Events
- `bridge_request` - Send bridge request
- `bridge_response` - Receive bridge response
- `bridge_error` - Error handling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-bridge`
3. Commit changes: `git commit -m 'Add amazing bridge'`
4. Push to branch: `git push origin feature/amazing-bridge`
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/protechtimenow/offstar-multi-bridge/issues)
- **Documentation**: [Wiki](https://github.com/protechtimenow/offstar-multi-bridge/wiki)
- **Community**: [Discussions](https://github.com/protechtimenow/offstar-multi-bridge/discussions)

---

🚀 **Ready for your Enterprise AGI Business Hub!**

The OFFSTAR Multi-Bridge Connector provides a unified interface to connect all your applications, services, and AI systems. Perfect for building scalable enterprise AGI solutions.