#!/usr/bin/env node
const args = process.argv.slice(2);
if (args.includes('--version') || args.includes('-V') || args.includes('-v')) {
  process.stdout.write('codex-stub 0.0.1 (TEST ONLY)\n');
  process.exit(0);
}
let parts = args.slice();
if (parts[0] === 'exec') parts = parts.slice(1);
parts = parts.filter((a) => a !== '--' && a !== '-q');
const prompt = parts.join(' ').trim() || '(empty)';
process.stdout.write('[codex-stub] OK\nReceived prompt tail:\n' + prompt.slice(Math.max(0, prompt.length - 240)) + '\n');
process.exit(0);
