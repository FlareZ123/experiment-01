'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {rootDigest,screenArchivedReciprocalAttempts}=
  require('../simulation/evaluation/agent45-bilateral-competence-gate.cjs');
const {
  VERSION,ROOT_LIMIT,trials,sourceNameCountSha256,candidatePrinted60Sha256,
  projectCandidateRepliesAfterSourceAttacks,postPrizeSourceAttackOrdinals,
  projectPostPrizeOwnerDecisionAudit,summarizeNativeAttempt,toGateAttempt,
  evaluateGate,writeJsonAtomic,requireOneNativeDevelopmentRow
}=require('../simulation/evaluation/agent36-issue25-common-v9-bilateral-competence.cjs');

test('v9 is exactly one frozen rank11/New Moon natural-game registration',()=>{
  const registered=trials();
  assert.equal(VERSION,'agent36-issue25-common-v9-bilateral-competence-probe-v1');
  assert.equal(ROOT_LIMIT,260);
  assert.equal(registered.length,1);
  assert.deepEqual(registered[0],{
    id:'11:1000:B:new-moon-lockbreaker-v1',
    rank:11,repeat:1000,candidateSlot:'B',
    candidateId:'new-moon-lockbreaker-v1',seed:626469135,
    seedSource:'Python secrets.randbits(32), executed before registration freeze'
  });
  assert.equal(sourceNameCountSha256().length,64);
  assert.equal(candidatePrinted60Sha256().length,64);
});

test('owner post-source reply projection excludes unlisted and opponent-hidden fields',()=>{
  const row={
    candidateSeat:1,
    rootActionLedger:Array.from({length:33},(_,i)=>({
      actionOrdinal:51+i,playerSlot:1,turnBefore:8,
      pendingPrompt:null,action:'PlayCardAction'
    })),
    candidateRepliesAfterSourceAttacks:[{
      sourceAttackOrdinal:46,sourceTurn:7,sourceAttackName:'Psychic',
      sameEpochCandidateReplyVerified:true,candidateReplyOrdinal:51,
      candidateReplyTurn:8,candidateReplyAction:'PassTurnAction',
      status:'candidate-passed',caveat:'owner-only aftergame evidence',
      ownerHandAfterDecision:['Psychic Energy','Marnie'],
      publicBoardBeforePass:{active:'Mewtwo & Mew-GX'},
      printedBasicEnergyBeforePass:1,
      postChoiceAttackProbe:{
        validAttackNames:['Miraculous Duo'],
        rejection:'hidden card name in native exception'
      },
      clonedHeldTelepathActiveAttachment:{
        nativeAccepted:false,nativeRejection:'another hidden card name'
      },
      candidateReplyTurnRootSequence:Array.from({length:32},(_,i)=>({
        ordinal:51+i,action:'PlayCardAction'
      })),
      candidateReplyTurnFinalPass:{
        ordinal:83,ownerHandAfterDecision:['Marnie'],
        postChoiceAttackProbe:{auditError:'hidden identity in nested error'}
      },
      opponentHand:['hidden card must not be copied'],
      privateOpponentDeck:['must not be copied']
    }]
  };
  const [reply]=projectCandidateRepliesAfterSourceAttacks(row);
  assert.equal(reply.sourceAttackOrdinal,46);
  assert.equal(reply.sameEpochCandidateReplyVerified,true);
  assert.deepEqual(reply.ownerHandAfterDecision,['Psychic Energy','Marnie']);
  assert.equal(Object.hasOwn(reply,'opponentHand'),false);
  assert.equal(Object.hasOwn(reply,'privateOpponentDeck'),false);
  assert.equal(reply.rootSequenceExpectedCount,33);
  assert.equal(reply.rootSequenceObservedCount,32);
  assert.equal(reply.rootSequenceTruncated,true);
  assert.equal(reply.postChoiceAttackProbe.rejectionPresent,true);
  assert.equal(Object.hasOwn(reply.postChoiceAttackProbe,'rejection'),false);
  assert.equal(reply.clonedHeldTelepathActiveAttachment.nativeRejectionPresent,true);
  assert.equal(Object.hasOwn(reply.clonedHeldTelepathActiveAttachment,
    'nativeRejection'),false);
  assert.equal(reply.candidateReplyTurnFinalPass.postChoiceAttackProbe
    .auditErrorPresent,true);
});

