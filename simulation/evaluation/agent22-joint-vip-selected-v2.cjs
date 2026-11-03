'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {classifyNativeAttempt}=require('./agent41-native-attempt-disposition.cjs');
const {auditSourceCopiedAttacks}=require('./agent22-source-copy-choice-audit.cjs');
const {inspectProfile,gitBlobSha}=require('./agent41-joint-source-r5-r11-v1.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG_PATH='simulation/evaluation/agent22-joint-vip-selected-v2.json';
const BASE_PATH='simulation/evaluation/agent41-joint-source-r5-r11-v1.json';
const ADAPTER='simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs';
const COPY_AUDIT='simulation/evaluation/agent22-source-copy-choice-audit.cjs';
const EXPECTED_REG_BLOB='fa9b84a8387e0cb2ec4a14b964aec674c9ce42be';
const EXPECTED_VIP_ADAPTER_BLOB='aeda10268b16d0fcb34a52856d0d5067f08fcdac';
const EXPECTED_COPY_AUDIT_BLOB='8ce6afee5f1f4af4d27e46348376b355e8855a2d';
const VIP_ENV='AGENT9_BATTLE_VIP_AFTER_PASS_DEV';
const RECEIPT_ENV='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
const OUTPUT=path.join(ROOT,'agent22-joint-vip-v2-output.json');

/** @param {string} rel @returns {Buffer} */
const bytes=rel=>fs.readFileSync(path.join(ROOT,rel));
/** @param {string} rel @returns {object} */
const parse=rel=>JSON.parse(bytes(rel).toString('utf8'));

/** Validate the already-committed source registration without requiring native engine startup. */
function validateRegistration(){
  assert.equal(gitBlobSha(bytes(REG_PATH)),EXPECTED_REG_BLOB);
  const m=parse(REG_PATH),base=parse(BASE_PATH);
  assert.equal(m.schema,'agent22-selected-joint-vip-v2');
  assert.equal(gitBlobSha(bytes(BASE_PATH)),m.baseProfileGitBlobSha);
  assert.equal(gitBlobSha(bytes(ADAPTER)),EXPECTED_VIP_ADAPTER_BLOB);
  assert.equal(gitBlobSha(bytes(COPY_AUDIT)),EXPECTED_COPY_AUDIT_BLOB);
  assert.equal(gitBlobSha(bytes('simulation/evaluation/agent41-bilateral-v2-development.cjs')),
    m.nativeRunnerBlobSha);
  assert.equal(gitBlobSha(bytes('results/aichi-2026/full-decklists.json')),
    m.printedOriginalRosterBlobSha);
  assert.equal(base.pinnedVendor,m.nativeVendorPin);
  assert.equal(m.cohorts.length,4);
  const groups=m.cohorts.flatMap(c=>c.groups);
  assert.equal(groups.length,m.registeredSourceGroups);
  assert.equal(m.cohorts.reduce((n,c)=>n+c.registeredTrials.length,0),
    m.registeredNativeAttempts);
  assert.deepEqual(m.candidateIds,['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(m.selectedPolicy.unconditionalQuickBallRoot,false);
  assert.equal(m.selectedPolicy.ownerSingleSearchPrompt,false);
  assert.equal(m.selectedPolicy.ownerHandDiscardPrompt,false);
  assert.equal(base.policyOptions.actorDceMewMobilityRoot,true);
  assert.equal(base.policyOptions.actorOnlySingleSearch,false);
  assert.equal(base.policyOptions.actorHandDiscard,false);
  assert.equal(base.policyOptions.actorOnlyComposition,true);
  assert.equal(base.policyOptions.sharedPaperPaymentPortfolio,true);
  assert.equal(base.policyOptions.paperQuickBallPayment,true);
  assert.equal(base.policyOptions.paperSecretBoxPayment,true);
  assert.equal(base.policyOptions.sourceScopedQuickBallRoot,false);
  assert.equal(base.policyOptions.candidateScopedQuickBallRoot,false);
  const ids=new Set();
  for(const cohort of m.cohorts){
    assert.equal(cohort.registeredTrials.length,2*cohort.groups.length);
    assert.equal(new Set(cohort.groups.map(g=>g.seed)).size,cohort.groups.length);
    for(const g of cohort.groups){
      assert.ok([5,6,11].includes(g.rank));
      assert.ok(['A','B'].includes(g.candidateSlot));
      assert.ok(Number.isSafeInteger(g.repeat)&&g.repeat>=0);
      assert.ok(Number.isSafeInteger(g.seed)&&g.seed>=0&&g.seed<=0xffffffff);
      for(const candidateId of m.candidateIds){
        const expected={...g,candidateId,
          id:[g.rank,g.repeat,g.candidateSlot,candidateId].join(':')};
        assert.ok(cohort.registeredTrials.some(t=>
          JSON.stringify(t)===JSON.stringify(expected)));
        const key=cohort.id+':'+expected.id;
        assert.ok(!ids.has(key)); ids.add(key);
      }
    }
  }
  assert.deepEqual(m.cohorts.map(c=>c.registeredTrials.length),[8,8,4,8]);
  const fresh=m.cohorts.find(c=>c.id==='fresh_heldout_four_groups');
  assert.equal(fresh.groups.length,4);
  const oldSeeds=new Set(m.cohorts.filter(c=>c!==fresh)
    .flatMap(c=>c.groups.map(g=>g.seed)));
  assert.ok(fresh.groups.every(g=>!oldSeeds.has(g.seed)));
  return {m,base};
}

/** Enable the one explicitly registered symmetric owner policy under exact restoration. */
function withSelectedEnvironment(callback){
  assert.equal(typeof callback,'function');
  const names=[RECEIPT_ENV,VIP_ENV];
  const previous=names.map(name=>process.env[name]);
  assert.ok(previous.every(x=>x===undefined),
    'Unregistered ambient source policy override');
  process.env[RECEIPT_ENV]='true';
  process.env[VIP_ENV]='true';
  try{return callback();}
  finally{for(let i=0;i<names.length;i++){
    if(previous[i]===undefined)delete process.env[names[i]];
    else process.env[names[i]]=previous[i];
  }}
}

/** Atomic, exclusive file output. Writes a checkpoint after every cohort, including failed cohorts.
 * @param {object} data
 */
function save(data){
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const descriptor=fs.openSync(temp,'r');
    try{fs.fsyncSync(descriptor);}finally{fs.closeSync(descriptor);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

/** Read actual original-Store outcomes without promoting native accepted actions to paper qualification.
 * @param {object} row
 * @returns {object}
 */
function summarizeRow(row){
  const disposition=classifyNativeAttempt(row);
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const sourceSeat=row.sourceSeat;
  const srcRoots=roots.filter(r=>r.playerSlot===sourceSeat&&r.pendingPrompt===null);
  const copy=Array.isArray(row.sourceAttackSettlement?.attacks)?
    auditSourceCopiedAttacks(row):null;
  const nativeSourceAttacks=row.sourceAttackSettlement?.attacks??[];
  const replyRows=row.candidateRepliesAfterSourceAttacks??[];
  return {
    id:row.trial?.id??null,rank:row.trial?.rank??null,
    candidate:row.trial?.candidateId??null,candidateSlot:row.trial?.candidateSlot??null,
    sourceSeat,actualStarterSeat:row.actualStarterSeat??null,
    verifiedFirstTurn:row.verifiedFirstTurn??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    disposition:disposition.kind,
    rootLedgerDigest:row.rootActionLedgerSha256??null,
    originalSourceRootActions:srcRoots.length,
    originalSourceFirstOwnHand:row.sourceFirstOwnedAffordances??null,
    sourceBattleVipRootCount:srcRoots.filter(r=>r.action==='PlayCardAction'&&
      typeof r.card==='string'&&r.card.startsWith('Battle VIP Pass')).length,
    sourceBoostShakeRootCount:srcRoots.filter(r=>r.action==='AttackAction'&&
      r.attack==='Boost Shake').length,
    sourcePaidRetreatRootCount:srcRoots.filter(r=>r.action==='RetreatAction').length,
    sourceAttackRecords:nativeSourceAttacks.map(a=>({
      ordinal:a.actionOrdinal,turn:a.turnBefore,attack:a.attackName,
      settled:a.settledPromptChain===true&&a.settlementCrossesClockReset!==true,
      prizesBefore:a.prizesBefore??null,prizesAfter:a.prizesAfter??null,
      nextRoot:a.nextSourceRoot??null
    })),
    copiedAttackChoices:copy,
    sourceNextCandidateResponses:replyRows,
    originalSourceOwnerVipAudit:
      row.actorOnlyDecisionCoverage?.detailedComponentAudits?.ownerVipAfterPass??null,
    sourcePrinted60Audit:row.sourceOriginalPrintings??null,
    paperEffectVerified:false,opponentCompetent:false,
    officialClockVerified:false,competitiveQualified:false
  };
}

/** Respect source physical-deal identity independently of integer seed identity.
 * @param {object} cohort
 * @param {object[]} compact
 * @returns {object[]}
 */
function physicalPairs(cohort,compact){
  return cohort.groups.map(group=>{
    const current=cohort.registeredTrials.filter(t=>
      t.rank===group.rank&&t.repeat===group.repeat&&
      t.candidateSlot===group.candidateSlot);
    const match=current.map(t=>compact.find(x=>x.id===t.id)??null);
    const sameSource=match.every(x=>typeof x?.sourceDealFingerprint==='string'&&
      x.sourceDealFingerprint.length>0)&&
      match[0].sourceDealFingerprint===match[1].sourceDealFingerprint;
    return {group,ids:current.map(x=>x.id),
      physicalSourcePairStatus:sameSource?'EXACT_SOURCE_DEAL_MATCH':'UNVERIFIED_OR_DIFFERENT',
      verifiedStarterSame:match.every(x=>x?.verifiedFirstTurn===true)&&
        match[0].actualStarterSeat===match[1].actualStarterSeat,
      observedFingerprints:match.map(x=>x?.sourceDealFingerprint??null),
      trialDispositions:match.map(x=>x?.disposition??'NO_ROW')};
  });
}

/** Run exactly the preregistered selected 92-option+VIP policy, with complete disposition retention.
 * @param {Function} run
 * @returns {object}
 */
function runSelected(run=require('./agent41-bilateral-v2-development.cjs').runDevelopment){
  const {m,base}=validateRegistration();
  const checked=inspectProfile();
  assert.equal(checked.profileGitBlob,m.baseProfileGitBlobSha);
  const illegalAmbient=Object.keys(process.env).filter(k=>
    /^(AGENT[0-9]+_|AICHI_|TWINLEAF_|PAPER_)/.test(k));
  assert.deepEqual(illegalAmbient,[]);
  const packet={schema:'agent22-selected-joint-vip-native-results-v2',
    preregistrationBlobSha:EXPECTED_REG_BLOB,
    nativeVendorPin:m.nativeVendorPin,selectedPolicy:m.selectedPolicy,
    attempted:0,expectedAttempts:m.registeredNativeAttempts,
    cohorts:[],allErrorsAndCensorsRetained:true,
    independentProspectivePhysicalGroups:4,
    competitiveQualifiedGames:0,paperGameQualified:false,
    tournamentClockQualified:false};
  for(const cohort of m.cohorts){
    let completed;
    try{
      const frame='agent22-joint-vip-v2-'+cohort.id;
      const raw=withSelectedEnvironment(()=>run({
        ...base.policyOptions,registeredFrameName:frame,
        registeredTrials:cohort.registeredTrials
      }));
      assert.ok(Array.isArray(raw.rows),'No native row array');
      assert.deepEqual(raw.rows.map(r=>r.trial?.id),
        cohort.registeredTrials.map(t=>t.id));
      const compact=raw.rows.map(summarizeRow);
      completed={cohortId:cohort.id,classification:cohort.classification,
        registeredTrials:cohort.registeredTrials,
        attempted:raw.rows.length,compact,
        physicalPairs:physicalPairs(cohort,compact),raw,
        competitiveQualifiedGames:0};
    }catch(error){
      completed={cohortId:cohort.id,classification:cohort.classification,
        registeredTrials:cohort.registeredTrials,
        attempted:cohort.registeredTrials.length,error:String(error?.stack??error),
        disposition:'COHORT_EXECUTION_ERROR',
        perTrialUnresolved:cohort.registeredTrials.map(t=>({
          id:t.id,status:'NATIVE_NOT_OBSERVED_AFTER_EXCEPTION'})),
        competitiveQualifiedGames:0};
    }
    packet.cohorts.push(completed);
    packet.attempted+=completed.attempted;
    save(packet);
    process.stdout.write(JSON.stringify({cohort:cohort.id,
      attempted:completed.attempted,error:completed.error??null,
      copies:completed.compact?.reduce((n,x)=>
        n+(x.copiedAttackChoices?.selectedGenesectTechnoBlast??0),0)??null,
      physicalPairs:completed.physicalPairs?.map(p=>
        p.physicalSourcePairStatus)??null})+'\n');
  }
  assert.equal(packet.attempted,m.registeredNativeAttempts);
  assert.ok(packet.cohorts.every(c=>!c.error),
    'Selected release had a retained whole-cohort native failure');
  assert.ok(packet.cohorts.every(c=>c.physicalPairs.every(p=>
    p.physicalSourcePairStatus==='EXACT_SOURCE_DEAL_MATCH')),
    'Some original-source cross-candidate physical pair is unverified');
  return packet;
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {m}=validateRegistration();
    process.stdout.write(JSON.stringify({registered:m.registeredNativeAttempts,
      cohorts:m.cohorts.map(x=>x.id),selected:m.selectedPolicy,
      competitiveQualifiedGames:0})+'\n');
  }else runSelected();
}
module.exports={validateRegistration,withSelectedEnvironment,
  summarizeRow,physicalPairs,runSelected};
