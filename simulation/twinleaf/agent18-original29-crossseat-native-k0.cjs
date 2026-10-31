'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runMatch}=require('./headless.cjs');
const {sourceDecks,observeSourceK0}=
  require('./agent18-aichi-source-k0-native-root.cjs');

const CAMPAIGN='agent18-original29-crossseat-sha256-seed-v1';
const MAX_ACTIONS=48;
const ENGINE='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const MISSING=new Set([23,25,28]);

/**
 * Preregistered per-source+orientation deterministic native 32-bit seed.
 * @param {number} rank Exact published final Aichi Top32 source placement.
 * @param {0|1} orientation Physical seat position of original rank1 reference.
 * @returns {number} Unsigned 32-bit seed.
 */
function seedFor(rank,orientation){
  assert.ok(Number.isSafeInteger(rank)&&rank>=1&&rank<=32);
  assert.ok(orientation===0||orientation===1);
  return createHash('sha256')
    .update(`${CAMPAIGN}|rank=${rank}|orientation=${orientation}`)
    .digest().readUInt32BE(0);
}

/** @returns {{rank:number,orientation:0|1,seed:number}[]} */
function registeredCases(){
  const rows=[];
  for(let rank=1;rank<=32;rank++){
    if(MISSING.has(rank))continue;
    for(const orientation of [0,1]){
      rows.push({rank,orientation,seed:seedFor(rank,orientation)});
    }
  }
  assert.equal(rows.length,58);
  assert.equal(new Set(rows.map(row=>row.seed)).size,58,
    'Preregistered seeds must be distinct across all arms');
  return rows;
}

/** @param {object} game Native headless game outcome summary. */
function fixedOutcome(game){
  return {
    deckHashes:game.deckHashes,winner:game.winner,actions:game.actions,
    turns:game.turns,endReason:game.endReason,
    prizesRemaining:game.prizesRemaining
  };
}

/** @param {object} row Original detached owner-first native receipt. */
function projectOwnerRoot(row){
  return {
    physicalSeat:row.seat,globalTurn:row.turn,
    ownActive:row.ownActivePublicPrinting,
    ownBench:row.ownBenchPublicPrintings,
    opponentActive:row.opponentActivePublicPrinting,
    ownerKnownHand:row.ownerKnownHand,
    chosenIntent:row.chosenOwnerOnlyIntent,
    sameRootCollectorVersion:row.sameRootCollectorVersion,
    sameRootReceipt:row.sameRootReceipt,
    sameRootK0Invariant:row.sameRootAllProposersK0Invariant,
    physicalObjectsRestored:row.physicalObjectsRestored,
    nativeBotProposedActionClass:row.nativeBotProposedActionClass,
    nativeBotProposedHandPrinting:row.nativeBotProposedHandPrinting,
    nativeBotProposedHandIndex:row.nativeBotProposedHandIndex,
    nativeStoreFirstActionDispatched:row.nativeStoreFirstActionDispatched,
    nativeStoreFirstActionAccepted:row.nativeStoreFirstActionAccepted,
    nativeStoreFirstActionAttachedToolTarget:
      row.nativeStoreFirstActionAttachedToolTarget,
    nativeStoreToolActionEncodingEquivalent:
      row.nativeStoreToolActionEncodingEquivalent,
    nativeStoreToolActionEncodingTarget:
      row.nativeStoreToolActionEncodingTarget
  };
}

/** @returns {object} Both-seat, distinct-seed original native K0 survey. */
function run(){
  const decks=sourceDecks();
  const cases=registeredCases();
  const arms=[];
  for(const item of cases){
    const reference=decks.get(1),source=decks.get(item.rank);
    const entry={...item,rankA:item.orientation===0?1:item.rank,
      rankB:item.orientation===0?item.rank:1};
    try{
      assert.equal(reference?.playableUnderEngine,true);
      assert.equal(source?.playableUnderEngine,true);
      assert.equal(reference.cardIds.length,60);
      assert.equal(source.cardIds.length,60);
      const req={
        deckA:(item.orientation===0?reference:source).cardIds,
        deckB:(item.orientation===0?source:reference).cardIds,
        label:`agent18-diverse-K0-${item.rank}-${item.orientation}`,
        seed:item.seed,maxActions:MAX_ACTIONS,
        strictPromptValidation:true,isolatePolicyRandomness:true,
        postSuperAliasRepairIsolation:true,
        supporterDecisionCorrection:true
      };
      const unobserved=runMatch(req);
      const observed=observeSourceK0(()=>runMatch(req));
      assert.deepStrictEqual(fixedOutcome(observed.result),
        fixedOutcome(unobserved),'K0 observer modified genuine original game outcome');
      assert.equal(observed.rows.length,2,
        'Each game must reach both original native owner first roots');
      assert.ok(observed.rows.every(r=>
        r.status==='K0-native-source-owner-invariant'&&
        r.sameRootAllProposersK0Invariant===true&&
        r.physicalObjectsRestored===true&&
        r.nativeStoreFirstActionDispatched===true&&
        r.nativeStoreFirstActionAccepted===true),
      'K0 observation or original native first-Store-action failed');
      entry.status='native-original-source-both-owners-passed';
      entry.originalNativeOutcome=fixedOutcome(unobserved);
      entry.ownerRoots=observed.rows.map(row=>({
        role:item.rank===1?'rank1-mirror':
          row.seat===item.orientation?'rank1-reference':'original-source',
        ...projectOwnerRoot(row)
      }));
    }catch(error){
      entry.status='blocked';
      entry.error=String(error?.stack??error);
    }
    arms.push(entry);
  }
  const blocked=arms.filter(arm=>arm.status==='blocked');
  return {
    schema:'agent18-aichi-original29-crossseat-native-K0-v1',
    campaign:CAMPAIGN,engineRevision:ENGINE,maxActions:MAX_ACTIONS,
    preregisteredArms:58,preregisteredFirstOwnerRoots:116,
    missingExactOriginal60:[23,25,28],
    passedArms:58-blocked.length,
    blockedArms:blocked.map(({rank,orientation,seed,error})=>({
      rank,orientation,seed,error})),
    arms,competitiveQualifiedGames:0,
    caveat:'Bounded original native first owner roots with unique deterministic seeds; structural offers never dispatched. No qualified match or deck win rate.'
  };
}
if(require.main===module){
  const output=run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(output.blockedArms.length)process.exitCode=1;
}
module.exports={CAMPAIGN,MAX_ACTIONS,seedFor,registeredCases,
  fixedOutcome,projectOwnerRoot,run};
