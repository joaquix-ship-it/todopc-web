import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';

const salida = '../cotizador';
const pin = process.env.PIN_COTIZADOR ?? '4834';
const hashPin = createHash('sha256').update(`todopc:${pin}`).digest('hex');

mkdirSync(salida, { recursive: true });
const js = await build({ entryPoints: ['src/main.ts'], bundle: true, minify: true, format: 'iife', target: 'es2020', write: false });
const codigo = js.outputFiles[0].text.replace('__HASH_PIN__', hashPin);
writeFileSync(`${salida}/app.js`, codigo);
execFileSync('npx', ['tailwindcss', '-i', 'src/estilos.css', '-o', `${salida}/app.css`, '--minify'], { stdio: 'ignore' });

const version = createHash('sha256').update(codigo + readFileSync(`${salida}/app.css`)).digest('hex').slice(0, 10);
writeFileSync(`${salida}/index.html`, readFileSync('index.html', 'utf8').replaceAll('__VERSION__', version));
console.log(`cotizador ${version}`);
