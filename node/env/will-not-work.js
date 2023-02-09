// Will not work for subdirectories
// https://github.com/motdotla/dotenv/issues/89#issuecomment-974511109
// Imports are already imported first then dotenv is called. 
// Which means its too late for any subdirectory to receive
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename);
console.log(__dirname);

console.log(path.join(__dirname, "./env.some"));

dotenv.config({ path: path.join(__dirname, "./env.some") });

import "./helpers/helping.js";

const { SECRET } = process.env;
console.log(SECRET);
