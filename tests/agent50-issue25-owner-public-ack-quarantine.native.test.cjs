'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {developmentTrials,runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {withGoFirstChoice}=
  require('../simulation/twinleaf/agent6-go-first-choice.cjs');
const {withOwnerStartingBasicChoice}=
  require('../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs');
const {withOwnerPublicAcknowledgements}=
  require('../simulation/twinleaf/agent50-owner-public-acknowledgements.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

/** Same four retrospective source-rank6/11 candidate opening streams. */
test('Issue25 owner protocol acknowledgements advance strict two-seat native boundary',()=>{
  const registered=developmentTrials();
  assert.equal(registered.length,4);
  let developed=null,coinAudit=null,basicAudit=null,ackAudit=null;
  let boundaryAudit=null,blocked=null;
  try{
    const outer=quarantine(()=>{
      const coin=withGoFirstChoice([false,false],()=>{
        const basics=withOwnerStartingBasicChoice(()=>{
          const acknowledgements=withOwnerPublicAcknowledgements(()=>{
            developed=runDevelopment({
              actorOnlyComposition:true,
              nativeRootActionLimit:16
            });
            return developed;
          });
          ackAudit=acknowledgements.audit;
          return acknowledgements.result;
        });
        basicAudit=basics.audit;
        return basics.result;
      });
      coinAudit=coin.audit;
      return coin.result;
    },{maxRecords:16});
    boundaryAudit=outer.audit;
  }catch(error){
    blocked=error;
    boundaryAudit=error.nativeRawStateFallbackQuarantine??null;
  }
  const rows=developed?.rows??[];
  const record={
    schema:'agent50-issue25-owner-ack-native-v4',
    registered:registered.map(row=>row.id),
    attempted:rows.map(row=>({
      id:row.trial?.id??row.id??null,status:row.status??null,
      sourceDealDigest:
        row.game?.initialSourceDealFingerprint?.digestSha256??null,
      nativeRootCount:row.game?.rootActionLedger?.length??null
    })),
    goFirstChoiceCount:coinAudit?.choices.length??null,
    firstBasicProposalCount:basicAudit?.proposals??null,
    ownSetupBasicSelections:basicAudit?.events??null,
    ownerMulliganAcknowledgements:ackAudit?.mulliganAcks??null,
    ownerWaitAcknowledgements:ackAudit?.waitAcks??null,
    acknowledgementEvents:ackAudit?.events??null,
    outerErrorCode:blocked?.code??null,
    nextNativeFallbacks:boundaryAudit?.records??null,
    rawNativeDecoderExecutions:
      boundaryAudit?.originalNativeDecoderExecuted??null,
    qualifiedCompetitiveGames:0
  };
  console.log('AGENT50_ISSUE25_OWNER_ACK_NEXT_GATE',JSON.stringify(record));

  assert.equal(rows.length,registered.length);
  assert.equal(coinAudit?.choices.length,4);
  assert.ok(coinAudit.choices.every(row=>row.chooseFirst===false));
  assert.equal(basicAudit?.proposals,8);
  assert.equal(basicAudit.unsupportedOwnBasicChoices,0);
  assert.ok(ackAudit?.mulliganAcks>=2,
    'previously blocked two mulligan acknowledgements must now resolve');
  assert.ok(ackAudit?.waitAcks>=2,
    'previously blocked two first-draw wait acknowledgements must now resolve');
  assert.ok(ackAudit.events.every(e=>[0,1].includes(e.seat)));
  assert.ok(boundaryAudit);
  assert.equal(boundaryAudit.originalNativeDecoderExecuted,false);
  assert.equal(boundaryAudit.ownerInformationSafeWholePolicyCertified,false);
  if(boundaryAudit.rawStateFallbackCalls>0)assert.equal(blocked?.code,CODE);
  else assert.equal(blocked,null);
});
