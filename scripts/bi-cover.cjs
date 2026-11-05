const fs=require('fs'),path=require('path');
module.exports=function renderBICover(){
 const d=require('../bi-data.js').aggregate();
 const max=Math.max(...d.trend.map(x=>x.value)),barMax=Math.max(...d.byService.map(x=>x.value));
 const points=d.trend.map((x,i)=>`${130+i*115},${370-x.value/max*180}`).join(' ');
 const bars=d.byService.map((x,i)=>`<rect x="${850+i*65}" y="${365-x.value/barMax*150}" width="32" height="${x.value/barMax*150}" fill="${['#7e9dbb','#5b7e9d','#90aca9','#b6c4d0'][i]}"/>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><rect width="1200" height="720" fill="#13243b"/><g font-family="sans-serif" fill="#e4edf6"><text x="600" y="92" text-anchor="middle" font-size="28">BI Dashboard</text><text x="600" y="134" text-anchor="middle" font-size="19" fill="#afbed0">웹 시각화 예시 · 가상 데이터</text></g><path d="M110 210H780M110 290H780M110 370H780" stroke="#304258" fill="none"/><polyline points="${points}" stroke="#b5cee5" stroke-width="5" fill="none"/><g fill="#d1e2ef">${d.trend.map((x,i)=>`<circle cx="${130+i*115}" cy="${370-x.value/max*180}" r="6"/>`).join('')}</g>${bars}<path d="M825 380h300" stroke="#72859a"/><text x="90" y="488" font-family="sans-serif" fill="#aebed0" font-size="21">MySQL · Excel · Power BI</text></svg>`;
 fs.writeFileSync(path.join(__dirname,'../assets/images/projects/the-k-cover.svg'),svg);
};
