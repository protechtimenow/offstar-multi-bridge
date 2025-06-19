/**
 * OFFSTAR Multi-Bridge Connector System
 * Universal connector for apps, MCPs, APIs, and enterprise AGI business hub
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

class MultiBridgeConnector {
  constructor(config = {}) {
    this.config = {
      port: config.port || 3000,
      bridgePort: config.bridgePort || 3001,
      apiKeys: config.apiKeys || {},
      endpoints: config.endpoints || {},
      mcpConnections: config.mcpConnections || [],
      ...config
    };
    
    this.bridges = new Map();
    this.activeConnections = new Map();
    this.eventBus = new EventTarget();
    
    this.init();
  }

  async init() {
    console.log('🌉 Initializing Multi-Bridge Connector...');
    
    // Setup core bridges
    await this.setupCoreBridges();
    
    // Initialize API bridges
    await this.setupAPIBridges();
    
    // Setup MCP connections
    await this.setupMCPBridges();
    
    // Start the bridge server
    await this.startBridgeServer();
    
    console.log('✅ Multi-Bridge Connector ready!');
    console.log(`🔗 Bridge API: http://localhost:${this.config.bridgePort}`);
    console.log(`📱 Health Check: http://localhost:${this.config.bridgePort}/health`);
  }

  setupCoreBridges() {
    // GitHub Bridge
    this.bridges.set('github', {
      type: 'api',
      endpoint: 'https://api.github.com',
      headers: {
        'Authorization': `token ${this.config.apiKeys.github || 'your_token'}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      active: !!this.config.apiKeys.github
    });

    // OpenAI Bridge
    this.bridges.set('openai', {
      type: 'ai',
      endpoint: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${this.config.apiKeys.openai || 'your_key'}`,
        'Content-Type': 'application/json'
      },
      methods: ['POST'],
      active: !!this.config.apiKeys.openai
    });

    // Webhook Bridge
    this.bridges.set('webhook', {
      type: 'webhook',
      endpoint: this.config.endpoints.webhook || '/webhook',
      methods: ['POST'],
      active: true
    });

    // Terminal Bridge
    this.bridges.set('terminal', {
      type: 'terminal',
      endpoint: '/terminal',
      active: true
    });

    console.log('🔧 Core bridges setup complete');
  }

  setupAPIBridges() {
    const apiBridges = [
      'discord', 'slack', 'telegram', 'whatsapp',
      'stripe', 'paypal', 'coinbase',
      'aws', 'gcp', 'azure',
      'notion', 'airtable', 'sheets'
    ];

    apiBridges.forEach(api => {
      this.bridges.set(api, {
        type: 'external_api',
        configured: !!this.config.apiKeys[api],
        active: !!this.config.apiKeys[api]
      });
    });

    console.log('🔌 API bridges configured');
  }

  setupMCPBridges() {
    this.config.mcpConnections.forEach(mcp => {
      this.bridges.set(`mcp_${mcp.name}`, {
        type: 'mcp',
        endpoint: mcp.endpoint,
        protocol: mcp.protocol || 'websocket',
        active: false,
        autoConnect: mcp.autoConnect || true
      });
    });

    console.log('🤖 MCP bridges prepared');
  }

  async startBridgeServer() {
    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
      cors: { origin: "*" }
    });

    app.use(express.json());

    // Universal bridge endpoint
    app.all('/bridge/:service/*', async (req, res) => {
      const { service } = req.params;
      const path = req.params[0];
      
      try {
        const result = await this.routeRequest(service, path, req);
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Bridge status endpoint
    app.get('/bridges', (req, res) => {
      const bridgeStatus = {};
      this.bridges.forEach((bridge, name) => {
        bridgeStatus[name] = {
          type: bridge.type,
          active: bridge.active,
          configured: bridge.configured !== false
        };
      });
      res.json(bridgeStatus);
    });

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        bridges: this.bridges.size,
        connections: this.activeConnections.size,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    // Voice command endpoint
    app.post('/voice', async (req, res) => {
      try {
        const { command } = req.body;
        const result = await this.processVoiceCommand(command);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // WebSocket for real-time bridge communication
    io.on('connection', (socket) => {
      console.log('🔗 Bridge client connected');
      
      socket.on('bridge_request', async (data) => {
        try {
          const result = await this.handleBridgeRequest(data);
          socket.emit('bridge_response', { id: data.id, result });
        } catch (error) {
          socket.emit('bridge_error', { id: data.id, error: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log('🔗 Bridge client disconnected');
      });
    });

    server.listen(this.config.bridgePort, () => {
      console.log(`🌉 Multi-Bridge Server running on port ${this.config.bridgePort}`);
    });

    return server;
  }

  async routeRequest(service, path, req) {
    const bridge = this.bridges.get(service);
    
    if (!bridge) {
      throw new Error(`Bridge '${service}' not found`);
    }

    if (!bridge.active) {
      throw new Error(`Bridge '${service}' is not active. Check configuration.`);
    }

    // Route based on bridge type
    switch (bridge.type) {
      case 'api':
      case 'ai':
        return await this.handleAPIRequest(bridge, path, req);
      case 'webhook':
        return await this.handleWebhookRequest(bridge, path, req);
      case 'terminal':
        return await this.handleTerminalRequest(bridge, path, req);
      default:
        throw new Error(`Unsupported bridge type: ${bridge.type}`);
    }
  }

  async handleAPIRequest(bridge, path, req) {
    const fetch = require('node-fetch');
    const url = `${bridge.endpoint}/${path}`;
    
    try {
      const response = await fetch(url, {
        method: req.method,
        headers: { ...bridge.headers, ...req.headers },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
      });

      return await response.json();
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async handleWebhookRequest(bridge, path, req) {
    // Emit webhook event
    const eventData = {
      path,
      method: req.method,
      body: req.body,
      headers: req.headers,
      timestamp: Date.now()
    };

    console.log('📨 Webhook received:', eventData);
    
    return { received: true, timestamp: Date.now() };
  }

  async handleTerminalRequest(bridge, path, req) {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Security: Only allow safe commands
    const safeCommands = ['ls', 'pwd', 'echo', 'date', 'whoami'];
    const command = req.body.command;
    
    if (!safeCommands.some(safe => command.startsWith(safe))) {
      throw new Error('Command not allowed for security reasons');
    }

    try {
      const { stdout, stderr } = await execAsync(command);
      return { stdout, stderr, command };
    } catch (error) {
      throw new Error(`Terminal command failed: ${error.message}`);
    }
  }

  async processVoiceCommand(command) {
    console.log(`🎤 Processing voice command: "${command}"`);
    
    // Simple intent parsing
    const intent = this.parseIntent(command);
    
    return await this.routeRequest(intent.bridge, intent.path, {
      method: 'POST',
      body: intent.data
    });
  }

  parseIntent(command) {
    const lower = command.toLowerCase();
    
    if (lower.includes('github') || lower.includes('git')) {
      return { 
        bridge: 'github', 
        path: 'user', 
        data: { action: 'get_user_info' }
      };
    }
    
    if (lower.includes('create') || lower.includes('generate')) {
      return { 
        bridge: 'openai', 
        path: 'chat/completions', 
        data: { 
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: command }]
        }
      };
    }

    if (lower.includes('terminal') || lower.includes('run')) {
      return {
        bridge: 'terminal',
        path: 'exec',
        data: { command: command.replace(/^.*?(terminal|run)\s+/, '') }
      };
    }
    
    // Default: webhook
    return { 
      bridge: 'webhook', 
      path: 'command', 
      data: { command, type: 'voice' }
    };
  }

  // Bridge management methods
  addBridge(name, config) {
    this.bridges.set(name, {
      type: config.type,
      endpoint: config.endpoint,
      active: config.active !== false,
      ...config
    });
    console.log(`✅ Added bridge: ${name}`);
  }

  removeBridge(name) {
    this.bridges.delete(name);
    console.log(`❌ Removed bridge: ${name}`);
  }

  getBridgeStatus() {
    const status = {};
    this.bridges.forEach((bridge, name) => {
      status[name] = {
        type: bridge.type,
        active: bridge.active,
        endpoint: bridge.endpoint
      };
    });
    return status;
  }
}

// Mobile Terminal Bridge Extension
class MobileTerminalBridge extends MultiBridgeConnector {
  constructor(config) {
    super(config);
    this.setupMobileFeatures();
  }

  setupMobileFeatures() {
    // Voice command bridge
    this.addBridge('voice', {
      type: 'voice',
      endpoint: '/voice',
      active: true
    });

    // File system bridge
    this.addBridge('filesystem', {
      type: 'filesystem',
      endpoint: '/files',
      active: true
    });

    console.log('📱 Mobile features enabled');
  }
}

module.exports = { MultiBridgeConnector, MobileTerminalBridge };