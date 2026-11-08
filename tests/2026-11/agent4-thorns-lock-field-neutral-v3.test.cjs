'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const v2=require('../../simulation/twinleaf/2026-11/agent4-thorns-lock-neutral-stadium-tool-v2.cjs');
const v3=require('../../simulation/twinleaf/2026-11/agent4-thorns-lock-field-neutral-v3.cjs');
const intent={kind:'use-underworld-door',sourcePrinting:'Shadow Rider Calyrex VMAX CRE',
  position:'bench',benchIndex:0};
function observation(stadium=[],tools=[]){
  return {decisionKind:'owner-root',actorSeat:1,globalTurn:15,
    ownPublic:{active:{printing:'Shadow Rider Calyrex V CRE'},
      bench:[{printing:'Shadow Rider Calyrex VMAX CRE',
        abilities:['Underworld Door'],tools}],stadium:[]},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM',
      abilities:['Initialization']},stadium}};
}
const extraStadium=['Sky Field ROS','Parallel City BKT',
  'Artazon PAL','PokéStop PGO','Shopping Center EVS','Risky Ruins MEG',
  'Thunder Mountain Prism Star LOT','Wondrous Labyrinth Prism Star TEU',
  ];
test('eight field-derived Stadium classes are an actual opt-in v3 expansion',()=>{
  assert.equal(v3.VERSION,'agent4-thorns-public-field-neutral-v3');
  for(const stadium of extraStadium){
    const v=observation([stadium]);
    assert.equal(v2.classifyNeutralThornsVeto(v,intent).veto,false,stadium);
    assert.equal(v3.classifyNeutralThornsVeto(v,intent).veto,true,stadium);
    assert.deepEqual(v.opponentPublic.stadium,[stadium]);
  }
});
test('U-Turn Board is newly accepted and originals stay unchanged',()=>{
  const v=observation([],['U-Turn Board UNM']);
  assert.equal(v2.classifyNeutralThornsVeto(v,intent).veto,false);
  assert.equal(v3.classifyNeutralThornsVeto(v,intent).veto,true);
  for(const preexisting of [...v2.NEUTRAL_STADIUM_PRINTINGS]){
    assert.equal(v3.classifyNeutralThornsVeto(observation([preexisting]),intent)
      .veto,true,preexisting);
  }
  for(const preexisting of [...v2.NEUTRAL_TOOL_PRINTINGS]){
    assert.equal(v3.classifyNeutralThornsVeto(observation([],[preexisting]),intent)
      .veto,true,preexisting);
  }
});
test('new owner-public extensions still abstain on Ability-changing effects',()=>{
  for(const stadium of ['Silent Lab PRC','Path to the Peak CRE',
    'Sky Field UNKNOWN']){
    assert.equal(v3.classifyNeutralThornsVeto(observation([stadium]),intent)
      .veto,false,stadium);
  }
  for(const tool of ['Stealthy Hood UNB','U-Turn Board UNKNOWN']){
    assert.equal(v3.classifyNeutralThornsVeto(observation([],[tool]),intent)
      .veto,false,tool);
  }
  assert.equal(v3.classifyNeutralThornsVeto(observation(
    ['Sky Field ROS','Silent Lab PRC']),intent).veto,false);
});
