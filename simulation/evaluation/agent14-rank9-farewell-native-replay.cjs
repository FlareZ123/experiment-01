'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {scheduledArms}=require('./agent25-nine-omitted-archetypes-source-readiness.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');

const VERSION='agent14-rank9-farewell-retrospective-v1';

/** @returns {object[]} */
function originalRank9Arms(){
  const rows=scheduledArms().filter(row=>row.rank===9);
  assert.equal(rows.length,4,'Expected all four archived original rank9 attempts');
  assert.deepEqual(rows.map(row=>row.candidateSlot),['A','A','B','B']);
  return rows;
}

/** @param {object} row @returns {object} */
function sourceEvidence(row){
  const seat=row.trial?.candidateSlot==='A'?1:0;
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const sourceAbilityRoots=roots.filter(event=>event.playerSlot===seat&&
    event.action==='UseAbilityAction'&&
    (event.detail==='Farewell Letter'||event.abilityName==='Farewell Letter'||
     event.name==='Farewell Letter'||event.ability==='Farewell Letter'));
  const originalAudit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??null;
  return {
    sourceSeat:seat,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    nativeStatus:row.status??(row.finished===true?'untimed-engine-terminal':'incomplete'),
    sourceAttackDeclarations:row.attackDeclarations?.source??null,
    sourceFarewellAbilityRoots:sourceAbilityRoots.map(event=>({
      ordinal:event.actionOrdinal,turn:event.turnBefore,
      action:event.action,detail:event.detail??null
    })),
    bothSeatFarewellIntentCount:originalAudit?.typedIntentCounts?.['use-farewell-letter']??0,
    bothSeatFarewellConfirmedEffects:
      originalAudit?.nativePhysicalConfirmedByIntent?.['use-farewell-letter']??0,
    bothSeatFarewellUnconfirmedEffects:
      originalAudit?.nativePhysicalUnconfirmedByIntent?.['use-farewell-letter']??0,
    nativeError:row.error??null,
    competitivelyQualified:false
  };
}

/** @param {object|null} a @param {object|null} b @returns {string} */
function sourceDealStatus(a,b){
  const x=a?.sourceDealFingerprint,y=b?.sourceDealFingerprint;
  if(typeof x!=='string'||typeof y!=='string')return 'UNVERIFIED';
  return x===y?'EXACT_SOURCE_DEAL_MATCH':'SOURCE_DEAL_DIFFERENT';
}

/**
 * Retrospective 8-arm paired development experiment reusing fixed published
 * original rank9 physical seeds and both unchanged candidate sixties.
 * This never estimates a prospective win rate or paper qualification.
 * @param {{runner?:Function,pinNative?:boolean}} [options]
 * @returns {object}
 */
function runComparison({runner=null,pinNative=true}={}){
  const arms=originalRank9Arms();
  const run=runner??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  if(pinNative)require('./agent41-frozen-bilateral-development-v1.cjs')
    .assertPinnedNativeStore(path.resolve(__dirname,'../..'),profile);
  const comparisons=[];
  for(let index=0;index<arms.length;index+=2){
    const pair=arms.slice(index,index+2);
    const modes={};
    for(const [mode,enabled] of [['baseline',false],['farewell-enabled',true]]){
      try{
        const result=run({...profile.policyOptions,
          actorFarewellLetterRoot:enabled,
          allowAdditionalOriginalSourceRanks:true,
          registeredTrials:pair,
          registeredFrameName:VERSION+'-'+mode});
        assert.equal(result.attempted,2);
        assert.deepEqual(result.rows.map(row=>row.trial.id),pair.map(row=>row.id));
        modes[mode]=result.rows.map(row=>({
          trial:row.trial,evidence:sourceEvidence(row),rawDevelopmentRow:row
        }));
      }catch(error){
        modes[mode]=pair.map(trial=>({
          trial,
          evidence:sourceEvidence({trial,status:'pair-driver-abort',
            error:String(error?.message??error)}),
          rawDevelopmentRow:null,abortedBeforeBothReturns:true
        }));
      }
    }
    for(let k=0;k<pair.length;k++){
      const base=modes.baseline[k],treated=modes['farewell-enabled'][k];
      const sameSource=sourceDealStatus(base.evidence,treated.evidence);
      comparisons.push({trial:pair[k],sameSource,
        baseline:base,farewellEnabled:treated,
        observedSourceAttackDelta:sameSource==='EXACT_SOURCE_DEAL_MATCH'&&
          Number.isSafeInteger(base.evidence.sourceAttackDeclarations)&&
          Number.isSafeInteger(treated.evidence.sourceAttackDeclarations)?
          treated.evidence.sourceAttackDeclarations-
          base.evidence.sourceAttackDeclarations:null});
    }
  }
  return {version:VERSION,
    scope:'original-rank9-Absol-Electrode-source-and-two-unchanged-candidates',
    originalRegistration:'results/aichi-2026/registrations/agent25-nine-omitted-archetypes-source-readiness-20261101.json',
    originalVendorPin:profile.pinnedVendorRevision,
    originalRosterGitBlobSha:profile.originalRosterGitBlobSha,
    onlyPolicyToggle:'actorFarewellLetterRoot false/true, symmetric two-seat',
    design:'retrospective-same-integer-seeds; exact original physical-deal verification required',
    attemptedNativeArms:8,preservedPairs:comparisons.length,comparisons,
    competitiveQualifiedGames:0,winRateCertified:false};
}

if(require.main===module){
  const data=process.argv.includes('--inspect-only')?{
    version:VERSION,arms:originalRank9Arms(),
    onlyPolicyToggle:'actorFarewellLetterRoot false/true',
    competitiveQualifiedGames:0}:runComparison();
  process.stdout.write(JSON.stringify(data,null,2)+'\n');
}

module.exports={VERSION,originalRank9Arms,sourceEvidence,sourceDealStatus,runComparison};
