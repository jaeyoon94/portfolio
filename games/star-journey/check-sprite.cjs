// Full-body walk check: every drawn frame is one complete, unsliced sprite cell; the walk cycle alternates
// stride A, standing pose, stride B, standing pose; idle/seated/reduced-motion paths are unchanged; facing is stable.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const WalkingAtlas=require('./dist/walk-atlas.js');
const characterImage={tag:'idle',width:1536,height:1024},walkingImage={tag:'walk',width:887,height:1774};
let draws=[];const ctx=new Proxy({drawImage:(...args)=>draws.push(args)},{get:(o,k)=>k in o?o[k]:()=>{}});
const office=fs.readFileSync('dist/office.js','utf8');
const env={ctx,reducedMotion:false,spritesLoaded:true,walkingLoaded:true,characterImage,walkingImage,WalkingAtlas};vm.createContext(env);
vm.runInContext(office.slice(office.indexOf('const WALK_CYCLE='),office.indexOf('function nameplate(')),env);
const faces=['down','up','left','right'],close=(a,b,msg)=>assert(Math.abs(a-b)<.02,msg+` (${a} vs ${b})`);

// 1. Atlas metadata: 8 rows x 6 characters, each a whole grid cell drawn with one uniform scale.
assert.equal(WalkingAtlas.frames.length,8);assert.equal(WalkingAtlas.width,walkingImage.width);assert.equal(WalkingAtlas.height,walkingImage.height);
for(let row=0;row<8;row++)for(let c=0;c<6;c++){const{src,dst}=WalkingAtlas.frames[row][c];
 // Cells tile the sheet exactly (no gaps, no overlap, no partial crops of a body).
 const left=c?WalkingAtlas.frames[row][c-1].src:null,up=row?WalkingAtlas.frames[row-1][c].src:null;
 assert.equal(src[0],left?left[0]+left[2]:0,`row ${row} char ${c} x gap`);assert.equal(src[1],up?up[1]+up[3]:0,`row ${row} char ${c} y gap`);
 assert(Math.abs(src[2]-887/6)<1&&Math.abs(src[3]-1774/8)<1,`row ${row} char ${c} must be a whole cell`);
 if(c===5)assert.equal(src[0]+src[2],887);if(row===7)assert.equal(src[1]+src[3],1774);
 close(dst[2]/src[2],dst[3]/src[3],`row ${row} char ${c} non-uniform scale`);
 if(row%2){const a=WalkingAtlas.frames[row-1][c].dst;close(a[2]/WalkingAtlas.frames[row-1][c].src[2],dst[2]/src[2],`row ${row} char ${c} poses change size`)}
 const h=dst[3]*.85;assert(h>100&&h<140,`row ${row} char ${c} implausible height ${h}`);}

// 2. Walk cycle over two full cycles for every character and direction.
const idleCell=(c,row)=>[c*256,row*256,256,256,-64,-124,128,128];
for(let c=0;c<6;c++)for(const[row,face]of faces.entries()){const seen=[];
 for(let beat=0;beat<8;beat++)for(const within of[.05,.5,.95]){draws=[];env.sprite(200,200,c,face,true,(beat+within)*Math.PI/2,false);
  assert.equal(draws.length,1,'exactly one drawImage per character (no slicing or overlays)');const[img,...rest]=draws[0];
  if(beat%2){assert.equal(img,characterImage,'passing beat uses the full idle pose');assert.deepEqual(rest,idleCell(c,row))}
  else{const pose=beat%4?1:0,f=WalkingAtlas.frames[row*2+pose][c];assert.equal(img,walkingImage);assert.deepEqual(rest,[...f.src,...f.dst]);}
  if(within===.5)seen.push(img===characterImage?'idle':rest[1]===WalkingAtlas.frames[row*2][c].src[1]?'A':'B')}
 assert.deepEqual(seen,['A','idle','B','idle','A','idle','B','idle'],`${face} cycle for char ${c}`)}

