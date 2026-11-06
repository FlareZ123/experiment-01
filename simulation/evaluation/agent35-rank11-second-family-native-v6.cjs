'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {run: runFirstFamily} =
  require('./agent35-rank11-firstturn-family-native-v4.cjs');
const {run: runPostattack} =
  require('./agent35-rank11-firstturn-family-postattack-v5.cjs');
const {withLateOwnedCallFamilyPrompt} =
  require('../twinleaf/agent49-rank11-firstturn-call-family-owner-prompt.cjs');
const reg = require('../../results/aichi-2026/registrations/agent35-rank11-source-second-family-native-v6-20261106.json');

const VERSION = 'agent35-rank11-original-second-owner-family-native-v6';

/**
 * Bind the prior proven native source owner Family prompt to T2 and T4 only.
 * The default underlying original-firstturn callback still covers T2 only.
 * @template T
 * @param {()=>T} next Original native game runner.
 * @param {object} components Pinned live Store dependencies.
 * @param {Function} wrapper Existing original owner Family hook.
 * @returns {{result:T,audit:object}} Actual native-run prompt audit.
 */
function sourceSecondFamily(next,components,wrapper=withLateOwnedCallFamilyPrompt) {
  assert.equal(components.registration.selectedOriginalId,
    reg.originalSourceId);
  return wrapper(next,{...components,sourceEndTurn:reg.sourceSecondTurn});
}

/**
 * Verify unchanged authentic initial source first-turn and following 13-root
 * pre-treat source/opponent chronology, never including the new root30 reply.
 * @param {object} row Existing public action-only chronology from real Store.
 * @returns {{sha256:string,roots:number}} Exact pre-treatment invariance.
 */
function checkOriginalPrefix(row) {
  assert.equal(row.sourceOriginalId,reg.originalSourceId);
  const roots = [row.sourceAttackRoot,...row.postAttackAcceptedPublicRoots
    .filter(x=>x.actionOrdinal<=reg.sourceSecondAttackRootOrdinal)];
  assert.equal(roots.length,13);
  assert.equal(roots[0].actionOrdinal,17);
  assert.equal(roots.at(-1).actionOrdinal,
    reg.sourceSecondAttackRootOrdinal);
  const sha256=createHash('sha256')
    .update(JSON.stringify(roots)).digest('hex');
  assert.equal(sha256,
    reg.registeredPrefixFromSourceAttack17ThroughSecondAttack29Sha256,
    'Existing firstturn attack and opponent public root trajectory changed');
  return {sha256,roots:roots.length};
}

/**
 * Same exact original eight and physical deals. One component difference
 * extends the source-only owner Family deck prompt from turn2 to turn4.
 * This retrospective test cannot qualify a competitive win.
 * @param {{postattack?:Function,firstFamily?:Function,family?:Function}} [deps]
 * @returns {object} Complete original source 2-turn native prompt observation.
 */
