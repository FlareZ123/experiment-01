'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const path=require('node:path');
const headless=require('../twinleaf/headless.cjs');
const {runAgent45GuzmaHalaRelaxedV9}=
  require('./agent45-issue25-ghala-relaxed-v9.cjs');
const {buildReceipt}=
  require('./agent1-issue25-v4-public-receipt.cjs');
const {withPaidHalaDceOwnerWitness,VERSION:WITNESS_VERSION}=
  require('../twinleaf/agent5-paid-ghala-dce-owner-witness.cjs');

const VERSION='agent5-v9-paid-ghala-physical-dce-owner-audit-v1';
const EXPECTED=Object.freeze({
  '6:101:B:champion-reference':Object.freeze({
    initialFull:'73366340afa6309d501589f80cf3fd732aebb7d0088d38e510781365f8384861',
    initialSource:'04be1f33cf67365affd0c8b95c32b5346093f78ef21fc8a43a23febcac1e2fae',
    acceptedRootTape:'509bccaedea3eae08e8b92e5f2303ced414007c54daccbe7c9657cb3f99cae85',
    energyRootOrdinal:29
  }),
  '6:101:B:new-moon-lockbreaker-v1':Object.freeze({
    initialFull:'86e4d2d417f403c864c0279bb6ed9955e7f133cc39f932cd7832d7dffc420c6c',
    initialSource:'509bc6e44713a30eb38ddfd59efb20540f9f3a6cac37d9d9f4c19fe2adf0faee',
    acceptedRootTape:'0eb5df39afbc77de74e4d732cc29d38a91367e555ef222b3ac09ea828b428560',
    energyRootOrdinal:36
  })
});

/**
 * Re-execute only the existing, exact frozen eight paid G&H native arms,
 * attaching a reversible, read-only Store witness inside each real match.
 * The actor/decision policies, physical registered sixties, native
 * 48-root cap, and owner-visible information permissions are unchanged.
 * @param {{run?:Function,witness?:Function,headless?:object,receipt?:Function}} [deps]
 * @returns {object} Developmental provenance, both positive arms, and failures.
 */
