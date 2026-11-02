'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { installElectrodeGXEnergyHook } = require('../simulation/twinleaf/electrode-gx-energy-hook.cjs');

const compiled = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native = name => require(path.join(compiled, name));
const { Store } = native('game/store/store');
const { Player } = native('game/store/state/player');
const { CardList } = native('game/store/state/card-list');
const { PokemonCardList } = native('game/store/state/pokemon-card-list');
const { GamePhase } = native('game/store/state/state');
const { CardTag, Format } = native('game/store/card/card-types');
const { UseAbilityAction, AttackAction } = native('game/store/actions/game-actions');
const { ResolvePromptAction } = native('game/store/actions/resolve-prompt-action');
const { PlayerType, SlotType } = native('game/store/actions/play-card-action');

let nextCardId = 29000;

/** Original rank-9 printed five-Energy subset, staged in discard after game play.
 * @param {0|1} seat
 * @param {boolean} [shadowRiderDefender] Staged rank1 VMAX target plus live Bench.
 */
function stage(seat, shadowRiderDefender=false) {
  const manager = initializeCards();
  /** @param {string} name */
  const card = name => {
    const selected = manager.getCardByName(name);
    assert.ok(selected, 'Missing pinned compiled card: ' + name);
    selected.id = nextCardId++;
    return selected;
  };
  const owner = new Player();
  const opponent = new Player();
  owner.id = 291;
  opponent.id = 292;
  owner.name = 'rank9-electrode-owner';
  opponent.name = 'rank9-electrode-defender';
  owner.bench = Array.from({ length: 5 }, () => new PokemonCardList());
  opponent.bench = Array.from({ length: 5 }, () => new PokemonCardList());

  // The pinned Mega Absol class advertises its original MEG set/number,
  // though its fullName uses M1L, so use that actual registered name.
  const mega = card('Mega Absol ex M1L');
  assert.equal(mega.set, 'MEG');
  assert.equal(mega.setNumber, '86');
  assert.equal(mega.hasTag(CardTag.POKEMON_ex), true);
  assert.equal(mega.hasTag(CardTag.POKEMON_EX), false);
  assert.equal(mega.hasTag(CardTag.POKEMON_GX), false);

  owner.active.cards.push(mega);
  owner.bench[0].cards.push(card('Voltorb ROS'), card('Electrode-GX CES'));
  owner.bench[1].cards.push(card('Unown AOR'));
  if (shadowRiderDefender) {
    // Rank-1 printed V -> VMAX stage, with a second live source Basic to
    // avoid conflating three Prize settlement with a no-Pokémon win.
    opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'),
      card('Shadow Rider Calyrex VMAX CRE'));
    opponent.bench[0].cards.push(card('Shadow Rider Calyrex V CRE'));
  } else {
    // Rank-10 original Regidrago V survives a 200-damage neutral-Weakness attack.
    opponent.active.cards.push(card('Regidrago V SIT'));
  }
  opponent.hand.cards.push(card('Fog Crystal CRE'));

  const energy = [
    card('Prism Energy ASC'),
    card('Prism Energy ASC'),
    card('Prism Energy ASC'),
    card('Prism Energy ASC'),
    card('Darkness Energy SVE')
  ];
  owner.discard.cards.push(...energy);
  for (const player of [owner, opponent]) {
    for (let i = 0; i < 8; i++) player.deck.cards.push(card('Psychic Energy SVE'));
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }

  const store = new Store({ onStateChange() {} });
  const state = store.state;
  state.players = seat === 0 ? [owner, opponent] : [opponent, owner];
  state.activePlayer = seat;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  return { store, state, owner, opponent, mega, energy };
}

/** @param {ReturnType<typeof stage>} s */
function activateAndPay(s) {
  s.store.dispatch(new UseAbilityAction(s.owner.id, 'Extra Energy Bomb', {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
  }));
  for (let i = 0; i < 5; i++) {
    const wait = s.state.prompts.find(p =>
      p.result === undefined && p.constructor.name === 'WaitPrompt');
    if (!wait) break;
    s.store.dispatch(new ResolvePromptAction(wait.id, null));
  }
  const prompt = s.state.prompts.find(p =>
    p.result === undefined && p.constructor.name === 'AttachEnergyPrompt');
  assert.ok(prompt, 'Native CES48 must expose physical attachment prompt');
  assert.equal(prompt.playerId, s.owner.id);
  const modernEx = { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 };
  assert.equal(prompt.options.blockedTo.some(t =>
    t.player === modernEx.player && t.slot === modernEx.slot &&
    t.index === modernEx.index), false,
  'Modern Pokémon ex must remain a legal recipient under printed CES48');
  const selection = prompt.decode(s.energy.map((energy, index) => ({
    to: modernEx, index
  })), s.state);
  assert.equal(prompt.validate(selection), true);
  s.store.dispatch(new ResolvePromptAction(prompt.id, selection));
  assert.equal(s.owner.active.energies.cards.length, 5);
  assert.deepEqual(new Set(s.owner.active.energies.cards),
    new Set(s.energy), 'All five source-representative physical Energy moved');
  assert.equal(s.energy.some(c => s.owner.discard.cards.includes(c)), false);
  assert.equal(s.owner.bench[0].getPokemonCard(), undefined,
    'Electrode self-KO occurs only after five paid physical attachments');
  // A self-KO is still a full Knock Out: opponent Prize prompts must resolve
  // before the same-turn attack becomes a legal native root.
  for (let i = 0; i < 12; i++) {
    const next = s.state.prompts.find(p => p.result === undefined);
    if (!next) break;
    let response;
    if (next.constructor.name === 'WaitPrompt') response = null;
    else if (next.constructor.name === 'ChoosePrizePrompt') {
      response = s.opponent.prizes.filter(p => p.cards.length).slice(0,next.options.count);
    } else if (next.constructor.name === 'ShuffleDeckPrompt') {
      response = Array.from({length:s.owner.deck.cards.length},(_,i)=>i);
    } else throw new Error('Unexpected post-Electrode prompt '+next.constructor.name);
    s.store.dispatch(new ResolvePromptAction(next.id,response));
  }
  assert.equal(s.state.prompts.some(p=>p.result===undefined),false);
  assert.equal(s.opponent.getPrizeLeft(),4,'Electrode-GX awards two Prize cards');
  return { selectionCount: selection.length, activeEnergyCount: 5, opponentPrizesAfterBomb:4 };
}


