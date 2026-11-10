'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registered=require('../../../results/aichi-2026/registrations/2026-11/agent26-fresh-rank5-bilateral-lillie-four-20261110.json');
const {runNativeBatch}=
  require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {commonSourceFundingOptions,writeArtifact}=
  require('../agent36-fresh-rank5-native-paper-packet.cjs');
const {createLivePaperRootReceipts}=
  require('../../twinleaf/agent36-live-paper-root-receipts.cjs');
const {joinReceiptLedger}=
  require('../agent36-v8-native-paper-root-capture.cjs');
const {withMewEnergyMixOwnerPrompt}=
  require('../../twinleaf/2026-11/agent26-mew-energy-mix-owner-prompt.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const VERSION='agent26-fresh-four-deal-rank5-bilateral-lillie-v1';

/** @param {string} relativePath */
function gitBlob(relativePath){
  const bytes=fs.readFileSync(path.join(ROOT,relativePath));
  return createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
}

function preflight(){
  assert.equal(registered.schema,
    'agent26-prospective-rank5-bilateral-lillie-four-deals-v1');
  assert.equal(registered.status,'FROZEN BEFORE ANY NATIVE ARMS');
  assert.equal(registered.groups.length,4);
  assert.deepEqual(registered.arms,['control','lillie']);
  assert.deepEqual(registered.groups.map(g=>g.candidateSlot),
    ['A','B','A','B']);
  assert.equal(new Set(registered.groups.map(g=>g.seed)).size,4);
  assert.equal(gitBlob(registered.sourcePublishedFullFieldPath),
    registered.sourceFullFieldGitBlob);
  assert.equal(gitBlob(registered.candidatePrintedProxyPath),
    registered.candidatePrintedProxyGitBlob);
  assert.equal(registered.pinnedTwinleaf,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  for(const row of registered.groups){
    assert.equal(row.id,
      [row.rank,row.repeat,row.candidateSlot,row.candidateId].join(':'));
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&
      row.seed<=0xffffffff);
    assert.equal(row.rank,5);
  }
  return registered;
}

/** 
 * Derive genuinely accepted physical Lillie Supporter roots even when the
 * headless decoder redacts its late failed-game root ledger.
 * @param {object} physical Captured original 120-card native Store tape.
 * @param {number} seat Actual owner physical seat.
 * @returns {{ordinal:number,turn:number}[]}
 */
function acceptedPhysicalLillieRoots(physical,seat){
  assert.ok(seat===0||seat===1);
  const prefix='s'+seat+'.hand:';
  const ids=new Set(physical.originalPhysicalCards.filter(c=>
    c.originalSeat===seat&&
    c.printing==="Lillie's Determination M1L").map(c=>c.id));
  return physical.receipts.filter(root=>{
    if(root.seat!==seat||root.action!=='PlayCardAction')return false;
    return [...ids].some(id=>
      root.beforePositions?.[id]?.startsWith(prefix)===true&&
      root.afterPositions?.[id]!==root.beforePositions[id]);
  }).map(root=>({ordinal:root.actionOrdinal,turn:root.turnBefore}));
}

/**
 * One prospective arm of four precommitted real native matches.
 * Original source and candidate decks and all actor code are identical
 * across arms, except the owner-root Lillie-after-Pass bool.
 * @param {boolean} enableLillie
 * @param {{nativeBatch?:Function,run?:Function,promptDependencies?:object}} [deps]
 * @returns {object}
 */
function arm(enableLillie,deps={}){
  const reg=preflight();
  const stores=new WeakMap(),recorders=new Map(),promptAudits=[];
  let selected;
  try{
    const result=(deps.nativeBatch??runNativeBatch)(
      true,options=>{
        const policy={
          ...options,...commonSourceFundingOptions(),
          actorBilateralLillieAfterPass:enableLillie,
          allowExtendedRegisteredNativeRootCap:true,
          onRootStoreCreated:(store,trialId)=>{
            assert.ok(reg.registeredGameIds.includes(trialId));
            assert.ok(!recorders.has(trialId));
            const recorder=createLivePaperRootReceipts(trialId);
            recorder.onRootStoreCreated(store);
            stores.set(store,recorder);
            recorders.set(trialId,recorder);
          },
          onRootActionDispatched:(store,action,ordinal,seat,turn)=>{
            const recorder=stores.get(store);
            assert.ok(recorder,'Accepted Store action before registered recorder');
            recorder.onRootActionDispatched(store,action,ordinal,seat,turn);
          }
        };
        const game=withMewEnergyMixOwnerPrompt(
          ()=>(deps.run??runDevelopment)(policy),
          deps.promptDependencies??{});
        promptAudits.push(game.audit);
        return game.result;
      },{
        registeredTrials:reg.groups.map(g=>({...g})),
        registeredFrameName:reg.schema,
        nativeRootActionLimit:reg.rootActionLimit,
        vipAfterPass:true,
        vipPreferMewtwoDonor:true,
        perfectionTransition:true
      });
    selected=result.selected;
    assert.equal(selected.rawDevelopment.rows.length,4);
    assert.equal(selected.manifest.observedTwinleafGitCommit,
      reg.pinnedTwinleaf);
    const source=selected.rawDevelopment.rows;
    assert.deepEqual(source.map(row=>row.trial.id),reg.registeredGameIds);
    const games=source.map(row=>{
      const trialId=row.trial.id,physical=recorders.get(trialId)?.result();
      assert.ok(physical,'Missing actual Store physical identities '+trialId);
      const join=joinReceiptLedger(physical,row);
      const roots=row.rootActionLedger??[];
      const seat=row.candidateSeat;
      const sourceSeat=row.sourceSeat;
      const nativeLedgerComplete=roots.length===
        physical.acceptedStoreRootCount;
      const l=acceptedPhysicalLillieRoots(physical,seat);
      const sourceLillie=acceptedPhysicalLillieRoots(physical,sourceSeat);
      return {
        trialId,seed:row.trial.seed,candidateSlot:row.trial.candidateSlot,
        candidateSeat:seat,sourceSeat,
        initialFullPhysicalDeal:row.fullPhysicalDealFingerprint,
        initialSourceDeal:row.sourceDealFingerprint,
        nativeFinished:row.finished===true,
        nativeWinner:row.winner??null,
        finalPrizes:row.finalPrizes??null,
        error:row.error?String(row.error).slice(0,1000):null,
        nativeRootCount:physical.acceptedStoreRootCount,
        developmentRootLedgerCount:roots.length,
        developmentRootLedgerComplete:nativeLedgerComplete,
        exactNativeStoreRootCount:physical.acceptedStoreRootCount,
        exactJoin:nativeLedgerComplete?join.status:
          'PHYSICAL_STORE_RECEIPTS_ONLY_DECODER_ABORT',
        originalPhysical120Clean:physical.settledPhysicalIdentityClean===true,
        candidateLillieRoots:l,
        sourceLillieRoots:sourceLillie,
        candidateSettledCopiedAttackCount:row.candidateAttackSettlement?.
          attacks?.filter(x=>x.delegatedCopy===true&&
            x.settledPromptChain===true).length??null,
        candidateNativeAttackDeclarations:row.candidateAttackSettlement?.
          declarations??null,
        candidateAcceptedPasses:physical.receipts.filter(x=>
          x.seat===seat&&x.action==='PassTurnAction').length,
        ownerLillieAudit:row.ownerBilateralLillieAfterPassAudit??null,
        fullPhysicalReceipt:physical
      };
    });
    return {schema:VERSION,policyLillieEnabled:enableLillie,
      games,promptAudits,observedEngine:selected.manifest.observedTwinleafGitCommit};
  }catch(error){
    if(error&&typeof error==='object')error.partialRank5Prospective={
      status:'NATIVE_ARM_ABORTED',arm:enableLillie?'lillie':'control',
      registeredIds:reg.registeredGameIds,captured:[...recorders]
        .map(([trialId,r])=>({trialId,originalStore:r.result()})),
      paperQualifiedGames:0
    };
    throw error;
  }finally{
    for(const recorder of recorders.values())recorder.close();
  }
}

/**
 * Single precommitted two-arm trial per exact deal. Counts every registered
 * game including native errors and root caps.
 * @param {object} [deps]
 * @returns {object}
 */
function run(deps={}){
  const reg=preflight();
  const control=arm(false,deps);
  const treatment=arm(true,deps);
  assert.deepEqual(control.games.map(g=>g.trialId),
    treatment.games.map(g=>g.trialId));
  const pairs=control.games.map((a,i)=>{
    const b=treatment.games[i];
    assert.equal(a.initialSourceDeal,b.initialSourceDeal,
      'Native source identity/setup mismatch');
    assert.equal(a.initialFullPhysicalDeal,b.initialFullPhysicalDeal,
      'Actual 120-card original opening identity mismatch');
    if(a.developmentRootLedgerComplete)
      assert.equal(a.exactJoin,'EXACT_ROOT_IDENTITY_JOIN');
    if(b.developmentRootLedgerComplete)
      assert.equal(b.exactJoin,'EXACT_ROOT_IDENTITY_JOIN');
    assert.equal(a.originalPhysical120Clean,true);
    assert.equal(b.originalPhysical120Clean,true);
    return {
      trialId:a.trialId,seed:a.seed,
      candidateSlot:a.candidateSlot,
      initialFullPhysicalDeal:a.initialFullPhysicalDeal,
      controlWinner:a.nativeFinished?a.nativeWinner:null,
      treatmentWinner:b.nativeFinished?b.nativeWinner:null,
      candidateSeat:a.candidateSeat,sourceSeat:a.sourceSeat,
      controlFinished:a.nativeFinished,treatmentFinished:b.nativeFinished,
      controlRoots:a.nativeRootCount,
      treatmentRoots:b.nativeRootCount,
      controlPasses:a.candidateAcceptedPasses,
      treatmentPasses:b.candidateAcceptedPasses,
      treatmentLillieRoots:b.candidateLillieRoots,
      controlLillieRoots:a.candidateLillieRoots,
      actualCompletedNativeReversal:a.nativeFinished&&b.nativeFinished&&
        a.nativeWinner!==b.nativeWinner,
      clean120CardCustody:true
    };
  });
  return {
    schema:VERSION,registeredAtUtc:reg.registeredAtUtc,
    registration:reg.schema,sourceRank:5,enginePinned:reg.pinnedTwinleaf,
    fixedSixty:reg.candidateId,freshPhysicalDealCount:4,
    originalRegisteredSeedIds:reg.registeredGameIds,
    expectedNativeAttempts:8,actualNativeAttempts:8,
    allPhysicalDealsMatched:true,
    allRealStorePaymentsJoined:
      [...control.games,...treatment.games].every(g=>
        g.developmentRootLedgerComplete&&
        g.exactJoin==='EXACT_ROOT_IDENTITY_JOIN'),
    allOriginalStorePhysicalIdentitiesClean:true,
    twoArmsIdenticalExceptBilateralOwnerLillieAfterPass:true,
    control,treatment,pairs,
    nativeTerminals:control.games.filter(x=>x.nativeFinished).length+
      treatment.games.filter(x=>x.nativeFinished).length,
    completedNativeReversals:pairs.filter(x=>
      x.actualCompletedNativeReversal).length,
    paperQualifiedGames:0,competitivelyAdmittedGames:0,
    caveat:'Prospective seed native mechanics only, very small rank5 subset with bot decision weaknesses, no paper-clock or independent playing policy. No competitive win-rate estimate.'
  };
}

if(require.main===module){
  let report;
  try{report=run();}
  catch(error){
    if(error?.partialRank5Prospective){
      const saved=writeArtifact(error.partialRank5Prospective,
        'artifacts/agent26-rank5-lillie-prospective');
      process.stderr.write('AGENT26_ABORT_PRESERVED '+
        JSON.stringify({saved,message:error.message})+'\n');
    }
    throw error;
  }
  const saved=writeArtifact(report,
    'artifacts/agent26-rank5-lillie-prospective');
  process.stdout.write('AGENT26_FRESH_LILLIE '+JSON.stringify({
    schema:VERSION,saved,
    allPhysicalDealsMatched:report.allPhysicalDealsMatched,
    full120CardCustody:report.allOriginalStorePhysicalIdentitiesClean,
    developmentRootLedgersAllJoined:report.allRealStorePaymentsJoined,
    totalNativeTerminals:report.nativeTerminals,
    reversals:report.completedNativeReversals,
    pairs:report.pairs,
    competitivelyAdmittedGames:0
  })+'\n');
}
module.exports={VERSION,preflight,acceptedPhysicalLillieRoots,arm,run};
