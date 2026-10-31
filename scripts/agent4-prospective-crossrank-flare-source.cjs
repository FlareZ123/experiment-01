'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {withOriginalSourceFlareFork}=
  require('../simulation/twinleaf/agent4-live-source-flare-vs-plumeria-fork.cjs');
const {contrast}=require('./agent4-prospective-first-flare-rank6.cjs');

const ROOT=path.resolve(__dirname,'..');
const FRAME='results/aichi-2026/registrations/agent4-crossrank-four-source-flare-20261031.json';
const FRAME_BLOB='b8d9259cf7c71fe04efab4baac9f570791326bb8';
const PRIOR='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const VERSION='agent4-registered-four-original-source-dual-supporter-flare-v1';
const physicalZoneGate=process.env.AGENT4_CROSSRANK_PHYSICAL_GATE_DEV==='true';

/** @param {Buffer} bytes @returns {string} Git blob SHA-1 including header. */
function gitBlob(bytes){
  return createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
}

/**
 * Authenticate precommitted, unedited source/candidate printings and enumerate
 * both original 60s for every genuine same-integer-seed original source deal.
 * @returns {{frame:object,prior:object,groups:object[][]}}
 */
function registeredCrossrankGroups(){
  const bytes=fs.readFileSync(path.join(ROOT,FRAME));
  assert.equal(gitBlob(bytes),FRAME_BLOB);
  const frame=JSON.parse(bytes.toString('utf8'));
  const oldBytes=fs.readFileSync(path.join(ROOT,PRIOR));
  assert.equal(gitBlob(oldBytes),frame.priorCommonFrameGitBlob);
  const prior=JSON.parse(oldBytes.toString('utf8'));
  assert.equal(prior.enginePin,frame.enginePin);
  assert.deepEqual(frame.sourceRanks,[3,7,24,29]);
  assert.deepEqual(frame.candidateIds,prior.candidateIds);
  assert.deepEqual(frame.candidateSlots,['A','B']);
  assert.equal(frame.repeats,2);
  assert.equal(frame.registeredSourceSeedGroups,16);
  assert.equal(frame.originalGamePairContrasts,32);
  assert.equal(frame.totalNativeStoreAttempts,64);
  assert.equal(frame.firstEligibleMinOpponentActiveEnergy,1);
  const sourceBytes=fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'));
  assert.equal(gitBlob(sourceBytes),frame.sourceRosterGitBlob);
  const roster=JSON.parse(sourceBytes.toString('utf8'));
  const groups=[],seeds=new Set();
  for(const rank of frame.sourceRanks){
    const deck=roster.decks.find(d=>d.rank===rank);
    assert.ok(deck,'Exact original rank source list required');
    assert.equal(deck.cards.reduce((sum,x)=>sum+x.count,0),60);
    for(const [name,key] of [['Plumeria','plumeria'],
      ['Team Flare Grunt','flare']]){
      assert.equal(deck.cards.filter(x=>x.name===name)
        .reduce((sum,x)=>sum+x.count,0),
      frame.sourcePrintings[rank][key]);
    }
    for(const slot of frame.candidateSlots){
      for(let repeat=0;repeat<frame.repeats;repeat++){
        const seed=frame.seeds[rank][slot][repeat];
        assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
        assert.ok(!seeds.has(seed),'Duplicate prospectively sampled seed');
        seeds.add(seed);
        groups.push(frame.candidateIds.map(candidateId=>({
          rank,repeat,seed,candidateSlot:slot,candidateId,
          id:[rank,repeat,slot,candidateId].join(':')
        })));
      }
    }
  }
  assert.equal(groups.length,16);
  assert.equal(seeds.size,16);
  assert.equal(groups.flat().length,32);
  return {frame,prior,groups};
}

/**
 * Original pinned Store accepts the same two fixed candidate decks in one
 * paired driver request. The only treatment mutation is the once-per-game
 * first native source-owned Team Flare action replacing original Plumeria.
 *
 * @param {object} prior Frozen old common-policy frame.
 * @param {object[]} group Two unchanged candidate 60s and one original source seed.
 * @param {'plumeria'|'flare-first'} mode
 * @returns {object[]} All native control or treatment cases.
 */
function runNativeGroup(prior,group,mode){
  assert.ok(mode==='plumeria'||mode==='flare-first');
  assert.equal(group.length,2);
  const sourceSeat=group[0].candidateSlot==='A'?1:0;
  const adapter=require('../simulation/twinleaf/agent4-plumeria-after-pass.cjs');
  const original=adapter.withOwnerPlumeriaAfterPass;
  const paymentKey='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
  const oldPayment=process.env[paymentKey];
  process.env[paymentKey]='true';
  if(mode==='flare-first'){
    adapter.withOwnerPlumeriaAfterPass=execute=>{
      let forkAudit=null;
      const chosen=original(()=>{
        const result=withOriginalSourceFlareFork(execute,{
          seat:sourceSeat,turn:null,minimumActiveEnergy:1
        });
        forkAudit=result.audit;
        return result.result;
      });
      chosen.audit.agent4ProspectiveCrossrankFlare=forkAudit;
      return chosen;
    };
  }
  try{
    const run=runDevelopment({...prior.frozenRunOptions,
      registeredTrials:group,registeredFrameName:FRAME,
      allowAdditionalOriginalSourceRanks:true,
      actorPlumeriaAfterPass:true,physicalZoneGate});
    assert.equal(run.attempted,2);
    assert.equal(run.rows.length,2);
    assert.equal(run.enginePin,prior.enginePin);
    assert.equal(run.competitiveQualifiedGames,0);
    assert.deepEqual(run.rows.map(x=>x.trial.id).sort(),
      group.map(x=>x.id).sort());
    return run.rows.map(row=>{
      assert.equal(row.qualifiesForCompetitiveInference,false);
      return {id:row.trial.id,row,sourceSeat,mode,
        forkAudit:row.actorOnlyDecisionCoverage?.detailedComponentAudits
          ?.ownerPlumeriaAfterPass?.agent4ProspectiveCrossrankFlare??null,
        driverError:null};
    });
  }finally{
    adapter.withOwnerPlumeriaAfterPass=original;
    if(oldPayment===undefined)delete process.env[paymentKey];
    else process.env[paymentKey]=oldPayment;
  }
}

