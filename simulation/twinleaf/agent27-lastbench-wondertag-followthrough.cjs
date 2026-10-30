'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('./agent27-source-lastbench-two-basic-native.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=require('./agent34-actor-only-root-policy.cjs');
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

/**
 * Follow a registered-source alternative final-Bench Basic through the real
 * printed Wonder Tag search, including its native prompts and deck shuffle.
 * Artificial controlled four-occupied-Bench board, no random opening.
 * @param {0|1} seat
 * @returns {object}
 */
function followWonderTag(seat){
  const x=stage(seat);
  const view=actorObservation(x.state,seat);
  const original=chooseActorRootIntent(view,x.catalog,{});
  assert.equal(original.printing,'Girafarig LOT');
  assert.equal(original.benchIndex,4);
  const supporter=x.owner.deck.cards.find(c=>c.fullName==='Guzma BUS');
  assert.ok(supporter,'Source rank1 must retain a physical Guzma in its deck');
  const initialDeckCount=x.owner.deck.cards.length;
  const preHand=x.owner.hand.cards.length;
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const needed=()=>x.state.prompts.find(p=>p.result===undefined)??null;
  x.store.dispatch(new x.PlayCardAction(x.owner.id,1,{
    player:x.PlayerType.BOTTOM_PLAYER,slot:x.SlotType.BENCH,index:4
  }));
  assert.equal(x.owner.bench[4].getPokemonCard()?.fullName,'Tapu Lele-GX GRI');
  const prompts=[];
  let sawConfirm=false,sawChoice=false,sawShuffle=false;
  for(let step=0;step<12 && needed();step++){
    const p=needed(),kind=p.constructor.name;
    let value;
    if(kind==='ConfirmPrompt'){
      assert.equal(sawConfirm,false);sawConfirm=true;value=true;
    }else if(kind==='ChooseCardsPrompt'){
      assert.equal(sawChoice,false);sawChoice=true;
      assert.strictEqual(p.cards,x.owner.deck);
      value=[supporter];
      assert.equal(p.validate(value),true,'Printed Wonder Tag must allow source Guzma');
    }else if(kind==='ShowCardsPrompt'){
      value=true;
    }else if(kind==='ShuffleDeckPrompt'){
      assert.equal(sawShuffle,false);sawShuffle=true;
      const n=x.owner.deck.cards.length;
      value=Array.from({length:n},(_,i)=>i);
      assert.equal(p.validate(value),true,'Native shuffle index selection');
    }else{
      throw new Error('Unexpected Wonder Tag prompt '+kind);
    }
    prompts.push({kind,ownerSeat:x.state.players.findIndex(v=>v.id===p.playerId)});
    x.store.dispatch(new ResolvePromptAction(p.id,value));
  }
  assert.equal(needed(),null,'Every Wonder Tag prompt must settle');
  assert.ok(sawConfirm&&sawChoice&&sawShuffle,'Full native Wonder Tag path');
  assert.equal(x.owner.hand.cards.includes(supporter),true);
  assert.equal(x.owner.hand.cards.length,preHand,
    'Lele played from hand and searched one existing Supporter into it');
  assert.equal(x.owner.deck.cards.length,initialDeckCount-1);
  assert.equal(x.owner.bench[4].getPokemonCard()?.fullName,'Tapu Lele-GX GRI');
  assert.equal(x.state.activePlayer,seat);
  assert.equal(x.state.turn,2);
  assert.equal(x.owner.bench.filter(slot=>slot.getPokemonCard()).length,5);
  return {seat,registeredSourceRanks:[1,10],
    registeredSourceDigests:x.sourceDigests,
    nativeSourceGuzmaFromDeckToHand:true,
    actualOwnerHandBefore:preHand,actualOwnerHandAfter:x.owner.hand.cards.length,
    priorSourceDeckCount:initialDeckCount,afterSourceDeckCount:x.owner.deck.cards.length,
    promptTrace:prompts,ownerRootStillAvailable:true,
    otherBasicStillHeld:x.owner.hand.cards.some(c=>c.fullName==='Girafarig LOT'),
    opponentReplyTested:false,stagedArtificialBoard:true,
    gameWinRateQualified:false};
}
function run(){
  const {withNumericShuffleValidator}=
    require('./agent22-numeric-shuffle-validation-hook.cjs');
  // The pinned native shuffle validator rejects numeric permutations on
  // decks >10 cards; reuse the existing reversible, tested research fix.
  return withNumericShuffleValidator(()=>({
    schema:'agent27-lastbench-wondertag-native-prompt-closed-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    seats:[followWonderTag(0),followWonderTag(1)],
    numericShuffleValidatorHook:true,
    qualifiedCompetitiveGames:0,
    caveat:'Controlled exact-source source-60 board. Printed Wonder Tag path only, no natural frequency, no strategic superiority or native opponent response.'
  }));
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={followWonderTag,run};
