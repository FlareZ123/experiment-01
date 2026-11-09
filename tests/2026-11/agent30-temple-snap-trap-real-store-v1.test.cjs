'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const {stage} =
  require('../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards} = require('../../simulation/twinleaf/headless.cjs');
const {withNativeRawStateFallbackQuarantine} =
  require('../../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {withSnapTrapOwnerPolicyV2} =
  require('../../simulation/twinleaf/agent36/snap-trap-owner-prompt-policy-v2.cjs');
const {
  getSnapTrapPublicTempleEnergyOptions,
  TEMPLE
} = require('../../simulation/twinleaf/agent30/snap-trap-public-temple-energy-options-v1.cjs');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const native = relative => require(path.join(OUTPUT, relative));
const {SimpleTacticsAi} = native('simple-bot/simple-tactics-ai');
const {AttackAction} = native('game/store/actions/game-actions');
const {ResolvePromptAction} = native('game/store/actions/resolve-prompt-action');
const {CheckProvidedEnergyEffect} = native('game/store/effects/check-effects');
const {CardType} = native('game/store/card/card-types');

function realTempleSnapTrap(seat) {
  let rootStore = null;
  const result = withNativeRawStateFallbackQuarantine(() =>
    withSnapTrapOwnerPolicyV2(() => {
      const f = stage(seat);
      rootStore = f.store;
      const manager = initializeCards();
      let nextId = 1700000;
      const card = fullName => {
        const value = manager.getCardByName(fullName);
        assert.ok(value, 'Pinned printed card unavailable: ' + fullName);
        value.id = nextId++;
        return value;
      };
      const stunfisk = card('Galarian Stunfisk SSH');
      const espurr = card('Espurr SIT 81');
      const doubleTurbo = card('Double Turbo Energy BRS');
      const psychic = card('Psychic Energy SVE');
      const temple = card(TEMPLE);

      f.owner.active.cards.splice(0, f.owner.active.cards.length, stunfisk);
      f.owner.active.energies.cards.splice(0);
      f.opponent.active.cards.splice(0, f.opponent.active.cards.length,
        espurr, doubleTurbo, psychic);
      f.opponent.active.energies.cards.splice(0,
        f.opponent.active.energies.cards.length, doubleTurbo, psychic);
      f.owner.stadium.cards.push(temple);
      f.state.activePlayer = 1 - seat;
      f.state.turn = 12;
      assert.equal(f.state.players[seat], f.owner);
      assert.equal(f.state.players[1 - seat], f.opponent);
      assert.equal(stunfisk.powers[0].name, 'Snap Trap');
      assert.equal(espurr.attacks[0].name, 'Mumble');
      assert.equal(espurr.attacks[1].name, 'Gentle Slap');

      // This native effect is used only as an independent gameplay oracle.
      // The owner decision adapter receives its own public-source options.
      const energyCheck = new CheckProvidedEnergyEffect(f.opponent,
        f.opponent.active);
      f.store.reduceEffect(f.store.state, energyCheck);
      const turboRows = energyCheck.energyMap.filter(entry =>
        entry.card === doubleTurbo).map(entry => [...entry.provides]);
      assert.deepEqual(turboRows, [[CardType.COLORLESS]]);
      assert.equal(f.owner.stadium.cards[0], temple);

      f.store.dispatch(new AttackAction(f.opponent.id, 'Gentle Slap'));
      for (let i = 0; i < 12; i++) {
        const waiting = f.store.state.prompts.find(prompt =>
          prompt.result === undefined &&
          prompt.constructor?.name === 'WaitPrompt'
        );
        if (!waiting) break;
        f.store.dispatch(new ResolvePromptAction(waiting.id, null));
      }
      const live = f.store.state;
      const prompt = live.prompts.find(item =>
        item.result === undefined &&
        item.constructor?.name === 'ChooseCardsPrompt'
      );
      assert.ok(prompt, 'real Gentle Slap hit must trigger Snap Trap');
      assert.equal(prompt.playerId, f.owner.id);
      assert.strictEqual(prompt.cards, f.opponent.active);
      assert.ok(f.owner.active.damage > 0,
        'Temple suppresses Double Turbo damage reduction, allowing Snap Trap');

      const ai = new SimpleTacticsAi(
        {id: f.owner.id},
        {tactics: [], promptResolvers: [], scores: {}, arbiter: {}},
        null
      );
      const choice = ai.decodeNextAction(live);
      assert.ok(choice instanceof ResolvePromptAction);
      assert.equal(choice.result.length, 1);
      assert.strictEqual(choice.result[0], psychic,
        'Temple leaves Double Turbo as one Colorless and Psychic is the optimal removal');
      f.store.dispatch(choice);
      const after = f.store.state;
      assert.ok(!f.opponent.active.cards.includes(psychic));
      assert.ok(f.opponent.discard.cards.includes(psychic));
      assert.ok(f.opponent.active.energies.cards.includes(doubleTurbo));
      assert.equal(after.players[seat].id, f.owner.id);
      return {
        sourceSeat: seat,
        selectedPrinting: choice.result[0].fullName,
        templePublic: f.owner.stadium.cards.some(item => item === temple),
        nativeSpecialProvides: turboRows,
        attackerDamageToSource: f.owner.active.damage,
        selectedInAttackerDiscard: f.opponent.discard.cards.includes(psychic),
        retainedDoubleTurbo: f.opponent.active.energies.cards.includes(doubleTurbo)
      };
    }, {
      getRootStore: () => rootStore,
      getEnergyOptions: getSnapTrapPublicTempleEnergyOptions
    }),
    {SimpleTacticsAi});
  const outcome = result.result;
  const audit = outcome.audit.ownerPolicy;
  assert.equal(result.audit.rawStateFallbackCalls, 0);
  assert.equal(audit.physicalSettlements, 1);
  assert.equal(audit.moveCardsEffectReceiptCount, 1);
  assert.equal(audit.sourceProofPromptsSeen, 1);
  assert.equal(audit.choices[0].sourceSeat, seat);
  assert.equal(audit.choices[0].energyPrinting, 'Psychic Energy SVE');
  assert.equal(audit.choices[0].bestBeforeAttackDamage, 20);
  assert.equal(audit.choices[0].bestRemainingAttackDamage, 0);
  assert.equal(audit.choices[0].specialEnergyBlocked, true);
  assert.equal(audit.choices[0].energyMapModel, 'caller-supplied-public-energy-map');
  return {scenario: outcome.result, decision: audit.choices[0]};
}

for (const sourceSeat of [0, 1]) {
  test('real printed Temple + Espurr + Stunfisk changes Energy choice, source seat ' + sourceSeat, () => {
    const outcome = realTempleSnapTrap(sourceSeat);
    assert.equal(outcome.scenario.sourceSeat, sourceSeat);
    assert.equal(outcome.scenario.selectedInAttackerDiscard, true);
    assert.equal(outcome.scenario.retainedDoubleTurbo, true);
    console.log('AGENT30_REAL_TEMPLE_SNAP_TRAP', JSON.stringify(outcome));
  });
}
