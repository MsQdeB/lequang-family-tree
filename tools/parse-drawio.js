// Parse drawio family files -> structured people list
const fs = require('fs');
const file = process.argv[2];
const xml = fs.readFileSync(file, 'utf8');

function decode(s){return s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');}
function stripTags(s){return decode(s).replace(/<[^>]*>/g,'\n').replace(/\n+/g,'\n').trim();}

const diagrams=[...xml.matchAll(/<diagram name="([^"]*)"[^>]*>([\s\S]*?)<\/diagram>/g)];

const YEAR=/^(.+?)\s+((?:1[89]|20)\d{2})(?:\s*-\s*((?:1[89]|20)\d{2}))?\s*$/;
const MALE='#cce5ff', FEMALE='#F5D7F9';

const all={};
for(const [,dname,body] of diagrams){
  const cells=[...body.matchAll(/<mxCell\s+([^>]*?)\/?>(?:\s*<mxGeometry([^>]*)\/>)?/g)];
  const V={},E=[];
  for(const [,attrs,geo] of cells){
    const get=a=>{const m=attrs.match(new RegExp(a+'="([^"]*)"'));return m?decode(m[1]):null;};
    const id=get('id'), style=get('style')||'', vertex=attrs.includes('vertex="1"'), edge=attrs.includes('edge="1"');
    const value=stripTags(get('value')||'');
    if(vertex&&geo){
      const num=a=>{const m=geo.match(new RegExp(a+'="([\\d.-]+)"'));return m?parseFloat(m[1]):0;};
      V[id]={id,value,x:num('x'),y:num('y'),w:num('width'),h:num('height'),style};
    }
    if(edge&&geo){
      const num=a=>{const m=geo.match(new RegExp(a+'="([\\d.-]+)"'));return m?parseFloat(m[1]):null;};
      const pts=[...geo.matchAll(/<mxPoint x="([\d.-]+)" y="([\d.-]+)" as="(sourcePoint|targetPoint|Array)"/g)];
      const e={id,source:get('source'),target:get('target')};
      for(const [,x,y,as] of pts){if(as==='sourcePoint'){e.sx=+x;e.sy=+y;}if(as==='targetPoint'){e.tx=+x;e.ty=+y;}}
      E.push(e);
    }
  }
  // merge text cells into overlapping boxes
  const units=[];
  const boxes=Object.values(V).filter(v=>{
    if(!v.value||!/\d{4}|Lê|Phạm|Nguy|Trương|Trần|Tạ|Phan|Bùi|Cao|Lữ|Tôn|Nìm|Phương|Bạch|Lý|Ngô|Hồ|Võ/.test(v.value))return false;
    return true;});
  for(const v of boxes){
    const inner=units.find(u=>v.x>=u.x-2&&v.x+v.w<=u.x+u.w+2&&v.y>=u.y-2&&v.y+v.h<=u.y+u.h+2);
    if(inner){inner.value+= '\n'+v.value; continue;}
    const isBar=v.w<45&&v.h>80;
    units.push({...v,isBar});
  }
  // resolve edge endpoint -> unit id
  function byId(id){if(V[id])return null;/*placeholder*/}
  function unitOfId(id){
    if(!id)return null;
    let u=units.find(u=>u.id===id); if(u)return u;
    const c=V[id]; if(!c)return null;
    return units.find(u=>c.x>=u.x-2&&c.x+c.w<=u.x+u.w+2&&c.y>=u.y-2&&c.y+c.h<=u.y+u.h+2)||null;
  }
  function unitOfPoint(x,y){
    let u=units.find(u=>x>=u.x-8&&x<=u.x+u.w+8&&y>=u.y-8&&y<=u.y+u.h+8);
    if(u)return u;
    let best=null,bd=1e9;
    for(const u of units){const cx=u.x+u.w/2,cy=u.y+u.h/2,d=(x-cx)**2+(y-cy)**2;if(d<bd){bd=d;best=u;}}
    return bd<45*45?best:null;
  }
  const touched={}; // unit -> set of neighbor units
  for(const e of E){
    let a=e.source?unitOfId(e.source):unitOfPoint(e.sx,e.sy);
    let b=e.target?unitOfId(e.target):unitOfPoint(e.tx,e.ty);
    if(!a||!b||a.id===b.id)continue;
    (touched[a.id]=touched[a.id]||new Set()).add(b.id);
    (touched[b.id]=touched[b.id]||new Set()).add(a.id);
  }
  all[dname]={units,touched};
}

// build people
const out=[];
for(const [dname,{units,touched}] of Object.entries(all)){
  const root=units.find(u=>/Lê Quang (Tán|Nhì|Tam)/i.test(u.value)&&!u.isBar&&u.h>60);
  if(!root){console.error('skip page',dname);continue;}
  const mRoot=root.value.match(YEAR);
  const rows=[...units].filter(u=>u.isBar||u.id!==root.id);
  function genOf(u){
    if(u.id===root.id)return 15; // TÁN/NHÌ/TAM = đời 14 -> children 15
    return null;
  }
  const info={};
  function parseLines(u){
    const lines=u.value.split('\n').map(s=>s.trim()).filter(Boolean);
    const p1=lines[0]&&lines[0].match(YEAR);
    const p2=lines[1]&&lines[1].match(YEAR);
    return {p1,p2};
  }
  const bars=units.filter(u=>u.isBar);
  // rows by y
  const rowYs=[...new Set(bars.map(b=>Math.round(b.y/40)*40))].sort((a,b)=>a-b);
  const rowOf=b=>{let best=null,bd=1e9;for(const ry of rowYs){const d=Math.abs(b.y-ry);if(d<bd){bd=d;best=ry;}}return best;};
  const barsByRow={};bars.forEach(b=>{(barsByRow[rowOf(b)]=barsByRow[rowOf(b)]||[]).push(b);});
  // determine parents for each bar
  for(const b of bars){
    const {p1}=parseLines(b);
    if(!p1)continue;
    const neighbors=[...(touched[b.id]||[])].map(id=>units.find(u=>u.id===id)).filter(Boolean);
    const myRow=rowOf(b);
    let cand=neighbors.filter(n=>n!==b&&rowOf(n)<myRow);
    cand.sort((x,y)=>y.y-x.y);
    info[b.id]={cand:cand.map(c=>c.id)};
  }
  out.push({page:dname,rootId:root.id,rootName:(mRoot?mRoot[1]:root.value).trim(),
    rootYears:mRoot?`${mRoot[2]}–${mRoot[3]||''}`:'',
    bars:bars.map(b=>({id:b.id,x:b.x,y:b.y,fill:(b.style.match(/fillColor=(#\w+)/)||[])[1],
      ...parseLines(b),cand:info[b.id]?info[b.id].cand:[]})),
    root});
}
console.log(JSON.stringify(out,null,1));
