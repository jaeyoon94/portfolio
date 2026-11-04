// Editorial sentence breaks in prose. Dates, decimals, links and markup remain intact.
module.exports=function sentenceBreaks(html){
 return html.replace(/<(p|dd|li)\b[^>]*>[\s\S]*?<\/\1>/g,block=>
  block.split(/(<[^>]+>)/g).map(part=>part.startsWith('<')?part:
   part.replace(/([가-힣][.!?])\s+(?=\S)/g,'$1<br class="sentence-break">')
  ).join('')
 );
};
