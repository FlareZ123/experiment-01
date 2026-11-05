'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=require('./agent20-frozen-rank6-canary-v1.cjs');

const VERSION='agent4-physical-shuffle-common-completed-turn-exposure-v1';

/**
 * @param {object[]} publicRoots Actual accepted public Store roots.
 * @returns {{roots:object[],completedTurnKeys:string[],resetCount:number,
 *   lastObservedTurn:number|null}}
 */
function observedCompleteTurns(publicRoots){
  assert.ok(Array.isArray(publicRoots));
  let epoch=0,lastTurn=null,lastOrdinal=-1,resets=0;
  const roots=publicRoots.map((entry,index)=>{
    const ordinal=entry.actionOrdinal??entry.ordinal;
    const turn=entry.turnBefore??entry.turn;
    const seat=entry.playerSlot??entry.seat;
    assert.ok(Number.isInteger(ordinal)&&ordinal>=0);
    assert.ok(Number.isInteger(turn)&&turn>=0);
    assert.ok(seat===0||seat===1);
    assert.ok(ordinal>lastOrdinal,
      'Accepted Store public roots require increasing native action ordinals');
    if(lastTurn!==null&&turn<lastTurn){
      epoch++;
      resets++;
    }
    const current={ordinal,epoch,turn,key:epoch+':'+turn,
      seat,action:entry.action,card:entry.card??null,
      attack:entry.attack??null,pendingPrompt:entry.pendingPrompt??null};
    lastTurn=turn;lastOrdinal=ordinal;
    return current;
  });
  const completed=new Set();
  for(let i=0;i<roots.length-1;i++){
    const a=roots[i],b=roots[i+1];
    if(a.epoch===b.epoch&&b.turn>a.turn)completed.add(a.key);
  }
  return {roots,completedTurnKeys:[...completed],
    resetCount:resets,lastObservedTurn:lastTurn};
}

/**
 * Compare native accepted actions within actual game turns demonstrated to
 * have ended in both arms. An action in either arm's last observed turn is
 * censored until a subsequent native root proves that turn transitioned.
 *
 * @param {object[]} baseline
 * @param {object[]} treatment
 * @param {0|1} sourceSeat
 */
function compareCommonCompletedTurns(baseline,treatment,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  const a=observedCompleteTurns(baseline);
  const b=observedCompleteTurns(treatment);
  const crossEpochReset=a.resetCount!==0||b.resetCount!==0;
  const aComplete=new Set(a.completedTurnKeys),bComplete=new Set(b.completedTurnKeys);
  const common=[...aComplete].filter(key=>bComplete.has(key)&&key!=='0:0')
    .sort((x,y)=>{
      const [ae,at]=x.split(':').map(Number),[be,bt]=y.split(':').map(Number);
      return ae-be||at-bt;
    });
  const commonSet=new Set(common);
  const summarise=(roots,seat)=>({
    attackDeclarations:roots.filter(x=>commonSet.has(x.key)&&
      x.seat===seat&&x.action==='AttackAction')
      .map(x=>({turn:x.turn,ordinal:x.ordinal,attack:x.attack})),
    playCardActions:roots.filter(x=>commonSet.has(x.key)&&
      x.seat===seat&&x.action==='PlayCardAction')
      .map(x=>({turn:x.turn,ordinal:x.ordinal,card:x.card})),
    passActions:roots.filter(x=>commonSet.has(x.key)&&
      x.seat===seat&&x.action==='PassTurnAction').length,
    totalMeaningfulActions:roots.filter(x=>commonSet.has(x.key)&&
      x.seat===seat&&
      ['AttackAction','PlayCardAction','PassTurnAction','UseAbilityAction',
        'RetreatAction'].includes(x.action)).length
  });
  const candidateSeat=1-sourceSeat;
  const candidateKlefki=(roots)=>roots.some(x=>
    x.seat===candidateSeat&&x.turn===4&&x.epoch===0&&
    x.action==='PlayCardAction'&&x.card==='Klefki'&&
    commonSet.has(x.key));
  return {
    sharedCompleteTurns:common,
    completeTurnCount:common.length,
    resetGuardPass:!crossEpochReset,
    source:{
      control:summarise(a.roots,sourceSeat),
      MailTreatment:summarise(b.roots,sourceSeat)
    },
    candidate:{
      control:summarise(a.roots,candidateSeat),
      MailTreatment:summarise(b.roots,candidateSeat)
    },
    candidateKlefkiOnSharedCompletedTurn4:{
      eligible:commonSet.has('0:4'),
      control:candidateKlefki(a.roots),
      MailTreatment:candidateKlefki(b.roots)
    },
    controlLastObservedTurn:a.lastObservedTurn,
    treatmentLastObservedTurn:b.lastObservedTurn,
    sourceSeat,candidateSeat,
    interpretation:crossEpochReset?'INCOMPARABLE_NATIVE_EPOCH_RESET':
      (common.length?'DEVELOPMENT_ONLY_COMMON_COMPLETE_TURN_ACTIONS':
        'INSUFFICIENT_COMMON_COMPLETED_NATIVE_TURNS'),
    competitiveGamesQualified:0
  };
}

