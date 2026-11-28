'use strict';

// These are actor-visible native-SHAPE root/prompt decisions, not a Store
// continuation or native game. In particular the play-card action has no
// targetIndex: two subsequent ChoosePokemonPrompts supply the target slots.
const test = require('node:test');
const assert = require('node:assert/strict');
const { POLICY_VERSION, createPolicy } =
  require('../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs');

const stoutland = { printing: 'Stoutland BCR 122', hp: 140, damage: 0, tools: [] };
const bunnelby = { printing: 'Bunnelby PRC 121', hp: 60, damage: 0 };
const duplicate = 'Shadow Rider Calyrex V CRE 74';
function actorView(seat) {
  return {
    actorSeat: seat, globalTurn: 4, ownHand: ['Guzma BUS 115', 'Cassius XY 115'],
    ownPublic: {
      active: bunnelby, bench: [stoutland, bunnelby,
        { printing: 'Vileplume AOR 3', hp: 130, damage: 0,
          abilities: ['Irritating Pollen'] }, null, null],
      publicTurnRestrictions: { itemPlayLocked: true, supporterPlayLocked: false }
    },
    opponentPublic: {
      active: { printing: 'Shadow Rider Calyrex VMAX CRE 75', hp: 320, damage: 0,
        energies: ['Psychic Energy MEE 13'] },
      bench: [
        { printing: duplicate, hp: 210, damage: 0,
          energies: ['Double Colorless Energy NXD 92'], tools: [],
          printed: { retreatCost: ['COLORLESS', 'COLORLESS'] } },
        { printing: duplicate, hp: 210, damage: 0,
          energies: [], tools: [],
          printed: { retreatCost: ['COLORLESS', 'COLORLESS'] } },
        null, null, null
      ],
      publicTurnRestrictions: { itemPlayLocked: true, supporterPlayLocked: false }
    },
    ownTurnResources: { supporterPlayedTurn: 0, supporterPlayLocked: false }
  };
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function policy(seat) {
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION, config: {} });
}
function rootRequest(seat, observation, withAlternative = true) {
  const items = [
    { token: 'pass', kind: 'pass' },
    // Exactly native-shaped: no targetIndex or targetZone before Guzma prompts.
    { token: 'guzma', kind: 'play-card', actorPrinting: 'Guzma BUS 115',
      publicMetadata: { cardType: 'trainer', handIndex: 0 } }
  ];
  if (withAlternative) items.push({
    token: 'cassius', kind: 'play-card', actorPrinting: 'Cassius XY 115',
    publicMetadata: { cardType: 'trainer', handIndex: 1 }
  });
  return { role: 'opponent', seat, observation, prompt: null, actionFrontier: { items } };
}
function promptRequest(seat, observation, ownerSeat, reversed = false) {
  const bench = ownerSeat === 'actor' ?
    observation.ownPublic.bench : observation.opponentPublic.bench;
  const choices = [0, 1].map(index => ({
    token: 'bench-' + index, kind: 'pokemon', printing: bench[index].printing,
    label: bench[index].printing,
    publicMetadata: {
      ownerSeat, targetZone: 'bench', benchIndex: index,
      selectionIndex: index, selectionType: 'pokemon', isOwnerVisible: true
    }
  }));
  if (reversed) choices.reverse();
  return {
    role: 'opponent', seat, observation,
    prompt: {
      promptType: 'ChoosePokemonPrompt',
      source: { sourcePrinting: 'Guzma BUS 115', effectName: 'Guzma' },
      publicMetadata: { minimumCount: 1, maximumCount: 1, selectionType: 'pokemon' },
      choices
    },
    actionFrontier: { items: [] }
  };
}
function pick(index) { return { kind: 'select-choices', tokens: ['bench-' + index] }; }
function pass() { return { kind: 'select-action', token: 'pass' }; }

