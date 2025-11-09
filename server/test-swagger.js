/**
 * Test script to verify Swagger configuration
 * Run with: node server/test-swagger.js
 */

const swaggerSpec = require('./config/swagger');

console.log('🔍 Testing Swagger Configuration...\n');

console.log('✅ Swagger spec loaded successfully!');
console.log('📄 API Title:', swaggerSpec.info.title);
console.log('📝 API Version:', swaggerSpec.info.version);
console.log('🏷️  Tags:', swaggerSpec.tags.length);
console.log('📦 Schemas:', Object.keys(swaggerSpec.components.schemas).length);
console.log('🔐 Security Schemes:', Object.keys(swaggerSpec.components.securitySchemes).length);

console.log('\n📋 Available Tags:');
swaggerSpec.tags.forEach(tag => {
  console.log(`   - ${tag.name}: ${tag.description}`);
});

console.log('\n🛠️  Available Schemas:');
Object.keys(swaggerSpec.components.schemas).forEach(schema => {
  console.log(`   - ${schema}`);
});

// Check for documented paths
const pathCount = Object.keys(swaggerSpec.paths || {}).length;
console.log(`\n📍 Documented Endpoints: ${pathCount}`);

if (pathCount === 0) {
  console.log('\n⚠️  WARNING: No endpoints found!');
  console.log('   This usually means the "apis" path in swagger.js is incorrect.');
  console.log('   Current apis path:', swaggerSpec.apis);
  console.log('\n💡 Try running the server and visiting: http://localhost:5001/api-docs');
} else {
  console.log('\n✅ SUCCESS! Swagger is properly configured.');
  console.log('🌐 Visit: http://localhost:5001/api-docs');
}

console.log('\n' + '='.repeat(60));
