const fs = require('fs');
const text = fs.readFileSync('src/lib/blockModel.ts', 'utf8');

const available = (text.match(/status:\s*["']available["']/g) || []).length;
const offer = (text.match(/status:\s*["']offer["']/g) || []).length;
const reserved = (text.match(/status:\s*["']reserved["']/g) || []).length;
const sold = (text.match(/status:\s*["']sold["']/g) || []).length;

console.log('available:', available);
console.log('offer:', offer);
console.log('reserved:', reserved);
console.log('sold:', sold);
console.log('total:', available + offer + reserved + sold);