/** Settle the rank-9 Mega Absol payoff on the same owner turn.
 * @param {ReturnType<typeof stage>} s
 */
function attackAndDiscard(s) {
  const priorHandLength = s.opponent.hand.cards.length;
  assert.equal(priorHandLength,3,'One seeded hand card plus two self-KO Prizes');
  const priorDamage = s.opponent.active.damage;
  s.store.dispatch(new AttackAction(s.owner.id, 'Claw of Darkness'));
  for (let i = 0; i < 5; i++) {
    const wait = s.state.prompts.find(p =>
      p.result === undefined && p.constructor.name === 'WaitPrompt');
    if (!wait) break;
    s.store.dispatch(new ResolvePromptAction(wait.id, null));
  }
  const prompt = s.state.prompts.find(p =>
    p.result === undefined && p.constructor.name === 'ChooseCardsPrompt');
  assert.ok(prompt, 'Claw of Darkness must offer physical opponent-hand discard');
  assert.equal(prompt.playerId, s.owner.id);
  const fogIndex = s.opponent.hand.cards.findIndex(c => c.fullName === 'Fog Crystal CRE');
  assert.ok(fogIndex>=0);
  const selected = prompt.decode([fogIndex]);
  assert.equal(prompt.validate(selected), true);
  s.store.dispatch(new ResolvePromptAction(prompt.id, selected));
  // Native AttackAction is a generator. After its card-specific hand prompt
  // settles, it still yields a distinct attack-animation WaitPrompt before
  // calculating and applying the printed 200 damage.
  for (let i=0; i<5 && s.opponent.active.damage===priorDamage; i++) {
    const wait = s.state.prompts.find(p =>
      p.result===undefined && p.constructor.name==='WaitPrompt');
    assert.ok(wait,'Expected pending native attack-animation continuation');
    s.store.dispatch(new ResolvePromptAction(wait.id,null));
  }
  assert.equal(s.opponent.active.damage, priorDamage + 200);
  assert.equal(s.opponent.hand.cards.length, priorHandLength-1);
  assert.equal(s.opponent.discard.cards.some(c => c.fullName === 'Fog Crystal CRE'), true);
  return { attacked: 'Claw of Darkness', damage: 200, opponentCardsDiscarded: 1 };
}

for (const seat of [0, 1]) {
  test('Pinned CES48 ability can attach to modern Mega Absol ex in seat ' + seat, () => {
    const s = stage(seat);
    const receipt = { ...activateAndPay(s), ...attackAndDiscard(s) };
    console.log('AGENT29_RANK9_NATIVE_MODERN_EX_ALLOWED', JSON.stringify({
      seat, ...receipt, originalRank: 9, usedFullOriginalEnergySubset: true,
      competitiveQualifiedGames: 0
    }));
  });
}

for (const seat of [0, 1]) {
  test('Paper correction preserves permitted Mega Absol ex payment seat ' + seat, () => {
    const restore = installElectrodeGXEnergyHook();
    try {
      const s = stage(seat);
      const receipt = { ...activateAndPay(s), ...attackAndDiscard(s) };
      console.log('AGENT29_RANK9_GUARDED_MODERN_EX_ALLOWED', JSON.stringify({
        seat, ...receipt, originalRank: 9, paperQualifiedFullGames: 0
      }));
    } finally {
      restore();
    }
  });
}


/** Resolve the three-Prize attack trade against actual rank1 VMAX printing.
 * @param {ReturnType<typeof stage>} s
 */
