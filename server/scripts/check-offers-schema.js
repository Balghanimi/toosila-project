#!/usr/bin/env node
require('dotenv').config();
const { query } = require('../config/db');

async function check() {
  const r = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'offers' ORDER BY ordinal_position");
  console.log('Offers table schema:');
  r.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
