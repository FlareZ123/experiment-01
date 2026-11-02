'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {scheduledArms}=require('./agent25-nine-omitted-archetypes-source-readiness.cjs');
const {sourceEvidence,sourceDealStatus}=
  require('./agent14-rank9-farewell-native-replay.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');

const VERSION='agent14-unown-other-original-ranks-v1';
const SOURCE_RANKS=Object.freeze([26,30,31]);

/** @returns {object[]} All precommitted original registered arms for these ranks. */
function originalUnownArms(){
  const all=scheduledArms();
  const chosen=all.filter(trial=>SOURCE_RANKS.includes(trial.rank));
  assert.equal(chosen.length,12);
  for(const rank of SOURCE_RANKS){
    const rows=chosen.filter(trial=>trial.rank===rank);
    assert.equal(rows.length,4);
    assert.deepEqual(rows.map(row=>row.candidateSlot),['A','A','B','B']);
  }
  return chosen;
}

/**
 * Retrospective authentic-original pair screen across three additional Aichi
 * Unown-bearing source ranks. Stores aborts, censored trials and untrusted
 * native outcomes. Never reports these as paper game-win estimates.
 * @param {{runner?:Function,pinNative?:boolean}} [options]
 * @returns {object}
 */
function runOtherOriginalUnown({runner=null,pinNative=true}={}){
  const arms=originalUnownArms();
  const run=runner??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  if(pinNative)require('./agent41-frozen-bilateral-development-v1.cjs')
    .assertPinnedNativeStore(path.resolve(__dirname,'../..'),profile);
  const comparisons=[];
  for(let i=0;i<arms.length;i+=2){
    const pair=arms.slice(i,i+2);
    const modes={};
    for(const [mode,enabled] of [['baseline',false],['farewell-enabled',true]]){
      try{
        const out=run({...profile.policyOptions,
          actorFarewellLetterRoot:enabled,
          allowAdditionalOriginalSourceRanks:true,
          registeredTrials:pair,
          registeredFrameName:VERSION+'-'+mode+'-rank'+pair[0].rank});
        assert.equal(out.attempted,2);
        assert.deepEqual(out.rows.map(row=>row.trial.id),pair.map(row=>row.id));
        modes[mode]=out.rows.map(row=>({trial:row.trial,
          evidence:sourceEvidence(row),rawDevelopmentRow:row}));
      }catch(error){
        modes[mode]=pair.map(trial=>({trial,
          evidence:sourceEvidence({trial,status:'source-driver-abort',
            error:String(error?.message??error)}),
          rawDevelopmentRow:null,abortedBeforeBothReturns:true}));
      }
    }
    for(let k=0;k<pair.length;k++){
      const baseline=modes.baseline[k];
      const farewellEnabled=modes['farewell-enabled'][k];
      comparisons.push({trial:pair[k],sourceRank:pair[k].rank,
        sameSource:sourceDealStatus(baseline.evidence,farewellEnabled.evidence),
        baseline,farewellEnabled});
    }
  }
  return {
    version:VERSION,originalRanks:SOURCE_RANKS,
    originalRegistration:'results/aichi-2026/registrations/agent25-nine-omitted-archetypes-source-readiness-20261101.json',
    frozenProfileVersion:profile.version,
    onlyPolicyToggle:'actorFarewellLetterRoot false/true, symmetric two-seat',
    attemptedNativeArms:24,preservedPairs:comparisons.length,
    comparisons,competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'Retrospective source competency and native Ability settlement only. No paper-clock or win-rate qualification.'
  };
}

if(require.main===module){
  const output=process.argv.includes('--inspect-only')?{
    version:VERSION,originalRanks:SOURCE_RANKS,
    originalArms:originalUnownArms(),competitiveQualifiedGames:0}:runOtherOriginalUnown();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
}

module.exports={VERSION,SOURCE_RANKS,originalUnownArms,runOtherOriginalUnown};
