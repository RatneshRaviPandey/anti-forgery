const fs = require('fs');
const files = [
  'src/app/api/auth/sessions/route.ts',
  'src/app/api/auth/mfa/route.ts',
  'src/app/api/portal/team/route.ts',
];
const oldPattern = "const token = req.headers.get('authorization')?.replace('Bearer ', '');";
const newPattern = "const token = req.cookies.get('infometa-session')?.value\n    ?? req.headers.get('authorization')?.replace('Bearer ', '');";

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes(oldPattern)) {
    c = c.split(oldPattern).join(newPattern);
    fs.writeFileSync(f, c);
    console.log('Fixed:', f);
  }
}
console.log('Done');
