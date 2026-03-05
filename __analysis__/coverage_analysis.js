const fs = require('fs');
const data = JSON.parse(fs.readFileSync('coverage/coverage-final.json', 'utf8'));

console.log('File Coverage Summary (sorted by coverage %):');
console.log('='.repeat(100));

const files = Object.entries(data)
  .filter(([file, metrics]) => {
    return file.endsWith('.js') &&
           metrics.statements &&
           typeof metrics.statements.pct === 'number';
  })
  .sort((a, b) => a[1].statements.pct - b[1].statements.pct);

files.forEach(([file, metrics]) => {
  const s = metrics.statements.pct;
  const b = metrics.branches.pct;
  const f = metrics.functions.pct;
  const totalStmts = metrics.statements.total;
  const coveredStmts = metrics.statements.covered;
  const totalFuncs = metrics.functions.total;
  const coveredFuncs = metrics.functions.covered;
  const fileName = file.split('\\').pop().split('/').pop();

  console.log(
    `${fileName.padEnd(30)} ${s.toFixed(1).padStart(6)}% | ${coveredStmts.toString().padStart(3)}/${totalStmts} stmts | ${coveredFuncs}/${totalFuncs} funcs | B:${b.toFixed(0)}%`
  );
});

console.log('\n' + '='.repeat(100));
console.log('PRIORITY FILES FOR TESTING (0% coverage):');
console.log('='.repeat(100));
files.filter(([_, m]) => m.statements.pct === 0).forEach(([file, _]) => {
  console.log(file.split('\\').pop().split('/').pop());
});
