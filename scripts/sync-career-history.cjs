const fs=require('fs'),path=require('path');
module.exports=function syncHistory(){
 const root=path.resolve(__dirname,'..'),file=path.join(root,'content/portfolio-source.html');
 const data=JSON.parse(fs.readFileSync(path.join(root,'content/career-history.json'),'utf8'));
 const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 const companies=[...data.companies].sort((a,b)=>b.start.localeCompare(a.start));
 const projects=[...data.projects].sort((a,b)=>b.end.localeCompare(a.end)||b.start.localeCompare(a.start));
 const company=id=>companies.find(c=>c.id===id);
 const date=value=>`<time datetime="${value}"${value.length===10?` title="${value.replaceAll('-','.')}">`:'>'}${value.slice(0,7).replaceAll('-','.')}</time>`;
 const period=p=>date(p.start)+' ~ '+date(p.end);
 const link=p=>`${p.file}#${p.section}`;
 const projectBlock=p=>`<div class="employment-project" id="${p.anchor}"><h4>${esc(p.name)}</h4><p class="employment-project-role">${esc(p.role)}</p><p class="career-period">참여 ${period(p)}</p><p class="career-scope">${esc(p.summary)}</p><a class="career-project-link" href="${link(p)}">${esc(p.name)} · 상세 사례</a></div>`;
 const legacy=c=>c.id==='bloomix'?'<span id="career-service" aria-hidden="true"></span><span id="career-service-heading" aria-hidden="true"></span>':c.id==='nerd4'?'<span id="career-automation" aria-hidden="true"></span><span id="career-automation-heading" aria-hidden="true"></span>':'';
 const career=`<section class="career content-career career-polish career-latest" id="career" aria-labelledby="career-heading"><header class="content-section-heading"><p class="eyebrow">Career</p><h2 id="career-heading">회사별 경력</h2><p class="career-intro">재직 기간과 프로젝트 참여 기간을 구분해 정리했습니다. 개발과 QA, 라이브 운영, 서비스·사업 기획을 경험했습니다.</p></header><ol class="career-records" aria-label="회사별 재직 이력">${companies.map(c=>`<li class="career-entry employment-entry" id="company-${c.id}" data-company="${c.id}"><div class="employment-company"><h3>${esc(c.name)}</h3><p class="employment-role">${esc(c.role)}</p><p class="career-period">재직 ${period(c)}</p></div><div class="career-entry-body">${legacy(c)}${projects.filter(p=>p.company===c.id).map(projectBlock).join('')}</div></li>`).join('')}</ol><p class="career-record-note">재직 월이 확인되지 않은 회사는 연도로 표기했습니다. 로드컴플릿의 프로젝트 참여 기간은 일부 겹칩니다.</p><a class="career-project-link" href="projects.html#project-history">프로젝트 참여 이력 보기</a></section>`;
 const history=`<section class="project-participation" id="project-history" aria-labelledby="project-history-heading"><header class="participation-heading"><div><p class="eyebrow">Project History</p><h2 id="project-history-heading">프로젝트 참여 이력</h2></div><a href="#selected-heading">주요 사례로 이동</a></header><ol class="participation-records" aria-label="프로젝트 참여 이력">${projects.map(p=>`<li class="participation-entry" id="history-${p.id}" data-project="${p.id}"><div class="participation-project"><h3>${esc(p.name)}</h3><p class="participation-company">${esc(company(p.company).name)}</p><p class="participation-role">${esc(p.role)}</p></div><div class="participation-description"><p class="career-period">참여 ${period(p)}</p><p>${esc(p.summary)}</p><a href="${link(p)}">${esc(p.name)} · 상세 사례</a></div></li>`).join('')}</ol></section>`;
 let source=fs.readFileSync(file,'utf8');
 function replaceElement(text,id,html){const m=new RegExp('<([a-z][a-z0-9]*)\\b[^>]*\\bid="'+id+'"[^>]*>','i').exec(text);if(!m)throw Error(id);const tags=new RegExp('<\\/?'+m[1]+'\\b[^>]*>','gi');tags.lastIndex=m.index;let depth=0,t;while(t=tags.exec(text)){depth+=t[0].startsWith('</')?-1:1;if(!depth)return text.slice(0,m.index)+html+text.slice(tags.lastIndex);}throw Error(id);}
 source=replaceElement(source,'career',career);
 if(source.includes('id="project-history"'))source=replaceElement(source,'project-history',history);
 else {const pos=source.search(/<section\b[^>]*\bid="projects"[^>]*>/);if(pos<0)throw Error('projects');source=source.slice(0,pos)+history+'\n'+source.slice(pos);}
 for(const p of projects){
  const m=new RegExp('<article\\b[^>]*\\bid="'+p.section+'"[^>]*>').exec(source);if(!m)throw Error(p.section);
  let block=source.slice(m.index,source.indexOf('</article>',m.index)+10);
  const meta=`<p class="history-detail-meta" data-history-project="${p.id}">${esc(company(p.company).name)} · ${period(p)} · 프로젝트 참여 기간</p>`;
  if(p.id==='talesrunner'||p.id==='dme'){
   block=block.replace(/<p class="history-detail-meta"[^>]*>[\s\S]*?<\/p>/g,'');
   block=block.replace(/(<header\b[^>]*>[\s\S]*?<p class="eyebrow">[\s\S]*?<\/p>)/,m=>m+meta);
  }else if(p.id==='undecember')block=block.replace(/<p class="ud-period-note">[\s\S]*?<\/p>/,`<p class="ud-period-note">${esc(company(p.company).name)} · ${period(p)} · 프로젝트 참여 기간</p>`);
  else if(p.id==='slime')block=block.replace(/<p class="sl-period">[\s\S]*?<\/p>/,`<p class="sl-period">${period(p)} · 프로젝트 참여 기간</p>`);
  else if(p.id==='neon')block=block.replace(/(<dt>기간<\/dt><dd>)[\s\S]*?(<small>프로젝트 참여 기간<\/small>)/,(_,a,b)=>a+period(p)+b);
  else if(p.id==='goddess'){
   block=block.replace(/<p class="history-detail-meta"[^>]*>[\s\S]*?<\/p>/g,'').replace(/<p class="history-detail-role">[\s\S]*?<\/p>/g,'');
   block=block.replace(/(<h3>가디스 오더<\/h3>)/,m=>m+`<p class="history-detail-role">${esc(p.role)}</p>`+meta);
  }
  source=replaceElement(source,p.section,block);
 }
 if(source!==fs.readFileSync(file,'utf8'))fs.writeFileSync(file,source);
};
