'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runWithResearchProfile,EXPANDED_SOURCE_PROFILE}=
  require('./policy-profiles.cjs');
const {withActorOnlyRootPolicy}=
  require('./agent34-actor-only-root-policy.cjs');
const {SEEDS,MAX_ACTIONS}=
  require('./agent48-firstturn-carmine-native-probe.cjs');

const printed=path.resolve(__dirname,
  '../../results/aichi-2026/full-decklists.json');

/**
 * Compare a printed-paper first-turn exception as an actual optional actor
 * decision, rather than a forced own-hand Store interaction. This is bounded
 * quality/coverage instrumentation; full-game outcomes remain unqualified.
 *
 * @param {{deckA:string[],deckB:string[],seed:number}} setting
 * @param {boolean} enabled
 * @returns {object}
 */
function arm(setting,enabled){
  let game=null,error=null,policyAudit=null;
  try{
    const result=withActorOnlyRootPolicy(()=>runWithResearchProfile({
      deckA:setting.deckA,deckB:setting.deckB,
      seed:setting.seed,maxActions:MAX_ACTIONS,
      strictPromptValidation:true,grandTreeFirstTurnCorrection:true,
      captureDecisionTrace:true,
      label:'Unqualified original-source Carmine optional actual actor-policy census'
    },EXPANDED_SOURCE_PROFILE),{carmineFirstRoot:enabled});
    game=result.result;
    policyAudit=result.audit;
  }catch(e){
    error={name:e?.name??null,message:String(e?.message??e)};
  }
  return {
    policyOptIn:enabled,error,
    actorAudit:policyAudit===null?null:{
      version:policyAudit.version,
      actorRoots:policyAudit.selectedRootDecisions,
      nativeAcceptedRoots:policyAudit.acceptedActorRoots,
      rejectedRoots:policyAudit.rejectedActorRoots,
      speculativeFallbacks:policyAudit.nonLiveSpeculativeFallbacks,
      unsupportedPromptFallbacks:policyAudit.unsupportedPromptFallbacks,
      typedIntents:policyAudit.typedIntentCounts,
      firstFortyOwnerIntents:policyAudit.ownerRootIntents
    },
    game:game===null?null:{
      firstTurnSlot:game.firstTurnSlot,
      deckHashes:game.deckHashes,
      verifiedByDrawLog:game.verifiedByDrawLog,
      actions:game.actions,finished:game.finished
    }
  };
}

function runAudit(){
  const manifest=resolveManifestFile(printed,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const first=manifest.decks.find(x=>x.rank===1);
  const source=manifest.decks.find(x=>x.rank===11);
  assert.ok(first?.playableUnderEngine&&source?.playableUnderEngine);
  const trials=[];
  for(const seed of SEEDS){
    const setting={deckA:first.cardIds,deckB:source.cardIds,seed};
    const baseline=arm(setting,false);
    const optIn=arm(setting,true);
    if(baseline.game&&optIn.game){
      assert.equal(baseline.game.verifiedByDrawLog,true);
      assert.equal(optIn.game.verifiedByDrawLog,true);
      assert.deepEqual(baseline.game.deckHashes,optIn.game.deckHashes);
      assert.equal(baseline.game.firstTurnSlot,optIn.game.firstTurnSlot);
    }
    trials.push({seed,originalSourceRanks:[1,11],baseline,optIn});
  }
  const selected=trials.reduce((n,t)=>n+
    (t.optIn.actorAudit?.typedIntents['play-carmine-first']??0),0);
  const rejected=trials.reduce((n,t)=>n+
    (t.optIn.actorAudit?.rejectedRoots??0),0);
  return {
    schema:'agent48-source-24seed-actual-actor-carmine-optin-census-v1',
    originalRanks:[1,11],seeds:[...SEEDS],
    fixedMaxActions:MAX_ACTIONS,
    pairs:trials.length,
    actualOptionalCarmineRoots:selected,
    optInRejectedActorRoots:rejected,
    errors:trials.filter(t=>t.baseline.error||t.optIn.error).length,
    eligibleNativeHeldFromIndependentForcedProbe:
      'See separate first-owner 24-deal source control for 4 held native-playable of 24; actor policies may consume earlier hand cards differently.',
    competitiveGameQualified:false,
    trials,
    caveat:'Printed original source sixties with short native action caps and weak actor policy; no competitive outcome. A zero optional choice count establishes only nonactivation under this bounded policy/seeds.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');
module.exports={arm,runAudit};
