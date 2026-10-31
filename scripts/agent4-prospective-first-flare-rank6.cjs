'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {withOriginalSourceFlareFork}=
  require('../simulation/twinleaf/agent4-live-source-flare-vs-plumeria-fork.cjs');
const {firstActionDifference}=
  require('./agent7-same-root-pass-attack-pair.cjs');

const ROOT=path.resolve(__dirname,'..');
const FRAME='results/aichi-2026/registrations/agent4-rank6-first-flare-prospective-20261031.json';
const PREDECESSOR='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const FRAME_BLOB='40438ece0493e655de2b9afa0be00a8e5cda6de2';
const VERSION='agent4-registered-original-rank6-first-eligible-flare-two-turn-policy-v1';

function gitBlob(bytes){
  return createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
}

/**
 * Verify the frozen 31 October protocol and enumerate every pre-selected
 * rank6 source slot/deal with its two original unchanged candidate lists.
 * @returns {{frame:object,old:object,trials:object[]}}
 */
function registeredFrame(){
  const bytes=fs.readFileSync(path.join(ROOT,FRAME));
  assert.equal(gitBlob(bytes),FRAME_BLOB,'Prospective source frame changed');
  const frame=JSON.parse(bytes.toString('utf8'));
  const priorBytes=fs.readFileSync(path.join(ROOT,PREDECESSOR));
  assert.equal(gitBlob(priorBytes),frame.originalAgent41FrameGitBlob,
    'Previously frozen common-policy frame changed');
  const old=JSON.parse(priorBytes.toString('utf8'));
  assert.deepEqual(frame.sourceRanks,[6]);
  assert.equal(frame.enginePin,old.enginePin);
  assert.deepEqual(frame.candidateIds,old.candidateIds);
  assert.deepEqual(frame.candidateSlots,old.candidateSlots);
  assert.equal(frame.repeats,4);
  assert.equal(frame.scheduledOriginalGameArms,16);
  assert.equal(frame.scheduledCausalArms,32);
  assert.equal(frame.actionCap,260);
  const trials=[],unique=new Set();
  for(const slot of frame.candidateSlots){
    const seeds=frame.seeds['6'][slot];
    assert.ok(Array.isArray(seeds)&&seeds.length===4);
    for(let repeat=0;repeat<frame.repeats;repeat++){
      const seed=seeds[repeat];
      assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
      assert.ok(!unique.has(seed),'Fresh physical deal seed reused');
      unique.add(seed);
      for(const candidateId of frame.candidateIds)
        trials.push({rank:6,repeat,seed,candidateSlot:slot,candidateId,
          id:[6,repeat,slot,candidateId].join(':')});
    }
  }
  assert.equal(trials.length,16);
  return {frame,old,trials};
}

/**
 * The actor-only original Plumeria-after-Pass adapter remains the control.
 * Treatment interposes a first-positive native Team Flare action only in
 * source seat; the original Store resolves all real effects and prompts.
 * @param {object} prior Previously frozen common run flags.
 * @param {object} trial Preregistered paired physical deal.
 * @param {'plumeria'|'flare-first'} mode
 * @returns {object} One complete or censored original Store output.
 */
function runOne(prior,trial,mode){
  assert.ok(mode==='plumeria'||mode==='flare-first');
  const sourceSeat=trial.candidateSlot==='A'?1:0;
  const adapter=require('../simulation/twinleaf/agent4-plumeria-after-pass.cjs');
  const original=adapter.withOwnerPlumeriaAfterPass;
  let forkAudit=null;
  if(mode==='flare-first'){
    adapter.withOwnerPlumeriaAfterPass=execute=>{
      const chosen=original(()=>{
        const fork=withOriginalSourceFlareFork(execute,{
          seat:sourceSeat,turn:null,minimumActiveEnergy:2
        });
        forkAudit=fork.audit;
        return fork.result;
      });
      chosen.audit.agent4ProspectiveFirstFlare=forkAudit;
      return chosen;
    };
  }
  try{
    const result=runDevelopment({...prior.frozenRunOptions,
      registeredTrials:[trial],registeredFrameName:FRAME,
      actorPlumeriaAfterPass:true});
    assert.equal(result.attempted,1);
    assert.equal(result.rows.length,1);
    assert.equal(result.enginePin,prior.enginePin);
    assert.equal(result.competitiveQualifiedGames,0);
    const row=result.rows[0];
    assert.equal(row.trial.id,trial.id);
    assert.equal(row.qualifiesForCompetitiveInference,false);
    return {mode,id:trial.id,row,sourceSeat,
      forkAudit:forkAudit??row.actorOnlyDecisionCoverage?.detailedComponentAudits
        ?.ownerPlumeriaAfterPass?.agent4ProspectiveFirstFlare??null,
      driverError:null};
  }finally{
    adapter.withOwnerPlumeriaAfterPass=original;
  }
}

/**
 * Keep every attempted game, including exceptions and action caps. The
 * selected source action is causal only if all original opening fingerprints
 * and the accepted-root prefix match before the first Plumeria/Flare action.
 */
