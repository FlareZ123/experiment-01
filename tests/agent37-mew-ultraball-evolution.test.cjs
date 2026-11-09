'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,chooseMewUltraBallEvolutionRoot,chooseMewUltraBallSearch
}=require('../simulation/twinleaf/agent37/mew-ultraball-evolution.cjs');

const offered=[
  {index:0,printing:'Crobat V DAA',selectableAlone:true},
  {index:1,printing:'Genesect V FST',selectableAlone:true},
  {index:2,printing:'Mew VMAX FST',selectableAlone:true},
  {index:3,printing:'Mew V FST',selectableAlone:true}
];

/** @param {string[]} hand @param {object} [options] */
function root(hand,{active='Mew V FST',turn=5,deckCount=30,bench=[]}={}){
  return {
    decisionKind:'owner-root',globalTurn:turn,ownHand:hand,
    ownPublic:{deckCount,active:active?{printing:active}:null,
      bench:[...bench,null,null,null]},
    ownTurnResources:{itemPlayLocked:false,pokemonPlayLocked:false}
  };
}

/** @param {object[]} board @param {object} [options] */
function search(board,{seat=1,item='Ultra Ball MEG',source='own-deck',
  message='CHOOSE_CARD_TO_HAND',bundles=undefined}={}){
  return {
    actor:{decisionKind:'owner-prompt',actorSeat:seat,
      ownPublic:{active:board[0]??null,bench:board.slice(1),
        resolvingSupporter:[item]}},
    prompt:{source,message,offered,canSkip:true,canCancel:false,
      ...(bundles!==undefined?{bundles}:{})}
  };
}

test('source Mew V on board and disposable two-card payment creates Ultra Ball root',()=>{
  const hand=['Ultra Ball MEG','Battle VIP Pass FST',"Trainers' Mail ROS",
    'Double Colorless Energy SUM'];
  assert.deepEqual(chooseMewUltraBallEvolutionRoot(root(hand)),{
    kind:'play-mew-ultra-ball',handIndex:0,printing:'Ultra Ball MEG',
    policy:VERSION
  });
});

test('Mew evolution rescue keeps vital DCE and ACE SPEC from speculative payment',()=>{
  assert.equal(chooseMewUltraBallEvolutionRoot(root([
    'Ultra Ball MEG','Double Colorless Energy SUM',
    'Secret Box TWM','Forest Seal Stone SIT'
  ])),null);
  assert.equal(chooseMewUltraBallEvolutionRoot(root([
    'Ultra Ball MEG','Battle VIP Pass FST',
    'Mew VMAX FST',"Trainers' Mail ROS"
  ])),null);
});

test('cannot search unneeded VMAX, unknown deck, or before evolution window',()=>{
  const h=['Ultra Ball MEG','Battle VIP Pass FST',"Trainers' Mail ROS"];
  assert.equal(chooseMewUltraBallEvolutionRoot(root(h,{active:'Mew VMAX FST'})),null);
  assert.equal(chooseMewUltraBallEvolutionRoot(root(h,{active:'Genesect V FST'})),null);
  assert.equal(chooseMewUltraBallEvolutionRoot(root(h,{deckCount:0})),null);
  assert.equal(chooseMewUltraBallEvolutionRoot(root(h,{turn:2})),null);
});

test('genuine source Ultra Ball target is precisely Mew VMAX',()=>{
  assert.deepEqual(chooseMewUltraBallSearch(
    search([{printing:'Mew V FST'},null]),1),{indices:[2]});
});

test('unsupported or opponent search retains original owner generic selection',()=>{
  assert.deepEqual(chooseMewUltraBallSearch(
    search([{printing:'Mew V FST'},null]),0),{indices:[0]});
  assert.deepEqual(chooseMewUltraBallSearch(
    search([{printing:'Genesect V FST'},null]),1),{indices:[0]});
  assert.deepEqual(chooseMewUltraBallSearch(
    search([{printing:'Mew V FST'},null],{source:'own-discard'}),1),
  {indices:[0]});
});

test('source Quick Ball preference remains independently enabled',()=>{
  const prompt=search([{printing:'Mew V FST'},null],
    {item:'Quick Ball FST'});
  assert.deepEqual(chooseMewUltraBallSearch(prompt,1),{indices:[0]});
  assert.deepEqual(chooseMewUltraBallSearch(prompt,1,
    {prioritizeQuickBall:true}),{indices:[1]});
});

test('native Ultra Ball root departure uses physical Item-spent witness',()=>{
  const {rootPhysicalWitness}=
    require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
  const intent={kind:'play-mew-ultra-ball',printing:'Ultra Ball MEG'};
  const before={mewUltraBallSpent:0,handCount:5};
  assert.equal(rootPhysicalWitness(intent,before,
    {mewUltraBallSpent:1,handCount:4},{}),'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,
    {mewUltraBallSpent:0,handCount:5},{}),'no-confirmed-public-effect');
});

test('native Ultra Ball payment refuses an avoidable DCE or singleton Forest Seal Stone',()=>{
  const {chooseMewUltraBallPayment}=
    require('../simulation/twinleaf/agent37/mew-ultraball-evolution.cjs');
  const prompt={
    actor:{
      decisionKind:'owner-prompt',actorSeat:1,globalTurn:16,
      ownHand:['Battle VIP Pass FST','Double Colorless Energy SUM',
        'Forest Seal Stone SIT',"Trainers' Mail ROS",
        'Double Colorless Energy SUM'],
      ownPublic:{resolvingSupporter:['Ultra Ball MEG']}
    },
    prompt:{
      message:'CHOOSE_CARD_TO_DISCARD',source:'own-hand-subset',
      requiredCount:2,
      menu:[
        ['Battle VIP Pass FST','Double Colorless Energy SUM'],
        ['Double Colorless Energy SUM','Double Colorless Energy SUM'],
        ['Forest Seal Stone SIT',"Trainers' Mail ROS"],
        ['Battle VIP Pass FST',"Trainers' Mail ROS"]
      ]
    }
  };
  assert.deepEqual(chooseMewUltraBallPayment(prompt,1),
    {printings:['Battle VIP Pass FST',"Trainers' Mail ROS"]});
  const generic=require('../simulation/twinleaf/agent47-actor-hand-discard.cjs')
    .chooseActorHandDiscard;
  assert.deepEqual(chooseMewUltraBallPayment(prompt,0),
    generic(prompt));
  const quick={...prompt,actor:{...prompt.actor,
    ownPublic:{resolvingSupporter:['Quick Ball FST']}}};
  assert.deepEqual(chooseMewUltraBallPayment(quick,1),
    generic(quick));
});

test('original Ultra Ball payment falls back to authentic required prompt when no safe bundle',()=>{
  const {chooseMewUltraBallPayment}=
    require('../simulation/twinleaf/agent37/mew-ultraball-evolution.cjs');
  const prompt={
    actor:{decisionKind:'owner-prompt',actorSeat:1,
      ownHand:['Double Colorless Energy SUM','Forest Seal Stone SIT'],
      ownPublic:{resolvingSupporter:['Ultra Ball MEG']}},
    prompt:{message:'CHOOSE_CARD_TO_DISCARD',requiredCount:2,
      menu:[['Double Colorless Energy SUM','Forest Seal Stone SIT']]}
  };
  assert.deepEqual(chooseMewUltraBallPayment(prompt,1),
    {printings:['Double Colorless Energy SUM','Forest Seal Stone SIT']});
});
