
const { spawn } = require('child_process');

console.log('Testing spawn logic...');

// Simulate exactly what we told Claude to run:
// cmd /c npx -y gemini-mcp-ultimate

const command = 'cmd';
const args = ['/c', 'npx', '-y', 'gemini-mcp-ultimate'];

console.log(`Spawning: ${command} ${args.join(' ')}`);

const child = spawn(command, args, {
  stdio: ['pipe', 'pipe', 'pipe'] // This matches how MCP clients connect
});

child.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data}`);
});

child.stderr.on('data', (data) => {
  console.log(`STDERR: ${data}`);
});

child.on('error', (err) => {
  console.error(`ERROR: ${err.message}`);
});

child.on('close', (code) => {
  console.log(`EXIT: ${code}`);
});

// Write initialization message to stdin (simulating MCP client)
const initMsg = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test", version: "1.0" }
  }
};

setTimeout(() => {
    console.log('Sending init message...');
    child.stdin.write(JSON.stringify(initMsg) + '\n');
}, 1000);

setTimeout(() => {
    console.log('Test complete, killing process.');
    child.kill();
}, 5000);
