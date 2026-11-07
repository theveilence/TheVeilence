const $=id=>document.getElementById(id),CFG=window.CONFIG;
let W=0,H=0,S=2,FR=[];const cv=$('cv'),tpl=new Image(),st={bg:CFG.photoColors[0],sel:0,exp:false,meth:'ai'};
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
function err(t){$('err').textContent=t;$('err').style.display=t?'block':'none'}
// ---- deteksi otomatis area foto (bagian transparan di template) ----
function detectFrames(d,W,H){
 const lab=new Uint8Array(W*H),stk=new Int32Array(W*H);let boxes=[];
 for(let s=0;s<W*H;s++){if(lab[s]||d[s*4+3]>10)continue;let sp=0,x1=W,y1=H,x2=0,y2=0,area=0,edge=false;stk[sp++]=s;lab[s]=1;
  while(sp){const k=stk[--sp],px=k%W,py=(k/W)|0;area++;if(px<x1)x1=px;if(px>x2)x2=px;if(py<y1)y1=py;if(py>y2)y2=py;if(px===0||py===0||px===W-1||py===H-1)edge=true;
   const nb=[px>0?k-1:-1,px<W-1?k+1:-1,py>0?k-W:-1,py<H-1?k+W:-1];
   for(const q of nb)if(q>=0&&!lab[q]&&d[q*4+3]<=10){lab[q]=1;stk[sp++]=q}}
  if(!edge&&area>100)boxes.push({x1,y1,x2:x2+1,y2:y2+1})}
 const hit=(a,b)=>a.x1<b.x2&&b.x1<a.x2&&a.y1<b.y2&&b.y1<a.y2;
 let ch=true;while(ch){ch=false;for(let i=0;i<boxes.length&&!ch;i++)for(let j=i+1;j<boxes.length;j++)if(hit(boxes[i],boxes[j])){const a=boxes[i],b=boxes[j];boxes[i]={x1:Math.min(a.x1,b.x1),y1:Math.min(a.y1,b.y1),x2:Math.max(a.x2,b.x2),y2:Math.max(a.y2,b.y2)};boxes.splice(j,1);ch=true;break}}
 boxes=boxes.filter(b=>(b.x2-b.x1)*(b.y2-b.y1)>W*H*.02).sort((a,b)=>a.y1-b.y1||a.x1-b.x1);
 return boxes.map(b=>{let sx=0,n=0;for(let y=b.y1;y<b.y2;y++)for(let x=b.x1;x<b.x2;x++)if(d[(y*W+x)*4+3]>128){sx+=x;n++}
  const w=b.x2-b.x1,side=n>w*(b.y2-b.y1)*.01&&(sx/n)>b.x1+w/2?0:1;
  return{x:b.x1,y:b.y1,w,h:b.y2-b.y1,side}})}
