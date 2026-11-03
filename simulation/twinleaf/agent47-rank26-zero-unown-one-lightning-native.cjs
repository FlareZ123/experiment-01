'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {fixture} = require('./rank26-pump-source-conserved-fixture.cjs');
const {stagePumps} = require('./rank26-propagation-source-fixture.cjs');
const {exchange} = require('./rank26-redeemable-ticket-source-fixture.cjs');
const {physical, prepareCard} = require('./rank26-unown-full-crisis-native.cjs');
const {installDamagePumpSingleSourceHook} =
  require('./damage-pump-single-source-hook.cjs');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const engine = rel => require(path.join(OUTPUT, rel));
const {PlayCardAction, PlayerType, SlotType} =
  engine('game/store/actions/play-card-action');
const {UseAbilityAction, AttackAction} =
  engine('game/store/actions/game-actions');
const {ResolvePromptAction} =
  engine('game/store/actions/resolve-prompt-action');
const {GamePhase} = engine('game/store/state/state');

const bench = index => ({player: PlayerType.BOTTOM_PLAYER,
  slot: SlotType.BENCH, index});
const board = {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0};
const discard = index => ({player: PlayerType.BOTTOM_PLAYER,
  slot: SlotType.DISCARD, index});

/**
 * Stage a source-conserved original rank26 60 with a Squawkabilly starter,
 * Benched Meloetta/Koko and exactly two 20-damaged Exeggcute. No Unown is
 * in play. This is a deliberately *prepared* physical deal, not a draw,
 * genuine first-turn setup, or sampled probability.
 * @param {0|1} seat
 */
function stage(seat) {
  const f = fixture(seat);
  const own = f.own;
  const squad = own.bench;
  const sourceIds = physical(own).map(c => c.id).sort((a,b) => a-b);
  const opponentIds = physical(f.opponent).map(c => c.id).sort((a,b) => a-b);
  assert.equal(sourceIds.length, 60);
  assert.equal(opponentIds.length, 60);
  assert.equal(new Set(sourceIds).size, 60);
  assert.equal(new Set(opponentIds).size, 60);

  // Swap starter and bench roles using exact original physical IDs.
  const melo = own.active.cards[0];
  const squawk = squad[1].cards[0];
  assert.equal(melo.name, 'Meloetta ex');
  assert.equal(squawk.name, 'Squawkabilly ex');
  own.active.cards[0] = squawk;
  squad[1].cards[0] = melo;
  const unown = squad[0].cards[0];
  squad[0].cards[0] = melo;
  squad[1].cards[0] = unown;
  exchange(own, 'Tapu Koko Prism Star', squad[1], 0);
  // Exchange the original Bunnelby bench slot with the two originals Eggs;
  // retain Bunnelby as an owned deck card, opening one Bench position.
  const bunnelby = squad[2].cards[0];
  assert.equal(bunnelby.name, 'Bunnelby');
  const eggA = squad[3].cards[0], eggB = squad[4].cards[0];
  assert.equal(eggA.name, 'Exeggcute');
  assert.equal(eggB.name, 'Exeggcute');
  squad[2].cards[0] = eggA;
  squad[3].cards[0] = eggB;
  squad[4].cards.pop();
  own.deck.cards.push(bunnelby);
  squad.forEach((slot,i) => { slot.damage = i < 4 ? 20 : 0; });
  stagePumps(f);
  assert.deepEqual(squad.map(s => s.getPokemonCard()?.name), [
    'Meloetta ex', 'Tapu Koko Prism Star', 'Exeggcute',
    'Exeggcute', undefined
  ]);
  assert.equal(own.active.getPokemonCard()?.name, 'Squawkabilly ex');
  assert.equal(own.bench.some(s => s.getPokemonCard()?.name === 'Unown'), false);
  assert.deepEqual(physical(own).map(c => c.id).sort((a,b)=>a-b),
    sourceIds);
  assert.deepEqual(physical(f.opponent).map(c => c.id).sort((a,b)=>a-b),
    opponentIds);
  return {f, sourceIds, opponentIds};
}

/** @param {object} f */
function pending(f) {
  return f.state.prompts.find(p => p.result === undefined);
}

