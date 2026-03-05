const fs = require('fs');

const lcov = fs.readFileSync('coverage/lcov.info', 'utf8');
const lines = lcov.split('\n');

const files = {};
let currentFile = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith('SF:')) {
    currentFile = line.substring(3);
    files[currentFile] = { lf: 0, lh: 0 };
  } else if (line.startsWith('LF:')) {
    files[currentFile].lf = parseInt(line.substring(3));
  } else if (line.startsWith('LH:')) {
    files[currentFile].lh = parseInt(line.substring(3));
  }
}

console.log('File Coverage Summary:');
console.log('='.repeat(80));

const sorted = Object.entries(files)
  .map(([file, data]) => ({
    file: file.split('\\').pop().split('/').pop(),
    pct: (data.lh / data.lf) * 100,
    lh: data.lh,
    lf: data.lf
  }))
  .sort((a, b) => a.pct - b.pct);

sorted.forEach(({ file, pct, lh, lf }) => {
  console.log(`${file.padEnd(35)} ${pct.toFixed(1).padStart(6)}% (${lh}/${lf} lines)`);
});

console.log('\n' + '='.repeat(80));
console.log('ZERO COVERAGE FILES:');
console.log('='.repeat(80));
sorted.filter(f => f.pct === 0).forEach(f => console.log(f.file));

console.log('\n' + '='.repeat(80));
console.log('HIGH COVERAGE FILES (>= 50%):');
console.log('='.repeat(80));
sorted.filter(f => f.pct >= 50).forEach(f => console.log(`${f.file}: ${f.pct.toFixed(1)}%`));
