'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {installDamagePumpSingleSourceHook} =
  require('../simulation/twinleaf/damage-pump-single-source-hook.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(root, name));
const {Store} = engine('game/store/store');
const {Player} = engine('game/store/state/player');
const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
const {CardList} = engine('game/store/state/card-list');
const {GamePhase} = engine('game/store/state/state');
const {GameSettings} = engine('game/core/game-settings');
const {PlayCardAction,PlayerType,SlotType} =
  engine('game/store/actions/play-card-action');
const {ResolvePromptAction} =
  engine('game/store/actions/resolve-prompt-action');

const target = index => ({
  player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index
});
const boardTarget = {
  player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
};

/**
 * Staged legal-card board with a live Store, Risky Ruins, two Exeggcute and
 * exactly six defender Prize cards. This is an effect test, not a
 * randomized 60-card opening.
 * @returns {object} Store and card references
 */
function setup() {
  const manager = initializeCards();
  let id = 7000;
  /** @param {string} fullname @returns {object} Fresh pinned card instance. */
  const card = fullname => {
    const value = manager.getCardByName(fullname);
    assert.ok(value, 'Missing card ' + fullname);
    value.id = id++;
    return value;
  };
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const settings = new GameSettings();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;
  state.activePlayer = 0;
  const attacker = new Player();
  attacker.id = 101;
  attacker.name = 'Meloetta';
  attacker.active.cards.push(card('Meloetta ex SV11B'));
  const defender = new Player();
  defender.id = 202;
  defender.name = 'Opponent';
  defender.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const prize = () => {
    const pile = new CardList();
    pile.cards.push(card('Psychic Energy SVE'));
    return pile;
  };
  attacker.prizes = Array.from({length: 6}, prize);
  defender.prizes = Array.from({length: 6}, prize);
  state.players = [attacker, defender];
  attacker.stadium.cards.push(card('Risky Ruins MEG'));
  const donorNames = ['Unown AOR','Squawkabilly ex PAL','Dedenne-GX UNB'];
  const donors = donorNames.map(name => {
    const slot = new PokemonCardList();
    slot.cards.push(card(name));
    slot.damage = 20;
    attacker.bench.push(slot);
    return slot;
  });
  attacker.bench.push(new PokemonCardList(),new PokemonCardList());
  const eggs = [card('Exeggcute PLF'),card('Exeggcute PLF')];
  const pumps = [card('Damage Pump LOR'),card('Damage Pump LOR'),
    card('Damage Pump LOR')];
  attacker.hand.cards.push(...eggs,...pumps);
  return {store,state,attacker,defender,donors,eggs,pumps};
}

/** @param {object} f @param {object} card @param {object} location */
function play(f,card,location) {
  const handIndex=f.attacker.hand.cards.indexOf(card);
  assert.notEqual(handIndex,-1,'Expected card in staged hand: '+card.name);
  f.store.dispatch(new PlayCardAction(f.attacker.id,handIndex,location));
}

/** @param {object} f @returns {object|undefined} */
function pending(f) {
  return f.state.prompts.find(p=>p.result===undefined);
}

/** @param {object} f @param {number} count */
function claimPrizes(f,count) {
  const prompt=pending(f);
  assert.ok(prompt,'Expected Prize selection prompt');
  assert.equal(prompt.constructor.name,'ChoosePrizePrompt');
  assert.equal(prompt.options.count,count);
  const choices=f.defender.prizes.filter(p=>p.cards.length>0).slice(0,count);
  assert.equal(prompt.validate(choices,f.state),true);
  f.store.dispatch(new ResolvePromptAction(prompt.id,choices));
}

test('live legal Damage Pump produces two Exeggcute self-KOs and two opponent Prizes',()=>{
  const restore=installDamagePumpSingleSourceHook();
  try {
    const f=setup();
    play(f,f.eggs[0],target(3));
    play(f,f.eggs[1],target(4));
    assert.deepEqual(f.attacker.bench.slice(3,5).map(s=>s.damage),[20,20]);
    play(f,f.pumps[0],boardTarget);
    const prompt=pending(f);
    assert.equal(prompt?.constructor.name,'MoveDamagePrompt');
    const legal=[
      {from:target(0),to:target(3)},
      {from:target(0),to:target(4)}
    ];
    assert.equal(prompt.validate(legal,f.state),true);
    f.store.dispatch(new ResolvePromptAction(prompt.id,legal));
    claimPrizes(f,2);
    assert.equal(f.defender.getPrizeLeft(),4);
    assert.equal(f.attacker.discard.cards.filter(c=>c.name==='Exeggcute').length,2);
    assert.equal(f.attacker.bench[3].cards.length,0);
    assert.equal(f.attacker.bench[4].cards.length,0);
    assert.equal(f.donors[0].damage,0);
  } finally {restore();}
});

const {UseAbilityAction} = engine('game/store/actions/game-actions');

/**
 * Drive the actual Store through legal same-donor Damage Pumps and repeated
 * discarded Exeggcute Propagation. Requires the rule-fidelity hook installed.
 * @param {object} f Prepared stage
 * @returns {number[]} Opponent Prize count after every Pump.
 */
function executeFiveKOs(f) {
  const remaining=[];
  for (const [cycle,eggCount] of [[0,2],[1,2],[2,1]]) {
    for (let eggIndex=0;eggIndex<eggCount;eggIndex++) {
      const egg=f.eggs[eggIndex];
      if (f.attacker.discard.cards.includes(egg)) {
        const discardIndex=f.attacker.discard.cards.indexOf(egg);
        f.store.dispatch(new UseAbilityAction(f.attacker.id,'Propagation',{
          player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.DISCARD,index:discardIndex
        }));
        assert.equal(f.attacker.hand.cards.includes(egg),true,
          'Propagation must return the re-KOed egg to hand');
      }
      play(f,egg,target(3+eggIndex));
      assert.equal(f.attacker.bench[3+eggIndex].damage,20,
        'Risky Ruins must re-damage Exeggcute returning to Bench');
    }
    play(f,f.pumps[cycle],boardTarget);
    const prompt=pending(f);
    assert.equal(prompt?.constructor.name,'MoveDamagePrompt');
    const transfers=Array.from({length:eggCount},(_,eggIndex)=>({
      from:target(cycle),to:target(3+eggIndex)
    }));
    assert.equal(prompt.validate(transfers,f.state),true);
    f.store.dispatch(new ResolvePromptAction(prompt.id,transfers));
    claimPrizes(f,eggCount);
    remaining.push(f.defender.getPrizeLeft());
    assert.equal(f.state.phase,GamePhase.PLAYER_TURN,
      'self-KOs cannot end the game while opponent has Prizes');
  }
  return remaining;
}

test('one staged turn performs legal 2+2+1 Exeggcute self-KOs via repeat Propagation',()=>{
  const restore=installDamagePumpSingleSourceHook();
  try {
    const f=setup();
    assert.deepEqual(executeFiveKOs(f),[4,2,1]);
    assert.equal(f.attacker.discard.cards.filter(c=>c.name==='Exeggcute').length,2);
    assert.equal(f.attacker.bench.slice(3,5).some(s=>s.cards.length>0),false);
    assert.deepEqual(f.donors.map(s=>s.damage),[0,0,10]);
  } finally {restore();}
});

test('prepared turn-one five-KO state enables Tool Crisis Punch lethal from Meloetta ex',()=>{
  const restore=installDamagePumpSingleSourceHook();
  try {
    const f=setup();
    f.state.turn=1;
    f.state.rules.attackFirstTurn=false;
    assert.deepEqual(executeFiveKOs(f),[4,2,1]);
    const manager=initializeCards();
    const lightning=manager.getCardByName('Lightning Energy SVE');
    assert.ok(lightning);
    lightning.id=10020;
    // Represents one Lightning Energy from a prior, unmodelled acceleration.
    // This is a staged attack-resolution proof, not a full deck combo replay.
    f.attacker.active.energies.cards.push(lightning);
    const dce=manager.getCardByName('Double Colorless Energy SUM');
    const crisis=manager.getCardByName('Technical Machine: Crisis Punch PAF');
    assert.ok(dce && crisis);
    dce.id=10021;
    crisis.id=10022;
    f.attacker.hand.cards.push(dce,crisis);
    play(f,dce,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
    play(f,crisis,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
    assert.equal(f.attacker.active.energies.cards.includes(dce),true);
    assert.equal(f.attacker.active.tools.includes(crisis),true);
    assert.equal(f.defender.getPrizeLeft(),1);
    const {AttackAction}=engine('game/store/actions/game-actions');
    f.store.dispatch(new AttackAction(f.attacker.id,'Crisis Punch'));
    for(let i=0;i<24 && pending(f);i++) {
      const prompt=pending(f);
      assert.equal(prompt.constructor.name,'WaitPrompt',
        'unexpected followup to legal Crisis Punch attack');
      f.store.dispatch(new ResolvePromptAction(prompt.id,null));
    }
    const {GameWinner}=engine('game/store/state/state');
    assert.equal(pending(f),undefined);
    assert.equal(f.state.phase,GamePhase.FINISHED);
    assert.equal(f.state.winner,GameWinner.PLAYER_1);
    assert.equal(f.defender.active.cards.length,0);
  } finally {restore();}
});

test('prepared turn-one Meloetta uses source Escape Rope, Koko Dance and Float Stone before lethal',()=>{
  const restore=installDamagePumpSingleSourceHook();
  try {
    const f=setup();
    f.state.turn=1;
    f.state.rules.attackFirstTurn=false;
    assert.deepEqual(executeFiveKOs(f),[4,2,1]);
    const manager=initializeCards();
    let id=11100;
    /** @param {string} fullname @returns {object} */
    const card=fullname=>{
      const result=manager.getCardByName(fullname);
      assert.ok(result,'Missing source card '+fullname);
      result.id=id++;
      return result;
    };
    // Two Lightning Energy are staged as previously discarded by source
    // Battle Compressor. Searching/discard sequencing is not modeled here.
    const lightning=[card('Lightning Energy SVE'),card('Lightning Energy SVE')];
    f.attacker.discard.cards.push(...lightning);
    const rope=card('Escape Rope BST');
    const koko=card('Tapu Koko Prism Star TEU');
    const dce=card('Double Colorless Energy SUM');
    const floatStone=card('Float Stone BKT');
    const crisis=card('Technical Machine: Crisis Punch PAF');
    f.attacker.hand.cards.push(rope,koko,dce,floatStone,crisis);

    // Escape Rope promotes our donor, placing Meloetta on the Bench to
    // satisfy Dance of the Ancients' actual Benched-recipient restriction.
    play(f,rope,boardTarget);
    let prompt=pending(f);
    assert.equal(prompt?.constructor.name,'ChoosePokemonPrompt');
    assert.equal(prompt.playerId,f.attacker.id);
    assert.equal(prompt.validate([f.attacker.bench[0]],f.state),true);
    f.store.dispatch(new ResolvePromptAction(prompt.id,[f.attacker.bench[0]]));
    assert.equal(f.attacker.active.getPokemonCard()?.name,'Unown');
    assert.equal(f.attacker.bench[0].getPokemonCard()?.name,'Meloetta ex');

    play(f,koko,target(3));
    assert.equal(f.attacker.bench[3].damage,20);
    f.store.dispatch(new UseAbilityAction(f.attacker.id,'Dance of the Ancients',
      target(3)));
    for(let i=0;i<12 && pending(f)?.constructor.name==='WaitPrompt';i++) {
      f.store.dispatch(new ResolvePromptAction(pending(f).id,null));
    }
    prompt=pending(f);
    assert.equal(prompt?.constructor.name,'AttachEnergyPrompt');
    const transfers=[
      {card:lightning[0],to:target(0)},
      {card:lightning[1],to:target(1)}
    ];
    assert.equal(prompt.validate(transfers),true);
    f.store.dispatch(new ResolvePromptAction(prompt.id,transfers));
    assert.equal(f.attacker.bench[0].energies.cards.includes(lightning[0]),true);
    assert.equal(f.attacker.bench[1].energies.cards.includes(lightning[1]),true);
    assert.equal(f.attacker.lostzone.cards.includes(koko),true);

    // Normal manual attachment and Float Stone free retreat to Meloetta.
    play(f,dce,target(0));
    assert.equal(f.attacker.bench[0].energies.cards.includes(dce),true);
    play(f,floatStone,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
    assert.equal(f.attacker.active.tools.includes(floatStone),true);
    const {RetreatAction,AttackAction}=engine('game/store/actions/game-actions');
    f.store.dispatch(new RetreatAction(f.attacker.id,0));
    assert.equal(f.attacker.active.getPokemonCard()?.name,'Meloetta ex');

    play(f,crisis,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
    assert.equal(f.attacker.active.tools.includes(crisis),true);
    f.store.dispatch(new AttackAction(f.attacker.id,'Crisis Punch'));
    for(let i=0;i<24 && pending(f);i++) {
      const followup=pending(f);
      assert.equal(followup.constructor.name,'WaitPrompt');
      f.store.dispatch(new ResolvePromptAction(followup.id,null));
    }
    const {GameWinner}=engine('game/store/state/state');
    assert.equal(pending(f),undefined);
    assert.equal(f.state.phase,GamePhase.FINISHED);
    assert.equal(f.state.winner,GameWinner.PLAYER_1);
    assert.equal(f.defender.active.cards.length,0);
  } finally {restore();}
});
