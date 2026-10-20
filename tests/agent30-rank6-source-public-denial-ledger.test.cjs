'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {publicBoardEnergy,publiclyPlayedSourceCard,
  withRank6SourcePublicDenialLedger}=
  require('../simulation/twinleaf/agent30-rank6-source-public-denial-ledger.cjs');

class AddPlayerAction {}
class PlayCardAction {
  /** @param {number} id @param {number} handIndex */
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class ResolvePromptAction {
  /** @param {number} id */
  constructor(id){this.id=id;}
}
class PassTurnAction {}
class FakeStore {
  /** @param {object} state */
  constructor(state){this.state=state;}
  /** @param {object} action @returns {object} */
  dispatch(action){
    const source=this.state.players[1];
    const candidate=this.state.players[0];
    if(action instanceof PlayCardAction) {
      source.discard.cards.push(source.hand.cards.splice(action.handIndex,1)[0]);
    } else if(action instanceof ResolvePromptAction) {
      candidate.discard.cards.push(...candidate.active.energies.cards.splice(0,2));
      this.state.prompts=[];
    }
    return this.state;
  }
}
/** @param {string|null} name @param {string[]} energy */
const boardSlot=(name,energy=[])=>({
  getPokemonCard:()=>name?{fullName:name}:null,
  energies:{cards:energy.map(fullName=>({fullName}))}
});
function fixture(){
  const candidate={
    id:101,active:boardSlot('Gengar & Mimikyu-GX TEU',
      ['Psychic Energy MEE','Telepathic Psychic Energy MEE']),
    bench:[boardSlot(null)],discard:{cards:[]}
  };
  const source={id:202,hand:{cards:[
    {fullName:'Plumeria BUS'},{fullName:'SECRET_UNPLAYED_CARD'}
  ]},discard:{cards:[]}};
  const state={activePlayer:1,turn:34,players:[candidate,source],
    prompts:[{id:8,playerId:202,
      constructor:{name:'ChooseCardsPrompt'},message:'PUBLIC_DISCARD'}]};
  return {candidate,source,state,store:new FakeStore(state)};
}

test('reads only public board Energy and the single card actually played',()=>{
  const f=fixture();
  assert.deepEqual(publicBoardEnergy(f.candidate)[0].energy,
    ['Psychic Energy MEE','Telepathic Psychic Energy MEE']);
  assert.equal(publiclyPlayedSourceCard(f.state,
    new PlayCardAction(202,0),1),'Plumeria BUS');
  assert.equal(publiclyPlayedSourceCard(f.state,
    new PlayCardAction(101,0),1),null);
  assert.equal(publiclyPlayedSourceCard(f.state,new PassTurnAction(),1),null);
});

test('native root contextualizes the public source card at Energy removal',()=>{
  const f=fixture();
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const output=withRank6SourcePublicDenialLedger(FakeStore,1,()=>{
    f.store.dispatch(new AddPlayerAction());
    // A separate Store with private-looking cards is not the genuine root.
    const fake=fixture();
    fake.store.dispatch(new AddPlayerAction());
    fake.store.dispatch(new PlayCardAction(202,0));
    f.store.dispatch(new PlayCardAction(202,0));
    f.store.dispatch(new ResolvePromptAction(8));
    return 'finished';
  });
  assert.equal(output.result,'finished');
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),
    original);
  const audit=output.audit;
  assert.equal(audit.rootDispatchCount,3);
  assert.equal(audit.publiclyPlayedSourceCards.length,1);
  assert.equal(audit.publiclyPlayedSourceCards[0].printedCard,'Plumeria BUS');
  assert.equal(audit.sourceAttachedEnergyLossEvents.length,1);
  const loss=audit.sourceAttachedEnergyLossEvents[0];
  assert.equal(loss.turn,34);
  assert.equal(loss.attachedCardDelta,-2);
  assert.equal(loss.lastPublicPlay.printedCard,'Plumeria BUS');
  assert.equal(loss.promptType,'ChooseCardsPrompt');
  assert.equal(loss.before[0].energy.length,2);
  assert.equal(loss.after[0].energy.length,0);
  assert.equal(audit.attachedEnergyLossTotal,2);
  assert.equal(audit.hiddenSourceHandContentsRecorded,false);
  assert.equal(JSON.stringify(audit).includes('SECRET_UNPLAYED_CARD'),false);
  assert.equal(audit.cardEffectAttributionCertified,false);
});

test('restores original Store method even if replay crashes',()=>{
  const f=fixture();
  const desc=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  assert.throws(()=>withRank6SourcePublicDenialLedger(FakeStore,1,()=>{
    f.store.dispatch(new AddPlayerAction());
    throw Error('replay-failed');
  }),/replay-failed/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),
    desc);
});
