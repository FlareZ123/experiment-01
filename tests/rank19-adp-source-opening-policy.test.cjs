'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {project} =
  require('../simulation/twinleaf/rank19-adp-source-opening-policy.cjs');

const ADP = 'Arceus & Dialga & Palkia-GX CEC';
const DDE = 'Double Dragon Energy ROS';

/** @returns {object} Source-turn snapshot with true actual-first proof. */
function fixture() {
  return {
    verifiedByDrawLog:true,firstTurnSlot:1,
    firstTurnPlayerId:202,firstTurnPlayerName:'research-B',
    firstDrawLogName:'research-B',
    actions:25,turns:3,
    decisionTrace:[
      {playerSlot:0,turnBefore:0,action:'ResolvePromptAction',
        decisionHandBefore:{ownHandPrintings:[ADP,DDE,'Quick Ball FST']}},
      {playerSlot:0,turnBefore:2,action:'AttackAction',
        attack:'Altered Creation-GX'}
    ],
    copycatTurnStartEvidence:[{
      turn:2,candidateHand:[DDE,'Quick Ball FST'],candidateUsedGX:false,
      board:[
        {active:{name:'Arceus & Dialga & Palkia-GX'},bench:[]},
        {active:{name:'Shadow Rider Calyrex V'},bench:[]}
      ]
    }],
    attackDeclarationTrace:[{
      playerSlot:0,turnBefore:2,attackName:'Altered Creation-GX',
      triggerAction:'AttackAction'
    }]
  };
}

test('an authentic source-second direct-ready state remains separate from attack log',()=>{
  const row=project(fixture(), 321);
  assert.equal(row.actualSourceSecond,true);
  assert.equal(row.setupHandEvidenceAvailable,true);
  assert.equal(row.adpInInitialSeven,true);
  assert.equal(row.ddEnergyAtOwnFirst,true);
  assert.equal(row.directReadyAfterOpponent,true);
  assert.equal(row.alteredCreationDeclaredOnFirstTurn,true);
  assert.equal(row.sourceFirstTurnDeclarations[0].attack,'Altered Creation-GX');
  assert.equal(row.qualifiedForCompetitiveInference,false);
});

test('alternate Active, absent DDE, used GX and wrong first-draw ID each reject direct readiness',()=>{
  const corruptions=[
    game=>{game.copycatTurnStartEvidence[0].board[0].active.name='Raging Bolt ex';},
    game=>{game.copycatTurnStartEvidence[0].candidateHand=['Quick Ball FST'];},
    game=>{game.copycatTurnStartEvidence[0].candidateUsedGX=true;},
    game=>{game.firstTurnPlayerId=101;}
  ];
  for(const [index,corrupt] of corruptions.entries()){
    const game=fixture();
    corrupt(game);
    const row=project(game,55);
    assert.equal(row.directReadyAfterOpponent,false);
    // A contradicted first-player proof no longer authenticates turn 2.
    assert.equal(row.alteredCreationDeclaredOnFirstTurn,index<3);
  }
});

test('a declaration on the later turn cannot be misread as first-turn GX',()=>{
  const game=fixture();
  game.attackDeclarationTrace[0].turnBefore=4;
  const row=project(game,42);
  assert.equal(row.directReadyAfterOpponent,true);
  assert.equal(row.alteredCreationDeclaredOnFirstTurn,false);
  assert.deepEqual(row.sourceFirstTurnDeclarations,[]);
});
