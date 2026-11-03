'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {saveResult}=
  require('../twinleaf/agent3-rank26-compressor-settlement-prospective-v2.cjs');
const {run}=require('../twinleaf/agent5-generic-owner-trainer-frontier-native.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const TARGET='Sky Field ROS';
const VERSION='agent26-skyfield-public-stadium-owner-original-store-v1';

/**
 * A read-only wrapper around the pinned ActionEnumerator. It is installed
 * during the same Agent5 A/B/A native Store protocol, whose only enumerator
 * call site is its genuine owner-root observer.
 *
 * Collect only own-hand printing and PUBLIC Stadium/turn/lock information.
 * Never request either player's deck, Prizes, opponent hand, or speculation.
 * @returns {object} Exact two-seat native evidence for source5 vs source11.
 */
function collect(){
  const native=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator');
  const {ActionEnumerator}=require(native);
  const proto=ActionEnumerator.prototype;
  const prior=Object.getOwnPropertyDescriptor(proto,'enumerate');
  assert.equal(typeof prior?.value,'function');
  const captures=[];

  /**
   * @param {object} state Real owner-root native State.
   * @param {object} player The current acting owner.
   * @param {number} clientId Genuine owner player id.
   * @returns {object[]} Upstream enumerator's exact result unchanged.
   */
  function observedEnumerate(state,player,clientId){
    const actual=prior.value.call(this,state,player,clientId);
    const seat=state.players.indexOf(player);
    assert.ok(seat===0||seat===1);
    assert.equal(state.players[state.activePlayer],player);
    const ownerStadium=player.stadium.cards.map(x=>x.fullName);
    const opponentStadium=state.players[1-seat].stadium.cards
      .map(x=>x.fullName);
    const handStadiums=player.hand.cards
      .map((x,i)=>({index:i,printing:x.fullName}))
      .filter(x=>x.printing===TARGET);
    const offered=new Set(actual
      .filter(x=>x.constructor?.name==='PlayCardAction')
      .map(x=>x.handIndex));
    captures.push({
      sequentialOrdinal:captures.length,
      ownerSeat:seat,
      ownerPlayerId:player.id,
      globalTurn:state.turn,
      ownerStadium,
      opponentStadium,
      stadiumPlayedTurn:player.stadiumPlayedTurn,
      stadiumPlayLocked:player.cannotPlayStadiumCards===true,
      handSkyFieldIndices:handStadiums.map(x=>x.index),
      enumeratedSkyFieldIndices:handStadiums
        .filter(x=>offered.has(x.index)).map(x=>x.index),
      ownerPublicStadiumOnly:true
    });
    return actual;
  }

  Object.defineProperty(proto,'enumerate',{...prior,value:observedEnumerate});
  let archived;
  try {
    archived=run();
  } finally {
    Object.defineProperty(proto,'enumerate',prior);
  }
  assert.equal(archived.engine,'twinleafgg/'+PIN);
  assert.equal(archived.competitiveQualifiedGames,0);
  assert.equal(archived.summary.rootDecisionsObserved,captures.length);

  const roots=archived.rows.flatMap(row=>row.frontiers.roots.map(root=>({
    source5Seat:row.primaryRankSeat??row.source5Seat,
    ordinal:root.ordinal,ownerSeat:root.seat,globalTurn:root.turn,
    root,sourceSeed:row.seed
  })));
  assert.equal(captures.length,roots.length);
  const joined=roots.map((entry,i)=>{
    const cap=captures[i];
    assert.equal(cap.ownerSeat,entry.ownerSeat);
    assert.equal(cap.globalTurn,entry.globalTurn);
    const held=entry.root.trainers
      .filter(t=>t.printing===TARGET);
    assert.deepEqual(held.map(t=>t.handIndex),
      cap.handSkyFieldIndices);
    assert.deepEqual(held
      .filter(t=>t.nativeEnumeratorOffered).map(t=>t.handIndex),
      cap.enumeratedSkyFieldIndices);
    return {
      source5Seat:entry.source5Seat,sourceSeed:entry.sourceSeed,
      rootOrdinal:entry.ordinal,
      globalTurn:entry.globalTurn,
      ownerSeat:entry.ownerSeat,
      heldSkyFieldCopies:held.length,
      nativeOfferedSkyField:cap.enumeratedSkyFieldIndices.length>0,
      selectedRoot:entry.root.chosen?.action??null,
      selectedTrainer:entry.root.chosen?.trainer?.printing??null,
      nativeStoreDispatch:entry.root.dispatch,
      ownerStadium:cap.ownerStadium,
      opponentStadium:cap.opponentStadium,
      stadiumPlayedTurn:cap.stadiumPlayedTurn,
      stadiumPlayLocked:cap.stadiumPlayLocked,
      ownSkyFieldHandIndices:cap.handSkyFieldIndices
    };
  });
  const held=joined.filter(x=>x.heldSkyFieldCopies>0);
  const target=held.filter(x=>
    x.source5Seat===0&&x.ownerSeat===0&&
    x.nativeOfferedSkyField===false);
  const expected=[7,9,11,13];
  const exactFrozenTargetReproduced=
    JSON.stringify(target.map(x=>x.globalTurn))===JSON.stringify(expected)&&
    JSON.stringify(target.map(x=>x.rootOrdinal))===
      JSON.stringify([14,17,19,21])&&
    target.every(x=>x.selectedRoot==='PassTurnAction');
  const ownStadiumAtTarget=target.map(x=>x.ownerStadium);
  const frozenOriginalPhysical=[
    {source5Seat:0,seed:912174767,
      digest:'65c87abb4eb03985598acf3306a5169bb82a6b8a8fd021b630cb5c0f2318886a'},
    {source5Seat:1,seed:1914651848,
      digest:'3d8e3e1dec9027aec38ab2015b06bd4294fd9ed3c3c2dbf1dadec928433361d4'}
  ];
  const nowPhysical=archived.rows.map(row=>({
    source5Seat:row.primaryRankSeat??row.source5Seat,
    seed:row.seed,
    digest:row.initialFullPhysicalDealDigest
  }));
  const originalPhysicalDealDigestsMatched=
    JSON.stringify(frozenOriginalPhysical)===JSON.stringify(nowPhysical);
  return {
    frozenOriginalPhysicalDealDigests:frozenOriginalPhysical,
    currentPublicNativePhysicalDealDigests:nowPhysical,
    originalPhysicalDealDigestsMatched,    version:VERSION,
    pinnedEngine:'twinleafgg/'+PIN,
    observedExistingOriginalAichiPrintRanks:[5,11],
    noChangedGameOrDeckPolicy:true,
    noVendorModification:true,
    verifiedAgent5FullPhysicalAndDecisionABAPairs:
      archived.summary.fullGameTraceMatchedABA,
    liveOwnerEnumRootsJoined:captures.length,
    skyFieldHeldAllObservedRoots:held,
    expectedFrozenOmissions:{source5Seat:0,rootOrdinals:[14,17,19,21],globalTurns:expected},
    exactFrozenTargetReproduced,
    skyFieldMissedRealRootCount:target.length,
    skyFieldUnlistedPublicStadiumRows:target,
    ownerHasStadiumForEveryOmission:
      target.length>0&&target.every(x=>x.ownerStadium.length>0),
    ownerOwnStadiumIdentitiesAtOmissions:ownStadiumAtTarget,
    qualification:{
      publicStateSnapshotOnly:true,
      nativeSelectedStadiumReplacementProven:false,
      paperPayableSkyFieldAttemptProven:false,
      gameStrengthQualified:false,
      competitiveQualifiedGames:0
    }
  };
}

if(require.main===module){
  const result=collect();
  saveResult(path.resolve(process.cwd(),
    'agent26-frozen-skyfield-live-own-stadium-native-receipt.json'),result);
  process.stdout.write('AGENT26_SKYFIELD_PUBLIC_OWNER_STADIUM '+
    JSON.stringify({
      roots:result.liveOwnerEnumRootsJoined,
      missed:result.skyFieldMissedRealRootCount,
      reproduced:result.exactFrozenTargetReproduced,
      originalPhysicalDealsMatched:result.originalPhysicalDealDigestsMatched,
      heldRows:result.skyFieldHeldAllObservedRoots,
      hasOwnStadiumAll:result.ownerHasStadiumForEveryOmission,
      ownStadiums:result.ownerOwnStadiumIdentitiesAtOmissions,
      qualification:result.qualification
    })+'\n');
}

module.exports={VERSION,TARGET,collect};
