'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {prepare} = require('./iron-thorns-turn2-attack.cjs');
const {initializeCards} = require('./headless.cjs');
const root = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(root,name));

/** Reproduce the conditional rank-6 hand path as real pinned Store actions. */
function runLine() {
  const f = prepare(false);
  let id = 1000;
  /** @param {string} name */
  const card = name => {
    const value = initializeCards().getCardByName(name);
    assert.ok(value,'Missing source card '+name);
    value.id = id++;
    return value;
  };
  const {PlayCardAction,PlayerType,SlotType} =
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const {AttackAction} = load('game/store/actions/game-actions');
  const dce = f.a.active.energies.cards[0];
  assert.equal(dce.name,'Double Colorless Energy');
  f.a.active.energies.cards.splice(0,1);
  f.a.active.cards.splice(f.a.active.cards.indexOf(dce),1);
  const wondrous = card('Wondrous Labyrinth Prism Star TEU');
  f.a.deck.cards.push(dce,wondrous);
  const supporter = card('Guzma & Hala CEC');
  const guzma = card('Guzma BUS');
  const beach = card('Tropical Beach BWP 50');
  const thunder = card('Thunder Mountain Prism Star LOT');
  f.a.hand.cards.push(supporter,guzma,beach,thunder,
    card('Cynthia & Caitlin CEC'),card("Trainers' Mail ROS"),card('Palace Belt BWP'));
  const board = {player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  /** @returns {any} */
  const pending = () => f.state.prompts.find(p => p.result === undefined);
  /** @param {any} prompt @param {any} value */
  const answer = (prompt,value) =>
    f.store.dispatch(new ResolvePromptAction(prompt.id,value));
  /** @param {any} c @param {object} target */
  const play = (c,target) => {
    const index = f.a.hand.cards.indexOf(c);
    assert.ok(index >= 0,'Card absent from acting hand: '+c.name);
    f.store.dispatch(new PlayCardAction(f.a.id,index,target));
  };
  play(supporter,board);
  assert.equal(pending()?.constructor.name,'SelectOptionPrompt');
  answer(pending(),1);
  assert.equal(pending()?.constructor.name,'ChooseCardsPrompt');
  assert.match(String(pending().message),/DISCARD/);
  assert.equal(pending().validate([guzma,beach],f.state),true);
  answer(pending(),[guzma,beach]);
  assert.equal(pending()?.constructor.name,'ChooseCardsPrompt');
  assert.equal(pending().validate([dce,wondrous],f.state),true);
  answer(pending(),[dce,wondrous]);
  const followups=[];
  for (let n=0; n<10 && pending(); n++) {
    const p=pending();
    followups.push(p.constructor.name);
    if (p.constructor.name==='WaitPrompt') answer(p,null);
    if (p.constructor.name==='ShowCardsPrompt') answer(p,true);
    else if (p.constructor.name==='ShuffleDeckPrompt') {
      answer(p,f.a.deck.cards.map((_,i)=>i));
    } else throw new Error('Unexpected Supporter resolution: '+p.constructor.name);
  }
  assert.equal(Boolean(pending()),false);
  assert.ok(f.a.hand.cards.includes(dce));
  assert.ok(f.a.hand.cards.includes(wondrous));
  assert.ok(f.a.discard.cards.includes(guzma));
  assert.ok(f.a.discard.cards.includes(beach));
  assert.equal(f.a.supporterTurn > 0,true);
  play(thunder,board);
  assert.ok(f.a.stadium.cards.includes(thunder));
  play(dce,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
  assert.ok(f.a.active.energies.cards.includes(dce));
  assert.equal(f.a.bench.every(slot => slot.cards.length === 0),true,
    'No occupied Bench slots in turn-two attack fixture');
  f.store.dispatch(new AttackAction(f.a.id,'Volt Cyclone'));
  const animation=[];
  for (let i=0; i<12 && pending(); i++) {
    const p=pending();
    assert.equal(p.constructor.name,'WaitPrompt');
    animation.push(p.message || 'wait');
    answer(p,null);
  }
  assert.equal(Boolean(pending()),false);
  assert.equal(f.b.active.damage,140);
  return {source:'Aichi rank6, conditional unprized DCE',
    sourceSupporter:'Guzma & Hala CEC',
    discarded:[guzma.name,beach.name],searched:[dce.name,wondrous.name],
    activeStadium:thunder.name,damage:f.b.active.damage,
    noBenchedPokemon:true,followups,animation,
    caveat:'Injected source-representable hand and unprized DCE; no bot policy or actual seed replay'};
}
if(require.main===module) console.log(JSON.stringify(runLine(),null,2));
module.exports={runLine};
