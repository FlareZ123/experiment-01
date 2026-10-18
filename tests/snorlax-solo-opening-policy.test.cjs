'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseSoloSnorlax,withSoloSnorlaxOpening}=
  require('../simulation/twinleaf/snorlax-solo-opening-policy.cjs');

const snorlax={name:'Snorlax',fullName:'Snorlax PGO',stage:'BASIC',superType:'POKEMON'};
const mew={name:'Mew',fullName:'Mew CEL',stage:'BASIC',superType:'POKEMON'};
const tool={name:'Float Stone',fullName:'Float Stone BKT',superType:'TRAINER'};
const starting='starting';

class ChooseCardsPrompt{
  constructor({message=starting,playerId=101,valid=true}={}){
    this.id=33;this.message=message;this.playerId=playerId;this.valid=valid;
  }
  validate(selected){
    return this.valid && selected.length>=1 && selected.length<=6 &&
      selected.every(card=>card===snorlax||card===mew);
  }
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPromptResolver{
  resolvePrompt(_state,player,prompt){
    return new ResolvePromptAction(prompt.id,
      player.hand.cards.filter(card=>card.superType==='POKEMON'));
  }
}
const types={ChooseCardsPromptResolver,ChooseCardsPrompt,ResolvePromptAction,
  GameMessage:{CHOOSE_STARTING_POKEMONS:starting}};

test('select held physical PGO Snorlax exclusively, preserving identity',()=>{
  const hand=[tool,mew,snorlax];
  assert.deepEqual(chooseSoloSnorlax(hand),[snorlax]);
  assert.strictEqual(chooseSoloSnorlax(hand)[0],hand[2]);
  assert.equal(chooseSoloSnorlax([mew,tool]),null);
  assert.deepEqual(hand,[tool,mew,snorlax]);
});

test('per-seat resolver selects solo from own setup and reports actual choice',()=>{
  const original={promptResolvers:[ChooseCardsPromptResolver],tactics:[]};
  const events=[];
  const adapted=withSoloSnorlaxOpening(original,types,events);
  assert.equal(original.promptResolvers[0],ChooseCardsPromptResolver);
  assert.strictEqual(withSoloSnorlaxOpening(adapted,types,events),adapted);
  const resolver=new adapted.promptResolvers[0]();
  const player={id:101,hand:{cards:[tool,mew,snorlax]}};
  const choice=resolver.resolvePrompt({},player,new ChooseCardsPrompt());
  assert.deepEqual(choice.result,[snorlax]);
  assert.equal(events.length,1);
  assert.equal(events[0].sawSnorlax,true);
  assert.equal(events[0].appliedSoloSnorlax,true);
  assert.equal(events[0].selectedCount,1);
  assert.equal(events[0].otherBasicCountInOwnHand,1);
});

test('noneligible cases fall back to pinned selection with negative audit',()=>{
  const events=[];
  const original={promptResolvers:[ChooseCardsPromptResolver],tactics:[]};
  const resolver=new (withSoloSnorlaxOpening(original,types,events)
    .promptResolvers[0])();
  const yes={id:101,hand:{cards:[mew,snorlax]}};
  const no={id:101,hand:{cards:[tool,mew]}};
  const unrelated=resolver.resolvePrompt({},yes,
    new ChooseCardsPrompt({message:'search'}));
  assert.deepEqual(unrelated.result,[mew,snorlax]);
  const wrongOwner=resolver.resolvePrompt({},yes,
    new ChooseCardsPrompt({playerId:202}));
  assert.deepEqual(wrongOwner.result,[mew,snorlax]);
  assert.equal(events.length,0);
  const missing=resolver.resolvePrompt({},no,new ChooseCardsPrompt());
  assert.deepEqual(missing.result,[mew]);
  assert.equal(events[0].sawSnorlax,false);
  const invalid=resolver.resolvePrompt({},yes,new ChooseCardsPrompt({valid:false}));
  assert.deepEqual(invalid.result,[mew,snorlax]);
  assert.equal(events[1].sawSnorlax,true);
  assert.equal(events[1].appliedSoloSnorlax,false);
});
