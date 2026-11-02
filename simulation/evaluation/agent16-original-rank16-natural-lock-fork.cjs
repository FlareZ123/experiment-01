'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const registration=require('../../results/aichi-2026/registrations/agent16-rank16-bothseat-natural-opening-v1-20261102.json');
const profile=require('./agent41-frozen-bilateral-development-v2.json');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent16-original-rank16-natural-opening-bothseat-v1';
const ROASTER='results/aichi-2026/full-decklists.json';
const PROFILE='simulation/evaluation/agent41-frozen-bilateral-development-v2.json';

/** @param {Buffer} contents @returns {string} */
function gitBlob(contents){
  return createHash('sha1').update('blob '+contents.length+'\0')
    .update(contents).digest('hex');
}

/** The complete unreselected preregistration, with identical seed for both candidates. */
function scheduledArms(){
  assert.equal(registration.schema,
    'agent16-original-rank16-bothseat-natural-opening-source-v1');
  assert.equal(registration.rank,16);
  assert.equal(registration.seedBase,968617787);
  assert.equal(registration.seedProtocol,'aichi-decorrelated-slots-v3');
  assert.equal(registration.phase,'published-field');
  assert.equal(registration.sourceGroups,8);
  assert.equal(registration.plannedNativeAttempts,16);
  assert.equal(registration.maxNativeRootActions,260);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(registration.seeds.length,8);
  const seen=new Set(),out=[];
  for(const row of registration.seeds){
    assert.equal(row.rank,16);
    assert.ok(Number.isInteger(row.repeat)&&row.repeat>=0&&row.repeat<=7);
    assert.equal(row.candidateSlot,row.repeat%2===0?'A':'B');
    assert.ok(!seen.has(row.repeat),'Duplicate rank16 source deal');
    seen.add(row.repeat);
    const projected=deriveSlotSeeds(registration.seedBase,
      registration.phase,16,row.repeat);
    assert.equal(row.seed,projected[row.candidateSlot],
      'Precommitted source seed derivation changed');
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&
      row.seed<=0xffffffff);
    for(const candidateId of registration.candidateIds){
      out.push({...row,candidateId,id:
        [16,row.repeat,row.candidateSlot,candidateId].join(':')});
    }
  }
  assert.equal(seen.size,8);
  assert.equal(out.length,16);
  return out;
}

/** Check actual printed source identity and immutable manifest before native play. */
function preflight(root=ROOT){
  assert.equal(gitBlob(fs.readFileSync(path.join(root,ROASTER))),
    registration.sourceRosterGitBlobSha,
    'Original Aichi 60 source roster no longer matches preregistration');
  assert.equal(gitBlob(fs.readFileSync(path.join(root,PROFILE))),
    registration.policyProfileGitBlobSha,
    'Native two-seat selected policy manifest changed');
  assert.equal(registration.enginePin,profile.pinnedVendorRevision);
  assert.equal(registration.sourcePlayer,'Takumi Matsumoto');
  const source=JSON.parse(fs.readFileSync(path.join(root,ROASTER),'utf8'));
  const deck=source.decks.find(d=>d.rank===16);
  assert.equal(deck?.player,registration.sourcePlayer);
  assert.equal(deck.archetype,registration.sourceArchetype);
  assert.equal(deck.cards.reduce((sum,c)=>sum+c.count,0),60);
  /** @param {string} name @param {string} set @returns {number} */
  const count=(name,set)=>deck.cards.filter(c=>c.name===name&&
    c.printing.set===set).reduce((sum,c)=>sum+c.count,0);
  assert.equal(count('Budew','ASC'),2);
  assert.equal(count('Boost Shake','EVS'),2);
  assert.equal(count('Garbodor','LTR'),2);
  assert.equal(count('Garbodor','BKP'),1);
  assert.equal(count('Float Stone','BKT'),4);
  assert.equal(count('Trubbish','CRI'),2);
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  assert.equal(profile.policyOptions.nativeAcceptedTargets,true);
  assert.equal(profile.policyOptions.physicalZoneGate,true);
  return {
    version:VERSION,originalRank:16,
    originalSourcePrinted60:true,
    sourcePrinted60Blob:registration.sourceRosterGitBlobSha,
    profileBlob:registration.policyProfileGitBlobSha,
    exactSeedGroups:registration.sourceGroups,
    plannedNativeAttempts:registration.plannedNativeAttempts,
    enginePin:registration.enginePin,competitivelyQualifiedGames:0
  };
}

/**
 * A strict original Store accepted-root trace, separated from other turns.
 * The first owner turn is 1 if source goes first, 2 otherwise. Report
 * absence or unknown setup explicitly, rather than manufacturing a lock.
 * @param {object} row The complete unmodified native development row.
 */
