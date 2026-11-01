'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withPaperDuskullDiscardOption}=
  require('../simulation/twinleaf/agent25-rank31-paper-duskull-discard-hook.cjs');
/** @template T @param {()=>T} action @returns {T} */
const withPaper=action=>withPaperDuskullDiscardOption(action).result;
/** @param {string} modulePath */
const load=modulePath=>require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',modulePath));

const {Store}=load('game/store/store');
const {Player}=load('game/store/state/player');
const {PokemonCardList}=load('game/store/state/pokemon-card-list');
const {GamePhase}=load('game/store/state/state');
const {AttackEffect}=load('game/store/effects/game-effects');
const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');

let nextId=25000;

/**
 * Genuine pinned native Store, with original source printing PRE (which
 * inherits the defective SFA attack reducer). Synthetic attack-effect entry
 * intentionally isolates the effect, not payment or turn legality.
 * @param {{discard?:number,hand?:number,fullBench?:boolean}} [options]
 */
function board(options={}){
  const manager=initializeCards();
  /** @param {string} name */
  const printed=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Pinned native printing unavailable: '+name);
    card.id=nextId++;
    return card;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player();owner.id=101;owner.name='original-rank31';
  const opponent=new Player();opponent.id=202;opponent.name='opponent';
  state.players=[owner,opponent];
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  state.activePlayer=0;
  state.turn=3;
  state.phase=GamePhase.ATTACK;
  const active=printed('Duskull PRE');
  owner.active.cards.push(active);
  opponent.active.cards.push(printed('Shadow Rider Calyrex V CRE'));
  const discard=[];
  for(let i=0;i<(options.discard??1);i++){
    const c=printed('Duskull PRE');discard.push(c);
    owner.discard.cards.push(c);
  }
  const hand=[];
  for(let i=0;i<(options.hand??0);i++){
    const c=printed('Duskull PRE');hand.push(c);
    owner.hand.cards.push(c);
  }
  if(options.fullBench){
    for(const slot of owner.bench)slot.cards.push(printed('Duskull PRE'));
  }
  const attack=new AttackEffect(owner,opponent,active.attacks[0]);
  return {store,state,owner,opponent,active,attack,hand,discard};
}

/** @param {ReturnType<typeof board>} b */
function invoke(b){
  return b.active.reduceEffect(b.store,b.state,b.attack);
}

test('pinned original PRE attack fails on valid discard-only Duskull',()=>{
  const b=board({discard:1,hand:0});
  assert.equal(b.active.attacks[0].name,'Come and Get You');
  assert.throws(()=>invoke(b),error=>
    String(error?.message??error).includes('CANNOT_USE_POWER'));
  assert.equal(b.owner.discard.cards.length,1);
  assert.equal(b.state.prompts.length,0);
});

test('opt-in paper hook retrieves actual discard target to native Bench',()=>{
  const b=board({discard:1,hand:0});
  withPaper(()=>{
    invoke(b);
    assert.equal(b.state.prompts.length,1);
    const prompt=b.state.prompts[0];
    assert.ok(prompt instanceof ChooseCardsPrompt);
    assert.equal(prompt.playerId,b.owner.id);
    assert.strictEqual(prompt.cards,b.owner.discard);
    assert.equal(prompt.options.min,0);
    assert.equal(prompt.options.max,1);
    assert.equal(prompt.validate([b.discard[0]]),true);
    b.store.dispatch(new ResolvePromptAction(prompt.id,[b.discard[0]]));
    assert.equal(b.owner.discard.cards.length,0);
    assert.strictEqual(b.owner.bench[0].getPokemonCard(),b.discard[0]);
    assert.equal(b.owner.bench[0].pokemonPlayedTurn,b.state.turn);
    assert.equal(b.owner.active.getPokemonCard(),b.active);
  });
  assert.throws(()=>invoke(board({discard:1})),error=>
    String(error?.message??error).includes('CANNOT_USE_POWER'),
  'Research hook must restore inherited pinned vendor method');
});

test('printed up-to search does nothing without discard candidates',()=>{
  const b=board({discard:0,hand:1});
  withPaper(()=>{
    const result=invoke(b);
    assert.strictEqual(result,b.state);
    assert.equal(b.state.prompts.length,0);
    assert.equal(b.owner.hand.cards.length,1);
    assert.ok(b.owner.bench.every(slot=>!slot.getPokemonCard()));
  });
});

test('printed up-to permits declining an otherwise available discard target',()=>{
  const b=board({discard:1,hand:0});
  withPaper(()=>{
    invoke(b);
    const p=b.state.prompts[0];
    assert.equal(p.options.min,0);
    assert.equal(p.validate([]),true);
    b.store.dispatch(new ResolvePromptAction(p.id,[]));
    assert.deepEqual(b.owner.discard.cards,b.discard);
    assert.ok(b.owner.bench.every(slot=>!slot.getPokemonCard()));
  });
});

test('full Bench is a legal no-target attack, no impossible prompt',()=>{
  const b=board({discard:1,hand:0,fullBench:true});
  withPaper(()=>{
    assert.strictEqual(invoke(b),b.state);
    assert.equal(b.state.prompts.length,0);
    assert.equal(b.owner.discard.cards.length,1);
  });
});

test('native prompt limits returned copies to the available Bench',()=>{
  const b=board({discard:2,hand:0});
  for(let i=0;i<4;i++){
    const c=initializeCards().getCardByName('Duskull PRE');c.id=nextId++;
    b.owner.bench[i].cards.push(c);
  }
  withPaper(()=>{
    invoke(b);
    const [p]=b.state.prompts;
    assert.equal(p.options.min,0);
    assert.equal(p.options.max,1);
    assert.equal(p.validate(b.discard),false);
    assert.equal(p.validate([b.discard[1]]),true);
    b.store.dispatch(new ResolvePromptAction(p.id,[b.discard[1]]));
    assert.strictEqual(b.owner.bench[4].getPokemonCard(),b.discard[1]);
    assert.deepEqual(b.owner.discard.cards,[b.discard[0]]);
  });
});

test('other Duskull attack still delegates to native original reducer',()=>{
  const b=board({discard:1,hand:0});
  const attack=new AttackEffect(b.owner,b.opponent,b.active.attacks[1]);
  withPaper(()=>{
    assert.strictEqual(b.active.reduceEffect(b.store,b.state,attack),b.state);
    assert.equal(b.state.prompts.length,0);
  });
});

test('throwing scoped execution restores pinned native method',()=>{
  const old=load('sets/10-scarlet-and-violet/set-prismatic-evolution/alt-arts')
    .DuskullPRE.prototype.reduceEffect;
  assert.throws(()=>withPaper(()=>{
    throw new Error('sentinel');
  }),/sentinel/);
  assert.strictEqual(
    load('sets/10-scarlet-and-violet/set-prismatic-evolution/alt-arts')
      .DuskullPRE.prototype.reduceEffect,old);
});
