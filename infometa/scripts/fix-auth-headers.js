const fs = require('fs');
const path = require('path');

function fixDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) { fixDir(fullPath); continue; }
    if (!entry.name.endsWith('.tsx')) continue;

    let content = fs.readFileSync(fullPath, 'utf8');
    if (!content.includes('Bearer ${token}')) continue;

    const original = content;

    // Pattern 1: headers: { Authorization: `Bearer ${token}` }  →  credentials: 'include'
    content = content.replace(
      /headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}/g,
      "credentials: 'include'"
    );

    // Pattern 2: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    //          → { 'Content-Type': 'application/json' }   + add credentials
    content = content.replace(
      /Authorization:\s*`Bearer \$\{token\}`,?\s*/g,
      ''
    );

    // Pattern 3: const headers = { };  → remove
    content = content.replace(/const headers = \{\s*\};?\n?/g, '');
    
    // Pattern 4: headers: {  } → credentials: 'include'  
    content = content.replace(/headers:\s*\{\s*\}/g, "credentials: 'include'");

    // Pattern 5: { headers, ... → { credentials: 'include', ...
    content = content.replace(
      /,?\s*headers\s*([,}])/g,
      (match, after) => after === '}' ? ` }` : `, credentials: 'include'${after}`
    );

    // Add credentials: 'include' to fetch calls that lost their auth but have other headers
    // e.g., fetch(url, { headers: { 'Content-Type': ... } }) → add credentials
    content = content.replace(
      /fetch\(([^)]+),\s*\{([^}]*headers:\s*\{[^}]*\}[^}]*)\}/g,
      (match, url, opts) => {
        if (opts.includes("credentials")) return match;
        return `fetch(${url}, { credentials: 'include', ${opts.trim()} }`;
      }
    );

    if (content !== original) {
      fs.writeFileSync(fullPath, content);
      console.log('Fixed:', path.relative(process.cwd(), fullPath));
    }
  }
}

fixDir('src/app/admin');
fixDir('src/app/portal');

// Also fix the useApi hook
const hookPath = 'src/hooks/use-api.ts';
if (fs.existsSync(hookPath)) {
  let h = fs.readFileSync(hookPath, 'utf8');
  if (h.includes('Bearer') || h.includes('localStorage')) {
    h = h.replace(/const token = localStorage\.getItem\(['"]infometa-token['"]\);?\n?/g, '');
    h = h.replace(/headers:\s*\{[^}]*Authorization[^}]*\}/g, "credentials: 'include' as RequestCredentials");
    h = h.replace(/if\s*\(!token\)[^;]*;?\n?/g, '');
    fs.writeFileSync(hookPath, h);
    console.log('Fixed:', hookPath);
  }
}

console.log('Done');