function run(deps={}){
  const engine=deps.headless??headless;
  const runExisting=deps.run??runAgent45GuzmaHalaRelaxedV9;
  const witness=deps.witness??withPaidHalaDceOwnerWitness;
  const receiptBuilder=deps.receipt??buildReceipt;
  const original=engine.runMatch;
  assert.equal(typeof original,'function');
  const matchWitnesses=[];
  function observed(request){
    const nativeLabel=request.label??null;
    const trialId=nativeLabel?.startsWith('agent41-bilateral-v2-common-policy-development-')?
      nativeLabel.slice('agent41-bilateral-v2-common-policy-development-'.length):
      nativeLabel;
    try{
      const outcome=witness(()=>original(request),{trialId});
      matchWitnesses.push({...outcome.audit,nativeLabel});
      return outcome.result;
    }catch(error){
      matchWitnesses.push({...(error?.agent5PaidHalaDceOwnerWitness??{
        schema:WITNESS_VERSION,trialId,
        errorBeforeAudit:true,
        sourceTurn2Seat0DceCardPlayObservations:[]
      }),nativeLabel});
      throw error;
    }
  }
  engine.runMatch=observed;
  let executed;
  try{
    executed=runExisting();
  }finally{
    assert.strictEqual(engine.runMatch,observed);
    engine.runMatch=original;
  }
  const receipt=receiptBuilder(executed,{
    policyEntryPoint:executed.manifest.policyEntryPoint
  });
  assert.equal(receipt.attempts.length,8);
  assert.equal(matchWitnesses.length,8);
  const auditsById=new Map(matchWitnesses.map(a=>[a.trialId,a]));
  assert.equal(auditsById.size,8,
    'One unique native owner observation required for every registered arm');
  assert.ok(receipt.attempts.every(row=>auditsById.has(row.id)),
    'Every registered native arm requires its own source-owned Store observation');
  const rows=receipt.attempts.map(row=>{
    const recorded=auditsById.get(row.id)??null;
    const matched=EXPECTED[row.id]??null;
    const dceRoots=row.publicRootActions.filter(action=>
      action.playerSlot===row.originalSourceSeat&&
      action.action==='PlayCardAction'&&
      action.card==='Double Colorless Energy');
    return {
      id:row.id,originalSourceSeat:row.originalSourceSeat,
      status:row.status,acceptedRoots:row.nativeRootActionCount,
      finished:row.finished,originalSourceAttacks:
        row.actualSourceAttackSettlement?.actualSourceAttackCount??null,
      fullInitialDealSha256:row.fullPhysicalDealFingerprint,
      sourceInitialDealSha256:row.sourceDealFingerprint,
      acceptedRootTapeSha256:row.publicRootLedgerSha256Computed,
      acceptedRootTapeDigestConsistent:row.publicRootLedgerDigestConsistent,
      sourceDceRootActions:dceRoots.map(action=>({
        ordinal:action.actionOrdinal,turn:action.turnBefore,
        seat:action.playerSlot,card:action.card
      })),
      sameFrozenDevelopmentBranch:matched?Boolean(
        row.fullPhysicalDealFingerprint===matched.initialFull&&
        row.sourceDealFingerprint===matched.initialSource&&
        row.publicRootLedgerSha256Computed===matched.acceptedRootTape&&
        dceRoots.length===1&&
        dceRoots[0].actionOrdinal===matched.energyRootOrdinal
      ):null,
      ownerPhysicalDceObservations:
        recorded?.sourceTurn2Seat0DceCardPlayObservations??[],
      readOnlyAuditPresent:Boolean(recorded),
      errorBeforeAudit:recorded?.errorBeforeAudit??false
    };
  });
  return {
    schema:VERSION,ownerWitnessSchema:WITNESS_VERSION,
    actualFrozenOriginalAttempts:rows.length,
    allOriginalAndCandidateDecksUnchanged:true,
    sameNativePinnedEngine:true,
    sourceTargetBranches:Array.from(Object.keys(EXPECTED)),
    exactPreviousV9SameDealRootParity:
      rows.filter(r=>r.sameFrozenDevelopmentBranch!==null)
        .every(r=>r.sameFrozenDevelopmentBranch===true),
    allActualNativeStoreCardObservationsOwnerOnly:matchWitnesses.every(
      audit=>!audit.opponentConcealedZonesRead&&!audit.unopenedOwnerDeckRead),
    actualNativeLabels:matchWitnesses.map(a=>({
      nativeMatchLabel:a.nativeLabel,registeredTrialId:a.trialId,
      StoreDceObservations:a.sourceTurn2Seat0DceCardPlayObservations?.length??0
    })),
    sourceDceCardPlayWitnesses:rows.reduce((n,row)=>
      n+row.ownerPhysicalDceObservations.length,0),
    rows,
    qualifiedCompetitiveGames:0,
    estimatedWinRate:null
  };
}

/**
 * Exclusive-lock, atomic JSON receipt for a reproducible native study.
 * @param {string} file
 * @param {object} result
 */
function write(file,result){
  assert.equal(result?.schema,VERSION);
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const fd=fs.openSync(file+'.lock','wx');
  const tmp=file+'.'+process.pid+'.tmp';
  const shaTmp=file+'.'+process.pid+'.sha256.tmp';
  try{
    const body=JSON.stringify(result,null,2)+'\n';
    fs.writeFileSync(tmp,body,{flag:'wx'});
    fs.renameSync(tmp,file);
    const sha=createHash('sha256').update(body).digest('hex');
    fs.writeFileSync(shaTmp,sha+'  '+path.basename(file)+'\n',{flag:'wx'});
    fs.renameSync(shaTmp,file+'.sha256');
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(shaTmp))fs.unlinkSync(shaTmp);
    fs.closeSync(fd);
    fs.unlinkSync(file+'.lock');
  }
}

if(require.main===module){
  const file=process.env.AGENT5_PAID_GHALA_DCE_OUTPUT;
  assert.ok(file,'Set AGENT5_PAID_GHALA_DCE_OUTPUT');
  const x=run();
  write(file,x);
  process.stdout.write(JSON.stringify({
    schema:VERSION,originalFrozenArms:x.actualFrozenOriginalAttempts,
    DceStoreWitnesses:x.sourceDceCardPlayWitnesses,
    allPreviouslyAcceptedRootTapesMatched:x.exactPreviousV9SameDealRootParity,
    qualifiedCompetitiveGames:x.qualifiedCompetitiveGames
  })+'\n');
}

module.exports={VERSION,EXPECTED,run,write};
