'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditPassNextNativeRoot}=
  require('../simulation/evaluation/agent7-pass-next-root-postgame.cjs');

function makeRow(ledger,counts){
  return {
    trial:{id:'6:test:B:champion-reference'},
    sourceActuallyFirst:true,
    actorOnlyDecisionCoverage:{
      ownerSupporterOpportunityAudit:{
        actualStoreSeen:true,
        bySeat:{
          0:{acceptedPassRoots:counts[0]},
          1:{acceptedPassRoots:counts[1]}
        }
      }
    },
    rootActionLedger:ledger
  };
}
function action(name,seat,turn){
  return {action:name,playerSlot:seat,turnBefore:turn,
    pendingPrompt:null};
}
test('native Pass accepted roots exactly match ledger and later-turn successor',()=>{
  const row=makeRow([
    action('PlayCardAction',0,1),
    action('PassTurnAction',0,1),
    action('PlayCardAction',1,2),
    action('PassTurnAction',1,2),
    action('AttackAction',0,3)
  ],{0:1,1:1});
  const summary=auditPassNextNativeRoot({rows:[row]});
  assert.equal(summary.acceptedPasses,2);
  assert.equal(summary.ledgerPasses,2);
  assert.equal(summary.followedByLaterTurn,2);
  assert.equal(summary.completeImmediateNextRootTurnEvidence,true);
  assert.equal(summary.competitiveQualifiedGames,0);
});

test('duplicate or missing accepted Pass roots are hard native-witness failures',()=>{
  const row=makeRow([
    action('PassTurnAction',0,1),
    action('AttackAction',1,2)
  ],{0:2,1:0});
  assert.throws(()=>auditPassNextNativeRoot({rows:[row]}),
    /Native Pass ledger/);
});

test('terminal root with no successor stays unverified rather than fabricated',()=>{
  const row=makeRow([action('PassTurnAction',0,2)],{0:1,1:0});
  const summary=auditPassNextNativeRoot({rows:[row]});
  assert.equal(summary.acceptedPasses,1);
  assert.equal(summary.noFollowingRoot,1);
  assert.equal(summary.completeImmediateNextRootTurnEvidence,false);
});
