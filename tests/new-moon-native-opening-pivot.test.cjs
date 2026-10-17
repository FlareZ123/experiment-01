'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  prioritizeNativeGengar, withNewMoonNativeOpeningPivot
} = require('../simulation/twinleaf/new-moon-native-opening-pivot.cjs');

const unown = {name:'Unown', fullName:'Unown AOR'};
const gengar = {name:'Gengar & Mimikyu-GX', fullName:'Gengar & Mimikyu-GX TEU'};
const mewtwo = {name:'Mewtwo & Mew-GX', fullName:'Mewtwo & Mew-GX UNM'};

test('native Gengar setup pivot preserves every selected physical Basic reference',()=>{
  const cards=[unown,gengar,mewtwo];
  const copy=cards.slice();
  const result=prioritizeNativeGengar(cards,[{name:'Psychic Energy'}]);
  assert.deepEqual(result,[gengar,unown,mewtwo]);
  assert.strictEqual(result[0],cards[1]);
  assert.deepEqual(cards,copy);
  assert.strictEqual(prioritizeNativeGengar(result,[{name:'Psychic Energy'}]),result);
  assert.deepEqual(prioritizeNativeGengar(cards,[{name:'Telepathic Psychic Energy'}]),
    [gengar,unown,mewtwo]);
});

test('no speculative opening pivot without visible Psychic-providing Energy or native Gengar',()=>{
  const cards=[unown,gengar];
  assert.strictEqual(prioritizeNativeGengar(cards,[]),cards);
  assert.strictEqual(prioritizeNativeGengar(cards,[{name:'Double Colorless Energy'}]),cards);
  assert.strictEqual(prioritizeNativeGengar([unown,mewtwo],[{name:'Psychic Energy'}])[0],unown);
});

test('pinned setup resolver accepts only legal same-card reorder on own setup prompt',()=>{
  const starting='starting';
  class ChooseCardsPrompt {
    constructor(message,selected,valid=true) {
      this.id=77; this.message=message; this.selected=selected; this.valid=valid;
    }
    validate(cards) {
      return this.valid && cards.length===this.selected.length &&
        cards.every(card=>this.selected.includes(card));
    }
  }
  class ResolvePromptAction {
    constructor(id,result){this.id=id;this.result=result;}
  }
  class ChooseCardsPromptResolver {
    resolvePrompt(_state,_player,prompt) {
      return new ResolvePromptAction(prompt.id,prompt.selected);
    }
  }
  const types={
    ChooseCardsPromptResolver,ChooseCardsPrompt,ResolvePromptAction,
    GameMessage:{CHOOSE_STARTING_POKEMONS:starting}
  };
  const original={promptResolvers:[ChooseCardsPromptResolver],tactics:[]};
  const adapted=withNewMoonNativeOpeningPivot(original,types);
  assert.notStrictEqual(adapted,original);
  assert.strictEqual(original.promptResolvers[0],ChooseCardsPromptResolver);
  assert.strictEqual(withNewMoonNativeOpeningPivot(adapted,types),adapted);
  const resolver=new adapted.promptResolvers[0]();
  const player={hand:{cards:[{name:'Psychic Energy'}]}};
  const chosen=resolver.resolvePrompt({},player,new ChooseCardsPrompt(starting,
    [unown,gengar,mewtwo]));
  assert.deepEqual(chosen.result,[gengar,unown,mewtwo]);
  assert.deepEqual(resolver.resolvePrompt({},player,
    new ChooseCardsPrompt('other',[unown,gengar])).result,[unown,gengar]);
  assert.deepEqual(resolver.resolvePrompt({},player,
    new ChooseCardsPrompt(starting,[unown,gengar],false)).result,[unown,gengar]);
});
