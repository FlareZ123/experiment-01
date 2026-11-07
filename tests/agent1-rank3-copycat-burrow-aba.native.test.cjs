'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {run} = require('../simulation/evaluation/agent1-rank3-copycat-burrow-aba.cjs');

test('native rank3/rank1 Copycat-Burrow A/B/A is deterministic and resolves one-card mill',()=>{
  const result=run();
  const outputDir=process.env.AGENT1_RANK3_COPYCAT_OUTPUT;
  if(outputDir) {
    fs.mkdirSync(outputDir,{recursive:true});
    const target=path.join(outputDir,'copycat-burrow-aba.json');
    const temporary=target+'.tmp';
    fs.writeFileSync(temporary,JSON.stringify(result,null,2));
    fs.renameSync(temporary,target);
  }
  assert.equal(result.controls.sameOriginalPhysicalDealAllArms,true);
  assert.equal(result.controls.exactControlRepeat,true);
  assert.equal(result.controls.copycatPolicyEnabledOnlyInTreatment,true);
  assert.ok(result.arms.every(arm=>arm.status!=='native-error'));
  const treatment=result.arms[1];
  console.log('AGENT1_COPYCAT_DIAG',JSON.stringify({
    controls:result.controls,
    arms:result.arms.map(arm=>({variant:arm.variant,status:arm.status,
      policy:arm.policy,copycatDeclarations:arm.copycatDeclarations,
      copycatTurns:arm.copycatTurns,filchDeclarations:arm.filchDeclarations,
      burrowDeclarations:arm.burrowDeclarations,
      copycatTurnEvidence:arm.copycatTurnEvidence,
      turnStartEvidence:arm.copycatTurnStartEvidence?.filter(item=>
        item.previousOpponentAttack?.name==='Burrow').slice(0,12),
      attackActions:arm.deckAudit?.attackActions?.filter(item=>
        ['Copycat','Filch','Burrow'].includes(item.actionName)).slice(0,40),
      deckChanges:arm.deckAudit?.deckChanges?.slice(0,40),
      terminalTransition:arm.terminalTransition,
      finalPublicBoard:arm.finalPublicBoard}))
  }));
  assert.ok(treatment.copycatDeclarations>0,
    'Treatment must declare Mimikyu Copycat at least once');
  assert.ok(treatment.copycatEffects.every(effect=>effect.effectObserved),
    'Each Copycat must discard one source-deck card and no owner-deck card');
  assert.ok(treatment.copycatTurnEvidence.every(item=>
    item.previousOpponentAttack==='Burrow'&&item.activeMimikyu),
  'Every Copycat must be preceded by a public Burrow record with Active Mimikyu');
  assert.equal(result.controls.everyCopycatHasBurrowDeckEffect,true);
  assert.equal(result.controls.everyCopycatHadBurrowTurnEvidence,true);
  assert.equal(result.controls.competitiveQualifiedGames,0);
  console.log('AGENT1_COPYCAT_BURROW_ABA',JSON.stringify(result));
});
