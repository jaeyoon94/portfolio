/* Organization identity is independent of floor/space placement. No inferred reporting lines. */
(function(root){
 'use strict';
 const STORAGE_KEY='studio-days-company-v1';
 const typeNames={part:'파트',team:'팀',office:'실',division:'부문',headquarters:'본부',unclassified:'조직 단위 · 계층 미정',Chief:'Chief',CEO:'CEO'};
 const clone=o=>JSON.parse(JSON.stringify(o));
 function seed(){
  const organizations=[],jobRoles=[],workAreas=[],positions=[],spaces=[],placements=[];
  const org=(id,name,type,parentId=null,description=null,specialties=[])=>{organizations.push({id,name,type,parentId,parentStatus:parentId?'confirmed':'undecided',description,specialties,sortOrder:organizations.length,active:true});return id};
  org('org-dev','개발본부','headquarters');
  org('org-plan','기획팀','team','org-dev');
  for(const[id,name,desc]of[['scenario','시나리오파트',null],['content','컨텐츠파트',null],['system','시스템파트',null],['balance','밸런스파트',null],['level','레벨파트','지형 또는 맵 제작 담당']])org('org-plan-'+id,name,'part','org-plan',desc);
  org('org-program','개발팀','team','org-dev');
  for(const[id,name]of[['program','프로그램파트'],['server','서버파트'],['db','DB파트']])org('org-program-'+id,name,'part','org-program');
  org('org-art','아트팀','team','org-dev');
  for(const[id,name]of[['concept','원화파트'],['model','모델링파트'],['background','배경파트'],['ui','UI파트']])org('org-art-'+id,name,'part','org-art',null,id==='ui'?[]:['2D','3D']);
  org('org-pmo','PMO','unclassified',null,'개발본부와 같은 층의 별도 업무 구역. 개발본부 산하 여부 및 조직 계층은 미정입니다.');
  const role=(id,name,organizationId,workAreaId=null)=>jobRoles.push({id,name,organizationId,workAreaId,description:null,specialties:[],sortOrder:jobRoles.length,active:true});
  for(const n of ['DevPM','ArtPM','TechPM'])role('role-pmo-'+n.toLowerCase(),n,'org-pmo');
  org('org-publishing','퍼블리싱본부','headquarters');
  const areas=[['architecture','기술 및 아키텍처',['웹 마크업 엔지니어','UI/UX 개발자','컴포넌트 엔지니어']],['standards','표준 및 접근성 특화 직무',['웹 접근성 전문가','크로스 브라우징 및 최적화 전문가']],['systems','협업 및 시스템 구축 직무',['디자인 시스템 엔지니어','테크니컬 라이터 / 가이드 매니저']]];
  for(const[id,name,roles]of areas){const areaId='area-pub-'+id;workAreas.push({id:areaId,name,organizationId:'org-publishing',classificationType:'work_category',organizationLevel:null,description:null,sortOrder:workAreas.length,active:true});roles.forEach((n,i)=>role('role-pub-'+id+'-'+(i+1),n,'org-publishing',areaId))}
  for(const [i,n]of ['CEO','CBO','CFO','CMO','CPO','CHRO'].entries())positions.push({id:'position-'+n.toLowerCase(),name:n==='CEO'?'대표(CEO)':n,level:n==='CEO'?'CEO':'Chief',organizationId:null,reportsToPositionId:null,holderMemberId:null,description:null,responsibilities:null,sortOrder:i,active:true});
  org('org-support','경영지원실','office');
  for(const[id,name]of[['strategy','경영기획·전략팀'],['hr','인사(HR)·노무팀'],['finance','재무·회계·자금팀'],['facilities','총무·관재팀'],['legal','법무·홍보·구매팀']])org('org-support-'+id,name,'team','org-support');
  const floors=[{id:'floor-1',number:1,name:'개발본부 & PMO',summary:'기획팀 · 개발팀 · 아트팀 / 별도 PMO',spawn:{x:1008,y:720}},{id:'floor-2',number:2,name:'퍼블리싱본부',summary:'기술 및 아키텍처 · 표준 및 접근성 · 협업 및 시스템 구축',spawn:{x:1008,y:720}},{id:'floor-3',number:3,name:'경영진 & 경영지원실',summary:'CEO · Chief / 경영지원실 5개 팀',spawn:{x:1008,y:720}}];
  function space(id,floorId,name,rect,point){spaces.push({id,floorId,name,rect,interactionPoint:point,active:true,sortOrder:spaces.length});return id}
  function place(entityType,entityId,spaceId){placements.push({id:'placement-'+entityId,entityType,entityId,spaceId,sortOrder:placements.length,active:true})}
  space('space-f1-dev','floor-1','개발본부',{x:96,y:124,w:930,h:1240},{x:1008,y:660});place('organization','org-dev','space-f1-dev');
  const teamSpaces=[['plan',160,160,810,610,1008,480],['program',160,820,810,560,1008,1152],['art',1104,810,540,350,1680,1008]];
  for(const[id,x,y,w,h,px,py]of teamSpaces){const sid=space('space-f1-'+id,'floor-1',organizations.find(o=>o.id==='org-'+id).name,{x,y,w,h},{x:px,y:py});place('organization','org-'+id,sid);organizations.filter(o=>o.parentId==='org-'+id).forEach(o=>place('organization',o.id,sid))}
  space('space-f1-pmo','floor-1','PMO 별도 구역',{x:1104,y:160,w:540,h:510},{x:1680,y:576});place('organization','org-pmo','space-f1-pmo');
  space('space-f2-hq','floor-2','퍼블리싱본부',{x:96,y:124,w:1700,h:1250},{x:1008,y:660});place('organization','org-publishing','space-f2-hq');
  for(const[id,rect,point]of[['architecture',{x:160,y:160,w:810,h:610},{x:1008,y:480}],['standards',{x:1104,y:160,w:540,h:510},{x:1680,y:576}],['systems',{x:160,y:820,w:810,h:560},{x:1008,y:1152}]]){const a=workAreas.find(a=>a.id==='area-pub-'+id);const sid=space('space-f2-'+id,'floor-2',a.name,rect,point);place('workArea',a.id,sid)}
  for(let i=0;i<positions.length;i++){const x=120+(i%3)*570,y=160+Math.floor(i/3)*285;const sid=space('space-f3-'+positions[i].id,'floor-3',positions[i].name,{x,y,w:510,h:250},{x:x+480,y:y+240});place('position',positions[i].id,sid)}
  space('space-f3-support','floor-3','경영지원실',{x:96,y:800,w:1700,h:570},{x:1008,y:780});place('organization','org-support','space-f3-support');
  const support=organizations.filter(o=>o.parentId==='org-support');support.forEach((o,i)=>{const x=120+(i%3)*570,y=850+Math.floor(i/3)*270;const sid=space('space-f3-'+o.id,'floor-3',o.name,{x,y,w:510,h:240},{x:x+480,y:y+228});place('organization',o.id,sid)});
  const displays={
   'space-f1-dev':{x:650,y:123,w:220,minimal:true},'space-f1-plan':{x:100,y:160,w:290},'space-f1-program':{x:100,y:850,w:290},'space-f1-art':{x:1104,y:790,w:300},'space-f1-pmo':{x:1104,y:132,w:300},
   'space-f2-hq':{x:110,y:42,w:650,header:true},'space-f2-architecture':{x:100,y:160,w:300},'space-f2-standards':{x:1104,y:132,w:380},'space-f2-systems':{x:100,y:850,w:300},
   'space-f3-support':{x:120,y:785,w:600,minimal:true}
  };
  for(const s of spaces)s.display=displays[s.id]||{x:s.rect.x+12,y:s.rect.y-(s.id.includes('position-')?25:12),w:s.rect.w-24,compact:true};
  return {schemaVersion:1,revision:1,organizations,positions,workAreas,jobRoles,floors,spaces,placements,members:[],characters:[],officeLayoutVersion:0,projects:[],tasks:[],documents:[],operationRecords:[],entityLinks:[],session:{floorId:'floor-1',positionsByFloor:{},decorationsByFloor:{}},updatedAt:null};
 }
 function validate(db){
  const errors=[],collections=['organizations','positions','workAreas','jobRoles','floors','spaces','placements','members','characters','projects','tasks','documents','operationRecords','entityLinks'];
  for(const c of collections)if(!Array.isArray(db[c]))errors.push(c+' must be an array');if(errors.length)return errors;
  const ids=new Set();for(const c of collections)for(const row of db[c]){if(!row.id||ids.has(row.id))errors.push('Missing or duplicate ID: '+row.id);ids.add(row.id)}
  const orgs=new Map(db.organizations.map(o=>[o.id,o])),ranks={part:0,team:1,office:2,division:3,headquarters:4};
  for(const o of db.organizations){if(!['part','team','office','division','headquarters','unclassified'].includes(o.type))errors.push('Invalid organization type');if(o.parentId){const p=orgs.get(o.parentId);if(!p)errors.push('Missing parent '+o.id);else if(ranks[o.type]!==undefined&&ranks[p.type]!==undefined&&ranks[o.type]>=ranks[p.type])errors.push('Invalid hierarchy '+o.id)}const seen=new Set([o.id]);let p=o;while(p.parentId&&orgs.has(p.parentId)){if(seen.has(p.parentId)){errors.push('Organization cycle');break}seen.add(p.parentId);p=orgs.get(p.parentId)}}
  for(const p of db.positions){if(!['CEO','Chief','headquarters_head'].includes(p.level))errors.push('Invalid position level');if(p.organizationId&&!orgs.has(p.organizationId))errors.push('Missing assigned organization');if(p.reportsToPositionId&&!db.positions.some(r=>r.id===p.reportsToPositionId))errors.push('Missing reporting position')}
  for(const a of db.workAreas)if(!orgs.has(a.organizationId))errors.push('Missing work-area organization');
  for(const role of db.jobRoles){if(role.organizationId&&!orgs.has(role.organizationId))errors.push('Missing role owner');if(role.workAreaId&&!db.workAreas.some(a=>a.id===role.workAreaId))errors.push('Missing role work area')}
  for(const s of db.spaces)if(!db.floors.some(f=>f.id===s.floorId))errors.push('Missing space floor');
  for(const p of db.placements){const list={organization:db.organizations,position:db.positions,workArea:db.workAreas}[p.entityType];if(!list?.some(o=>o.id===p.entityId))errors.push('Missing placement entity');if(!db.spaces.some(s=>s.id===p.spaceId))errors.push('Missing placement space')}
  for(const c of db.characters||[]){if(!db.spaces.some(s=>s.id===c.spaceId))errors.push('Missing character space');const list={organization:db.organizations,position:db.positions,workArea:db.workAreas,jobRole:db.jobRoles}[c.entityType];if(!list?.some(e=>e.id===c.entityId))errors.push('Missing character affiliation');if(c.memberId&&!db.members.some(m=>m.id===c.memberId))errors.push('Missing character member')}
  for(const p of db.positions)if(p.holderMemberId&&!db.members.some(m=>m.id===p.holderMemberId))errors.push('Missing position holder');
  for(const link of db.entityLinks)if(!ids.has(link.sourceId)||!ids.has(link.targetId))errors.push('Missing link endpoint');
  return errors;
 }
 function upgradeOffice(db){
  if(db.officeLayoutVersion>=2)return db;
  const member={id:'member-leejju',name:'이쮸',organizationId:'org-publishing',positionId:'position-publishing-head',active:true};
  if(!db.members.some(m=>m.id===member.id))db.members.push(member);
  if(!db.positions.some(p=>p.id==='position-publishing-head'))db.positions.push({id:'position-publishing-head',name:'퍼블리싱본부장',level:'headquarters_head',organizationId:'org-publishing',reportsToPositionId:null,holderMemberId:member.id,description:null,responsibilities:null,sortOrder:6,active:true});
  const headSpace={id:'space-f2-head',floorId:'floor-2',name:'퍼블리싱본부장실',rect:{x:1104,y:840,w:630,h:520},interactionPoint:{x:1680,y:1104},display:{x:1120,y:860,w:550,compact:true},active:true,sortOrder:99};
  if(!db.spaces.some(s=>s.id===headSpace.id))db.spaces.push(headSpace);
  if(!db.placements.some(p=>p.entityId==='position-publishing-head'))db.placements.push({id:'placement-position-publishing-head',entityType:'position',entityId:'position-publishing-head',spaceId:headSpace.id,sortOrder:99,active:true});
  const chars=[];
  const seat=(type,id,x,y,skin=1,name=null,legacyName=null)=>{const table={organization:db.organizations,position:db.positions,workArea:db.workAreas,jobRole:db.jobRoles};const e=table[type].find(e=>e.id===id);if(!e)return;let owner=type==='jobRole'?(e.workAreaId||e.organizationId):id;let placement=db.placements.find(p=>p.entityId===owner);const spaceId=placement?.spaceId;if(!spaceId)return;chars.push({id:'character-'+id,entityType:type,entityId:id,organizationId:type==='organization'?id:e.organizationId||null,memberId:id==='org-publishing'?'member-leejju':null,spaceId,x,y,skin,name:name||'담당',legacyName,isPlaceholder:!name,active:true,sortOrder:chars.length})};
  seat('organization','org-dev',970,570,1);
  const pod=(ids,coords,type='organization')=>ids.forEach((id,i)=>seat(type,id,...coords[i],(i+1)%6));
  pod(['org-plan','org-plan-scenario','org-plan-content','org-plan-system','org-plan-balance','org-plan-level'],[[230,400],[490,400],[750,400],[230,660],[490,660],[750,660]]);
  pod(['org-program','org-program-program','org-program-server','org-program-db'],[[250,1070],[610,1070],[250,1330],[610,1330]]);
  pod(['org-art','org-art-concept','org-art-model','org-art-background','org-art-ui'],[[1190,1070],[1450,1070],[1710,1070],[1190,1330],[1450,1330]]);
  pod(['org-pmo'],[[1250,400]]);
  pod(db.jobRoles.filter(r=>r.organizationId==='org-pmo').map(r=>r.id),[[1560,400],[1250,660],[1560,660]],'jobRole');
  const grids={architecture:[[250,400],[620,400],[250,660],[620,660]],standards:[[1250,400],[1560,400],[1250,660]],systems:[[250,1070],[620,1070],[250,1330]]};
  for(const a of db.workAreas){const grid=grids[a.id.replace('area-pub-','')];if(!grid)continue;seat('workArea',a.id,...grid[0],3);db.jobRoles.filter(r=>r.workAreaId===a.id).forEach((r,i)=>seat('jobRole',r.id,...grid[i+1],(i+2)%6))}
  seat('organization','org-publishing',1410,1170,5,'이쮸');chars[chars.length-1].spaceId=headSpace.id;
  db.positions.filter(p=>p.level!=='headquarters_head').forEach((p,i)=>seat('position',p.id,375+(i%3)*570,365+Math.floor(i/3)*285,(i+1)%6));
  db.organizations.filter(o=>o.parentId==='org-support').forEach((o,i)=>seat('organization',o.id,375+(i%3)*570,1055+Math.floor(i/3)*270,(i+2)%6));
  seat('organization','org-support',1515,1325,1);
  for(const [id,name]of [['org-plan','지민'],['org-program','도윤'],['org-art','하린'],['org-pmo','수현'],['area-pub-systems','유진']]){const c=chars.find(c=>c.entityId===id);c.name=name;c.legacyName=name;c.isPlaceholder=false}
  db.characters=[...(db.characters||[]),...chars.filter(c=>!(db.characters||[]).some(old=>old.id===c.id))];
  const dev=db.spaces.find(s=>s.id==='space-f1-dev');dev.display={x:830,y:160,w:230,minimal:true};
  const art=db.spaces.find(s=>s.id==='space-f1-art');art.rect={x:1104,y:840,w:720,h:540};art.display={x:1104,y:825,w:650,compact:true};
  for(const id of ['space-f1-plan','space-f1-program','space-f1-pmo','space-f2-architecture','space-f2-standards','space-f2-systems']){const s=db.spaces.find(s=>s.id===id);s.display={x:s.rect.x-35,y:s.id.endsWith('program')||s.id.endsWith('systems')?850:160,w:s.id.endsWith('pmo')||s.id.endsWith('standards')?620:680,compact:true}}
  db.officeLayoutVersion=2;return db;
 }
 function redesignOffice(db){
  if(db.officeLayoutVersion>=3)return db;
  db.company={id:'company-yoon-jju',name:'윤&쮸 컴퍼니',studioName:'StarJourney'};
  db.officeRooms=[];
  for(const f of db.floors){
   const rooms=[['meeting','회의실',{x:1944,y:168,w:576,h:552},{x:2208,y:672}],['restroom','화장실',{x:1944,y:912,w:576,h:480},{x:2208,y:1344}],['lounge','StarJourney 라운지',{x:96,y:1488,w:1728,h:360},{x:1008,y:1752}],['kitchen','탕비실',{x:1944,y:1488,w:576,h:360},{x:2208,y:1776}]];
   for(const [kind,name,rect,interactionPoint]of rooms){const id='space-'+f.id+'-'+kind;if(!db.spaces.some(s=>s.id===id))db.spaces.push({id,floorId:f.id,name,rect,interactionPoint,active:true,sortOrder:200+db.spaces.length,kind});db.officeRooms.push({id:'room-'+f.id+'-'+kind,spaceId:id,kind})}
  }
  for(const c of db.characters){c.face='up';c.seated=true;if(c.y===400)c.y=430;if(c.y===660)c.y=690;}
  const director=db.characters.find(c=>c.entityId==='org-dev');if(director){const id='space-f1-director';if(!db.spaces.some(s=>s.id===id))db.spaces.push({id,floorId:'floor-1',name:'개발본부 업무석',rect:{x:1368,y:1488,w:456,h:360},interactionPoint:{x:1296,y:1704},display:{x:1400,y:1510,w:380,compact:true},active:true,sortOrder:199});director.spaceId=id;director.x=1584;director.y=1776;db.placements.find(p=>p.entityId==='org-dev').spaceId=id;}
  db.officeLayoutVersion=3;return db;
 }
 function addTransportLobby(db){
 if(db.transportLayoutVersion===1)return db;
 for(const f of db.floors){const id='space-'+f.id+'-transport';if(!db.spaces.some(s=>s.id===id))db.spaces.push({id,floorId:f.id,name:'공용 로비 · 엘리베이터 & 계단',kind:'transport',rect:{x:2640,y:432,w:624,h:744},interactionPoint:{x:2880,y:1080},active:true,sortOrder:300});f.spawn={x:2880,y:1080};}
 db.transportLayoutVersion=1;return db;
 }
 function normalize(saved){const base=seed();if(!saved)return addTransportLobby(redesignOffice(upgradeOffice(base)));if(saved.schemaVersion!==1)throw Error('Unsupported company schema');const db={...base,...saved,session:{...base.session,...saved.session}};addTransportLobby(redesignOffice(upgradeOffice(db)));const errors=validate(db);if(errors.length)throw Error(errors.join('; '));return db}
 function createStore(storage){let db;let warning=null;try{db=normalize(JSON.parse(storage.getItem(STORAGE_KEY)||'null'))}catch(e){db=addTransportLobby(redesignOffice(upgradeOffice(seed())));warning='저장된 조직 구성을 읽지 못해 기본 구성을 표시합니다. 기존 저장본은 덮어쓰지 않았습니다.'}
  const persist=()=>{const errors=validate(db);if(errors.length)throw Error(errors.join('; '));db.updatedAt=new Date().toISOString();storage.setItem(STORAGE_KEY,JSON.stringify(db))};
  if(!warning)persist();
  return {get data(){return db},warning,save:persist,update(fn){const draft=clone(db);fn(draft);draft.revision++;const errors=validate(draft);if(errors.length)throw Error(errors.join('; '));const previous=db;db=draft;try{persist()}catch(e){db=previous;throw e}return db}};
 }
 const rawSeed=seed;const api={STORAGE_KEY,typeNames,seed:()=>addTransportLobby(redesignOffice(upgradeOffice(rawSeed()))),validate,normalize,createStore};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CompanyModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
