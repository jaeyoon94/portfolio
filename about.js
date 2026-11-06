// Copy the email address; the button only appears where the Clipboard API exists.
(() => {
 const button=document.querySelector('.ab-copy');
 if(!button||!navigator.clipboard)return;
 const label=button.textContent;
 let timer=0;
 button.hidden=false;
 button.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(button.dataset.copy);button.textContent='복사했습니다';}
  catch{button.textContent='복사하지 못했습니다';}
  clearTimeout(timer);timer=setTimeout(()=>{button.textContent=label;},2000);
 });
})();
