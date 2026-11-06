const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('dist/office.js','utf8').split('function drawPlant')[0];
const env={console,$:()=>({getContext:()=>({})}),matchMedia:()=>({matches:false}),player:{x:720,y:744},target:{},state:{},show(){},openTask(){},setTimeout,clearTimeout};vm.createContext(env);vm.runInContext(source,env);
const result=vm.runInContext(`(() => {const points=[...facilities,...npcs.map(n=>({...n,y:n.y+24}))];return points.map(p=>({name:p.name,reachable:pathTo(p.x,p.y)!==null,length:pathTo(p.x,p.y)?.length}));})()`,env);
for(const r of result)assert(r.reachable,r.name+' must be reachable');
assert(vm.runInContext('!walkable(55,13)',env),'Meeting table blocks movement');
assert(vm.runInContext('!walkable(20,20)',env),'First desk cluster blocks movement');
assert(vm.runInContext('!walkable(20,45)',env),'Complete second desk cluster blocks movement');
assert(vm.runInContext('walkable(30,31)',env),'Spawn must be walkable');
assert(vm.runInContext('objects.every(o=>o.x>=48&&o.y>=120&&o.x+o.w<=W-48&&o.y+o.h<=H-48)',env),'Every furniture footprint stays fully within the finished room');
const pieces=fs.readFileSync('scene-renderer.js','utf8').match(/const mapPieces=([\s\S]*?);/)[1];
const sprites=vm.runInNewContext(pieces);
for(const p of sprites){const [x,y,w,h]=p.dst;assert(x>=48&&y>=120&&x+w<=1920-48&&y+h<=1440-48,p.name+' must be completely inside room');const [sx,sy,sw,sh]=p.src;assert(sx>=0&&sy>=0&&sx+sw<=1729&&sy+sh<=910,p.name+' source must not crop outside asset');}
assert(vm.runInContext('pathTo(0,0)===null',env),'Out-of-map destinations must be rejected');
console.log('PASS: all 5 facilities and 5 teammates reachable; collision, spawn and map bounds verified.');