for (const seat of [0, 1]) {
  test('seat ' + seat + ': untargeted native-shaped Guzma root beats a legal Supporter alternative', () => {
    assert.deepEqual(policy(seat).decide(rootRequest(seat, actorView(seat))),
      { kind: 'select-action', token: 'guzma' });
  });

  test('seat ' + seat + ': first Guzma prompt targets the unpowered retrievable duplicate', () => {
    assert.deepEqual(policy(seat).decide(promptRequest(seat, actorView(seat), 'opponent')),
      pick(1));
  });

  test('seat ' + seat + ': second Guzma prompt selects own live Stoutland Sentinel pivot', () => {
    assert.deepEqual(policy(seat).decide(promptRequest(seat, actorView(seat), 'actor')),
      pick(0));
  });

  test('seat ' + seat + ': prompt ordering does not change which physical Bench is selected', () => {
    const view = actorView(seat);
    assert.deepEqual(policy(seat).decide(promptRequest(seat, view, 'opponent', true)),
      pick(1));
    assert.deepEqual(policy(seat).decide(promptRequest(seat, view, 'actor', true)),
      pick(0));
  });

  test('seat ' + seat + ': lost opponent Item lock removes this bounded Guzma root line', () => {
    const view = actorView(seat);
    view.opponentPublic.publicTurnRestrictions.itemPlayLocked = false;
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
  });

  test('seat ' + seat + ': no live Stoutland on actor Bench removes root line', () => {
    const view = actorView(seat);
    view.ownPublic.bench[0] = clone(bunnelby);
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
  });

  test('seat ' + seat + ': already Supporter-locked opponent removes redundant Sentinel line', () => {
    const view = actorView(seat);
    view.opponentPublic.publicTurnRestrictions.supporterPlayLocked = true;
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
  });

  test('seat ' + seat + ': an unpowered Bench Pokémon with zero printed Retreat Cost is not nominally stranded', () => {
    const view = actorView(seat);
    view.opponentPublic.bench[1].printed.retreatCost = [];
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
  });

  test('seat ' + seat + ': opponent free-retreat Tool prevents nominal trap proposal', () => {
    const view = actorView(seat);
    view.opponentPublic.bench[1].tools = ['Float Stone BKT 101'];
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
  });

  test('seat ' + seat + ': opponent unpowered Active removes removal priority', () => {
    const view = actorView(seat);
    view.opponentPublic.active.energies = [];
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
  });

  test('seat ' + seat + ': consumed Supporter slot prevents root proposal', () => {
    const view = actorView(seat);
    view.ownTurnResources.supporterPlayedTurn = 1;
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
  });

  test('seat ' + seat + ': live opponent Garbotoxin suppresses unhooded Sentinel', () => {
    const view = actorView(seat);
    view.opponentPublic.bench[2] = {
      printing: 'Garbodor BKP 57', hp: 120, damage: 0,
      abilities: ['Garbotoxin'], tools: ['Float Stone BKT 101'],
      abilitySuppressions: [{ abilityName: 'Garbotoxin', suppressed: false }]
    };
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
  });

  test('seat ' + seat + ': Hood restores Sentinel through known Garbotoxin', () => {
    const view = actorView(seat);
    view.opponentPublic.bench[2] = {
      printing: 'Garbodor BKP 57', hp: 120, damage: 0,
      abilities: ['Garbotoxin'], tools: ['Float Stone BKT 101'],
      abilitySuppressions: [{ abilityName: 'Garbotoxin', suppressed: false }]
    };
    view.ownPublic.bench[0] = { ...clone(stoutland),
      tools: ['Stealthy Hood UNB 186'] };
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)),
      { kind: 'select-action', token: 'guzma' });
    assert.deepEqual(policy(seat).decide(promptRequest(seat, view, 'actor')), pick(0));
  });
  test('seat ' + seat + ': visible unsuppressed Hood Shield Latias ex Skyliner vetoes Basic retreat trap', () => {
    const view = actorView(seat);
    view.opponentPublic.bench[2] = {
      printing: 'Latias ex SSP 76', abilities: ['Skyliner'],
      abilitySuppressions: [{ abilityName: 'Skyliner', suppressed: false }]
    };
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
  });

  test('seat ' + seat + ': Skyliner with unknown suppression is conservatively treated as live', () => {
    const view = actorView(seat);
    view.opponentPublic.bench[2] = {
      printing: 'Latias ex SSP 76', abilities: ['Skyliner']
    };
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
  });

  test('seat ' + seat + ': verified suppression of Skyliner restores a nominal Guzma trap', () => {
    const view = actorView(seat);
    view.opponentPublic.bench[2] = {
      printing: 'Latias ex SSP 76', abilities: ['Skyliner'],
      abilitySuppressions: [{ abilityName: 'Skyliner', suppressed: true }]
    };
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)),
      { kind: 'select-action', token: 'guzma' });
  });

  test('seat ' + seat + ': U-Turn Board vetoes a claimed unpowered retreat trap', () => {
    const view = actorView(seat);
    view.opponentPublic.bench[1].tools = ['U-Turn Board UNM 211'];
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
  });

  test('seat ' + seat + ': Skyliner cannot give a non-Basic VMAX free retreat', () => {
    const view = actorView(seat);
    view.opponentPublic.bench[1] = {
      printing: 'Shadow Rider Calyrex VMAX CRE 75', hp: 320, damage: 0,
      energies: [], tools: [],
      printed: { stage: 'STAGE1', retreatCost: ['COLORLESS', 'COLORLESS', 'COLORLESS'] }
    };
    view.opponentPublic.bench[2] = {
      printing: 'Latias ex SSP 76', abilities: ['Skyliner'],
      abilitySuppressions: [{ abilityName: 'Skyliner', suppressed: false }]
    };
    assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)),
      { kind: 'select-action', token: 'guzma' });
  });

  for (const [printing, ability, hp] of [
    ['Wobbuffet PHF 36', 'Bide Barricade', 110],
    ['Galarian Weezing RCL 113', 'Neutralizing Gas', 130]
  ]) {
    test('seat ' + seat + ': target ' + printing +
      ' is not a trap because its promoted Active Ability disables the own locks', () => {
      const view = actorView(seat);
      view.opponentPublic.bench[1] = {
        printing, hp, damage: 0, energies: [], tools: [],
        abilities: [ability], printed: { retreatCost: ['COLORLESS', 'COLORLESS'] }
      };
      assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)), pass());
    });

    test('seat ' + seat + ': target ' + printing +
      ' is skipped when an actual nonblocking zero-Energy target exists', () => {
      const view = actorView(seat);
      view.opponentPublic.bench[1] = {
        printing, hp, damage: 0, energies: [], tools: [],
        abilities: [ability], printed: { retreatCost: ['COLORLESS', 'COLORLESS'] }
      };
      const alternative = {
        printing: duplicate, hp: 210, damage: 0, energies: [], tools: [],
        printed: { stage: 'BASIC', retreatCost: ['COLORLESS', 'COLORLESS'] }
      };
      view.opponentPublic.bench[2] = alternative;
      assert.deepEqual(policy(seat).decide(rootRequest(seat, view, false)),
        { kind: 'select-action', token: 'guzma' });
      const request = promptRequest(seat, view, 'opponent');
      request.prompt.choices.push({
        token: 'bench-2', kind: 'pokemon', printing: alternative.printing,
        label: alternative.printing, publicMetadata: {
          ownerSeat: 'opponent', targetZone: 'bench',
          benchIndex: 2, selectionIndex: 2, selectionType: 'pokemon',
          isOwnerVisible: true
        }
      });
      assert.deepEqual(policy(seat).decide(request), pick(2));
    });
  }

  function supporterContestedView() {
    const view = actorView(seat);
    view.ownHand = ['Guzma BUS 115', 'Guzma & Hala CEC 193',
      'Grass Energy MEE 9', 'Grass Energy MEE 9'];
    view.ownPublic.bench[3] = {
      printing: 'Oddish UNB 5', hp: 50, damage: 0,
      lastPlayedOrEvolvedTurn: 1, printed: { stage: 'BASIC' }
    };
    return view;
  }
  function supporterContestedActions(view) {
    const root = rootRequest(seat, view, false);
    root.actionFrontier.items.push({
      token: 'guzma-hala', kind: 'play-card',
      actorPrinting: 'Guzma & Hala CEC 193',
      publicMetadata: { cardType: 'trainer', handIndex: 1 }
    });
    return root;
  }
  test('seat ' + seat + ': established lock pivot outranks competing Guzma & Hala Supporter search', () => {
    const view = supporterContestedView();
    assert.deepEqual(policy(seat).decide(supporterContestedActions(view)),
      { kind: 'select-action', token: 'guzma' });
  });

  test('seat ' + seat + ': without preexisting Item lock Guzma does not consume the Supporter slot', () => {
    const view = supporterContestedView();
    view.opponentPublic.publicTurnRestrictions.itemPlayLocked = false;
    assert.deepEqual(policy(seat).decide(supporterContestedActions(view)),
      { kind: 'select-action', token: 'guzma-hala' });
  });

  test('seat ' + seat + ': free Quick Search still precedes the lock-pivot Supporter', () => {
    const view = supporterContestedView();
    view.ownPublic.bench[4] = {
      printing: 'Pidgeot ex OBF 164', hp: 280,
      abilities: ['Quick Search'], damage: 0
    };
    const request = supporterContestedActions(view);
    request.actionFrontier.items.push({
      token: 'quick-search', kind: 'use-ability',
      actorPrinting: 'Pidgeot ex OBF 164',
      publicMetadata: { abilityName: 'Quick Search' }
    });
    assert.deepEqual(policy(seat).decide(request),
      { kind: 'select-action', token: 'quick-search' });
  });

}
