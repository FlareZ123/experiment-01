'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  withBilateralOwnerTrainerFrontier,trainerFrontierSummary
} = require('../simulation/twinleaf/agent29-bilateral-owner-trainer-frontier.cjs');
const {
  screenOwnerTrainerPrizePrerequisites
} = require('../simulation/evaluation/agent30-public-prize-trainer-necessary.cjs');

/** @returns {object} A detached, exact-print, acting-owner-root proof fixture. */
function realFormatOwnerRoot(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:3,
    ownHand:['Counter Catcher PAR','Roxanne ASR','Quick Ball FST'],
    ownPublic:{prizeCount:6},
    opponentPublic:{prizeCount:6}
  };
}

function syntheticAudit(){
  const v=realFormatOwnerRoot();
  const rows=[
    {handIndex:0,printing:v.ownHand[0],type:'Item',
      publicBlocker:null,nativeEnumeratorOffered:true},
    {handIndex:1,printing:v.ownHand[1],type:'Supporter',
      publicBlocker:null,nativeEnumeratorOffered:true},
    {handIndex:2,printing:v.ownHand[2],type:'Item',
      publicBlocker:null,nativeEnumeratorOffered:true}
  ];
  const paper=screenOwnerTrainerPrizePrerequisites(v,rows);
  return {
    nativePrintedTrainerClasses:980,rootsOmittedDueToCap:0,
    observedPublicPrizeConditionFailures:paper.provenPrizeBlockedCopies,
    roots:[{seat:0,turn:3,trainers:rows,chosen:{action:'PassTurnAction',
      trainer:null},dispatch:'native-accepted',
      ownerPublicPrizeNecessity:paper}]
  };
}

test('public Prize negative proof propagates through both-seat transport opt-in',()=>{
  const originalResult=Object.freeze({nativeResult:'unchanged'});
  const returned=withBilateralOwnerTrainerFrontier(()=>originalResult,{
    ownerPublicPrizeScreen:true,
    observer:(run,opts)=>{
      assert.deepEqual(opts.seats,[0,1]);
      assert.equal(opts.ownerPublicPrizeScreenOptIn,true);
      assert.equal(opts.ownerPaperNecessityOptIn,undefined);
      return {result:run(),audit:syntheticAudit()};
    },nativeDeps:{}
  });
  assert.strictEqual(returned.result,originalResult);
  assert.equal(returned.audit.summary.publicPrizeNecessaryFailures,2);
  assert.equal(returned.audit.summary.observedRootCount,1);
  assert.equal(returned.audit.summary.independentCompetitiveGames,0);
  assert.equal(returned.audit.roots[0].ownerPublicPrizeNecessity.rows[0].paperPlayable,false);
  assert.equal(returned.audit.roots[0].ownerPublicPrizeNecessity.rows[1].paperPlayable,false);
  assert.equal(returned.audit.roots[0].ownerPublicPrizeNecessity.rows[2].paperPlayable,null);
});

test('disabled public Prize gate preserves the legacy default-off metadata',()=>{
  const run=()=>({original:'same'});
  const result=withBilateralOwnerTrainerFrontier(run,{
    observer:(work,opts)=>{
      assert.equal(Object.hasOwn(opts,'ownerPublicPrizeScreenOptIn'),false);
      return {result:work(),audit:{
        ...syntheticAudit(),observedPublicPrizeConditionFailures:undefined
      }};
    },nativeDeps:{}
  });
  assert.equal(result.audit.summary.publicPrizeNecessaryFailures,null);
  assert.equal(result.audit.summary.independentCompetitiveGames,0);
  assert.equal(result.result.original,'same');
});

test('summary never recasts paper failure or unknown as positive paper eligibility',()=>{
  const receipt=syntheticAudit(),before=JSON.stringify(receipt);
  const summary=trainerFrontierSummary(receipt);
  assert.equal(JSON.stringify(receipt),before);
  assert.equal(summary.publicPrizeNecessaryFailures,2);
  assert.equal(summary.cardSpecificPaperPlayabilityVerified,false);
  assert.equal(summary.discardAndTargetPaymentsVerified,false);
  assert.equal(summary.independentCompetitiveGames,0);
});
