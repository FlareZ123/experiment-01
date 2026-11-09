'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {sourceSummary}=
  require('../agent37-rank5-fusion-mobility-prospective.cjs');
const {saveAtomic}=
  require('../agent37-rank5-source-quickball-discard-retrospective.cjs');

const VERSION='agent38-mail-selected-marnie-physical-follow-v1';
const ROOT=path.resolve(__dirname,'../../..');
const REGPATH='results/aichi-2026/registrations/agent38-mail-marnie-follow-retrospective-20261109.json';
const OUTPUT=path.join(ROOT,'agent38-mail-marnie-retrospective-native.json');

/** Load historical opened source seed and the prospective new one-axis action. */
function registration(){
  const raw=fs.readFileSync(path.join(ROOT,REGPATH));
  const r=JSON.parse(raw.toString('utf8'));
  assert.equal(r.schema,VERSION);
  assert.equal(r.status,'FROZEN_BEFORE_NATIVE_MARNIE_TREATMENT');
  assert.equal(r.oneOriginalTrial.id,'5:13:A:champion-reference');
  assert.equal(r.oneOriginalTrial.seed,1291419999);
  assert.equal(r.oneOriginalTrial.candidateSlot,'A');
  assert.equal(r.attempts,2);
  return {r,digest:createHash('sha256').update(raw).digest('hex')};
}

/** Real Store dispatch and owner-only physical receipts, without inventing a win. */
function sourceResult(row){
  const s=sourceSummary(row);
  const audit=row.ownerMailAfterPassAudit??
    row.ownerMailAfterPassAbortAudit??null;
  const native=Array.isArray(row.rootActionLedger)?
    row.rootActionLedger:[];
  const marnieRoot=native.find(x=>
    x.playerSlot===s.sourceSeat&&x.action==='PlayCardAction'&&
    x.card==='Marnie SSH');
  const opponentReply=marnieRoot?native.find(x=>
    x.playerSlot!==s.sourceSeat&&
    x.actionOrdinal>marnieRoot.actionOrdinal):null;
  return {trial:row.trial,
    sourceSeat:s.sourceSeat,
    fullDeal:s.fullPhysicalDealFingerprint,
    sourceDeal:s.sourceDealFingerprint,
    firstTurn:s.actualStarterSeat,
    nativeDisposition:s.nativeDisposition,
    finished:row.finished===true,
    winner:row.finished===true?row.winner??null:null,
    sourceWon:row.finished===true?row.winner===s.sourceSeat:null,
    sourcePrizes:row.finalPrizes?.[s.sourceSeat]??null,
    opponentPrizes:row.finalPrizes?.[1-s.sourceSeat]??null,
    sourceAttackDeclarations:s.sourceAttackDeclarations,
    sourceAttackSettlements:row.sourceAttackSettlement?.settled??null,
    mailStoreAccepted:audit?.mailStoreAccepted??null,
    mailPromptAccepted:audit?.promptAccepted??null,
    mailSelections:audit?.selectedReceipts??[],
    selectedMarniePhysically:audit?.marnieSelectedPhysically??null,
    marnieFollowOffered:audit?.marnieFollowOffers??null,
    marnieFollowStoreAccepted:audit?.marnieFollowStoreAccepted??null,
    marnieFollowStoreRejected:audit?.marnieFollowStoreRejected??null,
    marnieFollowPhysicallyDiscarded:
      audit?.marnieFollowPhysicallyDiscarded??null,
    marnieFollowReceipts:audit?.marnieFollowReceipts??[],
    nativeMarnieRoot:marnieRoot??null,
    nativeOpponentReplyAfterMarnie:opponentReply??null,
    nativeRootActionLedger:native,
    nativeAbortEvidence:row.nativeAbortEvidence??null,
    nativeError:row.error?String(row.error?.message??row.error):null,
    competitiveQualified:false};
}

