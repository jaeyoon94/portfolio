/* Synthetic portfolio demonstration only; no client or banking data. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PortfolioBI=api;})(globalThis,()=>{
 'use strict';
 const services=['A','B','C','D'];
 const types=['신규 고객','기존 고객','재이용 고객'];
 const months=['2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'];
 const periods={half:{label:'2026.01 ~ 06',months:months.slice(1)},quarter:{label:'2026.04 ~ 06',months:months.slice(4)}};
 months.slice(1).forEach(month=>{periods[month]={label:month.replace('-','.'),months:[month]};});
 // Stable synthetic IDs make distinct-customer counts comparable across every filter.
 // Each customer belongs to one fixed, mutually exclusive demonstration segment.
 const records=[];
 for(let customer=1;customer<=1200;customer++)for(let month=0;month<months.length;month++)for(let service=0;service<services.length;service++){
  if((customer*7+month*5+service*3)%13>5+Math.floor(month/3))continue;
  if((customer*3+service*7)%17>=[15,13,11,9][service])continue;
  records.push(Object.freeze({customerId:`DEMO-${customer}`,month:months[month],service:services[service],customerType:types[customer%20<5?0:customer%20<16?1:2],uses:Math.max(1,Math.round((2+(customer*11+month*7+service*13)%24)*[1.35,1,.8,.55][service]))}));
 }
 Object.freeze(records);
 const sum=rows=>rows.reduce((total,row)=>total+row.uses,0);
 const distinct=rows=>new Set(rows.map(row=>row.customerId)).size;
 function aggregate(period='half',service='all'){
  const selected=periods[period]||periods.half;
  const allowed=row=>service==='all'||row.service===service;
  const rows=records.filter(row=>selected.months.includes(row.month)&&allowed(row));
  const last=selected.months[selected.months.length-1];
  const previous=months[months.indexOf(last)-1];
  const currentRows=records.filter(row=>row.month===last&&allowed(row));
  const previousRows=records.filter(row=>row.month===previous&&allowed(row));
  const currentTotal=sum(currentRows),previousTotal=sum(previousRows);
  const total=sum(rows),customers=distinct(rows);
  const trend=selected.months.map(month=>({month,value:sum(rows.filter(row=>row.month===month))}));
  const byService=services.map(id=>({id,label:`서비스 ${id}`,value:sum(rows.filter(row=>row.service===id))})).filter(item=>service==='all'||item.id===service);
  const byType=types.map(label=>{const count=distinct(rows.filter(row=>row.customerType===label));return {label,count,percent:customers?count/customers*100:0};});
  // Largest-remainder rounding keeps the displayed shares at 100.0%.
  const shares=byType.map((item,index)=>({index,units:Math.floor(item.percent*10),fraction:item.percent*10-Math.floor(item.percent*10)}));
  const remainder=customers?1000-shares.reduce((sum,item)=>sum+item.units,0):0;
  [...shares].sort((a,b)=>b.fraction-a.fraction||a.index-b.index).slice(0,remainder).forEach(item=>shares[item.index].units++);
  byType.forEach((item,index)=>{item.displayPercent=shares[index].units/10;});
  const comparison=services.filter(id=>service==='all'||id===service).map(id=>({id,label:`서비스 ${id}`,previous:sum(previousRows.filter(row=>row.service===id)),current:sum(currentRows.filter(row=>row.service===id))}));
  return {period,service,periodLabel:selected.label,total,customers,serviceCount:byService.filter(item=>item.value>0).length,change:previousTotal?(currentTotal-previousTotal)/previousTotal*100:null,currentMonth:last,previousMonth:previous,currentTotal,previousTotal,trend,byService,byType,comparison};
 }
 return {services,types,months,periods,records,aggregate};
});