function originalOpeningReceipt(row){
  const sourceSeat=row.sourceSeat;
  if(![0,1].includes(sourceSeat)||typeof row.sourceActuallyFirst!=='boolean')
    return {kind:'original-source-opening-unverified',reason:'missing physical setup'};
  const turn=row.sourceActuallyFirst?1:2;
  const native=(row.rootActionLedger??[]).filter(e=>
    e.playerSlot===sourceSeat&&e.turnBefore===turn&&
    e.pendingPrompt==null);
  const attacks=native.filter(e=>e.action==='AttackAction')
    .map(e=>({ordinal:e.actionOrdinal,name:e.attack??null}));
  const plays=native.filter(e=>e.action==='PlayCardAction')
    .map(e=>({ordinal:e.actionOrdinal,card:e.card??null}));
  const sourceToOpponent= (row.rootActionLedger??[]).find(e=>
    e.playerSlot===row.candidateSeat&&e.turnBefore===turn+1&&
    e.pendingPrompt==null)??null;
  const first=row.sourceFirstOwnedAffordances??null;
  return {
    kind:'original-source-first-turn-native-accepted-roots-v1',
    sourceSeat,turn,sourceStartedFirst:row.sourceActuallyFirst,
    actualSourceTurnRootCount:native.length,
    actions:native.map(e=>({ordinal:e.actionOrdinal,
      action:e.action,card:e.card??null,attack:e.attack??null})),
    attacks,plays,
    budewAttackChosen:attacks.some(e=>e.name==='Itchy Pollen'),
    shakeRootChosen:plays.some(e=>
      typeof e.card==='string'&&e.card.startsWith('Boost Shake')),
    firstOwnerHandCounts:first?.firstOwnHand?.resources??null,
    firstOwnHandStatus:first?.status??null,
    firstTurnTerminalKind:first?.terminalKind??null,
    firstSubsequentOpponentRoot:sourceToOpponent?
      {ordinal:sourceToOpponent.actionOrdinal,
        action:sourceToOpponent.action,
        turn:sourceToOpponent.turnBefore}:null,
    completeTurnAndReplyWitness:
      (first?.status==='observed')&&Boolean(sourceToOpponent),
    competitiveQualified:false
  };
}

/** @param {object[]} rows */
function summarize(rows){
  const dispositions={},starts={sourceFirst:0,sourceSecond:0,unknown:0};
  const firstTurnRoots={budewAttack:0,boostShakeRoot:0,neither:0,unknown:0};
  const observations=[];
  for(const row of rows){
    const status=row.status??'missing-native-status';
    dispositions[status]=(dispositions[status]??0)+1;
    const start=row.sourceActuallyFirst===true?'sourceFirst':
      row.sourceActuallyFirst===false?'sourceSecond':'unknown';
    starts[start]++;
    const receipt=originalOpeningReceipt(row);
    if(receipt.kind==='original-source-opening-unverified'){
      firstTurnRoots.unknown++;
    }else if(receipt.budewAttackChosen){
      firstTurnRoots.budewAttack++;
    }else if(receipt.shakeRootChosen){
      firstTurnRoots.boostShakeRoot++;
    }else firstTurnRoots.neither++;
    observations.push({
      trialId:row.trial?.id??null,
      candidateId:row.trial?.candidateId??null,
      sourceSeat:row.sourceSeat??null,status,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      exactFullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
      actualStarterSeat:row.actualStarterSeat??null,
      nativeSetupCoin:row.nativeSetupCoinChoiceReceipt?.status??null,
      physicalZoneStatus:row.physicalZoneQualification?.status??null,
      nativeEndReason:row.endReason??null,
      nativeError:String(row.error??'').slice(0,180),
      ownerOpening:receipt
    });
  }
  return {dispositions,starts,firstTurnRoots,observations,
    originalFirstTurnNativeCompetenceQualified:false};
}

/** Run complete preregistration once, storing all successes and failures. */
function run(){
  const inspected=preflight();
  const {assertNoUnreviewedAmbientAgentEnvironment,assertPinnedNativeStore}=
    require('./agent41-frozen-bilateral-development-v1.cjs');
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  assertPinnedNativeStore(ROOT,profile);
  const prior={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    prior[key]=process.env[key];
    process.env[key]=value;
  }
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const reported=runDevelopment({
      ...profile.policyOptions,
      allowAdditionalOriginalSourceRanks:true,
      registeredTrials:scheduledArms(),
      registeredFrameName:VERSION
    });
    const rows=reported.rows??[];
    return {
      version:VERSION,inspected,registration,
      researchHeadCommit:process.env.GITHUB_SHA??null,
      enginePin:profile.pinnedVendorRevision,
      attempted:reported.attempted,
      expectedAttempts:16,
      registrationComplete:rows.length===16,
      ...summarize(rows),
      paired:reported.sourcePairs??reported.paired??null,
      allNativeDevelopmentRows:rows,
      competitivelyQualifiedGames:0,
      winRateCertified:false,
      caveat:'Natural original rank16 Store policy observed with no rank16-specific correction. All initial source deals, caps, aborted games and native outcomes retained. No first-turn tactical competency, paper legality or game win rate certified.'
    };
  }finally{
    for(const [key,value] of Object.entries(prior)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module){
  const inspect=process.argv.includes('--inspect-only');
  const result=inspect?preflight():run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!inspect&&!result.registrationComplete)process.exitCode=1;
}
module.exports={VERSION,scheduledArms,preflight,originalOpeningReceipt,summarize,run};
