const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const inputFile = path.join(__dirname, '../dist/worker.js');
const outputFile = path.join(__dirname, '../dist/worker_obfuscated.js');

const sourceCode = fs.readFileSync(inputFile, 'utf8');

const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'mangled', // Uses a, b, c instead of _0x123
    log: false,
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: false, // Critical to avoid malware flags
    stringArray: true,
    stringArrayEncoding: ['base64'], // Encodes strings so "vless" is not visible
    stringArrayThreshold: 1,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
});

fs.writeFileSync(outputFile, obfuscationResult.getObfuscatedCode());
console.log('Worker code obfuscated structurally (AST) successfully!');
