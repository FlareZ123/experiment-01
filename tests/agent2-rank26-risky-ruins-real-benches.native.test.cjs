'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture}=require(
  '../simulation/twinleaf/rank26-pump-source-conserved-fixture.cjs');
const {installDamagePumpSingleSourceHook}=require(
  '../simulation/twinleaf/damage-pump-single-source-hook.cjs');
const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(base,name));
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=native(
  'game/store/actions/resolve-prompt-action');

/**
 * Reposition original source physical cards before a stage, preserving their
 * unique IDs. This staging is deliberately not an observed natural setup.
 * @param {object} owner
 * @param {number} benchIndex
 * @param {string} name
 */
function restoreToOwnerHand(owner,benchIndex,name){
  const slot=owner.bench[benchIndex];
  assert.equal(slot.getPokemonCard()?.name,name);
  const card=slot.cards.splice(0,1)[0];
  slot.damage=0;
  owner.hand.cards.push(card);
  return card;
}

/** @param {object} player @returns {object[]} */
function physicalCopies(player){
  return [...player.active.cards,
    ...player.bench.flatMap(slot=>slot.cards),
    ...player.stadium.cards,...player.hand.cards,
    ...player.deck.cards,...player.discard.cards,
    ...player.prizes.flatMap(slot=>slot.cards)];
}

/** @param {0|1} sourceSeat @param {{prepare?:(f:object)=>object,afterKO?:(f:object,staged:object)=>object}} [options] */
function runSeat(sourceSeat,options={}){
  const f=fixture(sourceSeat);
  assert.equal(f.own.stadium.cards[0]?.name,'Risky Ruins');
  const unown=restoreToOwnerHand(f.own,0,'Unown');
  const egg=restoreToOwnerHand(f.own,3,'Exeggcute');
  const staged=options.prepare?.(f)??null;
  const ownBefore=physicalCopies(f.own).map(card=>card.id).sort();
  const oppBefore=physicalCopies(f.opponent).map(card=>card.id).sort();
  assert.equal(ownBefore.length,60);
  assert.equal(oppBefore.length,60);
  const play=(card,benchIndex)=>{
    const handIndex=f.own.hand.cards.indexOf(card);
    assert.ok(handIndex>=0);
    f.store.dispatch(new PlayCardAction(f.own.id,handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
      index:benchIndex
    }));
  };
  play(unown,0);
  assert.equal(f.own.bench[0].getPokemonCard(),unown);
  assert.equal(f.own.bench[0].damage,20);
  play(egg,3);
  assert.equal(f.own.bench[3].getPokemonCard(),egg);
  assert.equal(f.own.bench[3].damage,20);
  assert.equal(f.own.bench[0].damage,20);
  const pump=f.own.hand.cards.find(card=>card.name==='Damage Pump');
  assert.ok(pump);
  const restore=installDamagePumpSingleSourceHook();
  let prizeBefore=f.opponent.getPrizeLeft(),prizeAfter=null;
  try{
    f.store.dispatch(new PlayCardAction(f.own.id,
      f.own.hand.cards.indexOf(pump),{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
    const prompt=f.state.prompts.find(p=>p.result===undefined);
    assert.equal(prompt?.constructor.name,'MoveDamagePrompt');
    assert.equal(prompt.options.singleSourceTarget,true);
    const moves=[{
      from:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0},
      to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:3}
    }];
    assert.equal(prompt.validate(moves,f.state),true);
    f.store.dispatch(new ResolvePromptAction(prompt.id,moves));
    assert.equal(f.own.bench[0].damage,10);
    assert.equal(f.own.bench[3].getPokemonCard(),undefined);
    assert.ok(f.own.discard.cards.includes(egg));
    const prizePrompt=f.state.prompts.find(p=>p.result===undefined);
    assert.equal(prizePrompt?.constructor.name,'ChoosePrizePrompt');
    assert.equal(prizePrompt.options.count,1);
    const prize=[f.opponent.prizes.find(p=>p.cards.length>0)];
    assert.equal(prizePrompt.validate(prize,f.state),true);
    f.store.dispatch(new ResolvePromptAction(prizePrompt.id,prize));
    prizeAfter=f.opponent.getPrizeLeft();
    assert.equal(prizeBefore,6);
    assert.equal(prizeAfter,5);
    assert.equal(f.own.getPrizeLeft(),6);
  }finally{restore();}
  const continuation=options.afterKO?.(f,staged)??null;
  assert.deepEqual(physicalCopies(f.own).map(card=>card.id).sort(),ownBefore);
  assert.deepEqual(physicalCopies(f.opponent).map(card=>card.id).sort(),oppBefore);
  return {sourceSeat,sourceOriginal60Conserved:true,
    opposingOriginal60Conserved:true,
    nativeStadiumTriggerOnUnown:20,nativeStadiumTriggerOnEgg:20,
    nativeDamagePumpMovedCounters:1,
    eggKnockedOut:true,opponentPrizesBefore:prizeBefore,
    opponentPrizesAfter:prizeAfter,
    basicValidOpeningSimulated:false,competitiveGamesQualified:0,
    ...(continuation===null?{}:{continuation})};
}