/** Perform one original owned Damage Pump, native mandatory opponent Prize pick. */
function pump(f, donor, targets, expectedOpponentPrizes) {
  const index = f.own.hand.cards.findIndex(c => c.name === 'Damage Pump');
  assert.ok(index >= 0);
  const original = f.own.hand.cards[index];
  const from = bench(donor);
  const transfers = targets.map(index => ({from, to: bench(index)}));
  f.store.dispatch(new PlayCardAction(f.own.id, index, board));
  const prompt = pending(f);
  assert.equal(prompt?.constructor.name, 'MoveDamagePrompt');
  assert.equal(prompt.options.singleSourceTarget, true);
  assert.equal(prompt.validate(transfers, f.state), true);
  f.store.dispatch(new ResolvePromptAction(prompt.id, transfers));
  const prize = pending(f);
  assert.equal(prize?.constructor.name, 'ChoosePrizePrompt');
  assert.equal(prize.playerId, f.opponent.id);
  assert.equal(prize.options.count, targets.length);
  const picks = f.opponent.prizes.filter(p => p.cards.length)
    .slice(0, prize.options.count);
  assert.equal(prize.validate(picks, f.state), true);
  f.store.dispatch(new ResolvePromptAction(prize.id, picks));
  assert.equal(f.opponent.getPrizeLeft(), expectedOpponentPrizes);
  assert.equal(f.own.discard.cards.includes(original), true);
  assert.equal(f.state.phase, GamePhase.PLAYER_TURN);
  return {donor, targets, cardId: original.id,
    opponentPrizesAfter: f.opponent.getPrizeLeft()};
}

/** Use each genuine original Exeggcute Propagation and hand Bench entry. */
function revive(f) {
  const recovered = [];
  for (const index of [2,3]) {
    assert.equal(f.own.bench[index].getPokemonCard(), undefined);
    const discardIndex = f.own.discard.cards
      .findIndex(c => c.name === 'Exeggcute');
    assert.ok(discardIndex >= 0);
    const egg = f.own.discard.cards[discardIndex];
    f.store.dispatch(new UseAbilityAction(
      f.own.id, 'Propagation', discard(discardIndex)));
    const handIndex = f.own.hand.cards.indexOf(egg);
    assert.ok(handIndex >= 0);
    f.store.dispatch(new PlayCardAction(f.own.id, handIndex, bench(index)));
    assert.equal(f.own.bench[index].getPokemonCard(), egg);
    assert.equal(f.own.bench[index].damage, 20,
      'actual Risky Ruins Bench placement should add two counters');
    recovered.push({eggId:egg.id, slot:index,
      damagedByNativeRiskyRuins:f.own.bench[index].damage});
  }
  return recovered;
}

/** Actual held original source card PlayCardAction. */
function play(f,name,to) {
  const index = f.own.hand.cards.findIndex(c => c.name === name);
  assert.ok(index >= 0, 'Source held '+name);
  const card = f.own.hand.cards[index];
  f.store.dispatch(new PlayCardAction(f.own.id, index, to));
  assert.equal(f.own.hand.cards.includes(card), false);
  return {name:card.fullName, id:card.id};
}

/** Native wait acknowledgement, never a substitute for payment choice. */
function waits(f) {
  let count=0;
  for (let i=0;i<16;i++) {
    const next=pending(f);
    if (next?.constructor.name !== 'WaitPrompt') break;
    f.store.dispatch(new ResolvePromptAction(next.id,null));
    count++;
  }
  return count;
}

