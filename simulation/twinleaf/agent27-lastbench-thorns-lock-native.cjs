'use strict';
const assert=require('node:assert/strict');
const {stage}=require('./agent27-source-lastbench-two-basic-native.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=
  require('./agent34-actor-only-root-policy.cjs');
const {installLeleEntryAbilityLockHook}=
  require('./lele-entry-ability-lock-hook.cjs');

/**
 * Same source-rank-1 final-Bench choice, now against real printed rank-6
 * Iron Thorns ex Initialization from its actual 60. Show the known pre-move
 * engine entry-Ability leak and confirm the already maintained paper hook.
 * @param {0|1} seat
 * @returns {object}
 */
function checkLockedSeat(seat){
  const raw=stage(seat,6),corrected=stage(seat,6);
  assert.deepEqual(actorObservation(raw.state,seat),
    actorObservation(corrected.state,seat));
  assert.equal(raw.opponent.active.getPokemonCard()?.fullName,
    'Iron Thorns ex TWM');
  const chosen=chooseActorRootIntent(actorObservation(raw.state,seat),
    raw.catalog,{});
  assert.deepEqual(chosen,{kind:'bench-basic',handIndex:0,benchIndex:4,
    printing:'Girafarig LOT'});
  const play=x=>{
    const before=x.owner.hand.cards.length;
    x.store.dispatch(new x.PlayCardAction(x.owner.id,1,{
      player:x.PlayerType.BOTTOM_PLAYER,slot:x.SlotType.BENCH,index:4
    }));
    assert.equal(x.owner.bench[4].getPokemonCard()?.fullName,
      'Tapu Lele-GX GRI');
    assert.equal(x.owner.hand.cards.length,before-1);
    return x.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name);
  };
  const rawPending=play(raw);
  assert.ok(rawPending.includes('ConfirmPrompt'),
    'Known pinned pre-move Wonder Tag bug must be observable');
  const restore=installLeleEntryAbilityLockHook();
  let correctedPending;
  try{correctedPending=play(corrected);}
  finally{restore();}
  assert.deepEqual(correctedPending,[],
    'Under printed Initialization the Lele card can be Benched but Wonder Tag is blocked');
  assert.equal(corrected.owner.hand.cards.some(card=>
    card.fullName==='Girafarig LOT'),true);
  assert.equal(corrected.state.turn,2);
  return {seat,sourceRanks:[1,6],sourceDigests:corrected.sourceDigests,
    printedOpposingAbility:'Initialization',
    rawNativePreMoveLeakPromptKinds:rawPending,
    paperCorrectedPendingPromptKinds:correctedPending,
    correctedBenchLeleAccepted:true,
    correctedWonderTagSuppressed:true,
    otherBasicStillHeld:true,
    stagedControlledBoard:true,
    opponentAutonomousReply:false,
    qualifiedCompetitiveGames:0};
}
function run(){
  return {schema:'agent27-lastbench-iron-thorns-entry-lock-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows:[checkLockedSeat(0),checkLockedSeat(1)],
    qualifiedCompetitiveGames:0,
    caveat:'Rank1 versus rank6 original printed source inventories, artificial common board, paper hook already documented; no matchup strength.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={checkLockedSeat,run};
