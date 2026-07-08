const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../dist/worker.js');
const outputFile = path.join(__dirname, '../dist/worker_obfuscated.js');

function customObfuscate(sourceCode) {
    // 1. Separate import statements
    const imports = [];
    let cleanCode = sourceCode.replace(/^import\s+[\s\S]*?from\s+['"].*?['"];?/gm, (match) => {
        imports.push(match);
        return '';
    });

    // 2. Remove the esbuild export statement and get the default object name
    let exportName = 'src_default'; // Default for esbuild
    const exportMatch = cleanCode.match(/export\s*{\s*([\w_]+)\s*as\s+default\s*};?/);
    if (exportMatch) {
        exportName = exportMatch[1];
        cleanCode = cleanCode.replace(exportMatch[0], '');
    } else {
        // Handle export default if not using esbuild format
        const exportDefaultMatch = cleanCode.match(/export\s+default\s+([\w_]+);?/);
        if (exportDefaultMatch) {
            exportName = exportDefaultMatch[1];
            cleanCode = cleanCode.replace(exportDefaultMatch[0], '');
        }
    }

    // Append return statement so the new Function returns the fetch handler
    const mainBody = cleanCode + `\nreturn ${exportName}.fetch;`;

    // 3. XOR Key
    const xorKey = Math.floor(Math.random() * 256);

    // 4. Encode bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(mainBody);

    // 5. XOR encode to Hex
    const obfuscatedBytes = Array.from(bytes).map(b => {
        return (b ^ xorKey).toString(16).padStart(2, '0');
    }).join('');

    // 6. Final output loader
    const outputCode = `${imports.join('\n')}

const _0xPayload = "${obfuscatedBytes}";
const _0xKey = ${xorKey};

const _0xBytes = new Uint8Array((_0xPayload.match(/.{1,2}/g) || []).map(x => parseInt(x, 16) ^ _0xKey));
const _0xCode = new TextDecoder().decode(_0xBytes);
const _fetch = new Function("connect", _0xCode)(connect);

export default {
    async fetch(request, env, ctx) {
        return _fetch(request, env, ctx);
    }
};`;

    return outputCode;
}

const input = fs.readFileSync(inputFile, 'utf8');
const output = customObfuscate(input);
fs.writeFileSync(outputFile, output);
console.log('Worker code obfuscated with Nahan engine successfully!');