/**
 * Every registered pair remains present if a driver/engine fails. No
 * native source choice is silently counted when a Store action is rejected.
 * @returns {object} Failure-inclusive original cross-archetype source pilot.
 */
function runCrossrankFlare(){
  const {frame,prior,groups}=registeredCrossrankGroups();
  const pairs=[];
  for(const group of groups){
    const modes={};
    for(const mode of ['plumeria','flare-first']){
      try{modes[mode]=runNativeGroup(prior,group,mode);}
      catch(error){
        modes[mode]=group.map(trial=>({
          id:trial.id,sourceSeat:trial.candidateSlot==='A'?1:0,
          row:null,mode,forkAudit:null,
          driverError:String(error?.stack??error)
        }));
      }
    }
    const controls=new Map(modes.plumeria.map(x=>[x.id,x]));
    const treated=new Map(modes['flare-first'].map(x=>[x.id,x]));
    for(const trial of group){
      const control=controls.get(trial.id),treatment=treated.get(trial.id);
      assert.ok(control&&treatment,'Every preregistered game must be retained');
      pairs.push({...contrast(control,treatment),rank:trial.rank,
        controlPhysicalZone:control.row?.physicalZoneQualification??null,
        treatmentPhysicalZone:treatment.row?.physicalZoneQualification??null,
        sourceDeckArchetype:frame.sourcePrintings[trial.rank].archetype,
        errors:{control:control.driverError,treatment:treatment.driverError}});
    }
  }
  assert.equal(pairs.length,frame.originalGamePairContrasts);
  const counts=rows=>({
    matchedPhysicalStarts:rows.filter(r=>r.samePhysicalStart).length,
    nativeSelectedFlare:rows.filter(r=>
      r.prospectiveFlareAudit?.selectedFlareForks===1).length,
    nativeAcceptedFlare:rows.filter(r=>
      r.prospectiveFlareAudit?.acceptedFlareForks===1&&
      r.prospectiveFlareAudit?.settledFlareEnergyRemovals===1).length,
    verifiedTwoTurnDeniedEnergy:rows.filter(r=>
      r.secondOpposingEnergyDenialConfirmed).length,
    firstRootMismatch:rows.filter(r=>!r.firstCausalContrast).length,
    driverErrors:rows.reduce((s,r)=>s+
      Number(Boolean(r.errors.control))+
      Number(Boolean(r.errors.treatment)),0),
    controlTerminals:rows.filter(r=>r.controlStatus==='engine-terminal').length,
    treatmentTerminals:rows.filter(r=>
      r.treatmentStatus==='engine-terminal').length,
    controlPhysicalPassed:rows.filter(r=>
      r.controlPhysicalZone?.status==='SETTLED_PHYSICAL_INTEGRITY_PASSED').length,
    treatmentPhysicalPassed:rows.filter(r=>
      r.treatmentPhysicalZone?.status==='SETTLED_PHYSICAL_INTEGRITY_PASSED').length,
    physicalInvalidArms:rows.reduce((n,r)=>n+
      Number(r.controlPhysicalZone?.status==='ENGINE_PHYSICAL_INVALID')+
      Number(r.treatmentPhysicalZone?.status==='ENGINE_PHYSICAL_INVALID'),0),
    distinctPositiveSourceDeals:new Set(rows.filter(r=>
      r.prospectiveFlareAudit?.selectedFlareForks===1)
      .map(r=>r.originalSourceDealFingerprint)).size
  });
  const summary=counts(pairs);
  summary.originalPairs=pairs.length;
  summary.nativeAttempts=pairs.length*2;
  summary.byRank=Object.fromEntries(frame.sourceRanks.map(rank=>
    [rank,counts(pairs.filter(x=>x.rank===rank))]));
  summary.competitiveQualifiedGames=0;
  return {version:VERSION,framePath:FRAME,frameBlob:FRAME_BLOB,
    sourceRosterBlob:frame.sourceRosterGitBlob,
    preregisteredBeforeIntervention:true,enginePin:frame.enginePin,
    reportingOnlySettledPhysicalZoneGateOptIn:physicalZoneGate,
    originalSourceRanks:frame.sourceRanks,
    control:'original Plumeria after Pass',
    treatment:'first native coheld Flare with >=1 opponent Active Energy',
    caveat:'Distinct same-seed candidate decks can share source initial deals; root observations and action-capped/weak-bot terminals do not establish game win rates. No paper clock.',
    summary,pairs};
}

module.exports={VERSION,FRAME,FRAME_BLOB,registeredCrossrankGroups,
  runCrossrankFlare};
if(require.main===module)
  process.stdout.write(JSON.stringify(runCrossrankFlare(),null,2)+'\n');
