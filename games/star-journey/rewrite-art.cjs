const fs=require('fs');const p='dist/office.js';let old=fs.readFileSync(p,'utf8');
const marker=old.includes('// Collision uses')?'// Collision uses':'// Furniture footprints';
const prefix=old.slice(0,old.indexOf(marker)).replace('H=960','H=768').replace('camera={x:720,y:480','camera={x:720,y:384');
const helpers=old.slice(old.indexOf('function walkable'),old.indexOf('function drawPlant')).replace('gx>=2&&gx<58&&gy>=5&&gy<37','gx>=1&&gx<COLS-1&&gy>=4&&gy<ROWS-1');
const events=old.slice(old.indexOf("canvas.addEventListener('click'")).replace(/player.x=\d+;player.y=\d+/, 'player.x=720;player.y=744').replaceAll('n.y-25-p.y','n.y-55-p.y').replace(')<35)',')<50)');
fs.writeFileSync(p,prefix+fs.readFileSync('scene-layout.js','utf8')+'\n'+helpers+fs.readFileSync('scene-renderer.js','utf8')+'\n'+events);
let app=fs.readFileSync('dist/app.js','utf8').replace('player={x:708,y:516}','player={x:612,y:576}');fs.writeFileSync('dist/app.js',app);