// 3. Non-walking paths: standing, seated, reduced motion and a not-yet-loaded walk atlas all draw the idle cell.
for(const[row,face]of faces.entries()){draws=[];env.sprite(0,0,2,face,false,1,false);assert.deepEqual(draws[0].slice(1),idleCell(2,row));}
draws=[];env.sprite(0,0,0,'up',true,0,true);assert.equal(draws.length,1);assert.equal(draws[0][0],characterImage);assert.deepEqual(draws[0].slice(1),[0,256,256,256*.84,-64,-124,128,128*.84]);
env.walkingLoaded=false;draws=[];env.sprite(0,0,1,'left',true,0,false);assert.deepEqual(draws[0].slice(1),idleCell(1,2));env.walkingLoaded=true;
vm.runInContext('reducedMotion=true',env);draws=[];env.sprite(0,0,1,'left',true,0,false);assert.equal(draws[0][0],characterImage);vm.runInContext('reducedMotion=false',env);

// 4. Facing follows travel; diagonals keep a matching facing instead of flickering.
assert.equal(env.faceFor(3,0,'up'),'right');assert.equal(env.faceFor(0,-3,'left'),'up');assert.equal(env.faceFor(2,2,'right'),'right');assert.equal(env.faceFor(2,2,'down'),'down');assert.equal(env.faceFor(2,2,'up'),'down');assert.equal(env.faceFor(-2,-2,'down'),'up');

// 5. Player: the cycle restarts with a stride on a fresh start and continues through turns and very short pauses.
assert(/if\(moving\)\{if\(t-lastPlayerStep>140\)walkPhase=0;else walkPhase\+=dt\*13;lastPlayerStep=t;/.test(office),'player walk restart logic missing');

// 6. NPCs (real office-life.js): each walk starts with stride A and no facing is held for under 150 ms while walking.
const roster=Array.from({length:5},(_,i)=>({id:'actor-'+i,x:101+i*53,y:103,face:'up',seated:true}));let seed=7;const math=Object.create(Math);math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const life={objects:[],Math:math,CompanyUI:{activeNPCs:()=>roster},document:{hidden:false,querySelector:()=>null},state:{},view:'office',T:24,COLS:30,W:720,H:720,walkable:(x,y)=>x>0&&y>0&&x<29&&y<29&&!(x===15&&y<20),canvas:{style:{},addEventListener(){},setPointerCapture(){}},window:{addEventListener(){}},camera:{x:360,y:360,width:300,playHeight:300,scale:1},decorateMode:false,performance:{now:()=>0},ctx:{}};
vm.createContext(life);vm.runInContext(fs.readFileSync('dist/office-life.js','utf8'),life);
const prev=new Map();let starts=0,flicks=0,turns=0,beats=new Set();
for(let i=0;i<7200;i++){const t=i*1000/60;life.CompanyUI.tick(1/60,t);for(const a of life.CompanyUI.activeNPCs()){const p=prev.get(a.id)||{moving:false};
 if(a.moving&&!p.moving){p.since=t;if(!(p.lastMove>t-150)){starts++;assert.equal(env.walkPose(a.phase),0,'NPC walk must begin with a stride')}}
 if(a.moving){beats.add(env.walkPose(a.phase));p.lastMove=t;if(p.moving&&a.face!==p.face){turns++;if(t-p.since<150)flicks++;p.since=t}}
 p.face=a.face;p.moving=a.moving;prev.set(a.id,p)}}
assert(starts>5,'NPCs should start walking several times');assert.deepEqual([...beats].sort(),[-1,0,1],'NPCs use the whole cycle');assert.equal(flicks,0,'NPC facing flickers');
console.log(`PASS: 48 complete walk cells with uniform scale; 576 cycle samples (A → stand → B → stand) across 6 characters × 4 directions, one unsliced drawImage each; idle, seated, reduced-motion and loading fallbacks; diagonal facing; ${starts} NPC walk starts begin with a stride and no facing flicker.`);
