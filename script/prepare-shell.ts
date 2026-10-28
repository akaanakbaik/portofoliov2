import {readFile,writeFile} from 'node:fs/promises';
const html=await readFile('client/index.html','utf8');
await writeFile('server/generated-shell.ts',`export const shell = ${JSON.stringify(html)};\n`);
