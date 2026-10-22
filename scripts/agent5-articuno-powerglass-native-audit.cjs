'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Compare all frozen development arms, retaining aborts, caps, actual starts
 * and each source-owned answer. This is an observational development parser.
 * @param {object} control Parsed full canonical runner control.
 * @param {object} treatment Same registered trial with opt-in policy.
 * @returns {object}
 */
function summarize(control,treatment){
  assert.equal(control?.rows?.length,4);
  assert.equal(treatment?.rows?.length,4);
  assert.equal(control.sourceFirstRetrospective,true);
  assert.equal(treatment.sourceFirstRetrospective,true);
  assert.equal(control.articunoPowerglassOptIn,false);
  assert.equal(treatment.articunoPowerglassOptIn,true);
  const byId=new Map(treatment.rows.map(row=>[row.trial.id,row]));
  assert.equal(byId.size,4);
  const pairs=control.rows.map(a=>{
    const b=byId.get(a.trial.id);
    assert.ok(b,'Missing registered native arm '+a.trial.id);
    assert.equal(b.trial.seed,a.trial.seed);
    assert.equal(b.trial.candidateId,a.trial.candidateId);
    assert.equal(b.trial.rank,a.trial.rank);
    if(a.sourceDealFingerprint&&b.sourceDealFingerprint){
      assert.equal(b.sourceDealFingerprint,a.sourceDealFingerprint,
        'Source physical deal changed in '+a.trial.id);
    }
    const selected=a.trial.rank===6&&
      a.trial.candidateId==='new-moon-lockbreaker-v1';
    const audit=b.articunoPowerglassAudit??null;
    const events=audit?.events??[];
    const sourceMoves=(row)=>row?.sourceAttackSettlement?.attacks??[];
    const attacks=(row)=>row?.candidateAttackSettlement?.attacks??[];
    return {
      id:a.trial.id,rank:a.trial.rank,selected,
      sourceFirstControl:a.sourceActuallyFirst??null,
      sourceFirstTreatment:b.sourceActuallyFirst??null,
      sourceDeal:a.sourceDealFingerprint??null,
      errorControl:a.status==='engine-error'?a.error:null,
      errorTreatment:b.status==='engine-error'?b.error:null,
      control:{finished:a.finished??false,winner:a.winner??null,
        prizes:a.finalPrizes??null,actions:a.actionCount??null,
        nativeRoots:a.rootActionCount??null,
        rootsSha:a.rootActionLedgerSha256??null,
        candidateAttacks:attacks(a).map(x=>({
          turn:x.turnBefore,attack:x.attackName})),
        sourceAttacks:sourceMoves(a).map(x=>({
          turn:x.turnBefore,attack:x.attackName}))},
      treatment:{finished:b.finished??false,winner:b.winner??null,
        prizes:b.finalPrizes??null,actions:b.actionCount??null,
        nativeRoots:b.rootActionCount??null,
        rootsSha:b.rootActionLedgerSha256??null,
        candidateAttacks:attacks(b).map(x=>({
          turn:x.turnBefore,attack:x.attackName})),
        sourceAttacks:sourceMoves(b).map(x=>({
          turn:x.turnBefore,attack:x.attackName}))},
      actionLedgerEqual:typeof a.rootActionLedgerSha256==='string'&&
        a.rootActionLedgerSha256===b.rootActionLedgerSha256,
      nativePolicyAudit:audit?{
        nativeRoots:audit.nativeRoots,searchPrompts:audit.searchPrompts,
        toolRoots:audit.toolRoots,energyPrompts:audit.energyPrompts,
        accepted:audit.accepted,
        confirmed:audit.physicalConfirmed,
        unconfirmed:audit.failedPhysical,gateSnapshots:audit.gateSnapshots??[],events
      }:null,
      candidateCompressorActions:(b.rootActionLedger??[]).filter(r=>
        r.playerSlot===b.candidateSeat&&
        r.action==='PlayCardAction'&&r.card==='Battle Compressor')
        .map(r=>({ordinal:r.actionOrdinal,turn:r.turnBefore})),
      candidatePowerglassActions:(b.rootActionLedger??[]).filter(r=>
        r.playerSlot===b.candidateSeat&&
        r.action==='PlayCardAction'&&r.card==='Powerglass')
        .map(r=>({ordinal:r.actionOrdinal,turn:r.turnBefore}))
    };
  });
  return {
    schema:'agent5-rank6-articuno-powerglass-native-paired-development-v1',
    observedArms:pairs.length,
    preregistration:'results/aichi-2026/registrations/agent5-rank6-powerglass-native-20261021.md',
    pairedPhysicalSeedsAndSourceDeals:true,
    allNonTargetActionLedgersUnchanged:pairs.filter(p=>!p.selected)
      .every(p=>p.actionLedgerEqual),
    selectedFork:pairs.find(p=>p.selected),
    pairs,
    competitiveQualifiedGames:0,
    caveat:'One historical retrospective deal; no source policy or paper clock certification'
  };
}

