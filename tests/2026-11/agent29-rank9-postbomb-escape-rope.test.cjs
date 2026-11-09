'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choosePostBombRope,chooseOpponentRopeSurvival,
  chooseOpponentRopeDamageAware,printedKnockoutPrizes,ELECTRODE,MEGA,ROPE}=
  require('../../simulation/twinleaf/2026-11/agent29-rank9-postbomb-escape-rope.cjs');

/** @param {string|null} name @param {number} attached */
function slot(name,attached=0){
  return {getPokemonCard:()=>name?{fullName:name}:null,
    energies:{cards:Array.from({length:attached},()=>({fullName:'Darkness Energy'}))}};
}
/** @param {0|1} [seat] */
function fixture(seat=0){
  const source={
    cannotPlayItemCards:false,
    hand:{cards:[{fullName:ROPE},{fullName:'Boss Orders'}]},
    active:slot('Gengar & Mimikyu-GX TEU',1),
    bench:[slot('Dedenne-GX UNB'),slot(MEGA,3),slot('Unown LOT')],
    discard:{cards:[{fullName:ELECTRODE}]},
    getPrizeLeft:()=>6
  };
  const opposing={
    bench:[slot('Trevenant & Dusknoir-GX SPM')],
    getPrizeLeft:()=>4
  };
  return {activePlayer:seat,players:seat===0?
      [source,opposing]:[opposing,source],prompts:[]};
}
test('authentic post-Bomb physical source hand, target and opponent Bench',()=>{
  assert.deepEqual(choosePostBombRope(fixture(),0),{
    handIndex:0,megaBenchIndex:1
  });
});
test('both physical source-seat orientations are equivalent',()=>{
  assert.deepEqual(choosePostBombRope(fixture(1),1),{
    handIndex:0,megaBenchIndex:1
  });
});
test('an Electrodes absence cannot be treated as an accomplished paid Bomb',()=>{
  const s=fixture();s.players[0].discard.cards=[];
  assert.equal(choosePostBombRope(s,0),null);
});
test('an unfunded Mega or absent original Mega cannot switch for a paid attack',()=>{
  const s=fixture();s.players[0].bench[1]=slot(MEGA,2);
  assert.equal(choosePostBombRope(s,0),null);
  s.players[0].bench[1]=slot('Voltorb ROS',3);
  assert.equal(choosePostBombRope(s,0),null);
});
test('opponent chooses a Bench replacement so no opponent Bench prohibits Rope',()=>{
  const s=fixture();s.players[1].bench=[];
  assert.equal(choosePostBombRope(s,0),null);
});
test('Rope only when held by the source owner and Items accessible',()=>{
  const s=fixture();s.players[0].hand.cards.shift();
  assert.equal(choosePostBombRope(s,0),null);
  s.players[0].hand.cards.unshift({fullName:ROPE});
  s.players[0].cannotPlayItemCards=true;
  assert.equal(choosePostBombRope(s,0),null);
});
test('rejects before the two-Prize Bomb payment and during a pending prompt',()=>{
  const s=fixture();s.players[1].getPrizeLeft=()=>6;
  assert.equal(choosePostBombRope(s,0),null);
  s.players[1].getPrizeLeft=()=>4;
  s.prompts=[{result:undefined}];
  assert.equal(choosePostBombRope(s,0),null);
  s.prompts=[];
  s.activePlayer=1;
  assert.equal(choosePostBombRope(s,0),null);
});
test('already active Mega or opponent with no remaining Prizes is not eligible',()=>{
  const s=fixture();s.players[0].active=slot(MEGA,3);
  assert.equal(choosePostBombRope(s,0),null);
  s.players[0].active=slot('Gengar & Mimikyu-GX TEU',1);
  s.players[1].getPrizeLeft=()=>0;
  assert.equal(choosePostBombRope(s,0),null);
});

