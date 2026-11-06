/* A hand-drawn tile office. All art is original, rendered from small pixel shapes. */
const canvas=$('#office'),ctx=canvas.getContext('2d'),mini=$('#mini'),mc=mini.getContext('2d');
const W=3360,H=1920,T=24,COLS=W/T,ROWS=H/T,blocked=new Set(),objects=[];
const camera={x:960,y:720,scale:1,zoom:1},keys=new Set();
let selected=null,placement=null,nearby=null,last=0,walkPhase=0,lastPlayerStep=-1e9,emotionUntil=0,decorateMode=false,toastTimer,frameCount=0;
const mobileRendering=matchMedia('(max-width:760px), (any-pointer:coarse), (max-height:520px) and (orientation:landscape)');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200)}
function block(x,y,w,h){for(let gy=Math.floor(y/T);gy<Math.ceil((y+h)/T);gy++)for(let gx=Math.floor(x/T);gx<Math.ceil((x+w)/T);gx++)blocked.add(gy*COLS+gx)}
function add(kind,x,y,w,h,extra={}){const o={kind,x,y,w,h,...extra};objects.push(o);if(extra.solid!==false)block(x,y,w,h);return o}
function r(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function line(x,y,w,c){r(x,y,w,2,c)}
function label(t,x,y,size=12,color='#465469'){ctx.font=`500 ${size}px "Noto Sans KR", sans-serif`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(t,Math.round(x),Math.round(y))}
// Furniture footprints follow the reference image. Artwork is rendered separately.
block(0,0,W,120);block(0,H-48,W,48);block(0,0,48,H);block(W-48,0,48,H);
for(const offset of [0,660]){
 add('deskCluster',288,240+offset,600,408);
 add('chair',528,144+offset,96,96);
 add('chair',192,312+offset,96,216);
 add('chair',888,312+offset,96,216);
 add('chair',528,648+offset,96,60);
}
add('meetingTable',1260,216,216,360);
for(const x of [1176,1476])for(const y of [312,456])add('stool',x,y,72,72);
add('coffee',1104,912,432,192);
add('demoBoard',1104,744,336,72);
add('plant',120,672,48,48);
add('plant',1728,216,48,48);
add('plant',1728,1176,48,48);
const npcs=[
 {name:'지민',role:'기획',team:'기획팀',x:234,y:430,seated:true,skin:1,face:'down',status:'업무 중',say:'“처음 30초 안에 편지를 배달하는 재미를 느끼게 해보면 어떨까요?”'},
 {name:'도윤',role:'프로그래밍',team:'개발팀',x:582,y:232,seated:true,skin:5,face:'down',status:'집중 업무',say:'“프로토타입에선 빠르게 검증하고, 공개 전에는 꼭 안정성을 챙겨요.”'},
 {name:'하린',role:'아트',team:'아트팀',x:930,y:430,seated:true,skin:3,face:'down',status:'업무 중',say:'“별빛을 조금 줄였더니 우체통이 더 잘 보여요. 예쁜 것과 잘 보이는 건 함께 가야죠.”'},
 {name:'수현',role:'QA',team:'QA팀',x:1212,y:366,seated:true,skin:2,face:'down',status:'간이회의 중',meeting:true,say:'“저장을 누른 뒤 바로 나갈 때만 편지가 사라져요. 재현 조건을 찾았어요!”'},
 {name:'유진',role:'사업·마케팅',team:'사업팀',x:1512,y:366,seated:true,skin:4,face:'down',status:'간이회의 중',meeting:true,say:'“우리 게임을 좋아할 사람에게, 실제로 할 수 있는 경험을 약속하자고요.”'}
];
const facilities=[
 {id:'desk',name:'내 작업 공간',x:720,y:744,action:()=>openTask('work'),kind:'work'},
 {id:'meeting',name:'회의 테이블 · 우선순위 정하기',x:1392,y:708,action:()=>openTask('manage'),kind:'manage'},
 {id:'qa',name:'테스트 자리 · 빌드 검토',x:720,y:1380,action:()=>openTask('collab'),kind:'collab'},
 {id:'lounge',name:'커피 코너 · 잠깐 쉬어가기',x:1608,y:1128,action:()=>$('#rest').click(),kind:'rest'},
 {id:'demo',name:'별빛 우체부 · 데모 확인',x:1224,y:864,action:()=>show('별빛 우체부 · 현재 빌드',`현재 완성도 ${state.quality}%, 안정성 ${state.stability}%. ${state.quality<50?'핵심 업무로 첫 플레이를 개선해 보세요.':'별 사이를 여행하는 작은 우체부의 모험이 완성되어 가요.'}`),kind:'demo'}
];


function walkable(gx,gy){return gx>=1&&gx<COLS-1&&gy>=4&&gy<ROWS-1&&!blocked.has(gy*COLS+gx)}
function pathTo(x,y){if(x<24||y<96||x>=W-24||y>=H-24)return null;const sx=Math.floor(player.x/T),sy=Math.floor(player.y/T);let ex=Math.floor(x/T),ey=Math.floor(y/T);if(!walkable(ex,ey)){let best=null;for(let rad=1;rad<5&&!best;rad++)for(let yy=ey-rad;yy<=ey+rad;yy++)for(let xx=ex-rad;xx<=ex+rad;xx++)if(walkable(xx,yy)&&(!best||Math.hypot(xx*T+12-x,yy*T+12-y)<best.d))best={x:xx,y:yy,d:Math.hypot(xx*T+12-x,yy*T+12-y)};if(!best)return null;ex=best.x;ey=best.y}const start=sy*COLS+sx,end=ey*COLS+ex,queue=[start],prev=new Map([[start,-1]]);for(let i=0;i<queue.length;i++){const n=queue[i];if(n===end)break;const cx=n%COLS,cy=Math.floor(n/COLS);for(let [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy,k=ny*COLS+nx;if(walkable(nx,ny)&&!prev.has(k)){prev.set(k,n);queue.push(k)}}}if(!prev.has(end))return null;const p=[];for(let n=end;n!==start;n=prev.get(n))p.unshift({x:n%COLS*T+12,y:Math.floor(n/COLS)*T+12});return p}
function selectTarget(o){selected=o;$('#taskPanel').hidden=true;canvas.focus({preventScroll:true});toast(o.name+' 위치를 표시했어요. 키보드로 다가가 Space를 누르세요.')}
function visit(id){if(!state)return;goOffice();const f=facilities.find(f=>f.id===id);if(f)selectTarget(f)}
function selectNPC(name){if(!state)return;goOffice();const n=npcs.find(n=>n.name===name);if(n)selectTarget(n)}
function goOffice(){if(view!=='office')document.querySelector('[data-view="office"]').click()}
function npcTalk(n){show(n.name+' · '+n.role,n.say,[{label:'함께 빌드 검토하기',effect:'1구간 · 팀 신뢰 +8 · 완성도 +3 · 피로 +4',run:()=>advance(1,{trust:8,quality:3,fatigue:4,xp:3},n.name+'와 빌드를 검토하며 개선점을 함께 찾았다.')},{label:'가볍게 인사하기',effect:'시간 소모 없음',run:()=>{emotionUntil=performance.now()+2600;toast(n.name+'도 반갑게 인사를 건네요.')}}])}
function near(){let best=null,d=78;for(const o of [...(window.CompanyUI?CompanyUI.activeNPCs():npcs),...(window.CompanyUI?CompanyUI.activeFacilities():facilities)]){const dist=Math.hypot(o.x-player.x,o.y-player.y);if(dist<d){d=dist;best=o}}return best}
function interact(){if(!state||view!=='office')return;if(decorateMode){placeDecoration();return}const n=near();if(n){keys.clear();if(n.action)n.action();else if(n.role)npcTalk(n)}else toast('키보드로 동료나 업무 표식 가까이 다가가 Space를 누르세요.')}
function placeDecoration(){if(!placement){toast('빈 바닥을 클릭해 배치 위치를 고른 뒤 Space를 누르세요.');return}const{x,y}=placement;if(!walkable(x/T,y/T)){toast('가구가 없는 바닥을 골라 주세요.');return}if(state.money<50){toast('화분을 놓으려면 50만이 필요해요.');return}if((state.decorations||[]).some(d=>d.x===x&&d.y===y)){toast('이미 화분이 있는 자리예요.');return}if((state.decorations||[]).length>=20){toast('화분은 최대 20개까지 놓을 수 있어요.');return}state.money-=50;(state.decorations??=[]).push({x,y});state.logs.unshift(`${time()} · 사무실에 화분을 놓았다. 운영 자금 −50만.`);render();decorateMode=false;placement=null;$('#decorate').classList.remove('selected');toast('사무실에 작은 초록이 더해졌어요.')}
function drawPlant(o){const{x,y}=o;ctx.fillStyle='#58654825';ctx.beginPath();ctx.ellipse(x+12,y+19,20,8,0,0,Math.PI*2);ctx.fill();r(x+3,y+3,19,22,'#594935');r(x+1,y-1,23,7,'#95775a');r(x+11,y-36,4,38,'#4c6b39');for(const[a,b,c]of [[-13,-21,'#3d7544'],[3,-29,'#608d44'],[-12,-38,'#517f3b'],[7,-45,'#6f9b4b']]){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x+a+13,y+b,13,7,a<0?.5:-.5,0,Math.PI*2);ctx.fill();r(x+a+8,y+b-2,9,2,'#9eb86c')}}
function outline(t,x,y,size=18,color='#fff'){ctx.font=`800 ${size}px "Noto Sans KR",sans-serif`;ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.lineJoin='round';ctx.strokeStyle='#39302b';ctx.lineWidth=4;ctx.strokeText(t,Math.round(x),Math.round(y));ctx.fillStyle=color;ctx.fillText(t,Math.round(x),Math.round(y))}
function speech(x,y){ctx.fillStyle='#3a3834';ctx.beginPath();ctx.roundRect(x-30,y-26,60,32,12);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(x-28,y-24,56,28,10);ctx.fill();ctx.beginPath();ctx.moveTo(x-7,y+3);ctx.lineTo(x,y+14);ctx.lineTo(x+6,y+3);ctx.fill();for(const dx of[-15,0,15]){ctx.fillStyle='#433e3a';ctx.beginPath();ctx.arc(x+dx,y-10,3,0,Math.PI*2);ctx.fill()}}
const officeImage=new Image(),characterImage=new Image(),walkingImage=new Image();
const worldCanvas=document.createElement('canvas');worldCanvas.width=W;worldCanvas.height=H;const worldCtx=worldCanvas.getContext('2d');
worldCtx.fillStyle='#e7d2c1';worldCtx.fillRect(0,0,W,H);
let artLoaded=false,spritesLoaded=false,walkingLoaded=false;
// Use complete furniture sprites rather than stretching the cropped screenshot.
const mapPieces=[
 {name:'개발팀 책상 전체',src:[177,148,787,545],dst:[190,160,787,545]},
 {name:'두 번째 책상 전체',src:[177,148,787,545],dst:[190,820,787,545]},
 {name:'회의 테이블과 의자 전체',src:[1076,178,500,427],dst:[1110,210,500,427]},
 {name:'커피 캐비닛 전체',src:[1076,708,430,184],dst:[1104,912,430,184]}
];
function buildMap(){const g=worldCtx,p=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};p(0,0,W,H,'#e8d4c3');
 const tile=document.createElement('canvas');tile.width=72;tile.height=72;tile.getContext('2d').drawImage(officeImage,980,620,72,72,0,0,72,72);g.fillStyle=g.createPattern(tile,'repeat');g.fillRect(48,100,W-96,H-148);
 const wall=document.createElement('canvas');wall.width=200;wall.height=100;wall.getContext('2d').drawImage(officeImage,500,0,200,100,0,0,200,100);g.fillStyle=g.createPattern(wall,'repeat');g.fillRect(0,0,W,116);p(0,108,W,12,'#d2c2b1');p(0,0,40,H,'#e9e3d9');p(40,116,8,H-116,'#cfc0ac');p(W-40,0,40,H,'#e9e3d9');p(W-48,116,8,H-116,'#cfc0ac');p(0,H-48,W,48,'#dfd6c9');p(48,H-56,W-96,8,'#bfb19c');
 for(const piece of mapPieces)g.drawImage(officeImage,...piece.src,...piece.dst);
 // Complete freestanding plants with a full canopy, trunk and planter.
 for(const [x,y]of [[144,696],[1752,240],[1752,1200]]){g.fillStyle='#4c4c3520';g.beginPath();g.ellipse(x,y+16,42,12,0,0,Math.PI*2);g.fill();p(x-7,y-65,14,65,'#78604a');p(x-20,y-3,40,30,'#8c7358');p(x-24,y-9,48,10,'#b29a78');g.drawImage(officeImage,14,744,184,125,x-61,y-137,122,83)}
 // Build display and entrance occupy their own complete floor areas.
 p(1110,756,336,59,'#7b7a6c');p(1113,710,330,90,'#b1ae9a');p(1120,715,316,78,'#e9ecde');p(1127,724,302,60,'#4c6370');g.textAlign='center';g.fillStyle='#e5dfb9';g.font='600 19px "Noto Sans KR",sans-serif';g.fillText('✦ 별빛 우체부 · 테스트 빌드',1278,762);p(1140,815,8,22,'#827b68');p(1414,815,8,22,'#827b68');
 p(1610,1310,210,54,'#b5ab96');p(1620,1318,190,38,'#7a8175');g.fillStyle='#f0eddb';g.font='500 17px "Noto Sans KR",sans-serif';g.fillText('윤&쮸 컴퍼니 · 출입구',1715,1344);
 artLoaded=true;drawMini()}
