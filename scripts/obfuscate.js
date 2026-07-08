const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
const path = require('path');

const inputFile = path.join(__dirname, '../dist/worker.js');
const outputFile = path.join(__dirname, '../dist/worker_obfuscated.js');

if (!fs.existsSync(inputFile)) {
  console.error('Error: dist/worker.js not found. Run build first.');
  process.exit(1);
}

const sourceCode = fs.readFileSync(inputFile, 'utf8');

console.log('Obfuscating code...');

const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.7,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.5,
  stringArrayEncoding: ['base64', 'rc4'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 1,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 2,
  stringArrayWrappersType: 'variable',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
  module: true // Critical for ES module support (import/export)
});

fs.writeFileSync(outputFile, obfuscationResult.getObfuscatedCode(), 'utf8');
console.log('Obfuscation complete. Saved to dist/worker_obfuscated.js');
