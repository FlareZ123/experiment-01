'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {flexibleFirstTurnBoxOffer:offer}=
  require('../simulation/twinleaf/agent44-flexible-box-k0-plan.cjs');

function v(handNames){
  return {turn:1,handNames,activeName:'Mega Absol ex',
    benchNames:[null,null,null,null,null],
    itemLocked:false,toolLocked:false};
}
test('original firstturn held Trub and Tool remains valid',()=>{
  const x=offer(v(['Carmine','Float Stone','Quick Ball','Dark Patch',
    'Battle VIP Pass','Secret Box','Trubbish']));
  assert.equal(x.eligible,true);
  assert.equal(x.trubbishMode,'held-basic');
  assert.equal(x.basicSearcher,null);
  assert.equal(x.toolName,'Float Stone');
  assert.deepEqual(x.discardNames,['Battle VIP Pass','Dark Patch','Quick Ball']);
});
test('Box can fetch missing Tool under held Trubbish physical payment',()=>{
  const x=offer(v(['Secret Box','Trubbish','Dark Patch','Iono','Carmine']));
  assert.equal(x.eligible,true);
  assert.equal(x.toolName,null);
  assert.equal(x.trubbishMode,'held-basic');
});
test('held Quick Ball remains protected for later Trubbish Basic search',()=>{
  const x=offer(v(['Secret Box','Quick Ball','Dark Patch','VS Seeker',
    'Iono','Carmine']));
  assert.equal(x.eligible,true);
  assert.equal(x.trubbishMode,'held-searcher');
  assert.equal(x.basicSearcher,'Quick Ball');
  assert.equal(x.laterBasicSearcherPayment,1);
  assert.ok(!x.discardNames.includes('Quick Ball'));
});
test('held Ultra Ball reserves two additional discards after Box',()=>{
  const works=offer(v(['Secret Box','Ultra Ball','Dark Patch','VS Seeker',
    'Iono','Carmine','Lightning Energy']));
  assert.equal(works.eligible,true);
  assert.equal(works.basicSearcher,'Ultra Ball');
  assert.equal(works.laterBasicSearcherPayment,2);
  const fails=offer(v(['Secret Box','Ultra Ball','Dark Patch','VS Seeker',
    'Iono','Carmine']));
  assert.equal(fails.eligible,false);
  assert.equal(fails.reason,'NO_HELD_LATER_BASIC_SEARCH_PAYMENT');
});
test('Box does not count future category output toward three upfront discards',()=>{
  const fails=offer(v(['Secret Box','Quick Ball','Dark Patch',
    'Float Stone','Iono']));
  assert.equal(fails.eligible,false);
  assert.equal(fails.reason,'NO_BOX_UPFRONT_THREE_DISCARDS');
});
test('already in play Trubbish needs no additional Bench or held Basic',()=>{
  const x=v(['Secret Box','Dark Patch','Iono','Carmine']);
  x.benchNames=['Trubbish','Crobat V','Dedenne-GX','Tapu Lele-GX','Budew'];
  assert.equal(offer(x).trubbishMode,'already-in-play');
});
test('no Basic searcher and no Trubbish fail before K1',()=>{
  const x=offer(v(['Secret Box','Dark Patch','Iono','Carmine']));
  assert.equal(x.reason,'NO_HELD_TRUBBISH_OR_BASIC_SEARCHER');
});
test('global turn 2 legal and later turns or public lock rejected',()=>{
  const x=v(['Secret Box','Trubbish','Dark Patch','Iono','Carmine']);
  x.turn=2;assert.equal(offer(x).eligible,true);
  x.turn=3;assert.equal(offer(x).eligible,false);
  x.turn=2;x.toolLocked=true;
  assert.equal(offer(x).reason,'PUBLIC_ITEM_OR_TOOL_LOCK');
});