officeImage.onload=buildMap;officeImage.onerror=()=>toast('사무실 그림을 불러오지 못했어요. 새로고침해 주세요.');officeImage.src='assets/office-reference-v3.png';
characterImage.onload=()=>spritesLoaded=true;characterImage.onerror=()=>toast('캐릭터 그림을 불러오지 못했어요. 새로고침해 주세요.');characterImage.src='assets/starjourney-characters-v4.png';
walkingImage.onload=()=>walkingLoaded=true;walkingImage.onerror=()=>toast('걷기 이미지를 불러오지 못했어요. 새로고침해 주세요.');walkingImage.src='assets/starjourney-walk-v1.png';
// Four-beat walk from complete full-body frames only: stride A, standing (passing) pose, stride B, standing. -1 = idle sprite.
const WALK_CYCLE=[0,-1,1,-1];
// Face the way the body actually travels; on an exact diagonal keep the current facing if it is one of the two axes.
function faceFor(dx,dy,current){const h=dx>0?'right':'left',v=dy>0?'down':'up';if(Math.abs(Math.abs(dx)-Math.abs(dy))<1e-6&&dx&&dy)return current===h||current===v?current:v;return Math.abs(dx)>Math.abs(dy)?h:v}function walkPose(phase){return WALK_CYCLE[Math.floor(Math.max(0,phase)/(Math.PI/2))%WALK_CYCLE.length]}
function sprite(x,y,index=0,face='down',moving=false,phase=0,seated=false){
 const active=moving&&!seated&&!reducedMotion;ctx.fillStyle='#384a3526';ctx.beginPath();ctx.ellipse(x,y+2,21,6,0,0,Math.PI*2);ctx.fill();if(!spritesLoaded)return;
 const row={down:0,up:1,left:2,right:3}[face]||0;ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(y));
 const pose=active&&walkingLoaded?walkPose(phase):-1;if(pose>=0){const f=WalkingAtlas.frames[row*2+pose][index];ctx.drawImage(walkingImage,...f.src,...f.dst)}else{const cw=characterImage.width/6,ch=characterImage.height/4,fraction=seated?.84:1;ctx.drawImage(characterImage,index*cw,row*ch,cw,ch*fraction,-64,-124,128,128*fraction)}ctx.restore();}
