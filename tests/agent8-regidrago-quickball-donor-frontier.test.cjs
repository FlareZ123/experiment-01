'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseRegidragoDonorQuickBall,REGIDRAGO_V,EVOLVED_DONORS}=
  require('../simulation/twinleaf/agent8-regidrago-quickball-donor-frontier.cjs');
const {chooseQuickBallRootIntent}=
  require('../simulation/twinleaf/agent8-actor-quick-ball-frontier.cjs');

function view(){
  return {decisionKind:'owner-root',globalTurn:2,
    ownHand:['Quick Ball FST','Dragapult ex TWM','Grass Energy MEE'],
    ownPublic:{
      active:{printing:'Latias ex SSP'},bench:[null,null,null,null,null],
      deckCount:40
    },
    ownTurnResources:{itemPlayLocked:false,pokemonPlayLocked:false}};
}

test('owner-only Regidrago V acquisition accepts a singleton evolved Dragon payment',()=>{
  const v=view();
  assert.equal(chooseQuickBallRootIntent(v),null);
  assert.deepEqual(chooseRegidragoDonorQuickBall(v),{
    kind:'play-quick-ball',handIndex:0,printing:'Quick Ball FST',
    donorPrinting:'Dragapult ex TWM',desiredTarget:REGIDRAGO_V,
    source:'rank13-dragon-donor'
  });
  for(const printing of EVOLVED_DONORS){
    v.ownHand[1]=printing;
    assert.equal(chooseRegidragoDonorQuickBall(v)?.donorPrinting,printing);
  }
});

test('don't spend a donor when target already accessible or on board',()=>{
  const v=view();
  v.ownHand.push(REGIDRAGO_V);
  assert.equal(chooseRegidragoDonorQuickBall(v),null);
  v.ownHand.pop();v.ownPublic.bench[1]={printing:REGIDRAGO_V};
  assert.equal(chooseRegidragoDonorQuickBall(v),null);
  v.ownPublic.bench[1]=null;
  v.ownPublic.active.printing='Regidrago VSTAR SIT';
  assert.equal(chooseRegidragoDonorQuickBall(v),null);
});

test('duplicates retain the existing low-cost selector; native lock boundaries',()=>{
  const v=view();
  v.ownHand.push('Grass Energy MEE');
  assert.ok(chooseQuickBallRootIntent(v));
  assert.equal(chooseRegidragoDonorQuickBall(v),null);
  v.ownHand.pop();
  v.ownTurnResources.itemPlayLocked=true;
  assert.equal(chooseRegidragoDonorQuickBall(v),null);
  v.ownTurnResources.itemPlayLocked=false;
  v.ownTurnResources.pokemonPlayLocked=true;
  assert.equal(chooseRegidragoDonorQuickBall(v),null);
  v.ownTurnResources.pokemonPlayLocked=false;
  v.ownPublic.bench.fill({printing:'Occupied'});
  assert.equal(chooseRegidragoDonorQuickBall(v),null);
  v.ownPublic.bench[0]=null;
  v.ownPublic.deckCount=0;
  assert.equal(chooseRegidragoDonorQuickBall(v),null);
});

test('opponent hand and unrevealed Prize positions cannot affect actor choice',()=>{
  const a=view(),b=view();
  a.opponentHidden=['Regidrago V SIT'];a.prizes=['Dragapult'];
  b.opponentHidden=['Boss'];b.prizes=['Quick Ball'];
  assert.deepEqual(chooseRegidragoDonorQuickBall(a),
    chooseRegidragoDonorQuickBall(b));
});
