'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {evidence}=require('../../simulation/evaluation/agent31/late-seeker-guzma-postgust-aba.cjs');

test('authentic root ledger uses playerSlot and attack fields',()=>{
  const row={
    trial:{id:'11:3:B:champion-reference',seed:1101197735},
    status:'terminal',finished:true,winner:1,finalPrizes:[1,0],
    rootActionLedger:[
      {actionOrdinal:204,turnBefore:36,playerSlot:1,
        action:'ResolvePromptAction'},
      {actionOrdinal:205,turnBefore:36,playerSlot:1,
        action:'AttackAction',attack:'Max Geist'},
      {actionOrdinal:206,turnBefore:37,playerSlot:0,
        action:'AttackAction',attack:'Claw of Darkness'}
    ],
    candidateAttackSettlement:{attacks:[{
      turnBefore:36,actionOrdinal:205,attackName:'Max Geist',
      activePrintingBefore:'Shadow Rider Calyrex VMAX CRE',
      prizesBefore:[1,4],prizesAfter:[1,3],
      settledPromptChain:true,
      publicBoardBefore:[{active:{printing:'Garbodor BKP'}}],
      publicBoardAfter:[{active:{printing:'Mega Absol ex M1L'}}],
      nextSourceRoot:{ordinal:206,turn:37,action:'AttackAction'},
      nextSourceTurnActions:[{ordinal:206,action:'AttackAction'}]
    }]}
  };
  const x=evidence(row);
  assert.deepEqual(x.physicalAttackActions.map(a=>a.seat),[1,0]);
  assert.deepEqual(x.physicalAttackActions.map(a=>a.attack),
    ['Max Geist','Claw of Darkness']);
  assert.deepEqual(x.nearbyAcceptedActions[1],{
    ordinal:205,turn:36,seat:1,action:'AttackAction',
    card:null,attack:'Max Geist'
  });
  assert.equal(x.candidateAttackSettlements.length,1);
  assert.deepEqual(x.candidateAttackSettlements[0].afterPrizes,[1,3]);
  assert.equal(x.candidateAttackSettlements[0].sourceActiveBefore.printing,
    'Garbodor BKP');
  assert.equal(x.candidateAttackSettlements[0].sourceActiveAfter.printing,
    'Mega Absol ex M1L');
  assert.equal(x.candidateAttackSettlements[0].nextSourceRoot.turn,37);
});
