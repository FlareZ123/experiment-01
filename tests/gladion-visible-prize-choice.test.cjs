'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseRevealedGladionPrize}=
  require('../simulation/twinleaf/gladion-visible-prize-resolver.cjs');

const card=fullName=>({fullName});
const slot=(fullName,isSecret=false)=>({cards:[card(fullName)],isSecret});
const make=()=>{
  const prizes=[
    slot('Psychic Energy MEE'),
    slot('Gloom AOR'),
    slot('Grand Tree SCR'),
    slot('Fire Energy MEE')
  ];
  const player={id:101,prizes,supporter:{cards:[card('Gladion CIN')]}};
  const state={players:[player]};
  const prompt={playerId:101,options:{count:1,blocked:[],
    useOpponentPrizes:false},validate(result){
      return result.length===1 && prizes.includes(result[0]);
    }};
  return {state,player,prompt,prizes};
};

test('root-revealed Gladion can select a later printed singleton',()=>{
  const {state,player,prompt,prizes}=make();
  const before=prizes.map(p=>p.cards[0]);
  assert.equal(chooseRevealedGladionPrize(
    state,player,prompt,'Grand Tree SCR'),prizes[2]);
  assert.deepEqual(prizes.map(p=>p.cards[0]),before,
    'resolver leaves physical State untouched');
});

test('face-down or partly hidden Prizes forbid the alternative',()=>{
  const f=make();
  f.prizes[0].isSecret=true;
  assert.equal(chooseRevealedGladionPrize(
    f.state,f.player,f.prompt,'Grand Tree SCR'),null);
});

test('missing, blocked and foreign-owner choices fall through',()=>{
  const f=make();
  assert.equal(chooseRevealedGladionPrize(
    f.state,f.player,f.prompt,'Computer Search BCR'),null);
  f.prompt.options.blocked=[2];
  assert.equal(chooseRevealedGladionPrize(
    f.state,f.player,f.prompt,'Grand Tree SCR'),null);
  f.prompt.options.blocked=[];
  f.prompt.playerId=202;
  assert.equal(chooseRevealedGladionPrize(
    f.state,f.player,f.prompt,'Grand Tree SCR'),null);
});

test('requires Gladion source and own single Prize prompt',()=>{
  const f=make();
  f.player.supporter.cards=[];
  assert.equal(chooseRevealedGladionPrize(
    f.state,f.player,f.prompt,'Grand Tree SCR'),null);
  f.player.supporter.cards=[card('Gladion CIN')];
  f.prompt.options.count=2;
  assert.equal(chooseRevealedGladionPrize(
    f.state,f.player,f.prompt,'Grand Tree SCR'),null);
  f.prompt.options.count=1;
  f.prompt.options.useOpponentPrizes=true;
  assert.equal(chooseRevealedGladionPrize(
    f.state,f.player,f.prompt,'Grand Tree SCR'),null);
});

test('rejects invalid prompt solutions even with revealed target',()=>{
  const f=make();
  f.prompt.validate=()=>false;
  assert.equal(chooseRevealedGladionPrize(
    f.state,f.player,f.prompt,'Grand Tree SCR'),null);
});
