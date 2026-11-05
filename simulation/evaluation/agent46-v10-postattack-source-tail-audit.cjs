'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent46-original-rank6-v10-postattack-source-turn-tail-audit-v1';
const TARGETS=Object.freeze({
  '6:101:B:champion-reference':{dceRoot:29,attackRoot:31},
  '6:101:B:new-moon-lockbreaker-v1':{dceRoot:36,attackRoot:38}
});
const sha=b=>createHash('sha256').update(b).digest('hex');
const ROOT=path.resolve(__dirname,'../..');

/**
 * Load a historical byte-for-byte archived native receipt with its atomic
 * sidecar; no Twinleaf imports, policy hooks, new simulations or mutations.
 *
 * @param {string} dir Filesystem directory.
 * @param {'control'|'treatment'} arm
 * @returns {{data:object,bytes:number,digest:string}}
 */
function loadArchived(dir,arm){
  const file=arm+'-complete.json';
  const bytes=fs.readFileSync(path.join(dir,file));
  assert.ok(bytes.length>100&&bytes.length<8*1024*1024,
    'Unexpected archival size: '+file);
  const digest=sha(bytes);
  assert.equal(fs.readFileSync(path.join(dir,file+'.sha256'),'utf8'),
    digest+'  '+file+'\n',file+': detached checksum mismatch');
  return {data:JSON.parse(bytes.toString('utf8')),
    bytes:bytes.length,digest};
}

/**
 * Inspect both already executed native Store tapes. A missing next source
 * turn is a censored observation, not a missed playable action. No private
 * owner hand or opponent concealed card identity is reconstructed.
 *
 * @param {object} control Archived Agent1 public native receipt.
 * @param {object} treatment Archived Agent1 public native receipt.
 * @returns {object} Frozen same-deal matched conditional next-turn census.
 */
