/**
 * Generate Postman Collection from Swagger/OpenAPI Specification
 *
 * This script converts the Swagger spec to a Postman Collection v2.1 format
 * Run with: node scripts/generate-postman-collection.js
 */

const fs = require('fs');
const path = require('path');
const swaggerSpec = require('../config/swagger');

// Postman Collection v2.1 structure
const postmanCollection = {
  info: {
    name: 'Toosila API Collection',
    description: swaggerSpec.info.description,
    version: swaggerSpec.info.version,
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  auth: {
    type: 'bearer',
    bearer: [
      {
        key: 'token',
        value: '{{jwt_token}}',
        type: 'string'
      }
    ]
  },
  variable: [
    {
      key: 'base_url',
      value: 'http://localhost:3000/api',
      type: 'string'
    },
    {
      key: 'jwt_token',
      value: '',
      type: 'string'
    },
    {
      key: 'user_email',
      value: 'test@example.com',
      type: 'string'
    },
    {
      key: 'user_password',
      value: 'TestPassword123!',
      type: 'string'
    }
  ],
  item: []
};

// Helper function to convert path parameters
function convertPath(path) {
  return path.replace(/{([^}]+)}/g, ':$1');
}

// Helper function to create request body
function createRequestBody(requestBody) {
  if (!requestBody || !requestBody.content) return {};

  const jsonContent = requestBody.content['application/json'];
  if (!jsonContent || !jsonContent.schema) return {};

  // Extract example from schema
  const schema = jsonContent.schema;
  const example = {};

  if (schema.properties) {
    Object.keys(schema.properties).forEach(key => {
      const prop = schema.properties[key];
      example[key] = prop.example || prop.default || '';
    });
  }

  return {
    mode: 'raw',
    raw: JSON.stringify(example, null, 2),
    options: {
      raw: {
        language: 'json'
      }
    }
  };
}

// Helper function to create headers
function createHeaders(path, method, security) {
  const headers = [
    {
      key: 'Content-Type',
      value: 'application/json'
    }
  ];

  // Add authorization if security is required
  if (security && security.length > 0) {
    headers.push({
      key: 'Authorization',
      value: 'Bearer {{jwt_token}}'
    });
  }

  return headers;
}

// Helper function to group items by tag
function groupByTags(paths) {
  const groups = {};

  Object.keys(paths).forEach(pathKey => {
    const path = paths[pathKey];

    Object.keys(path).forEach(method => {
      if (method === 'parameters') return; // Skip path parameters

      const endpoint = path[method];
      const tags = endpoint.tags || ['Other'];

      tags.forEach(tag => {
        if (!groups[tag]) {
          groups[tag] = {
            name: tag,
            item: []
          };
        }

        const request = {
          name: endpoint.summary || `${method.toUpperCase()} ${pathKey}`,
          request: {
            method: method.toUpperCase(),
            header: createHeaders(pathKey, method, endpoint.security),
            url: {
              raw: `{{base_url}}${convertPath(pathKey)}`,
              host: ['{{base_url}}'],
              path: convertPath(pathKey).split('/').filter(p => p)
            },
            description: endpoint.description || endpoint.summary
          },
          response: []
        };

        // Add request body if present
        if (endpoint.requestBody) {
          request.request.body = createRequestBody(endpoint.requestBody);
        }

        // Add query parameters if present
        if (endpoint.parameters) {
          const queryParams = endpoint.parameters
            .filter(p => p.in === 'query' || (p.$ref && p.$ref.includes('parameters')))
            .map(p => ({
              key: p.name || p.$ref.split('/').pop().replace('Param', '').toLowerCase(),
              value: p.schema?.example || p.schema?.default || '',
              description: p.description
            }));

          if (queryParams.length > 0) {
            request.request.url.query = queryParams;
          }
        }

        groups[tag].item.push(request);
      });
    });
  });

  return Object.values(groups);
}

// Parse Swagger spec and create Postman collection
if (swaggerSpec.paths) {
  postmanCollection.item = groupByTags(swaggerSpec.paths);
}

// Write to file
const outputPath = path.join(__dirname, '../../postman_collection.json');
fs.writeFileSync(outputPath, JSON.stringify(postmanCollection, null, 2));

console.log('\n✅ Postman collection generated successfully!');
console.log(`📁 Location: ${outputPath}`);
console.log('\n📝 Usage Instructions:');
console.log('1. Open Postman');
console.log('2. Click "Import" button');
console.log('3. Select the generated postman_collection.json file');
console.log('4. Configure environment variables:');
console.log('   - base_url: Your API base URL');
console.log('   - jwt_token: Your authentication token (get from login)');
console.log('   - user_email: Your test user email');
console.log('   - user_password: Your test user password');
console.log('\n🎯 Quick Start:');
console.log('1. Run "Authentication > Login" request to get JWT token');
console.log('2. Token will be automatically used in protected endpoints');
console.log('3. Explore and test all API endpoints!');
console.log('\n');

module.exports = postmanCollection;
