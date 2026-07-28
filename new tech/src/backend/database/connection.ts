import { SQL } from "bun";
const HOST = 'localhost'
const PORT = 5432
const USER = 'postgres'
const DATABASE = 'postgres'
const PASSWORD = 'postgres'
export default new SQL(`postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`);
