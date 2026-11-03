'use strict';

const assert=require('node:assert/strict');
const {isGuzma}=
  require('./agent2-held-guzma-mobility-frontier.cjs');

const VERSION='agent13-bounded-dce-fusion-copy-guzma-mobility-proposal-v1';

/**
 * A bounded, owner-visible *proposal* for a printed Mew VMAX Cross Fusion
 * Strike copying Genesect V Techno Blast, funded by recognized Double
 * Colorless Energy. It is intentionally separate from the canonical root
 * policy and must be explicitly opted into, native-validated and adversarially
 * evaluated before anyone treats it as competitive.
 *
 * @param {object} view Detached owner actorObservation, no opponent hand/deck.
 * @param {object} catalog Public card-printings and energy type catalog.
 * @returns {object|null} Native-neutral Guzma intent or null.
 */
function chooseDceFusionCopyGuzma(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  if(!own?.active||!Array.isArray(own.bench)||
    !Array.isArray(view.opponentPublic?.bench)||
    !view.opponentPublic.bench.some(Boolean)||
    !Number.isSafeInteger(view.globalTurn)||view.globalTurn<=1||
    r?.supporterPlayLocked!==false||
    own.publicTurnRestrictions?.supporterPlayLocked===true||
    own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
    r.supporterPlayedTurn!==0)return null;
  const handIndex=view.ownHand?.findIndex(isGuzma)??-1;
  if(handIndex<0)return null;
  const energySet=catalog?.specialEnergies;
  if(!(energySet instanceof Set)||!Number.isSafeInteger(
    catalog.colorlessEnergyType))return null;
  // Temple of Sinnoh makes attached DCE provide only one Colorless.
  if([...(own.stadium??[]),...(view.opponentPublic.stadium??[])]
    .some(printing=>printing.startsWith('Temple of Sinnoh ')))return null;
  const active=own.active;
  // This small proposal should never burn Guzma while the Active has Energy
  // or a printed free attack. More complete active attacks need a separate
  // exact legality and opportunity comparison.
  if((active.energies??[]).length!==0||
    (active.attacks??[]).some(a=>
      Array.isArray(a.cost)&&a.cost.length===0))return null;
  const genesectExists=own.bench.some(p=>p?.name==='Genesect V'&&
    (p.attacks??[]).some(a=>a.name==='Techno Blast'&&a.damage===210));
  if(!genesectExists)return null;
  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const pokemon=own.bench[benchIndex];
    if(pokemon?.name!=='Mew VMAX')continue;
    const rules=pokemon.publicRestrictions??{};
    if(rules.cannotAttackNextTurn===true||
      rules.onlyAllowedAttackNameNextTurn&&
        rules.onlyAllowedAttackNameNextTurn!=='Cross Fusion Strike'||
      rules.blockedAttackNameNextTurn==='Cross Fusion Strike'||
      rules.blockedAttackNameUntilLeavesActive==='Cross Fusion Strike'||
      (rules.cannotUseAttacksNextTurn??[]).includes('Cross Fusion Strike'))
      continue;
    if((pokemon.specialConditions??[]).length>0)continue;
    const copied=(pokemon.attacks??[]).some(a=>
      a.name==='Cross Fusion Strike'&&a.gxAttack!==true&&
      Array.isArray(a.cost)&&a.cost.length===2&&
      a.cost.every(e=>e===catalog.colorlessEnergyType));
    if(!copied)continue;
    const funded=(pokemon.energies??[]).some(printing=>
      /^Double Colorless Energy /.test(printing)&&
      energySet.has(printing));
    if(!funded)continue;
    return {
      kind:'play-held-guzma-mobility',
      handIndex,printing:view.ownHand[handIndex],
      benchIndex,anticipatedMissing:0,
      planFamily:'dce-fusion-copy-benched-genesect',
      nominalCopiedDamage:210,
      paperAttackAndGustLegalityCertified:false
    };
  }
  return null;
}

module.exports={VERSION,chooseDceFusionCopyGuzma};