for(const sourceSeat of [0,1]){
  test('pinned native staged Risky Ruins + Damage Pump Egg self-KO seat '+sourceSeat,()=>{
    const result=runSeat(sourceSeat);
    console.log('AGENT2_RANK26_RISKY_NATIVE',JSON.stringify(result));
  });
}


/**
 * Stage real original-source cards in hand and one original opponent
 * Iron Thorns on Bench before the executed source turn. Staging is
 * explicit, with all physical original-60 copies conserved.
 * @param {object} f
 * @returns {object}
 */
function preparePaidCounterResources(f){
  const take=originalName=>{
    const index=f.own.deck.cards.findIndex(card=>card.name===originalName);
    assert.ok(index>=0,'Source original deck missing '+originalName);
    const [card]=f.own.deck.cards.splice(index,1);
    f.own.hand.cards.push(card);
    return card;
  };
  const catcher=take('Counter Catcher');
  const cologne=take('Canceling Cologne');
  const index=f.opponent.hand.cards.findIndex(card=>
    card.name==='Iron Thorns ex');
  assert.ok(index>=0);
  const [secondThorns]=f.opponent.hand.cards.splice(index,1);
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const opposingBench=new PokemonCardList();
  opposingBench.cards.push(secondThorns);
  f.opponent.bench.push(opposingBench);
  return {catcher,cologne,opposingBench,secondThorns};
}

/**
 * Confirm that the *same staged original-source turn* changes Prize parity,
 * pays the now-live Counter Catcher and Cologne, and returns the Egg from
 * discard. Original opponent rank 6 Thorns is used as the target, so this is
 * a physical Prize/gust/ability control, not a Muk-vs-Cologne interaction.
 * @param {object} f
 * @param {object} staged
 * @returns {object}
 */
function resolvePaidCounterAfterSelfKO(f,staged){
  assert.equal(f.own.getPrizeLeft(),6);
  assert.equal(f.opponent.getPrizeLeft(),5);
  assert.equal(staged.catcher.canPlay(f.store,f.state,f.own),true);
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const catcherIndex=f.own.hand.cards.indexOf(staged.catcher);
  assert.ok(catcherIndex>=0);
  f.store.dispatch(new PlayCardAction(f.own.id,catcherIndex,board));
  const prompt=f.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'ChoosePokemonPrompt');
  assert.equal(prompt.playerId,f.own.id);
  assert.equal(prompt.validate([staged.opposingBench],f.state),true);
  f.store.dispatch(new ResolvePromptAction(prompt.id,[staged.opposingBench]));
  assert.equal(f.opponent.active.getPokemonCard(),staged.secondThorns);
  assert.ok(f.own.discard.cards.includes(staged.catcher));
  const cologneIndex=f.own.hand.cards.indexOf(staged.cologne);
  assert.ok(cologneIndex>=0);
  f.store.dispatch(new PlayCardAction(f.own.id,cologneIndex,board));
  assert.ok(f.own.discard.cards.includes(staged.cologne));
  const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
  const power=staged.secondThorns.powers.find(p=>
    p.name==='Initialization');
  assert.ok(power);
  assert.equal(Boolean(IS_ABILITY_BLOCKED(f.store,f.state,
    f.opponent,staged.secondThorns,power)),true);
  const egg=f.own.discard.cards.find(card=>card.name==='Exeggcute');
  assert.ok(egg);
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  f.store.dispatch(new UseAbilityAction(f.own.id,'Propagation',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.DISCARD,
    index:f.own.discard.cards.indexOf(egg)
  }));
  assert.ok(f.own.hand.cards.includes(egg));
  assert.equal(f.own.getPrizeLeft(),6);
  assert.equal(f.opponent.getPrizeLeft(),5);
  assert.deepEqual(f.state.prompts.filter(p=>p.result===undefined),[]);
  return {sourcePrizes:6,opponentPrizes:5,
    paidCounterCatcher:true,sourceChosenGust:true,
    paidCancelingCologne:true,activeInitializationDisabled:true,
    physicalEggRecovered:true,unresolvedPrompts:0};
}

for(const sourceSeat of [0,1]){
  test('single staged real-turn self-KO to paid Catcher Cologne seat '+sourceSeat,()=>{
    const result=runSeat(sourceSeat,{
      prepare:preparePaidCounterResources,
      afterKO:resolvePaidCounterAfterSelfKO
    });
    assert.equal(result.continuation.paidCounterCatcher,true);
    console.log('AGENT2_RANK26_RISKY_CATCHER_COLOGNE',
      JSON.stringify(result));
  });
}

module.exports={runSeat,restoreToOwnerHand,physicalCopies,
  preparePaidCounterResources,resolvePaidCounterAfterSelfKO};
