'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {installForestSealSearchHook}=
  require('../simulation/twinleaf/forest-seal-search-hook.cjs');

const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine=modulePath=>require(path.join(root,modulePath));
const {Store}=engine('game/store/store');
const {Player}=engine('game/store/state/player');
const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
const {CardList}=engine('game/store/state/card-list');
const {GamePhase,GameWinner}=engine('game/store/state/state');
const {GameSettings}=engine('game/core/game-settings');
const {CheckPokemonPowersEffect}=engine('game/store/effects/check-effects');
const {PlayCardAction,SlotType,PlayerType}=
  engine('game/store/actions/play-card-action');
const {UseAbilityAction,AttackAction}=
  engine('game/store/actions/game-actions');
const {ResolvePromptAction}=
  engine('game/store/actions/resolve-prompt-action');

const active={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
const bench0={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0};
const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};

/** @param {string} lockPrinting @returns {object} */
function setup(lockPrinting) {
  const manager=initializeCards();
  let id=27000;
  /** @param {string} name */
  const card=name=>{
    const value=manager.getCardByName(name);
    assert.ok(value,'Missing engine printing: '+name);
    value.id=id++;
    return value;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const gameSettings=new GameSettings();
  state.gameSettings=gameSettings;
  state.rules=gameSettings.rules;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=1;
  state.activePlayer=0;

  const attacker=new Player();
  attacker.id=101;
  attacker.name='Meloetta source';
  attacker.active.cards.push(card('Meloetta ex SV11B'));
  attacker.active.energies.cards.push(card('Lightning Energy SVE'));
  const crobat=card('Crobat V DAA');
  const crobatSlot=new PokemonCardList();
  crobatSlot.cards.push(crobat);
  attacker.bench.push(crobatSlot);

  const defender=new Player();
  defender.id=202;
  defender.name='Ability lock opponent';
  defender.active.cards.push(card(lockPrinting));
  const prize=()=>{
    const pile=new CardList();
    pile.cards.push(card('Psychic Energy SVE'));
    return pile;
  };
  attacker.prizes=Array.from({length:6},prize);
  defender.prizes=[prize()];
  state.players=[attacker,defender];

  const cologne=card('Canceling Cologne ASR');
  attacker.deck.cards.push(cologne,card('Psychic Energy SVE'),
    card('Psychic Energy SVE'));
  const stone=card('Forest Seal Stone SIT');
  const crisis=card('Technical Machine: Crisis Punch PAF');
  const dce=card('Double Colorless Energy SUM');
  attacker.hand.cards.push(stone,crisis,dce);
  return {store,state,attacker,defender,crobat,cologne,stone,crisis,dce};
}

/** @param {object} f @param {object} item @param {object} destination */
function play(f,item,destination) {
  const i=f.attacker.hand.cards.indexOf(item);
  assert.notEqual(i,-1,'Source item not in hand: '+item.name);
  f.store.dispatch(new PlayCardAction(f.attacker.id,i,destination));
}

/** @param {object} f @returns {object|undefined} */
function pending(f) {
  return f.state.prompts.find(p=>p.result===undefined);
}

/** @param {object} f */
function resolveWaits(f) {
  for(let i=0;i<24&&pending(f)?.constructor.name==='WaitPrompt';i++) {
    const p=pending(f);
    f.store.dispatch(new ResolvePromptAction(p.id,null));
  }
}

/** @param {string} lockPrinting */
function assertForestSealToCologneToCrisis(lockPrinting) {
  const restore=installForestSealSearchHook();
  try {
    const f=setup(lockPrinting);
    play(f,f.stone,bench0);
    assert.equal(f.attacker.bench[0].tools.includes(f.stone),true);
    const check=new CheckPokemonPowersEffect(f.attacker,f.crobat);
    f.store.reduceEffect(f.state,check);
    assert.ok(check.powers.some(p=>p.name==='Star Alchemy'),
      'Tool-granted power must remain discoverable against '+lockPrinting);

    f.store.dispatch(new UseAbilityAction(f.attacker.id,'Star Alchemy',bench0));
    resolveWaits(f);
    const choose=pending(f);
    assert.equal(choose?.constructor.name,'ChooseCardsPrompt');
    assert.equal(choose.options.min,1,
      'Unrestricted Stone search must select a card');
    assert.equal(choose.validate([f.cologne]),true);
    f.store.dispatch(new ResolvePromptAction(choose.id,[f.cologne]));
    const shuffle=pending(f);
    assert.equal(shuffle?.constructor.name,'ShuffleDeckPrompt');
    assert.equal(f.attacker.deck.cards.length,2);
    f.store.dispatch(new ResolvePromptAction(shuffle.id,[0,1]));
    assert.equal(f.attacker.usedVSTAR,true);
    assert.equal(f.attacker.hand.cards.includes(f.cologne),true);

    play(f,f.cologne,board);
    play(f,f.dce,active);
    play(f,f.crisis,active);
    assert.equal(f.defender.getPrizeLeft(),1);
    f.store.dispatch(new AttackAction(f.attacker.id,'Crisis Punch'));
    resolveWaits(f);
    assert.equal(pending(f),undefined);
    assert.equal(f.state.phase,GamePhase.FINISHED);
    assert.equal(f.state.winner,GameWinner.PLAYER_1);
    assert.equal(f.defender.active.cards.length,0);
  } finally {restore();}
}

test('Stone on source Crobat V finds Cologne under active Iron Thorns and enables firstturn Meloetta attack',()=>{
  assertForestSealToCologneToCrisis('Iron Thorns ex TWM');
});

test('Stone on source Crobat V finds Cologne under active Klefki and enables firstturn Meloetta attack',()=>{
  assertForestSealToCologneToCrisis('Klefki SVI');
});

/**
 * Order Pad is an additional source-inventory Item search channel under
 * Pokémon Ability lock. Heads fetches a live-deck Cologne; tails cannot.
 * Coin result is explicitly controlled rather than presented as probability.
 * @param {string} printing
 * @param {boolean} heads
 */
function assertOrderPadToCologne(printing,heads) {
  const f=setup(printing);
  const pad=initializeCards().getCardByName('Order Pad UPR');
  assert.ok(pad,'Missing source Order Pad');
  f.attacker.hand.cards.push(pad);
  // Pinned RESOLVE_COIN_FLIP_EFFECT consumes randomness during Item dispatch.
  // The subsequent WaitPrompt acknowledges the already sampled result.
  const random=Math.random;
  try {
    Math.random=()=>heads ? 0.25 : 0.75;
    play(f,pad,board);
  } finally {
    Math.random=random;
  }
  resolveWaits(f);
  if(!heads) {
    assert.equal(pending(f),undefined);
    assert.equal(f.attacker.hand.cards.includes(f.cologne),false);
    assert.equal(f.attacker.deck.cards.includes(f.cologne),true);
    return;
  }
  const choose=pending(f);
  assert.equal(choose?.constructor.name,'ChooseCardsPrompt');
  assert.equal(choose.validate([f.cologne]),true);
  f.store.dispatch(new ResolvePromptAction(choose.id,[f.cologne]));

  for(let i=0;i<8&&pending(f);i++) {
    const p=pending(f);
    if(p.constructor.name==='WaitPrompt') {
      f.store.dispatch(new ResolvePromptAction(p.id,null));
    } else if(p.constructor.name==='ShowCardsPrompt') {
      f.store.dispatch(new ResolvePromptAction(p.id,null));
    } else if(p.constructor.name==='ShuffleDeckPrompt') {
      const order=f.attacker.deck.cards.map((_,index)=>index);
      f.store.dispatch(new ResolvePromptAction(p.id,order));
    } else {
      assert.fail('Unexpected source Order Pad prompt: '+p.constructor.name);
    }
  }
  assert.equal(pending(f),undefined);
  assert.equal(f.attacker.hand.cards.includes(f.cologne),true);
  play(f,f.cologne,board);
  play(f,f.dce,active);
  play(f,f.crisis,active);
  f.store.dispatch(new AttackAction(f.attacker.id,'Crisis Punch'));
  resolveWaits(f);
  assert.equal(f.state.phase,GamePhase.FINISHED);
  assert.equal(f.state.winner,GameWinner.PLAYER_1);
}

test('Order Pad heads retrieves Cologne under Iron Thorns and unlocks firstturn Meloetta',()=>{
  assertOrderPadToCologne('Iron Thorns ex TWM',true);
});

test('Order Pad heads retrieves Cologne under Klefki and unlocks firstturn Meloetta',()=>{
  assertOrderPadToCologne('Klefki SVI',true);
});

test('Order Pad tails cannot retrieve Cologne through coin-dependent Item search',()=>{
  assertOrderPadToCologne('Iron Thorns ex TWM',false);
});
