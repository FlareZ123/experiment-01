'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {choosePostJetVsFabaRoot} =
  require('../../simulation/twinleaf/2026-11/agent33-jet-vs-faba-postroot.cjs');

/** @returns {object} Independent, detached owner-visible root. */
function observed() {
  return {
    decisionKind: 'owner-root',
    ownHand: ['VS Seeker PHF', 'Lillie\'s Determination MEG'],
    ownTurnResources: {
      itemPlayLocked: false,
      supporterPlayedTurn: 0,
      supporterPlayLocked: false
    },
    ownPublic: {
      active: {printing:'Wobbuffet PHF', energies:['Jet Energy PAL']},
      bench: [null,null],
      discard: ['Faba LOT'],
      publicTurnRestrictions: {
        itemPlayLocked:false, supporterPlayLocked:false
      }
    },
    opponentPublic: {
      active: {printing:'Mimikyu PAL'},
      bench: [{
        printing:'Vileplume AOR',
        abilityDetails:[{name:'Irritating Pollen'}],
        tools:[]
      }]
    }
  };
}

test('selects exact physical owner VS and Faba without concealed information',()=>{
  const view=observed();
  assert.deepEqual(choosePostJetVsFabaRoot(view),{
    kind:'play-seeker-get-faba',
    printing:'VS Seeker PHF',
    handIndex:0,
    target:'Faba LOT',
    reason:'jet-wobbuffet-opens-authenticated-own-discard-faba-recovery'
  });
  assert.equal(view.ownPublic.discard[0],'Faba LOT');
});

for(const [description,mutate] of [
  ['no source-owned Faba in discard',v=>{v.ownPublic.discard=[];}],
  ['Faba already held',v=>{v.ownHand.push('Faba LOT');}],
  ['VS unavailable',v=>{v.ownHand=['Lillie\'s Determination MEG'];}],
  ['no genuine Jet attachment',v=>{v.ownPublic.active.energies=[];}],
  ['wrong Active',v=>{v.ownPublic.active.printing='Mimikyu PAL';}],
  ['used Supporter quota',v=>{v.ownTurnResources.supporterPlayedTurn=2;}],
  ['Supporter lock',v=>{v.ownTurnResources.supporterPlayLocked=true;}],
  ['Item lock',v=>{v.ownTurnResources.itemPlayLocked=true;}],
  ['protected Vileplume',v=>{v.opponentPublic.bench[0].tools=['Stealthy Hood UNB'];}],
  ['second protected Vileplume',v=>{v.opponentPublic.bench.push({
    printing:'Vileplume AOR',
    abilityDetails:[{name:'Irritating Pollen'}],
    tools:['Stealthy Hood UNB']
  });}],
  ['no visible Item-lock target',v=>{v.opponentPublic.bench=[];}],
  ['active Alolan Muk suppression',v=>{v.opponentPublic.bench.push({
    printing:'Alolan Muk SUM',
    abilityDetails:[{name:'Power of Alchemy'}]
  });}]
]){
  test('declines '+description,()=>{
    const view=observed();
    mutate(view);
    assert.equal(choosePostJetVsFabaRoot(view),null);
  });
}
