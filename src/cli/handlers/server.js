import { startServer, stopServer } from '../../server.js';

let server = null;

export async function handleStartServer() {
  if (server) {
    console.log('Server is already running');
    return;
  }
  server = await startServer();
}

export async function handleStopServer() {
  if (!server) {
    console.log('Server is not running');
    return;
  }
  await stopServer(server);
  server = null;
}

export async function cleanup() {
  if (server) {
    await stopServer(server);
  }
}

export function isServerRunning() {
  return server !== null;
}