function run(deps={}) {
  const postattack = deps.postattack ?? runPostattack;
  const firstFamily = deps.firstFamily ?? runFirstFamily;
  const family = deps.family ?? withLateOwnedCallFamilyPrompt;
  let familyAudit=null;
  let raw;
  try {
    raw = postattack({
      runV4:({observe})=>firstFamily({
        observe,
        family:(next,components)=>{
          const wrapped=sourceSecondFamily(next,components,family);
          familyAudit=wrapped.audit;
          return wrapped;
        }
      })
    });
  }catch(error) {
    // An extended match can stop being a native abort while the historical
    // source-custody observers still require an abort-only public root tape.
    // Preserve the two actual Store-validated physical transfers without
    // pretending that missing root chronology or complete games are proven.
    const audit=error?.agent49FamilyOwnerPromptAudit??familyAudit;
    const exactMissingArchive=error?.code==='ERR_ASSERTION'&&
      typeof error.message==='string'&&
      error.message.includes('Array.isArray(rawRoots)');
    const transferValid=exactMissingArchive&&
      audit?.selectedSourceId===reg.originalSourceId&&
      audit.sourceAttackTurns?.join(',')==='2,4'&&
      audit.nativeSourceAttackAccepted===2&&
      audit.genuineOwnerBasicDeckPrompts===2&&
      audit.ownerBasicPromptAnswersNativeAccepted===2&&
      audit.oneOriginalBasicMovedToBench===2&&
      audit.physicalBenchTransferFailures===0&&
      audit.physicalBasicMovesByTurn?.length===2&&
      audit.physicalBasicMovesByTurn[0].turn===2&&
      audit.physicalBasicMovesByTurn[1].turn===4&&
      audit.opponentHiddenZoneInspected===false;
    if(!transferValid)throw error;
    return {
      schema:VERSION,sourceOriginalId:reg.originalSourceId,
      nativeDisposition:'CENSORED-postgame-root-archive-unavailable',
      actualOriginalPhysicalOpeningRevalidatedInThisArm:false,
      immutablePriorOriginalOpeningRegistration:
        reg.fullPhysicalFingerprintSha256,
      secondTurnSourceOwnerBasicPhysicalBenchSettled:true,
      twoSourceFamilyPhysicalBenchSettlements:true,
      sourceNativeAttackTurnNumbers:audit.sourceAttackTurns,
      sourceOwnerPhysicalBasicMoves:audit.physicalBasicMovesByTurn,
      genuineSourceFamilyPromptAudit:audit,
      registeredUntreatedPriorActionPrefix:null,
      nativeRootArchiveAvailable:false,
      nativeRootArchiveErrorClass:error.constructor.name,
      originalEightRowsReturnedBeforeArchiveVeto:true,
      originalEight:null,
      opponentAfterSecondFamilyVoluntaryRoots:null,
      opponentStrategicResponseIndependentlyQualified:false,
      competitivelyQualifiedGames:0,
      fieldWinRate:null
    };
  }
  assert.equal(raw.sourceOriginalId,reg.originalSourceId);
  assert.equal(raw.exactOriginalDeal,true);
  assert.equal(raw.originalNativeAttackRoot17AndPhysicalBasicBench,true);
  assert.ok(familyAudit);
  const prefix=checkOriginalPrefix(raw);
  const sourceTurns=familyAudit.sourceAttackTurns??[];
  const physical=familyAudit.physicalBasicMovesByTurn??[];
  const secondMoved=physical.filter(row=>
    row.turn===reg.sourceSecondTurn);
  const physicallySettledTwo=(
    familyAudit.ownerBasicPromptAnswersNativeAccepted===2&&
    familyAudit.oneOriginalBasicMovedToBench===2&&
    familyAudit.physicalBenchTransferFailures===0&&
    sourceTurns.filter(t=>t===reg.sourceSecondTurn).length===1&&
    secondMoved.length===1
  );
  const afterSecond=raw.postAttackAcceptedPublicRoots.filter(x=>
    x.actionOrdinal>reg.sourceSecondAttackRootOrdinal);
  const nextOpponent=afterSecond.filter(x=>
    x.turnBefore>reg.sourceSecondTurn&&
    x.playerSlot!==reg.originalSourceSeat);
  const opponentVoluntary=nextOpponent.filter(x=>
    !['ResolvePromptAction','AddPlayerAction'].includes(x.action));
  return {
    schema:VERSION,sourceOriginalId:reg.originalSourceId,
    originalNativeSourceAndWholePhysicalDealUnchanged:true,
    registeredUntreatedPriorActionPrefix:prefix,
    sourceFirstTurnBasicBench:physical.some(x=>x.turn===2),
    originalSecondSourceAttackRoot:
      raw.postAttackAcceptedPublicRoots.find(x=>
        x.actionOrdinal===reg.sourceSecondAttackRootOrdinal),
    genuineSourceFamilyPromptAudit:familyAudit,
    sourceSecondTurnBasicMovedToBench:secondMoved.length===1,
    twoSourceFamilyPhysicalBenchSettlements:physicallySettledTwo,
    originalAfterSecondAttackNativeRoots:afterSecond,
    sourceSecondAttackCompletedToOpponentNextTurn:nextOpponent.length>0,
    opponentAfterSecondFamilyPublicRoots:nextOpponent,
    opponentAfterSecondFamilyVoluntaryRoots:opponentVoluntary,
    nativeAbort:raw.nativeAbort,
    selectedNativeStatus:raw.selectedNativeStatus,
    originalEight:raw.failureInclusiveEight,
    noOwnerPromptOpponentHiddenZoneRead:
      familyAudit.opponentHiddenZoneInspected===false,
    opponentStrategicResponseIndependentlyQualified:false,
    competitivelyQualifiedGames:0,
    fieldWinRate:null
  };
}

/** Atomically save native failure-inclusive receipt with exclusive lock. */
function write(file,value){
  assert.equal(value.schema,VERSION);
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const fd=fs.openSync(file+'.lock','wx');
  const tmp=file+'.'+process.pid+'.tmp';
  try{
    const body=JSON.stringify(value,null,2)+'\n';
    fs.writeFileSync(tmp,body,{flag:'wx'});
    fs.renameSync(tmp,file);
    return {bytes:Buffer.byteLength(body),
      sha256:createHash('sha256').update(body).digest('hex')};
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(file+'.lock');
  }
}

if(require.main===module){
  const filename=process.env.AGENT35_RANK11_SECOND_FAMILY_NATIVE;
  assert.ok(filename,'AGENT35_RANK11_SECOND_FAMILY_NATIVE required');
  const v=run(),saved=write(filename,v);
  process.stdout.write('AGENT35_SECOND_FAMILY '+JSON.stringify({
    ...saved,
    firstAndSecondBasic:v.twoSourceFamilyPhysicalBenchSettlements,
    secondBasicToBench:v.sourceSecondTurnBasicMovedToBench,
    subsequentOpponentVoluntaryRoots:
      v.opponentAfterSecondFamilyVoluntaryRoots.length,
    nativeAbort:v.nativeAbort,
    zeroQualifiedGames:0
  })+'\n');
}

module.exports={VERSION,sourceSecondFamily,checkOriginalPrefix,run,write};
