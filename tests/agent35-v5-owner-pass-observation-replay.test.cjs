'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {collect,run,writeReceipt,VERSION}=
  require('../simulation/evaluation/agent35-v5-owner-pass-observation-replay.cjs');
const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');
const ids=[
  '6:100:A:champion-reference',
  '6:100:A:new-moon-lockbreaker-v1',
  '6:101:B:champion-reference',
  '6:101:B:new-moon-lockbreaker-v1',
  '11:102:A:champion-reference',
  '11:102:A:new-moon-lockbreaker-v1',
  '11:103:B:champion-reference',
  '11:103:B:new-moon-lockbreaker-v1'
];

/** Build synthetic Store action tapes, with fictional owner-private receipts. */
function fixture(){
  const locked={
    schema:'agent35-issue25-v5-eight-physical-replay-readonly-v1',
    twinleafPin:'fixture-pin',rawActionCap:48,
    expectedOriginalSourcePassCount:0,allEightOriginalRows:[]
  };
  const pair={selectedRootCount:2,roots:[]};
  const rows=[];
  for(const [i,id] of ids.entries()){
    const slot=id.split(':')[2];
    const sourceSeat=slot==='A'?1:0;
    const aborted=i===5;
    const count=aborted?14:48;
    const passOrdinals=aborted?[]:i<5?[11,17,22,29,37]:[11,17,29,37];
    const roots=Array.from({length:count},(_,actionOrdinal)=>({
      actionOrdinal,playerSlot:sourceSeat,turnBefore:1+Math.floor(actionOrdinal/5),
      action:'ResolvePromptAction',pendingPrompt:'WaitPrompt'
    }));
    for(const ordinal of passOrdinals){
      roots[ordinal].action='PassTurnAction';
      roots[ordinal].pendingPrompt=null;
    }
    if(i===2){
      roots[17].turnBefore=2;
      roots[14]={actionOrdinal:14,playerSlot:1,turnBefore:1,
        action:'PassTurnAction',pendingPrompt:null};
      roots[20]={actionOrdinal:20,playerSlot:1,turnBefore:3,
        action:'PlayCardAction',card:'Psychic Energy',pendingPrompt:null};
    }
    if(i===4){
      roots[37].turnBefore=8;
      roots[36]={actionOrdinal:36,playerSlot:1,turnBefore:8,
        action:'PlayCardAction',card:'Squawkabilly ex',pendingPrompt:null};
      roots[41]={actionOrdinal:41,playerSlot:0,turnBefore:9,
        action:'AttackAction',attack:'Eon Blade',pendingPrompt:null};
    }
    const actualSourcePassCount=roots.filter(r=>
      r.playerSlot===sourceSeat&&r.action==='PassTurnAction').length;
    locked.expectedOriginalSourcePassCount+=actualSourcePassCount;
    const wholeDealSha256=digest(['fixture-whole',id]);
    const sourceDealSha256=digest(['fixture-source',id]);
    const rootLedgerSha256=digest(roots);
    locked.allEightOriginalRows.push({id,rootLedgerSha256,
      wholeDealSha256,sourceDealSha256,acceptedRoots:count,
      status:aborted?'engine-error':'root-cap-censored',
      reportedSourceSeat:aborted?null:sourceSeat});
    const receipts=roots.filter(r=>r.action==='PassTurnAction').map(r=>{
      const ownHand=['FIXTURE-ONLY HAND FOR '+r.playerSlot];
      const board=[{active:{name:'fixture-P0'}},
        {active:{name:'fixture-P1'}}];
      return {actionOrdinal:r.actionOrdinal,turn:r.turnBefore,
        actorSeat:r.playerSlot,role:r.playerSlot===sourceSeat?
          'source':'candidate',ownerHandAtChosenPass:ownHand,
        publicBoardBeforePass:board,
        ownerHandSha256:digest(ownHand),publicBoardSha256:digest(board),
        paperQualified:false};
    });
    rows.push({trial:{id},sourceSeat:aborted?null:sourceSeat,
      candidateSeat:aborted?null:1-sourceSeat,finished:false,
      rootActionLedger:roots,
      sourceDealFingerprint:sourceDealSha256,
      fullPhysicalDealFingerprint:wholeDealSha256,
      nativeAllOwnerPassFrontier:aborted?null:{
        completeNativePassCoverage:true,sourceSeat,trialId:id,
        counts:{candidate:{passes:receipts.filter(r=>r.role==='candidate').length}},
        receipts
      }});
    if(i===2||i===4){
      const ordinal=i===2?17:37;
      pair.roots.push({id,sourceSeat,passRootOrdinal:ordinal,
        turn:i===2?2:8,fullPhysicalDealFingerprint:wholeDealSha256,
        sourceDealFingerprint:sourceDealSha256,
        originalAcceptedRootLedgerSha256:rootLedgerSha256});
    }
  }
  return {locked,pair,execution:{
    manifest:{observedTwinleafGitCommit:locked.twinleafPin,
      actualRunnerConfirmedOption:true,releaseQualified:false},
    rawDevelopment:{nativeAllOwnerPassFrontierOptIn:true,rows}
  }};
}