test('post-Prize audit keeps only source attacks with a verified Prize-count decrease',()=>{
  const row={
    sourceSeat:0,
    sourceAttackSettlement:{attacks:[
      {actionOrdinal:46,prizesBefore:[6,6],prizesAfter:[5,6]},
      {actionOrdinal:55,prizesBefore:[5,6],prizesAfter:[5,6]},
      {actionOrdinal:70,prizesBefore:[5,6],prizesAfter:[4,6]}
    ]},
    candidateRepliesAfterSourceAttacks:[
      {sourceAttackOrdinal:46,status:'candidate-passed'},
      {sourceAttackOrdinal:55,status:'candidate-other-action'},
      {sourceAttackOrdinal:70,status:'candidate-passed'}
    ]
  };
  assert.deepEqual(postPrizeSourceAttackOrdinals(row),[46,70]);
  assert.deepEqual(projectPostPrizeOwnerDecisionAudit(row).map(x=>
    x.sourceAttackOrdinal),[46,70]);
});

test('native attempt projection binds the complete root tape to Agent45 gate inputs',()=>{
  const roots=[
    {actionOrdinal:0,playerSlot:0,turnBefore:1,action:'PlayCardAction'},
    {actionOrdinal:1,playerSlot:1,turnBefore:1,action:'PlayCardAction'},
    {actionOrdinal:2,playerSlot:1,turnBefore:1,action:'PassTurnAction'}
  ];
  const row=summarizeNativeAttempt({
    id:'11:1000:B:new-moon-lockbreaker-v1',
    rank:11,repeat:1000,candidateSlot:'B',
    candidateId:'new-moon-lockbreaker-v1',seed:626469135,
    sourceSeat:0,candidateSeat:1,actualStarterSeat:1,
    sourceDealFingerprint:'a'.repeat(64),
    fullPhysicalDealFingerprint:'b'.repeat(64),
    rootActionCount:3,rootActionLedger:roots,
    rootActionLedgerSha256:rootDigest(roots),
    finished:true,winner:1,endReason:'prizes',finalPrizes:[6,0],
    sourceAttackSettlement:{attacks:[]},
    candidateRepliesAfterSourceAttacks:[]
  });
  assert.equal(row.nativeOutcome,'native-terminal');
  assert.equal(row.publicRootActionsTruncated,false);
  assert.equal(row.publicRootActionCount,3);
  assert.equal(row.publicRootLedgerSha256Computed,rootDigest(roots));
  assert.equal(row.publicRootLedgerSha256Reported,rootDigest(roots));
  const attempt=toGateAttempt(row);
  assert.equal(attempt.originalSourceSeat,0);
  assert.equal(attempt.candidateSeat,1);
  assert.deepEqual(attempt.publicRootActions,roots);
  const screen=screenArchivedReciprocalAttempts({attempts:[attempt]});
  assert.equal(screen.verifiedRootLedgerContexts,1);
  assert.equal(screen.quarantinedContexts,0);
  assert.equal(screen.competitiveGamesQualified,0);
});

test('Agent45 structural evaluation never admits this one-game probe',()=>{
  const roots=[
    {actionOrdinal:0,playerSlot:0,turnBefore:1,action:'PlayCardAction'},
    {actionOrdinal:1,playerSlot:1,turnBefore:1,action:'PlayCardAction'},
    {actionOrdinal:2,playerSlot:1,turnBefore:1,action:'PassTurnAction'}
  ];
  const row=summarizeNativeAttempt({
    id:'11:1000:B:new-moon-lockbreaker-v1',
    rank:11,repeat:1000,candidateSlot:'B',
    candidateId:'new-moon-lockbreaker-v1',seed:626469135,
    sourceSeat:0,candidateSeat:1,actualStarterSeat:1,
    sourceDealFingerprint:'a'.repeat(64),
    fullPhysicalDealFingerprint:'b'.repeat(64),
    rootActionCount:3,rootActionLedger:roots,
    rootActionLedgerSha256:rootDigest(roots),
    finished:true,winner:1,endReason:'prizes',finalPrizes:[6,0],
    sourceAttackSettlement:{attacks:[]}
  });
  const result=evaluateGate(row,{
    vendorPin:'c'.repeat(40),
    researchRevision:'d'.repeat(40),
    hookHash:'e'.repeat(64),
    policyHash:'f'.repeat(64),
    candidatePrinted60Sha256:'1'.repeat(64)
  });
  assert.equal(result.structuralGatePassed,false);
  assert.equal(result.competitiveAdmission,false);
});

