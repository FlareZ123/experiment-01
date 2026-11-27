'use strict';
// Actor-causal restricted opening model, two own turns, no opponent play
// except the explicit hypothetical discard cut. Not a full policy or game.
const H=require('./agent29-rank9-horror-opening.cjs');
const D='Darkness Energy',P='Prism Energy',T='Telepathic Psychic Energy',M='Mega Absol ex',V='Voltorb',E='Electrode-GX',U='Unown',VIP='Battle VIP Pass',UB='Ultra Ball',BC='Battle Compressor',HB='Hisuian Heavy Ball',F='Float Stone',R='Escape Rope',SB='Secret Box';
const energy=c=>[D,P,T].includes(c),dark=c=>[D,P].includes(c);
const basic=c=>[U,V,'Toedscool',M,'Sableye V','Gengar & Mimikyu-GX','Dedenne-GX','Squawkabilly ex'].includes(c);
function random(seed){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
function shuffle(a,rng){for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a}
function deal(rng){for(;;){const d=shuffle(H.deck.slice(),rng);if(d.slice(0,7).some(basic))return {hand:d.slice(0,7),prizes:d.slice(7,13),deck:d.slice(13)};}}
function rem(a,c){const i=a.indexOf(c);if(i<0)throw Error('missing '+c);a.splice(i,1);return c}
const pokemon=n=>({name:n,under:[],energy:[],tools:[],ready:false});
function state(d,rng,opts){const h=d.hand.slice(),a=H.oldSetup(h);rem(h,a);return {hand:h,deck:d.deck.slice(),prizes:d.prizes.slice(),discard:[],lost:[],active:pokemon(a),bench:[],rng,opts,turn:0,manual:false,known:false,trace:[]};}
const board=s=>[s.active,...s.bench].filter(Boolean),on=(s,n)=>board(s).find(p=>p.name===n),has=(s,c)=>s.hand.includes(c),access=(s,c)=>has(s,c)||on(s,c);
function put(s,c){if(!has(s,c)||!basic(c)||s.bench.length>=5)return false;rem(s.hand,c);s.bench.push(pokemon(c));s.trace.push('bench:'+c);return true}
function basics(s){for(const n of [V,M])if(!on(s,n)&&has(s,n))put(s,n)}
function draw(s){if(s.deck.length)s.hand.push(s.deck.shift())}
function spend(s,c){rem(s.hand,c);s.discard.push(c);s.trace.push('play:'+c)}
function search(s,targets,limit){const picked=[];s.known=true;for(const c of targets){if(picked.length>=limit)break;if(s.deck.includes(c)){rem(s.deck,c);s.hand.push(c);picked.push(c)}}shuffle(s.deck,s.rng);return picked}
const available=(s,c)=>!s.known||s.deck.includes(c);
function vip(s){if(s.turn!==1||!has(s,VIP)||s.bench.length>=5)return false;
 const want=(s.opts.voltorbFirst?[V,M]:[M,V]).filter(c=>!access(s,c));if(!want.length)return false;
 spend(s,VIP);search(s,want,Math.min(2,5-s.bench.length));basics(s);return true;
}
function heavy(s){if(!s.opts.heavy||!has(s,HB))return false;
 const want=(s.turn===1?[V,M]:[M]).filter(c=>!access(s,c));if(!want.length)return false;
 // Activation follows visible missing Basic, not the hidden Prize outcome.
 const target=want.find(c=>s.prizes.includes(c));rem(s.hand,HB);s.trace.push('play:'+HB);
 if(target){rem(s.prizes,target);s.prizes.push(HB);s.hand.push(target);shuffle(s.prizes,s.rng);basics(s);}else s.discard.push(HB);
 return true;
}
function costs(s,card,n){
 const h=s.hand.slice();rem(h,card);
 const count=h.filter(energy).length;
 const value=c=>{
   if([V,M,E,BC,SB,F,R].includes(c)||c===VIP&&s.turn===1)return 1000;
   if(c===UB||c===HB&&s.opts.heavy)return 50;
   if(energy(c))return !s.opts.energyCosts||!s.manual&&count<=1?1000:dark(c)?5:10;
   return c===VIP&&s.turn!==1?0:20;
 };
 const chosen=h.map((c,i)=>({c,i,v:value(c)})).filter(x=>x.v<1000).sort((a,b)=>a.v-b.v||a.i-b.i).slice(0,n).map(x=>x.c);
 if(chosen.length!==n||!s.manual&&count>0&&chosen.filter(energy).length===count)return null;
 return chosen;
}
function pay(s,card,cs){spend(s,card);for(const c of cs){rem(s.hand,c);s.discard.push(c)}}
function ultra(s){if(!s.opts.ultra||!has(s,UB))return false;
 const order=s.turn===1?(s.opts.voltorbFirst?[V,M]:[M,V]):[E,M];
 const want=order.find(c=>!access(s,c)&&(c!==E||on(s,V))&&available(s,c));if(!want)return false;
 const cs=costs(s,UB,2);if(!cs)return false;
 pay(s,UB,cs);search(s,[want],1);basics(s);return true;
}
function box(s){if(!s.opts.box||!has(s,SB))return false;
 const cs=costs(s,SB,3);if(!cs)return false;
 const missing=s.turn===1?!access(s,V)||!access(s,M):!access(s,E)||!access(s,M);
 const needBC=s.opts.compressor&&!has(s,BC)&&s.discard.filter(dark).length<2;
 if(!missing&&!needBC)return false;
 pay(s,SB,cs);const items=[];
 if(s.turn===1&&missing)items.push(VIP);if(missing&&s.opts.ultra)items.push(UB);if(needBC)items.push(BC);if(missing&&s.opts.heavy)items.push(HB);
 const item=items.find(x=>s.deck.includes(x)&&!has(s,x));
 const picked=[item,s.active?.name!==M&&!has(s,F)?F:null].filter(Boolean);
 search(s,picked,picked.length);return true;
}
function compressor(s){if(!s.opts.compressor||!has(s,BC)||s.turn===1&&s.opts.deferCompressor)return false;
 if(!access(s,V)&&!access(s,E)||!access(s,M))return false;
 const need=Math.max(0,3-s.discard.filter(dark).length);if(!need)return false;
 spend(s,BC);
 const eligible=s.deck.filter(energy),reserve=!s.manual&&!s.hand.some(energy)?1:0,n=Math.min(3,need,Math.max(0,eligible.length-reserve));
 for(const c of eligible.slice().sort((a,b)=>Number(dark(b))-Number(dark(a))).slice(0,n)){rem(s.deck,c);s.discard.push(c);}
 s.known=true;shuffle(s.deck,s.rng);return true;
}
function attach(s){if(s.manual)return false;const p=on(s,M),c=s.hand.find(dark)??s.hand.find(energy);if(!p||!c)return false;
 rem(s.hand,c);p.energy.push(c);s.manual=true;s.trace.push('attach:'+c);return true;
}
function evolve(s){const v=on(s,V);if(s.turn!==2||!v||!v.ready||!has(s,E))return false;rem(s.hand,E);v.under.push(V);v.name=E;s.trace.push('evolve');return true}
function build(s){basics(s);for(let k=0;k<16;k++){if(vip(s)||heavy(s)||ultra(s)||box(s)||compressor(s)||attach(s)||evolve(s)){basics(s);continue}break;}}
const payClaw=cs=>cs.length>=3&&cs.filter(dark).length>=2;
function retreatCost(n){return ({[V]:1,[E]:1,[M]:2,[U]:1,'Toedscool':1,'Sableye V':1,'Gengar & Mimikyu-GX':2,'Dedenne-GX':1,'Squawkabilly ex':1})[n]??99}
function mobility(s,extra=0,sourceActive=false){if(s.active?.name===M)return 'active';if(sourceActive&&s.active?.name===E)return 'self-KO promotion';if(has(s,F))return 'Float Stone';if(has(s,R)&&s.opts.ropeSafe)return 'Escape Rope';if(s.active.energy.length+extra>=retreatCost(s.active.name))return 'paid retreat';return null}
function attack(s){
 const m=on(s,M),e=on(s,E);if(!m)return {ready:false,why:'Mega missing'};
 if(payClaw(m.energy)&&mobility(s))return {ready:true,route:'manual '+mobility(s)};
 if(!e)return {ready:false,why:'Electrode missing'};
 const pool=s.discard.filter(energy);if(!pool.length)return {ready:false,why:'discard empty'};
 const required=Math.min(5,pool.length);
 const eligible=p=>!['Electrode-GX','Dedenne-GX','Gengar & Mimikyu-GX'].includes(p.name);
 for(let mask=0;mask<(1<<pool.length);mask++){
   const selected=pool.filter((_,i)=>mask&(1<<i));if(selected.length!==required)continue;
   for(let msk=0;msk<(1<<selected.length);msk++){
     const own=selected.filter((_,i)=>msk&(1<<i)),other=selected.filter((_,i)=>!(msk&(1<<i)));
     if(!payClaw([...m.energy,...own]))continue;
     const a=s.active,sourceActive=a?.name===E,pivot=a!==m&&eligible(a),backup=board(s).some(p=>p!==m&&p!==e&&eligible(p));
     if(other.length&&!pivot&&!backup)continue;
     const route=mobility(s,pivot?other.length:0,sourceActive);
     if(route)return {ready:true,route:'Bomb '+route,required,megaFuel:own,otherFuel:other};
   }
 }
 return {ready:false,why:'insufficient Energy or mobility'};
}
function check(s){const found=[...s.hand,...s.deck,...s.prizes,...s.discard,...s.lost,...board(s).flatMap(p=>[p.name,...p.under,...p.energy,...p.tools])].sort();if(JSON.stringify(found)!==JSON.stringify(H.deck.slice().sort()))throw Error('card conservation')}
function play(d,seed,opts={}){
 const cfg={voltorbFirst:true,heavy:true,ultra:true,box:true,compressor:true,energyCosts:true,deferCompressor:false,ropeSafe:false,cut:0,...opts},s=state(d,random(seed),cfg);
 s.turn=1;draw(s);build(s);const turn1Voltorb=!!on(s,V),discardedT1=s.discard.filter(energy).length;
 for(const p of board(s))p.ready=true;
 const cut=s.discard.filter(energy).sort((a,b)=>Number(dark(b))-Number(dark(a))).slice(0,cfg.cut);
 for(const c of cut){rem(s.discard,c);s.lost.push(c)}
 s.turn=2;s.manual=false;draw(s);build(s);check(s);
 return {...attack(s),turn1Voltorb,discardedT1,cut:cut.length,trace:s.trace};
}
function simulate(n=25000,seed=20261127){
 const opts={eager:{},defer:{deferCompressor:true},eagerCut:{cut:2},deferCut:{cut:2,deferCompressor:true},megaFirst:{voltorbFirst:false},withoutBox:{box:false},withoutHeavy:{heavy:false},withoutEnergyCosts:{energyCosts:false},withSafeRope:{ropeSafe:true}};
 const stats=Object.fromEntries(Object.keys(opts).map(k=>[k,{ready:0,turn1Voltorb:0,discardedT1:0,cut:0,routes:{},failure:{}}])),rng=random(seed);
 let pairedCutSaved=0,pairedCutLost=0,pairedDeferGain=0,pairedDeferLoss=0;
 for(let i=0;i<n;i++){
  const d=deal(rng),s=Math.floor(rng()*4294967296),res={};
  for(const [key,cfg] of Object.entries(opts)){const r=play(d,s,cfg),x=stats[key];res[key]=r;x.ready+=Number(r.ready);x.turn1Voltorb+=Number(r.turn1Voltorb);x.discardedT1+=r.discardedT1;x.cut+=r.cut;const k=r.ready?r.route:r.why,bin=r.ready?x.routes:x.failure;bin[k]=(bin[k]??0)+1}
  if(res.deferCut.ready&&!res.eagerCut.ready)pairedCutSaved++;if(res.eagerCut.ready&&!res.deferCut.ready)pairedCutLost++;
  if(res.defer.ready&&!res.eager.ready)pairedDeferGain++;if(res.eager.ready&&!res.defer.ready)pairedDeferLoss++;
 }
 return {n,seed,stats,pairedCutSaved,pairedCutLost,pairedDeferGain,pairedDeferLoss};
}
module.exports={random,deal,play,simulate,payClaw};
if(typeof require==='function'&&require.main===module)console.log(JSON.stringify(simulate(Number(process.argv[2]??25000),Number(process.argv[3]??20261127)),null,2));