function mkFrames(list){return list.map((f,i)=>({ix:f.x,iy:f.y,iw:f.w,ih:f.h,side:f.side,n:(CFG.names&&CFG.names[i])||'Frame '+(i+1),orig:null,cut:null,x:0,y2:0,s:1,base:1,tol:45}))}
function ux(f){return f.ix+f.iw*(f.side?.7:.3)}
function draw(){
 if(!W)return;const c=cv.getContext('2d');c.setTransform(S,0,0,S,0,0);c.clearRect(0,0,W,H);
 const n=parseInt(st.bg.slice(1),16),lum=((n>>16)*.3+(n>>8&255)*.59+(n&255)*.11),pc=lum>128?'rgba(0,0,0,.3)':'rgba(255,255,255,.4)';
 FR.forEach((f,i)=>{
  c.fillStyle=st.bg;c.fillRect(f.ix,f.iy,f.iw,f.ih);
  c.save();c.beginPath();c.rect(f.ix,f.iy,f.iw,f.ih);c.clip();
  if(f.cut)c.drawImage(f.cut,f.x,f.y2,f.cut.width*f.s,f.cut.height*f.s);
  else if(!st.exp){c.fillStyle=pc;c.font='600 14px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('Upload fotomu',ux(f),f.iy+f.ih/2-10);c.fillText('di frame '+(i+1),ux(f),f.iy+f.ih/2+12)}
  c.restore()});
 c.drawImage(tpl,0,0,W,H);
 if(!st.exp&&FR[st.sel]){const f=FR[st.sel];c.strokeStyle='#ff4d8d';c.setLineDash([8,6]);c.lineWidth=2.5;c.strokeRect(f.ix+2,f.iy+2,f.iw-4,f.ih-4);c.setLineDash([])}
}
function fit(f){f.base=f.s=f.ih*1.05/f.cut.height;f.x=ux(f)-f.cut.width*f.s/2;f.y2=f.iy+f.ih-f.cut.height*f.s;sync()}
function auto(f){
 const w=f.orig.width,h=f.orig.height,d=f.orig.getContext('2d').getImageData(0,0,w,h),p=d.data;
 let R=0,G=0,B=0,n=0;const add=(x,y)=>{const k=(y*w+x)*4;R+=p[k];G+=p[k+1];B+=p[k+2];n++};
 for(let x=0;x<w;x+=3){add(x,0);add(x,h-1)}for(let y=0;y<h;y+=3){add(0,y);add(w-1,y)}
 R/=n;G/=n;B/=n;const T2=(f.tol*2)**2,vis=new Uint8Array(w*h),stk=new Int32Array(w*h);let sp=0;
 const push=k=>{if(vis[k])return;const i=k*4,a=p[i]-R,b=p[i+1]-G,e=p[i+2]-B;if(a*a+b*b+e*e<T2){vis[k]=1;stk[sp++]=k}};
 for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}
 while(sp){const k=stk[--sp],x=k%w;if(x>0)push(k-1);if(x<w-1)push(k+1);if(k>=w)push(k-w);if(k<w*(h-1))push(k+w)}
 for(let k=0;k<w*h;k++){if(vis[k])p[k*4+3]=0;else{const x=k%w;if((x>0&&vis[k-1])||(x<w-1&&vis[k+1])||(k>=w&&vis[k-w])||(k<w*(h-1)&&vis[k+w]))p[k*4+3]=130}}
 const o=mk(w,h);o.getContext('2d').putImageData(d,0,0);f.cut=o;
}
let segP=null;
function b2b(s){const r=atob(s),u=new Uint8Array(r.length);for(let i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u.buffer}
function loadAI(){if(segP)return segP;
 segP=Promise.race([new Promise((res,rej)=>{const s=document.createElement('script');s.src='assets/lib/tf.min.js';
  s.onload=async()=>{try{await tf.ready();const M=window.MODEL;res(await tf.loadGraphModel(tf.io.fromMemory({modelTopology:M.MD.t,weightSpecs:M.MD.w,weightData:b2b(M.MB),format:M.MD.f,generatedBy:M.MD.g,convertedBy:M.MD.c})))}catch(e){rej(e)}};
  s.onerror=()=>rej(new Error('script'));document.head.append(s)}),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),30000))]);
 segP.catch(()=>{segP=null});return segP}
async function runAI(f){
 const m=await loadAI();
 const t=tf.tidy(()=>m.predict(tf.browser.fromPixels(f.orig).resizeBilinear([256,256]).toFloat().div(255).expandDims(0)).squeeze());
 f.mask=await t.data();t.dispose();f.q=null;applyMask(f)}
function boxf(src,w,h,r){const out=new Float32Array(w*h),tmp=new Float32Array(w*h),pre=new Float64Array(Math.max(w,h)+1);
 for(let y=0;y<h;y++){const row=y*w;for(let x=0;x<w;x++)pre[x+1]=pre[x]+src[row+x];for(let x=0;x<w;x++){const a=Math.max(0,x-r),b=Math.min(w-1,x+r);tmp[row+x]=(pre[b+1]-pre[a])/(b-a+1)}}
 for(let x=0;x<w;x++){for(let y=0;y<h;y++)pre[y+1]=pre[y]+tmp[y*w+x];for(let y=0;y<h;y++){const a=Math.max(0,y-r),b=Math.min(h-1,y+r);out[y*w+x]=(pre[b+1]-pre[a])/(b-a+1)}}
 return out}
function guided(I,p,w,h,r,eps){const n=w*h,II=new Float32Array(n),Ip=new Float32Array(n);for(let i=0;i<n;i++){II[i]=I[i]*I[i];Ip[i]=I[i]*p[i]}
 const mI=boxf(I,w,h,r),mp=boxf(p,w,h,r),cI=boxf(II,w,h,r),cIp=boxf(Ip,w,h,r),a=new Float32Array(n),b=new Float32Array(n);
 for(let i=0;i<n;i++){const v=cI[i]-mI[i]*mI[i],c=cIp[i]-mI[i]*mp[i];a[i]=c/(v+eps);b[i]=mp[i]-a[i]*mI[i]}
 const ma=boxf(a,w,h,r),mb=boxf(b,w,h,r),q=new Float32Array(n);for(let i=0;i<n;i++)q[i]=ma[i]*I[i]+mb[i];return q}