function contrast(a,b){
  assert.equal(a.id,b.id);
  const commonKeys=['sourceDeckFingerprint','candidateDeckFingerprint',
    'fullPhysicalDealFingerprint','sourceDealFingerprint',
    'actualStarterSeat','verifiedFirstTurn','sourceSeat','candidateSeat'];
  const samePhysical=commonKeys.every(k=>
    a.row&&b.row&&JSON.stringify(a.row[k])===JSON.stringify(b.row[k]));
  const before=a.row?.rootActionLedger??[];
  const after=b.row?.rootActionLedger??[];
  const diff=before.length&&after.length?
    firstActionDifference(before,after):null;
  const firstOriginal=diff!==null&&diff>=0?before[diff]:null;
  const firstAlternate=diff!==null&&diff>=0?after[diff]:null;
  const audit=b.forkAudit;
  const selected=audit?.selectedFlareForks===1;
  const accepted=audit?.acceptedFlareForks===1&&
    audit?.settledFlareEnergyRemovals===1;
  const causal=samePhysical&&(diff===-1&&!selected||
    diff>=0&&selected&&accepted&&
    firstOriginal?.turnBefore===firstAlternate?.turnBefore&&
    firstOriginal?.playerSlot===b.sourceSeat&&
    firstAlternate?.playerSlot===b.sourceSeat&&
    firstOriginal?.action==='PlayCardAction'&&
    firstAlternate?.action==='PlayCardAction'&&
    firstOriginal?.card==='Plumeria'&&
    firstAlternate?.card==='Team Flare Grunt');
  const laterSource=(ledger,first,seat)=>{
    if(!first)return null;
    return ledger.find(x=>x.playerSlot===seat&&
      x.turnBefore>first.turnBefore&&
      x.action!=='ResolvePromptAction')??null;
  };
  const nextSourceControl=laterSource(before,firstOriginal,a.sourceSeat);
  const nextSourceTreatment=laterSource(after,firstAlternate,b.sourceSeat);
  const nextOpponentAfterSource=(ledger,source,seat)=>
    source?ledger.find(x=>x.playerSlot===1-seat&&
      x.turnBefore>source.turnBefore&&
      x.action!=='ResolvePromptAction')??null:null;
  return {id:a.id,sourceSeat:a.sourceSeat,
    samePhysicalStart:samePhysical,firstDifferenceIndex:diff,
    firstOriginal,firstAlternate,
    prospectiveFlareAudit:audit??null,
    firstCausalContrast:causal,
    originalSourceDealFingerprint:a.row?.sourceDealFingerprint??null,
    originalRootSha:a.row?.rootActionLedgerSha256??null,
    alternativeRootSha:b.row?.rootActionLedgerSha256??null,
    nextSourceControl,nextSourceTreatment,
    nextOpponentAfterSourceControl:
      nextOpponentAfterSource(before,nextSourceControl,a.sourceSeat),
    nextOpponentAfterSourceTreatment:
      nextOpponentAfterSource(after,nextSourceTreatment,b.sourceSeat),
    controlStatus:a.driverError?'driver-error':
      a.row?.status??(a.row?.finished?'engine-terminal':'action-cap'),
    treatmentStatus:b.driverError?'driver-error':
      b.row?.status??(b.row?.finished?'engine-terminal':'action-cap'),
    oldEngineWinner:a.row?.winner??null,
    newEngineWinner:b.row?.winner??null,
    nativeQualified:false};
}

/** @returns {object} Full prospective paired report, including all failures. */
function runProspectiveRank6Flare(){
  const {frame,old,trials}=registeredFrame();
  const pairs=[];
  for(const trial of trials){
    let control,treatment;
    for(const mode of ['plumeria','flare-first']){
      let x;
      try{x=runOne(old,trial,mode);}
      catch(error){
        x={id:trial.id,mode,sourceSeat:trial.candidateSlot==='A'?1:0,
          row:null,forkAudit:null,
          driverError:String(error?.stack??error)};
      }
      if(mode==='plumeria')control=x;else treatment=x;
    }
    const paired=contrast(control,treatment);
    pairs.push({...paired,errors:{
      control:control.driverError,
      treatment:treatment.driverError
    }});
  }
  const summary={scheduledPhysicalPairs:16,attempts:32,
    originalSourceSeats:{0:8,1:8},
    failedAttempts:pairs.reduce((n,x)=>
      n+Number(Boolean(x.errors.control))+
        Number(Boolean(x.errors.treatment)),0),
    authenticSamePhysicalStarts:pairs.filter(x=>x.samePhysicalStart).length,
    causalNativeAlternates:pairs.filter(x=>
      x.firstDifferenceIndex>=0&&x.firstCausalContrast).length,
    nativeSelectedFirstFlare:pairs.filter(x=>
      x.prospectiveFlareAudit?.selectedFlareForks===1).length,
    noOriginalNativeOpportunity:pairs.filter(x=>
      x.prospectiveFlareAudit?.sameRootNativeContests===0).length,
    incompatibleFirstRoots:pairs.filter(x=>!x.firstCausalContrast).length,
    controlTerminals:pairs.filter(x=>x.controlStatus==='engine-terminal').length,
    treatmentTerminals:pairs.filter(x=>
      x.treatmentStatus==='engine-terminal').length,
    competitiveQualifiedGames:0};
  return {version:VERSION,registrationPath:FRAME,frameGitBlob:FRAME_BLOB,
    frozenBeforeIntervention:true,enginePin:frame.enginePin,
    originalSourceRank:6,control:'plumeria',treatment:'first native Flare',
    interventionFirstEligibleOriginalSourceRoot:true,
    minimumOpponentActiveEnergy:2,summary,
    independenceCaveat:'Two candidate lists share each source seed but do not imply independent source openings or identical complete physical deals.',
    policyCaveat:'Native Store developmental policies; errors and action caps remain outcomes. No paper-clock or human-policy qualification.',
    pairs};
}

module.exports={VERSION,FRAME,FRAME_BLOB,registeredFrame,contrast,
  runProspectiveRank6Flare};
if(require.main===module)
  process.stdout.write(JSON.stringify(runProspectiveRank6Flare(),null,2)+'\n');
