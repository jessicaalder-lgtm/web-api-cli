import express from 'express';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhook listener example
app.post('/webhook', (req, res) => {
  console.log('Webhook received:', JSON.stringify(req.body, null, 2));
  res.json({ received: true });
});

export function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      resolve(server);
    });
  });
}

export function stopServer(server) {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('Server stopped');
      resolve();
    });
  });
}

// Run directly if executed as main
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app };