function upsample(m,mw,mh,w,h){const o=new Float32Array(w*h);for(let y=0;y<h;y++){const fy=Math.max(0,(y+.5)*mh/h-.5),y0=Math.min(mh-1,fy|0),y1=Math.min(mh-1,y0+1),ty=fy-y0;
 for(let x=0;x<w;x++){const fx=Math.max(0,(x+.5)*mw/w-.5),x0=Math.min(mw-1,fx|0),x1=Math.min(mw-1,x0+1),tx=fx-x0;
 o[y*w+x]=(m[y0*mw+x0]*(1-tx)+m[y0*mw+x1]*tx)*(1-ty)+(m[y1*mw+x0]*(1-tx)+m[y1*mw+x1]*tx)*ty}}return o}
function maskQ(mask,rgba,w,h){const n=w*h,up=upsample(mask,256,256,w,h),I=new Float32Array(n);
 for(let i=0;i<n;i++)I[i]=(rgba[i*4]*.299+rgba[i*4+1]*.587+rgba[i*4+2]*.114)/255;
 return guided(I,up,w,h,Math.max(3,Math.round(Math.max(w,h)/130)),4e-4)}
function finish(q,rgba,w,h,thr){const n=w*h,al=new Float32Array(n);
 for(let i=0;i<n;i++)al[i]=Math.max(0,Math.min(1,(q[i]-thr)*4+.5));
 let known=new Uint8Array(n),R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n);
 for(let i=0;i<n;i++)if(al[i]>.97){known[i]=1;R[i]=rgba[i*4];G[i]=rgba[i*4+1];B[i]=rgba[i*4+2]}
 for(let it=0;it<8;it++){const nk=known.slice(),nR=R.slice(),nG=G.slice(),nB=B.slice();
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;if(known[i])continue;let c=0,sr=0,sg=0,sb=0;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const j=i+dy*w+dx;if(known[j]){c++;sr+=R[j];sg+=G[j];sb+=B[j]}}
   if(c){nk[i]=1;nR[i]=sr/c;nG[i]=sg/c;nB[i]=sb/c}}
  known=nk;R=nR;G=nG;B=nB}
 for(let i=0;i<n;i++){if(al[i]<=.97&&known[i]&&al[i]>0){rgba[i*4]=R[i];rgba[i*4+1]=G[i];rgba[i*4+2]=B[i]}rgba[i*4+3]=al[i]*255}}
function applyMask(f){const w=f.orig.width,h=f.orig.height,d=f.orig.getContext('2d').getImageData(0,0,w,h);
 if(!f.q)f.q=maskQ(f.mask,d.data,w,h);
 finish(f.q,d.data,w,h,Math.max(.15,.8-f.tol/150));const o=mk(w,h);o.getContext('2d').putImageData(d,0,0);f.cut=o}
function hasAlpha(c){const t=mk(64,64),x=t.getContext('2d');x.drawImage(c,0,0,64,64);const p=x.getImageData(0,0,64,64).data;let n=0;for(let i=3;i<p.length;i+=4)if(p[i]<200)n++;return n>200}
const stat=t=>$('stat').textContent=t||'';
async function process(f){
 if(hasAlpha(f.orig)){const o=mk(f.orig.width,f.orig.height);o.getContext('2d').drawImage(f.orig,0,0);f.cut=o;f.meth='asis';return}
 if(st.meth==='ai'){f.meth='ai';stat('Menghapus background (AI)… pertama kali agak lama, mohon tunggu.');
  try{await runAI(f);stat('');return}catch(e){stat('AI tidak bisa dimuat di perangkat ini, dipakai metode warna polos.')}}
 f.meth='color';auto(f)}
function load(i,file){
 const url=URL.createObjectURL(file),img=new Image();
 img.onload=async()=>{const f=FR[i],r=Math.min(1,900/Math.max(img.width,img.height)),o=mk(img.width*r|0,img.height*r|0);
  o.getContext('2d').drawImage(img,0,0,o.width,o.height);URL.revokeObjectURL(url);f.orig=o;f.tol=+$('tol').value;
  select(i);await process(f);fit(f);select(i)};
 img.src=url;
}
function sync(){const f=FR[st.sel];if(!f)return;$('zoom').value=f.cut?f.s/f.base:1;$('tol').value=f.tol;$('selname').textContent='— frame '+(st.sel+1);
 document.querySelectorAll('.slot').forEach((e,i)=>{e.classList.toggle('on',i===st.sel);e.querySelector('i').textContent=FR[i].cut?'✓ ada':'kosong'})}
