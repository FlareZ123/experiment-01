'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {
  captureInitialPhysicalOwners,inspectPhysicalCardZones,
  fixedDeckCountAnomalies
}=require('./physical-card-ledger.cjs');
const {
  paperReplayFirstLeadWitness
}=require('../evaluation/agent24-native-replay-first-lead-witness.cjs');

const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEED=1847000101;

/**
 * Negative fidelity control on an actual Store replay board. The beginning
 * is a genuine rank20/rank11 registered source-dealt 60/60 game. Both
 * artificial Prize relocations stay within the original physical owner:
 * first force a native both-zero-Prize tie, then mock the first Prize taken
 * after the new six-Prize replay actually starts. This is intentionally not
 * a full legal game, and no engine winner is interpreted competitively.
 *
 * @param {0|1} leader Which physical seat receives the first staged Prize.
 * @param {Map<number,object>} byRank Original rank indexed printed sixties.
 * @returns {object} Settled actual Store paper-versus-native contrast.
 */
function one(leader,byRank){
  const a=byRank.get(20).cardIds,b=byRank.get(11).cardIds;
  assert.equal(a.length,60);
  assert.equal(b.length,60);
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {GamePhase}=require(path.join(output,'game/store/state/state'));
  const {checkWinner}=require(path.join(
    output,'game/store/effect-reducers/check-effect'));
  const previous=Store.prototype.dispatch;
  const sentinel={};
  let root=null,originalOwners=null;
  let stagedTie=false,resetSeen=false,firstLeadStaged=false;
  let actualNewSixPrizes=false;
  let paperReceipt=null,beforeNative=null,afterNative=null;
  let beforeCustody=null,afterCustody=null;
  let beforeReplayPrizes=null,afterReplayPrizes=null;
  let prizeMoved=0, observedHeadlessWitness=null, observedHeadlessWitnessCount=0;
  Store.prototype.dispatch=function stagedPaperReplayFirstLead(action,...args){
    if(!root&&action.constructor.name==='AddPlayerAction')root=this;
    if(this===root&&firstLeadStaged)throw sentinel;
    const result=previous.call(this,action,...args);
    if(this!==root)return result;
    const state=this.state;
    if(action.constructor.name==='AddPlayerAction'&&
       state.players.length===2&&!originalOwners){
      originalOwners=captureInitialPhysicalOwners(state,60);
    }
    const settled=state.players.length===2&&
      state.phase===GamePhase.PLAYER_TURN&&state.turn>=1&&
      !state.prompts.some(p=>p.result===undefined);
    if(originalOwners&&!stagedTie&&settled){
      assert.deepEqual(inspectPhysicalCardZones(state,originalOwners).canonicalCounts,
        [60,60]);
      for(const player of state.players){
        assert.equal(player.prizes.filter(p=>p.cards.length>0).length,6);
        for(const prize of player.prizes){
          player.hand.cards.push(...prize.cards.splice(0));
        }
      }
      stagedTie=true;
    }else if(stagedTie&&state.isSuddenDeath===true&&
             state.turn===0&&state.phase===GamePhase.SETUP){
      resetSeen=true;
    }else if(stagedTie&&resetSeen&&settled&&
             state.isSuddenDeath===true&&!firstLeadStaged){
      const counts=state.players.map(player=>
        player.prizes.filter(prize=>prize.cards.length>0).length);
      assert.deepEqual(counts,[6,6],
        'Native tiebreaker did not deal genuine six Prizes each');
      actualNewSixPrizes=true;
      beforeReplayPrizes=counts;
      beforeCustody=inspectPhysicalCardZones(state,originalOwners);
      assert.deepEqual(fixedDeckCountAnomalies(beforeCustody),[]);
      assert.deepEqual(beforeCustody.originalOwnerCustody.missingOriginalCounts,
        [0,0]);
      const prize=state.players[leader].prizes.find(p=>p.cards.length>0);
      assert.ok(prize);
      const taken=prize.cards.splice(0);
      assert.equal(taken.length,1);
      state.players[leader].hand.cards.push(...taken);
      prizeMoved++;
      afterReplayPrizes=state.players.map(player=>
        player.prizes.filter(p=>p.cards.length>0).length);
      assert.deepEqual(afterReplayPrizes,leader===0?[5,6]:[6,5]);
      afterCustody=inspectPhysicalCardZones(state,originalOwners);
      assert.deepEqual(fixedDeckCountAnomalies(afterCustody),[]);
      assert.deepEqual(afterCustody.originalOwnerCustody.missingOriginalCounts,
        [0,0]);
      assert.equal(afterCustody.originalOwnerCustody.displacedOriginalReferences.length,0);
      paperReceipt=paperReplayFirstLeadWitness({
        state,playerTurnPhase:GamePhase.PLAYER_TURN,
        authenticatedReplayEpoch:true,
        originalActionSettled:true
      });
      assert.equal(paperReceipt.status,'PAPER_REPLAY_FIRST_PRIZE_LEAD');
      assert.equal(paperReceipt.paperWinnerSeat,leader);
      assert.equal(paperReceipt.paperGameOutcomeQualified,false);
      beforeNative={phase:state.phase,isSuddenDeath:state.isSuddenDeath,
        winner:state.winner??null};
      // Read-only counterfactual to the exact native reducer; it should
      // continue and thereby contradict paper's first Prize lead criterion.
      checkWinner({log(){}},state);
      afterNative={phase:state.phase,isSuddenDeath:state.isSuddenDeath,
        winner:state.winner??null};
      assert.deepEqual(afterNative,beforeNative);
      assert.equal(state.phase,GamePhase.PLAYER_TURN);
      firstLeadStaged=true;
    }
    return result;
  };
  const witnessModule=require('../evaluation/agent24-native-replay-first-lead-witness.cjs');
  const originalWitness=witnessModule.paperReplayFirstLeadWitness;
  witnessModule.paperReplayFirstLeadWitness=function headlessWitnessProbe(args){
    const receipt=originalWitness(args);
    if(receipt.status==='PAPER_REPLAY_FIRST_PRIZE_LEAD'){
      observedHeadlessWitnessCount++;
      observedHeadlessWitness=receipt;
    }
    return receipt;
  };
  let reachedSentinel=false;
  try{
    runMatch({
      deckA:a,deckB:b,seed:SEED,maxActions:220,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      doubleDragonRecovery:true,
      capturePhysicalZoneIntegrity:true,
      captureOriginalOwnerIntegrity:true,
      enforceSettledPhysicalZoneIntegrity:true,
      captureDecisionTrace:true,
      capturePaperReplayFirstPrizeLead:true,
      label:'agent24-experimentally-staged-paper-first-prize-lead-'+leader
    });
  }catch(error){
    reachedSentinel=error===sentinel||error?.cause===sentinel||
      error?.cause?.cause===sentinel;
    if(!reachedSentinel)throw error;
  }finally{
    Store.prototype.dispatch=previous;
    witnessModule.paperReplayFirstPrizeLeadWitness=originalWitness;
  }
  assert.ok(stagedTie&&resetSeen&&actualNewSixPrizes&&
    firstLeadStaged&&reachedSentinel);
  assert.equal(prizeMoved,1);
  assert.equal(observedHeadlessWitnessCount,1,
    'Headless actual-root adapter failed to retain first paper Prize lead');
  assert.equal(observedHeadlessWitness.paperWinnerSeat,leader);
  return {
    stagedWinnerSeat:leader,sourceRank:20,opponentRank:11,seed:SEED,
    originalPhysicalCards:originalOwners.size,
    nativeReplayActualSixPrizeSetup:actualNewSixPrizes,
    previousNativeSuddenDeathSetupObserved:resetSeen,
    replayPrizesBefore:beforeReplayPrizes,
    replayPrizesAfterStagedFirstLead:afterReplayPrizes,
    observedPaperReplayPrizeLead:paperReceipt,
    observedHeadlessRootPaperPrizeWitnessCount:observedHeadlessWitnessCount,
    observedHeadlessRootPaperPrizeWinner:observedHeadlessWitness.paperWinnerSeat,
    nativeCheckWinnerBefore:beforeNative,
    nativeCheckWinnerAfter:afterNative,
    physicalZoneCounts:afterCustody.canonicalCounts,
    missingOriginalCounts:afterCustody.originalOwnerCustody.missingOriginalCounts,
    competitiveQualified:false
  };
}

/** @returns {object} */
function main(){
  initializeCards();
  const {byRank}=registration();
  const rows=[one(0,byRank),one(1,byRank)];
  return{
    schema:'agent24-native-replay-first-prize-paper-stop-fixture-v1',
    engine:ENGINE_PIN,
    sourceRank:20,opponentRank:11,
    bothWinnerSeats:true,
    experimentalPhysicalPrizeRelocations:true,
    rows,
    competitiveQualifiedGames:0,
    caveat:'Genuine native original-source setup and native tiebreak replay; artificial both-zero-Prize tie and artificial first Prize taken in the replay. Demonstrates isolated native checkWinner omission and read-only paper first-lead stop classification only, without paper-compliant match traces.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main,one};
