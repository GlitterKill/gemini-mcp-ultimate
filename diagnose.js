import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const distPath = path.join(__dirname, 'dist', 'index.js');
// console.log("Spawning:", distPath);

const p = spawn('cmd.exe', ['/c', 'npx', '-y', 'gemini-mcp-ultimate'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: false
});

p.stdout.on('data', d => console.log('STDOUT:', d.toString()));
p.stderr.on('data', d => console.log('STDERR:', d.toString()));

p.stdin.write(JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test", version: "1.0" }
  }
}) + "\n");

p.on('error', err => console.error('SPAWN ERROR:', err));

p.on('close', code => console.log('Exited with', code));

// Give it 3 seconds to fail
setTimeout(() => {
  console.log("Timeout reached, server seems stable (or hung). Killing...");
  p.kill();
}, 3000);
