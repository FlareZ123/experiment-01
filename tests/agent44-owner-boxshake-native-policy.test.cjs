'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {firstTurnBoxOffer}=
  require('../simulation/twinleaf/agent44-owner-boxshake-native-policy.cjs');

function originalFirstTurn(){
  return {
    turn:1,
    handNames:['Carmine','Float Stone','Quick Ball','Dark Patch',
      'Battle VIP Pass','Secret Box','Trubbish'],
    activeName:'Mega Absol ex',
    benchNames:[null,null,null,null,null],
    itemLocked:false,toolLocked:false
  };
}
test('original native first-turn K0 physical offer preserves Tool and Basic',()=>{
  const offer=firstTurnBoxOffer(originalFirstTurn());
  assert.equal(offer.eligible,true);
  assert.equal(offer.toolName,'Float Stone');
  assert.deepEqual(offer.discardNames,
    ['Battle VIP Pass','Quick Ball','Dark Patch']);
});
test('same shared rule is seat-neutral and does not accept opponent data',()=>{
  const offer=firstTurnBoxOffer(originalFirstTurn());
  assert.deepEqual(Object.keys(offer).sort(),
    ['discardNames','eligible','reason','toolName']);
});
test('cannot pay three upfront by imagining future Box search outputs',()=>{
  const x=originalFirstTurn();
  x.handNames=['Secret Box','Trubbish','Float Stone','Quick Ball','Dark Patch'];
  assert.equal(firstTurnBoxOffer(x).eligible,false);
  assert.equal(firstTurnBoxOffer(x).reason,'CANNOT_PAY_BOX_THREE');
});
test('one full Bench or locked Item prevents owner root',()=>{
  const x=originalFirstTurn();
  x.benchNames=['Budew','Crobat V','Dedenne-GX','Tapu Lele-GX','Mew'];
  assert.equal(firstTurnBoxOffer(x).eligible,false);
  x.benchNames=[null,null,null,null,null];
  x.itemLocked=true;
  assert.equal(firstTurnBoxOffer(x).reason,'PUBLIC_LOCK');
});
test('no synthetic draw of singleton Shake or evolved Basic',()=>{
  const x=originalFirstTurn();
  x.handNames.push('Boost Shake');
  assert.equal(firstTurnBoxOffer(x).eligible,false);
  x.handNames.pop();
  x.handNames=x.handNames.filter(name=>name!=='Trubbish');
  assert.equal(firstTurnBoxOffer(x).eligible,false);
});
test('opening clocks accept both first-owner turns and reject later',()=>{
  const x=originalFirstTurn();
  x.turn=2;
  assert.equal(firstTurnBoxOffer(x).eligible,true);
  x.turn=3;
  assert.equal(firstTurnBoxOffer(x).reason,'NOT_FIRST_GLOBAL_TURN');
});
test('preserve useful held Tool even when other same-name copies exist',()=>{
  const x=originalFirstTurn();
  x.handNames.push('Float Stone');
  const offer=firstTurnBoxOffer(x);
  assert.equal(offer.eligible,true);
  assert.deepEqual(offer.discardNames,
    ['Battle VIP Pass','Quick Ball','Dark Patch']);
});
