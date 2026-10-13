import {mkdir,copyFile,readdir} from 'node:fs/promises';
import path from 'node:path';
await mkdir('public/vendor',{recursive:true});await mkdir('public/fonts',{recursive:true});
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','public/vendor/pdf.worker.min.mjs');
for(const dir of ['cmaps','standard_fonts','wasm']){async function copy(source,target){await mkdir(target,{recursive:true});for(const file of await readdir(source,{withFileTypes:true})){const a=path.join(source,file.name),b=path.join(target,file.name);if(file.isDirectory())await copy(a,b);else await copyFile(a,b);}}await copy(`node_modules/pdfjs-dist/${dir}`,`public/vendor/${dir}`);}
for(const family of ['noto-sans','noto-sans-devanagari']){const files=await readdir(`node_modules/@fontsource/${family}/files`);for(const file of files.filter(v=>v.endsWith('-400-normal.woff')||v.endsWith('-400-normal.woff2')))await copyFile(`node_modules/@fontsource/${family}/files/${file}`,`public/fonts/${file}`);}
