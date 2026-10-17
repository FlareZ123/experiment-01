'use strict';

const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch,initializeCards} = require('./headless.cjs');
const {withAttachmentOriginObserver} = require('./attachment-origin-observer.cjs');
const pin = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {Store} = require(path.join(pin,'game/store/store'));
const {AttachEnergyEffect} = require(path.join(pin,'game/store/effects/play-card-effects'));

/** @param {object} event */
function noteworthy(event) {
  return (event.energy || '').includes('Telepath') ||
    event.fromHand === false ||
    event.sourceAmbiguous === true;
}

/**
 * Very small authentic-printed-list mechanism exploration. Only a root Store
 * observer is active; bot private-state simulation traces are explicitly
 * excluded and the observer's wrapper is restored after each game.
 */
function run() {
  initializeCards();
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const ranks=[];
  for(const rank of [9,30,31]) {
    const opponent=plan.opponents.find(row=>row.rank===rank);
    if(!opponent || opponent.status!=='ready' || !plan.candidate.cards) {
      ranks.push({rank, status:'source-printing-not-ready',
        unresolved:opponent?.unresolved??[],
        source60Unchanged:true});
      continue;
    }
    const slots=[];
    for(const seat of [0,1]) {
      const seeds=deriveSlotSeeds(20261017,'pilot',rank,0);
      const seed=seeds[seat===0?'A':'B'];
      const config={
        deckA:seat===0?plan.candidate.cards:opponent.cards,
        deckB:seat===1?plan.candidate.cards:opponent.cards,
        seed, maxActions:180,
        strictPromptValidation:true,
        forestSealSearchCorrection:true,
        supporterDecisionCorrection:true,
        isolatePolicyRandomness:true
      };
      try {
        const {result,report}=withAttachmentOriginObserver(
          {Store,AttachEnergyEffect},()=>runMatch(config));
        const interesting=report.events.filter(noteworthy);
        slots.push({
          candidatePhysicalSeat:seat,
          actualFirstSeat:result.firstTurnSlot,
          verifiedByDrawLog:result.verifiedByDrawLog,
          seed, actions:result.actions, finished:result.finished,
          allObservedLiveEnergyAttachEffects:report.totalLiveEnergyAttachEffects,
          reportingCap:512, omitted:report.omitted,
          noteworthyEnergyEvents:interesting,
          originAmbiguities:report.events.filter(e=>e.sourceAmbiguous).length,
          liveNonhandEnergyEffects:report.events.filter(e=>!e.fromHand).length,
          telepathEffects:report.events.filter(e=>(e.energy||'').includes('Telepath')).length,
          qualifiedForCompetitiveInference:false
        });
      } catch(error) {
        slots.push({candidatePhysicalSeat:seat,seed,
          status:'diagnostic-error',error:String(error?.stack||error),
          qualifiedForCompetitiveInference:false});
      }
    }
    ranks.push({rank,archetype:opponent.archetype,
      sourcePrintSubstitutions:opponent.substitutions,
      slots,qualifiedForCompetitiveInference:false});
  }
  return {
    schema:'aichi-telepath-three-known-rank-root-store-origin-diagnostic-v1',
    candidate:'unmodified published rank1 reference',
    fieldSourceDigest:plan.manifestDigest,
    candidateDigest:plan.candidateDigest,
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sample:'one reproducible generic-bot seed per physical candidate seat; neither start-order-balanced nor policy-qualified',
    note:'This checks whether actual root Store effects reach known risky Energy printings. Zero observed events cannot prove absence from all games.',
    ranks,qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,noteworthy};
