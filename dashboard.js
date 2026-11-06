(() => {
'use strict';
const root=document.getElementById('dashboard');if(!root)return;
const $=id=>document.getElementById('db-'+id);
const projects={jira:['Project DME','언디셈버','레전드 오브 슬라임'],custom:['프로젝트 네온','테일즈런너']};
const headers=['id','project','group','title','owner','status','start','due'];
const labels={todo:'예정',doing:'진행',done:'완료',blocked:'차단'};
const DAY=86400000,DEFAULT_DATE='2026-11-05';

// Synthetic demonstration rows: plausible work, not records of real projects.
const seed={
 'Project DME':['DME',[
  ['기능 개발','Jira 일감 상태 동기화 규칙 정리','기획','done','2026-10-13','2026-10-24'],
  ['기능 개발','Epic/Task 매핑 시트 자동 생성','클라이언트','doing','2026-10-20','2026-11-07'],
  ['기능 개발','Excel 복사 도구 예외 처리','클라이언트','blocked','2026-10-22','2026-11-03'],
  ['QA','변환 결과 샘플 50건 대조','QA','doing','2026-10-27','2026-11-10'],
  ['QA','누락 일감 재검증','QA','todo','2026-11-04','2026-11-14'],
  ['론칭 준비','사용 가이드 문서 작성','기획','todo','2026-11-06','2026-11-18'],
  ['론칭 준비','팀 공유와 피드백 수집','기획','todo','2026-11-12','2026-11-21']]],
 '언디셈버':['UD',[
  ['기능 개발','시즌 10 상품 구성 검토','사업','done','2026-10-13','2026-10-23'],
  ['기능 개발','아이템 밸런스 변경안 반영','서버','doing','2026-10-19','2026-11-04'],
  ['기능 개발','이벤트 보상 테이블 입력','기획','done','2026-10-20','2026-10-30'],
  ['QA','업데이트 빌드 회귀 테스트','QA','doing','2026-10-29','2026-11-09'],
  ['QA','결제 오류 재현 확인','QA','blocked','2026-10-30','2026-11-06'],
  ['론칭 준비','패치 노트 초안','기획','todo','2026-11-03','2026-11-11'],
  ['론칭 준비','점검 공지 일정 확정','사업','todo','2026-11-05','2026-11-12'],
  ['론칭 준비','라이브 모니터링 담당 배정','기획','todo','2026-11-09','2026-11-13']]],
 '레전드 오브 슬라임':['SL',[
  ['기능 개발','신규 스테이지 데이터 반영','클라이언트','done','2026-10-12','2026-10-26'],
  ['기능 개발','광고 보상 횟수 조정','서버','doing','2026-10-21','2026-11-08'],
  ['기능 개발','튜토리얼 문구 수정','기획','done','2026-10-23','2026-10-31'],
  ['QA','기기별 크래시 로그 분류','QA','doing','2026-10-26','2026-11-02'],
  ['QA','스토어 심사 체크리스트 점검','QA','todo','2026-11-02','2026-11-10'],
  ['론칭 준비','스토어 스크린샷 교체','아트','todo','2026-11-04','2026-11-16'],
  ['론칭 준비','업데이트 공지 번역 요청','기획','blocked','2026-11-01','2026-11-09']]],
 '프로젝트 네온':['NE',[
  ['개발 일정','전투 프로토타입 마일스톤 점검','기획','done','2026-10-12','2026-10-23'],
  ['개발 일정','배경 원화 외주 일정 확인','아트','doing','2026-10-19','2026-11-06'],
  ['개발 일정','몬스터 모델링 검수','아트','todo','2026-11-03','2026-11-17'],
  ['리소스','애니메이션 담당 공백 조정','기획','blocked','2026-10-26','2026-11-04'],
  ['리소스','외부 협력사 작업 범위 재합의','기획','doing','2026-10-28','2026-11-11'],
  ['Action Item','주간 회의 미결 사항 정리','기획','done','2026-10-27','2026-10-31'],
  ['Action Item','보스 패턴 리뷰 후속 작업 배정','기획','todo','2026-11-05','2026-11-13'],
  ['Action Item','빌드 배포 일정 공유','클라이언트','todo','2026-11-10','2026-11-20']]],
 '테일즈런너':['TR',[
  ['운영 현안','자진신고 접수 문의 응대 기준','운영','done','2026-10-13','2026-10-22'],
  ['운영 현안','신고 처리 단계별 담당 정리','운영','doing','2026-10-21','2026-11-05'],
  ['정책 검토','캠페인 정책 초안 법무 검토','사업','blocked','2026-10-24','2026-11-02'],
  ['정책 검토','제재 감면 기준 확정','사업','doing','2026-10-27','2026-11-10'],
  ['행사 준비','21주년 복귀 이벤트 보상안','기획','doing','2026-10-29','2026-11-12'],
  ['행사 준비','오프라인 행사 장소 후보 정리','사업','todo','2026-11-04','2026-11-18'],
  ['행사 준비','개발자 토크 진행안','기획','todo','2026-11-09','2026-11-24']]]
};
const demo={};
for(const [mode,names] of Object.entries(projects))demo[mode]=names.flatMap(project=>{const [code,list]=seed[project];return list.map(([group,title,owner,status,start,due],i)=>({id:`${code}-${101+i}`,project,group,title,owner,status,start,due}));});

const NO_FILTER={key:null,value:null,project:null};
let mode='jira',data=structuredClone(demo),sources={jira:'demo',custom:'demo'},uploadVersion=0,filter=NO_FILTER;
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=text;if(cls)n.className=cls;return n;}
function dateValid(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T00:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===s;}
const t=s=>Date.parse(s+'T00:00:00Z');
const short=s=>`${+s.slice(5,7)}.${+s.slice(8,10)}`;
const pct=(n,d)=>d?Math.round(n/d*100):0;
function rows(){return data[mode].filter(r=>$('project').value==='all'||r.project===$('project').value);}
function fillProjects(){const select=$('project');select.replaceChildren();for(const [value,name] of [['all','전체'],...projects[mode].map(p=>[p,p])]){const o=el('option',name);o.value=value;select.append(o);}}
function setFilter(key,value,project=null){filter=filter.key===key&&filter.value===value&&filter.project===project?NO_FILTER:{key,value,project};render();if(filter.key)document.getElementById('db-tasks-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}

// Tooltip: enhances the bars; every value is also in the table.
const tip=document.getElementById('db-tip');
function showTip(target,lines){tip.replaceChildren(...lines.map((l,i)=>el(i?'span':'strong',l)));tip.hidden=false;const r=target.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;const x=Math.max(8,Math.min(r.left+r.width/2-w/2,innerWidth-w-8));const y=r.top-h-8<8?r.bottom+8:r.top-h-8;tip.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px)`;}
function hideTip(){tip.hidden=true;}
addEventListener('scroll',hideTip,{passive:true});

function render(){
 hideTip();
 const selected=rows(),validDate=dateValid($('date').value),today=validDate?$('date').value:null;
 const isDone=r=>r.status==='done';
 const late=r=>today&&!isDone(r)&&r.due<today;
 const soon=r=>today&&!isDone(r)&&r.due>=today&&(t(r.due)-t(today))/DAY<=7;
 const lateDays=r=>Math.round((t(today)-t(r.due))/DAY);
 const done=selected.filter(isDone).length,blocked=selected.filter(r=>r.status==='blocked').length,lateN=validDate?selected.filter(late).length:null;

 $('source').textContent=sources[mode]==='demo'?`시연 데이터 / ${data[mode].length}건`:`불러온 CSV / ${data[mode].length}건 검증 완료`;
 $('source').dataset.kind=sources[mode];

 // KPI row: a label, the number, one line of context.
 $('kpis').replaceChildren();
 const due=validDate?selected.filter(r=>r.due<=today).length:0;
 for(const [label,value,unit,sub,state] of [
  ['전체 작업',selected.length,'건',`${new Set(selected.map(r=>r.project)).size}개 프로젝트`],
  ['완료율',selected.length?pct(done,selected.length):'—',selected.length?'%':'',validDate?`${done}건 완료 / 기준일까지 예상 ${pct(due,selected.length)}%`:`${done}건 완료`],
  ['지연',lateN??'—',lateN===null?'':'건',validDate?'종료일이 기준일보다 앞선 미완료':'기준일을 입력하세요',lateN?'late':null],
  ['차단',blocked,'건','다른 작업을 기다리는 중',blocked?'blocked':null]]){
  const k=el('div',undefined,'kpi');if(state)k.dataset.state=state;
  const v=el('p',undefined,'kpi-value');v.append(el('span',String(value)));if(unit)v.append(el('small',unit));
  k.append(el('p',label,'kpi-label'),v,el('p',sub,'kpi-sub'));$('kpis').append(k);
 }

 // Timeline of open work against the as-of date.
 const open=selected.filter(r=>!isDone(r)).sort((a,b)=>a.due.localeCompare(b.due)||a.id.localeCompare(b.id));
 const tl=$('timeline');tl.replaceChildren();
 $('schedule-meta').textContent=open.length?`미완료 ${open.length}건 / 종료일 순`:'';
 if(!open.length)tl.append(el('p','미완료 작업이 없습니다.','empty'));
 else{
  const times=open.flatMap(r=>[t(r.start),t(r.due)]).concat(today?[t(today)]:[]);
  const d0=new Date(Math.min(...times)),startMon=Date.UTC(d0.getUTCFullYear(),d0.getUTCMonth(),d0.getUTCDate()-((d0.getUTCDay()+6)%7));
  const weeks=Math.max(1,Math.ceil((Math.max(...times)+DAY-startMon)/(7*DAY))),span=weeks*7*DAY;
  const x=ms=>((ms-startMon)/span*100).toFixed(3)+'%';
  const plot=el('div',undefined,'tl-plot');
  const axis=el('div',undefined,'tl-axis');axis.setAttribute('aria-hidden','true');
  for(let w=0;w<weeks;w++){const d=new Date(startMon+w*7*DAY).toISOString().slice(0,10);const s=el('span',short(d));s.style.left=x(t(d));axis.append(s);}
  const grid=el('div',undefined,'tl-grid');grid.setAttribute('aria-hidden','true');grid.style.setProperty('--weeks',weeks);
  const list=el('ol',undefined,'tl-rows');
  for(const r of open){
   const state=r.status==='blocked'?'blocked':late(r)?'late':r.status;
   const li=el('li',undefined,'tl-row');
   const name=el('div',undefined,'tl-name');name.append(el('span',r.title,'tl-title'),el('span',`${r.project} / ${r.owner}`,'tl-sub'));
   const track=el('div',undefined,'tl-track');
   const bar=el('button',undefined,'tl-bar');bar.type='button';bar.dataset.state=state;
   bar.style.left=x(t(r.start));bar.style.width=`calc(${x(t(r.due)+DAY)} - ${x(t(r.start))})`;
   const info=[r.title,`${r.project} / ${r.group} / ${r.owner}`,`${r.start} ~ ${r.due} / ${labels[r.status]}${late(r)?` / ${lateDays(r)}일 지연`:''}`];
   bar.setAttribute('aria-label',info.join(', '));
   for(const [on,fn] of [['pointerenter',()=>showTip(bar,info)],['pointerleave',hideTip],['focus',()=>showTip(bar,info)],['blur',hideTip]])bar.addEventListener(on,fn);
   const tag=state==='blocked'?'차단':state==='late'?`${lateDays(r)}일 지연`:short(r.due);
   const end=el('span',tag,'tl-end tl-end--'+state);end.style.left=x(t(r.due)+DAY);
   track.append(bar,end);li.append(name,track);list.append(li);
  }
  plot.append(axis,grid,list);
  if(today){const line=el('div',undefined,'tl-today');line.style.setProperty('--f',((t(today)+DAY/2-startMon)/span).toFixed(4));line.append(el('span',`기준일 ${short(today)}`));plot.append(line);}
  tl.append(plot);
 }

 // Risk list: reason as text first, then the task.
 const risks=open.filter(r=>r.status==='blocked'||late(r)||soon(r)).map(r=>({r,kind:r.status==='blocked'?'blocked':late(r)?'late':'soon'}));
 const order={blocked:0,late:1,soon:2};risks.sort((a,b)=>order[a.kind]-order[b.kind]||a.r.due.localeCompare(b.r.due));
 $('risks').replaceChildren();
 if(validDate&&!risks.length)$('risks').append(el('li','확인할 작업이 없습니다.','empty'));
 for(const {r,kind} of risks.slice(0,8)){
  const li=el('li',undefined,'risk');
  const text=kind==='blocked'?'차단':kind==='late'?`D+${lateDays(r)}`:`D-${Math.round((t(r.due)-t(today))/DAY)}`;
  const body=el('div',undefined,'risk-body');body.append(el('span',r.title,'risk-title'),el('span',`${r.project} / ${r.owner} / ${short(r.due)} 마감`,'risk-sub'));
  li.append(el('span',text,'risk-tag risk-tag--'+kind),body);$('risks').append(li);
 }
 if(risks.length>8)$('risks').append(el('li',`외 ${risks.length-8}건은 작업 목록에서 확인`,'empty'));
 if(!validDate)$('risks').append(el('li','기준일을 입력하면 지연과 마감 임박 작업도 계산합니다.','empty'));

 // Per project: thin segmented status bar; a segment filters the table.
 $('projects').replaceChildren();
 for(const name of projects[mode].filter(p=>$('project').value==='all'||p===$('project').value)){
  const items=selected.filter(r=>r.project===name),n=items.filter(isDone).length;
  const row=el('div',undefined,'prow');
  const head=el('div',undefined,'prow-head');head.append(el('span',name,'prow-name'),el('span',items.length?`${pct(n,items.length)}%`:'—','prow-pct'));
  const seg=el('div',undefined,'segbar');
  for(const s of ['done','doing','todo','blocked']){const c=items.filter(r=>r.status===s).length;if(!c)continue;
   const b=el('button',undefined,'seg seg--'+s);b.type='button';b.style.flexGrow=c;const info=[`${name} / ${labels[s]}`,`${c}건 / 누르면 작업 목록을 걸러 봅니다`];
   b.setAttribute('aria-label',`${name} ${labels[s]} ${c}건, 작업 목록 거르기`);
   for(const [on,fn] of [['pointerenter',()=>showTip(b,info)],['pointerleave',hideTip],['focus',()=>showTip(b,info)],['blur',hideTip]])b.addEventListener(on,fn);
   b.addEventListener('click',()=>setFilter('status',s,name));
   seg.append(b);}
  row.append(head,seg,el('p',`${items.length}건 / 지연 ${validDate?items.filter(late).length:'—'} / 차단 ${items.filter(r=>r.status==='blocked').length}`,'prow-meta'));
  $('projects').append(row);
 }

 // By work area: bullet bars; the tick is the share due by the as-of date.
 $('groups').replaceChildren();$('group-title').textContent=mode==='jira'?'Epic별 완료율':'업무 영역별 완료율';
 const groups=[...new Set(selected.map(r=>r.group))].map(g=>{const all=selected.filter(r=>r.group===g);return {g,n:all.filter(isDone).length,total:all.length,due:validDate?all.filter(r=>r.due<=today).length:null};}).sort((a,b)=>b.n/b.total-a.n/a.total||b.total-a.total);
 for(const {g,n,total,due:d} of groups){
  const row=el('button',undefined,'grow');row.type='button';row.setAttribute('aria-pressed',String(filter.key==='group'&&filter.value===g));
  const behind=d!==null&&n<d;
  const head=el('span',undefined,'grow-head');head.append(el('span',g,'grow-name'),el('span',`${n}/${total} / ${pct(n,total)}%`,'grow-val'));
  const track=el('span',undefined,'meter');const fill=el('span',undefined,'meter-fill');fill.style.width=pct(n,total)+'%';track.append(fill);
  if(d!==null){const tick=el('span',undefined,'meter-tick');tick.style.left=pct(d,total)+'%';track.append(tick);}
  row.append(head,track);
  if(d!==null)row.append(el('span',behind?`예상 ${pct(d,total)}% / ${d-n}건 뒤처짐`:`예상 ${pct(d,total)}% / 일정대로`,'grow-note'+(behind?' is-behind':'')));
  row.setAttribute('aria-label',`${g} 완료 ${n}/${total}건${d!==null?`, 기준일까지 예상 ${d}건`:''}, 작업 목록 거르기`);
  row.addEventListener('click',()=>setFilter('group',g));
  $('groups').append(row);
 }
 if(!selected.length)$('groups').append(el('p','선택한 프로젝트에 데이터가 없습니다.','empty'));

 // Table, with the chart filter as a removable chip.
 const shown=filter.key?selected.filter(r=>r[filter.key]===filter.value&&(!filter.project||r.project===filter.project)):selected;
 $('tasks').replaceChildren();
 for(const r of shown.slice(0,200)){
  const tr=el('tr');
  const sched=!validDate?'기준일 확인':isDone(r)?'완료':late(r)?`${lateDays(r)}일 지연`:soon(r)?'7일 안 마감':'여유';
  const cells=[[r.id,'mono'],[r.title,'title'],[r.project],[r.group],[r.owner],[null,'chip-cell'],[r.start,'num'],[r.due,'num'],[sched,'sched'+(late(r)?' is-late':soon(r)?' is-soon':'')]];
  for(const [v,cls] of cells){const td=el('td',v,cls);if(cls==='chip-cell')td.append(el('span',labels[r.status],'chip chip--'+r.status));tr.append(td);}
  $('tasks').append(tr);
 }
 if(!shown.length){const tr=el('tr'),td=el('td','조건에 맞는 작업이 없습니다.','empty');td.colSpan=9;tr.append(td);$('tasks').append(tr);}
 const limit=$('limit');limit.replaceChildren();
 if(filter.key){const c=el('button',undefined,'filter-chip');c.type='button';const what=filter.key==='status'?`${filter.project} / ${labels[filter.value]}`:filter.value;c.append(el('span',what),el('span','×','x'));c.setAttribute('aria-label',`${what} 거르기 해제`);c.addEventListener('click',()=>{filter=NO_FILTER;render();});limit.append(c);}
 limit.append(el('span',`${shown.length}건${shown.length>200?' / 최대 200건 표시':''}`));
 $('caption').textContent=sources[mode]==='demo'?'시연용 가상 작업 목록':'불러온 CSV 작업 목록';
}

function setMode(next){uploadVersion++;mode=next;filter=NO_FILTER;for(const b of root.querySelectorAll('[role=tab]')){const active=b.dataset.mode===mode;b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1;}$('panel').setAttribute('aria-labelledby','db-'+mode);$('file').value='';setValidation('');fillProjects();render();}
function setValidation(text,kind){const v=$('validation');v.textContent=text;v.className=kind?'is-'+kind:'';v.hidden=!text;}
for(const b of root.querySelectorAll('[role=tab]')){b.addEventListener('click',()=>setMode(b.dataset.mode));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'jira':e.key==='End'?'custom':mode==='jira'?'custom':'jira';setMode(next);$(next).focus();}});}
$('project').addEventListener('change',()=>{filter=NO_FILTER;render();});$('date').addEventListener('input',render);
$('reset').addEventListener('click',()=>{uploadVersion++;data[mode]=structuredClone(demo[mode]);sources[mode]='demo';filter=NO_FILTER;$('file').value='';$('date').value=DEFAULT_DATE;setValidation('시연 데이터로 되돌렸습니다.','ok');render();});
function parseCSV(text){text=text.replace(/^﻿/,'');const out=[];let row=[],field='',state='plain';
for(let i=0;i<text.length;i++){const c=text[i];if(state==='quoted'){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else state='closed';}else field+=c;continue;}
if(c==='"'){if(state!=='plain'||field)throw Error('따옴표 형식 오류');state='quoted';}else if(c===','||c==='\n'||c==='\r'){row.push(field);field='';state='plain';if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;out.push(row);row=[];}}else{if(state==='closed')throw Error('닫는 따옴표 뒤에 구분자가 필요합니다.');field+=c;}}
if(state==='quoted')throw Error('닫히지 않은 따옴표');if(field||row.length||state==='closed'){row.push(field);out.push(row);}return out.filter(r=>r.some(v=>v.trim()));}
$('file').addEventListener('change',async()=>{const file=$('file').files[0];if(!file)return;const version=++uploadVersion,uploadMode=mode;try{if(file.size>1024*1024)throw Error('파일 크기는 최대 1MB입니다.');const text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());if(version!==uploadVersion)return;const csv=parseCSV(text);if(csv.length<2)throw Error('헤더와 최소 1행이 필요합니다.');if(csv.length>5001)throw Error('최대 5,000행입니다.');const head=csv.shift().map(v=>v.trim());if(head.length!==8||new Set(head).size!==8||headers.some(h=>!head.includes(h)))throw Error('필수 열 8개를 중복 없이 넣어 주세요: '+headers.join(', '));const ids=new Set(),errors=[],result=[];
 csv.forEach((cells,i)=>{if(cells.length!==8){errors.push(`${i+2}행: 열 개수 오류`);return;}const r=Object.fromEntries(head.map((h,j)=>[h,cells[j].trim()]));const issues=[];if(headers.some(h=>!r[h]))issues.push('필수값 누락');if(Object.values(r).some(v=>v.length>300))issues.push('셀은 최대 300자');if(ids.has(r.id))issues.push('ID 중복');ids.add(r.id);if(!projects[uploadMode].includes(r.project))issues.push('현재 탭에 없는 프로젝트');if(!Object.hasOwn(labels,r.status))issues.push('잘못된 상태');if(!dateValid(r.start)||!dateValid(r.due))issues.push('날짜 형식/실제 날짜 확인');else if(r.start>r.due)issues.push('시작일이 종료일 이후');if(issues.length)errors.push(`${i+2}행: ${issues.join(', ')}`);result.push(r);});
 if(errors.length)throw Error(`${errors.length}행 오류\n`+errors.slice(0,12).join('\n')+(errors.length>12?'\n나머지 오류는 수정 후 다시 확인하세요.':''));data[uploadMode]=result;sources[uploadMode]='upload';filter=NO_FILTER;setValidation(`${result.length}행을 검증해서 반영했습니다.`,'ok');render();
}catch(e){if(version!==uploadVersion)return;setValidation('불러오지 못했습니다. 기존 데이터를 유지합니다.\n'+(e instanceof TypeError?'UTF-8 인코딩 파일인지 확인하세요.':e.message),'error');}});
$('template').addEventListener('click',()=>{const quote=v=>'"'+String(v).replaceAll('"','""')+'"';const csv='﻿'+[headers,...demo[mode].map(r=>headers.map(h=>r[h]))].map(row=>row.map(quote).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=el('a');a.href=url;a.download=`${mode}-dashboard-demo.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
fillProjects();setValidation('');render();
})();
