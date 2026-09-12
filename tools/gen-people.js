// Generate data.js additions from Family-LeQuang-Tán-Nhì-Tam.drawio
const fs=require('fs');
const xml=fs.readFileSync(process.argv[2],'utf8');

function decode(s){return s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');}
function stripTags(s){return decode(s).replace(/<[^>]*>/g,'\n');}
const YR=/((?:1[89]|20)\d{2})(?:\s*-\s*((?:1[89]|20)\d{2}))?/;

function fixName(n){
  return n.replace(/\s+/g,' ')
    .replace(/([a-zà-ỹ])([A-ZÁÀẠẢÃĂÂẦẬẨẪẮẰẶẲẴĐÉÈẸẺẼÊỀỆỂỄỐỒỘỔỖƠỜỢỞỮÚÙỤỦŨƯỪỰỬỮỸÝỴỶỴ])/g,'$1 $2')
    .split(' ').map(w=>{
      if(!w)return w;
      if(w.length>2&&w===w.toUpperCase()&&/^[A-ZÀ-Ỹ]+$/.test(w)) return w[0]+w.slice(1).toLowerCase();
      if(/^TH/.test(w)&&w.length>2&&w[2]===w[2].toLowerCase()) return 'Th'+w.slice(2);
      return w;
    }).join(' ').trim();
}
function parsePersons(value){
  const lines=stripTags(value).split('\n').map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean);
  const persons=[];let note=null;
  for(const ln of lines){
    const ym=ln.match(YR);
    const nameOnly=ln.replace(YR,'').replace(/[-–]\s*$/,'').trim();
    if(/^\(.*\)$/.test(ln)){note=ln.replace(/[()]/g,'').trim();continue;}
    if(/^\d*[IVX]*\s*$/.test(ln))continue;            // generation labels like "15", "6"
    if(ym&&nameOnly){persons.push({name:fixName(nameOnly),y1:ym[1],y2:ym[2]||null});}
    else if(ym&&!nameOnly&&persons.length){           // years-only line attaches to previous name
      const p=persons[persons.length-1];
      if(!p.y1)p.y1=ym[1]; else if(!p.y2)p.y2=ym[2]||ym[1];
    }
    else if(nameOnly&&/\p{L}/u.test(nameOnly)){persons.push({name:fixName(nameOnly),y1:null,y2:null});}
  }
  return {persons:persons.filter(p=>p.name&&/\p{L}{2,}/u.test(p.name)&&!/\d/.test(p.name)),note};
}
const ascii=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d');
function slug(n,y){return ascii(n).toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,24)+(y||'x');}

const diags=[...xml.matchAll(/<diagram name="([^"]*)"[^>]*>([\s\S]*?)<\/diagram>/g)];
const people=[];const usedIds=new Set();
function addPerson(o){let id=o.id;let i=2;while(usedIds.has(id)){id=o.id+'_'+(i++);}usedIds.add(id);
  people.push({...o,id});return id;}

const ROOTMAP={'Lê Quang TÁN':'tan','Lê Quang NHÌ':'nhi','Lê Quang TAM':'tam'};
const updates={tan:{years:'1896–1981',spouse:['Nguyễn Thị Hiếu','1904–1982']},
               nhi:{years:'1902–1972',spouse:['Bùi Thị Viễn','1907–1971']},
               tam:{years:'1912–1981',spouse:['Phan Thị Cúc','1915–2008']}};

