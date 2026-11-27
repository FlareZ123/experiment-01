'use strict';
// All Energy Basic Psychic, stable publicly certified damage, Prize and
// effective costs; no other switch/attach actions or position-dependent effects.
// Indices are physical identities, not current bench positions.
function solve(s){
  const valid=n=>Number.isInteger(n)&&n>=0;
  if(!s||s.stable!==true||!s.own?.length||!s.opp?.length||!valid(s.remaining)||!s.remaining||
    s.own.some(p=>!valid(p.energy)||(p.retreat!==null&&!valid(p.retreat))||(p.geistCost!==null&&!valid(p.geistCost)))||
    s.opp.some(p=>!valid(p.hp)||!p.hp||!valid(p.prizes)||!p.prizes))return {status:'unsupported',routes:[]};
  const routes=[],initial=s.own.map(p=>p.energy),sum=a=>a.reduce((x,y)=>x+y,0);
  function visit(a,b,es,g,r,path){
    const damage=10+30*sum(es),c=s.own[a].geistCost;
    if(c!==null&&es[a]>=c&&damage>=s.opp[b].hp&&s.opp[b].prizes>=s.remaining)
      routes.push({steps:[...path,{kind:'attack',own:a,opp:b,damage}],spent:sum(initial)-sum(es)});
    if(g&&s.opp.length>1){
      const ks=s.own.length===1?[a]:s.own.map((_,i)=>i).filter(i=>i!==a);
      for(let j=0;j<s.opp.length;j++)if(j!==b)for(const k of ks)
        visit(k,j,es,false,r,[...path,{kind:'guzma',opp:j,promote:k}]);
    }
    const rc=s.own[a].retreat;
    if(r&&rc!==null&&es[a]>=rc)for(let k=0;k<s.own.length;k++)if(k!==a){
      const next=es.slice();next[a]-=rc;
      visit(k,b,next,g,false,[...path,{kind:'retreat',from:a,to:k,pay:rc}]);
    }
  }
  visit(0,0,initial,s.guzma===true,s.retreat===true,[]);
  routes.sort((a,b)=>a.steps.length-b.steps.length||a.spent-b.spent||JSON.stringify(a.steps).localeCompare(JSON.stringify(b.steps)));
  return {status:routes.length?'certified':'no-certificate',routes};
}
function runTests(){
  const V=(energy,retreat=2)=>({energy,retreat,geistCost:3}),P=(energy,retreat=1)=>({energy,retreat,geistCost:null}),T=(hp,prizes=2)=>({hp,prizes});
  const base={stable:true,remaining:2,guzma:true,retreat:false,opp:[T(320,3),T(170)]};
  const tests=[
    ['forced bench attacker',{...base,own:[P(0),V(6)]},'guzma,attack'],
    ['stranded old active',{...base,own:[V(6),P(0)]},'no-certificate'],
    ['free return',{...base,retreat:true,own:[V(6),P(0,0)]},'guzma,retreat,attack'],
    ['paid return loses lethal',{...base,retreat:true,own:[V(5),P(1)]},'no-certificate'],
    ['paid return retains lethal',{...base,retreat:true,own:[V(6),P(1)]},'guzma,retreat,attack'],
    ['retreat before gust',{...base,retreat:true,own:[V(8),P(0,null)]},'retreat,guzma,attack'],
    ['empty own bench',{...base,own:[V(6)]},'guzma,attack'],
    ['empty opposing bench',{...base,opp:[T(320,3)],own:[V(6),P(0)]},'no-certificate'],
    ['direct lethal',{...base,opp:[T(170),T(170)],own:[V(6),V(5)]},'attack'],
    ['insufficient prizes',{...base,remaining:3,own:[P(0),V(6)]},'no-certificate'],
    ['retreat only',{...base,guzma:false,retreat:true,own:[P(0,0),V(6)],opp:[T(170)]},'retreat,attack'],
    ['unfunded VMAX',{...base,own:[P(4),V(2)]},'no-certificate'],
    ['retreat forbidden',{...base,retreat:true,own:[V(6),P(0,null)]},'no-certificate'],
    ['dynamic effects',{...base,stable:false,own:[P(0),V(6)]},'unsupported'],
    ['paid pivot damage 160',{...base,retreat:true,own:[V(5),P(1)],opp:[T(320,3),T(160)]},'guzma,retreat,attack']
  ];
  for(const [label,s,want] of tests){const o=solve(s),actual=o.routes.length?o.routes[0].steps.map(x=>x.kind).join(','):o.status;if(actual!==want)throw Error(label+': '+actual+' != '+want);}
  let checks=0;
  for(const va of [0,1])for(let v=0;v<=11;v++)for(let p=0;p+v<=11;p++)for(let rc=0;rc<=3;rc++)for(let vr=0;vr<=3;vr++)for(const retreat of [false,true])for(const guzma of [false,true])for(const hp of [90,160,170,190,280,320,340]){
    const own=va===0?[V(v,vr),P(p,rc)]:[P(p,rc),V(v,vr)],lethal=(board,active)=>active>=3&&10+30*board>=hp;
    const expect=guzma&&(va===1?lethal(v+p,v):retreat&&(p>=rc&&lethal(v+p-rc,v)||v>=vr&&lethal(v+p-vr,v-vr)));
    const s={...base,retreat,guzma,own,opp:[T(1000,3),T(hp)]};
    if((solve(s).status==='certified')!==expect)throw Error(JSON.stringify(s));checks++;
  }
  return {tests:tests.length,closedFormChecks:checks};
}
function reproduceWorker(workerSource,testSource){
  const m={exports:{}};new Function('module','exports',workerSource)(m,m.exports);
  const {pokemon,attack,observation,request,underworldReceipt}=new Function('protocol','EVENT_RECEIPT_VERSION',testSource.slice(testSource.indexOf('function publicRestrictions()'),testSource.indexOf('function init('))+'\nreturn {pokemon,attack,observation,request,underworldReceipt};')({},'agent8-public-event-receipt-v3-turn-stamped');
  const vmax=n=>pokemon({name:'Shadow Rider Calyrex VMAX',printing:'Shadow Rider Calyrex VMAX CRE 75',hp:320,subtypes:['VMAX'],energies:Array(n).fill('Psychic Energy'),attacks:[attack('Max Geist',['Colorless','Colorless','Colorless'],'10+')],retreatCost:['Colorless','Colorless']});
  const lele=pokemon({name:'Tapu Lele-GX',printing:'Tapu Lele-GX GRI 60',hp:170,subtypes:['Basic','GX']});
  const weak=pokemon({name:'Girafarig',printing:'Girafarig LOT 94',hp:90,energies:[],attacks:[attack('Get Lost',['Colorless'],null)],retreatCost:['Colorless']});
  const rows=[];
  for(const seat of [0,1])for(const kind of ['missed','stranded']){
    const view=observation(seat,{active:kind==='missed'?weak:vmax(6),bench:kind==='missed'?[vmax(6)]:[weak],opponentActive:vmax(3),opponentBench:[lele],ownHand:['Guzma BUS 115'],globalTurn:9});
    view.ownPublic.prizeCount=2;view.ownTurnResources.retreatedTurn=1;view.ownTurnResources.energyPlayedTurn=true;
    const actions=[{token:'guzma',kind:'play-card',actorPrinting:'Guzma BUS 115'},{token:'pass',kind:'pass'},...(kind==='stranded'?[{token:'geist',kind:'attack',attackName:'Max Geist'}]:[])];
    const p=m.exports.createPolicy({role:'candidate',seat,policyVersion:m.exports.POLICY_VERSION,config:{}});
    const d=p.decideWithAudit(request(seat,view,{actions,receipt:underworldReceipt(seat,view)}));
    if(d.decision.token!==(kind==='missed'?'pass':'guzma'))throw Error(JSON.stringify(d));
    rows.push({seat,kind,token:d.decision.token});
  }
  return rows;
}
module.exports={solve,runTests,reproduceWorker};
if(require.main===module){console.log(JSON.stringify(runTests()));if(process.argv.length===4){const fs=require('node:fs');console.log(JSON.stringify(reproduceWorker(fs.readFileSync(process.argv[2],'utf8'),fs.readFileSync(process.argv[3],'utf8'))));}}
