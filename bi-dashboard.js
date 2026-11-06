/* Local SVG visualization of a single synthetic dataset, not a Power BI embed. */
(() => {
 'use strict';
 const root=document.querySelector('[data-bi-dashboard]'),model=window.PortfolioBI;
 if(!root||!model)return;
 const period=root.querySelector('#bi-period'),service=root.querySelector('#bi-service');
 const tooltip=root.querySelector('.bi-tooltip');
 const format=new Intl.NumberFormat('ko-KR');
 const colors=['#294c75','#678eae','#8b8172','#688d88'];
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const short=n=>n>=1000?`${Number((n/1000).toFixed(1))}천`:String(n);
 const tip=s=>`tabindex="0" role="img" aria-label="${esc(s)}" data-tooltip="${esc(s)}"`;
 const maxValue=values=>{const v=Math.max(1,...values);return Math.ceil(v/4)*4;};
 const label=(x,y,text,anchor='middle',extra='')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" ${extra}>${esc(text)}</text>`;
 function svg(container,title,width,height,body){container.innerHTML=`<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(title)}">${body}</svg>`;}
 function grid(w,h,max,pad){let body='';for(let i=0;i<=4;i++){const y=h-pad.bottom-(h-pad.top-pad.bottom)*i/4;body+=`<line class="bi-gridline" x1="${pad.left}" y1="${y}" x2="${w-pad.right}" y2="${y}"/>`+label(pad.left-8,y+4,short(max*i/4),'end');}return body;}
 function lineChart(container,data){
  const w=Math.max(280,Math.floor(container.clientWidth)),h=250,pad={left:48,right:22,top:26,bottom:38};
  const max=maxValue(data.map(d=>d.value)),plotW=w-pad.left-pad.right,plotH=h-pad.top-pad.bottom;
  const point=(d,i)=>({x:data.length===1?pad.left+plotW/2:pad.left+plotW*i/(data.length-1),y:h-pad.bottom-plotH*d.value/max});
  let body=grid(w,h,max,pad);const points=data.map(point);
  if(points.length>1)body+=`<path d="${points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ')}" fill="none" stroke="${colors[0]}" stroke-width="2.5"/>`;
  data.forEach((d,i)=>{const p=points[i],text=`${d.month.replace('-','.')} / ${format.format(d.value)}건`;body+=`<g ${tip(text)}><circle cx="${p.x}" cy="${p.y}" r="13" fill="transparent"/><circle cx="${p.x}" cy="${p.y}" r="4" fill="${colors[0]}"/><title>${esc(text)}</title></g>`+label(p.x,h-12,`${Number(d.month.slice(-2))}월`);});
  svg(container,'월별 서비스 이용 건수',w,h,body);
 }
 function barChart(container,data){
  const w=Math.max(280,Math.floor(container.clientWidth)),h=250,left=68,right=60,top=32,row=46,max=maxValue(data.map(d=>d.value));let body='';
  data.forEach((d,i)=>{const y=top+i*row,barW=(w-left-right)*d.value/max,text=`${d.label} / ${format.format(d.value)}건`;
   body+=label(left-10,y+17,d.label,'end')+`<g ${tip(text)}><rect x="${left}" y="${y}" width="${w-left-right}" height="26" fill="#eef2f6"/><rect x="${left}" y="${y}" width="${barW}" height="26" fill="${colors[model.services.indexOf(d.id)]}"/><title>${esc(text)}</title></g>`+label(left+barW+7,y+17,format.format(d.value),'start');});
  svg(container,'서비스 유형별 이용 건수',w,h,body);
 }
 function donut(container,data,total){
  const w=Math.max(280,Math.floor(container.clientWidth)),h=240,cx=w/2,cy=116,r=74,length=2*Math.PI*r;let offset=0,body=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#edf1f5" stroke-width="27"/>`;
  data.forEach((d,i)=>{if(!d.count)return;const size=d.percent/100*length,text=`${d.label} / ${format.format(d.count)}명 / ${d.displayPercent.toFixed(1)}%`;body+=`<circle ${tip(text)} cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[i]}" stroke-width="27" stroke-dasharray="${size} ${length-size}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"><title>${esc(text)}</title></circle>`;offset+=size;});
  body+=label(cx,cy-3,format.format(total),'middle','class="bi-donut-total"')+label(cx,cy+20,'활성 고객');svg(container,'중복되지 않는 고객 유형별 활성 고객 구성',w,h,body);
  root.querySelector('[data-bi-legend]').innerHTML=data.map((d,i)=>`<li><span class="bi-key" style="background:${colors[i]}"></span><span>${d.label}</span><strong>${d.displayPercent.toFixed(1)}%</strong><small>${format.format(d.count)}명</small></li>`).join('');
 }
 function grouped(container,data){
  const w=Math.max(280,Math.floor(container.clientWidth)),h=250,pad={left:48,right:16,top:26,bottom:38},max=maxValue(data.flatMap(d=>[d.previous,d.current])),plotW=w-pad.left-pad.right,plotH=h-pad.top-pad.bottom,step=plotW/data.length,bw=Math.min(25,step*.25);let body=grid(w,h,max,pad);
  data.forEach((d,i)=>{const center=pad.left+step*(i+.5);[['previous','전월','#7b8ea5'],['current','당월',colors[0]]].forEach(([key,name,color],j)=>{const bh=plotH*d[key]/max,text=`${d.label} ${name} / ${format.format(d[key])}건`;body+=`<rect ${tip(text)} x="${center+(j?3:-bw-3)}" y="${h-pad.bottom-bh}" width="${bw}" height="${bh}" fill="${color}"><title>${esc(text)}</title></rect>`;});body+=label(center,h-12,d.label);});svg(container,'전월과 당월 서비스별 이용 건수 비교',w,h,body);
 }
 function table(id,heads,rows){root.querySelector(id).innerHTML=`<thead><tr>${heads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((v,i)=>i?`<td>${esc(v)}</td>`:`<th scope="row">${esc(v)}</th>`).join('')}</tr>`).join('')}</tbody>`;}
 function render(){
  const d=model.aggregate(period.value,service.value);root.dataset.period=period.value;root.dataset.service=service.value;
  root.querySelector('[data-bi-range]').textContent=`가상 데이터 기간: ${d.periodLabel}`;
  root.querySelector('[data-bi-total]').textContent=format.format(d.total);root.querySelector('[data-bi-customers]').textContent=format.format(d.customers);root.querySelector('[data-bi-services]').textContent=d.serviceCount;
  root.querySelector('[data-bi-change]').textContent=d.change===null?'—':`${d.change>0?'+':''}${d.change.toFixed(1)}%`;
  const month=m=>`${Number(m.slice(-2))}월`;
  root.querySelector('[data-bi-change-period]').textContent=`${month(d.currentMonth)} 대 ${month(d.previousMonth)} 이용 건수`;
  root.querySelector('[data-bi-compare-period]').textContent=`전월 ${d.previousMonth.replace('-','.')} / 당월 ${d.currentMonth.replace('-','.')}`;
  lineChart(root.querySelector('[data-chart="trend"]'),d.trend);barChart(root.querySelector('[data-chart="services"]'),d.byService);donut(root.querySelector('[data-chart="customers"]'),d.byType,d.customers);grouped(root.querySelector('[data-chart="comparison"]'),d.comparison);
  table('#bi-trend-table',['월','이용 건수'],d.trend.map(x=>[x.month.replace('-','.'),format.format(x.value)]));
  table('#bi-service-table',['서비스','이용 건수'],d.byService.map(x=>[x.label,format.format(x.value)]));
  table('#bi-customer-table',['고객 유형','활성 고객','구성 비율'],d.byType.map(x=>[x.label,format.format(x.count),`${x.displayPercent.toFixed(1)}%`]));
  table('#bi-comparison-table',['서비스','전월 이용 건수','당월 이용 건수'],d.comparison.map(x=>[x.label,format.format(x.previous),format.format(x.current)]));
  root.querySelector('[data-bi-status]').textContent=`${d.periodLabel}, ${service.value==='all'?'전체 서비스':`서비스 ${service.value}`}의 지표와 차트를 갱신했습니다.`;
  tooltip.hidden=true;
 }
 root.querySelector('.bi-filters').addEventListener('submit',event=>event.preventDefault());
 period.addEventListener('change',render);service.addEventListener('change',render);
 root.querySelector('[data-bi-reset]').addEventListener('click',()=>{period.value='half';service.value='all';render();});
 function showTooltip(e){const target=e.target.closest('[data-tooltip]');if(!target)return;tooltip.textContent=target.dataset.tooltip;tooltip.hidden=false;const rect=target.getBoundingClientRect();const x=e.type==='focusin'?rect.left:e.clientX;const y=e.type==='focusin'?rect.top:e.clientY;tooltip.style.left=`${Math.max(8,Math.min(innerWidth-245,x+10))}px`;tooltip.style.top=`${Math.max(8,Math.min(innerHeight-70,y+12))}px`;}
 root.addEventListener('pointerover',showTooltip);root.addEventListener('focusin',showTooltip);root.addEventListener('pointerout',()=>{tooltip.hidden=true;});root.addEventListener('focusout',()=>{tooltip.hidden=true;});
 let frame;const resize=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(render);};
 if('ResizeObserver'in window)new ResizeObserver(resize).observe(root.querySelector('.bi-chart-grid'));else addEventListener('resize',resize);
 root.querySelector('.bi-live').hidden=false;root.querySelector('.bi-fallback').hidden=true;render();
})();
