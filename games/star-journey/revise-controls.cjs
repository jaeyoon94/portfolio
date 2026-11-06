const fs=require('fs');
const p='dist/index.html';let html=fs.readFileSync(p,'utf8');
html=html.replace('E로 가까운 동료나 시설과 상호작용하세요.','Space로 가까운 동료나 시설과 상호작용하세요. 마우스 클릭은 메뉴와 대상 선택에 사용합니다.').replaceAll('<kbd>E</kbd>','<kbd>Space</kbd>').replace('<button id="interactButton">상호작용</button>','<small>눌러 진행</small>').replace('동료에게 다가가 E를 눌러 인사해 보세요.','WASD·방향키로 다가가 Space를 눌러 인사해 보세요.').replace('바닥 클릭으로 이동','마우스는 메뉴 선택').replace('이동과 짧은 대화는 시간이 흐르지 않아요.','이동: WASD·방향키 / 상호작용: Space');
fs.writeFileSync(p,html);
const a='dist/app.js';let app=fs.readFileSync(a,'utf8').replaceAll('대화하기 · 시간 소모 없음','사무실에서 위치 확인');fs.writeFileSync(a,app);
