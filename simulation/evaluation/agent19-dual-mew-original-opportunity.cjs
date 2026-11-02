'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch,initializeCards}=require('../twinleaf/headless.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withPublicMirrorObserver}=
  require('../twinleaf/agent19-dual-mew-source-observer.cjs');
const root=path.resolve(__dirname,'../..');
const registration=JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/registrations/agent19-dualmew-rank3-7-source-dealt-20261102.json'),'utf8'));
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');

/** Original printed exact sixty card conversion from shared legal resolver. */
function decks(){
  const p=planAichi(5,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  assert.equal(p.candidate.cards?.length,60);
  const others={};
  for(const rank of [3,7]){
    const row=p.opponents.find(x=>x.rank===rank);
    assert.equal(row?.status,'ready');
    assert.equal(row.cards.length,60);
    others[rank]=row.cards;
  }
  return {mew:p.candidate.cards,others,roster:p.manifestDigest};
}

/** Registered independent, unchanged physical deals. */
function schedule(){
  const rows=[];
  for(const rank of registration.opponentRanks)
    for(const seat of registration.originalMewSeat)
      for(const [repeat,seed] of registration.seedSchedule[rank][seat].entries())
        rows.push({rank,seat,repeat,seed});
  assert.equal(rows.length,registration.exactPhysicalDeals);
  assert.equal(new Set(rows.map(x=>x.seed)).size,rows.length);
  return rows;
}

/** @param {object} caseInfo Exact source original deal. @param {object} cardLists */
function attempt(caseInfo,cardLists){
  const {rank,seat,seed}=caseInfo;
  const req={deckA:seat===0?cardLists.mew:cardLists.others[rank],
    deckB:seat===1?cardLists.mew:cardLists.others[rank],
    seed,maxActions:registration.maxNativeRootActionsPerDeal,
    label:'agent19-dualmew-'+rank+'-'+seat+'-'+caseInfo.repeat,
    strictPromptValidation:true,mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
    captureInitialSourceDealFingerprintSeat:seat,
    captureNativeAbortEvidence:true,capturePublicAttackTransitions:true};
  try{
    const monitored=withPublicMirrorObserver(()=>
      withCanonicalActorOnlyPolicy(()=>runMatch(req),{
        root:next=>withActorOnlyRootPolicy(next,{
          naturalEvolutionRoot:true,publicContextSpecialEnergy:true,
          specialEnergyRoot:true
        })
      },{ownerSingleSearch:true,genericFallbackAttribution:true,
        preferMewGenesectTechnoBlast:true}),seat);
    const game=monitored.result.result;
    const actor=monitored.result.audit;
    const roots=game.rootActionLedger??[];
    return {caseInfo,status:game.finished?'engine-terminal':'action-cap-or-incomplete',
      actualFirstSeat:game.firstTurnSlot??null,
      actionCount:game.actions??null,engineWinner:game.winner??null,
      originalSourceDeal:game.initialSourceDealFingerprint?.digestSha256??null,
      fullPhysicalDeal:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      monitor:monitored.audit,
      evolutionRoots:roots.filter(x=>x.playerSlot===seat&&
        x.action==='PlayCardAction'&&
        x.card?.startsWith('Mew VMAX')).map(x=>
        ({turn:x.turnBefore,actionOrdinal:x.actionOrdinal,card:x.card})),
      sourceAttackNames:roots.filter(x=>x.playerSlot===seat&&
        x.action==='AttackAction').map(x=>x.card??x.detail??null),
      copiedChoices:actor.detailedComponentAudits?.chooseAttack?.selections
        ?.filter(x=>x.seat===seat)??[],
      gameQualified:false};
  }catch(error){
    return {caseInfo,status:'native-error',
      error:String(error?.stack??error).slice(0,2000),gameQualified:false};
  }
}

/** @param {object[]} rows The full denominator, failures retained. */
function summarize(rows){
  const visible=rows.filter(x=>x.monitor);
  const count=key=>visible.filter(x=>x.monitor[key]>0).length;
  return {attempts:rows.length,nativeErrors:rows.length-visible.length,
    engineTerminals:rows.filter(x=>x.status==='engine-terminal').length,
    actionCaps:rows.filter(x=>x.status==='action-cap-or-incomplete').length,
    twoMewBoards:count('dualBoard'),withDce:count('dualWithDce'),
    versusPal:count('dualVsPal'),
    allPublicRequirements:count('fullPublicBoard'),
    offeredCopyMenus:count('actualOfferedMirror'),
    qualifiedCompetitiveGames:0,demonstratedWinRate:null};
}
function run(){
  initializeCards();const cards=decks();
  const rows=schedule().map(t=>attempt(t,cards));
  return {schema:registration.schema,registeredSeedsSha256:digest(registration.seedSchedule),
    rosterDigest:cards.roster,enginePin:registration.pinnedVendor,
    originalMew60Digest:digest(cards.mew),originalRank3Digest:digest(cards.others[3]),
    originalRank7Digest:digest(cards.others[7]),rows,summary:summarize(rows),
    caveat:'Developmental owner-visible source-dealt opportunity only. Weak bot, incomplete clock and censoring prevent competitive inference.'};
}
function save(data){
  const out=path.join(root,'agent19-dualmew-original-opportunity.json');
  const lock=out+'.lock';
  const fd=fs.openSync(lock,'wx');
  try{
    const tmp=out+'.tmp';
    fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n');
    fs.renameSync(tmp,out);
  }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
if(require.main===module)save(run());
module.exports={registration,decks,schedule,attempt,summarize,run};
