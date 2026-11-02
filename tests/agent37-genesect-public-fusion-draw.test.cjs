'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,chooseGenesectFusionDraw}=
  require('../simulation/twinleaf/agent37-genesect-public-fusion-draw.cjs');

function fixture(){
  const view={decisionKind:'owner-root',globalTurn:7,ownHand:[],
    ownPublic:{deckCount:18,
      active:{printing:'Mew VMAX FST',abilities:[]},
      bench:[{printing:'Genesect V FST',
        abilities:['Fusion Strike System']},{printing:'Mew V FST'},null],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic:{active:{printing:'Dialga-GX FLI'}}};
  Object.defineProperty(view,'opponentHand',{
    get(){throw Error('Opponent hidden hand accessed');}
  });
  Object.defineProperty(view,'ownPrizeCards',{
    get(){throw Error('Own hidden Prize composition accessed');}
  });
  return view;
}

test('native-neutral Fusion Strike System root is owner-visible, bench index exact',()=>{
  const view=fixture();
  assert.match(VERSION,/agent37-owner-public-genesect/);
  assert.deepEqual(chooseGenesectFusionDraw(view),{
    kind:'use-genesect-fusion-draw',position:'bench',benchIndex:0,
    abilityName:'Fusion Strike System',knownFusionCount:3,handCount:0,
    policy:VERSION
  });
});

test('cannot choose a no-op draw, empty deck or same-turn consumed Ability',()=>{
  const view=fixture();
  view.ownHand=['A','B','C'];
  assert.equal(chooseGenesectFusionDraw(view),null);
  view.ownHand=[];
  view.ownPublic.deckCount=0;
  assert.equal(chooseGenesectFusionDraw(view),null);
  view.ownPublic.deckCount=1;
  assert.equal(chooseGenesectFusionDraw(view,{usedThisTurn:true}),null);
});

test('requires the exact visible original Fusion Strike donor and recognizes Active Genesect',()=>{
  const view=fixture();
  view.ownPublic.bench[0].abilities=[];
  assert.equal(chooseGenesectFusionDraw(view),null);
  view.ownPublic.bench[0]=null;
  view.ownPublic.active={printing:'Genesect V FST',
    abilities:['Fusion Strike System']};
  assert.equal(chooseGenesectFusionDraw(view)?.position,'active');
  view.ownPublic.active={printing:'Crobat V DAA',
    abilities:['Dark Asset']};
  assert.equal(chooseGenesectFusionDraw(view),null);
});

test('ability root ignores opponent private information and never mutates view',()=>{
  const view=fixture();
  const before=JSON.stringify(view);
  assert.equal(chooseGenesectFusionDraw(view)?.benchIndex,0);
  assert.equal(JSON.stringify(view),before);
  view.decisionKind='owner-prompt';
  assert.throws(()=>chooseGenesectFusionDraw(view),/owner-root/);
});

test('physical native draw receipt requires exact publicly visible hand/deck delta',()=>{
  const {rootPhysicalWitness}=
    require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
  const intent={kind:'use-genesect-fusion-draw',knownFusionCount:3};
  assert.equal(rootPhysicalWitness(intent,
    {deckCount:14,handCount:0},{deckCount:11,handCount:3},{}),
  'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,
    {deckCount:14,handCount:0},{deckCount:13,handCount:3},{}),
  'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,
    {deckCount:14,handCount:3},{deckCount:14,handCount:3},{}),
  'no-confirmed-public-effect');
});

test('only actual Fusion Strike printed Pokémon count, no invented marks',()=>{
  const view=fixture();
  view.ownPublic.bench[1]={printing:"Lillie's Clefairy ex JTG"};
  assert.equal(chooseGenesectFusionDraw(view)?.knownFusionCount,2);
  view.ownHand=['A','B'];
  assert.equal(chooseGenesectFusionDraw(view),null);
  view.ownPublic.bench[1]={printing:'Mew V FST'};
  assert.equal(chooseGenesectFusionDraw(view)?.knownFusionCount,3);
});

test('attack-only lock does not veto a separately available Genesect draw Ability',()=>{
  const view=fixture();
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=3;
  const choice=chooseGenesectFusionDraw(view);
  assert.equal(choice?.kind,'use-genesect-fusion-draw');
  assert.equal(choice?.knownFusionCount,3);
});