/** @param {object} native Original pinned native 96-root result. */
function analyzeOriginal96(native){
  assert.equal(native.schema,
    'agent4-mail-postsetup-original-eight-96root-source-payoff-v3');
  assert.ok(Object.values(native.gates??{}).every(Boolean));
  const panel=native.fullAfterSetupNativeComparison?.mailAba?.panel??[];
  assert.equal(panel.length,8);
  const arms=panel.map(row=>{
    const v=row.changeAudit??{};
    const result=compareCommonCompletedTurns(
      v.baselinePublicRootTape??[],
      v.treatedPublicRootTape??[],
      row.sourceSeat);
    return {originalTrialId:row.id,
      controlNativeStatus:row.originalDisposition??null,
      treatmentNativeStatus:row.treatmentDisposition??null,
      ...result
    };
  });
  return {schema:VERSION,
    underlyingNativeRegistration:native.registry,
    underlyingNativeRng:native.commonProtocol,
    priorSourceOwnerMailGenuineAcceptedCounts:
      native.sourceAndCandidateOpportunitySummary
        .sourceMailAcceptedCountByPhysicalSeat,
    originalEight:arms,
    rank6Seed100:arms.filter(row=>row.originalTrialId.startsWith('6:100:A:')),
    allEightRetained:arms.length===8,
    unsupportedEpochResetRows:arms.filter(x=>!x.resetGuardPass)
      .map(x=>x.originalTrialId),
    rootCapMatchedButGlobalTurnHorizonNotEqual:true,
    nativeRootActionLimit:native.nativeRootCap,
    competitiveGamesQualified:0,winRate:null,
    inference:'Comparison excludes each arm last observed turn. Equal 96 native roots do not establish equal game-time opportunity or paper strength.'};
}

if(require.main===module){
  const source=process.env.AGENT4_NATIVE_96_ROOT_JSON;
  const target=process.env.AGENT4_COMMON_TURN_EXPOSURE_OUTPUT;
  assert.ok(source&&target,'Require existing native result and atomic target');
  const result=analyzeOriginal96(JSON.parse(fs.readFileSync(source,'utf8')));
  const body=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(target),{recursive:true});
  writeAtomicLocked(target,body);
  writeAtomicLocked(target+'.sha256',
    createHash('sha256').update(body).digest('hex')+'  '+
    path.basename(target)+'\n');
  process.stdout.write('AGENT4_NATIVE_COMMON_COMPLETE_TURN '+JSON.stringify({
    rank6Seed100:result.rank6Seed100.map(row=>({
      id:row.originalTrialId,
      turns:row.sharedCompleteTurns,
      attacksA:row.candidate.control.attackDeclarations,
      attacksB:row.candidate.MailTreatment.attackDeclarations,
      sourceAttackA:row.source.control.attackDeclarations,
      sourceAttackB:row.source.MailTreatment.attackDeclarations,
      Klefki:row.candidateKlefkiOnSharedCompletedTurn4,
      statusA:row.controlNativeStatus,statusB:row.treatmentNativeStatus
    })),
    totalEight:result.originalEight.length,
    unsupportedEpochs:result.unsupportedEpochResetRows,
    qualifiedGames:0
  })+'\n');
}

module.exports={VERSION,observedCompleteTurns,
  compareCommonCompletedTurns,analyzeOriginal96};
