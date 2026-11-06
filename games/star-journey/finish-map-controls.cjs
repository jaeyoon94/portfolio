const fs=require('fs');const p='dist/office.js';let s=fs.readFileSync(p,'utf8');
s=s.replace("camera.zoom=Math.max(.75,", "camera.zoom=Math.max(.5,");
s=s.replace("$('#recenter').onclick=()=>{camera.zoom=camera.width<760?1.25:1.5;resize();camera.x=player.x;camera.y=player.y}", "$('#recenter').onclick=()=>{camera.zoom=1;resize();camera.x=player.x;camera.y=player.y};$('#overview').onclick=()=>{camera.zoom=.6;resize();camera.x=W/2;camera.y=H/2}");
s=s.replace('if(d.y<H-24)drawPlant(d)','if(d.y<H-24&&walkable(Math.floor(d.x/T),Math.floor(d.y/T)))drawPlant(d)');
fs.writeFileSync(p,s);
let h=fs.readFileSync('dist/index.html','utf8');if(!h.includes('id="overview"'))h=h.replace('<button id="recenter"','<button id="overview" aria-label="전체 사무실 보기">▦</button><button id="recenter"');fs.writeFileSync('dist/index.html',h);
