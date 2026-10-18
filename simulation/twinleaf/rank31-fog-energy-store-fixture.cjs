'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {withRank31FogEnergyPrompt} = require('./rank31-fog-energy-prompt-policy.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Staged original-printed Fog/Chimecho Store exchange. This is a prepared
 * board with a complete owner deck-search prompt, not a source-dealt game.
 * Rebuild the board independently for both generic and opt-in responses.
 *
 * @param {boolean} attackFirst
 * @returns {object}
 */
function probe(attackFirst) {
  const manager = initializeCards();
  let nextId = 1;
  /** @param {string} print */
  function card(print) {
    const c = manager.getCardByName(print);
    assert.ok(c, 'Pinned printing missing: ' + print);
    c.id = nextId++;
    return c;
  }
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format} = load('game/store/card/card-types');
  const {GameMessage} = load('game/game-message');
  const {PlayCardAction, PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const {AttackAction, PassTurnAction} =
    load('game/store/actions/game-actions');
  const {ChooseCardsPrompt} =
    load('game/store/prompts/choose-cards-prompt');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPromptResolver} =
    load('simple-bot/prompt-resolver/choose-cards-prompt-resolver');
  const definitions = load('simple-bot/simple-bot-definitions');

  const own = new Player(), opp = new Player();
  own.id = 101; own.name = 'Source rank31';
  opp.id = 202; opp.name = 'Opposing reference';
  const store = new Store({onStateChange() {}});
  store.state.players = [own, opp];
  store.state.activePlayer = 0;
  store.state.phase = GamePhase.PLAYER_TURN;
  store.state.turn = 2;
  store.state.gameSettings.format = Format.EXPANDED;

  own.active.cards.push(card('Chimecho CIN'));
  opp.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  own.hand.cards.push(card('Fog Crystal CRE'));
  own.deck.cards.push(card('Koffing CEC'));
  own.deck.cards.push(card('Psychic Energy SVE'));
  own.deck.cards.push(card('Unown AOR'));
  own.deck.cards.push(card('Psychic Energy SVE'));
  opp.hand.cards.push(card('Tapu Lele-GX GRI'));
  for (const p of store.state.players) {
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
    for (let i = 0; i < 6; i++) p.deck.cards.push(card('Psychic Energy SVE'));
  }

  store.dispatch(new PlayCardAction(own.id, 0,
    {player: PlayerType.ANY, slot:SlotType.BOARD, index:0}));
  let live = () => store.state.players.find(p => p.id === own.id);
  const prompt = store.state.prompts.find(p =>
    p instanceof ChooseCardsPrompt && p.result === undefined);
  assert.ok(prompt, 'Actual Fog Crystal ChooseCardsPrompt absent');
  assert.equal(prompt.playerId, own.id);
  assert.equal(prompt.cards, live().deck);
  assert.ok(live().supporter.cards.some(c => c.fullName === 'Fog Crystal CRE'));

  const baseOptions = {
    scores:definitions.defaultStateScores,
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    arbiter:definitions.defaultArbiterOptions
  };
  const configured = attackFirst ?
    withRank31FogEnergyPrompt(baseOptions) : baseOptions;
  const resolver = attackFirst ?
    new configured.promptResolvers[0](configured) :
    new ChooseCardsPromptResolver(configured);
  const decision = resolver.resolvePrompt(store.state, live(), prompt);
  assert.ok(decision instanceof ResolvePromptAction);
  assert.equal(decision.result.length, 1);
  const selected = decision.result[0]?.fullName;
  assert.equal(selected, attackFirst ? 'Psychic Energy SVE' : 'Koffing CEC',
    'Generic hand score should favor Benching a Basic; opt-in instead selects Energy');
  store.dispatch(decision);

  let attached = false, bell = false, legalReplyBlocked = false;
  if (attackFirst) {
    assert.equal(live().hand.cards.some(c => c.fullName === 'Psychic Energy SVE'), true);
    const energyIndex = live().hand.cards.findIndex(c => c.fullName === 'Psychic Energy SVE');
    store.dispatch(new PlayCardAction(own.id, energyIndex,
      {player:PlayerType.BOTTOM_PLAYER, slot:SlotType.ACTIVE, index:0}));
    attached = live().active.energies.cards.some(c=>c.fullName==='Psychic Energy SVE');
    assert.equal(attached, true);
    store.dispatch(new AttackAction(own.id, 'Bell of Silence'));
    for (let attempt=0; attempt<30; attempt++) {
      const pending=store.state.prompts.find(p=>p.result===undefined);
      if (!pending) break;
      assert.equal(pending.constructor.name, 'WaitPrompt');
      store.dispatch(new ResolvePromptAction(pending.id, null));
    }
    assert.equal(store.state.activePlayer,1);
    assert.equal(live().cannotPlayPokemonWithAbilities,false);
    const defender=store.state.players.find(p=>p.id===opp.id);
    assert.equal(defender.cannotPlayPokemonWithAbilities,true);
    assert.equal(defender.active.damage,10);
    bell = true;
    const victim = defender.hand.cards.findIndex(c=>c.fullName==='Tapu Lele-GX GRI');
    assert.ok(victim>=0);
    assert.throws(()=>store.dispatch(new PlayCardAction(opp.id,victim,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    })));
    legalReplyBlocked=true;
    store.dispatch(new PassTurnAction(opp.id));
    assert.equal(store.state.players[1].cannotPlayPokemonWithAbilities,false);
  }
  return {
    attackFirst,selected,
    fogPromptMessage:prompt.message ?? GameMessage.CHOOSE_CARD_TO_HAND,
    attached,bell,legalReplyBlocked,phaseAfter:store.state.phase,
    staged:true,qualifiedForCompetitiveInference:false
  };
}

function main() {
  const generic=probe(false),alternative=probe(true);
  assert.notEqual(generic.selected,alternative.selected);
  assert.equal(alternative.bell,true);
  return {
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    evidenceClass:'real pinned Store staged prompt, attack and opponent legal-response mechanics',
    generic,alternative,competitiveGame:false
  };
}

if (require.main===module) process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports = {probe, main};
