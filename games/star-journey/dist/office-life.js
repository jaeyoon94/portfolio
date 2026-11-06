/* Whole-body rendering and staged chair departure keep NPCs on the floor. */
(function(){
 const base=CompanyUI.activeNPCs,actors=new Map(),lines=['이번 빌드도 확인해 볼까요?','잠깐 스트레칭하고 올게요.','좋은 아이디어가 떠올랐어요.','오늘도 함께 만들어 봐요.','다음 회의에서 이야기해요.'];let nextSpeech=3;
 function clear(p,owner,chairAccess=false){
  for(const dx of[-18,0,18])for(const dy of[-24,0,8])if(!walkable(Math.floor((p.x+dx)/T),Math.floor((p.y+dy)/T)))return false;
  for(const o of objects){if(o.kind==='officeChair'&&chairAccess&&o.seatOwnerId===owner)continue;if(o.solid===false&&o.kind!=='officeChair')continue;
   if(p.x+18>o.x-3&&p.x-18<o.x+o.w+3&&p.y+8>o.y-3&&p.y-24<o.y+o.h+3)return false;
  }return true;
 }
 function segment(from,to,owner,chairAccess=false){const d=Math.hypot(to.x-from.x,to.y-from.y),steps=Math.max(1,Math.ceil(d/3));for(let i=0;i<=steps;i++){const t=i/steps;if(!clear({x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t},owner,chairAccess))return false}return true}
 function route(from,to,owner){const center=p=>({x:Math.floor(p.x/T)*T+T/2,y:Math.floor(p.y/T)*T+T/2}),first=center(from),last=center(to);if(!segment(from,first,owner)||!segment(last,to,owner))return null;const start=Math.floor(first.y/T)*COLS+Math.floor(first.x/T),end=Math.floor(last.y/T)*COLS+Math.floor(last.x/T),queue=[start],prev=new Map([[start,null]]);
  for(let i=0;i<queue.length&&i<800;i++){const at=queue[i],p={x:at%COLS*T+T/2,y:Math.floor(at/COLS)*T+T/2};if(at===end){const out=[to];for(let k=end;k!==start;k=prev.get(k))out.unshift({x:k%COLS*T+T/2,y:Math.floor(k/COLS)*T+T/2});out.unshift(first);return out}for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const q={x:p.x+dx*T,y:p.y+dy*T},key=Math.floor(q.y/T)*COLS+Math.floor(q.x/T);if(!prev.has(key)&&Math.hypot(q.x-from.x,q.y-from.y)<300&&segment(p,q,owner)){prev.set(key,at);queue.push(key)}}}return null;
 }
 CompanyUI.activeNPCs=()=>base().map(n=>({...n,...actors.get(n.id)}));
 CompanyUI.tick=(dt,t)=>{if(document.hidden||document.querySelector('dialog[open]')||view!=='office'||!state)return;const roster=base(),live=new Set(roster.map(n=>n.id));for(const id of actors.keys())if(!live.has(id))actors.delete(id);
  for(const n of roster){let a=actors.get(n.id);if(!a){a={x:n.x,y:n.y,face:n.face,seated:true,moving:false,path:[],wait:4+Math.random()*12,stage:'seated',phase:0};actors.set(n.id,a)}a.wait-=dt;
   if(a.path.length){const p=a.path[0],dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy),step=Math.min(d,58*Math.min(dt,.05)),q=d?{x:a.x+dx/d*step,y:a.y+dy/d*step}:{x:a.x,y:a.y},access=a.stage==='exit'||a.stage==='enter';
    if(!segment(a,q,n.id,access)){a.moving=false;a.wait=1;continue}a.seated=false;a.moving=d>.1;if(a.moving){if(t-(a.lastStep??-1e9)>140)a.phase=0;else a.phase+=step*.14;a.lastStep=t}if(a.segFor!==p){a.segFor=p;a.segLen=d}let fx=dx,fy=dy;if(a.segLen<18){const next=a.path[1],long=next&&Math.hypot(next.x-p.x,next.y-p.y)>=18;fx=long?next.x-p.x:0;fy=long?next.y-p.y:0}if(Math.abs(fx)>.1||Math.abs(fy)>.1)a.face=Math.abs(fx)>Math.abs(fy)?fx>0?'right':'left':fy>0?'down':'up';a.x=q.x;a.y=q.y;if(d<=step+.01)a.path.shift();
    if(!a.path.length){a.moving=false;if(a.stage==='exit'){a.stage='out';a.wait=0}else if(a.stage==='wander'){a.stage='out';a.wait=4+Math.random()*5;a.returning=true}else if(a.stage==='return'){a.stage='enter';a.path=[{x:n.x,y:n.y}]}else if(a.stage==='enter'){a.stage='seated';a.seated=true;a.face=n.face;a.returning=false;a.wait=9+Math.random()*16}}
   }else if(a.wait<=0){
    a.wait=2+Math.random()*3;
    if(a.stage==='seated'){if([...actors.values()].filter(v=>!v.seated).length>=3)continue;const dock={x:n.x,y:n.y+48};if(segment(a,dock,n.id,true)&&clear(dock,n.id)){a.dock=dock;a.path=[dock];a.stage='exit'}}
    else if(a.stage==='out'){const target=a.returning?a.dock:{x:a.dock.x+(Math.floor(Math.random()*9)-4)*T,y:a.dock.y+(Math.floor(Math.random()*7)-3)*T};const path=route(a,target,n.id);if(path?.length){a.path=path;a.stage=a.returning?'return':'wander'}else if(!a.returning)a.returning=true}
   }
  }
  nextSpeech-=dt;if(nextSpeech<=0&&roster.length){const visible=roster.filter(n=>{const a=actors.get(n.id);return Math.abs(a.x-camera.x)<camera.width/(camera.scale||1)/2-80&&Math.abs(a.y-camera.y)<camera.playHeight/(camera.scale||1)/2-110}),pool=visible.length?visible:roster,n=pool[Math.floor(Math.random()*pool.length)],a=actors.get(n.id);a.message=lines[Math.floor(Math.random()*lines.length)];a.messageUntil=t+4500;nextSpeech=8+Math.random()*7}
 };

 CompanyUI.drawSpeech=(n,t)=>{if(!n.message||t>n.messageUntil)return;ctx.save();ctx.font='600 16px "Noto Sans KR"';const w=ctx.measureText(n.message).width+24,x=n.x-w/2,y=n.y-166;ctx.fillStyle='#fffdf2f5';ctx.strokeStyle='#7d8f7c';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,34,9);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(n.x-6,y+34);ctx.lineTo(n.x,y+42);ctx.lineTo(n.x+6,y+34);ctx.fill();ctx.fillStyle='#465a4d';ctx.textAlign='center';ctx.fillText(n.message,n.x,y+23);ctx.restore()};
 let drag=null;canvas.style.cursor='grab';canvas.addEventListener('pointerdown',e=>{if(e.button!==0||decorateMode||document.querySelector('dialog[open]')||view!=='office')return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y,moved:false};canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)drag.moved=true;if(!drag.moved)return;camera.manual=true;const hw=camera.width/camera.scale/2,hh=camera.playHeight/camera.scale/2;camera.x=hw>=W/2?W/2:Math.max(hw,Math.min(W-hw,drag.cx-dx/camera.scale));camera.y=hh>=H/2?H/2:Math.max(hh,Math.min(H-hh,drag.cy-dy/camera.scale));canvas.style.cursor='grabbing';e.preventDefault()});
 const stop=e=>{if(!drag||e.pointerId!==drag.id)return;if(drag.moved)camera.suppressClickUntil=performance.now()+350;drag=null;canvas.style.cursor='grab'};for(const type of['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,stop);window.addEventListener('blur',()=>{drag=null;canvas.style.cursor='grab'});
 canvas.addEventListener('click',e=>{if(performance.now()<(camera.suppressClickUntil||0)){e.preventDefault();e.stopImmediatePropagation()}},true);
})();
