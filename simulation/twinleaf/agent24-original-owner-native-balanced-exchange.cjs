'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {
  inspectPhysicalCardZones,fixedDeckCountAnomalies,
  locatedOrPromptCountAnomalies
}=require('./physical-card-ledger.cjs');

const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Controlled invalid state transition on an actual pinned native Store:
 * exchange the first card references in the two *actual dealt* source decks
 * after setup is fully settled. This preserves both physical 60-card counts.
 * Require the live headless strict guard to reject precisely that root.
 *
 * The experiment does not assert that real Twinleaf gameplay produces swaps.
 * @param {0|1} sourceSeat
 * @param {number} seed Registered original-source physical deal seed.
 * @param {Map<number,object>} byRank Original printed 60 source roster.
 * @returns {object} Bounded root mutation and fail-closed witness.
 */
function one(sourceSeat,seed,byRank){
  const a=byRank.get(20).cardIds;
  const b=byRank.get(11).cardIds;
  assert.equal(a.length,60);
  assert.equal(b.length,60);
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {GamePhase}=require(path.join(output,'game/store/state/state'));
  const previous=Store.prototype.dispatch;
  let root=null,swapped=false,before=null,after=null,acted=null;
  Store.prototype.dispatch=function ownerSwapAfterRoot(action,...args){
    if(!root&&action.constructor.name==='AddPlayerAction')root=this;
    const result=previous.call(this,action,...args);
    const state=this.state;
    if(this===root&&!swapped&&state.players.length===2&&
       state.turn===1&&state.phase===GamePhase.PLAYER_TURN&&
       !state.prompts.some(prompt=>prompt.result===undefined)&&
       state.players.every(player=>player.deck.cards.length>0)){
      before=inspectPhysicalCardZones(state);
      assert.deepEqual(before.canonicalCounts,[60,60]);
      assert.deepEqual(fixedDeckCountAnomalies(before),[]);
      assert.deepEqual(locatedOrPromptCountAnomalies(before),[]);
      const deck0=state.players[0].deck.cards;
      const deck1=state.players[1].deck.cards;
      [deck0[0],deck1[0]]=[deck1[0],deck0[0]];
      after=inspectPhysicalCardZones(state);
      assert.deepEqual(after.canonicalCounts,[60,60]);
      assert.equal(after.referenceDuplications.length,0);
      assert.deepEqual(fixedDeckCountAnomalies(after),[]);
      assert.deepEqual(locatedOrPromptCountAnomalies(after),[]);
      assert.equal(after.energyWithoutPhysicalCard.length,0);
      swapped=true;
      acted={action:action.constructor.name,turn:state.turn,
        remainingDeckCounts:state.players.map(player=>player.deck.cards.length)};
    }
    return result;
  };
  let observed=null;
  try{
    runMatch({
      deckA:sourceSeat===0?a:b,
      deckB:sourceSeat===1?a:b,
      seed,maxActions:80,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      doubleDragonRecovery:true,
      capturePhysicalZoneIntegrity:true,
      captureOriginalOwnerIntegrity:true,
      enforceSettledPhysicalZoneIntegrity:true,
      label:'agent24-experimentally-crossed-owners-'+sourceSeat+'-'+seed
    });
    assert.fail('Strict original-owner check missed deliberately swapped cards');
  }catch(error){
    observed=error;
  }finally{
    Store.prototype.dispatch=previous;
  }
  assert.ok(swapped,'No stable original source deck root was available');
  assert.equal(observed?.code,'TWINLEAF_SETTLED_PHYSICAL_60_VIOLATION');
  const witness=observed.physicalConservationWitness;
  assert.ok(witness,'Strict original-owner source violation witness absent');
  assert.deepEqual(witness.ownership.canonicalCounts,[60,60]);
  assert.deepEqual(witness.settledCountAnomalies,[]);
  assert.equal(witness.ownership.referenceDuplications.length,0);
  assert.equal(witness.ownership.originalOwnerCustody.originalCardCount,120);
  assert.equal(witness.ownership.originalOwnerCustody.displacedOriginalReferences.length,2);
  assert.equal(witness.ownership.originalOwnerCustody.unregisteredOriginalReferences.length,0);
  assert.deepEqual(witness.ownership.originalOwnerCustody.missingOriginalCounts,[0,0]);
  assert.equal(witness.ownership.energyWithoutPhysicalCard.length,0);
  return {
    sourceRank:20,opponentRank:11,sourceSeat,seed,
    deliberatelyInjectedOwnershipSwap:true,
    injection:acted,
    originalPhysical60CountsBefore:before.canonicalCounts,
    originalPhysical60CountsAfter:after.canonicalCounts,
    oldCountAnomalies:fixedDeckCountAnomalies(after),
    oldDuplicateReferences:after.referenceDuplications.length,
    newStrictPhysicalOwnerVeto:observed.code,
    firstBadRoot:witness.actionOrdinal,
    displacedOriginalReferences:witness.ownership.originalOwnerCustody
      .displacedOriginalReferences.map(row=>({
        locatedSeat:row.locatedSeat,
        originalSeat:row.originalSeat,
        location:row.location
      })),
    missingOriginalCounts:witness.ownership.originalOwnerCustody.missingOriginalCounts,
    competitiveQualified:false
  };
}

/** @returns {object} */
function main(){
  initializeCards();
  const {byRank}=registration();
  const rows=[
    one(0,1847000101,byRank),
    one(1,1847000101,byRank)
  ];
  return {
    schema:'agent24-native-original-store-reciprocal-owner-transfer-v1',
    pinnedEngine:ENGINE_PIN,
    sourceRank:20,opponentRank:11,
    bothPhysicalSeats:true,
    observedCases:rows.length,
    observedNaturalOwnershipViolations:0,
    injectedViolations:2,
    nativeStrictVetoes:rows.filter(row=>
      row.newStrictPhysicalOwnerVeto==='TWINLEAF_SETTLED_PHYSICAL_60_VIOLATION').length,
    rows,competitiveQualifiedGames:0,
    caveat:'Deliberately corrupted genuine original-60 native Store after natural setup. Negative test of a silent old 60-count false positive; no assertion that legal play naturally transfers ownership.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={one,main};
