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
const {withBlockedPromptEnvelope,publicRootActionMix}=
  require('../simulation/twinleaf/agent50-first-blocked-prompt-envelope.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

/** Same actual original 60 and four frozen historic seed/seat development arms. */
test('Issue25 owner-only first blocked ATTACK prompt metadata without card reads',()=>{
  const registered=developmentTrials();
  assert.equal(registered.length,4);
  let developed=null,coinAudit=null,basicAudit=null,ackAudit=null;
  let showAudit=null,boundaryAudit=null,envelopeAudit=null,blocked=null;
  try{
    const outer=quarantine(()=>{
      const coin=withGoFirstChoice([false,false],()=>{
        const basic=withOwnerStartingBasicChoice(()=>{
          const acks=withOwnerPublicAcknowledgements(()=>{
            const show=withOwnerMandatoryShowCards(()=>{
              const envelope=withBlockedPromptEnvelope(()=>{
                developed=runDevelopment({
                  actorOnlyComposition:true,
                  nativeRootActionLimit:48
                });
                return developed;
              });
              envelopeAudit=envelope.audit;
              return envelope.result;
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
    schema:'agent50-issue25-attack-prompt-envelope-v7',
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
      acceptedRootActionMix:row.rootActionLedger?
        publicRootActionMix(row.rootActionLedger):null,
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
    observedFirstBlockedPromptEnvelopes:envelopeAudit?.envelopes??null,
    nextNativeFallbacks:boundaryAudit?.records??null,
    quarantineCode:blocked?.code??null,
    originalNativeDecoderExecuted:
      boundaryAudit?.originalNativeDecoderExecuted??null,
    competitiveGamesQualified:0
  };
  console.log('AGENT50_ISSUE25_ATTACK_PROMPT_ENVELOPE_V7',
    JSON.stringify(diagnostic));
  assert.equal(rows.length,registered.length);
  for(const row of rows){
    if(row.status===undefined){
      assert.match(row.sourceDealFingerprint,/^[0-9a-f]{64}$/);
      assert.match(row.fullPhysicalDealFingerprint,/^[0-9a-f]{64}$/);
      assert.ok(Number.isSafeInteger(row.rootActionCount)&&
        row.rootActionCount<=48);
      assert.equal(row.qualifiesForCompetitiveInference,false);
    }
  }
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
  assert.equal(envelopeAudit?.envelopes.length,3);
  assert.ok(envelopeAudit.envelopes.every(e=>e.phase===3&&
    ['ChooseCardsPrompt','OrderCardsPrompt'].includes(e.promptType)));
  assert.deepEqual(envelopeAudit.envelopes.map(e=>e.promptType),
    boundaryAudit.records.map(e=>e.promptType));
  if(boundaryAudit.rawStateFallbackCalls>0)
    assert.equal(blocked?.code,CODE);
  else assert.equal(blocked,null);
});