function select(i){st.sel=i;sync();draw()}
// ---- UI ----
document.title=CFG.title;$('ttl').textContent=CFG.title;$('sub').textContent=CFG.subtitle;
CFG.photoColors.forEach(col=>{const b=document.createElement('button');b.style.background=col;b.dataset.c=col;b.onclick=()=>{st.bg=col;mark();draw()};$('bgsw').append(b)});
const ci=document.createElement('input');ci.type='color';ci.value=st.bg;ci.oninput=()=>{st.bg=ci.value;mark();draw()};$('bgsw').append(ci);
function mark(){$('bgsw').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.c===st.bg))}mark();
function buildSlots(){$('slots').innerHTML='';FR.forEach((f,i)=>{const d=document.createElement('div');d.className='slot';
 d.innerHTML='<b>'+(i+1)+'</b><span>'+f.n+'</span><i>kosong</i><label class="btn sm">Upload<input type="file" accept="image/*" hidden></label>';
 d.onclick=()=>select(i);
 const fi=d.querySelector('input');fi.onclick=e=>e.stopPropagation();fi.onchange=()=>{if(fi.files[0])load(i,fi.files[0]);fi.value=''};
 $('slots').append(d)})}
$('zoom').oninput=e=>{const f=FR[st.sel];if(!f||!f.cut)return;const cx=f.x+f.cut.width*f.s/2,cy=f.y2+f.cut.height*f.s/2;f.s=f.base*e.target.value;f.x=cx-f.cut.width*f.s/2;f.y2=cy-f.cut.height*f.s/2;draw()};
$('tol').oninput=e=>{const f=FR[st.sel];f.tol=+e.target.value;if(f.meth==='ai'&&f.mask&&f.orig){clearTimeout(window._t);window._t=setTimeout(()=>{applyMask(f);draw()},120)}};
$('clear').onclick=()=>{const f=FR[st.sel];f.orig=f.cut=f.mask=f.q=null;f.meth=null;stat('');sync();draw()};
let drag=null;
const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
cv.onpointerdown=e=>{const[px,py]=pos(e);const i=FR.findIndex(f=>px>=f.ix-14&&px<=f.ix+f.iw+14&&py>=f.iy-14&&py<=f.iy+f.ih+14);if(i<0)return;if(i!==st.sel)select(i);
 const f=FR[i];if(!f.cut)return;cv.setPointerCapture(e.pointerId);drag={px,py,x:f.x,y:f.y2}};
cv.onpointermove=e=>{if(!drag)return;const f=FR[st.sel],[px,py]=pos(e);f.x=drag.x+px-drag.px;f.y2=drag.y+py-drag.py;draw()};
cv.onpointerup=cv.onpointercancel=()=>drag=null;
cv.addEventListener('wheel',e=>{const f=FR[st.sel];if(!f||!f.cut)return;e.preventDefault();$('zoom').value=Math.min(3,Math.max(.3,+$('zoom').value*(e.deltaY<0?1.05:.95)));$('zoom').oninput({target:$('zoom')})},{passive:false});
$('dl').onclick=()=>{
 st.exp=true;draw();
 try{cv.toBlob(b=>{st.exp=false;draw();if(!b){err('Gagal membuat gambar.');return}
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='photostrip.png';document.body.append(a);a.click();a.remove();
  $('oimg').src=a.href;$('out').style.display='flex'},'image/png')}
 catch(e){st.exp=false;draw();err('Download diblokir browser karena halaman dibuka langsung dari file. Buka lewat server lokal atau hosting (lihat README.txt).')}
};
$('out').onclick=()=>$('out').style.display='none';
// ---- mulai: muat template ----
tpl.onload=()=>{W=tpl.naturalWidth;H=tpl.naturalHeight;S=W<1000?2:1;cv.width=W*S;cv.height=H*S;cv.style.aspectRatio=W+' / '+H;
 let list=null;try{const t=mk(W,H),x=t.getContext('2d');x.drawImage(tpl,0,0);list=detectFrames(x.getImageData(0,0,W,H).data,W,H)}catch(e){list=null}
 if(!list||!list.length){list=CFG.fallbackFrames;if(location.protocol==='file:')err('Halaman dibuka langsung dari file, jadi frame memakai pengaturan cadangan dan download mungkin diblokir. Lihat README.txt untuk cara menjalankan lewat server.')}
 FR=mkFrames(list);buildSlots();select(0)};
tpl.onerror=()=>err('File template tidak ditemukan: '+CFG.template+'. Pastikan file ada di folder assets dan namanya sama persis.');
tpl.src=CFG.template;
