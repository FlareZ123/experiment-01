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

/** @param {0|1} sourceSeat */
function runSeat(sourceSeat){
  const f=fixture(sourceSeat);
  assert.equal(f.own.stadium.cards[0]?.name,'Risky Ruins');
  const unown=restoreToOwnerHand(f.own,0,'Unown');
  const egg=restoreToOwnerHand(f.own,3,'Exeggcute');
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
  assert.deepEqual(physicalCopies(f.own).map(card=>card.id).sort(),ownBefore);
  assert.deepEqual(physicalCopies(f.opponent).map(card=>card.id).sort(),oppBefore);
  return {sourceSeat,sourceOriginal60Conserved:true,
    opposingOriginal60Conserved:true,
    nativeStadiumTriggerOnUnown:20,nativeStadiumTriggerOnEgg:20,
    nativeDamagePumpMovedCounters:1,
    eggKnockedOut:true,opponentPrizesBefore:prizeBefore,
    opponentPrizesAfter:prizeAfter,
    basicValidOpeningSimulated:false,competitiveGamesQualified:0};
}

for(const sourceSeat of [0,1]){
  test('pinned native staged Risky Ruins + Damage Pump Egg self-KO seat '+sourceSeat,()=>{
    const result=runSeat(sourceSeat);
    console.log('AGENT2_RANK26_RISKY_NATIVE',JSON.stringify(result));
  });
}

module.exports={runSeat,restoreToOwnerHand,physicalCopies};