/**
 * Fail closed when a workflow silently follows a different owner policy or
 * its actor-only fork never reaches the registered physical T34 opportunity.
 * This is a fixed single-deal receipt, not a general competitive evaluator.
 * @param {object} paired Observational four-arm report.
 * @returns {object} Confirmed immutable native receipt.
 */
function verifyRegisteredT34(paired){
  assert.equal(paired.observedArms,4);
  assert.equal(paired.allNonTargetActionLedgersUnchanged,true,
    'Non-target root ledger changed under candidate-only treatment');
  assert.equal(paired.competitiveQualifiedGames,0);
  const s=paired.selectedFork;
  assert.equal(s?.id,
    '6:retrospective-sourcefirst:0:B:new-moon-lockbreaker-v1');
  assert.equal(s.sourceFirstControl,true);
  assert.equal(s.sourceFirstTreatment,true);
  assert.equal(s.sourceDeal,
    '14549caa34487d41ae4100c0c3542085d6fe57ed33b9d7da89b79bc55379b5de');
  assert.equal(s.control.rootsSha,
    '20203d34d1f9149f7229b147a4906e8a4a80b7192e129a293d68cdc69bfcb419',
    'Original archived T34 control trajectory not reproduced');
  assert.notEqual(s.treatment.rootsSha,s.control.rootsSha,
    'Actor policy proposed nothing and left original trajectory unchanged');
  const a=s.nativePolicyAudit;
  assert.ok(a,'Native owner-only treatment audit missing');
  assert.deepEqual([a.nativeRoots,a.searchPrompts,a.toolRoots,
    a.energyPrompts,a.accepted,a.confirmed,a.unconfirmed],
    [2,1,1,2,5,5,0],'Native Compressor Powerglass receipt incomplete');
  assert.deepEqual(a.events.map(e=>[e.kind,e.turn,e.physicallyConfirmed]),
    [['compressor',34,true],['search',34,true],['tool',34,true],
      ['endturn-energy',34,true],['endturn-energy',36,true]]);
  assert.deepEqual(a.events.find(e=>e.kind==='search')?.selected,
    ['Psychic Energy MEE','Psychic Energy MEE'],
    'Two genuine native owner-deck Basics not selected');
  assert.deepEqual(s.control.candidateAttacks
    .filter(e=>e.attack==='Psyray').map(e=>e.turn),[52,54,56]);
  assert.deepEqual(s.treatment.candidateAttacks
    .filter(e=>e.attack==='Psyray').map(e=>e.turn),[38,40,42]);
  assert.deepEqual([s.control.finished,s.treatment.finished],[true,true]);
  assert.deepEqual([s.control.winner,s.treatment.winner],[0,0]);
  assert.deepEqual([s.control.prizes,s.treatment.prizes],[[0,4],[0,4]]);
  return {
    label:'native-physical-T34-Compressor-Powerglass-confirmed',
    frozenControlRootSha256:s.control.rootsSha,
    treatmentRootSha256:s.treatment.rootsSha,
    nativeActionsAccepted:a.accepted,
    nativeActionsPhysicallyConfirmed:a.confirmed,
    firstPsyrayGlobalTurnControl:52,
    firstPsyrayGlobalTurnTreatment:38,
    competitiveQualifiedGames:0,
    terminalReversal:false
  };
}

if(require.main===module){
  assert.equal(process.argv.length,4,'Expected baseline and treatment filenames');
  const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
  const report=summarize(read(process.argv[2]),read(process.argv[3]));
  report.registeredT34Verification=verifyRegisteredT34(report);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}

module.exports={summarize,verifyRegisteredT34};
