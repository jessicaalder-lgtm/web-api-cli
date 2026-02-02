# Architecture & Design

This document covers the application architecture, design decisions, and guidance for extending the codebase.

## Table of Contents

1. [Overview](#overview)
2. [Application Flow](#application-flow)
3. [Module Reference](#module-reference)
4. [Extending the Application](#extending-the-application)
5. [Best Practices](#best-practices)

---

## Overview

This is a **CLI-first API testing tool** designed for rapid prototyping and debugging of external API integrations. The architecture prioritizes:

- **Modularity**: Each concern lives in its own file
- **Discoverability**: Clear naming conventions and predictable locations
- **Extensibility**: Adding new features follows established patterns

### Design Philosophy

```
┌─────────────────────────────────────────────────────────┐
│                        app.js                           │
│                   (bootstrap only)                      │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      cli/menu.js                        │
│              (routing & menu definitions)               │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌───────────┐ ┌───────────────┐
│ handlers/*.js   │ │  api.js   │ │  server.js    │
│ (user actions)  │ │ (http)    │ │ (express)     │
└─────────────────┘ └───────────┘ └───────────────┘
```

---

## Application Flow

### Startup Sequence

```
1. app.js loads
   ├── dotenv/config initializes environment
   ├── SIGINT handler registered for cleanup
   └── mainMenu() called

2. cli/menu.js takes over
   ├── Displays choices via Inquirer
   ├── Routes selection to appropriate handler
   └── Recursively calls itself (menu loop)

3. Handler executes
   ├── May prompt for additional input
   ├── Performs action (API call, server toggle, etc.)
   └── Returns control to menu
```

### Request Flow

```
User selects "Make API Request"
         │
         ▼
┌─────────────────────────┐
│  handlers/request.js    │
│  - Prompt for method    │
│  - Prompt for endpoint  │
│  - Prompt for body      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│        api.js           │
│  - Apply base URL       │
│  - Attach auth header   │
│  - Execute request      │
│  - Handle errors        │
└───────────┬─────────────┘
            │
            ▼
      Response logged
```

---

## Module Reference

### `src/app.js`

**Purpose**: Application entry point

**Responsibilities**:
- Load environment configuration
- Register process signal handlers
- Start the menu loop

**Should NOT contain**: Business logic, prompts, or direct API calls

---

### `src/cli/menu.js`

**Purpose**: Main menu definition and action routing

**Responsibilities**:
- Define available menu choices
- Route user selections to handlers
- Maintain the menu loop

**Exports**:
- `mainMenu()` - Starts/continues the menu loop
- `cleanup()` - Re-exported for signal handlers

---

### `src/cli/handlers/request.js`

**Purpose**: Handle interactive API request flow

**Responsibilities**:
- Prompt for HTTP method, endpoint, body
- Call appropriate api.js method
- Display response or errors

**Exports**:
- `makeRequest()` - Complete request flow

---

### `src/cli/handlers/server.js`

**Purpose**: Manage local Express server lifecycle

**Responsibilities**:
- Track server state (running/stopped)
- Start and stop server on demand
- Cleanup on application exit

**Exports**:
- `handleStartServer()` - Start if not running
- `handleStopServer()` - Stop if running
- `cleanup()` - Stop server if running (for graceful shutdown)
- `isServerRunning()` - Check current state

---

### `src/api.js`

**Purpose**: HTTP client configuration and request templates

**Responsibilities**:
- Configure Axios instance with base URL and timeout
- Attach authorization headers via interceptor
- Provide typed request methods
- Log errors consistently

**Exports**:
- `get(endpoint, params)` - GET request
- `post(endpoint, data)` - POST request
- `put(endpoint, data)` - PUT request
- `patch(endpoint, data)` - PATCH request
- `del(endpoint)` - DELETE request
- `request(config)` - Custom Axios config
- `rawRequest(url, options)` - One-off request without base config
- `api` - Raw Axios instance for advanced use

---

### `src/server.js`

**Purpose**: Express server for receiving callbacks/webhooks

**Responsibilities**:
- Define Express routes
- Provide start/stop control functions
- Can run standalone or be controlled by CLI

**Exports**:
- `startServer()` - Returns promise resolving to server instance
- `stopServer(server)` - Gracefully close server
- `app` - Express app instance for adding routes

---

## Extending the Application

### Adding a New Menu Option

1. **Create the handler** in `src/cli/handlers/`

```javascript
// src/cli/handlers/myfeature.js
import { input } from '@inquirer/prompts';

export async function handleMyFeature() {
  const value = await input({ message: 'Enter value:' });
  console.log(`You entered: ${value}`);
}
```

2. **Register in menu.js**

```javascript
// src/cli/menu.js
import { handleMyFeature } from './handlers/myfeature.js';

// Add to choices array:
{ name: 'My Feature', value: 'myFeature' },

// Add to switch statement:
case 'myFeature':
  await handleMyFeature();
  break;
```

---

### Adding a New API Endpoint Template

For repeated calls to specific endpoints, create dedicated functions in `api.js`:

```javascript
// src/api.js

// Add specific endpoint helpers
export async function getUsers() {
  return get('/users');
}

export async function createUser(userData) {
  return post('/users', userData);
}

export async function getUser(id) {
  return get(`/users/${id}`);
}
```

---

### Adding a Webhook/Callback Endpoint

Add routes to `server.js`:

```javascript
// src/server.js

app.post('/oauth/callback', (req, res) => {
  console.log('OAuth callback received:', req.query);
  // Process callback
  res.json({ success: true });
});

app.post('/stripe/webhook', (req, res) => {
  console.log('Stripe event:', req.body.type);
  // Handle webhook
  res.sendStatus(200);
});
```

---

### Creating a Test Suite Handler

For grouped API tests, create a dedicated handler:

```javascript
// src/cli/handlers/suites/users.js
import { confirm } from '@inquirer/prompts';
import * as api from '../../api.js';

export async function runUserTests() {
  console.log('Running user API tests...\n');

  // Test 1: List users
  console.log('1. GET /users');
  try {
    const users = await api.get('/users');
    console.log(`   ✓ Retrieved ${users.length} users\n`);
  } catch (e) {
    console.log(`   ✗ Failed: ${e.message}\n`);
  }

  // Test 2: Create user
  console.log('2. POST /users');
  try {
    const user = await api.post('/users', { name: 'Test User' });
    console.log(`   ✓ Created user ${user.id}\n`);
  } catch (e) {
    console.log(`   ✗ Failed: ${e.message}\n`);
  }

  console.log('Tests complete.');
}
```

---

## Best Practices

### Where to Put Code

| You want to... | Put it in... |
|----------------|--------------|
| Add a menu option | `cli/menu.js` + new handler in `cli/handlers/` |
| Add an API helper | `api.js` |
| Add a webhook endpoint | `server.js` |
| Add a test suite | `cli/handlers/suites/` (create directory) |
| Add shared utilities | `src/utils/` (create directory) |
| Add external service client | `src/services/` (create directory) |

---

### Handler Guidelines

1. **One handler per feature** - Don't combine unrelated functionality
2. **Handlers own their prompts** - Keep Inquirer calls in handlers, not menu.js
3. **Handlers are async** - Always return promises for consistency
4. **Log results in handlers** - The handler knows what success looks like

---

### Growing the Test Bed

When this tool grows beyond simple ad-hoc requests:

#### Phase 1: Organized Handlers
```
cli/handlers/
├── request.js          # Generic requests
├── server.js           # Server management
└── auth.js             # Auth-specific flows (login, refresh, etc.)
```

#### Phase 2: Test Suites
```
cli/handlers/
├── request.js
├── server.js
└── suites/
    ├── index.js        # Suite selector menu
    ├── users.js        # User API tests
    ├── products.js     # Product API tests
    └── orders.js       # Order API tests
```

#### Phase 3: Multiple APIs
```
src/
├── api/
│   ├── client.js       # Base Axios factory
│   ├── braintrust.js   # Braintrust API client
│   ├── stripe.js       # Stripe API client
│   └── internal.js     # Internal API client
├── cli/
│   └── handlers/
│       └── suites/
│           ├── braintrust/
│           ├── stripe/
│           └── internal/
└── services/           # Shared business logic
```

---

### State Management

Currently, server state lives in `cli/handlers/server.js`. If you need more shared state:

```javascript
// src/state.js
export const state = {
  server: null,
  lastResponse: null,
  authToken: null,
  // etc.
};
```

Import where needed. Avoid passing state through function parameters when it represents application-wide concerns.

---

### Environment Configuration

Keep secrets in `.env`, but consider a config module for computed values:

```javascript
// src/config.js
import 'dotenv/config';

export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL,
    key: process.env.API_KEY,
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
  isDev: process.env.NODE_ENV !== 'production',
};
```

---

### Error Handling Strategy

- **API errors**: Caught and logged in `api.js` interceptor, re-thrown for handlers
- **Handler errors**: Caught in handler, logged with context, return to menu
- **Fatal errors**: Let them crash - better than silent failures

```javascript
// Pattern for handlers
export async function myHandler() {
  try {
    const result = await api.get('/endpoint');
    console.log('Success:', result);
  } catch (error) {
    console.error('Operation failed:', error.message);
    // Don't re-throw - return to menu gracefully
  }
}
```

---

## File Creation Checklist

When adding a new file, ensure:

- [ ] File has a single, clear responsibility
- [ ] Exports are documented or self-evident
- [ ] Imports use relative paths consistently
- [ ] File is registered in appropriate parent (menu.js, index.js, etc.)
- [ ] Any new directories follow established patterns
