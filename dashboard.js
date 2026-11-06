(() => {
'use strict';
const root=document.getElementById('dashboard');if(!root)return;
const $=id=>document.getElementById('db-'+id);
const projects={jira:['Project DME','언디셈버','레전드 오브 슬라임'],custom:['프로젝트 네온','테일즈런너']};
const experience={'Project DME':['Jira 사용 · 자동화 및 데이터 연동 경험','project-dme.html'],'언디셈버':['Jira 사용 · 일정 및 빌드 관리 경험','undecember.html'],'레전드 오브 슬라임':['Jira 사용 · 개발 일정과 론칭 준비 경험','legend-of-slime.html'],'프로젝트 네온':['Jira 미사용 · 개발 일정·리소스·회의 운영 경험','project-neon.html'],'테일즈런너':['Jira 미사용 · 라이브 운영·정책 및 협업 경험','tales-runner.html']};
const headers=['id','project','group','title','owner','status','start','due'];
const labels={todo:'예정',doing:'진행',done:'완료',blocked:'차단'};
const demo={};for(const [mode,names] of Object.entries(projects))demo[mode]=names.flatMap((project,p)=>Array.from({length:6+p},(_,i)=>({id:`${mode.toUpperCase()}-${p+1}-${i+1}`,project,group:(mode==='jira'?['기능 개발','QA','론칭 준비']:project==='테일즈런너'?['운영 현안','정책 검토','행사 준비']:['개발 일정','리소스','Action Item'])[i%3],title:`시연 작업 ${i+1}`,owner:`가상 담당자 ${i%3+1}`,status:['done','doing','todo','blocked','done','doing','done','todo'][(i+p)%8],start:'2026-10-20',due:`2026-11-${String(1+i*2).padStart(2,'0')}`})));
let mode='jira',data=structuredClone(demo),sources={jira:'demo',custom:'demo'},uploadVersion=0;
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function dateValid(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T00:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===s;}
function rows(){return data[mode].filter(r=>$('project').value==='all'||r.project===$('project').value);}
function fillProjects(){const select=$('project');select.replaceChildren();for(const [value,name] of [['all','전체 프로젝트'],...projects[mode].map(p=>[p,p])]){const o=el('option',name);o.value=value;select.append(o);}}
function bar(target,label,count,total,suffix){const box=el('div',undefined,'db-bar');const line=el('div',undefined,'db-bar-label');line.append(el('span',label),el('span',suffix));const track=el('div',undefined,'db-track'),fill=el('div',undefined,'db-fill');fill.style.width=(total?count/total*100:0)+'%';track.append(fill);box.append(line,track);target.append(box);}
function render(){const selected=rows(),validDate=dateValid($('date').value),today=validDate?$('date').value:null,done=selected.filter(r=>r.status==='done').length,late=r=>today&&r.status!=='done'&&r.due<today;
$('source').textContent=sources[mode]==='demo'?'데모용 가상 데이터, 실제 프로젝트 성과가 아닙니다':`사용자 업로드 데이터 · ${data[mode].length}행 검증 완료 · 경력 성과로 확인되지 않은 자료`;
$('experience').replaceChildren();for(const name of projects[mode].filter(p=>$('project').value==='all'||p===$('project').value)){const p=el('p',`${name}: ${experience[name][0]} · `),a=el('a','실제 담당 업무 보기');a.href=experience[name][1];p.append(a);$('experience').append(p);}
$('kpis').replaceChildren();for(const [label,value] of [['전체 작업',selected.length],['완료율',selected.length?Math.round(done/selected.length*100)+'%':'—'],['지연 작업',validDate?selected.filter(late).length:'—'],['차단 작업',selected.filter(r=>r.status==='blocked').length]]){const k=el('div',undefined,'db-kpi');k.append(el('span',label),el('strong',String(value)));$('kpis').append(k);}
const soon=r=>today&&r.status!=='done'&&r.due>=today&&(Date.parse(r.due)-Date.parse(today))/86400000<=7;
$('projects').replaceChildren();
for(const name of projects[mode].filter(p=>$('project').value==='all'||p===$('project').value)){
 const items=selected.filter(r=>r.project===name),n=items.filter(r=>r.status==='done').length;
 const row=el('div',undefined,'db-project-row');row.append(el('h4',name),el('p',`${items.length}건 · 완료 ${n}건 · 지연 ${validDate?items.filter(late).length:'—'}건 · 차단 ${items.filter(r=>r.status==='blocked').length}건`));
 bar(row,'완료율',n,items.length,items.length?Math.round(n/items.length*100)+'%':'데이터 없음');$('projects').append(row);
}
const pending=selected.filter(r=>r.status!=='done').sort((a,b)=>a.due.localeCompare(b.due)||a.id.localeCompare(b.id));
$('schedule').replaceChildren();$('risks').replaceChildren();
for(const r of pending.slice(0,8)){const li=el('li');li.append(el('strong',`${r.project} · ${r.title}`),el('span',`${r.start} → ${r.due} · ${r.owner} · ${labels[r.status]}`));$('schedule').append(li);}
if(!pending.length)$('schedule').append(el('li','미완료 작업이 없습니다.'));
const risks=pending.filter(r=>r.status==='blocked'||late(r)||soon(r));
for(const r of risks.slice(0,8)){const reasons=[r.status==='blocked'?'차단':null,late(r)?'기한 경과':soon(r)?'7일 이내 마감':null].filter(Boolean);const li=el('li');li.append(el('strong',`${r.project} · ${r.title}`),el('span',`${reasons.join(' · ')} · ${r.owner} · ${r.due}`));$('risks').append(li);}
$('risks').append(el('li',validDate?`${risks.length}건 확인 대상 · 중복 작업은 한 번 집계 · 목록 최대 8건`:'일정 리스크를 확인하려면 유효한 기준일을 입력하세요.'));
$('groups').replaceChildren();$('status').replaceChildren();$('group-title').textContent=mode==='jira'?'Epic / 업무 영역별 완료율':'업무 영역별 완료율';
for(const group of [...new Set(selected.map(r=>r.group))]){const all=selected.filter(r=>r.group===group),n=all.filter(r=>r.status==='done').length;bar($('groups'),group,n,all.length,`${n}/${all.length} · ${Math.round(n/all.length*100)}%`);}
for(const [key,label] of Object.entries(labels)){const n=selected.filter(r=>r.status===key).length;bar($('status'),label,n,selected.length,`${n}건`);}
if(!selected.length)$('groups').append(el('p','선택한 프로젝트에 데이터가 없습니다.'));
$('tasks').replaceChildren();for(const r of selected.slice(0,200)){const tr=el('tr');for(const value of [r.id,r.project,r.group,r.title,r.owner,labels[r.status],r.due,validDate?(late(r)?'지연':r.status==='done'?'완료':'정상'):'기준일 확인'])tr.append(el('td',value));$('tasks').append(tr);}
$('caption').textContent=sources[mode]==='demo'?'시연용 가상 작업 목록':'사용자 CSV 작업 목록';$('limit').textContent=`${selected.length}건 집계 · 목록은 최대 200건 표시${validDate?'':' · 유효한 기준일을 입력하세요.'}`;
}
function setMode(next){uploadVersion++;mode=next;for(const b of root.querySelectorAll('[role=tab]')){const active=b.dataset.mode===mode;b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1;} $('panel').setAttribute('aria-labelledby','db-'+mode);$('file').value='';$('validation').textContent='업로드 대기 중';fillProjects();render();}
for(const b of root.querySelectorAll('[role=tab]')){b.addEventListener('click',()=>setMode(b.dataset.mode));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'jira':e.key==='End'?'custom':mode==='jira'?'custom':'jira';setMode(next);$(next).focus();}});}
$('project').addEventListener('change',render);$('date').addEventListener('input',render);
$('reset').addEventListener('click',()=>{uploadVersion++;data[mode]=structuredClone(demo[mode]);sources[mode]='demo';$('file').value='';$('validation').textContent='현재 탭의 데모 데이터를 복원했습니다.';render();});
function parseCSV(text){text=text.replace(/^\uFEFF/,'');const out=[];let row=[],field='',state='plain';
for(let i=0;i<text.length;i++){const c=text[i];if(state==='quoted'){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else state='closed';}else field+=c;continue;}
if(c==='"'){if(state!=='plain'||field)throw Error('따옴표 형식 오류');state='quoted';}else if(c===','||c==='\n'||c==='\r'){row.push(field);field='';state='plain';if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;out.push(row);row=[];}}else{if(state==='closed')throw Error('닫는 따옴표 뒤에 구분자가 필요합니다.');field+=c;}}
if(state==='quoted')throw Error('닫히지 않은 따옴표');if(field||row.length||state==='closed'){row.push(field);out.push(row);}return out.filter(r=>r.some(v=>v.trim()));}
$('file').addEventListener('change',async()=>{const file=$('file').files[0];if(!file)return;const version=++uploadVersion,uploadMode=mode;try{if(file.size>1024*1024)throw Error('파일 크기는 최대 1 MB입니다.');const text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());if(version!==uploadVersion)return;const csv=parseCSV(text);if(csv.length<2)throw Error('헤더와 최소 1행이 필요합니다.');if(csv.length>5001)throw Error('최대 5,000행입니다.');const head=csv.shift().map(v=>v.trim());if(head.length!==8||new Set(head).size!==8||headers.some(h=>!head.includes(h)))throw Error('필수 열 8개를 중복 없이 입력하세요: '+headers.join(', '));const ids=new Set(),errors=[],result=[];
 csv.forEach((cells,i)=>{if(cells.length!==8){errors.push(`${i+2}행: 열 개수 오류`);return;}const r=Object.fromEntries(head.map((h,j)=>[h,cells[j].trim()]));const issues=[];if(headers.some(h=>!r[h]))issues.push('필수값 누락');if(Object.values(r).some(v=>v.length>300))issues.push('셀은 최대 300자');if(ids.has(r.id))issues.push('ID 중복');ids.add(r.id);if(!projects[uploadMode].includes(r.project))issues.push('현재 탭에 없는 프로젝트');if(!Object.hasOwn(labels,r.status))issues.push('잘못된 상태');if(!dateValid(r.start)||!dateValid(r.due))issues.push('날짜 형식·실제 날짜 확인');else if(r.start>r.due)issues.push('시작일이 종료일 이후');if(issues.length)errors.push(`${i+2}행: ${issues.join(', ')}`);result.push(r);});
 if(errors.length)throw Error(`${errors.length}행 오류 · 기존 데이터 유지\n`+errors.slice(0,12).join('\n')+(errors.length>12?'\n나머지 오류는 수정 후 다시 확인하세요.':''));data[uploadMode]=result;sources[uploadMode]='upload';$('validation').className='db-success';$('validation').textContent=`${result.length}행 검증 완료 · 자동 집계 반영`;render();
}catch(e){if(version!==uploadVersion)return;$('validation').className='db-error';$('validation').style.whiteSpace='pre-line';$('validation').textContent='업로드 실패 · 기존 데이터 유지\n'+(e instanceof TypeError?'UTF-8 인코딩 파일인지 확인하세요.':e.message);}});
$('template').addEventListener('click',()=>{const quote=v=>'"'+String(v).replaceAll('"','""')+'"';const csv='\uFEFF'+[headers,...demo[mode].map(r=>headers.map(h=>r[h]))].map(row=>row.map(quote).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=el('a');a.href=url;a.download=`${mode}-dashboard-demo.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
fillProjects();render();
})();

