import 'dotenv/config';
import { mainMenu, cleanup } from './cli/menu.js';

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

console.log('=== API Tester CLI ===\n');
mainMenu();
