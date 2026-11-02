'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {
  captureInitialPhysicalOwners,inspectPhysicalCardZones,
  fixedDeckCountAnomalies
}=require('./physical-card-ledger.cjs');

const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEED=1847000101;

/** @param {object} ledger */
function summary(ledger){
  const o=ledger.originalOwnerCustody;
  assert.ok(o);
  return {
    canonicalCounts:ledger.canonicalCounts,
    countAnomalies:fixedDeckCountAnomalies(ledger),
    originalCardCount:o.originalCardCount,
    displacedReferences:o.displacedOriginalReferences.length,
    unregisteredReferences:o.unregisteredOriginalReferences.length,
    missingOriginalCounts:o.missingOriginalCounts,
    duplicatedReferences:ledger.referenceDuplications.length,
    energyIndexWithoutPhysicalCard:ledger.energyWithoutPhysicalCard.length
  };
}

/**
 * Stage an artificial **both-zero-Prize** native tiebreaker trigger after a
 * genuine 60/60 deal. The twelve actual Prize references are moved to their
 * OWN hand, preserving all 120 physical cards before native checkWinner.
 * The action and printed match are not a legal tournament trace.
 *
 * @returns {object} Native Store reset and original reference-survival audit.
 */
function main(){
  initializeCards();
  const {byRank}=registration();
  const source=byRank.get(20).cardIds;
  const opponent=byRank.get(11).cardIds;
  assert.equal(source.length,60);
  assert.equal(opponent.length,60);
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {GamePhase}=require(path.join(output,'game/store/state/state'));
  const original=Store.prototype.dispatch;
  const sentinel={};
  let root=null,index=null,staged=false,observedReset=false,afterReset=null;
  let stagedMoving=0,beforeStage=null,justAfterStage=null;
  let settledRoot=null;
  Store.prototype.dispatch=function originalOwnerTiebreakFixture(action,...args){
    const actionName=action.constructor.name;
    if(!root&&actionName==='AddPlayerAction')root=this;
    if(this===root&&settledRoot)throw sentinel;
    const state=this.state;
    if(this===root&&index&&!staged&&state.turn===1&&
       state.phase===GamePhase.PLAYER_TURN&&
       !state.prompts.some(prompt=>prompt.result===undefined)){
      beforeStage=summary(inspectPhysicalCardZones(state,index));
      assert.deepEqual(beforeStage.canonicalCounts,[60,60]);
      for(const player of state.players){
        assert.equal(player.prizes.filter(p=>p.cards.length>0).length,6);
        for(const prize of player.prizes){
          const cards=prize.cards.splice(0);
          stagedMoving+=cards.length;
          player.hand.cards.push(...cards);
        }
      }
      assert.equal(stagedMoving,12);
      justAfterStage=summary(inspectPhysicalCardZones(state,index));
      assert.deepEqual(justAfterStage.canonicalCounts,[60,60]);
      assert.deepEqual(justAfterStage.missingOriginalCounts,[0,0]);
      staged=true;
    }
    const result=original.call(this,action,...args);
    if(this!==root)return result;
    if(actionName==='AddPlayerAction'&&this.state.players.length===2&&!index){
      index=captureInitialPhysicalOwners(this.state,60);
      assert.equal(index.size,120);
    }
    if(staged && this.state.turn===0&&
       this.state.phase===GamePhase.SETUP&&
       this.state.isSuddenDeath===true)observedReset=true;
    if(observedReset && this.state.turn>=1 &&
       this.state.phase===GamePhase.PLAYER_TURN &&
       !this.state.prompts.some(prompt=>prompt.result===undefined)){
      afterReset=summary(inspectPhysicalCardZones(this.state,index));
      settledRoot={actionName,turn:this.state.turn,
        phase:this.state.phase,suddenDeath:this.state.isSuddenDeath===true,
        ...afterReset};
    }
    return result;
  };
  let reachedSentinel=false;
  try{
    runMatch({
      deckA:source,deckB:opponent,seed:SEED,maxActions:180,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      doubleDragonRecovery:true,
      capturePhysicalZoneIntegrity:true,
      captureOriginalOwnerIntegrity:true,
      enforceSettledPhysicalZoneIntegrity:true,
      label:'agent24-artificial-both-zero-prize-tiebreak-owner-v1'
    });
  }catch(error){
    if(error===sentinel||error?.cause===sentinel||
       error?.cause?.cause===sentinel)reachedSentinel=true;
    else throw error;
  }finally{
    Store.prototype.dispatch=original;
  }
  assert.ok(staged,'Real source deal never entered first normal turn');
  assert.ok(observedReset,'Native winner handler did not enter sudden-death setup');
  assert.ok(reachedSentinel&&settledRoot,
    'Native replay never reached a new settled first-player root');
  assert.deepEqual(afterReset.countAnomalies,[]);
  assert.equal(afterReset.originalCardCount,120);
  assert.equal(afterReset.displacedReferences,0);
  assert.equal(afterReset.unregisteredReferences,0);
  assert.deepEqual(afterReset.missingOriginalCounts,[0,0]);
  assert.equal(afterReset.duplicatedReferences,0);
  assert.equal(afterReset.energyIndexWithoutPhysicalCard,0);
  return {
    schema:'agent24-staged-real-source-120-reference-tiebreak-reset-v1',
    pinnedEngine:ENGINE_PIN,seed:SEED,
    sourceRank:20,opponentRank:11,sourceSeat:0,
    stagedByExperimenter:true,
    syntheticModification:'Move each genuine original Prize card to its own hand before an otherwise normal first-turn native root, causing a both-zero-Prize tie',
    originalPhysicalCards:120,prizeCardsMovedIntoOwnerHand:stagedMoving,
    beforeStage,justAfterStage,
    observedNativeSuddenDeathSetup:observedReset,
    afterResetFirstSettledRoot:settledRoot,
    evidence:'One staged native engine restart, original object references preserved or test fails',
    competitiveQualifiedGames:0,
    caveat:'Synthetic game-winning premise, owner-reference lifecycle check only; no paper-compliant outcome, tiebreak rule, legal action-chain, owner decision policy or fixed-deck strength evidence'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main,SEED};
