'use strict';
// Actor-visible tactical response to the fixed Lockbridge opponent's
// Bide Barricade + Stealthy Hood + Temple of Sinnoh. Native roots only.
const opening=require('./agent23-rank19-opening.cjs');
const mobility=require('./agent23-rank19-mobility.cjs');
const bolt=require('./agent23-rank19-bellowing-thunder-draft.cjs');
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
const list=x=>Array.isArray(x)?x:[];
const md=x=>x?.publicMetadata??{};
const match=(x,re)=>re.test(name(x));
const kind=opening.kind;
const WOB=/^Wobbuffet PHF(?: 36)?$/;
const HOOD=/^Stealthy Hood UNB(?: 186)?$/;
const TEMPLE=/^Temple of Sinnoh ASR(?: 155)?$/;
const DDE=/^Double Dragon Energy ROS(?: 97)?$/;
const BLOWER=/^Field Blower GRI(?: 125)?$/;
const SKY=/^Sky Field ROS(?: 89)?$/;
const sel=x=>({kind:'select-action',token:x.token});
const choices=x=>({kind:'select-choices',tokens:x.map(a=>a.token)});
const slots=p=>[{zone:'active',index:0,pokemon:p?.active},...list(p?.bench).map((pokemon,index)=>({zone:'bench',index,pokemon}))].filter(x=>x.pokemon);
function ability(p,n,suppressed=false){return list(p?.abilitySuppressions).some(a=>a.abilityName===n&&a.suppressed===suppressed);}
function state(o){
 const own=o?.ownPublic,foe=o?.opponentPublic;
 const board=slots(own),enemy=slots(foe),hand=list(o?.ownHand),discard=list(own?.discard);
 const stadium=[...list(own?.stadium),...list(foe?.stadium)];
 const temple=stadium.some(x=>match(x,TEMPLE)),wobb=match(foe?.active,WOB);
 const hood=wobb&&list(foe.active.tools).some(x=>match(x,HOOD));
 const lock=wobb&&ability(foe.active,'Bide Barricade');
 const dde=board.some(s=>['bolt','adp'].includes(kind(s.pokemon))&&list(s.pokemon.energies).some(x=>match(x,DDE)))||
  hand.some(x=>match(x,DDE))&&[...board.map(s=>s.pokemon),...hand].some(x=>['bolt','adp'].includes(kind(x)));
 const flutter=board.find(s=>kind(s.pokemon)==='flutter');
 const dark=discard.some(x=>bolt.basic(x)==='Darkness');
 const ho=discard.some(x=>kind(x)==='bird');
 const fuel=dark&&board.some(s=>kind(s.pokemon)==='moltres'&&ability(s.pokemon,'Direflame Wings',true))||
  ho&&new Set(discard.map(bolt.basic).filter(Boolean)).size>=3||
  board.some(s=>kind(s.pokemon)==='sandy'&&ability(s.pokemon,'Magnetic Absorption',true))&&discard.some(x=>bolt.basic(x)==='Fighting')||
  board.some(s=>kind(s.pokemon)==='koko'&&ability(s.pokemon,'Dance of the Ancients',true))&&discard.filter(x=>bolt.basic(x)==='Lightning').length>=2||
  hand.length<=3&&hand.some(x=>['lele','crobat','dedenne','squawk'].includes(kind(x)));
 return {own,foe,board,enemy,hand,discard,temple,wobb,hood,lock,dde,flutter,fuel};
}
function held(x,s,re){const i=md(x).handIndex;return x.kind==='play-card'&&match(x.actorPrinting,re)&&Number.isSafeInteger(i)&&match(s.hand[i],re);}
function exactRootSlot(s,a,source=false){
 const m=md(a),seat=source?m.sourceSeat:m.targetSeat,zone=source?m.sourceZone:m.targetZone,index=source?m.sourceIndex:m.targetIndex;
 const x=s.board.find(x=>x.zone===zone&&x.index===index);
 if(seat!=='actor'||!x||kind(x.pokemon)!==kind(source?a.actorPrinting:a.targetPrinting))return null;
 return x;
}
function root(r,caps={discard:false,attach:false}){
 const o=r?.observation;if(r?.role!=='opponent'||r.seat!==o?.actorSeat||!o.ownPublic?.active||!o.opponentPublic?.active)return null;
 const s=state(o),items=list(r.actionFrontier?.items);
 if(!s.temple&&!s.lock)return null;
 if(mobility.attackRoot(r,caps,true))return null;
 // A single Blower removes both lock pieces; prefer this when Flutter can
 // disable the Wobbuffet after losing Hood. Preserve a live attacker.
 const blower=items.find(x=>held(x,s,BLOWER));
 const dual=s.lock&&s.hood&&!!s.flutter&&s.fuel;
 if(blower&&dual)return sel(blower);
 if(s.temple&&s.dde){
  // Resetting Hole has no continuation and its Psychic source is exempt
  // from Bide Barricade. Spend it only if the source is an unpowered Bench.
  const reset=items.find(x=>x.kind==='use-ability'&&md(x).abilityName==='Resetting Hole'&&kind(x.actorPrinting)==='marsh'&&exactRootSlot(s,x,true)?.zone==='bench'&&list(exactRootSlot(s,x,true)?.pokemon.energies).length===0);
  if(reset)return sel(reset);
  if(blower)return sel(blower);
  const sky=items.find(x=>held(x,s,SKY));if(sky)return sel(sky);
 }
 if(s.lock&&!s.hood&&s.flutter?.zone==='bench'&&s.fuel){
  // Do not abandon a ready knockout to unlock an engine. The retreat also
  // consumes the turn's mobility; plan for setup rather than double retreat.
  if(mobility.attackRoot(r,caps))return null;
  const bench=mobility.bestBench(o,s.foe.active,caps);if(bench?.attack.lethal)return null;
  if(mobility.freeRetreat(o,s.own.active)){
   const pivot=items.find(x=>x.kind==='retreat'&&exactRootSlot(s,x)?.zone==='bench'&&exactRootSlot(s,x)?.index===s.flutter.index);
   if(pivot)return sel(pivot);
  }
 }
 return null;
}
function opponentSlot(s,c){
 const m=md(c);if(c.kind!=='pokemon'||m.ownerSeat!=='opponent'||m.isOwnerVisible!==true)return null;
 const i=m.targetZone==='active'?0:m.benchIndex;
 const x=s.enemy.find(x=>x.zone===m.targetZone&&x.index===i);
 return x&&name(x.pokemon)===name(c)?x:null;
}
function prompt(r){
 const o=r?.observation,p=r?.prompt,src=p?.source;
 if(r?.role!=='opponent'||r.seat!==o?.actorSeat||src?.sourceKind!=='card-effect'||!match(src.sourcePrinting,BLOWER)||src.effectName!=='Field Blower')return null;
 const s=state(o),cs=list(p.choices),m=md(p);
 if(p.promptType==='SelectOptionPrompt'&&m.selectionType==='option'){
  const i=s.temple&&s.dde?0:1,c=cs.find(x=>x.kind==='option'&&md(x).choiceIndex===i&&typeof x.token==='string');
  return c?{kind:'select-choice',token:c.token}:null;
 }
 if(p.promptType==='ChoosePokemonPrompt'&&m.selectionType==='pokemon'&&m.minimumCount===0&&Number.isSafeInteger(m.maximumCount)&&m.maximumCount>=0&&m.maximumCount<=2){
  const ranked=cs.map(c=>({c,x:opponentSlot(s,c)})).filter(y=>y.x&&list(y.x.pokemon.tools).length===1).map(y=>{
   const tool=name(y.x.pokemon.tools[0]);
   const score=HOOD.test(tool)&&match(y.x.pokemon,WOB)&&s.flutter&&s.fuel?120:/^Forest Seal Stone SIT/.test(tool)&&s.foe.publicTurnRestrictions?.vstarUsed===false?70:HOOD.test(tool)?50:/^Float Stone BKT/.test(tool)?40:0;
   return {...y,score};
  }).filter(y=>y.score>0).sort((a,b)=>b.score-a.score);
  const selected=ranked.slice(0,m.maximumCount).map(y=>y.c);
  if(selected.length)return choices(selected);
  const empty=cs.find(c=>c.kind==='empty-selection');return empty?{kind:'select-choice',token:empty.token}:null;
 }
 return null;
}
module.exports={root,prompt,state};