function attackShadowRiderAndSettle(s) {
  assert.equal(s.opponent.getPrizeLeft(),4);
  assert.equal(s.owner.getPrizeLeft(),6);
  assert.equal(s.opponent.active.getPokemonCard()?.fullName,
    'Shadow Rider Calyrex VMAX CRE');
  s.store.dispatch(new AttackAction(s.owner.id,'Claw of Darkness'));
  for(let i=0;i<6;i++){
    const wait=s.state.prompts.find(p=>
      p.result===undefined&&p.constructor.name==='WaitPrompt');
    if(!wait)break;
    s.store.dispatch(new ResolvePromptAction(wait.id,null));
  }
  const hand=s.state.prompts.find(p=>
    p.result===undefined&&p.constructor.name==='ChooseCardsPrompt');
  assert.ok(hand);
  assert.equal(hand.playerId,s.owner.id);
  const fog=s.opponent.hand.cards.findIndex(c=>c.fullName==='Fog Crystal CRE');
  assert.ok(fog>=0);
  const chosen=hand.decode([fog]);
  assert.equal(hand.validate(chosen),true);
  s.store.dispatch(new ResolvePromptAction(hand.id,chosen));
  for(let i=0;i<24;i++){
    const next=s.state.prompts.find(p=>p.result===undefined);
    if(!next)break;
    if(next.constructor.name==='WaitPrompt'){
      s.store.dispatch(new ResolvePromptAction(next.id,null));
    } else if(next.constructor.name==='ChoosePrizePrompt'){
      assert.equal(next.playerId,s.owner.id);
      const result=s.owner.prizes.filter(p=>p.cards.length)
        .slice(0,next.options.count);
      assert.equal(result.length,next.options.count);
      s.store.dispatch(new ResolvePromptAction(next.id,result));
    } else if(next.constructor.name==='ChoosePokemonPrompt'){
      assert.equal(next.playerId,s.opponent.id);
      const selection=next.decode([{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
      }],s.state);
      assert.equal(next.validate(selection,s.state),true);
      s.store.dispatch(new ResolvePromptAction(next.id,selection));
    } else {
      throw new Error('Unexpected rank1 VMAX KO continuation '+next.constructor.name);
    }
    if(s.owner.getPrizeLeft()===3 &&
      s.opponent.discard.cards.some(c=>
        c.fullName==='Shadow Rider Calyrex VMAX CRE'))break;
  }
  assert.equal(s.owner.getPrizeLeft(),3,
    'Darkness-weak Shadow Rider VMAX must grant three Prize cards');
  assert.equal(s.opponent.getPrizeLeft(),4,
    'The earlier Electrode-GX self-KO cost exactly two Prizes');
  assert.ok(s.opponent.discard.cards.some(c=>
    c.fullName==='Shadow Rider Calyrex VMAX CRE'));
  assert.ok(s.opponent.discard.cards.some(c=>c.fullName==='Fog Crystal CRE'));
  assert.equal(s.owner.active.getPokemonCard()?.set,'MEG');
  return {damageExpectedBeforeKO:400,knockedOut:'Shadow Rider Calyrex VMAX CRE',
    ownerPrizesAfterAttack:3,opponentPrizesAfterBomb:4,
    opponentHandDiscard:1};
}

for(const seat of [0,1]){
  test('Original-rank1 VMAX weakness three-Prize CES48 Mega Absol native seat '+seat,()=>{
    const s=stage(seat,true);
    const payment=activateAndPay(s);
    const attack=attackShadowRiderAndSettle(s);
    console.log('AGENT29_RANK9_VS_RANK1_THREE_PRIZE_STAGED_NATIVE',
      JSON.stringify({seat,...payment,...attack,competitiveQualifiedGames:0}));
  });
}

/** Read the actual stock actor proposal after a fully legal, paid rank9 Bomb.
 * This deliberately makes no claim of natural source setup reachability.
 */
for(const seat of [0,1]){
  test('Read-only pinned stock actor after source-rank9 full modern ex payment seat '+seat,()=>{
    const s=stage(seat);
    activateAndPay(s);
    const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
    const definitions=native('simple-bot/simple-bot-definitions');
    const {BotFlipMode,BotShuffleMode}=native('game/bots/bot-arbiter');
    const bot=new SimpleTacticsAi({id:s.owner.id},{
      tactics:definitions.allSimpleTactics,
      promptResolvers:definitions.allPromptResolvers,
      scores:definitions.defaultStateScores,
      arbiter:{flipMode:BotFlipMode.RANDOM,shuffleMode:BotShuffleMode.RANDOM}
    },null);
    assert.equal(s.state.prompts.some(p=>p.result===undefined),false);
    const action=bot.decodeNextAction(s.state);
    // The precise root is observational, not an assertion that the default
    // scoring policy knows how to assemble the printed line unaided.
    assert.ok(action && typeof action.type==='string');
    console.log('AGENT29_RANK9_GENERIC_BOT_AFTER_BOMB_ROOT',JSON.stringify({
      seat,type:action.type,attackName:action.name??null,
      selectedAttack:action.type==='ATTACK_ACTION'&&
        action.name==='Claw of Darkness',
      fiveEnergyAlreadyPaid:true,opponentPrizesAfterBomb:4,
      competitiveQualifiedGames:0
    }));
  });
}
