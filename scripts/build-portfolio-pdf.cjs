#!/usr/bin/env node
// pdf/portfolio.html을 A4 가로 PDF로 만든다.
// 사용: node scripts/build-portfolio-pdf.cjs [출력 경로]
// Pretendard 글꼴이 pdf/fonts에 없으면 npm 레지스트리에서 받아 둔다(저장소에는 넣지 않음).
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'pdf', 'portfolio.html');
const out = path.resolve(process.argv[2] || path.join(root, '[포트폴리오] PM 박재윤_포트폴리오.pdf'));
const fontDir = path.join(root, 'pdf', 'fonts');
const weights = ['Regular', 'Medium', 'SemiBold', 'Bold'];

function ensureFonts() {
  if (weights.every((w) => fs.existsSync(path.join(fontDir, `Pretendard-${w}.otf`)))) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pretendard-'));
  execFileSync('npm', ['pack', 'pretendard@1.3.9', '--silent'], { cwd: tmp, stdio: 'ignore' });
  execFileSync('tar', ['xzf', 'pretendard-1.3.9.tgz'], { cwd: tmp });
  fs.mkdirSync(fontDir, { recursive: true });
  for (const w of weights) {
    fs.copyFileSync(path.join(tmp, 'package/dist/public/static', `Pretendard-${w}.otf`), path.join(fontDir, `Pretendard-${w}.otf`));
  }
}

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.otf': 'font/otf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

// 캔버스로 이미지를 줄이려면 같은 출처여야 해서 file:// 대신 로컬 서버로 연다.
function serve() {
  const server = http.createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

(async () => {
  ensureFonts();
  const server = await serve();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/${path.relative(root, src).split(path.sep).join('/')}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // 원본 이미지를 그대로 넣으면 PDF가 10MB를 넘는다. 인쇄 크기의 약 2.5배(약 240dpi)로 줄여 JPEG로 바꾼다.
  await page.evaluate(async () => {
    const imgs = [...document.images].filter((img) => !/\.svg($|\?)/.test(img.src));
    for (const img of imgs) {
      await img.decode().catch(() => {});
      const box = img.getBoundingClientRect();
      const scale = Math.min(1, 2.5 * Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight));
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      img.src = canvas.toDataURL('image/jpeg', 0.86);
      await img.decode().catch(() => {});
    }
  });
  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
  await browser.close();
  server.close();
  console.log(`saved ${out}`);
})();
