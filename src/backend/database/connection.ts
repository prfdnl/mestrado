import { SQL } from "bun";

const HOST     = 'localhost'
const PORT     = 5432
const USER     = 'postgres'
const DATABASE = 'postgres'
const PASSWORD = 'postgres'
const db       = new SQL(`postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`);

export default db