function audit(control,treatment){
  const expectedSchema='agent1-issue25-joined-v4-public-execution-receipt-v1';
  assert.equal(control.schema,expectedSchema);
  assert.equal(treatment.schema,expectedSchema);
  const original=control.attempts;
  const later=treatment.attempts;
  assert.ok(Array.isArray(original)&&Array.isArray(later));
  assert.equal(original.length,8);
  assert.equal(later.length,8);
  const ids=original.map(r=>r.id);
  assert.equal(new Set(ids).size,8);
  assert.deepEqual([...ids].sort(),
    [...treatment.registration.expectedIds].sort());
  assert.deepEqual([...ids].sort(),
    [...control.registration.expectedIds].sort());
  assert.equal(new Set(later.map(r=>r.id)).size,8);
  const byId=new Map(original.map(r=>[r.id,r]));
  let exactFullPhysicalStarts=0,nonTargetUnchanged=0;
  const rows=[];
  for(const current of later){
    const baseline=byId.get(current.id);
    assert.ok(baseline,'V10 treatment lacks same-ID control '+current.id);
    assert.equal(current.sourceDealFingerprint,
      baseline.sourceDealFingerprint,current.id+': source deal changed');
    assert.equal(current.fullPhysicalDealFingerprint,
      baseline.fullPhysicalDealFingerprint,current.id+': full deal changed');
    exactFullPhysicalStarts++;
    const oldRoots=baseline.publicRootActions;
    const roots=current.publicRootActions;
    for(const [label,row,tape] of [['control',baseline,oldRoots],
      ['treatment',current,roots]]){
      assert.ok(Array.isArray(tape) &&
        row.publicRootActionsTruncated===false,
        current.id+': '+label+' truncated');
      assert.equal(row.publicRootActionCount,tape.length,
        current.id+': '+label+' count');
      assert.equal(row.publicRootLedgerSha256Computed,
        sha(Buffer.from(JSON.stringify(tape))),
        current.id+': '+label+' computed ledger mismatch');
      if(row.publicRootLedgerSha256Reported!==null)
        assert.equal(row.publicRootLedgerSha256Reported,
          row.publicRootLedgerSha256Computed,
          current.id+': '+label+' reported ledger mismatch');
    }
    const spec=TARGETS[current.id];
    if(!spec){
      assert.equal(JSON.stringify(roots),JSON.stringify(oldRoots),
        current.id+': non-target actual source root history mutated');
      nonTargetUnchanged++;
      rows.push({id:current.id,sourceSeat:current.originalSourceSeat,
        controlDisposition:baseline.status,treatmentDisposition:current.status,
        targeted:false,actualNativeSourceAttacks:current.
          actualSourceAttackSettlement?.declarations??null,
        nextSourceVoluntaryTurnObserved:null,
        unqualified:true});
      continue;
    }
    assert.equal(current.originalSourceSeat,0);
    assert.equal(JSON.stringify(roots.filter(r=>
      r.actionOrdinal<=spec.dceRoot)),
      JSON.stringify(oldRoots.filter(r=>
      r.actionOrdinal<=spec.dceRoot)),
      current.id+': original paid-DCE accepted root prefix changed');
    const attackRoot=roots.find(r=>r.actionOrdinal===spec.attackRoot);
    assert.equal(attackRoot?.action,'AttackAction',
      current.id+': registered Volt Cyclone native attack absent');
    assert.equal(attackRoot?.playerSlot,0);
    const sourceAttacks=current.actualSourceAttackSettlement?.attacks??[];
    const attack=sourceAttacks.find(x=>
      x.actionOrdinal===spec.attackRoot&&x.attackName==='Volt Cyclone');
    assert.ok(attack,current.id+': native settlement missing');
    assert.equal(attack.settledPromptChain,true);
    assert.equal(attack.nextSourceSameEpochProven,true);
    assert.equal(attack.nextSourceRoot?.action,'PlayCardAction');
    const candidateFirstRoot=attack.nextSourceRoot.ordinal;
    const laterSourceRoots=roots.filter(r=>
      r.actionOrdinal>candidateFirstRoot&&r.playerSlot===0&&
      r.turnBefore>=attackRoot.turnBefore+2);
    const nativeResets=roots.filter(r=>
      r.actionOrdinal>=spec.attackRoot &&
      Number.isSafeInteger(r.turnAfter)&&
      r.turnAfter<r.turnBefore);
    const sourceVoluntary=laterSourceRoots.filter(r=>
      r.action!=='ResolvePromptAction');
    // Root actions may be capped at 48 before a next source opportunity.
    // Even a physical observed Pass is not evidence of a better legal action.
    rows.push({id:current.id,sourceSeat:0,targeted:true,
      originalSourceDceOrdinal:spec.dceRoot,
      originalSourceControlPassOrdinal:spec.dceRoot+1,
      actualAttackRootOrdinal:spec.attackRoot,
      attackSettledOrdinal:attack.completionRootOrdinal,
      attackDamageRecipient:attack.publicBoardAfter?.[1]?.active?.name??null,
      actualSameEpochOpponentResponseRoot:candidateFirstRoot,
      candidateFirstAction:attack.nextSourceRoot.action,
      ownLaterSourceTurnRoots:latterSourceRootSummary(laterSourceRoots),
      ownLaterSourceVoluntaryActions:latterSourceRootSummary(sourceVoluntary),
      nextSourceVoluntaryTurnObserved:sourceVoluntary.length>0,
      nativeClockResetAfterAttack:nativeResets.length>0,
      treatmentRoots:roots.length,controlRoots:oldRoots.length,
      treatmentDisposition:current.status,controlDisposition:baseline.status,
      evidenceLimit:'Public actual Store roots only; owner-hand decisions, full game and paper opportunity not certified',
      unqualified:true});
  }
  const targets=rows.filter(r=>r.targeted);
  assert.equal(targets.length,2);
  assert.equal(nonTargetUnchanged,6);
  return {
    schema:VERSION,pinnedHistoricalRunId:42106359764,
    pinnedHistoricalArtifactId:13453110356,
    registeredAttempts:8,matchedFullPhysicalStarts:exactFullPhysicalStarts,
    nonTargetRootHistoriesUnchanged:nonTargetUnchanged,
    settledSourceVoltCyclones:2,
    sameEpochNextOpponentAcceptedRoots:2,
    ownSourceNextTurnVoluntaryObserved:targets.filter(r=>
      r.nextSourceVoluntaryTurnObserved).length,
    rows,qualifiedCompetitiveGames:0,
    paperFullGameQualified:false,
    inference:'Public postattack Store roots and censoring only. No inferred legal alternative, no hidden owner-hand/Prize data and no deck win claim.'
  };
}
/** @param {object[]} roots @returns {object[]} */
function latterSourceRootSummary(roots){
  return roots.slice(0,20).map(r=>({
    ordinal:r.actionOrdinal,turn:r.turnBefore,
    action:r.action,card:r.card??null,attack:r.attack??null
  }));
}
function run(dir=path.join(ROOT,'archived-rank6-v10')){
  const c=loadArchived(dir,'control');
  const t=loadArchived(dir,'treatment');
  const result=audit(c.data,t.data);
  const output={
    ...result,originalReceipt:{bytes:c.bytes,sha256:c.digest},
    treatmentReceipt:{bytes:t.bytes,sha256:t.digest}
  };
  process.stdout.write('AGENT46_V10_POSTATTACK_SOURCE_TAIL '+
    JSON.stringify(output)+'\n');
  return output;
}
if(require.main===module)run(process.argv[2]??undefined);
module.exports={VERSION,TARGETS,loadArchived,audit,run};
