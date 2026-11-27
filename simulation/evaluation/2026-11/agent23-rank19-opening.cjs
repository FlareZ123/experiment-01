'use strict';
// Exact source-60 opening decisions for the already-supported setup contracts.
// No opposing face-down information, deck identities, or future draw order.
const list=x=>Array.isArray(x)?x:[];
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
const re=(x,pattern)=>pattern.test(name(x));
const P={
 bolt:/^Raging Bolt ex TEF(?: 123)?$/,
 adp:/^Arceus & Dialga & Palkia-? ?GX CEC(?: 156)?$/,
 moltres:/^Galarian Moltres V CRE(?: 97)?$/,
 sandy:/^Sandy Shocks ex PAR(?: 108)?$/,
 flutter:/^Flutter Mane TEF(?: 78)?$/,
 latias:/^Latias ex SSP(?: 76)?$/,
 sudo:/^Sudowoodo GRI(?: 66)?$/,
 koko:/^Tapu Koko (?:Prism Star|◇|♢) TEU(?: 51)?$/,
 bird:/^Ho-Oh-EX DRX(?: 22)?$/,
 marsh:/^Marshadow UNB(?: 81)?$/,
 lele:/^Tapu Lele-GX GRI(?: 60)?$/,
 dedenne:/^Dedenne-GX UNB(?: 57)?$/,
 crobat:/^Crobat V DAA(?: 104)?$/,
 squawk:/^Squawkabilly ex PAL(?: 169)?$/
};
const kind=x=>Object.keys(P).find(k=>re(x,P[k]))??null;
const dde=x=>re(x,/^Double Dragon Energy ROS(?: 97)?$/);
const dark=x=>re(x,/^(?:Basic )?Darkness Energy(?: [A-Z0-9]+(?: \d+)?)?$/);
const lightning=x=>re(x,/^(?:Basic )?Lightning Energy(?: [A-Z0-9]+(?: \d+)?)?$/);
const fuel=x=>re(x,/^Battle Compressor PHF(?: 92)?$|^Quick Ball FST(?: 237)?$/);
const once=new Set(['lele','dedenne','crobat','squawk']);
const attacker=new Set(['bolt','adp','moltres','sandy']);
function activeScore(k,hand,all,second){
 const d=hand.some(dde),h=hand.some(dark),f=hand.some(fuel);
 if(k==='adp')return d?(second?120:96):35;
 if(k==='flutter')return d&&all.includes('adp')?65:100;
 if(k==='bolt')return d?90:70;
 if(k==='moltres')return h&&f?88:h?73:60;
 if(k==='latias')return all.some(x=>attacker.has(x))?77:46;
 if(k==='sandy')return 58;
 if(k==='sudo')return 42;
 if(k==='koko')return 40;
 if(k==='marsh')return 30;
 if(k==='bird')return 15; // Preserve Rebirth and avoid a costly Active retreat.
 if(k==='lele')return 22;
 if(k==='crobat')return 21;
 if(k==='dedenne')return 20;
 if(k==='squawk')return 19;
 return -1;
}
function benchScore(k,hand,present){
 if(present.includes(k))return 0;
 if(k==='latias')return present[0]!=='latias'?110:0;
 if(k==='moltres')return hand.some(dark)||hand.some(fuel)?105:80;
 if(k==='adp')return hand.some(dde)?100:58;
 if(k==='bolt')return 96;
 if(k==='sudo')return 84;
 if(k==='koko')return hand.filter(lightning).length>=2||hand.some(fuel)?60:0;
 if(k==='sandy')return 28;
 // Preserve searchable on-play support, Rebirth and Resetting Hole.
 if(once.has(k)||k==='bird'||k==='marsh'||k==='flutter')return 0;
 return 0;
}
function cards(p,o){
 const m=p.publicMetadata??{};
 if(m.selectionType!=='card-combination'||m.ownerSeat!=='actor'||m.sourceZone!=='hand'||m.isOwnerVisible!==true||m.allowCancel!==false)return null;
 const h=list(o.ownHand),cs=list(p.choices);
 const selected=cs.filter(c=>c.kind==='card');
 if(!Number.isSafeInteger(m.minimumCount)||!Number.isSafeInteger(m.maximumCount)||m.minimumCount<0||m.minimumCount>1||m.maximumCount<m.minimumCount||m.maximumCount>selected.length)return null;
 const used=new Set();
 for(const c of selected){
  const x=c.publicMetadata??{},i=x.selectionIndex;
  if(typeof c.token!=='string'||x.ownerSeat!=='actor'||x.sourceZone!=='hand'||x.isOwnerVisible!==true||!Number.isSafeInteger(i)||i<0||i>=h.length||used.has(i)||!kind(c)||kind(c)!==kind(h[i]))return null;
  used.add(i);
 }
 const own=o.ownPublic,bench=list(own?.bench).filter(Boolean);
 if(!own||!Array.isArray(own.bench)||bench.length>5)return null;
 const picks=[],present=[];
 if(m.minimumCount===1){
  if(own.active||bench.length)return null;
  const all=selected.map(kind);
  const second=o.turnSeat===undefined||o.turnSeat!==o.actorSeat;
  const ranked=selected.slice().sort((a,b)=>activeScore(kind(b),h,all,second)-activeScore(kind(a),h,all,second)||a.publicMetadata.selectionIndex-b.publicMetadata.selectionIndex);
  if(!ranked.length)return null;
  picks.push(ranked[0]);present.push(kind(ranked[0]));
 }else{
  if(!own.active||!kind(own.active)||bench.some(x=>!kind(x)))return null;
  present.push(kind(own.active),...bench.map(kind));
 }
 // Keep two empty Bench slots for Dedechange/Dark Asset/Wonder Tag and
 // additional Ho-Oh Rebirth. Do not expose redundant multi-Prize basics.
 const capacity=Math.min(m.maximumCount,picks.length+Math.max(0,3-bench.length));
 while(picks.length<capacity){
  const options=selected.filter(c=>!picks.includes(c)).map(c=>({c,s:benchScore(kind(c),h,present)})).filter(x=>x.s>=55).sort((a,b)=>b.s-a.s||a.c.publicMetadata.selectionIndex-b.c.publicMetadata.selectionIndex);
  if(!options.length)break;
  picks.push(options[0].c);present.push(kind(options[0].c));
 }
 // A lone fragile starter should have a backup if one is available, even
 // at the cost of losing a support Pokémon's on-play ability.
 if(m.minimumCount===1&&picks.length===1&&capacity>1&&['flutter','sudo','koko','marsh'].includes(present[0])){
  const b=selected.filter(c=>!picks.includes(c)&&kind(c)!=='bird').sort((a,b)=>activeScore(kind(b),h,[],false)-activeScore(kind(a),h,[],false));
  if(b.length)picks.push(b[0]);
 }
 if(picks.length)return {kind:'select-choices',tokens:picks.map(c=>c.token)};
 const e=cs.find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
 return m.minimumCount===0&&e?{kind:'select-choice',token:e.token}:null;
}
function decide(r){
 const o=r?.observation,p=r?.prompt,s=p?.source;
 if(r?.role!=='opponent'||r.seat!==o?.actorSeat||o.phase!==1||o.globalTurn!==0||s?.classification!=='actor-choice'||s.sourceKind!=='engine'||s.sourcePrinting!==null)return null;
 const cs=list(p.choices),m=p.publicMetadata??{};
 if(p.promptType==='ConfirmPrompt'&&s.effectName==='GO_FIRST'){
  if(o.ownPublic?.active||list(o.ownHand).length||m.selectionType!=='confirm')return null;
  const no=cs.filter(c=>c.kind==='confirm'&&c.label==='No'&&typeof c.token==='string');
  return no.length===1?{kind:'select-choice',token:no[0].token}:null;
 }
 if(p.promptType==='SelectPrompt'&&s.effectName==='WANT_TO_DRAW_CARDS'){
  const deck=o.ownPublic?.deckCount;
  if(!o.ownPublic?.active||!Number.isSafeInteger(deck)||deck<1||m.selectionType!=='option'||m.allowCancel!==false)return null;
  const ranked=cs.filter(c=>c.kind==='option'&&typeof c.token==='string').map(c=>({c,n:Number(/^Draw (\d+) card\(s\)$/.exec(c.label??'')?.[1])})).filter(x=>Number.isSafeInteger(x.n)&&x.n>=0&&x.n<deck).sort((a,b)=>b.n-a.n);
  return ranked.length?{kind:'select-choice',token:ranked[0].c.token}:null;
 }
 if(p.promptType==='ChooseCardsPrompt'&&s.effectName==='CHOOSE_STARTING_POKEMONS')return cards(p,o);
 return null;
}
module.exports={decide,kind,activeScore,benchScore};
