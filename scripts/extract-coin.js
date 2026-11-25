const fs = require('fs');
const content = fs.readFileSync('indexnew.html', 'utf8');
const searchStr = '<div class="face f"><img src="';
const idx = content.indexOf(searchStr);
if (idx !== -1) {
  const start = idx + searchStr.length;
  const end = content.indexOf('"', start);
  const dataUrl = content.substring(start, end);
  const parts = dataUrl.split(',');
  const mime = parts[0].split(':')[1].split(';')[0];
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpeg';
  fs.writeFileSync('public/coin-emblem.' + ext, Buffer.from(parts[1], 'base64'));
  console.log('Saved public/coin-emblem.' + ext + ' (' + Math.round(parts[1].length / 1024) + ' KB)');
} else {
  console.log('Search string not found');
}
