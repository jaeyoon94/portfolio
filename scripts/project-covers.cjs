const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const imageAssets=require('./image-assets.cjs');
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
  return `<a class="project-cover project-cover--${index===0?'wide':index===1?'medium':'secondary'} ${state}" data-cover-project="${id}" href="${project.file}" aria-labelledby="${title}" aria-describedby="cover-role-${id} cover-context-${id} cover-meta-${id}" style="${position}"><div class="project-cover__media"${media.src?'':' aria-hidden="true"'}>${visual}</div><div class="project-cover__gradient" aria-hidden="true"></div><div class="project-cover__content"><h3 class="project-cover__title" id="${title}">${escape(project.name)}</h3><p class="project-cover__role" id="cover-role-${id}">${escape(project.role)}</p><p class="project-cover__context" id="cover-context-${id}">${escape(item.context)}</p><p class="project-cover__meta" id="cover-meta-${id}"><span>${escape(company.name)}</span><span>${date(project.start)} ~ ${date(project.end)}</span></p><span class="project-cover__cta" aria-hidden="true">상세 사례 보기 <span class="project-cover__arrow">→</span></span></div></a>`;
 }).join('');
 const selection=mode==='home'?`<div class="project-selection" data-project-selection><div class="project-selection__preview" id="home-project-preview">${covers}</div><div class="project-selection__list" aria-label="프로젝트 선택">${order.map((id,index)=>{const project=history.projects.find(p=>p.id===id);return `<button class="project-selection__item" type="button" data-select-project="${id}" aria-controls="home-project-preview" aria-pressed="${index===0}"><span class="project-selection__number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><span><strong>${escape(project.name)}</strong><small>${escape(project.role)}</small></span><span class="project-selection__arrow" aria-hidden="true">↗</span></button>`;}).join('')}</div></div>`:`<div class="project-cover-grid">${covers}</div>`;
 const additional=mode==='home'?'<a class="all-projects" href="projects.html">모든 프로젝트 보기 →</a>':config.projectsOrder.includes('goddess')?'':'<div class="project-showcase__additional"><p id="selected-goddess"><a href="goddess-order.html">가디스 오더 · 개발 PM·QA 사례</a></p><p>Jira 워크플로우 개선 · 단계별 담당자 지정</p></div>';
 return imageAssets(`<section class="${mode==='home'?'hub-featured ':''}project-showcase" id="projects" aria-labelledby="${heading}"><div class="project-showcase__inner"><header class="project-showcase__heading"><div><p class="eyebrow">${mode==='home'?'Featured Work':'Selected Projects'}</p><h2 id="${heading}">주요 프로젝트</h2></div><p>개발, 라이브 운영, 서비스 기획.<br>프로젝트별 담당 업무와 사례를 확인할 수 있습니다.</p></header>${selection}${additional}</div></section>`);
}
function sync(){
 const file=path.join(root,'content/portfolio-source.html');let source=fs.readFileSync(file,'utf8');
 const m=/<section\b[^>]*\bid="projects"[^>]*>/.exec(source);if(!m)throw Error('Missing Projects section');
 const tags=/<\/?section\b[^>]*>/g;tags.lastIndex=m.index;let depth=0,t;
 while(t=tags.exec(source)){depth+=t[0].startsWith('</')?-1:1;if(!depth){const next=source.slice(0,m.index)+render('projects')+source.slice(tags.lastIndex);if(next!==source)fs.writeFileSync(file,next);return;}}
 throw Error('Unclosed Projects section');
}
module.exports={render,sync};
