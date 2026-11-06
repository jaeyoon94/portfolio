const fs=require('fs');
let layout=fs.readFileSync('scene-layout.js','utf8');
for(const[a,b]of [
 ['x:190,y:354','x:234,y:430,seated:true'],['x:474,y:178','x:582,y:232,seated:true'],['x:770,y:354','x:930,y:430,seated:true'],['x:978,y:292','x:1212,y:366,seated:true'],['x:1230,y:292','x:1512,y:366,seated:true'],
 ['x:600,y:576','x:720,y:744'],['x:1116,y:516','x:1392,y:708'],['x:852,y:396','x:1056,y:480'],['x:1308,y:696','x:1608,y:1128'],['x:336,y:648','x:1224,y:864']])layout=layout.replace(a,b);
fs.writeFileSync('scene-layout.js',layout);
let office=fs.readFileSync('dist/office.js','utf8').replace('W=1440,H=768','W=1920,H=1440').replace('camera={x:720,y:384','camera={x:960,y:720');
fs.writeFileSync('dist/office.js',office);
let builder=fs.readFileSync('rewrite-art.cjs','utf8').replace(".replace('player.x=708;player.y=516','player.x=612;player.y=576')", ".replace(/player.x=\\d+;player.y=\\d+/, 'player.x=720;player.y=744')");
fs.writeFileSync('rewrite-art.cjs',builder);
let app=fs.readFileSync('dist/app.js','utf8').replace('player={x:612,y:576}','player={x:720,y:744}');fs.writeFileSync('dist/app.js',app);
