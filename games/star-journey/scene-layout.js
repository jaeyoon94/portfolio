// Furniture footprints follow the reference image. Artwork is rendered separately.
block(0,0,W,120);block(0,H-48,W,48);block(0,0,48,H);block(W-48,0,48,H);
for(const offset of [0,660]){
 add('deskCluster',288,240+offset,600,408);
 add('chair',528,144+offset,96,96);
 add('chair',192,312+offset,96,216);
 add('chair',888,312+offset,96,216);
 add('chair',528,648+offset,96,60);
}
add('meetingTable',1260,216,216,360);
for(const x of [1176,1476])for(const y of [312,456])add('stool',x,y,72,72);
add('coffee',1104,912,432,192);
add('demoBoard',1104,744,336,72);
add('plant',120,672,48,48);
add('plant',1728,216,48,48);
add('plant',1728,1176,48,48);
const npcs=[
 {name:'지민',role:'기획',team:'기획팀',x:234,y:430,seated:true,skin:1,face:'down',status:'업무 중',say:'“처음 30초 안에 편지를 배달하는 재미를 느끼게 해보면 어떨까요?”'},
 {name:'도윤',role:'프로그래밍',team:'개발팀',x:582,y:232,seated:true,skin:5,face:'down',status:'집중 업무',say:'“프로토타입에선 빠르게 검증하고, 공개 전에는 꼭 안정성을 챙겨요.”'},
 {name:'하린',role:'아트',team:'아트팀',x:930,y:430,seated:true,skin:3,face:'down',status:'업무 중',say:'“별빛을 조금 줄였더니 우체통이 더 잘 보여요. 예쁜 것과 잘 보이는 건 함께 가야죠.”'},
 {name:'수현',role:'QA',team:'QA팀',x:1212,y:366,seated:true,skin:2,face:'down',status:'간이회의 중',meeting:true,say:'“저장을 누른 뒤 바로 나갈 때만 편지가 사라져요. 재현 조건을 찾았어요!”'},
 {name:'유진',role:'사업·마케팅',team:'사업팀',x:1512,y:366,seated:true,skin:4,face:'down',status:'간이회의 중',meeting:true,say:'“우리 게임을 좋아할 사람에게, 실제로 할 수 있는 경험을 약속하자고요.”'}
];
const facilities=[
 {id:'desk',name:'내 작업 공간',x:720,y:744,action:()=>openTask('work'),kind:'work'},
 {id:'meeting',name:'회의 테이블 · 우선순위 정하기',x:1392,y:708,action:()=>openTask('manage'),kind:'manage'},
 {id:'qa',name:'테스트 자리 · 빌드 검토',x:720,y:1380,action:()=>openTask('collab'),kind:'collab'},
 {id:'lounge',name:'커피 코너 · 잠깐 쉬어가기',x:1608,y:1128,action:()=>$('#rest').click(),kind:'rest'},
 {id:'demo',name:'별빛 우체부 · 데모 확인',x:1224,y:864,action:()=>show('별빛 우체부 · 현재 빌드',`현재 완성도 ${state.quality}%, 안정성 ${state.stability}%. ${state.quality<50?'핵심 업무로 첫 플레이를 개선해 보세요.':'별 사이를 여행하는 작은 우체부의 모험이 완성되어 가요.'}`),kind:'demo'}
];