/** Prove one continuing prepared native Store has 5 own-KOs, 1 Lightning and terminal. */
function runSeat(seat) {
  const {f,sourceIds,opponentIds}=stage(seat);
  const source = f.own, defender=f.opponent;
  const receipts=[];
  const restore=installDamagePumpSingleSourceHook();
  try {
    receipts.push({step:'pump1',...pump(f,0,[2,3],4)});
    assert.equal(source.bench[0].damage,0);
    receipts.push({step:'revive1',eggs:revive(f)});
    receipts.push({step:'pump2',...pump(f,1,[2,3],2)});
    assert.equal(source.bench[1].damage,0);
    receipts.push({step:'revive2',eggs:revive(f)});
    receipts.push({step:'pump3',...pump(f,3,[2],1)});
    assert.equal(source.bench[2].getPokemonCard(),undefined);
    assert.equal(source.bench[3].getPokemonCard()?.name,'Exeggcute');
    assert.equal(source.bench[3].damage,10);
    assert.equal(defender.getPrizeLeft(),1);
    assert.equal(source.bench.some(s=>s.getPokemonCard()?.name==='Unown'),
      false);
    assert.equal(source.getPrizeLeft(),6);
    assert.deepEqual(physical(source).map(c=>c.id).sort((a,b)=>a-b),sourceIds);

    // Physical existing source instances repositioned from owner deck or
    // Prize for this conditional continuation. Resource acquisition is
    // explicitly UNVERIFIED; no hand search effect has been simulated.
    for (const name of ['Canceling Cologne','Double Colorless Energy',
      'Technical Machine: Crisis Punch','Escape Rope']) {
      prepareCard(source, name, source.hand);
    }
    prepareCard(source,'Lightning Energy',source.discard);
    assert.equal(source.discard.cards.filter(c=>c.name==='Lightning Energy').length,1);
    assert.deepEqual(physical(source).map(c=>c.id).sort((a,b)=>a-b),sourceIds);
    receipts.push({step:'cologne', card:play(f,'Canceling Cologne',board)});
    f.store.dispatch(new UseAbilityAction(
      source.id, 'Dance of the Ancients', bench(1)));
    waits(f);
    const energyPrompt = pending(f);
    assert.equal(energyPrompt?.constructor.name,'AttachEnergyPrompt');
    assert.equal(energyPrompt.playerId,source.id);
    const lightning = source.discard.cards.find(c=>c.name==='Lightning Energy');
    const assignment=[{card:lightning,to:bench(0)}];
    assert.equal(energyPrompt.validate(assignment,f.state),true);
    f.store.dispatch(new ResolvePromptAction(energyPrompt.id,assignment));
    assert.equal(source.bench[0].energies.cards.includes(lightning),true);
    assert.equal(source.lostzone.cards.some(c=>c.name==='Tapu Koko Prism Star'),true);
    receipts.push({step:'single-lightning-koko',id:lightning.id});
    const dce=play(f,'Double Colorless Energy',bench(0));
    const tm=play(f,'Technical Machine: Crisis Punch',bench(0));
    receipts.push({step:'attach',dce,tm});
    receipts.push({step:'escape-rope',card:play(f,'Escape Rope',board)});
    const promote=pending(f);
    assert.equal(promote?.constructor.name,'ChoosePokemonPrompt');
    assert.equal(promote.playerId,source.id);
    assert.equal(promote.validate([source.bench[0]],f.state),true);
    f.store.dispatch(new ResolvePromptAction(promote.id,[source.bench[0]]));
    assert.equal(source.active.getPokemonCard()?.name,'Meloetta ex');
    assert.equal(source.active.energies.cards
      .filter(c=>['Lightning Energy','Double Colorless Energy'].includes(c.name)).length,2);
    assert.equal(f.state.turn,1);
    f.store.dispatch(new AttackAction(source.id,'Crisis Punch'));
    waits(f);
    for(let i=0;i<12;i++){
      const prompt=pending(f);
      if(!prompt)break;
      if(prompt.constructor.name==='WaitPrompt'){
        f.store.dispatch(new ResolvePromptAction(prompt.id,null));
        continue;
      }
      if(prompt.constructor.name==='ChoosePrizePrompt'&&prompt.playerId===source.id){
        const chosen=source.prizes.filter(p=>p.cards.length)
          .slice(0,prompt.options.count);
        assert.equal(prompt.validate(chosen,f.state),true);
        f.store.dispatch(new ResolvePromptAction(prompt.id,chosen));
        continue;
      }
      throw new Error('Unexpected attack prompt '+prompt.constructor.name);
    }
    assert.equal(f.state.phase,GamePhase.FINISHED);
    assert.equal(f.state.winner,seat);
    assert.equal(defender.active.getPokemonCard(),undefined);
    assert.deepEqual(physical(source).map(c=>c.id).sort((a,b)=>a-b),sourceIds);
    assert.deepEqual(physical(defender).map(c=>c.id).sort((a,b)=>a-b),opponentIds);
    return {sourceSeat:seat,sourceOriginalPhysical60:true,
      defenderOriginalPhysical60:true,sourceUnownInPlay:0,
      ownExeggcuteKOs:5,realDamagePumpRoots:3,
      originalLightningCardsSpent:1,originalDoubleColorlessCardsSpent:1,
      firstturnNativeCrisisPunch:true,nativeWinner:seat,
      origin:'prepared-source-original60-conditional',receipts,
      competitiveGameQualified:false};
  } finally { restore(); }
}

function run(){
  return {
    schema:'agent47-rank26-unownless-one-lightning-full-firstturn-native-v1',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:26,opponentRank:6,
    samples:[runSeat(0),runSeat(1)],
    originalSource60Unchanged:true,
    physicalCardIdsConserved:true,
    randomizedRealOpening:false,realSearchSequence:false,
    qualifiedCompetitiveGames:0
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={stage,runSeat,run};
