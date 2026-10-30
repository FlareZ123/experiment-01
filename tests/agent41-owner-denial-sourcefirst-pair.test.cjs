'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {
  VERSION,denialEvidence,compareProfiles,runProfile,runPair
}=require('../simulation/evaluation/agent41-owner-denial-sourcefirst-pair.cjs');

/** @param {boolean} treated @returns {object} */
function sample(treated){
  const rows=[6,6,11,11].map((rank,index)=>{
    const candidateId=index%2===0?
      'champion-reference':'new-moon-lockbreaker-v1';
    const id=rank+':0:B:'+candidateId;
    return {
      trial:{id,seed:rank===6?407516727:482443328,
        rank,candidateSlot:'B',candidateId},
      sourceSeat:0,candidateDeckFingerprint:'deck-'+candidateId,
      sourceDeckFingerprint:'source-'+rank,enginePin:'test-engine-revision',
      sourceDealFingerprint:'source-deal-'+rank,
      fullPhysicalDealFingerprint:'full-'+id,
      verifiedFirstTurn:true,actualStarterSeat:0,finished:false,
      rootActionLedger:[
        {actionOrdinal:1,playerSlot:0,turnBefore:1,action:'PassTurnAction'},
        {actionOrdinal:2,playerSlot:1,turnBefore:2,
          action:treated?'PlayCardAction':'AttackAction',
          card:treated?'Team Flare Grunt':null}
      ],
      actorOnlyDecisionCoverage:{detailedComponentAudits:{root:{
        selectedRootDecisions:2,
        typedIntentCounts:treated?{'play-team-flare-grunt-denial':1}:{},
        terminalArbitration:treated?{changedRoots:1,reasons:{
          'deny-visible-active-energy-before-turn-ending-attack':1
        }}:null,
        nativeRootAcceptances:treated?[{
          kind:'play-team-flare-grunt-denial',accepted:true}]:[]
      }}}
    };
  });
  return {sourceFirstRetrospective:true,attempted:4,rows};
}

test('retrospective A/B audit matches only authenticated same-sixty physical starts',()=>{
  const result=compareProfiles(sample(false),sample(true));
  assert.equal(result.schema,VERSION+'-comparison');
  assert.equal(result.expectedAttempts,8);
  assert.equal(result.matchedInitialPhysicalStarts,4);
  assert.equal(result.treatmentSelectedDenialsObserved,4);
  assert.equal(result.treatmentAcceptedDenialsSampleLowerBound,4);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.winRateCertified,false);
  assert.ok(result.rows.every(row=>row.publicRootDifference.different));
  assert.ok(result.rows.every(row=>row.qualifiedCompetitiveOutcome===false));
});

test('missing physical witnesses and censored attempts stay in full denominator',()=>{
  const base=sample(false),treated=sample(true);
  delete treated.rows[0].fullPhysicalDealFingerprint;
  treated.rows[1].status='engine-error';
  treated.rows[1].actorOnlyDecisionCoverage=null;
  treated.rows[2].sourceDealFingerprint='new-shuffle';
  const result=compareProfiles(base,treated);
  assert.equal(result.observedAttempts,8);
  assert.equal(result.matchedInitialPhysicalStarts,2);
  assert.equal(result.treatmentRowsMissingRootAudit,1);
  assert.equal(result.treatmentSelectedDenialsObserved,3);
  assert.equal(result.rows[1].treatmentDisposition,'engine-error');
  assert.equal(result.rows[1].treatmentDenial.selected,null);
});

test('native acceptance is sampled only and never conflated with a settled Energy discard',()=>{
  const audit=denialEvidence(sample(true).rows[0]);
  assert.equal(audit.actorRootObserved,true);
  assert.equal(audit.selected,1);
  assert.equal(audit.sampledAcceptedLowerBound,1);
  assert.equal(audit.rootChoicesTotal,2);
  assert.equal('settledEnergyDiscard' in audit,false);
  const missing=denialEvidence({actorOnlyDecisionCoverage:null});
  assert.equal(missing.selected,null);
  assert.equal(missing.sampledAcceptedLowerBound,null);
});

test('matched pairing refuses missing or incompatible original fixed candidate',()=>{
  const base=sample(false),treated=sample(true);
  treated.rows.pop();
  assert.throws(()=>compareProfiles(base,treated),/3 !== 4|Missing treatment/);
  const invalid=sample(true);
  invalid.rows[0].trial.seed++;
  assert.throws(()=>compareProfiles(sample(false),invalid));
});

test('sealed profile flag is observed by both policies and restored on success/failure',()=>{
  const key='AGENT41_OWNER_DENIAL_ARBITRATION_DEV';
  const old=process.env[key];
  try{
    process.env[key]='from-caller';
    const observed=[];
    const execute=options=>{
      observed.push({enabled:process.env[key],
        teamFlare:process.env.AGENT1_TEAM_FLARE_GRUNT_DEV,
        terminal:process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV,
        actorOnly:options.actorOnlyComposition,
        nativeAccepted:options.nativeAcceptedTargets,
        paperSupporterQuota:options.paperSupporterQuota});
      return sample(process.env[key]==='true');
    };
    const result=runPair(execute);
    assert.deepEqual(observed.map(row=>row.enabled),['false','true']);
    assert.ok(observed.every(row=>row.teamFlare==='true'&&
      row.terminal==='false'&&row.actorOnly&&row.nativeAccepted&&
      row.paperSupporterQuota));
    assert.equal(result.comparison.matchedInitialPhysicalStarts,4);
    assert.equal(process.env[key],'from-caller');
    assert.throws(()=>runProfile(true,()=>{throw new Error('native aborted');}),
      /native aborted/);
    assert.equal(process.env[key],'from-caller');
  }finally{
    if(old===undefined)delete process.env[key];
    else process.env[key]=old;
  }
});
