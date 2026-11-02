'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {actorObservation} =
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog} =
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {
  chooseStrandedFusionMewRetreat, DCE, MEW_VMAX, GENESECT_V
} = require('../simulation/twinleaf/agent21-owner-stranded-fusion-mew-retreat.cjs');

const OUTPUT = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const native = file => require(path.join(OUTPUT, file));

/**
 * Stage native printed rank5 DCE owner board in a real expanded Store, then
 * use only Store actions for both actual DCE attachments and the paid Retreat.
 * Distinct from natural opponent game samples; neither an opening rate nor
 * a competitively qualified match.
 * @param {0|1} seat
 * @param {string} strandedPrinting
 * @returns {object}
 */
function stage(seat, strandedPrinting) {
  const manager = initializeCards();
  const {Store} = native('game/store/store');
  const {Player} = native('game/store/state/player');
  const {CardList} = native('game/store/state/card-list');
  const {PokemonCardList} = native('game/store/state/pokemon-card-list');
  const {GamePhase} = native('game/store/state/state');
  const {GameSettings} = native('game/core/game-settings');
  const {PokemonCard} = native('game/store/card/pokemon-card');
  const {EnergyCard} = native('game/store/card/energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition,Format} =
    native('game/store/card/card-types');
  const {PowerType} = native('game/store/card/pokemon-types');
  const catalog = buildActorCardCatalog(manager.getAllCards(), {
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,SpecialCondition
  });
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const settings = new GameSettings();
  settings.format = Format.EXPANDED;
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 47;
  state.activePlayer = seat;
  const owner = new Player(), opponent = new Player();
  owner.id = 101; opponent.id = 202;
  owner.name = 'actual-rank5-source';
  opponent.name = 'staged-source-opponent';
  state.players = seat === 0 ? [owner,opponent] : [opponent,owner];
  let physicalId = 91000 + seat*100;
  const card = name => {
    const instance = manager.getCardByName(name);
    assert.ok(instance, 'Exact pinned native card missing: '+name);
    instance.id = physicalId++;
    return instance;
  };
  owner.active.cards.push(card(strandedPrinting));
  const mew = new PokemonCardList();
  mew.cards.push(card('Mew V FST'), card(MEW_VMAX));
  const donor = new PokemonCardList();
  donor.cards.push(card(GENESECT_V));
  owner.bench = [mew,donor];
  opponent.active.cards.push(card('Tapu Lele-GX GRI'));
  for(const p of state.players) {
    for(let i=0;i<14;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const {PlayCardAction,PlayerType,SlotType} =
    native('game/store/actions/play-card-action');
  state.turn = 45;
  owner.hand.cards.push(card(DCE));
  store.dispatch(new PlayCardAction(owner.id, 0, {
    player: PlayerType.BOTTOM_PLAYER,slot: SlotType.BENCH,index:0
  }));
  assert.equal(mew.energies.cards.length,1);
  state.turn = 47;
  owner.hand.cards.push(card(DCE));
  store.dispatch(new PlayCardAction(owner.id, 0, {
    player: PlayerType.BOTTOM_PLAYER,slot: SlotType.ACTIVE,index:0
  }));
  assert.equal(owner.active.energies.cards.length,1);
  return {store,state,owner,opponent,catalog,seat};
}

/** @param {object} staged */
function resolveOwnerRetreatPayment(staged) {
  const {store,state,owner} = staged;
  const {ResolvePromptAction} =
    native('game/store/actions/resolve-prompt-action');
  const seen = [];
  for(let i=0;i<28;i++) {
    const pending = state.prompts.find(p => p.result === undefined);
    if(!pending)return seen;
    assert.equal(pending.playerId,owner.id,
      'Retreat payment prompt must be owned by physical retreating player');
    if(pending.constructor.name === 'WaitPrompt') {
      seen.push('WaitPrompt');
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }else if(pending.constructor.name === 'ChooseCardsPrompt') {
      assert.equal(pending.cards,owner.active.energies,
        'Retreat cost source must be actual prior Active attached Energy');
      const dce = pending.cards.cards.find(c => c.fullName === DCE);
      assert.ok(dce, 'Native payment must present printed DCE');
      assert.equal(pending.validate([dce]),true);
      seen.push('ChooseCardsPrompt');
      store.dispatch(new ResolvePromptAction(pending.id,[dce]));
    }else {
      assert.fail('Unsupported genuine native paid retreat prompt '+
        pending.constructor.name);
    }
  }
  assert.fail('Unsettled native payment after 28 prompts');
}

/** @param {0|1} seat @param {string} strandedPrinting @param {number} units */
function trial(seat,strandedPrinting,units) {
  const s = stage(seat,strandedPrinting);
  const {store,state,owner,catalog} = s;
  const view = actorObservation(state,seat);
  const intent = chooseStrandedFusionMewRetreat(view,catalog);
  assert.ok(intent, 'No owner-visible paid-retreat intent: '+JSON.stringify({active:view.ownPublic.active,resources:view.ownTurnResources,bench:view.ownPublic.bench,stadiums:[view.ownPublic.stadium,view.opponentPublic.stadium]}));
  assert.equal(intent.kind,'paid-retreat');
  assert.equal(intent.activePrinting,strandedPrinting);
  assert.equal(intent.retreatCostUnits,units);
  assert.equal(intent.benchIndex,0);
  const {RetreatAction} = native('game/store/actions/game-actions');
  store.dispatch(new RetreatAction(owner.id,intent.benchIndex));
  const prompts = resolveOwnerRetreatPayment(s);
  // A one-card deterministic Energy payment may settle without a prompt.
  // Require the original Store physical discard and promotion below either way.
  assert.ok(Array.isArray(prompts));
  assert.equal(owner.active.getPokemonCard().fullName,MEW_VMAX);
  assert.equal(owner.active.energies.cards.length,1,
    'Mew must retain its independent DCE after source Retreat');
  assert.equal(owner.bench[0].getPokemonCard().fullName,strandedPrinting);
  assert.equal(owner.bench[0].energies.cards.length,0,
    'Previously Active DCE must enter the discard as retreat payment');
  assert.equal(owner.retreatedTurn,47);
  assert.equal(owner.discard.cards.filter(c=>c.fullName===DCE).length,1);
  assert.equal(owner.bench[1].getPokemonCard().fullName,GENESECT_V);
  const after=actorObservation(state,seat);
  assert.equal(after.ownPublic.active.printing,MEW_VMAX);
  assert.ok(after.ownPublic.active.energies.includes(DCE));
  assert.ok(after.ownPublic.bench.some(p=>p?.printing===GENESECT_V));
  return {strandedPrinting,seat,prompts,
    after:after.ownPublic.active.printing,competitiveQualified:false};
}

for(const seat of [0,1]) {
  for(const [printing,units] of [
    ['Dedenne-GX UNB',1],
    ["Lillie's Clefairy ex JTG",1],
    ['Genesect V FST',2]
  ]) {
    test('genuine pinned Store DCE retreat from '+printing+
      ' to Mew VMAX, seat '+seat,() => {
      const result=trial(seat,printing,units);
      assert.equal(result.competitiveQualified,false);
    });
  }
}

module.exports={stage,resolveOwnerRetreatPayment,trial};
