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
const {withOwnerMandatoryShowCards}=
  require('../simulation/twinleaf/agent50-owner-mandatory-showcards.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

/** Same actual original 60 and four frozen historic seed/seat development arms. */
test('Issue25 mandatory owner ShowCards on real Store with exact source deal receipts',()=>{
  const registered=developmentTrials();
  assert.equal(registered.length,4);
  let developed=null,coinAudit=null,basicAudit=null,ackAudit=null;
  let showAudit=null,boundaryAudit=null,blocked=null;
  try{
    const outer=quarantine(()=>{
      const coin=withGoFirstChoice([false,false],()=>{
        const basic=withOwnerStartingBasicChoice(()=>{
          const acks=withOwnerPublicAcknowledgements(()=>{
            const show=withOwnerMandatoryShowCards(()=>{
              developed=runDevelopment({
                actorOnlyComposition:true,
                nativeRootActionLimit:16
              });
              return developed;
            });
            showAudit=show.audit;
            return show.result;
          });
          ackAudit=acks.audit;
          return acks.result;
        });
        basicAudit=basic.audit;
        return basic.result;
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
  const diagnostic={
    schema:'agent50-issue25-owner-mandatory-showcards-v5',
    registered:registered.map(row=>row.id),
    attempts:rows.map(row=>({
      id:row.trial?.id??row.id??null,
      status:row.status??'returned',
      sourceSeat:row.sourceSeat??null,
      candidateSeat:row.candidateSeat??null,
      actualSourceDealFingerprint:row.sourceDealFingerprint??null,
      exactFullPhysicalDealFingerprint:
        row.fullPhysicalDealFingerprint??null,
      verifiedFirstTurn:row.verifiedFirstTurn??null,
      firstStarterSeat:row.actualStarterSeat??null,
      nativeActionCount:row.actionCount??null,
      nativeRootActionCount:row.rootActionCount??null,
      turnCount:row.turns??null,
      finished:row.finished??null,
      winner:row.winner??null,
      lastRootActions:row.rootActionLedger?.slice(-3).map(e=>({
        turn:e.turnBefore,seat:e.playerSlot,action:e.action,
        card:e.card??null,attack:e.attack??null
      }))??null
    })),
    ownerGoFirstChoices:coinAudit?.choices?.length??null,
    ownerStartingBasicSelections:basicAudit?.proposals??null,
    publicMulliganAcks:ackAudit?.mulliganAcks??null,
    publicWaitAcks:ackAudit?.waitAcks??null,
    newOwnerShowCardsAcks:showAudit?.accepted??null,
    newShowCardsEvents:showAudit?.events??null,
    nextNativeFallbacks:boundaryAudit?.records??null,
    quarantineCode:blocked?.code??null,
    originalNativeDecoderExecuted:
      boundaryAudit?.originalNativeDecoderExecuted??null,
    competitiveGamesQualified:0
  };
  console.log('AGENT50_ISSUE25_MANDATORY_SHOWCARDS_NEXT_GATE',
    JSON.stringify(diagnostic));
  assert.equal(rows.length,registered.length);
  assert.equal(coinAudit?.choices.length,4);
  assert.equal(basicAudit?.proposals,8);
  assert.ok(ackAudit?.mulliganAcks>=4);
  assert.ok(ackAudit?.waitAcks>=10);
  assert.ok(showAudit?.accepted>=2,
    'two previously blocked real in-turn ShowCards should be acknowledged');
  assert.ok(showAudit.events.every(e=>
    [0,1].includes(e.seat)&&e.resolvedAs==='true'));
  assert.ok(boundaryAudit);
  assert.equal(boundaryAudit.originalNativeDecoderExecuted,false);
  if(boundaryAudit.rawStateFallbackCalls>0)
    assert.equal(blocked?.code,CODE);
  else assert.equal(blocked,null);
});
