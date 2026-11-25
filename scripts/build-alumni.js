const fs = require('fs');
const vm = require('vm');

function loadDataFile(path) {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(/export\s+default\s+[^;]+;?/g, '');
  code = code.replace(/const\s+(data\w*)\s*=/g, 'global.$1 =');
  const sandbox = {};
  sandbox.global = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return (
    sandbox.data ||
    sandbox.data16 ||
    sandbox.data17 ||
    sandbox.data18 ||
    sandbox.data19 ||
    sandbox.data20 ||
    sandbox.data21 ||
    sandbox.data22 ||
    sandbox.data23 ||
    sandbox.data24 ||
    []
  );
}

const allAlumni = {};

// 2026: Board & Senior team from cached_sheets.json
const sheets = JSON.parse(fs.readFileSync('lib/cached_sheets.json', 'utf8'));
const b26 = [...(sheets.Board || []), ...(sheets['Senior team'] || [])].map((m, i) => ({
  id: i + 1,
  name: m.name,
  img: m['link to image'] || '',
  pos: m.position || '',
  linkedin: m.linkedin || '',
  github: m.github || '',
  domain: m.domain || '',
  description: m.description || '',
  year: '2026',
}));
allAlumni['2026'] = b26;

// 2025: Local alumni records
try {
  const d25 = loadDataFile('lib/alumni-data/data25.js');
  allAlumni['2025'] = d25.map((m, i) => ({
    id: m.id || i + 1,
    name: m.name,
    img: m.img ? '/' + m.img.replace(/^\//, '') : '',
    pos: m.pos || '',
    linkedin: m.linkedin || '',
    year: '2025',
  }));
} catch (e) {
  console.error('2025 err:', e);
}

// 2024 to 2016
for (let y = 24; y >= 16; y--) {
  const yr = '20' + y;
  const items = loadDataFile('lib/alumni-data/data' + y + '.js');
  allAlumni[yr] = items.map((m, i) => ({
    id: m.id || i + 1,
    name: m.name,
    img: m.img ? '/' + m.img.replace(/^\//, '') : '',
    pos: m.pos || m.div || '',
    linkedin: m.linkedin || '',
    year: yr,
  }));
}

fs.writeFileSync('lib/alumni.json', JSON.stringify(allAlumni, null, 2));
console.log('Saved all alumni to lib/alumni.json:');
for (const k of Object.keys(allAlumni)) {
  console.log(k + ':', allAlumni[k].length, 'members');
}
