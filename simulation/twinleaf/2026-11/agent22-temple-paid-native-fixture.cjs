'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { stage } = require('../agent5-attack-special-arbitration-native.cjs');
const { actorObservation } = require('../actor-observation-contract.cjs');
const {
  chooseTempleDdeDenial, TEMPLE, DDE
} = require('./agent22-temple-dde-owner-policy.cjs');

const OUTPUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUTPUT,name));
const VERSION = 'agent22-temple-ddedenial-physical-native-v1';

/**
 * Construct an authentic Store containing real printed cards. The two
 * attack-ready board slots are deliberately staged; this is a physical
 * payment/rules test and never an original-60 natural game.
 *
 * @param {0|1} seat Actual original Store physical seat.
 */
function probe(seat) {
  const f = stage(seat);
  const { initializeCards } = require('../headless.cjs');
  const manager = initializeCards();
  const make = name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Registered native printed card missing: '+name);
    card.id = 470000+f.owner.hand.cards.length+
      f.opponent.active.cards.length+
      f.opponent.active.energies.cards.length;
    return card;
  };
  const regi = make('Regidrago VSTAR SIT');
  const energy = make(DDE);
  f.opponent.active.cards.splice(0,1,regi);
  f.opponent.active.cards.push(energy);
  f.opponent.active.energies.cards.push(energy);
  const temple = make(TEMPLE);
  f.owner.hand.cards.push(temple);
  const view = actorObservation(f.state,seat);
  const intent = chooseTempleDdeDenial(view,f.catalog);
  assert.ok(intent, 'Owner-visible intent must be independently selected');
  assert.equal(f.owner.hand.cards[intent.handIndex],temple);
  const { CheckProvidedEnergyEffect } =
    native('game/store/effects/check-effects');
  const { PlayCardAction,PlayerType,SlotType } =
    native('game/store/actions/play-card-action');
  const { ResolvePromptAction } =
    native('game/store/actions/resolve-prompt-action');
  const provided = () => {
    const e = new CheckProvidedEnergyEffect(f.opponent,f.opponent.active);
    f.store.reduceEffect(f.state,e);
    return e.energyMap.filter(row => row.card === energy)
      .map(row => row.provides);
  };
  const before = provided();
  f.store.dispatch(new PlayCardAction(f.owner.id,intent.handIndex,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  for(let i=0;i<20;i++){
    const prompt=f.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    assert.equal(prompt.constructor.name,'WaitPrompt',
      'Temple payment requires no tactical selection prompts');
    f.store.dispatch(new ResolvePromptAction(prompt.id,null));
  }
  assert.equal(f.state.prompts.some(p=>p.result===undefined),false);
  const after = provided();
  const held = f.owner.hand.cards.includes(temple);
  const stadium=[...f.owner.stadium.cards,...f.opponent.stadium.cards]
    .map(card=>card.fullName);
  return {
    schema:VERSION,seat,
    constructedBoard:true,fullOriginal60Dealt:false,
    intent,
    nativePaid:!held&&stadium.includes(TEMPLE),
    stadium,templeInHandAfter:held,
    sourceEnergyBefore:before,
    sourceEnergyAfter:after,
    opponentSource:'Regidrago VSTAR SIT',
    nativeCurrentTurn:f.state.turn,
    paperCompetitiveQualifiedGames:0
  };
}

function run(){
  return {schema:VERSION,records:[probe(0),probe(1)],
    paperCompetitiveQualifiedGames:0};
}
module.exports={VERSION,probe,run};
if(require.main===module)process.stdout.write(JSON.stringify(run())+'\n');
