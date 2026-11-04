// Use lighter display assets while preserving original files and enlargement links.
const assets=require('../content/image-assets.json');
module.exports=function imageAssets(html){
 return html.replace(/<img\b[^>]*>/g,tag=>{
  const match=/\bsrc="([^"]+)"/.exec(tag);
  const asset=match&&assets[match[1]];
  if(!asset)return tag;
  tag=tag.replace(/\bsrc="[^"]+"/,`src="${asset.src}"`);
  if(!/\bwidth=/.test(tag))tag=tag.replace('<img',`<img width="${asset.width}" height="${asset.height}"`);
  return tag;
 });
};