test('opponent uses its own public highest-remaining-HP eligible Bench slot',()=>{
  const state=fixture();
  const enemy=state.players[1];
  const make=(name,hp,damage)=>({
    getPokemonCard:()=>({fullName:name,hp}),damage
  });
  enemy.bench=[
    make('Galarian Articuno V CRE',210,0),
    make('Mewtwo & Mew-GX UNM',270,20),
    make('Duskull VIV',60,0)
  ];
  const prompt={playerId:enemy.id,
    validate:slots=>slots[0]!==enemy.bench[1]};
  // An unselectable high-HP slot is never returned.
  assert.equal(chooseOpponentRopeSurvival(state,0,prompt).printing,
    'Galarian Articuno V CRE');
  prompt.validate=()=>true;
  assert.deepEqual(
    (({benchIndex,printing,remainingHp})=>({benchIndex,printing,remainingHp}))(
      chooseOpponentRopeSurvival(state,0,prompt)),{
      benchIndex:1,printing:'Mewtwo & Mew-GX UNM',remainingHp:250
    });
});
test('opponent defensive prompt rejects nonmatching owner, invalid HP and empty Bench',()=>{
  const state=fixture(1);
  state.players[0].id=101;
  const prompt={playerId:101,validate:()=>true};
  state.players[0].bench=[{
    getPokemonCard:()=>({fullName:'Unknown',hp:'wrong'}),damage:0
  }];
  assert.equal(chooseOpponentRopeSurvival(state,1,prompt),null);
  state.players[0].bench=[];
  assert.equal(chooseOpponentRopeSurvival(state,1,prompt),null);
  state.players[0].bench=[{
    getPokemonCard:()=>({fullName:'Real',hp:100}),damage:0
  }];
  assert.equal(chooseOpponentRopeSurvival(state,1,{...prompt,playerId:102}),null);
});

test('printed Prize tiers in the actual fixed Aichi source opponents',()=>{
  assert.equal(printedKnockoutPrizes('Duskull VIV'),1);
  assert.equal(printedKnockoutPrizes('Radiant Eternatus CRZ'),1);
  assert.equal(printedKnockoutPrizes('Klefki SVI'),1);
  assert.equal(printedKnockoutPrizes('Galarian Articuno V CRE'),2);
  assert.equal(printedKnockoutPrizes('Latias ex SSP'),2);
  assert.equal(printedKnockoutPrizes('Gengar & Mimikyu-GX TEU'),3);
  assert.equal(printedKnockoutPrizes('Mega Absol ex M1L'),3);
});
test('damage-aware owner protects prizes instead of promoting Darkness-weak TAG TEAM',()=>{
  const state=fixture(),owner=state.players[0],enemy=state.players[1];
  owner.bench[1].getPokemonCard=()=>({fullName:MEGA,cardType:[7]});
  enemy.id=102;
  const p=(name,hp,weakness=[])=>({
    getPokemonCard:()=>({fullName:name,hp,weakness,resistance:[]}),damage:0
  });
  enemy.bench=[
    p('Galarian Articuno V CRE',210,[{type:7,value:2}]),
    p('Gengar & Mimikyu-GX TEU',240,[{type:7,value:2}]),
    p('Klefki SVI',70,[]),
    p('Duskull VIV',60,[])
  ];
  const prompt={playerId:102,validate:()=>true};
  const chosen=chooseOpponentRopeDamageAware(state,0,prompt);
  assert.equal(chosen.printing,'Klefki SVI');
  assert.equal(chosen.nominalClawDamage,200);
  assert.equal(chosen.expectedPrizeLoss,1);
  assert.equal(chosen.nominallySurvives,false);
  assert.equal(chosen.weakToDarkness,false);
});
test('damage-aware opponent prioritizes surviving target before Prize loss',()=>{
  const state=fixture(1),owner=state.players[1],enemy=state.players[0];
  owner.bench[1].getPokemonCard=()=>({fullName:MEGA,cardType:[7]});
  enemy.id=101;
  enemy.bench=[
    {getPokemonCard:()=>({
      fullName:'Mewtwo & Mew-GX UNM',hp:270,
      weakness:[{type:5,value:2}],resistance:[]}),damage:0},
    {getPokemonCard:()=>({
      fullName:'Duskull VIV',hp:60,weakness:[],resistance:[]}),damage:0}
  ];
  const chosen=chooseOpponentRopeDamageAware(state,1,{
    playerId:101,validate:()=>true
  });
  assert.equal(chosen.printing,'Mewtwo & Mew-GX UNM');
  assert.equal(chosen.nominallySurvives,true);
  assert.equal(chosen.nominalRemainingAfter,70);
  assert.equal(chosen.expectedPrizeLoss,3);
});
test('native prompt filtering and missing original Mega type fail closed',()=>{
  const state=fixture(),enemy=state.players[1];
  enemy.id=102;
  enemy.bench=[
    {getPokemonCard:()=>({fullName:'Klefki SVI',hp:70,weakness:[]}),
      damage:0}
  ];
  const prompt={playerId:102,validate:()=>true};
  assert.equal(chooseOpponentRopeDamageAware(state,0,prompt),null);
  state.players[0].bench[1].getPokemonCard=()=>({
    fullName:MEGA,cardType:[7]
  });
  assert.equal(chooseOpponentRopeDamageAware(state,0,{
    ...prompt,validate:()=>false
  }),null);
  assert.equal(chooseOpponentRopeDamageAware(state,0,{
    ...prompt,playerId:999
  }),null);
});
