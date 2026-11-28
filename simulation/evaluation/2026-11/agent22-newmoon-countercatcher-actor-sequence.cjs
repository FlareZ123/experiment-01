'use strict';
/**
 * Research-only actor-frontier contingent execution for exact New Moon v3.
 * Root -> Dusknoir Cursed Blast bench target prompt -> selfKO settlement ->
 * newly legal Counter Catcher -> opponent Bench selection prompt ->
 * paid Mewtwo attack: Miraculous Duo-GX for Mega 3-Prize target, or
 * donor-certified Night Watch for a 2-Prize Regidrago VSTAR.
 *
 * Never manufactures actions or guesses hidden zones. Only exact source,
 * actor/turn, Bench index, current hand, Prize count, damage and prompt tokens.
 * State is held solely within one createSlice instance and is reset on turn,
 * seat or any phase mismatch. Not full-game policy, not a native game.
 */
const has=(x,s)=>typeof x==='string'&&x.includes(s);
const int=x=>Number.isSafeInteger(x)&&x>=0;
const select=(x,reason)=>({decision:{kind:'select-action',token:x.token},reason});
const TOPS=Object.freeze([
 {name:'Mega Lopunny ex',hp:330,prizes:3,attackName:'Miraculous Duo-GX',attackDamage:200},
 {name:'Mega Kangaskhan ex',hp:300,prizes:3,attackName:'Miraculous Duo-GX',attackDamage:200},
 {name:'Mega Absol ex',hp:280,prizes:3,attackName:'Miraculous Duo-GX',attackDamage:200},
 {name:'Mega Dragonite ex',hp:370,prizes:3,attackName:'Miraculous Duo-GX',attackDamage:200},
 {name:'Regidrago VSTAR',hp:280,prizes:2,attackName:'Night Watch',attackDamage:150}
]);
function abilitySource(own,items){
 if(!Array.isArray(own?.bench)||!Array.isArray(items))return null;
 for(const [index,p] of own.bench.entries()){
  if(!p||!has(p.printing,'Dusknoir')||has(p.printing,'Trevenant & Dusknoir-GX')||
     !Array.isArray(p.abilities)||!p.abilities.includes('Cursed Blast')||
     p.abilitySuppressions?.find(x=>x.abilityName==='Cursed Blast')?.suppressed!==false)
   continue;
  const a=items.find(x=>x.kind==='use-ability'&&
   x.publicMetadata?.abilityName==='Cursed Blast'&&
   x.publicMetadata?.sourceZone==='bench'&&
   x.publicMetadata?.sourceIndex===index&&
   (!x.actorPrinting||x.actorPrinting===p.printing));
  if(a)return a;
 }
 return null;
}
function offeredMewtwoAttack(own,items,name='Miraculous Duo-GX'){
 if(!has(own?.active?.printing,'Mewtwo & Mew-GX')||
    !Array.isArray(items)||!Array.isArray(own.bench)||
    !['Miraculous Duo-GX','Night Watch'].includes(name))return null;
 if(name==='Miraculous Duo-GX'&&
    own.publicTurnRestrictions?.gxUsed!==false)return null;
 const active=own.active;
 return items.find(x=>{
  if(x.kind!=='attack'||x.attackName!==name||
     x.publicMetadata?.attackCostPayable!==true)return false;
  const s=x.publicMetadata.attackSource;
  if(name==='Miraculous Duo-GX')
   return x.actorPrinting===active.printing&&
     s?.sourceKind==='active-pokemon'&&s.sourceSlot==='ACTIVE'&&
     s.sourceCardFullName===active.printing;
  // Bench GX donor only; discard-copy Perfection prompts require a separate
  // strictly owner-visible ChooseAttackPrompt handler, not invented evidence.
  if(!Array.isArray(active.abilities)||!active.abilities.includes('Perfection')||
     active.abilitySuppressions?.find(y=>y.abilityName==='Perfection')?.suppressed!==false||
     s?.sourceKind!=='bench-pokemon'||s.sourceSlot!=='BENCH'||
     !int(s.sourceIndex))return false;
  const donor=own.bench[s.sourceIndex];
  return !!donor&&has(donor.printing,'Trevenant & Dusknoir-GX')&&
    s.sourceCardFullName===donor.printing&&
    x.actorPrinting===donor.printing&&
    s.attackName==='Night Watch';
 });
}
function liveFairyZone(own){
 return Array.isArray(own?.bench)&&own.bench.some(p=>
   has(p?.printing,"Lillie's Clefairy ex")&&
   Array.isArray(p.abilities)&&p.abilities.includes('Fairy Zone')&&
   p.abilitySuppressions?.find(s=>s.abilityName==='Fairy Zone')?.suppressed===false);
}
function validRootTarget(target,own){
 if(!target||!int(target.hp)||!int(target.damage)||!Array.isArray(target.tools)||
    target.tools.length>0||target.damage>=target.hp)return null;
 const def=TOPS.find(t=>has(target.printing,t.name)&&target.hp===t.hp);
 if(!def)return null;
 const remaining=target.hp-target.damage;
 // No later gust if Blast alone KOs. Printed Dragonite 370 exceeds
 // 130+Miraculous200 unless already damaged >=40 OR live, actor-visible
 // Lillie's Clefairy Fairy Zone gives the Dragon target Psychic Weakness x2.
 // Do not assume general weakness for other named targets. Later recheck
 // the native post-gust damage regardless of this structural screen.
 const dragonWeak=def.name==='Mega Dragonite ex'&&
   liveFairyZone(own)&&(!Array.isArray(target.printed?.types)||
     target.printed.types.includes('Dragon'));
 const maxAfterBlast=130+def.attackDamage*(dragonWeak?2:1);
 return remaining>130&&remaining<=maxAfterBlast?
   {def,remaining,dragonFairyZoneProjected:dragonWeak}:null;
}
function certifiedDamage(attack,target){
 const m=attack?.publicMetadata;
 if(!m||m.attackCostPayable!==true||
    m.damagePrevented===true||m.hasUnmodeledModifier===true||
    (typeof m.damageReduced==='number'&&m.damageReduced>0)||
    !Number.isFinite(m.damageAfterResistance)||
    m.damageAfterResistance<target.hp-target.damage||
    (m.targetHp!==undefined&&m.targetHp!==target.hp)||
    (m.targetDamage!==undefined&&m.targetDamage!==target.damage))return false;
 return true;
}
function ownerBenchChoice(p,seat,source,print,index){
 if(!p||p.actingSeat!==seat||p.promptType!=='ChoosePokemonPrompt'||
    p.source?.classification!=='actor-choice'||
    p.source.sourceKind!=='card-effect'||
    p.source.effectName!==source||
    !has(p.source.sourcePrinting,source==='Cursed Blast'?'Dusknoir':source)||
    p.publicMetadata?.selectionType!=='pokemon'||
    p.publicMetadata?.minimumCount!==1||
    p.publicMetadata?.maximumCount!==1||
    !Array.isArray(p.choices))return null;
 return p.choices.find(x=>x.kind==='pokemon'&&
    x.publicMetadata?.isOwnerVisible===true&&
    x.publicMetadata.ownerSeat==='opponent'&&
    x.publicMetadata.targetZone==='bench'&&
    x.publicMetadata.benchIndex===index&&x.printing===print)??null;
}
function createSlice({seat}){
 if(seat!==0&&seat!==1)throw Error('ACTOR_SEAT_REQUIRED');
 let pending=null;
 const reset=()=>{pending=null;};
 function decide(request){
  const v=request?.observation,items=request?.actionFrontier?.items;
  if(request?.seat!==seat||request.role!=='candidate'||
     v?.actorSeat!==seat||!int(v?.globalTurn)){
   reset();return null;
  }
  if(pending&&pending.turn!==v.globalTurn){reset();return null;}
  const own=v.ownPublic,opp=v.opponentPublic;
  if(!own||!opp||!Array.isArray(opp.bench)||!Array.isArray(own.bench)||
     !int(own.prizeCount)||!int(opp.prizeCount)){reset();return null;}
  if(v.decisionKind==='owner-prompt'){
   if(!pending||request.actionFrontier!==null){reset();return null;}
   const p=request.prompt,idx=pending.benchIndex;
   if(pending.phase==='blast-target'){
    // Enemy Bench still holds the same un-removed card, as visible at root.
    const slot=opp.bench[idx];
    if(slot?.printing!==pending.targetPrinting||
       slot.hp!==pending.hp||slot.damage!==pending.startDamage){reset();return null;}
    const choice=ownerBenchChoice(p,seat,'Cursed Blast',pending.targetPrinting,idx);
    if(!choice){reset();return null;}
    pending.phase='post-blast';
    return {decision:{kind:'select-choices',tokens:[choice.token]},
     reason:'A22_COUNTERCATCHER_TARGET_BENCHED_PRIZE_POKEMON'};
   }
   if(pending.phase==='gust-target'){
    const target=opp.bench[idx];
    if(target?.printing!==pending.targetPrinting||
       target.hp!==pending.hp||
       target.damage<pending.startDamage+130){reset();return null;}
    const choice=ownerBenchChoice(p,seat,'Counter Catcher',
      pending.targetPrinting,idx);
    if(!choice){reset();return null;}
    pending.phase='post-gust';
    return {decision:{kind:'select-choices',tokens:[choice.token]},
     reason:'A22_COUNTERCATCHER_GUST_DAMAGED_PRIZE_POKEMON'};
   }
   reset();return null;
  }
  if(v.decisionKind!=='owner-root'||request.prompt!==null||
     !Array.isArray(items)){reset();return null;}
  if(pending){
   if(own.prizeCount!==pending.ownPrizes||
      opp.prizeCount!==pending.opponentPrizes-1||
      own.active?.printing!==pending.attackerPrinting){
    reset();return null;
   }
   if(pending.phase==='post-blast'){
    const t=opp.bench[pending.benchIndex];
    if(!t||t.printing!==pending.targetPrinting||
       t.hp!==pending.hp||t.damage<pending.startDamage+130||
       t.damage>=t.hp||!Array.isArray(t.tools)||t.tools.length>0){
      reset();return null;
    }
    // A literal offered native Item token after selfKO is indispensable:
    // never assume Counter Catcher remains playable because it is in hand.
    const cc=items.find(x=>x.kind==='play-card'&&
      has(x.actorPrinting,'Counter Catcher')&&
      x.publicMetadata?.cardType==='trainer'&&
      int(x.publicMetadata.handIndex)&&Array.isArray(v.ownHand)&&
      has(v.ownHand[x.publicMetadata.handIndex],'Counter Catcher'));
    if(!cc){reset();return null;}
    pending.phase='gust-target';
    return select(cc,'A22_PLAY_NEWLY_LEGAL_COUNTERCATCHER_AFTER_SELFKO');
   }
   if(pending.phase==='post-gust'){
    const t=opp.active;
    if(!t||t.printing!==pending.targetPrinting||
       t.hp!==pending.hp||t.damage<pending.startDamage+130||
       !Array.isArray(t.tools)||t.tools.length>0){
      reset();return null;
    }
    const attackName=pending.attackName;
    const a=offeredMewtwoAttack(own,items,attackName);
    if(!a||!certifiedDamage(a,t)){reset();return null;}
    reset();
    return select(a,attackName==='Miraculous Duo-GX'?
      'A22_MIRACULOUS_GX_AFTER_GUST_FOR_FINAL_THREE_PRIZES':
      'A22_NIGHT_WATCH_AFTER_GUST_FOR_FINAL_TWO_PRIZES');
   }
   reset();return null;
  }
  if(own.prizeCount!==opp.prizeCount||own.prizeCount<=1||
     !Array.isArray(v.ownHand)||
     !v.ownHand.some(x=>has(x,'Counter Catcher')))return null;
  const blast=abilitySource(own,items);
  if(!blast)return null;
  for(let i=0;i<opp.bench.length;i++){
   const t=opp.bench[i],check=validRootTarget(t,own);
   if(!check||check.def.prizes!==own.prizeCount)continue;
   // An actual currently offered, already-paid attack is mandatory.
   // A printed GX uses Mewtwo's own attack; the non-GX Night Watch
   // requires present and live Perfection plus a correctly indexed Bench donor.
   const paid=offeredMewtwoAttack(own,items,check.def.attackName);
   // An opponent's *current Active* might prevent Basic attack damage.
   // That does not prevent paid use of an attack after Counter Catcher gusts
   // a different target. Do not import a pre-gust damagePrevented flag into
   // the new Active; revalidate actual damage once the target is promoted.
   if(!paid||paid.publicMetadata?.hasUnmodeledModifier===true)continue;
   pending={turn:v.globalTurn,phase:'blast-target',
    benchIndex:i,targetPrinting:t.printing,hp:t.hp,startDamage:t.damage,
    attackName:check.def.attackName,
    ownPrizes:own.prizeCount,opponentPrizes:opp.prizeCount,
    attackerPrinting:own.active.printing};
   return select(blast,'A22_BEGIN_BLAST_TO_ENABLE_COUNTERCATCHER_TERMINAL');
  }
  return null;
 }
 return {decide,reset,peek:()=>pending?{...pending}:null};
}
module.exports={createSlice,validRootTarget,offeredMewtwoAttack,
 abilitySource,ownerBenchChoice,certifiedDamage};
