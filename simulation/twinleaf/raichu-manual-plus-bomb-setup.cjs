'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu, providedEnergy} = require('./temple-raichu-board.cjs');

const compiled = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(compiled, name));

/**
 * Execute normal once-per-turn Energy attachment and one actual pinned
 * Electrode-GX Extra Energy Bomb on an already established artificial board.
 * Stage 1 evolutions and discard access are prerequisites, not legal action
 * sequences proven here. Prompt decisions are scripted, not AI-chosen.
 *
 * @returns {object}
 */
function verifyManualAndBombSetup() {
  const f = stagedRaichu([], null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {CardType} = load('game/store/card/card-types');
  const {PlayCardAction, PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const {UseAbilityAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');

  const electrode = new PokemonCardList();
  const electrodeCard = f.card('Electrode-GX CES');
  electrodeCard.id = 3101;
  electrode.cards.push(electrodeCard);
  f.a.bench.push(electrode);

  const fromHand = f.card('Reversal Energy PAL');
  fromHand.id = 4101;
  f.a.hand.cards.push(fromHand);

  const fromDiscard = [
    'Reversal Energy PAL', 'Reversal Energy PAL', 'Reversal Energy PAL',
    'Counter Energy CIN', 'Counter Energy CIN'
  ].map((name, index) => {
    const card = f.card(name);
    card.id = 4201 + index;
    return card;
  });
  f.a.discard.cards.push(...fromDiscard);
  f.a.active.getPokemonCard().id = 1101;
  f.b.active.getPokemonCard().id = 2101;

  for (const player of [f.a, f.b]) {
    player.prizes = Array.from({length: 6}, () => {
      const slot = new CardList();
      slot.cards.push(f.card('Psychic Energy SVE'));
      return slot;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }

  const active = {player:PlayerType.BOTTOM_PLAYER, slot:SlotType.ACTIVE, index:0};
  const before = {
    activeEnergyCards: f.a.active.energies.cards.length,
    discardedEnergyCards:fromDiscard.filter(c=>f.a.discard.cards.includes(c)).length,
    opponentPrizes: f.b.getPrizeLeft()
  };
  f.store.dispatch(new PlayCardAction(101, 0, active));
  assert.ok(f.a.active.energies.cards.includes(fromHand), 'Hand Energy was not attached');
  assert.ok(!f.a.hand.cards.includes(fromHand), 'Hand Energy was not consumed');

  f.store.dispatch(new UseAbilityAction(101, 'Extra Energy Bomb', {
    player:PlayerType.BOTTOM_PLAYER, slot:SlotType.BENCH, index:0
  }));

  const prompts = [];
  for (let i=0;i<25;i++) {
    const prompt = f.state.prompts.find(p=>p.result===undefined);
    if (!prompt) break;
    const type = prompt.constructor.name;
    let selection;
    if (type === 'WaitPrompt') selection = null;
    else if (type === 'AttachEnergyPrompt') {
      selection = fromDiscard.map(card=>({card,to:active}));
    } else if (type === 'ChoosePrizePrompt') {
      selection = f.b.prizes.filter(prize=>prize.cards.length)
        .slice(0,prompt.options.count);
    } else if (type === 'ShuffleDeckPrompt') {
      selection = Array.from({length:f.a.deck.cards.length},(_,index)=>index);
    } else throw new Error('Unknown Extra Energy Bomb prompt: '+type);
    assert.ok(prompt.validate(selection, f.state),'Invalid '+type+' prompt');
    prompts.push(type);
    f.store.dispatch(new ResolvePromptAction(prompt.id,selection));
  }
  assert.ok(!f.state.prompts.some(p=>p.result===undefined),
    'Unresolved Extra Energy Bomb action prompts');
  const energyMap=providedEnergy(f);
  const rainbowUnits=energyMap.reduce((sum,row)=>sum+
    row.provides.filter(type=>type===CardType.LIGHTNING||type===CardType.ANY).length,0);
  const response = {
    before, prompts, energyPlayedTurn:f.a.energyPlayedTurn,
    gameTurn:f.state.turn, ownPrizes:f.a.getPrizeLeft(),
    opponentPrizes:f.b.getPrizeLeft(),
    attachedEnergyCards:f.a.active.energies.cards.length,
    handEnergyPresent:f.a.active.energies.cards.includes(fromHand),
    bombEnergiesAttached:fromDiscard.filter(card=>f.a.active.energies.cards.includes(card)).length,
    remainingBombEnergiesInDiscard:fromDiscard.filter(card=>f.a.discard.cards.includes(card)).length,
    electrodeKnockedOut:f.a.discard.cards.includes(electrodeCard),
    rainbowUnits,
    energyMap
  };
  console.log(JSON.stringify(response,null,2));
  assert.equal(response.before.activeEnergyCards,0);
  assert.equal(response.before.discardedEnergyCards,5);
  assert.equal(response.before.opponentPrizes,6);
  assert.equal(response.ownPrizes,6);
  assert.equal(response.opponentPrizes,4);
  assert.equal(response.attachedEnergyCards,6);
  assert.equal(response.handEnergyPresent,true);
  assert.equal(response.bombEnergiesAttached,5);
  assert.equal(response.remainingBombEnergiesInDiscard,0);
  assert.equal(response.electrodeKnockedOut,true);
  assert.equal(response.rainbowUnits,16);
  return response;
}

if (require.main===module) verifyManualAndBombSetup();
module.exports={verifyManualAndBombSetup};
