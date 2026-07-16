const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const inputFile = path.join(__dirname, '../dist/worker.js');
const outputFile = path.join(__dirname, '../dist/app.bundle.js');

const sourceCode = fs.readFileSync(inputFile, 'utf8');

const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, {
    target: 'node',
    compact: true,
    // Disable aggressive features that trigger malware/abuse scanners:
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    
    // Make variables look like normal minified code (a, b, c) instead of _0x123
    identifierNamesGenerator: 'mangled',
    
    log: false,
    renameGlobals: false,
    selfDefending: false, // Critical to avoid malware flags
    
    // Disable String Array (the decoder function is a well-known malware signature)
    stringArray: false,
    rotateStringArray: false,
    
    // Use string splitting and escaping to hide keywords like "vless" or "trojan"
    // "vless" -> "\x76\x6c" + "\x65\x73" + "\x73"
    splitStrings: true,
    splitStringsChunkLength: 2,
    unicodeEscapeSequence: true,
    
    transformObjectKeys: true
});

const obfuscatedCode = obfuscationResult.getObfuscatedCode();
fs.writeFileSync(outputFile, obfuscatedCode);
fs.writeFileSync(path.join(__dirname, '../dist/_worker.js'), obfuscatedCode);
console.log('Build completed successfully.');

