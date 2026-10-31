const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function render(mode='projects'){
 const history=JSON.parse(fs.readFileSync(path.join(root,'content/career-history.json'),'utf8'));
 const config=JSON.parse(fs.readFileSync(path.join(root,'content/project-covers.json'),'utf8'));
 const order=mode==='home'?config.homeOrder:config.projectsOrder;
 const heading=mode==='home'?'home-projects-heading':'selected-heading';
 const date=value=>`<time datetime="${value}"${value.length===10?` title="${value.replaceAll('-','.')}">`:'>'}${value.slice(0,7).replaceAll('-','.')}</time>`;
 const covers=order.map((id,index)=>{
  const project=history.projects.find(p=>p.id===id),item=config.items[id];
  if(!project||!item)throw Error('Unknown cover project '+id);
  const company=history.companies.find(c=>c.id===project.company);
  const media=item.image;
  if(media.src&&(!media.src.startsWith('assets/images/projects/')||media.src.includes('..')||!fs.existsSync(path.join(root,media.src))))throw Error('Cover source must be an existing local project asset: '+id);
  const title='selected-'+id;
  const align=item.textAlignment||{};
  const alignment=key=>['left','center','right'].includes(align[key])?align[key]:'left';
  const alignStyles=['desktop','tablet','mobile'].map(key=>`--cover-text-align-${key}:${alignment(key)};--cover-content-align-${key}:${{left:'flex-start',center:'center',right:'flex-end'}[alignment(key)]}`).join(';');
  const position=`--cover-position-desktop:${escape(media.positionDesktop)};--cover-position-tablet:${escape(media.positionTablet)};--cover-position-mobile:${escape(media.positionMobile)};--cover-gradient-middle:${Number(item.gradientMiddle)};--cover-gradient-bottom:${Number(item.gradientBottom)};${alignStyles}`;
  const state=media.src?'has-image':'is-placeholder';
  const visual=media.src?`<img class="project-cover__image" src="${escape(media.src)}" alt="${escape(media.alt)}" loading="lazy" decoding="async">`:'<span class="project-cover__placeholder" aria-hidden="true">PROJECT IMAGE</span>';
  return `<a class="project-cover project-cover--${index===0?'wide':index===1?'medium':'secondary'} ${state}" data-cover-project="${id}" href="${project.file}#${project.section}" aria-labelledby="${title}" aria-describedby="cover-role-${id} cover-context-${id} cover-meta-${id}" style="${position}"><div class="project-cover__media"${media.src?'':' aria-hidden="true"'}>${visual}</div><div class="project-cover__gradient" aria-hidden="true"></div><div class="project-cover__content"><h3 class="project-cover__title" id="${title}">${escape(project.name)}</h3><p class="project-cover__role" id="cover-role-${id}">${escape(project.role)}</p><p class="project-cover__context" id="cover-context-${id}">${escape(item.context)}</p><p class="project-cover__meta" id="cover-meta-${id}"><span>${escape(company.name)}</span><span>${date(project.start)} ~ ${date(project.end)}</span></p><span class="project-cover__cta" aria-hidden="true">View Project <span class="project-cover__arrow">→</span></span></div></a>`;
 }).join('');
 const additional=mode==='home'?'<a class="all-projects" href="projects.html">모든 프로젝트 보기 →</a>':'<div class="project-showcase__additional"><p id="selected-goddess"><a href="goddess-order.html#project-goddess">가디스 오더 · 개발 PM·QA 사례</a></p><p>Jira 워크플로우 개선 · 단계별 담당자 지정</p></div>';
 return `<section class="${mode==='home'?'hub-featured ':''}project-showcase" id="projects" aria-labelledby="${heading}"><div class="project-showcase__inner"><header class="project-showcase__heading"><div><p class="eyebrow">${mode==='home'?'Featured Work':'Selected Projects'}</p><h2 id="${heading}">문제를 다룬 방식들</h2></div><p>일정, 협업, 라이브 이슈.<br>프로젝트마다 다른 문제를 어떻게 정리했는지 소개합니다.</p></header><div class="project-cover-grid">${covers}</div>${additional}</div></section>`;
}
function sync(){
 const file=path.join(root,'content/portfolio-source.html');let source=fs.readFileSync(file,'utf8');
 const m=/<section\b[^>]*\bid="projects"[^>]*>/.exec(source);if(!m)throw Error('Missing Projects section');
 const tags=/<\/?section\b[^>]*>/g;tags.lastIndex=m.index;let depth=0,t;
 while(t=tags.exec(source)){depth+=t[0].startsWith('</')?-1:1;if(!depth){const next=source.slice(0,m.index)+render('projects')+source.slice(tags.lastIndex);if(next!==source)fs.writeFileSync(file,next);return;}}
 throw Error('Unclosed Projects section');
}
module.exports={render,sync};
