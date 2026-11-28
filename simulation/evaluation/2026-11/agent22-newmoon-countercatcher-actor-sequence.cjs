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
// Every direct-gust target is anchored to a distinct *published* Aichi
// card printing's exact HP and two-/three-Prize rule, crosschecked against
// resources/cards/en and the 29 authenticated original source 60s. This
// deliberately excludes unknown rule-box identities and single-Prizers.
const DIRECT_GUST_TARGETS=Object.freeze([
 ['Mega Lopunny ex',330,3],['Mega Kangaskhan ex',300,3],
 ['Mega Absol ex',280,3],['Mega Dragonite ex',370,3],
 ['Regidrago VSTAR',280,2],
 ['Dedenne-GX',160,2],['Tapu Lele-GX',170,2],
 ['Squawkabilly ex',160,2],['Crobat V',180,2],
 ['Genesect V',190,2],['Pidgeot ex',280,2],
 ['Articuno-GX',170,2],['Rotom V',190,2],
 ['Iron Thorns ex',230,2]
]);
const TOPS=Object.freeze([
 {name:'Mega Lopunny ex',hp:330,prizes:3,attackName:'Miraculous Duo-GX',attackDamage:200},
 {name:'Mega Kangaskhan ex',hp:300,prizes:3,attackName:'Miraculous Duo-GX',attackDamage:200},
 {name:'Mega Absol ex',hp:280,prizes:3,attackName:'Miraculous Duo-GX',attackDamage:200},
 {name:'Mega Dragonite ex',hp:370,prizes:3,attackName:'Miraculous Duo-GX',attackDamage:200},
 {name:'Regidrago VSTAR',hp:280,prizes:2,attackName:'Night Watch',attackDamage:150},
 // Two-Prize support cards are especially strong tie-2-2 conversion
 // targets: 130 counters leave each exact printed HP>130 alive, and a
 // funded printed Mewtwo GX200 takes our final two after Item gust.
 ...DIRECT_GUST_TARGETS.filter(([name,,prizes])=>
   prizes===2&&name!=='Regidrago VSTAR').map(([name,hp,prizes])=>
   ({name,hp,prizes,attackName:'Miraculous Duo-GX',attackDamage:200}))
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
function nightWatchDonor(own){
 return Array.isArray(own?.bench)&&own.bench.some(s=>
   has(s?.printing,'Trevenant & Dusknoir-GX'))||
   Array.isArray(own?.discard)&&own.discard.some(s=>
   has(s,'Trevenant & Dusknoir-GX'));
}
function psychicCostPhysicallyReady(own,opponent){
 const p=own?.active;
 if(!p||!Array.isArray(p.energies)||!Array.isArray(p.specialConditions)||
    p.specialConditions.some(x=>['ASLEEP','PARALYZED','CONFUSED'].includes(String(x).toUpperCase()))||
    !Array.isArray(own.stadium)||!Array.isArray(opponent?.stadium))return false;
 const basic=p.energies.filter(e=>has(e,'Basic Psychic Energy')).length;
 const telepathic=p.energies.filter(e=>has(e,'Telepathic Psychic Energy')).length;
 // This is a pre-root guard against burning Dusknoir for a *hypothetical*
 // Night Watch. The real Perfection ChooseAttackPrompt still checks payment.
 // Temple of Sinnoh makes TPE Colorless. Unknown special-Energy modifiers
 // must remain an unverified native-game limitation, never promised damage.
 const temple=[...own.stadium,...opponent.stadium].some(e=>
   has(e,'Temple of Sinnoh'));
 return basic+(temple?0:telepathic)>=3;
}
function offeredMewtwoAttack(own,items,name='Miraculous Duo-GX',opponent=null){
 if(!has(own?.active?.printing,'Mewtwo & Mew-GX')||
    !Array.isArray(items)||!Array.isArray(own.bench)||
    !['Miraculous Duo-GX','Night Watch'].includes(name))return null;
 const active=own.active;
 if(name==='Night Watch'){
  if(!Array.isArray(active.abilities)||
     !active.abilities.includes('Perfection')||
     active.abilitySuppressions?.find(y=>y.abilityName==='Perfection')?.suppressed!==false||
     !nightWatchDonor(own)||!psychicCostPhysicallyReady(own,opponent))
   return null;
  return items.find(x=>x.kind==='use-ability'&&
    x.publicMetadata?.abilityName==='Perfection'&&
    x.publicMetadata.sourceZone==='active'&&
    x.publicMetadata.sourceSeat==='actor'&&
    x.publicMetadata.sourceIndex===0&&
    x.actorPrinting===active.printing)??null;
 }
 if(own.publicTurnRestrictions?.gxUsed!==false)return null;
 return items.find(x=>{
  if(x.kind!=='attack'||x.attackName!==name||
     x.publicMetadata?.attackCostPayable!==true)return false;
  const s=x.publicMetadata.attackSource;
  return x.actorPrinting===active.printing&&
     s?.sourceKind==='active-pokemon'&&s.sourceSlot==='ACTIVE'&&
     s.sourceCardFullName===active.printing;
 })??null;
}
function ownerPerfectionNightWatchPrompt(p,seat,own,targetPrinting){
 if(!p||p.actingSeat!==seat||p.promptType!=='ChooseAttackPrompt'||
    p.source?.classification!=='actor-choice'||
    p.source.sourceKind!=='card-effect'||
    p.source.effectName!=='Perfection'||
    p.source.sourcePrinting!==own.active?.printing||
    p.publicMetadata?.selectionType!=='attack'||
    !Array.isArray(p.choices))return null;
 const donors=[
  ...(Array.isArray(own?.bench)?own.bench.map(s=>s?.printing):[]),
  ...(Array.isArray(own?.discard)?own.discard:[])
 ].filter(s=>has(s,'Trevenant & Dusknoir-GX'));
 if(!donors.length||!targetPrinting)return null;
 return p.choices.find(c=>c.kind==='attack'&&
   c.publicMetadata?.ownerSeat==='actor'&&
   c.publicMetadata.isOwnerVisible===true&&
   ['board','bench','discard','mixed'].includes(c.publicMetadata.sourceZone)&&
   c.publicMetadata.sourceAttack==='Night Watch'&&
   donors.includes(c.printing))??null;
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
function visiblePrintedDuoDamage(own,opp,target){
 // The pinned action frontier does NOT expose damageAfterResistance, only
 // attackCostPayable and source. This is a narrow *nominal printed* estimate,
 // not an actual Store damage receipt: previously imposed effects can persist.
 if(!has(own?.active?.printing,'Mewtwo & Mew-GX')||
    !Array.isArray(own.active.attacks)||
    !own.active.attacks.some(a=>a?.name==='Miraculous Duo-GX'&&a.damage===200)||
    !Array.isArray(own.stadium)||!Array.isArray(opp?.stadium)||
    own.stadium.length||opp.stadium.length||
    !Array.isArray(own.active.tools)||own.active.tools.length||
    !Array.isArray(target?.tools)||target.tools.length||
    !Array.isArray(target.printed?.resistance)||
    target.printed.resistance.some(r=>r?.type==='Psychic')||
    !DIRECT_GUST_TARGETS.some(([n,h])=>has(target.printing,n)&&target.hp===h))
   return null;
 const dragon=has(target.printing,'Mega Dragonite ex')&&
   Array.isArray(target.printed.types)&&
   target.printed.types.includes('Dragon')&&liveFairyZone(own);
 return 200*(dragon?2:1);
}
function certifiedDamage(attack,target,own,opp){
 const m=attack?.publicMetadata;
 if(!m||m.attackCostPayable!==true||
    m.damagePrevented===true||m.hasUnmodeledModifier===true||
    (typeof m.damageReduced==='number'&&m.damageReduced>0)||
    (m.targetHp!==undefined&&m.targetHp!==target.hp)||
    (m.targetDamage!==undefined&&m.targetDamage!==target.damage))return false;
 const dmg=Number.isFinite(m.damageAfterResistance)?
   m.damageAfterResistance:visiblePrintedDuoDamage(own,opp,target);
 return Number.isFinite(dmg)&&dmg>=target.hp-target.damage;
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
   if(pending.phase==='perfection-attack-prompt'){
    const t=opp.active;
    if(!t||t.printing!==pending.targetPrinting||
       t.hp!==pending.hp||t.damage<pending.startDamage+130||
       t.hp-t.damage>150||!nightWatchDonor(own)||
       !psychicCostPhysicallyReady(own,opp)){reset();return null;}
    const choice=ownerPerfectionNightWatchPrompt(p,seat,own,pending.targetPrinting);
    if(!choice){reset();return null;}
    reset();
    return {decision:{kind:'select-choice',token:choice.token},
      reason:'A22_PERFECTION_SELECT_ACTUAL_PAID_NIGHT_WATCH_TERMINAL'};
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
    const a=offeredMewtwoAttack(own,items,attackName,opp);
    if(!a){reset();return null;}
    if(attackName==='Night Watch'){
      // Perfection is an Ability, not a fabricated Bench-sourced Attack
      // action. It raises an owner ChooseAttackPrompt whose eligible choices
      // encode native payment; selection performs the copied attack.
      if(t.hp-t.damage>150){reset();return null;}
      pending.phase='perfection-attack-prompt';
      return select(a,'A22_USE_ACTUAL_PERFECTION_FOR_NIGHT_WATCH');
    }
    if(!certifiedDamage(a,t,own,opp)){reset();return null;}
    reset();
    return select(a,Number.isFinite(a.publicMetadata?.damageAfterResistance)?
      'A22_MIRACULOUS_GX_NATIVE_ANNOTATED_TERMINAL':
      'A22_MIRACULOUS_GX_PRINTED_BASE_CONDITIONAL_TERMINAL');
   }
   reset();return null;
  }
  // Tied Prizes: self-KO *newly unlocks* Counter Catcher.
  // At 3-2: the Item is already legal, but Blast supplies otherwise
  // missing 130 damage to a full-HP three-Prize target, and self-KO
  // leaves opponent at one Prize (not an immediate loss).
  const newlyEnables=own.prizeCount===opp.prizeCount;
  const stillPlayable=own.prizeCount===3&&opp.prizeCount===2;
  if(!(newlyEnables||stillPlayable)||own.prizeCount<=1||
     !Array.isArray(v.ownHand)||
     !v.ownHand.some(x=>has(x,'Counter Catcher')))return null;
  const blast=abilitySource(own,items);
  if(!blast)return null;
  for(let i=0;i<opp.bench.length;i++){
   const t=opp.bench[i],check=validRootTarget(t,own);
   if(!check||check.def.prizes!==own.prizeCount)continue;
   // Miraculous must be directly printed and already payable. Night
   // Watch is available only through an offered Perfection Ability plus a
   // visible Psychic payment and eligible Benched/discarded GX donor; the
   // actual paid attack is *not* a direct native action.
   const paid=offeredMewtwoAttack(own,items,check.def.attackName,opp);
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
   return select(blast,newlyEnables?
     'A22_BEGIN_BLAST_TO_ENABLE_COUNTERCATCHER_TERMINAL':
     'A22_BEGIN_BLAST_TO_DAMAGE_FOR_ALREADY_LEGAL_COUNTERCATCHER');
  }
  return null;
 }
 return {decide,reset,peek:()=>pending?{...pending}:null};
}
module.exports={createSlice,validRootTarget,offeredMewtwoAttack,
 abilitySource,ownerBenchChoice,certifiedDamage,
 nightWatchDonor,psychicCostPhysicallyReady,ownerPerfectionNightWatchPrompt,
 visiblePrintedDuoDamage,DIRECT_GUST_TARGETS};
