'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,isTurnEntrySupport,chooseOwnedProtectedStartingBasics:choose
}=require('../simulation/twinleaf/agent50-owner-preserve-turn-entry-setup.cjs');
const {chooseOwnedStartingBasics:greedy}=
  require('../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs');

const Stage={BASIC:0,STAGE_1:1};
const CardTag={PLAY_DURING_SETUP:'setup'};
const card=(fullName,entry=false,stage=Stage.BASIC)=>({
  fullName,stage,tags:[],powers:entry?[{
    name:'entry',text:'When you play this Pokémon from your hand onto your Bench during your turn, you may draw 2 cards.'
  }]:[]
});
function fixture(cards,max=6,min=1){
  const owner={hand:{cards}};
  const prompt={
    cards:owner.hand,options:{min,max,allowCancel:false,blocked:[]},
    validate(result){
      return result.length>=this.options.min&&
        result.length<=this.options.max&&
        result.every(x=>owner.hand.cards.includes(x)&&
          x.stage===Stage.BASIC&&
          !this.options.blocked.includes(owner.hand.cards.indexOf(x)));
    }
  };
  return {owner,prompt};
}

test('owner-only printed entry trigger detects only in-turn Bench ability',()=>{
  assert.equal(VERSION,
    'agent50-owner-preserve-turn-entry-setup-proposal-v1');
  assert.equal(isTurnEntrySupport(card('Tapu Lele-GX GRI',true)),true);
  assert.equal(isTurnEntrySupport(card('Regidrago V SIT')),false);
  assert.equal(isTurnEntrySupport({powers:[{text:
    'When you play this Pokémon from your hand to evolve, draw 2 cards.'}]}),
  false);
});

test('same opening has valid contrasting greedy and protected choices',()=>{
  const attacker=card('Regidrago V SIT');
  const lele=card('Tapu Lele-GX GRI',true);
  const crobat=card('Crobat V DAA',true);
  const second=card('Mew V FST');
  const f=fixture([attacker,lele,crobat,second]);
  const baseline=greedy(f.prompt,f.owner,Stage,CardTag);
  const proposed=choose(f.prompt,f.owner,Stage,CardTag);
  assert.deepEqual(baseline,[attacker,lele,crobat,second]);
  assert.deepEqual(proposed,[attacker,second]);
  assert.equal(f.prompt.validate(proposed),true);
  assert.deepEqual(f.owner.hand.cards,[attacker,lele,crobat,second],
    'pure proposal must leave all actual physical cards untouched');
});

test('select an eligible nontrigger as Active even when support is first in hand',()=>{
  const f=fixture([
    card('Tapu Lele-GX GRI',true),
    card('Dedenne-GX UNB',true),
    card('Regidrago V SIT'),
    card('Gengar V FST')
  ]);
  assert.deepEqual(choose(f.prompt,f.owner,Stage,CardTag),
    f.owner.hand.cards.slice(2));
});

test('all supported Basics still submit one legal Active and preserve others',()=>{
  const f=fixture([card('Lele',true),card('Crobat',true)]);
  assert.deepEqual(choose(f.prompt,f.owner,Stage,CardTag),
    [f.owner.hand.cards[0]]);
  f.prompt.options.blocked=[0];
  assert.deepEqual(choose(f.prompt,f.owner,Stage,CardTag),
    [f.owner.hand.cards[1]]);
  f.prompt.options.blocked=[0,1];
  assert.equal(choose(f.prompt,f.owner,Stage,CardTag),null);
});

test('optional bonus Bench min0 is explicitly declined, min2 unsupported',()=>{
  const f=fixture([card('Support',true),card('Attacker')],3,0);
  assert.deepEqual(choose(f.prompt,f.owner,Stage,CardTag),[]);
  f.prompt.options.min=2;
  assert.equal(choose(f.prompt,f.owner,Stage,CardTag),null);
});

test('owner candidate is independent of opponent concealed reorder and bounded max',()=>{
  for(const seat of [0,1]){
    const f=fixture([
      card('Crobat V DAA',true),card('Regidrago V SIT'),
      card('Mew V FST'),card('Genesect V FST'),card('Latias ex SSP'),
      card('Mew V FST'),card('Budew ASC')
    ]);
    const other={hiddenDeck:['secret1','secret2']};
    const players=seat===0?[f.owner,other]:[other,f.owner];
    const first=choose(f.prompt,players[seat],Stage,CardTag);
    other.hiddenDeck.reverse();
    const second=choose(f.prompt,players[seat],Stage,CardTag);
    assert.deepEqual(first,second);
    assert.equal(first.length,6);
    assert.ok(first.every(c=>!isTurnEntrySupport(c)));
    assert.ok(f.prompt.validate(first));
  }
});
