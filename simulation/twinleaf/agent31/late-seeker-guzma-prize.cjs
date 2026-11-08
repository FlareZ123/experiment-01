'use strict';

const assert=require('node:assert/strict');
const {isGuzma}=require('../agent2-held-guzma-mobility-frontier.cjs');
const {chooseFinalPrizeGuzma,choosePrizeTradeGuzma}=
  require('../agent31-final-prize-guzma-frontier.cjs');

const VERSION='agent31-late-seeker-guzma-nominal-prize-v1';
const SEEKER='VS Seeker PHF';

/**
 * Recover a public discarded Guzma only when a fully owner-visible
 * already-funded Bench attack makes a nominal Prize-taking gust plausible.
 * Recompute the Guzma choice after the physical recovery, rather than
 * promising that the board or Store prompts cannot change.
 *
 * A nominal KO is a policy hypothesis. Printed Damage and Basic Energy
 * checks do not certify against prevention, every lock or every damage
 * modifier. The native Store must still accept the paid chain.
 *
 * @param {object} view Detached owner observation.
 * @param {object} catalog Public printed card catalog.
 * @returns {object|null} Native-neutral root intent.
 */
function chooseLateSeekerGuzmaPrize(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  if(!Array.isArray(view.ownHand)||!view.ownPublic?.active)return null;
  const own=view.ownPublic,resources=view.ownTurnResources;
  const planFor=candidate=>{
    const augmented={...view,ownHand:candidate};
    return own.prizeCount===1?
      chooseFinalPrizeGuzma(augmented,catalog):
      choosePrizeTradeGuzma(augmented,catalog);
  };

  // Once the Supporter is physically recovered, an ordinary Guzma root is
  // selected from the updated hand; no remembered private-zone intention.
  if(view.ownHand.some(isGuzma)){
    const plan=planFor(view.ownHand);
    return plan?{...plan,source:VERSION,
      recoveredWithSeekerNotAssumed:true}:null;
  }

  if(resources?.itemPlayLocked===true||
     own.publicTurnRestrictions?.itemPlayLocked===true||
     !Array.isArray(own.discard))return null;
  const seekerIndex=view.ownHand.indexOf(SEEKER);
  if(seekerIndex<0)return null;

  // Multiple printed Guzma versions can coexist in the discard. Choosing
  // the exact printing is important to the native owner-discard prompt.
  const discarded=[...new Set(own.discard.filter(isGuzma))].sort();
  for(const printing of discarded){
    const plan=planFor([...view.ownHand,printing]);
    if(!plan)continue;
    return {
      kind:'play-seeker-get-guzma',
      source:VERSION,
      printing:SEEKER,
      handIndex:seekerIndex,
      target:printing,
      intendedBenchIndex:plan.benchIndex,
      intendedOpponentBenchIndex:plan.opponentBenchIndex,
      intendedAttackName:plan.attackName,
      intendedNominalDamage:plan.nominalDamage,
      intendedPrizeCountBeforeRoot:own.prizeCount,
      actualGustAndKnockoutUnverified:true
    };
  }
  return null;
}

module.exports={VERSION,SEEKER,chooseLateSeekerGuzmaPrize};
