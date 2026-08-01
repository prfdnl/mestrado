import { SQL } from "bun";
const HOST = 'postgres'
const PORT = 5432
const USER = 'postgres'
const DATABASE = 'postgres'
const PASSWORD = 'postgres'
const postgres = new SQL(`postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`);

import { Client, HttpConnection } from "@elastic/elasticsearch"
const ELASTICSEARCH_HOST = 'http://localhost:9200'
const elasticsearch = new Client({ Connection: HttpConnection, node: ELASTICSEARCH_HOST })

export { postgres, elasticsearch }
