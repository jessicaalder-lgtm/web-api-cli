# Braintrust API Tester

A CLI tool for testing and prototyping API calls. Built with Node.js, Express, Axios, and Inquirer.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API settings

# Run the CLI
npm start
```

## Project Structure

```
src/
├── app.js                      # Entry point
├── api.js                      # Axios HTTP client & request templates
├── server.js                   # Express server for webhooks/callbacks
└── cli/
    ├── menu.js                 # Main menu definition & routing
    └── handlers/
        ├── request.js          # Interactive API request handler
        └── server.js           # Local server management
```

## Configuration

Create a `.env` file from the example:

| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | Base URL for API requests | - |
| `API_KEY` | Bearer token for Authorization header | - |
| `PORT` | Local server port | `3000` |

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Launch interactive CLI |
| `npm run server` | Start Express server standalone |

## Features

### Interactive API Requests
Make GET, POST, PUT, PATCH, DELETE requests through a guided menu. Requests use the configured base URL and automatically attach authorization headers.

### Local Server
Start/stop an Express server from the CLI for:
- Receiving webhooks during testing
- Simulating callback endpoints
- Health checks at `/health`

## Documentation

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed design documentation and guidance on extending the codebase.

## License

MIT
