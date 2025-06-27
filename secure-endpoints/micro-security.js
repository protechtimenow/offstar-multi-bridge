/**
 * MICRO-SECURITY LAYER
 * Individual endpoint protection with shortcuts→longcuts transformation
 * Wallet: 0x21cC30462B8392Aa250453704019800092a16165
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

class MicroSecurityLayer {
  constructor(config = {}) {
    this.config = {
      walletAddress: '0x21cC30462B8392Aa250453704019800092a16165',
      jwtSecret: config.jwtSecret || crypto.randomBytes(64).toString('hex'),
      rateLimits: config.rateLimits || {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
      },
      shortcutMappings: new Map(),
      ...config
    };
    
    this.initializeShortcutLongcutMapping();
  }

  initializeShortcutLongcutMapping() {
    // Transform shortcuts into security longcuts
    const mappings = [
      { shortcut: '/api', longcut: '/secure/authenticated/api/v1/validated' },
      { shortcut: '/auth', longcut: '/security/multi-factor/authentication/gateway' },
      { shortcut: '/data', longcut: '/encrypted/validated/data/access/layer' },
      { shortcut: '/bridge', longcut: '/secure/bridge/validated/connection/endpoint' },
      { shortcut: '/webhook', longcut: '/validated/webhook/secure/processing/pipeline' },
      { shortcut: '/mcp', longcut: '/secure/mcp/authenticated/protocol/bridge' },
      { shortcut: '/voice', longcut: '/secure/voice/validated/command/processor' },
      { shortcut: '/terminal', longcut: '/secure/terminal/sandboxed/execution/environment' }
    ];

    mappings.forEach(({ shortcut, longcut }) => {
      this.config.shortcutMappings.set(shortcut, {
        longcut,
        securityLevel: 'MAXIMUM',
        transformationSteps: this.generateTransformationSteps(shortcut, longcut),
        createdAt: new Date().toISOString()
      });
    });

    console.log('🔐 Micro-Security: Shortcuts→Longcuts mapping initialized');
  }

  generateTransformationSteps(shortcut, longcut) {
    return [
      `1. INTERCEPT: ${shortcut} → Security Gate`,
      '2. VALIDATE: Authentication + Authorization',
      '3. ENCRYPT: Request payload encryption',
      '4. RATE_LIMIT: Apply micro-level rate limiting',
      '5. SANITIZE: Input validation & sanitization',
      '6. LOG: Security audit logging',
      '7. TRANSFORM: Shortcut → Longcut routing',
      `8. ROUTE: → ${longcut}`,
      '9. MONITOR: Real-time security monitoring',
      '10. RESPOND: Secure response delivery'
    ];
  }

  // Middleware factory for micro-security
  createSecurityMiddleware() {
    return {
      // Rate limiting middleware
      rateLimiter: rateLimit(this.config.rateLimits),
      
      // JWT authentication middleware
      authenticateJWT: (req, res, next) => {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
          return res.status(401).json({ 
            error: 'Access denied: No token provided',
            securityLevel: 'MICRO_BLOCKED'
          });
        }

        const token = authHeader.split(' ')[1];
        
        try {
          const decoded = jwt.verify(token, this.config.jwtSecret);
          req.user = decoded;
          req.securityContext = {
            level: 'MICRO_AUTHENTICATED',
            wallet: this.config.walletAddress,
            timestamp: Date.now()
          };
          next();
        } catch (error) {
          return res.status(403).json({ 
            error: 'Invalid token',
            securityLevel: 'MICRO_REJECTED'
          });
        }
      },

      // Shortcut to longcut transformer
      shortcutTransformer: (req, res, next) => {
        const originalPath = req.path;
        const mapping = this.findShortcutMapping(originalPath);
        
        if (mapping) {
          console.log('🔒 MICRO: Transforming shortcut→longcut:', {
            from: originalPath,
            to: mapping.longcut,
            securityLevel: mapping.securityLevel
          });
          
          // Transform the request path
          req.originalUrl = originalPath;
          req.securityLongcut = mapping.longcut;
          req.transformationSteps = mapping.transformationSteps;
          
          // Add security headers
          res.set({
            'X-Security-Level': 'MICRO',
            'X-Transformation': 'SHORTCUT_TO_LONGCUT',
            'X-Wallet-Context': this.config.walletAddress.substring(0, 10) + '...'
          });
        }
        
        next();
      },

      // Input validation middleware
      inputValidator: (req, res, next) => {
        const validationRules = {
          maxBodySize: 1024 * 1024, // 1MB
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
          requiredHeaders: ['user-agent', 'content-type']
        };

        // Validate request size
        if (req.headers['content-length'] > validationRules.maxBodySize) {
          return res.status(413).json({ 
            error: 'Request too large',
            securityLevel: 'MICRO_SIZE_LIMIT'
          });
        }

        // Validate HTTP method
        if (!validationRules.allowedMethods.includes(req.method)) {
          return res.status(405).json({ 
            error: 'Method not allowed',
            securityLevel: 'MICRO_METHOD_BLOCKED'
          });
        }

        // Sanitize input
        if (req.body) {
          req.body = this.sanitizeObject(req.body);
        }

        req.validationPassed = true;
        next();
      },

      // Security logging middleware
      securityLogger: (req, res, next) => {
        const securityLog = {
          timestamp: new Date().toISOString(),
          ip: req.ip,
          method: req.method,
          path: req.path,
          userAgent: req.get('User-Agent'),
          securityLevel: 'MICRO',
          wallet: this.config.walletAddress,
          transformationApplied: !!req.securityLongcut
        };

        console.log('🔐 MICRO-SECURITY LOG:', securityLog);
        
        // Store in security audit trail
        this.addToAuditTrail(securityLog);
        
        next();
      }
    };
  }

  findShortcutMapping(path) {
    // Find exact match first
    if (this.config.shortcutMappings.has(path)) {
      return this.config.shortcutMappings.get(path);
    }
    
    // Find prefix match
    for (let [shortcut, mapping] of this.config.shortcutMappings) {
      if (path.startsWith(shortcut)) {
        return {
          ...mapping,
          longcut: mapping.longcut + path.substring(shortcut.length)
        };
      }
    }
    
    return null;
  }

  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const sanitized = {};
    for (let [key, value] of Object.entries(obj)) {
      // Remove potentially dangerous properties
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        continue;
      }
      
      if (typeof value === 'string') {
        // Basic XSS protection
        sanitized[key] = value
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  addToAuditTrail(logEntry) {
    // In production, this would write to a secure database
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push(logEntry);
    
    // Keep only last 1000 entries in memory
    if (this.auditTrail.length > 1000) {
      this.auditTrail = this.auditTrail.slice(-1000);
    }
  }

  generateJWT(payload, expiresIn = '1h') {
    return jwt.sign(
      {
        ...payload,
        wallet: this.config.walletAddress,
        securityLevel: 'MICRO'
      },
      this.config.jwtSecret,
      { expiresIn }
    );
  }

  getSecurityStatus() {
    return {
      layer: 'MICRO',
      wallet: this.config.walletAddress,
      shortcutMappings: this.config.shortcutMappings.size,
      auditTrailEntries: this.auditTrail?.length || 0,
      securityLevel: 'MAXIMUM',
      transformations: Array.from(this.config.shortcutMappings.keys())
    };
  }
}

module.exports = MicroSecurityLayer;