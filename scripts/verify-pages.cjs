const fs=require('fs'),path=require('path'),assert=require('assert');const root=path.resolve(__dirname,'..');const manifest=JSON.parse(fs.readFileSync(path.join(root,'content/page-manifest.json')));const source=fs.readFileSync(path.join(root,'content/portfolio-source.html'),'utf8');function extract(h,id){const m=new RegExp('<([a-z][a-z0-9]*)\\b[^>]*\\bid="'+id+'"[^>]*>','i').exec(h);assert.ok(m,id);const re=new RegExp('<\\/?'+m[1]+'\\b[^>]*>','gi');re.lastIndex=m.index;let n=0,t;while(t=re.exec(h)){n+=t[0].startsWith('</')?-1:1;if(!n)return h.slice(m.index,re.lastIndex)}}const normalize=h=>h.replace(/\r\n/g,'\n').replace(/href="[^"]*"/g,'href="LINK"');for(const [id,file]of manifest.sections){if(['profile','projects','closing'].includes(id)&&file==='index.html')continue;const current=fs.readFileSync(path.join(root,file),'utf8');assert.equal(normalize(extract(source,id)),normalize(extract(current,id)),id);}let links=0;for(const file of manifest.pages){const h=fs.readFileSync(path.join(root,file),'utf8');const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length,'duplicate IDs '+file);assert.equal((h.match(/<h1\b/g)||[]).length,1,'h1 '+file);for(const [,href]of h.matchAll(/href="([^"]+)"/g)){if(/^(mailto:|https?:)/.test(href))continue;const [f,hash]=href.split('#'),target=decodeURIComponent(f||file);assert.ok(fs.existsSync(path.join(root,target)),file+' -> '+href);if(hash&&target.endsWith('.html')){const dest=fs.readFileSync(path.join(root,target),'utf8');assert.ok(dest.includes('id="'+hash+'"'),file+' -> '+href);}links++;}}console.log('PASS: '+manifest.pages.length+' pages, '+links+' local links; unique IDs, single h1; all original migrated section HTML preserved except link targets.');

const imageAssets=require('../content/image-assets.json');
for(const [original,asset]of Object.entries(imageAssets)){
 assert.ok(fs.existsSync(path.join(root,original)),'original image preserved: '+original);
 assert.ok(fs.existsSync(path.join(root,asset.src)),'display image exists: '+asset.src);
 assert.ok(asset.width>0&&asset.height>0,'intrinsic image dimensions');
}
for(const file of manifest.pages){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 assert.ok(html.includes(`rel="canonical" href="https://parkjaeyoon-portfolio.vercel.app/${file}"`),'canonical '+file);
 for(const tag of ['og:title','og:description','og:url','og:image'])assert.ok(html.includes(`property="${tag}"`),'sharing metadata '+file);
 for(const [,src]of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g))assert.ok(fs.existsSync(path.join(root,decodeURIComponent(src))),'image '+file+' -> '+src);
}
assert.ok(fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes('Sitemap: https://parkjaeyoon-portfolio.vercel.app/sitemap.xml'));
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,manifest.pages.length,'sitemap page count');
console.log('PASS: canonical, sharing metadata, sitemap, images and original image preservation.');
