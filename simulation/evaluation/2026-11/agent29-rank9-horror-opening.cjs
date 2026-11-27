'use strict';
// Rank-9 first-own-turn source route model. Not a native game or win-rate model.
// Every deal is a physical 60 permutation conditioned on an initial legal
// Basic. Source is going second, opponent has not disrupted hand/items/
// retreat/special Energy, GX unused, opponent hand nonempty. No random
// in-turn draws, hidden-hand oracle, opponent simulator or favorable gust.
const inventory=Object.freeze([
 ['Unown',4],['Voltorb',1],['Electrode-GX',2],['Toedscool',1],['Toedscruel',2],['Mega Absol ex',1],['Sableye V',1],['Gengar & Mimikyu-GX',1],['Dedenne-GX',1],['Squawkabilly ex',1],
 ['Iono',2],['Guzma',2],['Plumeria',1],['Battle VIP Pass',4],["Trainers' Mail",4],['Rescue Carrier',4],['Ultra Ball',3],['Rescue Stretcher',3],['Hisuian Heavy Ball',2],['VS Seeker',2],['Battle Compressor',1],['Escape Rope',1],['Canceling Cologne',1],['Secret Box',1],['Float Stone',1],['Muscle Band',1],['Forest Seal Stone',1],['Silent Lab',2],['Path to the Peak',1],['PokéStop',1],['Prism Energy',4],['Darkness Energy',2],['Telepathic Psychic Energy',1]
]);
const deck=inventory.flatMap(([n,count])=>Array(count).fill(n));
const gen='Gengar & Mimikyu-GX',fuel=c=>c==='Prism Energy'||c==='Telepathic Psychic Energy';
const priority=['Mega Absol ex','Unown',gen,'Sableye V','Toedscool','Squawkabilly ex','Dedenne-GX','Voltorb'];
const isBasic=c=>priority.includes(c);
function random(seed){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
function physicalDeal(rng){
 for(;;){const d=deck.slice();for(let i=d.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[d[i],d[j]]=[d[j],d[i]];}const h=d.slice(0,7);if(h.some(isBasic))return {h,prizes:d.slice(7,13),draw:d[13],deck:d.slice(14)};}
}
function oldSetup(h){return priority.find(x=>h.includes(x))??null}
function adaptiveSetup(h){return h.includes(gen)&&h.some(fuel)?gen:oldSetup(h)}
function classify(deal,adaptive=false,temple=false){
 const {h,prizes,draw}=deal,H=[...h,draw],active=adaptive?adaptiveSetup(h):oldSetup(h);
 if(!H.some(fuel))return null;
 // A live Temple suppresses BOTH source Psychic-producing special Energy.
 // With no replacement card in the visible first-eight hand, no claim of
 // this restricted route succeeding; Box/FSS or draw routes are omitted.
 if(temple&&!H.some(c=>['Silent Lab','Path to the Peak','PokéStop'].includes(c)))return null;
 if(active===gen)return 'active';
 const switcher=H.includes('Float Stone')?'Float Stone':H.includes('Escape Rope')?'Escape Rope':null;
 if(!switcher)return null;
 if(H.includes(gen))return 'hand+'+switcher;
 // This is the execution outcome of the fixed policy "VIP search for
 // Gengar if the visible fuel+switch prerequisites hold", not a policy
 // that reads a hidden prize position before choosing VIP.
 if(H.includes('Battle VIP Pass')&&!prizes.includes(gen)&&deal.deck.includes(gen))return 'VIP+'+switcher;
 return null;
}
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return v}
function exactDirect(){
 const basicCount=deck.filter(isBasic).length;
 const legal=1-choose(60-basicCount,7)/choose(60,7);
 // Gengar in initial seven, fuel among six other opening cards or normal
 // draw (the intervening six Prizes are marginalized).
 const any8=(7/60)*(1-choose(54,7)/choose(59,7))/legal;
 const initial=(7/60)*(1-choose(54,6)/choose(59,6))/legal;
 return {basicCount,legal,allGengarActiveDirect:any8,adaptiveGuaranteedInitialFuel:initial};
}
function simulate(n=100000,seed=20261127){
 if(deck.length!==60||!Number.isInteger(n)||n<1)throw Error('invalid input');
 const rng=random(seed),count={old:{},adaptive:{},templeOld:{},templeAdaptive:{}};
 let improved=0,worsened=0,initialGenFuel=0,allGenFuel8=0;
 for(let i=0;i<n;i++){
  const deal=physicalDeal(rng);
  if(deal.h.includes(gen)&&deal.h.some(fuel))initialGenFuel++;
  if(deal.h.includes(gen)&&[...deal.h,deal.draw].some(fuel))allGenFuel8++;
  const old=classify(deal),adapt=classify(deal,true),to=classify(deal,false,true),ta=classify(deal,true,true);
  for(const [key,result] of [['old',old],['adaptive',adapt],['templeOld',to],['templeAdaptive',ta]])count[key][result??'not certified']=(count[key][result??'not certified']??0)+1;
  if(!old&&adapt)improved++;if(old&&!adapt)worsened++;
 }
 return {n,seed,count,improved,worsened,initialGenFuel,allGenFuel8,exact:exactDirect()};
}
module.exports={inventory,deck,physicalDeal,oldSetup,adaptiveSetup,classify,simulate,exactDirect};
if(typeof require==='function'&&require.main===module)console.log(JSON.stringify(simulate(Number(process.argv[2]??100000),Number(process.argv[3]??20261127)),null,2));
