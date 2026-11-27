'use strict';
// Research-only finite-horizon Max Geist terminal race. Not a native policy,
// game simulator, or permission to edit the frozen candidate worker.
// Inputs must be actor-known counts or a justified exchangeable belief.
const gcd = (a,b) => b === 0n ? a : gcd(b,a%b);
function frac(n,d=1n) {
  if(d<=0n || n<0n) throw new Error('bad probability');
  const g=gcd(n,d); return {n:n/g,d:d/g};
}
const zero=frac(0n), one=frac(1n);
const plus=(a,b)=>frac(a.n*b.d+b.n*a.d,a.d*b.d);
const times=(a,b)=>frac(a.n*b.n,a.d*b.d);
const cmp=(a,b)=>a.n*b.d-b.n*a.d;
const str=p=>p.n+'/'+p.d;
function choose(n,k) {
  if(k<0 || k>n) return 0n;
  let r=1n;
  for(let i=1;i<=Math.min(k,n-k);i++) r=r*BigInt(n-i+1)/BigInt(i);
  return r;
}
const keys=['board','active','hand','deck','unseen','unseenEnergy','doors','manual','needBoard','needActive'];
function validate(s) {
  for(const k of keys) if(!Number.isSafeInteger(s[k])||s[k]<0) throw new Error('invalid '+k);
  if(s.active>s.board || s.deck>s.unseen || s.unseenEnergy>s.unseen ||
      s.manual>1 || s.doors>4 || s.unseen>s.deck+6 ||
      s.board+s.hand+s.unseenEnergy>11 || s.needActive>3)
    throw new Error('invalid physical counts or unsupported configuration');
}
function solveEnergyRace(input) {
  validate(input);
  const memo=new Map();
  const won=s=>s.board>=s.needBoard && s.active>=s.needActive;
  function actionValues(s) {
    if(won(s)) return [{action:'attack',p:one}];
    const rows=[];
    if(s.hand>0 && s.manual) {
      const next={...s,hand:s.hand-1,manual:0,board:s.board+1};
      rows.push({action:'manual-active',p:value({...next,active:s.active+1})});
      rows.push({action:'manual-bench',p:value(next)});
    }
    if(s.hand>0 && s.doors>0) {
      const draw=Math.min(2,s.deck), denom=choose(s.unseen,draw);
      let p=zero;
      for(let e=0;e<=draw;e++){
        const num=choose(s.unseenEnergy,e)*choose(s.unseen-s.unseenEnergy,draw-e);
        if(!num) continue;
        p=plus(p,times(frac(num,denom),value({
          ...s,board:s.board+1,hand:s.hand-1+e,deck:s.deck-draw,
          unseen:s.unseen-draw,unseenEnergy:s.unseenEnergy-e,doors:s.doors-1
        })));
      }
      rows.push({action:'door',p});
    }
    return rows;
  }
  function value(s){
    if(won(s)) return one;
    if(s.board+s.doors+s.manual<s.needBoard || s.active+s.manual<s.needActive) return zero;
    const key=keys.map(k=>s[k]).join(',');
    if(memo.has(key)) return memo.get(key);
    let best=zero;
    for(const a of actionValues(s)) if(cmp(a.p,best)>0n) best=a.p;
    memo.set(key,best); return best;
  }
  const rows=actionValues(input);
  const best=value(input);
  return {
    p:str(best), optimal:best.n===0n?[]:rows.filter(a=>cmp(a.p,best)===0n).map(a=>a.action),
    actions:Object.fromEntries(rows.map(a=>[a.action,str(a.p)])),states:memo.size
  };
}
function selfTest(){
  const base={board:4,active:3,hand:1,deck:20,unseen:20,unseenEnergy:5,doors:1,manual:1,needBoard:6,needActive:3};
  const cases=[
    ['mirror 10 to 11',{...base,board:10,active:4,unseenEnergy:0,doors:0,needBoard:11},'1/1','manual-active'],
    ['Clefairy 5 to 6',{...base,board:5,unseenEnergy:4,doors:0},'1/1','manual-active'],
    ['Door first K1',base,'17/38','door'],
    ['Door first K0',{...base,unseen:22,unseenEnergy:6},'37/77','door'],
    ['Active needs last held energy',{...base,active:2,needBoard:5},'1/1','manual-active'],
    ['Need active plus two total',{...base,active:2},'17/38','door'],
    ['Two held Energy reserve active',{...base,active:2,hand:2,unseenEnergy:4},'1/1','door'],
    ['Already lethal',{...base,needBoard:4},'1/1','attack'],
    ['No reachable threshold',{...base,needBoard:7},'0/1',null],
    ['Zero deck, attach wins',{...base,deck:0,unseen:0,unseenEnergy:0,needBoard:5},'1/1','door'],
    ['Three-Door chain',{...base,board:3,unseenEnergy:7,doors:3,needBoard:7},'1967/7752','door']
  ];
  const outputs=[];
  for(const [label,s,p,a] of cases){
    const r=solveEnergyRace(s);
    if(p!==null && r.p!==p || a!==null && !r.optimal.includes(a) || a===null && r.optimal.length!==0)
      throw new Error(label+': '+JSON.stringify(r));
    outputs.push({label,...r});
  }
  // Exhaustively compare immediate KO probabilities: when the Active is funded,
  // or needs exactly one but there are at least two held Energy, Door-first
  // weakly dominates manual-first, under the stated narrow model.
  let comparisons=0;
  const unpack=s=>{const [n,d]=s.split('/').map(BigInt);return {n,d};};
  for(let board=3;board<=8;board++) for(let active=2;active<=3;active++)
  for(let hand=1;hand<=3;hand++) for(let deck=0;deck<=8;deck++)
  for(let e=0;e<=Math.min(deck,11-board-hand);e++) for(let doors=1;doors<=3;doors++)
  for(let need=board+1;need<=Math.min(11,board+doors+1);need++){
    if(active===2 && hand===1) continue;
    const r=solveEnergyRace({board,active,hand,deck,unseen:deck,unseenEnergy:e,doors,manual:1,needBoard:need,needActive:3});
    if(cmp(unpack(r.actions.door),unpack(r.actions['manual-active']))<0n ||
       cmp(unpack(r.actions.door),unpack(r.actions['manual-bench']))<0n)
      throw new Error('Door order counterexample '+JSON.stringify(r));
    comparisons++;
  }
  return {outputs,comparisons};
}
// Offline replay of the existing pure draft worker with its own fixture helpers.
// This deliberately bypasses the protocol validator and native Store.
function replayDraftWorker(workerSource,testSource){
  const m={exports:{}};
  new Function('module','exports',workerSource)(m,m.exports);
  const {pokemon,attack,observation,request,underworldReceipt}=new Function(
    'protocol','EVENT_RECEIPT_VERSION',
    testSource.slice(testSource.indexOf('function publicRestrictions()'),testSource.indexOf('function init('))+
      '\nreturn {pokemon,attack,observation,request,underworldReceipt};'
  )({},'agent8-public-event-receipt-v3-turn-stamped');
  const energy='Psychic Energy SVE 5';
  const vmax=n=>pokemon({printing:'Shadow Rider Calyrex VMAX CRE 75',name:'Shadow Rider Calyrex VMAX',hp:320,
    subtypes:['VMAX'],energies:Array(n).fill(energy),
    attacks:[attack('Max Geist',['Colorless','Colorless','Colorless'],'10+')],abilities:['Underworld Door']});
  const clefairy=damage=>pokemon({printing:"Lillie's Clefairy ex JTG 56",name:"Lillie's Clefairy ex",
    hp:190,damage,subtypes:['Basic','ex']});
  const rows=[];
  for(const seat of [0,1]) for(const c of [
    {name:'mirror-10-to-11',n:[4,3,3],target:vmax(3),p:3,door:false,expected:'max-geist'},
    {name:'lethal-5-to-6',n:[3,2],target:clefairy(0),p:2,door:false,expected:'max-geist'},
    {name:'door-before-manual',n:[3,1],target:clefairy(0),p:2,door:true,expected:'attach-active'},
    {name:'manual-needed-active',n:[2,2],target:clefairy(30),p:2,door:true,expected:'attach-active'}
  ]){
    const [active,...bench]=c.n.map(vmax);
    const view=observation(seat,{active,bench,opponentActive:c.target,ownHand:[energy],globalTurn:9});
    view.ownPublic.prizeCount=c.p;view.ownPublic.deckCount=20;
    const actions=[
      {token:'attach-active',kind:'play-card',actorPrinting:energy,targetPrinting:active.printing,
        publicMetadata:{targetSeat:'actor',targetZone:'active',targetIndex:0,isOwnerVisible:true}},
      ...bench.map((s,i)=>({token:'attach-bench-'+i,kind:'play-card',actorPrinting:energy,
        targetPrinting:s.printing,publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:i,isOwnerVisible:true}})),
      ...(c.door?[{token:'door',kind:'use-ability',actorPrinting:active.printing,
        publicMetadata:{sourceSeat:'actor',sourceZone:'active',abilityName:'Underworld Door'}}]:[]),
      ...(c.n[0]>=3?[{token:'max-geist',kind:'attack',actorPrinting:active.printing,
        attackName:'Max Geist',publicMetadata:{attackCostPayable:true}}]:[]),
      {token:'pass',kind:'pass'}
    ];
    const req=request(seat,view,{actions,receipt:underworldReceipt(seat,view,{
      activeUsed:!c.door,benchUsed:bench.map(()=>true)
    })});
    const policy=m.exports.createPolicy({role:'candidate',seat,policyVersion:m.exports.POLICY_VERSION,config:{}});
    const out=policy.decideWithAudit(req);
    if(out.decision.kind!=='select-action' || out.decision.token!==c.expected)
      throw new Error('Draft behavior changed: '+JSON.stringify({seat,case:c.name,decision:out.decision}));
    rows.push({seat,case:c.name,decision:out.decision,rule:out.policyAudit.selectionRuleCode,
      scores:out.policyAudit.evaluations.map(x=>({token:x.token,score:x.score,reason:x.reasonCode}))});
  }
  return rows;
}
module.exports={solveEnergyRace,selfTest,replayDraftWorker};
if(typeof require!=='undefined' && require.main===module) {
  const result=selfTest();
  if(process.argv.length===4) {
    const fs=require('node:fs');
    result.draftReplay=replayDraftWorker(fs.readFileSync(process.argv[2],'utf8'),fs.readFileSync(process.argv[3],'utf8'));
  }
  console.log(JSON.stringify(result,null,2));
}
