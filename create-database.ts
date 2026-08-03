import { postgres, elasticsearch } from './src/backend/database/connection';
import { resolve } from 'path';

// settings
const schema_name = 'public';
const schema_file_path = resolve('default.sql');

// drop schema if exists
await postgres.unsafe(`DROP SCHEMA IF EXISTS ${schema_name} CASCADE;`);

// create schema
await postgres.unsafe(`CREATE SCHEMA ${schema_name};`);

// load schema from file
const schema_sql = await Bun.file(schema_file_path).text();
await postgres.unsafe(schema_sql);

// limpar elasticsearch
const existingIndices = await elasticsearch.cat.indices({ format: 'json' });
for (const item of existingIndices) {
	if (item.index) {
		await elasticsearch.indices.delete({ index: item.index }, { ignore: [404] });
	}
}

// ler tudo que existe no postgres e indexar no elasticsearch
const tables = await postgres.unsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${schema_name}';`)

console.log(`Indexando ${tables.length} tabelas no Elasticsearch...`);

// loop through each table and index its data
for (const table of tables) {
  const tableName = table.table_name
  const data = await postgres.unsafe(`SELECT * FROM ${schema_name}.${tableName};`);
  for (const doc of data) {
    await elasticsearch.index({ index: tableName, id: doc.id, document: doc });
  }
}