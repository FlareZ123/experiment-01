'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const reg=require('../../../results/aichi-2026/registrations/2026-11/agent35-three-architecture-eight-rank-prospective-20261109.json');
const hood=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
const safeguard=require('../../../results/aichi-2026/candidate-iron-thorns-safeguard-pivot-v1.json');
const roster=require('../../../results/aichi-2026/full-decklists.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {classifyNativeAttempt}=
  require('../agent41-native-attempt-disposition.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF,VERSION:PROFILE}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=process.env.AGENT35_ARCHITECTURE_OUTPUT??
  path.join(ROOT,'artifacts/agent35-three-architecture-eight-rank-48-native.json');
const VERSION='agent35-three-architecture-original-eight-rank-prospective-v1';
const IDS=Object.freeze(['champion-reference','hood-shield-v1',
  'thorns-safeguard-pivot-v1']);
const ROOT_POLICY=Object.freeze({
  actorOnlyComposition:true,
  actorMewMaxMiracleOverSelfCopy:true,
  actorMewGenesectTechnoBlast:true,
  actorMewDceRecipientRoot:true,
  actorMewDceRecipientSourceOnly:true,
  actorDceMewMobilityRoot:true,
  actorGenesectFusionDrawRoot:true,
  actorNaturalEvolutionRoot:true,
  bilateralBasicEnergyRecipientFrontier:true,
  actorUnderworldDoorPromptOwner:true,
  actorUnderworldDoorRoot:true,
  nativeAllOwnerPassFrontier:true,
  actorGuzmaPromptContinuation:true,
  actorZeroEnergyStrandFloatStoneRoot:true,
  actorSeekerGuzmaNominalKo:true
});
const PAPER_PROFILE=Object.freeze({
  celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
});

/** @param {string} relativePath @returns {string} Actual Git-compatible blob hash. */
function gitBlob(relativePath){
  const bytes=fs.readFileSync(path.join(ROOT,relativePath));
  return createHash('sha1')
    .update('blob '+bytes.length+'\0').update(bytes).digest('hex');
}

/** Enforce frozen before-game decklists, original 60s, source groups, policy. */
function preflight(){
  assert.equal(reg.schema,VERSION);
  assert.equal(reg.status,'FROZEN BEFORE FIRST NATIVE GAME');
  assert.equal(reg.nativeAttempts,48);
  assert.equal(reg.sourceGroupCount,16);
  assert.equal(reg.rootCap,260);
  assert.equal(reg.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(reg.paperProfile,PROFILE);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  assert.deepEqual(reg.sourceRanks,[1,2,5,6,7,11,24,29]);
  assert.deepEqual(reg.fixedContenders.map(x=>x.id),IDS);
  for(const printed of reg.fixedContenders.filter(x=>x.path)){
    assert.equal(gitBlob(printed.path),printed.gitBlobSha,
      'Immutable printed candidate drift: '+printed.id);
  }
  for(const [file,digest] of [
    [reg.sourceRosterPath,reg.sourceRosterGitBlobSha],
    [reg.sharedPolicyPath,reg.sharedPolicyGitBlobSha]
  ])assert.equal(gitBlob(file),digest,'Registered input drift: '+file);
  const champion=roster.decks.find(x=>x.rank===1);
  assert.ok(champion&&Array.isArray(champion.cards));
  const candidates=[champion,hood,safeguard];
  for(const candidate of candidates){
    assert.equal(candidate.cards.reduce((n,c)=>n+c.count,0),60);
    assert.ok(candidate.cards.every(c=>c.count>=1&&
      Number.isSafeInteger(c.count)&&typeof c.name==='string'));
  }
  assert.equal(reg.sourceGroups.length,16);
  assert.equal(reg.registeredTrials.length,48);
  const allowed=require('../agent25-authenticated-source-admission.cjs')
    .authenticatedSourceRanks(roster,true);
  for(const id of IDS){
    const rows=reg.registeredTrials.filter(x=>x.candidateId===id);
    assert.equal(rows.length,16);
    validateRegisteredTrialGroups(rows,allowed,false,true);
  }
  assert.equal(new Set(reg.sourceGroups.map(x=>x.seed)).size,16);
  assert.equal(new Set(reg.registeredTrials.map(x=>x.id)).size,48);
  for(const group of reg.sourceGroups){
    const match=reg.registeredTrials.filter(t=>
      t.rank===group.rank&&t.repeat===group.repeat&&
      t.candidateSlot===group.candidateSlot);
    assert.deepEqual(match.map(x=>x.candidateId),IDS);
    assert.ok(match.every(x=>x.seed===group.seed));
  }
  return {sources:reg.sourceRanks,physicalGroups:16,nativeGames:48,
    pinnedTwinleaf:PINNED_TWINLEAF};
}

/** @param {object} row @returns {object} Native gameplay-only receipt. */
function receipt(row){
  const trial=row.trial;
  const roots=row.rootActionLedger??
    row.nativeAbortEvidence?.rootActionLedger??[];
  const status=classifyNativeAttempt(row).kind;
  const finished=status==='ENGINE_TERMINAL'&&row.finished===true;
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const candidateAttacks=roots.filter(root=>
    root.playerSlot===candidateSeat&&root.action==='AttackAction');
  const attacks=name=>candidateAttacks.filter(r=>r.attack===name).length;
  const played=name=>roots.filter(r=>
    r.playerSlot===candidateSeat&&r.action==='PlayCardAction'&&
    (r.card===name||r.card?.startsWith(name+' '))).length;
  return {
    trialId:trial.id,rank:trial.rank,seed:trial.seed,
    candidateSlot:trial.candidateSlot,candidateId:trial.candidateId,
    candidateSeat,status,finished,nativeWinner:finished?row.winner:null,
    nativeCandidateWin:finished&&row.winner===candidateSeat,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    roots:roots.length,sourceAttackDeclarations:row.attackDeclarations?.source??0,
    candidateAttackDeclarations:row.attackDeclarations?.candidate??0,
    ghostEye:attacks('Ghost Eye'),maxGeist:attacks('Max Geist'),
    voltCyclone:attacks('Volt Cyclone'),getLost:attacks('Get Lost'),
    arvenPlayed:played('Arven'),hoodPlayed:played('Stealthy Hood'),
    censoredReason:finished?null:row.error?'engine-error':'root-cap',
    nativeError:row.error?String(row.error).slice(0,1500):null,
    paperQualified:false
  };
}

/**
 * Sharp fixed-group win-count range for one challenger vs another.
 * Unknown/error/capped results can be either win or loss; groups with
 * mismatched original source openings are excluded from paired inference.
 */
function compareTwo(groups,leftId,rightId){
  const matched=[];
  for(const group of groups){
    const a=group.rows[leftId],b=group.rows[rightId];
    const same=Boolean(a.sourceDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint&&
      a.actualStarterSeat!==null&&
      a.actualStarterSeat===b.actualStarterSeat);
    if(!same)continue;
    const va=a.finished?Number(a.nativeCandidateWin):null;
    const vb=b.finished?Number(b.nativeCandidateWin):null;
    matched.push({
      group:[group.rank,group.slot,group.seed].join(':'),
      leftStatus:a.status,rightStatus:b.status,
      doubleTerminal:a.finished&&b.finished,
      leftWin:va,rightWin:vb,
      lower:(vb??0)-(va??1),
      upper:(vb??1)-(va??0)
    });
  }
  return {left:leftId,right:rightId,matchedGroups:matched.length,
    doubleTerminal:matched.filter(x=>x.doubleTerminal).length,
    sharpNativeWinDifferenceRightMinusLeft:{
      lower:matched.reduce((n,x)=>n+x.lower,0),
      upper:matched.reduce((n,x)=>n+x.upper,0)},
    nativeWinReversalsAgainstLeft:matched.filter(x=>
      x.doubleTerminal&&x.leftWin===0&&x.rightWin===1).length,
    nativeWinReversalsForLeft:matched.filter(x=>
      x.doubleTerminal&&x.leftWin===1&&x.rightWin===0).length,
    matched};
}

/** Compare all immutable architecture choices without imputing censored games. */
function compare(records){
  assert.equal(records.length,48);
  const byId=new Map(records.map(x=>[x.trialId,x]));
  assert.equal(byId.size,48);
  const groups=reg.sourceGroups.map(source=>{
    const key=[source.rank,source.repeat,source.candidateSlot].join(':');
    const rows=Object.fromEntries(IDS.map(id=>{
      const row=byId.get(key+':'+id);
      assert.ok(row,'Missing exact frozen attempt '+key+':'+id);
      return [id,row];
    }));
    const openings=IDS.map(id=>rows[id].sourceDealFingerprint);
    const starters=IDS.map(id=>rows[id].actualStarterSeat);
    const allSourceMatched=Boolean(openings[0]&&
      openings.every(x=>x===openings[0])&&
      starters[0]!==null&&starters.every(x=>x===starters[0]));
    return {rank:source.rank,repeat:source.repeat,slot:source.candidateSlot,
      seed:source.seed,allThreeSourceMatched:allSourceMatched,rows};
  });
  const perCandidate=Object.fromEntries(IDS.map(id=>{
    const rows=groups.map(g=>g.rows[id]);
    const sum=key=>rows.reduce((n,x)=>n+x[key],0);
    return [id,{
      attempts:rows.length,terminal:rows.filter(x=>x.finished).length,
      candidateWins:rows.filter(x=>x.nativeCandidateWin).length,
      nativeErrors:rows.filter(x=>x.status==='NATIVE_ABORT').length,
      nativeCaps:rows.filter(x=>x.status==='ACTION_CAP').length,
      ghostEye:sum('ghostEye'),maxGeist:sum('maxGeist'),
      voltCyclone:sum('voltCyclone'),getLost:sum('getLost'),
      hoodPlayed:sum('hoodPlayed'),arvenPlayed:sum('arvenPlayed')
    }];
  }));
  return {summary:{
    registeredSourceGroups:16,nativeGames:48,
    allThreeMatchedSourceGroups:groups.filter(g=>g.allThreeSourceMatched).length,
    perCandidate,pairwise:[
      compareTwo(groups,IDS[0],IDS[1]),
      compareTwo(groups,IDS[0],IDS[2]),
      compareTwo(groups,IDS[1],IDS[2])
    ],competitivelyPaperQualifiedGames:0
  },groups};
}

/** Full native fixed60 three-arm tournament-source architecture screen. */
function run({runner=runDevelopment,profile=withPaperSemanticsProfileV1}={}){
  const preflightResult=preflight();
  const beforePayment=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  const beforeMimikyu=process.env.AGENT12_TEMPLE_THORNS_OWNER_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  process.env.AGENT12_TEMPLE_THORNS_OWNER_DEV='true';
  let wrapped;
  try{
    wrapped=profile(()=>{
      const rows=[];
      for(const id of IDS){
        const trials=reg.registeredTrials.filter(t=>t.candidateId===id);
        const actual=runner({
          ...frozen.policyOptions,...ROOT_POLICY,
          registeredCandidateDecks:{
            'hood-shield-v1':{label:'hood-shield-v1',cards:hood.cards},
            'thorns-safeguard-pivot-v1':{
              label:'thorns-safeguard-pivot-v1',cards:safeguard.cards}
          },
          registeredTrials:trials,
          registeredFrameName:VERSION+':'+id,
          allowSingleCandidatePerGroup:true,
          allowAdditionalOriginalSourceRanks:true,
          nativeRootActionLimit:reg.rootCap,
          isolatePolicyRandomness:true,
          isolatePhysicalShuffleRandomnessAfterSetup:true
        });
        assert.equal(actual.attempted,16);
        assert.equal(actual.rows.length,16);
        rows.push(...actual.rows);
      }
      const map=new Map(rows.map(x=>[x.trial.id,x]));
      assert.equal(map.size,48);
      return {attempted:48,rows:reg.registeredTrials.map(trial=>{
        const row=map.get(trial.id);
        assert.ok(row,'Lost printed-60 native attempt '+trial.id);
        return row;
      })};
    },PAPER_PROFILE);
  }finally{
    for(const [key,prior] of [
      ['AGENT4_NATIVE_PAYMENT_RECEIPT_DEV',beforePayment],
      ['AGENT12_TEMPLE_THORNS_OWNER_DEV',beforeMimikyu]]){
      if(prior===undefined)delete process.env[key];
      else process.env[key]=prior;
    }
  }
  assert.equal(wrapped.result.attempted,48);
  const observed=wrapped.result.rows.map(receipt);
  const result=compare(observed);
  return {
    schema:VERSION,registration:reg.schema,preflight:preflightResult,
    nativeEngine:PINNED_TWINLEAF,sharedActorPolicy:ROOT_POLICY,
    paperProfile:PROFILE,sharedPaperAudit:wrapped.audit,
    commonMimikyuOwnerPilot:true,
    commonMimikyuOwnerPilotSource:'agent12-thorns-mimikyu-temple-owner',
    referenceCommit:process.env.GITHUB_SHA??null,
    summary:result.summary,groups:result.groups,
    allNativeRows:wrapped.result.rows,
    developmentOnly:true,paperQualifiedGames:0,claim99Point5:false
  };
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    process.stdout.write(JSON.stringify(preflight())+'\n');
  }else{
    const report=run();
    save(OUTPUT,report);
    process.stdout.write('AGENT35_ARCHITECTURE_48 '+
      JSON.stringify({
        registration:report.registration,
        allThreeMatchedSourceGroups:
          report.summary.allThreeMatchedSourceGroups,
        perCandidate:report.summary.perCandidate,
        pairwise:report.summary.pairwise.map(x=>({
          left:x.left,right:x.right,matchedGroups:x.matchedGroups,
          doubleTerminal:x.doubleTerminal,
          sharpRange:x.sharpNativeWinDifferenceRightMinusLeft
        })),
        artifact:OUTPUT,paperQualifiedGames:0
      })+'\n');
  }
}
module.exports={VERSION,IDS,ROOT_POLICY,PAPER_PROFILE,
  gitBlob,preflight,receipt,compareTwo,compare,run};
