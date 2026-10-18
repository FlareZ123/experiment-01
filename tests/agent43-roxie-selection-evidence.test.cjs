'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {roxieExposure} =
  require('../simulation/twinleaf/roxie-selection-evidence.cjs');

test('source rank31 Koffing setup choice is not an actual discard', () => {
  const game = {decisionTrace:[
    {actionOrdinal:6, turnBefore:0, playerSlot:1,
      action:'ResolvePromptAction',
      cardSelection:{sourceZone:'hand', sourcePlayerSlot:1,
        message:'CHOOSE_STARTING_POKEMONS',
        selectedCards:['Radiant Alakazam SIT', 'Duskull PRE', 'Koffing CEC']}},
    {actionOrdinal:83, turnBefore:7, playerSlot:1,
      action:'PlayCardAction', card:'Roxie'},
    {actionOrdinal:84, turnBefore:7, playerSlot:1,
      action:'ResolvePromptAction',
      cardSelection:{sourceZone:'hand', sourcePlayerSlot:1,
        message:'CHOOSE_CARD_TO_DISCARD',
        selectedCards:['Koffing CEC']}}
  ]};
  assert.deepEqual(roxieExposure(game, 1), {
    roxiePlays:[{ordinal:83, turn:7}],
    koffingHandDiscards:[{ordinal:84, turn:7,
      promptMessage:'CHOOSE_CARD_TO_DISCARD',
      selectedCards:['Koffing CEC']}]
  });
});

test('wrong seat, wrong zone and non-discard prompt stay excluded', () => {
  const base = {action:'ResolvePromptAction', playerSlot:1,
    cardSelection:{sourceZone:'hand', sourcePlayerSlot:1,
      message:'CHOOSE_CARD_TO_DISCARD', selectedCards:['Koffing CEC']}};
  const events = [
    {...base,playerSlot:0},
    {...base,cardSelection:{...base.cardSelection,sourceZone:'deck'}},
    {...base,cardSelection:{...base.cardSelection,message:'CHOOSE_STARTING_POKEMONS'}},
    {...base,cardSelection:{...base.cardSelection,selectedCards:['Duskull PRE']}}
  ];
  assert.deepEqual(roxieExposure({decisionTrace:events},1),
    {roxiePlays:[],koffingHandDiscards:[]});
});
