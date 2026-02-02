import { input, select } from '@inquirer/prompts';
import * as api from '../../api.js';

export async function makeRequest() {
  const method = await select({
    message: 'HTTP Method:',
    choices: [
      { name: 'GET', value: 'get' },
      { name: 'POST', value: 'post' },
      { name: 'PUT', value: 'put' },
      { name: 'PATCH', value: 'patch' },
      { name: 'DELETE', value: 'delete' },
    ],
  });

  const endpoint = await input({
    message: 'Endpoint (e.g., /users):',
  });

  let body = null;
  if (['post', 'put', 'patch'].includes(method)) {
    const bodyInput = await input({
      message: 'Request body (JSON):',
      default: '{}',
    });
    try {
      body = JSON.parse(bodyInput);
    } catch {
      console.error('Invalid JSON, using empty object');
      body = {};
    }
  }

  console.log(`\nMaking ${method.toUpperCase()} request to ${endpoint}...\n`);

  try {
    let result;
    switch (method) {
      case 'get':
        result = await api.get(endpoint);
        break;
      case 'post':
        result = await api.post(endpoint, body);
        break;
      case 'put':
        result = await api.put(endpoint, body);
        break;
      case 'patch':
        result = await api.patch(endpoint, body);
        break;
      case 'delete':
        result = await api.del(endpoint);
        break;
    }
    console.log('Response:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Request failed:', error.message);
  }

  console.log('');
}
