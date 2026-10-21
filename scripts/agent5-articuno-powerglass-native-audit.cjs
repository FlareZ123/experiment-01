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

if(require.main===module){
  assert.equal(process.argv.length,4,'Expected baseline and treatment filenames');
  const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
  process.stdout.write(JSON.stringify(summarize(
    read(process.argv[2]),read(process.argv[3])),null,2)+'\n');
}

module.exports={summarize};
