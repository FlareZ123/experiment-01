'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Source-first same-trial Plumeria OFF/ON research census. All registered
 * attempts remain in the denominator even when native dispatch failed or a
 * wrapper could not finish. This does not estimate competitive win rate.
 * @param {object} control Full registered development result with branch OFF.
 * @param {object} treated Full registered development result with branch ON.
 * @returns {object} Bounded metadata and per-seat native action exposure.
 */
function auditMatchedPlumeriaControl(control,treated){
  assert.equal(control?.attempted,4);
  assert.equal(treated?.attempted,4);
  assert.equal(control?.rows?.length,4);
  assert.equal(treated?.rows?.length,4);
  assert.equal(control.sourceFirstRetrospective,true);
  assert.equal(treated.sourceFirstRetrospective,true);
  assert.equal(control.competitiveQualifiedGames,0);
  assert.equal(treated.competitiveQualifiedGames,0);
  assert.equal(control.actorPlumeriaAfterPassOptIn,false);
  assert.equal(treated.actorPlumeriaAfterPassOptIn,true);
  const pairs=[];
  const bySeat={0:{accepted:0,settled:0},
    1:{accepted:0,settled:0}};
  let audited=0,errors=0,matchedDealAndActualStarter=0;
  for(let i=0;i<4;i++){
    const before=control.rows[i],after=treated.rows[i];
    assert.equal(before.trial?.id,after.trial?.id);
    assert.equal(before.trial?.seed,after.trial?.seed);
    assert.equal(before.trial?.candidateSlot,after.trial?.candidateSlot);
    assert.equal(before.qualifiesForCompetitiveInference,false);
    assert.equal(after.qualifiesForCompetitiveInference,false);
    const a=after.actorOnlyDecisionCoverage?.ownerPlumeriaAfterPassAudit??null;
    if(a){
      assert.equal(a.anyGameCompetitivelyQualified,false);
      assert.equal(a.policyStrategicallyValidated,false);
      assert.equal(a.sourceSeat,null);
      audited++;
      for(const seat of [0,1]){
        const x=a.bySeat?.[seat];
        assert.ok(x,'Missing Plumeria physical-seat audit');
        assert.ok(Number.isSafeInteger(x.accepted)&&x.accepted>=0);
        assert.ok(Number.isSafeInteger(x.settled)&&x.settled>=0);
        assert.ok(x.settled<=x.accepted);
        bySeat[seat].accepted+=x.accepted;
        bySeat[seat].settled+=x.settled;
      }
      assert.equal(a.acceptedPlumeria,
        a.bySeat[0].accepted+a.bySeat[1].accepted);
      assert.equal(a.settledEnergyDiscards,
        a.bySeat[0].settled+a.bySeat[1].settled);
      assert.ok(a.proposedPlumeria>=a.acceptedPlumeria);
      assert.ok(a.acceptedPlumeria>=a.settledEnergyDiscards);
    }else errors++;
    const matched=Boolean(before.sourceDealFingerprint&&
      before.sourceDealFingerprint===after.sourceDealFingerprint&&
      before.verifiedFirstTurn===true&&after.verifiedFirstTurn===true&&
      before.actualStarterSeat===after.actualStarterSeat);
    if(matched)matchedDealAndActualStarter++;
    pairs.push({
      id:before.trial.id,rank:before.trial.rank,
      candidateSlot:before.trial.candidateSlot,
      seed:before.trial.seed,
      sameSourceDealAndActualStarter:matched,
      controlStatus:before.status??'engine-terminal-or-other',
      treatedStatus:after.status??'engine-terminal-or-other',
      controlEngineWinner:before.winner??null,
      treatedEngineWinner:after.winner??null,
      nativeAuditPresent:Boolean(a),
      proposalCount:a?.proposedPlumeria??null,
      acceptedCount:a?.acceptedPlumeria??null,
      settledCount:a?.settledEnergyDiscards??null,
      unresolvedChains:a?.unresolvedChains??null,
      controlRootSha256:before.rootActionLedgerSha256??null,
      treatedRootSha256:after.rootActionLedgerSha256??null,
      physicalRootChanged:Boolean(matched&&
        before.rootActionLedgerSha256&&after.rootActionLedgerSha256&&
        before.rootActionLedgerSha256!==after.rootActionLedgerSha256),
      competitiveInferenceQualified:false
    });
  }
  return {
    schema:'agent38-plumeria-same-deal-both-seat-native-census-v1',
    registeredAttempts:4,matchedDealAndActualStarter,
    treatedAudits:audited,treatedMissingAudits:errors,
    totalProposals:pairs.reduce((n,row)=>n+(row.proposalCount??0),0),
    totalAccepted:pairs.reduce((n,row)=>n+(row.acceptedCount??0),0),
    totalSettled:pairs.reduce((n,row)=>n+(row.settledCount??0),0),
    bySeat,pairs,competitivelyQualifiedGames:0,
    strategyQualified:false,
    limits:'Retrospective source-first deals, weak shared policy, unsupported full clock and 3 missing opponent 60s. Native accepted actions and selected trial winner changes are not comparative competitive strength.'
  };
}

if(require.main===module){
  assert.equal(process.argv.length,4);
  const control=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const treated=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write(JSON.stringify(
    auditMatchedPlumeriaControl(control,treated),null,2)+'\n');
}

module.exports={auditMatchedPlumeriaControl};