test('artifact JSON replacement uses an exclusive lock and removes temporary files',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent36-v9-'));
  const output=path.join(dir,'nested','result.json');
  try {
    writeJsonAtomic(output,{version:VERSION,trialCount:1});
    assert.deepEqual(JSON.parse(fs.readFileSync(output,'utf8')),{
      version:VERSION,trialCount:1
    });
    assert.equal(fs.existsSync(output+'.lock'),false);
    assert.equal(fs.readdirSync(path.dirname(output)).some(name=>
      name.endsWith('.tmp')),false);
  } finally {
    fs.rmSync(dir,{recursive:true,force:true});
  }
});

test('selected-layer swallowed exception writes a protected zero-game diagnostic',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent13-v9-preflight-'));
  const output=path.join(dir,'native','diagnostic.json');
  const metadata={researchRevision:'a'.repeat(40),
    vendorPin:'b'.repeat(40),hookHash:'c'.repeat(64)};
  try {
    const selected={manifest:{version:'common-v0'},rawDevelopment:null,
      diagnostic:{thrownCode:'UNRESOLVED_OWNER_PROMPT',
        thrownMessage:'native fallback rejected a selected mandatory action',
        attemptedRows:[],audit:{nativeRawStateQuarantine:{fallbackCalls:1}}}};
    assert.throws(()=>requireOneNativeDevelopmentRow(
      selected,output,metadata),/swallowedCode=UNRESOLVED_OWNER_PROMPT/);
    const failure=JSON.parse(fs.readFileSync(output,'utf8'));
    assert.equal(failure.disposition,'NO_USABLE_NATIVE_GAME_ROW');
    assert.equal(failure.originalNativeRowCount,null);
    assert.equal(failure.selectedPolicyDiagnostic.thrownCode,
      'UNRESOLVED_OWNER_PROMPT');
    assert.deepEqual(failure.registeredTrialIds,
      ['11:1000:B:new-moon-lockbreaker-v1']);
    assert.equal(failure.competitiveGamesQualified,0);
    assert.equal(failure.certifiedPaperGame,false);
    assert.equal(failure.estimatedWinRate,null);
    assert.equal(fs.existsSync(output+'.lock'),false);
    const one={rows:[{id:'real-one-game'}]};
    assert.equal(requireOneNativeDevelopmentRow(
      {rawDevelopment:one},path.join(dir,'no-artifact.json'),metadata),one);
    assert.equal(fs.existsSync(path.join(dir,'no-artifact.json')),false);
  } finally {
    fs.rmSync(dir,{recursive:true,force:true});
  }
});

test('zero or multiple selected native rows cannot be silently admitted',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent13-v9-cardinality-'));
  const metadata={researchRevision:'a'.repeat(40),
    vendorPin:'b'.repeat(40),hookHash:'c'.repeat(64)};
  try {
    for(const n of [0,2]){
      const output=path.join(dir,'receipt-'+n+'.json');
      assert.throws(()=>requireOneNativeDevelopmentRow({
        rawDevelopment:{rows:Array.from({length:n},(_,i)=>({id:i}))},
        diagnostic:{thrownCode:null}
      },output,metadata),/expected exactly 1/);
      const result=JSON.parse(fs.readFileSync(output,'utf8'));
      assert.equal(result.originalNativeRowCount,n);
      assert.equal(result.competitiveGamesQualified,0);
    }
  } finally {
    fs.rmSync(dir,{recursive:true,force:true});
  }
});
