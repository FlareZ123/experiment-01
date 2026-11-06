'use strict';

const assert=require('node:assert/strict');

const VERSION='agent9-postvolt-necessary-resource-screen-v1';
const named=(printing,name)=>typeof printing==='string'&&
  (printing===name||printing.startsWith(name+' '));
const heldCount=(cards,name)=>cards.filter(card=>named(card,name)).length;

/**
 * Conservative candidate routes after a genuine source Volt Cyclone.
 * The attack's printed Lightning/Colorless/Colorless cost, DCE's two
 * Colorless, Thunder Mountain Prism Star's one Lightning reduction,
 * Speed Lightning Energy's Lightning supply, and Guzma's two-party switch
 * are established from printed cards. Real Store/paper payment, effective
 * restrictions, and opponent responses remain UNVERIFIED.
 *
 * The source Active may retain Speed Lightning Energy after moving DCE.
 * A requirement that the Active have no Energy would incorrectly exclude
 * the physical v7 rank6 settlement and is therefore deliberately absent.
 *
 * @param {object} view Detached real actorObservation, no hidden opponent data.
 * @returns {object} Necessary preflight only, never a legal action guarantee.
 */
function screenPostVoltNecessaryRoutes(view) {
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic;
  const other=view.opponentPublic;
  const r=view.ownTurnResources;
  assert.ok(Array.isArray(view.ownHand)&&own&&other&&r);
  const active=own.active;
  const bench=(own.bench??[]).filter(Boolean);
  const opponentActive=Boolean(other.active);
  const opponentBench=(other.bench??[]).filter(Boolean).length;
  const restrictions=own.publicTurnRestrictions;
  assert.ok(restrictions);
  const activeThorns=named(active?.printing,'Iron Thorns ex');
  const activeEnergies=active?.energies??[];
  const activeSpeedLightning=activeEnergies.some(e=>named(e,'Speed Lightning Energy'));
  const activeBasicLightning=activeEnergies.some(e=>
    named(e,'Lightning Energy')||named(e,'Basic Lightning Energy'));
  const activeLightningSource=activeSpeedLightning||activeBasicLightning;
  const fundedDceBench=bench.flatMap((slot,index)=>
    named(slot.printing,'Iron Thorns ex')&&
    slot.energies.some(e=>named(e,'Double Colorless Energy'))?
      [{index,printing:slot.printing,energies:[...slot.energies]}]:[]);
  const heldDce=heldCount(view.ownHand,'Double Colorless Energy');
  const heldGuzma=heldCount(view.ownHand,'Guzma');
  const heldSeeker=heldCount(view.ownHand,'VS Seeker');
  const discardedGuzma=heldCount(own.discard??[],'Guzma');
  const stadium=[...(own.stadium??[]),...(other.stadium??[])];
  const hasThunder=stadium.some(p=>named(p,'Thunder Mountain'));
  const paperPlayerAttackUnblocked=
    restrictions.attackLockTurnsRemaining===0;
  const handEnergyWindowUnspent=
    r.energyPlayedTurn!==view.globalTurn&&
    r.energyPlayLocked===false&&
    r.specialEnergyPlayLocked===false&&
    restrictions.energyPlayLocked===false&&
    restrictions.specialEnergyPlayLocked===false;
  const supporterWindowUnspent=
    r.supporterPlayedTurn===0&&
    r.supporterPlayLocked===false&&
    restrictions.supporterPlayLocked===false;
  const itemAvailable=r.itemPlayLocked===false&&
    restrictions.itemPlayLocked===false;
  const commonBaton=opponentActive&&opponentBench>0&&
    fundedDceBench.length>0&&hasThunder&&
    paperPlayerAttackUnblocked&&supporterWindowUnspent;
  const manualDce=opponentActive&&activeThorns&&
    activeLightningSource&&heldDce>0&&handEnergyWindowUnspent&&
    paperPlayerAttackUnblocked;
  const directGuzma=commonBaton&&heldGuzma>0;
  const seekerGuzma=commonBaton&&itemAvailable&&
    heldSeeker>0&&discardedGuzma>0;
  return {
    schema:VERSION,ownerSeat:view.actorSeat,globalTurn:view.globalTurn,
    sourceActive:active?.printing??null,
    sourceActiveEnergies:[...activeEnergies],
    activeSpeedLightning,activeLightningSource,
    ownerBenchCount:bench.length,opponentBenchCount:opponentBench,
    fundedDceBench,thunderInPlay:hasThunder,
    heldDoubleColorless:heldDce,heldGuzma,heldVsSeeker:heldSeeker,
    discardedGuzma,handEnergyWindowUnspent,
    supporterWindowUnspent,itemAvailable,paperPlayerAttackUnblocked,
    possibleManualDceOntoActive:manualDce,
    possibleDirectGuzmaBenchBaton:directGuzma,
    possibleVsSeekerGuzmaBenchBaton:seekerGuzma,
    paperPaidAlternativeCertified:false,
    nativeActionAcceptanceCertified:false,
    exhaustiveAlternativeSearch:false,
    source:'actor-only read-only necessary prerequisite screen'
  };
}
module.exports={VERSION,screenPostVoltNecessaryRoutes};
