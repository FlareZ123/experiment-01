'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {scheduledArms}=require('./agent25-nine-omitted-archetypes-source-readiness.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');

const VERSION='agent48-rank5-mew-original-evolution-counterfactual-v1';
const SOURCE_RANK=5;

/**
 * Original 1 November source physical seeds, intentionally retrospective.
 * Exactly two candidate 60s at each actual physical candidate seat.
 * @returns {object[]}
 */
function rank5OriginalArms(){
  const arms=scheduledArms().filter(x=>x.rank===SOURCE_RANK);
  assert.equal(arms.length,4);
  assert.deepEqual(arms.map(x=>x.seed),[290257265,290257265,220636727,220636727]);
  assert.deepEqual(arms.map(x=>x.candidateSlot),['A','A','B','B']);
  return arms;
}

/** @param {object} row @returns {object} */
function sourceEvidence(row){
  const slot=row.trial?.candidateSlot;
  const sourceSeat=slot==='A'?1:slot==='B'?0:null;
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const sourceRoots=roots.filter(x=>x.playerSlot===sourceSeat);
  const sourceMewEvolutionRoots=sourceRoots.filter(x=>
    x.action==='PlayCardAction'&&
    typeof x.card==='string'&&x.card.startsWith('Mew VMAX'));
  return {
    status:row.status??(row.finished===true?'untimed-engine-terminal':
      'native-action-cap-or-incomplete'),
    sourceSeat,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    engineFinished:row.finished??null,
    engineWinnerUntrusted:row.winner??null,
    originalSourceAttackCount:row.attackDeclarations?.source??null,
    settledSourceAttackCount:row.sourceAttackSettlement?.attacks?.length??null,
    observedSourceMewEvolutionRoots:sourceMewEvolutionRoots.map(x=>({
      actionOrdinal:x.actionOrdinal,turnBefore:x.turnBefore,card:x.card
    })),
    sourcePostAttackReplyCount:row.candidateRepliesAfterSourceAttacks?.length??null,
    nativeError:row.error??null,
    paperCompetitiveQualification:false
  };
}

/** @param {object|null} a @param {object|null} b @returns {string} */
function compareDeal(a,b){
  const x=a?.sourceDealFingerprint,y=b?.sourceDealFingerprint;
  if(typeof x!=='string'||typeof y!=='string')return 'UNVERIFIED';
  return x===y?'EXACT_SOURCE_DEAL_MATCH':'SOURCE_DEAL_DIFFERENT';
}

/**
 * Replay the same precommitted rank-5 arms under a one-option policy switch.
 * Baseline retains historical frozen policy options; treatment merely enables
 * the existing symmetric natural evolution root on both seats. The source
 * original 60 and both candidate 60s are unchanged. Each failed pair remains.
 *
 * @param {{runner?:Function,pinNative?:boolean}} [options]
 * @returns {object}
 */
function runComparison({runner=null,pinNative=true}={}){
  const arms=rank5OriginalArms();
  const run=runner??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  assert.equal(typeof run,'function');
  if(pinNative)require('./agent41-frozen-bilateral-development-v1.cjs')
    .assertPinnedNativeStore(path.resolve(__dirname,'../..'),profile);
  const results=[];
  const old=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  try{
    process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
    for(let i=0;i<arms.length;i+=2){
      const selected=arms.slice(i,i+2);
      const modes={};
      for(const mode of ['baseline','evolution-enabled']){
        const treatment=mode==='evolution-enabled';
        try{
          const out=run({...profile.policyOptions,
            allowAdditionalOriginalSourceRanks:true,
            actorNaturalEvolutionRoot:treatment,
            registeredTrials:selected,
            registeredFrameName:VERSION+'-'+mode});
          assert.equal(out.attempted,2);
          assert.equal(out.rows.length,2);
          assert.deepEqual(out.rows.map(x=>x.trial.id),
            selected.map(x=>x.id));
          modes[mode]=out.rows.map(x=>({
            trial:x.trial,evidence:sourceEvidence(x),
            rawDevelopmentRow:x
          }));
        }catch(error){
          modes[mode]=selected.map(trial=>({
            trial,evidence:sourceEvidence({trial,status:'pair-preflight-or-driver-abort',
              error:String(error?.message??error)}),
            rawDevelopmentRow:null,
            abortedBeforeTwoNativeReturns:true
          }));
        }
      }
      for(let k=0;k<2;k++){
        const control=modes.baseline[k],treatment=modes['evolution-enabled'][k];
        results.push({
          trial:control.trial,
          sameSourcePhysicalDeal:compareDeal(control.evidence,treatment.evidence),
          baseline:control,
          evolutionEnabled:treatment,
          sourceAttackCountDifference:
            Number.isSafeInteger(control.evidence.originalSourceAttackCount)&&
            Number.isSafeInteger(treatment.evidence.originalSourceAttackCount)?
              treatment.evidence.originalSourceAttackCount-
              control.evidence.originalSourceAttackCount:null
        });
      }
    }
  }finally{
    if(old===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=old;
  }
  assert.equal(results.length,4);
  return {
    version:VERSION,originalRank:SOURCE_RANK,
    sourceManifest:'results/aichi-2026/full-decklists.json',
    originalRegistration:
      'results/aichi-2026/registrations/agent25-nine-omitted-archetypes-source-readiness-20261101.json',
    originalVendorPin:profile.pinnedVendorRevision,
    originalRosterGitBlobSha:profile.originalRosterGitBlobSha,
    comparisonType:'retrospective-same-seed-development-only',
    onlyPolicyToggle:'actorNaturalEvolutionRoot=false/true, symmetric on both seats',
    plannedNativeArms:8,preservedComparisonArms:results.length,
    results,
    qualifiedCompetitiveGames:0,winRateCertified:false,
    limitations:'Exact native source physical deal equality must be observed; a zero source attack does not establish missed legal opportunity. Generic source policy, card effects and paper clock remain unqualified.'
  };
}

if(require.main===module){
  const data=process.argv.includes('--inspect-only')?
    {version:VERSION,rank5Arms:rank5OriginalArms(),
      originalVendorPin:profile.pinnedVendorRevision,
      treatment:'actorNaturalEvolutionRoot enabled on both seats',
      qualifiedCompetitiveGames:0}:
    runComparison();
  process.stdout.write(JSON.stringify(data,null,2)+'\n');
}

module.exports={VERSION,rank5OriginalArms,sourceEvidence,compareDeal,runComparison};
