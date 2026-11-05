'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {initializeCards} = require('../twinleaf/headless.cjs');
const {originals} = require('./agent41-rank3-arbitration-original-store.cjs');
const {runArm} = require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');

const VERSION = 'agent17-original-skyliner-five-reply-owner-pass-native-v1';
const TRIAL = Object.freeze({
  id:'3792360798:0:skyliner-free-pivot',
  seed:3792360798,rank3Seat:0,
  mode:'bilateral-skyliner-free-retreat',
  energyRecipient:true,captureTargets:true,
  captureOwnerPassSnapshots:true
});
const EXPECTED = Object.freeze({
  fullDeal:'02bb2b2e4b28d1cfc9e030e70c38f389fa37948e8c3dceb34472133f4753582a',
  sourceDeal:'37ed042b42966fd5c2232d28d1e458131e0ba9e0febf14cb3ad2961710c70c46',
  rootLedger:'5acd02e493800a041b5dedf4a9efa6a0a2de44eece25efc5424f5dda749c3acd',
  originalPassRoots:[227,240,251,263,282],
  originalPassTurns:[59,61,63,65,67]
});
const hash = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * A pre-existing B outcome replay with post-decision owner-only hand snapshots.
 * The registration and existing physical/root digests are immutable inputs.
 * The observer runs only after policy proposal and never supplies snapshots
 * to either bot. This does not certify paper-paid alternatives.
 *
 * @returns {object} One native replay and all original rank3 reply evidence.
 */
function run() {
  initializeCards();
  const cards=originals();
  const manifest=require('../../results/aichi-2026/full-decklists.json');
  const source=manifest.decks.find(deck=>deck.rank===3);
  assert.ok(source);
  assert.equal(source.cards.reduce((n,x)=>n+x.count,0),60);
  const input60=new Map();
  for (const row of source.cards) {
    const prefix=row.name+' '+row.printing.set;
    assert.ok(!input60.has(prefix));
    input60.set(prefix,{category:row.category,copies:row.count});
  }
  const arm=runArm(TRIAL,cards);
  assert.equal(arm.status,'native-terminal','Native replay must finish');
  assert.equal(arm.winner,1,'Original frozen treatment native winner');
  assert.equal(arm.fullDealSha256,EXPECTED.fullDeal,
    'Different physical deal from frozen original B');
  assert.equal(arm.rank3DealSha256,EXPECTED.sourceDeal,
    'Different original rank3 physical deal');
  assert.equal(arm.rootLedgerSha256,EXPECTED.rootLedger,
    'The passive observer must preserve every original game root');
  const witness=arm.ownerPassFrontierAudit;
  assert.ok(witness?.rootOrdinalLinked);
  assert.deepEqual(witness.events.map(row=>row.globalTurn),
    EXPECTED.originalPassTurns);
  assert.deepEqual(witness.events.map(row=>row.rootActionOrdinal),
    EXPECTED.originalPassRoots);
  assert.deepEqual(witness.events.map(row=>row.actorSeat),[0,0,0,0,0]);

  // The exact card classification is now derived from the actor's own hand
  // and the immutable registered original 60. Unmatched printings are
  // exposed as unresolved rather than silently coerced to Trainer.
  const replies=witness.events.map(row=>{
    const classified=row.actorHandPrintings.map(printing=>{
      const candidates=[...input60.entries()].filter(([prefix])=>
        printing===prefix||printing.startsWith(prefix+' '));
      // Overlapping name/set prefixes are resolved only when category
      // is unique, not by relying on item order.
      const category=new Set(candidates.map(([_,meta])=>meta.category));
      return {printing,category:category.size===1?
        [...category][0]:null};
    });
    const unknown=classified.filter(card=>card.category===null);
    return {
      globalTurn:row.globalTurn,
      nativePassRoot:row.rootActionOrdinal,
      ownerHandSize:row.actorHandSize,
      ownerTrainerNames:classified.filter(card=>
        card.category==='Trainer').map(card=>card.printing),
      ownerTrainerCountKnown:classified.filter(card=>
        card.category==='Trainer').length,
      unresolvedOwnHandNames:unknown.map(card=>card.printing),
      ownerActive:row.actorPublic.active?.printing??null,
      opponentActive:row.opponentPublic.active?.printing??null,
      ownerPublicLock:row.actorPublic.publicTurnRestrictions,
      opponentPublicLock:row.opponentPublic.publicTurnRestrictions,
      actualTurnQuotas:row.actorTurnResources,
      paperPayableAlternative:'not independently verified',
      ownerHandSource:'native actorObservation before accepted Pass'
    };
  });
  assert.equal(replies[0].ownerTrainerCountKnown>=12,true);
  assert.equal(replies[1].ownerTrainerCountKnown>=5,true);
  assert.equal(replies[4].ownerTrainerCountKnown>=6,true);

  return {
    version:VERSION,originalSeed:TRIAL.seed,
    originalRank3Source60Sha256:hash(cards.source),
    originalRank1Reference60Sha256:hash(cards.candidate),
    replayStatus:arm.status,nativeWinner:arm.winner,
    originalFullDealSha256:arm.fullDealSha256,
    originalSourceDealSha256:arm.rank3DealSha256,
    originalRootLedgerSha256:arm.rootLedgerSha256,
    identicalFrozenRootHistory:true,
    originalTurnPassEvidence:witness,
    originalRank3Replies:replies,
    opponentAlternativesPaperQualified:false,
    qualifiedCompetitiveGames:0,
    evidence:'after-decision actor-owned visible hand and public board; ' +
      'no native action changes or hand-to-bot feedback'
  };
}

if (require.main===module) {
  try {
    process.stdout.write(JSON.stringify(run(),null,2)+'\n');
  } catch (error) {
    process.stdout.write(JSON.stringify({
      version:VERSION,status:'native-replay-abort',
      error:String(error?.stack??error).slice(0,5000),
      qualifiedCompetitiveGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,TRIAL,EXPECTED,run};