function nameplate(text,x,y,me=false){ctx.save();ctx.font=(me?'700':'600')+' 14px "Noto Sans KR"';const w=ctx.measureText(text).width+20;ctx.fillStyle=me?'#385c4feF':'#fffef5ed';ctx.strokeStyle=me?'#d7ebcc':'#c3d2bc';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x-w/2,y-20,w,27,8);ctx.fill();ctx.stroke();ctx.textAlign='center';ctx.fillStyle=me?'#f4ffe9':'#476048';ctx.fillText(text,x,y-2);ctx.restore()}
function resize(){const b=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,mobileRendering.matches?1.5:2);canvas.width=Math.round(b.width*dpr);canvas.height=Math.round(b.height*dpr);ctx.imageSmoothingEnabled=false;camera.width=b.width;camera.height=b.height;camera.playHeight=Math.max(160,b.height-(mobileRendering.matches?(b.height<420?150:210):100));camera.dpr=dpr;camera.scale=camera.wheelScale||(camera.zoom<.7?Math.min(b.width/W,camera.playHeight/H)*camera.zoom/.6:(mobileRendering.matches&&b.height<420?.72:b.width<760?1:.9)*camera.zoom);document.body.classList.toggle('overview',camera.wheelScale?camera.scale<.5:camera.zoom<.7);$('#zoomLabel').textContent=camera.wheelScale?Math.round(camera.wheelScale/(mobileRendering.matches&&b.height<420?.72:b.width<760?1:.9)*100)+'%':camera.zoom<.7?'전체':Math.round(camera.zoom*100)+'%'}new ResizeObserver(resize).observe(canvas.parentElement);resize();
function worldPoint(e){const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left-camera.width/2)/camera.scale+camera.x,y:(e.clientY-b.top-camera.playHeight/2)/camera.scale+camera.y}}
function drawMarker(f){const distance=Math.hypot(f.x-player.x,f.y-player.y);if(distance>90&&selected?.id!==f.id)return;ctx.strokeStyle=selected===f?'#d5a138':'#ffffffb0';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(f.x,f.y+3,24,10,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
function drawMini(){mc.fillStyle='#e7d2c1';mc.fillRect(0,0,180,120);mc.drawImage(worldCanvas,0,0,180,120);for(const n of (window.CompanyUI?CompanyUI.activeNPCs():npcs)){mc.fillStyle='#635467';mc.fillRect(n.x/W*180-1,n.y/H*120-1,3,3)}mc.fillStyle='#f4d03f';mc.strokeStyle='#60452f';mc.fillRect(player.x/W*180-3,player.y/H*120-3,6,6);mc.strokeRect(player.x/W*180-3,player.y/H*120-3,6,6);if(selected){mc.strokeStyle='#d6a437';mc.strokeRect(selected.x/W*180-4,selected.y/H*120-4,8,8)}}
function updateHUD(){if(!state)return;nearby=near();const prompt=$('#interaction');prompt.hidden=!nearby||!!document.querySelector('dialog[open]')||view!=='office';if(nearby)$('#interaction span').textContent=nearby.role?nearby.name+'에게 말 걸기':nearby.name;const low=(player.y-camera.y)*camera.scale+camera.playHeight/2>camera.playHeight-130;prompt.style.top=low?(camera.width<760?'175px':'110px'):'';prompt.style.bottom=low?'auto':'';$('#roomName').textContent=player.x>1080?(player.y<710?'간이 회의 공간':player.y<900?'빌드 테스트 공간':'커피 코너'):player.y<760?'개발팀 업무 공간':'제작 스튜디오';$('#questFill').style.width=state.quality+'%';$('#questHint').textContent=state.done?'첫 데모 공개 완료!':`완성도 ${state.quality}% · ${stages[stage()]} 진행 중`;$('#questTitle').textContent=state.done?'우리의 첫 게임을 세상에!':'첫 공개 데모를 완성하자';if(window.CompanyUI)CompanyUI.updateHUD()}
function frame(t){if(document.hidden||(mobileRendering.matches&&last&&t-last<32)){if(document.hidden)last=t;requestAnimationFrame(frame);return}const dt=Math.min((t-last)/1000||.016,.045);last=t;let moving=false;if(state&&!document.querySelector('dialog[open]')&&view==='office'){let dx=(keys.has('arrowright')?1:0)-(keys.has('arrowleft')?1:0),dy=(keys.has('arrowdown')?1:0)-(keys.has('arrowup')?1:0);if(dx||dy){const dist=Math.hypot(dx,dy);dx=dx/dist*165*dt;dy=dy/dist*165*dt;const before={...player};if(walkable(Math.floor((player.x+dx)/T),Math.floor(player.y/T)))player.x+=dx;if(walkable(Math.floor(player.x/T),Math.floor((player.y+dy)/T)))player.y+=dy;moving=before.x!==player.x||before.y!==player.y;player.face=faceFor(moving?player.x-before.x:dx,moving?player.y-before.y:dy,player.face)}}if(moving){if(t-lastPlayerStep>140)walkPhase=0;else walkPhase+=dt*13;lastPlayerStep=t;camera.manual=false}if(window.CompanyUI?.tick)CompanyUI.tick(dt,t);
const overview=camera.zoom<.7,vw=camera.width/camera.scale,vh=camera.playHeight/camera.scale,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));const tx=overview||vw>=W?W/2:clamp(player.x,vw/2,W-vw/2),ty=overview||vh>=H?H/2:clamp(player.y-70,vh/2,H-vh/2);if(!camera.manual){camera.x+=(tx-camera.x)*Math.min(1,dt*7);camera.y+=(ty-camera.y)*Math.min(1,dt*7);}
ctx.setTransform(camera.dpr,0,0,camera.dpr,0,0);r(0,0,camera.width,camera.height,'#e7d2c1');ctx.save();ctx.beginPath();ctx.rect(0,0,camera.width,camera.playHeight);ctx.clip();ctx.translate(camera.width/2,camera.playHeight/2);ctx.scale(camera.scale,camera.scale);ctx.translate(-camera.x,-camera.y);ctx.imageSmoothingEnabled=true;ctx.drawImage(worldCanvas,0,0);ctx.imageSmoothingEnabled=false;
for(const d of (window.CompanyUI?CompanyUI.decorations():state?.decorations||[]))if(d.y<H-24&&walkable(Math.floor(d.x/T),Math.floor(d.y/T)))drawPlant(d);
for(const f of (window.CompanyUI?CompanyUI.activeFacilities():facilities))drawMarker(f);
if(selected){ctx.strokeStyle='#d3a539';ctx.lineWidth=3;ctx.strokeRect(selected.x-29,selected.y-12,58,24)}
if(placement){ctx.strokeStyle='#d3a539';ctx.lineWidth=2;ctx.strokeRect(placement.x,placement.y,T,T);ctx.globalAlpha=.6;drawPlant(placement);ctx.globalAlpha=1}
const chars=[...(window.CompanyUI?CompanyUI.activeNPCs():npcs),{...player,me:true}].sort((a,b)=>a.y-b.y);for(const n of chars){if(!n.me&&(Math.abs(n.x-camera.x)>vw/2+150||Math.abs(n.y-camera.y)>vh/2+190))continue;sprite(n.x,n.y,n.me?0:n.skin,n.me?player.face||'down':n.face,n.me?moving:n.moving,n.me?walkPhase:n.phase||0,n.seated);if(n.seated&&window.CompanyUI)CompanyUI.drawSeatFront(n);const team=n.me?({'기획':'기획팀','프로그래밍':'개발팀','아트':'아트팀','QA':'QA팀','사업·마케팅':'사업팀'}[state?.role]||'개발팀'):n.team;const name=n.me?state?.name||'나':n.name;if(n.me){nameplate('나 · '+name,n.x,n.y-133,true)}else if(!n.isPlaceholder||nearby?.id===n.id||selected?.id===n.id){nameplate(n.memberId?'이쮸 · 본부장':n.isPlaceholder?n.team:name,n.x,n.y+30);}if(window.CompanyUI?.drawSpeech)CompanyUI.drawSpeech(n,t);if(n.me&&t<emotionUntil){speech(n.x,n.y-192);outline('♥',n.x,n.y-196,19,'#d47f91')}}
if(decorateMode)outline('위치 클릭 → Space로 화분 놓기 · 50만',player.x,player.y+42,13,'#fff4b7');if(!artLoaded)outline('사무실을 준비하고 있어요…',W/2,H/2,20,'#fff');
ctx.restore();if(++frameCount%8===0){updateHUD();drawMini()}requestAnimationFrame(frame)}

