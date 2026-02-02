import { select } from '@inquirer/prompts';
import { makeRequest } from './handlers/request.js';
import { handleStartServer, handleStopServer, cleanup } from './handlers/server.js';

export async function mainMenu() {
  const action = await select({
    message: 'What would you like to do?',
    choices: [
      { name: 'Make API Request', value: 'request' },
      { name: 'Start Local Server', value: 'startServer' },
      { name: 'Stop Local Server', value: 'stopServer' },
      { name: 'Exit', value: 'exit' },
    ],
  });

  switch (action) {
    case 'request':
      await makeRequest();
      break;
    case 'startServer':
      await handleStartServer();
      break;
    case 'stopServer':
      await handleStopServer();
      break;
    case 'exit':
      await cleanup();
      console.log('Goodbye!');
      process.exit(0);
  }

  await mainMenu();
}

export { cleanup };
