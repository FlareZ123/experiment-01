'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu} = require('./temple-raichu-board.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/**
 * Staged Extra Energy Bomb prompt and self-KO check.
 * @param {number} count Number of the five discarded cards to attach.
 * @param {boolean} noRecipient Whether all own Pokémon are GX.
 * @param {boolean} useBot Let pinned SimpleTacticsAi resolve the attachment prompt.
 * @param {number} availableCount Number of Energy cards actually in discard.
 */
function runCase(count, noRecipient = false, useBot = false, availableCount = 5, chainAttack = false) {
  const f = stagedRaichu([], null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');
  const {UseAbilityAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const electrode = new PokemonCardList();
  electrode.cards.push(f.card('Electrode-GX CES'));
  f.a.bench.push(electrode);
  if (noRecipient) f.a.active.cards.splice(0, 1, f.card('Electrode-GX CES'));
  let benchTarget = null;
  if (chainAttack) {
    benchTarget = new PokemonCardList();
    benchTarget.cards.push(f.card('Shadow Rider Calyrex VMAX CRE'));
    f.b.bench.push(benchTarget);
    f.a.active.tools.push(f.card('Telescopic Sight VIV'));
  }
  for (const player of [f.a, f.b]) {
    player.prizes = Array.from({length:6}, () => {
      const prize = new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      return prize;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  const candidates = ['Reversal Energy PAL','Counter Energy CIN',
    'Unit Energy LPM UPR','Reversal Energy PAL','Counter Energy CIN'].map(f.card);
  const available = candidates.slice(0, availableCount);
  if (chainAttack) {
    f.a.active.getPokemonCard().id = 1045;
    benchTarget.getPokemonCard().id = 2050;
    available.forEach((energy, i) => { energy.id = 1046 + i; });
  }
  f.a.discard.cards.push(...available);
  const before = f.b.getPrizeLeft();
  f.store.dispatch(new UseAbilityAction(101, 'Extra Energy Bomb', {
    player:PlayerType.BOTTOM_PLAYER, slot:SlotType.BENCH, index:0
  }));
  // Activated in-play Abilities show an animation WaitPrompt before their effect.
  for (let i = 0; i < 3; i++) {
    const next = f.state.prompts.find(p => p.result === undefined);
    if (!next || next.constructor.name !== 'WaitPrompt') break;
    f.store.dispatch(new ResolvePromptAction(next.id, null));
  }
  const prompt = f.state.prompts.find(p => p.result === undefined);
  assert.ok(prompt, 'Expected Extra Energy Bomb attachment prompt');
  assert.equal(prompt.constructor.name, 'AttachEnergyPrompt');
  const to = {player:PlayerType.BOTTOM_PLAYER, slot:SlotType.ACTIVE,index:0};
  let transfers = available.slice(0,count).map(card => ({card,to}));
  if (useBot) {
    const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
    const definitions = load('simple-bot/simple-bot-definitions');
    const {BotFlipMode, BotShuffleMode} = load('game/bots/bot-arbiter');
    const options = {
      tactics:definitions.allSimpleTactics,
      promptResolvers:definitions.allPromptResolvers,
      scores:definitions.defaultStateScores,
      arbiter:{flipMode:BotFlipMode.RANDOM,shuffleMode:BotShuffleMode.RANDOM}
    };
    const bot = new SimpleTacticsAi({id:101}, options, null);
    const decision = bot.decodeNextAction(f.state);
    assert.equal(decision?.constructor.name, 'ResolvePromptAction');
    assert.equal(decision.id, prompt.id);
    transfers = decision.result;
  }
  const promptAccepted = prompt.validate(transfers);
  f.store.dispatch(new ResolvePromptAction(prompt.id,transfers));
  // The pinned zero-transfer branch also starts an unexpected deck shuffle.
  // Finish those prompts so Knock Out and Prize accounting can settle.
  for (let i = 0; i < 12; i++) {
    const next = f.state.prompts.find(p => p.result === undefined);
    if (!next) break;
    let response;
    if (next.constructor.name === 'WaitPrompt') response = null;
    else if (next.constructor.name === 'ShuffleDeckPrompt') {
      response = Array.from({length:f.a.deck.cards.length}, (_, index) => index);
    } else if (next.constructor.name === 'ChoosePrizePrompt') {
      response = f.b.prizes.filter(prize => prize.cards.length).slice(0, next.options.count);
    } else throw new Error('Unexpected post-Ability prompt: '+next.constructor.name);
    f.store.dispatch(new ResolvePromptAction(next.id,response));
  }
  assert.ok(!f.state.prompts.some(p => p.result === undefined),
    'No post-Ability prompts should remain');
  let chainedDamage=null;
  let energyMapAfterBomb=null;
  if (chainAttack) {
    const {providedEnergy}=require('./temple-raichu-board.cjs');
    energyMapAfterBomb=providedEnergy(f);
    assert.equal(f.b.getPrizeLeft(),4);
    const {AttackAction}=load('game/store/actions/game-actions');
    f.store.dispatch(new AttackAction(101,'Electro Rain'));
    for(let i=0;i<40;i++) {
      const prompt=f.state.prompts.find(q=>q.result===undefined);
      if(!prompt)break;
      const kind=prompt.constructor.name;
      const response=kind==='WaitPrompt' ? null :
        kind==='ChooseCardsPrompt' ? available :
        kind==='PutDamagePrompt' ? [{
          target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},
          damage:prompt.damage
        }] : undefined;
      assert.notEqual(response,undefined,'Unexpected attack prompt: '+kind);
      assert.ok(prompt.validate(response,f.state),'Invalid attack prompt: '+kind);
      f.store.dispatch(new ResolvePromptAction(prompt.id,response));
    }
    assert.ok(!f.state.prompts.some(q=>q.result===undefined));
    chainedDamage=benchTarget.damage;
  }
  return {
    count,noRecipient,useBot,availableCount,chainAttack,chainedDamage,energyMapAfterBomb,
    transferred:transfers.length,
    promptAccepted,min:prompt.options.min,max:prompt.options.max,
    remainingEnergy:f.a.discard.cards.filter(card => candidates.includes(card)).length,
    opponentPrizesTaken:before-f.b.getPrizeLeft(),
    electrodeInDiscard:f.a.discard.cards.some(card => card.fullName === 'Electrode-GX CES')
  };
}
function verify() {
  const cases = [runCase(5),runCase(4),runCase(0),runCase(0,true),
    runCase(0,true,true),runCase(1,false,false,2),runCase(0,false,true)];
  console.log(JSON.stringify({engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope:'staged Store actions, illegal inputs deliberately supplied',cases},null,2));
  assert.equal(cases[0].remainingEnergy,0);
  assert.equal(cases[0].opponentPrizesTaken,2);
  assert.equal(cases[1].promptAccepted,true,'Pinned prompt accepts four of five');
  assert.equal(cases[2].promptAccepted,true,'Pinned prompt accepts zero of five');
  assert.equal(cases[4].transferred,0,'Normal bot chooses zero when no recipient exists');
  assert.equal(cases[5].promptAccepted,true,'Pinned prompt accepts one of two available');
  assert.equal(cases[6].transferred,2,
    'Pinned static EnergyScore ties at two Colorless cards and selects two of five');
  return cases;
}
if (require.main===module) verify();
/** Probe first bot action on a no-recipient all-GX field under optional correction. */
function probeNoRecipientAction() {
  const f=stagedRaichu([],null);
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const definitions=load('simple-bot/simple-bot-definitions');
  const {BotFlipMode,BotShuffleMode}=load('game/bots/bot-arbiter');
  f.a.active.cards.splice(0,1,f.card('Electrode-GX CES'));
  const bench=new PokemonCardList();
  bench.cards.push(f.card('Electrode-GX CES'));
  f.a.bench.push(bench);
  f.a.discard.cards.push(f.card('Reversal Energy PAL'));
  for(const player of [f.a,f.b]) {
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      return prize;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  const bot=new SimpleTacticsAi({id:101},{
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:{flipMode:BotFlipMode.RANDOM,shuffleMode:BotShuffleMode.RANDOM}
  },null);
  const action=bot.decodeNextAction(f.state);
  return {action:action?.constructor.name||null,power:action?.power||null};
}

module.exports={runCase,verify,probeNoRecipientAction};
