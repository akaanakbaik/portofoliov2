import {readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
export async function writeLanguageStats(){
 const counts:Record<string,number>={};
 const names:Record<string,string>={'.ts':'TypeScript','.tsx':'TSX','.js':'JavaScript','.jsx':'JavaScript','.css':'CSS','.json':'JSON','.html':'HTML'};
 const colors:Record<string,string>={TypeScript:'#3178c6',TSX:'#61dafb',JavaScript:'#f7df1e',CSS:'#2965f1',JSON:'#cbcb41',HTML:'#e34c26'};
 async function walk(dir:string){for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.name.startsWith('generated-'))continue;const full=path.join(dir,entry.name);if(entry.isDirectory()){await walk(full);continue;}const language=names[path.extname(entry.name)];if(language)counts[language]=(counts[language]||0)+(await readFile(full,'utf8')).split('\n').length;}}
 for(const dir of ['client/src','server','shared'])await walk(dir);
 const total=Object.values(counts).reduce((a,b)=>a+b,0);const stats=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([language,lines])=>({language,lines,percentage:Math.round(lines/total*100),color:colors[language]}));
 await writeFile('server/generated-languages.ts',`export const languageStats = ${JSON.stringify(stats)};\n`);
}
