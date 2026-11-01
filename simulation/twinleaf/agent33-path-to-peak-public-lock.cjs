'use strict';
const assert=require('node:assert/strict');
const VERSION='agent33-path-to-peak-physical-used-fusion-v3';
const {VERSION:FUSION_USAGE_VERSION}=
  require('./agent33-public-fusion-usage.cjs');

/**
 * Accept only a same-turn, same-seat native observed per-physical-copy
 * Fusion Strike System ledger matching every visible Genesect board slot.
 * Invalid/missing proof means all Genesect remain protected.
 * @param {object} view Detached actor observation.
 * @param {object|null} usage Native owner-public source marker sidecar.
 * @returns {Set<number>} Original active/bench indices whose power is spent.
 */
function verifiedUsedFusionSlots(view,usage){
  const spent=new Set();
  if(!usage||usage.schema!==FUSION_USAGE_VERSION||
      usage.actorSeat!==view.actorSeat||
      usage.globalTurn!==view.globalTurn||
      !Array.isArray(usage.faceUp))return spent;
  const expected=[view.ownPublic?.active,...(view.ownPublic?.bench??[])]
    .map((slot,index)=>({slot,index}))
    .filter(x=>x.slot?.printing==='Genesect V FST');
  if(expected.length!==usage.faceUp.length||
      usage.faceUpGenesectCount!==expected.length)return spent;
  let seenUsed=0;
  for(let j=0;j<expected.length;j++){
    const {index}=expected[j],actual=usage.faceUp[j];
    if(actual?.printing!=='Genesect V FST'||
        actual?.location!==(index===0?'active':'bench')||
        actual?.benchIndex!==(index===0?null:index-1)||
        typeof actual.usedThisTurn!=='boolean')return new Set();
    if(actual.usedThisTurn){seenUsed++;spent.add(index);}
  }
  if(usage.usedCount!==seenUsed||
      usage.unspentCount!==expected.length-seenUsed)return new Set();
  return spent;
}


/**
 * Exactly printed Rule Box Abilities that trigger only on playing the Basic
 * from hand to Bench. Once a Pokemon occupies the board, that particular
 * trigger has already passed; future bounce/replay loops are excluded.
 * Card identity is from the public printed-card catalog, never hidden zones.
 */
const ARRIVAL_ONLY=new Set([
  'Dedenne-GX UNB','Crobat V DAA','Tapu Lele-GX GRI','Eldegoss V RCL'
]);

/**
 * Decide whether a face-up, already in-play Rule Box Pokemon still offers
 * an Ability that Path would immediately deny. Unknown powers remain live.
 * @param {object} slot Public in-play Pokemon.
 * @param {object} playerPublic Owner's detached public observation.
 * @param {object} catalog Public printed Pokemon catalog.
 * @returns {boolean}
 */
function actionablePrintedAbility(slot,playerPublic,catalog){
  if(!catalog.ruleboxAbilityPrintings.has(slot.printing))return false;
  if(ARRIVAL_ONLY.has(slot.printing))return false;
  // Legacy Star is Regidrago VSTAR SIT's only printed Ability. Its once-
  // per-game VSTAR allowance belongs to the player, not the specific card.
  if(slot.printing==='Regidrago VSTAR SIT'&&
      playerPublic?.publicTurnRestrictions?.vstarUsed===true)return false;
  return true;
}

/**
 * A held arrival-trigger Pokemon may still be Benched later; protect it.
 * Only a spent global VSTAR Power is conclusively inaccessible in hand.
 * @param {string} printing Owner's hand printing.
 * @param {object} playerPublic Owner's public player state.
 * @param {object} catalog Public printed Pokemon catalog.
 * @returns {boolean}
 */
function prospectiveHeldPrintedAbility(printing,playerPublic,catalog){
  return catalog.ruleboxAbilityPrintings.has(printing)&&
    !(printing==='Regidrago VSTAR SIT'&&
      playerPublic?.publicTurnRestrictions?.vstarUsed===true);
}
/**
 * Avoid self-lock by requiring no currently visible owner rule-box Ability
 * Pokémon and no held ability-bearing evolution. Only the frozen public
 * print catalog and visible opponent board determine target applicability.
 */
function choosePathToPeakOpposingAbility(view,catalog,options={}){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  const locks=catalog.ruleboxAbilityPrintings;
  const ruleboxes=catalog.ruleboxPokemonPrintings;
  if(!(locks instanceof Set)||!(ruleboxes instanceof Set)||!own.active)
    return null;
  // VSTAR Power consumption is a public, player-wide resource, not a
  // per-card flag. A spent Seal Stone no longer grants a usable Power.
  const stadium=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  if(stadium.length>0||r.stadiumPlayLocked!==false||
    !Number.isSafeInteger(r.stadiumPlayedTurn)||
    r.stadiumPlayedTurn>=view.globalTurn)return null;
  const usedFusionSlots=verifiedUsedFusionSlots(view,options.ownFusionUsage);
  const cards=[own.active,...(own.bench??[])];
  if(cards.some((slot,index)=>slot&&(
      (actionablePrintedAbility(slot,own,catalog)&&
        !(slot.printing==='Genesect V FST'&&usedFusionSlots.has(index)))||
      (ruleboxes.has(slot.printing)&&slot.tools?.some(print=>
        print.startsWith('Forest Seal Stone ')||
        print.startsWith('Sky Seal Stone '))&&
        own.publicTurnRestrictions?.vstarUsed!==true))))return null;
  if(view.ownHand.some(printing=>
    prospectiveHeldPrintedAbility(printing,own,catalog)))return null;
  const opponents=[view.opponentPublic?.active,
    ...(view.opponentPublic?.bench??[])].filter(Boolean);
  if(!opponents.some(slot=>actionablePrintedAbility(slot,
      view.opponentPublic,catalog)||
      (ruleboxes.has(slot.printing)&&slot.tools?.some(print=>
        print.startsWith('Forest Seal Stone ')||
        print.startsWith('Sky Seal Stone '))&&
        view.opponentPublic?.publicTurnRestrictions?.vstarUsed!==true)))
    return null;
  const index=view.ownHand.findIndex(printing=>
    printing.startsWith('Path to the Peak '));
  if(index<0)return null;
  return {kind:'play-path-to-peak',
    handIndex:index,printing:view.ownHand[index],
    reason:'public-opposing-rulebox-ability-and-no-owner-self-lock',
    ...(usedFusionSlots.size>0?{
      spentOwnerFusionSlotIndices:[...usedFusionSlots].sort((a,b)=>a-b)
    }:{})};
}
module.exports={VERSION,choosePathToPeakOpposingAbility,
  actionablePrintedAbility,prospectiveHeldPrintedAbility,
  verifiedUsedFusionSlots};