for(const[,dname,body]of diags){
  const cells=[...body.matchAll(/<mxCell\s+([^>]*?)\/?>(?:\s*<mxGeometry([^>]*)\/>)?/g)];
  const V={},E=[];
  for(const[,attrs,geo]of cells){
    const get=a=>{const m=attrs.match(new RegExp(a+'="([^"]*)"'));return m?decode(m[1]):null;};
    const id=get('id');
    if(attrs.includes('vertex="1"')&&geo){
      const num=a=>{const m=geo.match(new RegExp(a+'="([\\d.-]+)"'));return m?parseFloat(m[1]):0;};
      V[id]={id,value:stripTags(get('value')||''),x:num('x'),y:num('y'),w:num('width'),h:num('height'),style:get('style')||''};
    }
    if(attrs.includes('edge="1"')&&geo){
      const e={id,source:get('source'),target:get('target')};
      for(const[,x,y,as]of geo.matchAll(/<mxPoint x="([\d.-]+)" y="([\d.-]+)" as="(sourcePoint|targetPoint)"/g)){
        if(as==='sourcePoint'){e.sx=+x;e.sy=+y;}else{e.tx=+x;e.ty=+y;}
      }
      E.push(e);
    }
  }
  const rootId0=ROOTMAP[dname];
  const root=Object.values(V).find(v=>v.w>80&&v.y<40&&/Lê Quang (Tán|Nhì|Tam)/i.test(v.value));
  if(!root){console.error('no root on',dname);continue;}
  const rootBottomY=root.y+root.h+20;

  // units: merge inner text cells into their containing box (big cells first)
  // empty large boxes act as containers too
  const allCells=Object.values(V).filter(v=>(v.value&&/\S/.test(v.value))||(v.w>=60&&v.h>=40));
  const units=[];
  for(const v of allCells.sort((a,b)=>(b.w*b.h)-(a.w*a.h))){
    const inner=units.find(u=>v.x>=u.x-10&&v.x+v.w<=u.x+u.w+10&&v.y>=u.y-10&&v.y+v.h<=u.y+u.h+10);
    if(inner){if(v.value&&/\S/.test(v.value))inner._parts.push({y:v.y,x:v.x,t:v.value});continue;}
    units.push({...v,_parts:v.value&&/\S/.test(v.value)?[{y:v.y,x:v.x,t:v.value}]:[]});
  }
  for(const u of units){u.value=u._parts.sort((a,b)=>a.y-b.y||a.x-b.x).map(p=>p.t).join('\n');}

  // resolve edge endpoints to units
  function unitOfId(id){if(!id)return null;const c=V[id];if(!c)return null;return units.find(u=>u.id===id)||null;}
  function unitAt(x,y){let best=null,bd=1e9;for(const u of units){const cx=u.x+u.w/2,cy=u.y+u.h/2;const d=(x-cx)**2+(y-cy)**2;if(d<bd){bd=d;best=u;}}return bd<40*40?best:null;}
  const touched={};
  for(const e of E){
    const a=e.source?unitOfId(e.source):unitAt(e.sx,e.sy);
    const b=e.target?unitOfId(e.target):unitAt(e.tx,e.ty);
    if(!a||!b||a.id===b.id)continue;
    (touched[a.id]=touched[a.id]||new Set()).add(b.id);
    (touched[b.id]=touched[b.id]||new Set()).add(a.id);
  }

  // rows: cluster y of candidate member units (bars or large boxes) below the root row
  const memberUnits=units.filter(u=>u.y>=rootBottomY&&((u.w<45&&u.h>80)||(u.w>=80&&u.h>=40)));
  const ys=memberUnits.map(u=>u.y).sort((a,b)=>a-b);
  const rowBounds=[];let start=ys[0];
  for(let i=1;i<=ys.length;i++){if(i===ys.length||ys[i]-ys[i-1]>100){rowBounds.push([start,ys[i-1]]);start=ys[i];}}
  const rowOf=u=>{for(let i=0;i<rowBounds.length;i++){const[a,b]=rowBounds[i];if(u.y>=a-10&&u.y<=b+10)return i;}return -1;};
  const genOfRow=i=>15+i;

  const rec={};
  for(const u of units){
    if(u.id===root.id||rowOf(u)<0)continue;
    const {persons,note}=parsePersons(u.value);
    if(!persons.length)continue;
    const fill=(u.style.match(/fillColor=(#\w+)/)||[])[1]||'';
    const g=fill.toUpperCase().includes('F5D7F9')?'f':'m';
    const p=persons[0];
    // --- parent ---
    const myRow=rowOf(u);
    const nb=[...(touched[u.id]||[])].map(id=>unitOfId(id)).filter(x=>x&&x.id!==u.id&&rowOf(x)>=0&&rowOf(x)<myRow);
    nb.sort((a,b)=>b.y-a.y);
    let parentId=null;
    for(const c of nb){if(rec[c.id]){parentId=rec[c.id];break;}}
    if(!parentId&&myRow>0){
      const cx=u.x+u.w/2;
      const prev=units.filter(v=>v.id!==u.id&&rowOf(v)===myRow-1);
      prev.sort((a,b)=>Math.abs(a.x+a.w/2-cx)-Math.abs(b.x+b.w/2-cx));
      if(prev.length&&rec[prev[0].id])parentId=rec[prev[0].id];
    }
    if(!parentId)parentId=rootId0;
    // --- record ---
    const mid=addPerson({id:slug(p.name,p.y1),name:p.name,g,gen:genOfRow(myRow),parents:[parentId],
      years:p.y1?(p.y2&&p.y2!==p.y1?`${p.y1}–${p.y2}`:p.y1):null,note:note||null});
    rec[u.id]=mid;
    const sp=persons[1];
    if(sp&&sp.name&&/\p{L}{2,}/u.test(sp.name)&&!/\d/.test(sp.name)){
      const spid=addPerson({id:slug(sp.name,sp.y1),name:sp.name,g:g==='f'?'m':'f',gen:genOfRow(myRow),
        spouses:[mid],years:sp.y1?(sp.y2&&sp.y2!==sp.y1?`${sp.y1}–${sp.y2}`:sp.y1):null});
      people.find(x=>x.id===mid).spouses=[spid];
    }
  }
}
fs.writeFileSync('/tmp/newpeople.json',JSON.stringify({people,updates},null,1));
console.log('people generated:',people.length);
