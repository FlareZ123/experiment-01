'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {
  VERSION,runOriginalV5SourceToolCounterfactual
}=require('../simulation/evaluation/agent20-issue25-v5-source-tool-counterfactual.cjs');

test('exact historical source Pass native Tool pay/attachment/opponent continuation',()=>{
  const result=runOriginalV5SourceToolCounterfactual();
  const dir=process.env.AGENT20_TOOL_TREATMENT_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const filepath=path.join(dir,'agent20-source-tool-counterfactual-v5.json');
    const bytes=JSON.stringify(result,null,2)+'\n';
    const digest=createHash('sha256').update(bytes).digest('hex');
    writeAtomicLocked(filepath,bytes);
    writeAtomicLocked(filepath+'.sha256',
      digest+'  '+path.basename(filepath)+'\n');
  }
  console.log('AGENT20_V5_SOURCE_TOOL_TREATMENT',JSON.stringify({
    version:result.schema,
    sourceParity:result.exactPreInterventionPhysicalStartsAndPrefix,
    nativeToolsPhysicallySettled:result.attachedToolsWithNativePayment,
    opponentDecisions:result.opposingRootObserved,
    attackResponseCounts:result.firstOpposingAttackObserved,
    sourceAttackPayoffCounts:result.originalSourceAttackObserved,
    attempts:result.nativeStatuses,
    sourceCases:result.cases.map(x=>({
      id:x.id,ownerPass:x.printedOwnerPassObserved,
      equalPreSource:x.preDecisionPublicPrefixMatched,
      correctPhysicalStarts:x.sourceDealMatched&&x.fullDealMatched,
      equalOwnerState:x.ownerViewMatched,
      nativeAction:x.actualRootActionSelected,
      accepted:x.nativeToolActionAccepted,
      physicallyAttached:x.physicalToolAttached,
      handCopyConsumed:x.handCopyConsumed,
      opponentRoot:x.firstActualOpponentRoot,
      opposingAttack:x.firstOpposingAttack,
      originalSourceAttack:x.firstSourceAttack,
      sourceRootAfterOpposingAttack:x.nextSourceRootAfterOpposingAttack,
      error:x.nativeToolError
    })),
    qualifiedGames:result.competitiveGamesQualified
  }));
  assert.equal(result.schema,VERSION);
  assert.equal(result.cases.length,2);
  assert.equal(result.allOriginalRegistrationsRetained,true);
  assert.equal(result.exactPreInterventionPhysicalStartsAndPrefix,true);
  assert.equal(result.attachedToolsWithNativePayment,true);
  assert.equal(result.opposingRootObserved,true);
  assert.equal(result.competitiveGamesQualified,0);
});
