#!/usr/bin/env node

/**
 * Health Monitor Script
 * Periodically checks the health status of the API server
 * Usage: node scripts/health-monitor.js [--interval=30] [--url=http://localhost:3000]
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Parse command line arguments
const args = process.argv.slice(2);
let interval = 30; // seconds
let baseUrl = 'http://localhost:3000';
let logFile = null;

args.forEach(arg => {
  if (arg.startsWith('--interval=')) {
    interval = parseInt(arg.split('=')[1]) || 30;
  } else if (arg.startsWith('--url=')) {
    baseUrl = arg.split('=')[1];
  } else if (arg.startsWith('--log=')) {
    logFile = arg.split('=')[1];
  }
});

const healthUrl = `${baseUrl}/api/health`;
const fs = require('fs');

// Logging function
function log(message, level = 'INFO') {
  const timestamp = new Date().toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
  if (logFile) {
    fs.appendFileSync(logFile, logMessage + '\n');
  }
}

// Health check function
function checkHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL(healthUrl);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            success: response.success,
            status: response.status,
            services: response.services,
            timestamp: response.timestamp
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Monitor function
async function monitor() {
  try {
    const health = await checkHealth();
    
    if (health.success && health.status === 'healthy') {
      log(`✅ Service is healthy (${health.statusCode})`);
      
      // Log service details
      if (health.services) {
        const firebase = health.services.firebase?.status || 'unknown';
        const env = health.services.environment?.status || 'unknown';
        log(`   Firebase: ${firebase}, Environment: ${env}`);
      }
    } else {
      log(`⚠️  Service is unhealthy (${health.statusCode}): ${health.status}`, 'WARN');
      
      // Log service issues
      if (health.services) {
        if (health.services.firebase?.error) {
          log(`   Firebase Error: ${health.services.firebase.error}`, 'ERROR');
        }
        if (health.services.environment?.status !== 'configured') {
          log(`   Environment Issues: ${health.services.environment?.status}`, 'ERROR');
        }
      }
    }
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'ERROR');
  }
}

// Start monitoring
log(`🔍 Starting health monitor for ${healthUrl}`);
log(`📊 Check interval: ${interval} seconds`);
if (logFile) {
  log(`📝 Logging to: ${logFile}`);
}

// Initial check
monitor();

// Set up periodic checks
const intervalId = setInterval(monitor, interval * 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  log('🛑 Stopping health monitor...');
  clearInterval(intervalId);
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 Stopping health monitor...');
  clearInterval(intervalId);
  process.exit(0);
});