#!/usr/bin/env node

const { MobileTerminalBridge } = require('./multi-bridge');
const fs = require('fs');
const path = require('path');

// ASCII Art Banner
console.log(`
🌉 ╔═══════════════════════════════════════════════════════╗
   ║            OFFSTAR Multi-Bridge Connector             ║
   ║         Universal Enterprise AGI Hub Gateway         ║
   ╚═══════════════════════════════════════════════════════╝
`);

// Load configuration
let config = {};
try {
  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('📋 Configuration loaded from config.json');
  } else {
    console.log('📝 No config.json found, using defaults');
    console.log('💡 Copy config.example.json to config.json and add your API keys');
  }
} catch (error) {
  console.log('⚠️  Config load error, using defaults:', error.message);
}

// Initialize the multi-bridge connector
const bridge = new MobileTerminalBridge({
  port: process.env.PORT || config.port || 3000,
  bridgePort: process.env.BRIDGE_PORT || config.bridgePort || 3001,
  ...config
});

console.log('\\n🚀 OFFSTAR Multi-Bridge Connector Started');
console.log('📱 Mobile terminal ready');
console.log('🔗 Bridge API available at http://localhost:' + (config.bridgePort || 3001));
console.log('🎯 Health check: http://localhost:' + (config.bridgePort || 3001) + '/health');
console.log('');
console.log('⚡ Quick Commands:');
console.log('   • curl http://localhost:3001/bridges         # List bridges');
console.log('   • curl http://localhost:3001/health          # Health check');
console.log('   • node mobile-bridge.js voice "hello"       # Voice command');
console.log('   • npm test                                   # Quick health test');
console.log('');

// Handle voice commands if provided
if (process.argv[2] === 'voice') {
  const command = process.argv.slice(3).join(' ');
  if (command) {
    setTimeout(async () => {
      try {
        console.log(`🎤 Processing voice command: "${command}"`);
        const result = await bridge.processVoiceCommand(command);
        console.log('✅ Voice command result:', JSON.stringify(result, null, 2));
        process.exit(0);
      } catch (error) {
        console.error('❌ Voice command failed:', error.message);
        process.exit(1);
      }
    }, 2000); // Wait for server to start
  } else {
    console.log('❌ Please provide a voice command');
    console.log('Usage: node mobile-bridge.js voice "your command here"');
    console.log('');
    console.log('Examples:');
    console.log('  node mobile-bridge.js voice "connect to github"');
    console.log('  node mobile-bridge.js voice "create new app"');
    console.log('  node mobile-bridge.js voice "run terminal ls"');
    process.exit(1);
  }
}

// Display startup tips
setTimeout(() => {
  console.log('💡 Tips:');
  console.log('   • Add API keys to config.json for full functionality');
  console.log('   • Use voice commands for natural language control');
  console.log('   • Connect MCP servers for extended capabilities');
  console.log('   • Bridge any API through the universal endpoint');
  console.log('');
}, 3000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down Multi-Bridge Connector...');
  console.log('👋 Thanks for using OFFSTAR Multi-Bridge!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\n🛑 Received SIGTERM, shutting down...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});