test('all eight fixture rows yield exact owned Pass and public board packets',()=>{
  assert.equal(VERSION,'agent35-v5-all-eight-owner-pass-observation-readonly-v1');
  const a=fixture();
  const r=collect(a.execution,a.locked,a.pair);
  assert.equal(r.exactInitialFullDealAndRootTapeMatches,8);
  assert.equal(r.nativeErrors,1);
  assert.equal(r.censoredArms,7);
  assert.equal(r.allOriginalSourcePasses,a.locked.expectedOriginalSourcePassCount);
  assert.equal(r.originalSourcePassesWithOwnedHandAndPublicBoard,
    a.locked.expectedOriginalSourcePassCount);
  assert.deepEqual(r.selectedAnchors.map(x=>x.registeredOrdinal),[17,37]);
  assert.equal(r.sourcePayableActionsDemonstrated,0);
  assert.equal(r.competitiveGamesQualified,0);
  assert.equal(r.nativeLivePrePolicyStatePreservationUnverified,true);
  assert.ok(r.selectedAnchors[0].ownerHandAtChosenPass[0].startsWith('FIXTURE-ONLY'));
});

test('read-only selected runner adds the actual native owner Pass flag once',()=>{
  const a=fixture();
  let called=0;
  const r=run({locked:a.locked,pair:a.pair,
    runV5:({runner})=>runner({nativeRootActionLimit:48}),
    runner:options=>{
      called++;
      assert.equal(options.nativeAllOwnerPassFrontier,true);
      assert.equal(options.nativeRootActionLimit,48);
      return a.execution;
    }});
  assert.equal(called,1);
  assert.equal(r.selectedAnchors.length,2);
});

test('changed actual root, deal, hand, perspective or observer gate fails closed',()=>{
  const changes=[
    a=>{a.execution.rawDevelopment.rows[0].rootActionLedger[0].action='AttackAction';},
    a=>{a.execution.rawDevelopment.rows[0].sourceDealFingerprint='altered';},
    a=>{a.execution.rawDevelopment.rows[0].fullPhysicalDealFingerprint='altered';},
    a=>{a.execution.rawDevelopment.rows[0].nativeAllOwnerPassFrontier.receipts.pop();},
    a=>{a.execution.rawDevelopment.rows[0].nativeAllOwnerPassFrontier.receipts[0]
      .ownerHandSha256='altered';},
    a=>{a.execution.rawDevelopment.rows[0].nativeAllOwnerPassFrontier.receipts[0]
      .actorSeat=1-a.execution.rawDevelopment.rows[0].sourceSeat;},
    a=>{a.execution.rawDevelopment.rows[0].nativeAllOwnerPassFrontier=null;},
    a=>{a.execution.rawDevelopment.rows[0].finished=true;},
    a=>{a.execution.rawDevelopment.nativeAllOwnerPassFrontierOptIn=false;},
    a=>{a.execution.manifest.observedTwinleafGitCommit='altered';},
    a=>{a.execution.rawDevelopment.rows.pop();}
  ];
  for(const change of changes){
    const a=fixture();change(a);
    assert.throws(()=>collect(a.execution,a.locked,a.pair));
  }
});

test('locked receipt writer replaces atomically and refuses a held lock',()=>{
  const a=fixture();
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'agent35-owner-pass-'));
  const filename=path.join(folder,'receipt.json');
  try{
    const status=writeReceipt(filename,collect(a.execution,a.locked,a.pair));
    assert.equal(status.sha256,createHash('sha256')
      .update(fs.readFileSync(filename)).digest('hex'));
    assert.equal(JSON.parse(fs.readFileSync(filename,'utf8')).schema,VERSION);
    const fd=fs.openSync(filename+'.lock','wx');
    try{assert.throws(()=>writeReceipt(filename,collect(a.execution,a.locked,a.pair)));}
    finally{fs.closeSync(fd);fs.unlinkSync(filename+'.lock');}
  }finally{fs.rmSync(folder,{recursive:true,force:true});}
});
