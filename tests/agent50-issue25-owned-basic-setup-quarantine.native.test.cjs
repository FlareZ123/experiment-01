'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {developmentTrials,runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {withGoFirstChoice}=
  require('../simulation/twinleaf/agent6-go-first-choice.cjs');
const {withOwnerStartingBasicChoice}=
  require('../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

/**
 * Same four historical source/candidate streams as v1/v2.
 * Only new decision authority: deterministic owner-hand starting Basics.
 * All unsupported native decisions stay fail-closed behind the outer guard.
 */
test('Issue25 owner-hand Basic setup crosses next full-State fallback boundary',()=>{
  const registered=developmentTrials();
  assert.equal(registered.length,4);
  let developed=null,coinAudit=null,basicAudit=null;
  let boundaryAudit=null,blocked=null;
  try{
    const observed=quarantine(()=>{
      const coin=withGoFirstChoice([false,false],()=>{
        const basics=withOwnerStartingBasicChoice(()=>{
          developed=runDevelopment({
            actorOnlyComposition:true,
            nativeRootActionLimit:16
          });
          return developed;
        });
        basicAudit=basics.audit;
        return basics.result;
      });
      coinAudit=coin.audit;
      return coin.result;
    },{maxRecords:16});
    boundaryAudit=observed.audit;
  }catch(error){
    blocked=error;
    boundaryAudit=error.nativeRawStateFallbackQuarantine??null;
  }
  const rows=developed?.rows??[];
  const packet={
    schema:'agent50-issue25-owner-basic-setup-v3',
    registered:registered.map(row=>row.id),
    attempted:rows.map(row=>({
      id:row.trial?.id??row.id??null,
      status:row.status??null,
      sourceDealDigest:
        row.game?.initialSourceDealFingerprint?.digestSha256??null
    })),
    goFirstChoices:coinAudit?.choices??null,
    ownBasicPromptProposals:basicAudit?.proposals??null,
    ownerBasicSelections:basicAudit?.events??null,
    unsupportedOwnBasicChoices:
      basicAudit?.unsupportedOwnBasicChoices??null,
    outerErrorCode:blocked?.code??null,
    nextNativeFallbacks:boundaryAudit?.records??null,
    nativeFallbackCalls:boundaryAudit?.rawStateFallbackCalls??null,
    nativeDecoderExecuted:
      boundaryAudit?.originalNativeDecoderExecuted??null,
    qualifiedCompetitiveGames:0
  };
  console.log('AGENT50_ISSUE25_OWNER_BASIC_NEXT_GATE',JSON.stringify(packet));

  assert.equal(rows.length,4,
    'all historical source/candidate attempted arms must remain visible');
  assert.equal(coinAudit?.choices.length,4,
    'native owner setup winner must retain go-second policy in all attempts');
  assert.ok(coinAudit.choices.every(choice=>choice.chooseFirst===false));
  assert.ok(basicAudit?.proposals>=4,
    'each native original setup must select at least one owner Basic');
  assert.equal(basicAudit.unsupportedOwnBasicChoices,0);
  assert.ok(basicAudit.events.every(e=>
    e.selections.length>0&&[0,1].includes(e.seat)));
  assert.ok(boundaryAudit,'outer native decoder guard missing');
  assert.equal(boundaryAudit.originalNativeDecoderExecuted,false);
  assert.equal(boundaryAudit.ownerInformationSafeWholePolicyCertified,false);
  if(boundaryAudit.rawStateFallbackCalls>0){
    assert.equal(blocked?.code,CODE);
  }else{
    assert.equal(blocked,null);
  }
});
