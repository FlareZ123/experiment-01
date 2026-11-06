'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent13-rank5-selfcopy-maxmiracle-prospective-20261106.json');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {classifyNativeAttempt}=require('./agent41-native-attempt-disposition.cjs');
const {withIndependentSeatRng}=
  require('../twinleaf/agent19-independent-seat-rng.cjs');
const {withPaperMewEnergyMixShuffle}=
  require('../twinleaf/agent19-energy-mix-shuffle-hook.cjs');
const {withPaperAttachEnergyBlockedTo}=
  require('../twinleaf/agent19-paper-attach-energy-target-guard.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const ROOT=path.resolve(__dirname,'../..');
const OUTPUT=path.join(ROOT,'agent13-rank5-selfcopy-maxmiracle-32arm.json');
const VERSION='agent13-rank5-selfcopy-maxmiracle-prospective-v1';
const BLOBS={
  'results/aichi-2026/registrations/agent13-rank5-selfcopy-maxmiracle-prospective-20261106.json':'97f96358030fc7c0b47cdf058c5da2cd449f1a09',
  'simulation/evaluation/agent41-frozen-bilateral-development-v2.json':'a79e7977cb224928068968934bbcfa9c9410e20a',
  'results/aichi-2026/full-decklists.json':'ae773f6201d7aa69d31914dbfee66f3fba692200',
  'simulation/evaluation/agent41-bilateral-v2-development.cjs':'537157dff43fefa1a429f6e0bb72387cde51708d',
  'simulation/evaluation/agent7-canonical-actor-composition.cjs':'118bbfa6d78cd09dd1b7f11ecdb05f1e9f655277',
  'simulation/twinleaf/agent13-actor-only-choose-attack.cjs':'33a62244bdaf93d9739abe8b07c334bc304fa299',
  'simulation/twinleaf/agent19-independent-seat-rng.cjs':'b336b7d79f40fec62713d46667318ac4e109cdbc',
  'simulation/twinleaf/agent19-energy-mix-shuffle-hook.cjs':'2eb5bc052daedcd1a3754bed018d08dbc45b4782',
  'simulation/twinleaf/agent19-paper-attach-energy-target-guard.cjs':'07eddd091f9bdd61b87fc125a88488cd768caa1a'
};
/** @param {Buffer} b @returns {string} */
function blob(b){
  return createHash('sha1').update('blob '+b.length+'\\0'.replace('\\0','\0')).update(b).digest('hex');
}
/** @param {object} row @returns {object} */
function diagnostic(row){
  const choices=row?.policyAudit?.detailedComponentAudits?.chooseAttack?.selections??[];
  const sourceChoices=choices.filter(x=>x.seat===row?.sourceSeat);
  const settlement=row?.sourceAttackSettlement?.attacks??[];
  const copied=settlement.filter(x=>x.attackName==='Cross Fusion Strike'&&
    x.settledPromptChain===true&&x.settlementCrossesClockReset!==true);
  return {id:row?.trial?.id??null,seed:row?.trial?.seed??null,
    sourceSeat:row?.sourceSeat??null,sourceFirst:row?.sourceActuallyFirst??null,
    sourceDeal:row?.sourceDealFingerprint??null,
    fullDeal:row?.fullPhysicalDealFingerprint??null,
    native:classifyNativeAttempt(row).kind,error:row?.error??null,
    rootCount:row?.rootActionLedger?.length??0,
    rootDigest:row?.rootActionLedgerSha256??null,
    sourceCopyChoices:{selfCopy:sourceChoices.filter(x=>
      x.printing==='Mew VMAX FST'&&x.attack==='Cross Fusion Strike').length,
      maxMiracle:sourceChoices.filter(x=>
        x.printing==='Mew VMAX FST'&&x.attack==='Max Miracle').length,
      technoBlast:sourceChoices.filter(x=>
        x.printing==='Genesect V FST'&&x.attack==='Techno Blast').length,
      recorded:sourceChoices.length},
    sourceCopySettled:copied.length,
    sourcePublicBoardChanges:copied.filter(x=>JSON.stringify(x.publicBoardBefore)!==
      JSON.stringify(x.publicBoardAfter)).length,
    sourcePrizeChangeCount:copied.filter(x=>
      x.prizesBefore!==x.prizesAfter).length,
    candidateRepliesRecorded:row?.candidateRepliesAfterSourceAttacks?.length??0,
    qualified:false};
}
/** Validate source list, source-independent policy and immutable registration. */
function inspect(){
  assert.equal(registration.schema,VERSION);
  assert.deepEqual(registration.modeNames,
    ['control-selfcopy-option-off','treatment-same-donor-maxmiracle-opt-in']);
  assert.equal(registration.expectedNativeAttempts,32);
  assert.equal(registration.registeredTrials.length,16);
  assert.equal(new Set(registration.registeredPhysicalGroups.map(x=>x.seed)).size,8);
  for(const [p,sha] of Object.entries(BLOBS)){
    const b=fs.readFileSync(path.join(ROOT,p));
    assert.equal(blob(b),sha,'Registered Git blob drift: '+p);
  }
  const source=require('../../results/aichi-2026/full-decklists.json');
  const rank5=source.decks.find(x=>x.rank===5);
  assert.equal(rank5?.archetype,'Mew Genesect');
  assert.equal(rank5.cards.reduce((n,x)=>n+x.count,0),60);
  for(const [name,set,number,count] of [
    ['Mew VMAX','FST','114',3],['Genesect V','FST','185',4],
    ['Double Colorless Energy','SUM','136',4]]){
    assert.equal(rank5.cards.find(x=>x.name===name&&
      x.printing.set===set&&String(x.printing.number)===number)?.count,count);
  }
  assert.equal(profile.pinnedVendorRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  return {version:VERSION,registeredBlobSha:BLOBS[
    'results/aichi-2026/registrations/agent13-rank5-selfcopy-maxmiracle-prospective-20261106.json'],
    auditedSourceRank:5,registeredTrials:16,intendedNativeAttempts:32,
    pinnedNative:profile.pinnedVendorRevision,competitivelyQualifiedGames:0};
}
/** Atomic durable archive with exclusive process lock. */
function archive(payload){
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(payload,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(temp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function run(){
  const preflight=inspect();
  const ambient='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
  assert.equal(process.env[ambient],undefined);
  const previous=process.env[ambient];
  process.env[ambient]='true';
  const modes=[];
  let rngAudit=null;
  try{
    const wrapped=withIndependentSeatRng(()=>{
      for(const name of registration.modeNames){
        const treatment=name==='treatment-same-donor-maxmiracle-opt-in';
        const options={...profile.policyOptions,
          ...registration.policyCommonOptions,
          actorMewMaxMiracleOverSelfCopy:treatment,
          nativeRootActionLimit:registration.nativeRootActionLimit,
          registeredTrials:registration.registeredTrials,
          registeredFrameName:VERSION,
          allowAdditionalOriginalSourceRanks:true};
        const result=withPaperAttachEnergyBlockedTo(()=>
          withPaperMewEnergyMixShuffle(()=>runDevelopment(options)));
        assert.equal(result.result.result.attempted,16);
        assert.equal(result.result.result.rows.length,16);
        modes.push({name,treatment,options,
          native:result.result.result,
          guardAudit:result.audit,shuffleAudit:result.result.audit,
          diagnostics:result.result.result.rows.map(diagnostic)});
      }
      return null;
    });
    rngAudit=wrapped.audit;
    assert.equal(rngAudit.matches,32);
  }finally{
    if(previous===undefined)delete process.env[ambient];
    else process.env[ambient]=previous;
  }
  const matched=registration.registeredTrials.map(trial=>{
    const a=modes[0].diagnostics.find(x=>x.id===trial.id);
    const b=modes[1].diagnostics.find(x=>x.id===trial.id);
    assert.ok(a&&b,'Every registered trial must be retained');
    return {id:trial.id,seed:trial.seed,stratum:trial.stratum,
      sameSourceDeal:Boolean(a.sourceDeal&&a.sourceDeal===b.sourceDeal),
      sameFullDeal:Boolean(a.fullDeal&&a.fullDeal===b.fullDeal),
      sameStartingSeat:a.sourceSeat===b.sourceSeat&&a.sourceFirst===b.sourceFirst,
      native:[a.native,b.native],rootDigestEqual:a.rootDigest===b.rootDigest,
      choices:[a.sourceCopyChoices,b.sourceCopyChoices],
      copiedSettlements:[a.sourceCopySettled,b.sourceCopySettled],
      publicBoardChanges:[a.sourcePublicBoardChanges,b.sourcePublicBoardChanges],
      prizeChanges:[a.sourcePrizeChangeCount,b.sourcePrizeChangeCount],
      candidateReplyEntries:[a.candidateRepliesRecorded,b.candidateRepliesRecorded],
      qualified:false};
  });
  const summary={version:VERSION,attempted:32,
    retained:modes.reduce((n,x)=>n+x.diagnostics.length,0),
    originalSourceRank:5,unchangedSource60:true,
    pairedSourceDeals:matched.filter(x=>x.sameSourceDeal).length,
    pairedFullDeals:matched.filter(x=>x.sameFullDeal).length,
    pairedStartingSeats:matched.filter(x=>x.sameStartingSeat).length,
    comparablePairs:matched.length,
    sourceSelfCopySelections:modes.map(m=>m.diagnostics.reduce((n,x)=>
      n+x.sourceCopyChoices.selfCopy,0)),
    sourceMaxMiracleSelections:modes.map(m=>m.diagnostics.reduce((n,x)=>
      n+x.sourceCopyChoices.maxMiracle,0)),
    sourceTechnoBlastSelections:modes.map(m=>m.diagnostics.reduce((n,x)=>
      n+x.sourceCopyChoices.technoBlast,0)),
    sourceCrossFusionSettled:modes.map(m=>m.diagnostics.reduce((n,x)=>
      n+x.sourceCopySettled,0)),
    nativeDispositions:modes.map(m=>m.diagnostics.reduce((q,x)=>{
      q[x.native]=(q[x.native]??0)+1;return q;
    },{})),
    historicalStratumSelected:true,freshStratumProspectivelyRegistered:true,
    actualOpponentCompetenceUnknown:true,
    paperQualifiedGames:0,competitivelyQualifiedGames:0,
    winRateClaim:null};
  const output={schema:VERSION,preflight,registration,summary,matched,
    rngAudit,modes,qualification:'developmental-only',
    caveat:'Both seats use identical actor policy except registered opt-in. Native terminals, selected historical canaries and fresh source games are not competitive paper match evidence.'};
  archive(output);
  process.stdout.write('AGENT13_MEW_SELFCOPY_NATIVE '+JSON.stringify({
    preflight,summary,matched,output:path.basename(OUTPUT)})+'\n');
  return output;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(inspect(),null,2)+'\n');
  else run();
}
module.exports={VERSION,BLOBS,blob,inspect,diagnostic,run};