/** Two unchanged original sixties; treatment adds only the paid Marnie action. */
function execute(){
  const {r,digest}=registration();
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  const common={
    ...frozen.policyOptions,
    actorNaturalEvolutionRoot:true,
    actorMewGenesectTechnoBlast:true,
    sourceScopedQuickBallRoot:true,
    actorHandDiscard:true,
    actorOnlySingleSearch:true,
    actorMewGenesectQuickBallSearch:true,
    actorDceMewMobilityRoot:true,
    actorMewDceRecipientRoot:true,
    actorMewDceRecipientSourceOnly:true,
    actorGenesectFusionDrawRoot:true,
    actorMewUltraBallRoot:true,
    actorMewUltraBallSearch:true,
    actorMewUltraBallPaymentGuard:true,
    actorMewQuickBallPaymentGuard:true,
    actorOwnerMailAfterPass:true,
    actorOwnerMailAfterPassSourceOnly:true,
    allowSingleCandidateArm:true,
    allowAdditionalOriginalSourceRanks:true
  };
  const modes={};
  for(const [name,enabled] of [['control',false],['playSelectedMarnie',true]]){
    try{
      const raw=runDevelopment({
        ...common,actorOwnerMailSelectedMarnieOnPass:enabled,
        registeredTrials:[r.oneOriginalTrial],
        registeredFrameName:VERSION+'-'+name
      });
      assert.equal(raw.attempted,1);
      modes[name]={row:sourceResult(raw.rows[0]),
        nativeReport:raw,batchError:null};
    }catch(error){
      modes[name]={row:{trial:r.oneOriginalTrial,
        nativeDisposition:'NATIVE_BATCH_ERROR',
        fullDeal:null,sourceDeal:null,firstTurn:null,
        nativeError:String(error?.stack??error),
        finished:false,marnieFollowStoreAccepted:null,
        marnieFollowPhysicallyDiscarded:null,
        competitiveQualified:false},
        nativeReport:null,batchError:String(error?.stack??error)};
    }
  }
  const a=modes.control.row,b=modes.playSelectedMarnie.row;
  const matched=Boolean(a.fullDeal&&a.sourceDeal&&
    a.fullDeal===b.fullDeal&&a.sourceDeal===b.sourceDeal&&
    a.firstTurn===b.firstTurn);
  return {schema:VERSION,registration:REGPATH,registrationSha256:digest,
    samePhysicalOriginalDeal:matched,
    physicalMarnieFromOwnMailPlayed:matched&&
      (b.marnieFollowStoreAccepted??0)>0&&
      (b.marnieFollowPhysicallyDiscarded??0)>0&&
      b.nativeMarnieRoot!==null,
    postMarnieOpponentReplyWitness:matched&&
      b.nativeOpponentReplyAfterMarnie!==null,
    modes,retrospectiveKnownSourceSeed:true,
    newIndependentSourceSamples:0,competitiveQualifiedGames:0,
    certifiedWinRate:null};
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {r,digest}=registration();
    process.stdout.write(JSON.stringify({schema:VERSION,registrationSha256:digest,
      trial:r.oneOriginalTrial,policyAxis:r.changedDecisionAxis},null,2)+'\n');
  }else{
    const data=execute();
    saveAtomic(OUTPUT,data);
    process.stdout.write(JSON.stringify({
      schema:VERSION,registrationSha256:data.registrationSha256,
      samePhysicalOriginalDeal:data.samePhysicalOriginalDeal,
      paidMarnie:data.physicalMarnieFromOwnMailPlayed,
      realOpponentReply:data.postMarnieOpponentReplyWitness,
      outcomes:Object.fromEntries(Object.entries(data.modes)
        .map(([id,{row,batchError}])=>[id,{
          status:row.nativeDisposition,finished:row.finished,
          sourceWon:row.sourceWon,sourcePrizes:row.sourcePrizes,
          sourceAttacks:row.sourceAttackDeclarations,
          mail:row.mailStoreAccepted,
          marnieChosen:row.selectedMarniePhysically,
          marnieOffered:row.marnieFollowOffered,
          marnieAccepted:row.marnieFollowStoreAccepted,
          marniePhysicallyDiscarded:row.marnieFollowPhysicallyDiscarded,
          opponentReply:row.nativeOpponentReplyAfterMarnie,
          batchError
        }])),
      independentSamples:0,qualifiedGames:0
    },null,2)+'\n');
    if(Object.values(data.modes).some(x=>x.batchError))process.exitCode=1;
  }
}
module.exports={VERSION,REGPATH,registration,sourceResult,execute};