canvas.addEventListener('click',e=>{if(performance.now()<(camera.suppressClickUntil||0))return;if(!state)return;canvas.focus({preventScroll:true});const p=worldPoint(e);if(decorateMode){const x=Math.floor(p.x/T)*T,y=Math.floor(p.y/T)*T;if(!walkable(x/T,y/T)){toast('가구가 없는 바닥을 골라 주세요.');return}placement={x,y};toast('배치 위치를 선택했어요. Space로 화분을 놓으세요.');return}const o=(window.CompanyUI?CompanyUI.activeNPCs():npcs).find(n=>Math.hypot(n.x-p.x,n.y-55-p.y)<50)||(window.CompanyUI?CompanyUI.activeFacilities():facilities).find(f=>Math.hypot(f.x-p.x,f.y-25-p.y)<37);if(o)selectTarget(o)});
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase(),isSpace=e.code==='Space'||k===' ';if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.isComposing)return;const dialog=document.querySelector('dialog[open]');if(dialog){keys.clear();if(dialog.id==='detail'){const buttons=[...dialog.querySelectorAll('.option,#closeDetail')];if(['arrowdown','arrowup'].includes(k)){e.preventDefault();const i=buttons.indexOf(document.activeElement);buttons[(i+(k==='arrowdown'?1:-1)+buttons.length)%buttons.length]?.focus()}if(isSpace){e.preventDefault();if(!e.repeat)(buttons.includes(document.activeElement)?document.activeElement:buttons[0])?.click()}}return}if(['arrowup','arrowdown','arrowleft','arrowright'].includes(k)&&view==='office'){e.preventDefault();keys.add(k)}if(isSpace&&view==='office'){e.preventDefault();if(!e.repeat)interact();return}if(e.repeat)return;if(['1','2','3','4'].includes(k))visit(['desk','meeting','qa','lounge'][Number(k)-1]);if(k==='m')goOffice();if(k==='escape'){selected=null;placement=null;decorateMode=false;$('#decorate').classList.remove('selected');$('#taskPanel').hidden=true}});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>visit(b.dataset.place));document.querySelectorAll('[data-npc]').forEach(b=>b.onclick=()=>selectNPC(npcs[Number(b.dataset.npc)].name));
$('#taskToggle').onclick=()=>$('#taskPanel').hidden=!$('#taskPanel').hidden;$('#closeTasks').onclick=()=>$('#taskPanel').hidden=true;$('#dismissMessage').onclick=()=>$('.bottom').classList.add('dismissed');
const startRest=$('#rest').onclick;facilities.find(f=>f.id==='lounge').action=startRest;$('#rest').onclick=()=>visit('lounge');
$('#tasks').addEventListener('click',e=>{const button=e.target.closest('.task');if(!button)return;e.preventDefault();e.stopPropagation();visit(['desk','qa','meeting'][[...$('#tasks').querySelectorAll('.task')].indexOf(button)])},true);
$('#otherView').addEventListener('click',e=>{const button=e.target.closest('[data-chat]');if(!button)return;e.preventDefault();e.stopPropagation();selectNPC(button.dataset.chat)},true);
$('#decorate').onclick=()=>{if(!state)return;goOffice();decorateMode=!decorateMode;placement=null;canvas.focus({preventScroll:true});$('#decorate').classList.toggle('selected',decorateMode);toast(decorateMode?'빈 바닥 클릭으로 위치 선택, Space로 화분 놓기. 50만 · 시간 소모 없음':'꾸미기를 마쳤어요.')};$('#emote').onclick=()=>{emotionUntil=performance.now()+2600;toast('동료들에게 반갑게 인사했어요!')};
$('#zoomIn').onclick=()=>{camera.wheelScale=null;camera.zoom=Math.min(2.5,+(camera.zoom+.25).toFixed(2));resize()};$('#zoomOut').onclick=()=>{camera.wheelScale=null;camera.zoom=Math.max(.5,+(camera.zoom-.25).toFixed(2));resize()};$('#recenter').onclick=()=>{camera.manual=false;camera.wheelScale=null;camera.zoom=1;resize();camera.x=player.x;camera.y=player.y};$('#overview').onclick=()=>{camera.manual=false;camera.wheelScale=null;camera.zoom=.6;resize();camera.x=W/2;camera.y=H/2};
mini.onclick=()=>toast('이동은 방향키로만 가능해요.');
document.querySelectorAll('nav button').forEach(b=>{b.setAttribute('aria-label',b.querySelector('span').textContent);b.addEventListener('click',()=>{document.body.classList.toggle('in-panel',b.dataset.view!=='office');$('#taskPanel').hidden=true;keys.clear()})});
const oldAdvance=advance;advance=function(cost,delta,msg){oldAdvance(cost,delta,msg);$('.bottom').classList.remove('dismissed');toast('업무 완료 · '+(delta.quality?'완성도 +'+delta.quality:delta.fatigue<0?'피로 회복':'팀과 한 걸음 더'));updateHUD()};
const originalSubmit=$('#setupForm').onsubmit;$('#setupForm').onsubmit=e=>{originalSubmit(e);player.x=720;player.y=744;player.face='down';selected=null;placement=null;keys.clear();decorateMode=false;goOffice();canvas.focus({preventScroll:true});$('.bottom').classList.remove('dismissed');toast('방향키로 이동하고 Space로 상호작용해요.')};
if(state){render();updateHUD()}else $('#setup').showModal();requestAnimationFrame(frame);




// Wheel zoom is scoped to the office, so scrolling menus and dialogs remains normal.
canvas.addEventListener('wheel',event=>{if(view!=='office'||document.querySelector('dialog[open]'))return;event.preventDefault();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?camera.playHeight:1);if(!delta)return;const overviewScale=Math.min(camera.width/W,camera.playHeight/H),normalScale=(mobileRendering.matches&&camera.height<420?.72:camera.width<760?1:.9);const oldScale=camera.scale;const scale=Math.max(overviewScale*.65,Math.min(normalScale*2.5,oldScale*Math.exp(-Math.max(-120,Math.min(120,delta))*.0018)));camera.wheelScale=scale;camera.zoom=Math.max(.7,scale/normalScale);resize();}, {passive:false});
