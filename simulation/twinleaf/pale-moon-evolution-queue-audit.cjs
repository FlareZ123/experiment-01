'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {withPendingEndTurnEvolutionCleanup}=
  require('./pending-end-turn-evolution-cleanup.cjs');

const load=part=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',part));

/**
 * Actually evolve a Regidrago V under an existing queued Pale Moon-GX effect.
 * This is a staged, concrete card-play transition. It is independent of
 * full-game seed, hand-search policy, and opponent quality.
 *
 * @param {boolean} corrected
 * @returns {object}
 */
function probe(corrected) {
  const manager=initializeCards();
  let nextId=1;
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Pinned printing missing: '+name);
    found.id=nextId++;
    return found;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const a=new Player(),b=new Player();
  a.id=101;b.id=202;
  a.name='Affected Regidrago';b.name='Pale Moon user';
  state.players=[a,b];
  state.activePlayer=0;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const activeV=card('Regidrago V SIT');
  const evolution=card('Regidrago VSTAR SIT');
  const gx=card('Trevenant & Dusknoir-GX SMP');
  const attack=gx.attacks.find(x=>x.name==='Pale Moon-GX');
  assert.ok(attack);
  a.active.cards.push(activeV);
  a.active.pokemonPlayedTurn=1;
  a.hand.cards.push(evolution);
  b.active.cards.push(gx);
  for(const player of state.players) {
    player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++) {
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  a.pendingEndOfTurnEffects.push({
    type:'knock_out',target:a.active,attack,sourceCard:gx,
    attackerPlayerId:b.id
  });
  const target=a.active;
  const evolve=()=>store.dispatch(new PlayCardAction(a.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  let evidence={removed:0,events:[]};
  if(corrected) {
    const hooked=withPendingEndTurnEvolutionCleanup({Player},evolve);
    evidence={removed:hooked.removed,events:hooked.events};
  } else {
    evolve();
  }
  const after=a.active.getPokemonCard();
  assert.ok(after);
  assert.equal(after.fullName,'Regidrago VSTAR SIT',
    'Real PlayCardAction must resolve legal Regidrago evolution');
  assert.equal(a.active,target,'Evolution must preserve slot target identity');
  const pending=a.pendingEndOfTurnEffects.filter(e=>e.target===target);
  return {
    corrected,evolvedFrom:activeV.fullName,evolvedTo:after.fullName,
    pendingTargetQueueAfter:pending.map(e=>({type:e.type,attack:e.attack?.name})),
    liveSlotIdentical:true,queueRemoved:evidence.removed,
    hookEvents:evidence.events
  };
}

/** Compare original and corrected authentic reducer action. */
function audit() {
  const baseline=probe(false);
  const corrected=probe(true);
  assert.equal(baseline.pendingTargetQueueAfter.length,1,
    'Pinned baseline unexpectedly fixed the queued effect');
  assert.equal(corrected.pendingTargetQueueAfter.length,0,
    'Evolution must clear the pending attack effect');
  assert.equal(corrected.queueRemoved,1);
  return {
    schema:'pale-moon-evolution-reducer-queue-audit-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    status:'staged actual PlayCardAction evolution; source-match exposure untested',
    paperRule:'A-05 Evolution: effects of attacks are removed when Pokemon evolves',
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    baseline,corrected
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(audit(),null,2)+'\n');
module.exports={probe,audit};
