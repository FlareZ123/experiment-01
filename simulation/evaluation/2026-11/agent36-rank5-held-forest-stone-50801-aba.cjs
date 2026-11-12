'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {arm,firstDifference,firstPhysicalDivergence}=
  require('./agent20-rank5-gengar-tempo-aba.cjs');
const {perfectionPrizeReceipts}=
  require('./agent36-perfection-prize-receipts.cjs');
const {inspectNativeGameCarryover}=
  require('./agent43-native-attack-damage-carryover.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const SOURCE='results/aichi-2026/registrations/' +
  'agent50-rank5-gengar-resource-v3-fresh-eight-20261109.json';
const OUTPUT=path.join(ROOT,
  'artifacts/agent36-rank5-held-forest-stone-50801-aba.json');
const hash=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/** The root audit is the authoritative record that the requested hook reached
 * the real actor policy; caller-side flags alone are not sufficient. */
function forestSealRootPolicy(record){
  const root=record.actorPolicy?.detailedComponentAudits?.root??null;
  return {
    optIn:typeof root?.earlyForestSealRootOptIn==='boolean'?
      root.earlyForestSealRootOptIn:null,
    ownerSeat:root?.earlyForestSealRootOwnerSeat??null
  };
}

/** Find a real post-Store point where this owner holds Stone and has the
 * known Galarian Articuno V Tool slot. This is diagnostic, not a legality
 * claim or a policy input. */
function heldStoneOpportunity(record,seat){
  assert.ok(seat===0||seat===1);
  for(const root of record.physicalTape?.postAcceptedRoots??[]){
    if(root.actorSeat!==seat)continue;
    const owner=root.physicalZones?.[seat];
    if(!owner)continue;
    const held=owner.hand?.some(card=>
      card.printing==='Forest Seal Stone SIT')??false;
    if(!held)continue;
    const slots=[owner.active,...(owner.bench??[])].filter(Boolean);
    const holder=slots.find(slot=>
      slot.cards?.some(card=>
        card.printing==='Galarian Articuno V CRE')&&
      Array.isArray(slot.tools)&&slot.tools.length===0);
    if(holder)return {
      seat,rootOrdinal:root.rootOrdinal,turnBefore:root.turnBefore,
      heldPrinting:'Forest Seal Stone SIT',
      openHolderPrinting:'Galarian Articuno V CRE'
    };
  }
  return null;
}

/** Additive native-public two-hit telemetry. It preserves original attack
 * declaration counts and never promotes public continuity to paper proof. */
function nativeAttackDamageCarryover(record){
  assert.ok(Array.isArray(record.sourceAttackSettlement?.attacks),
    'Shared arm must preserve source attack settlement stream');
  assert.ok(Array.isArray(record.candidateAttackSettlement?.attacks),
    'Shared arm must preserve candidate attack settlement stream');
  return inspectNativeGameCarryover({
    trial:record.trial??null,
    sourceSeat:record.sourceSeat,candidateSeat:record.candidateSeat,
    rootActionLedger:record.roots,
    sourceAttackSettlement:record.sourceAttackSettlement,
    candidateAttackSettlement:record.candidateAttackSettlement
  });
}

/** Historical one-sided resource-strand from already published fresh v3 run. */
function originalTrial() {
  const raw=fs.readFileSync(path.join(ROOT,SOURCE),'utf8');
  const reg=JSON.parse(raw);
  const trial=reg.registeredTrials.find(t=>t.repeat===50801);
  assert.deepEqual(trial,{
    rank:5,repeat:50801,candidateSlot:'A',seed:3719950840,
    candidateId:'new-moon-lockbreaker-v1',
    id:'5:50801:A:new-moon-lockbreaker-v1'
  });
  return {trial,sourceRegistrationSha256:createHash('sha256')
    .update(raw).digest('hex')};
}

function summarize(record) {
  const forestSealPolicy=forestSealRootPolicy(record);
  const opportunity=heldStoneOpportunity(record,record.candidateSeat);
  const carryover=record.nativeAttackDamageCarryover??
    nativeAttackDamageCarryover(record);
  const rawPaper=record.fullNativePaperRootReceipts??null;
  const fullNativePaperRootReceiptSummary=rawPaper?{
    schema:rawPaper.schema,
    acceptedStoreRootCount:rawPaper.acceptedStoreRootCount,
    rootOrdinalsUnique:rawPaper.rootOrdinalsUnique,
    settledPhysicalIdentityClean:rawPaper.settledPhysicalIdentityClean,
    paperPaymentReviewed:rawPaper.paperPaymentReviewed,
    clockReviewed:rawPaper.clockReviewed,
    competitiveGameQualified:rawPaper.competitiveGameQualified,
    sha256:hash(rawPaper)
  }:null;
  const seats=[0,1].map(seat=>{}
    const selected=record.roots.filter(r=>r.playerSlot===seat);
    return {seat,forestStonePlayRoots:selected
      .filter(r=>r.action==='PlayCardAction'&&r.card==='Forest Seal Stone')
      .map(r=>r.actionOrdinal),
    starAlchemyRoots:selected
      .filter(r=>r.action==='UseAbilityAction'&&r.ability==='Star Alchemy')
      .map(r=>r.actionOrdinal),
    ordinaryAttacks:selected
      .filter(r=>r.action==='AttackAction')
      .map(r=>({root:r.actionOrdinal,attack:r.attack})),
    perfectionInitiations:selected
      .filter(r=>r.action==='UseAbilityAction'&&r.ability==='Perfection')
      .map(r=>r.actionOrdinal)};
  });
  return {
    phase:record.phase,terminal:record.nativeFinished,
    winner:record.nativeWinner,remainingPrizes:record.remainingPrizes,
    error:record.nativeError,rootCount:record.roots.length,
    fullFingerprint:record.fullFingerprint,
    sourceFingerprint:record.sourceFingerprint,
    fullRootLedgerSha256:record.rootLedgerSha256,
    physicalSha256:record.physicalTape?.allRootPhysicalZonesSha256,
    forestSealRootPolicy:forestSealPolicy,
    heldStoneOpportunity:opportunity,
    nativeAttackDamageCarryover:carryover,
    fullNativePaperRootReceiptSummary,
    seats,
    candidatePerfectionPrizeReceipts:record.rootPhysicalLinked?
      perfectionPrizeReceipts(record.roots,record.physicalTape,0):null
  };
}

function save(value) {
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    const data=fs.openSync(temp,'r');
    try{fs.fsyncSync(data);}finally{fs.closeSync(data);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

/**
 * Posthoc known held-Stone opportunity: v3 baseline / both-seat owner
 * Forest Seal Stone + Star Alchemy / repeated v3 baseline. This is a genuine
 * game-policy counterfactual. Source and candidate decks and physical opening
 * are frozen, but selected after seeing original 50801's bad outcome.
 */
function main(){
  const {trial,sourceRegistrationSha256}=originalTrial();
  const common={caseId:'agent36-observed-rank5-50801-stone-posthoc',
    rootCap:320,registeredTrials:[trial]};
  const modes=[
    {phase:'A-v3-no-Stone',earlyForestSealRoot:false},
    {phase:'B-v3-symmetric-Stone',earlyForestSealRoot:true},
    {phase:'A-v3-repeat',earlyForestSealRoot:false}
  ];
  const games=modes.map(mode=>arm(mode.phase,false,common,{
    resourceV3:true,ownerLillieAfterPass:true,
    minOpponentHandCount:6,
    earlyForestSealRoot:mode.earlyForestSealRoot,
    captureFullNativePaperReceipts:true
  }));
  // Fail closed if the arm's requested Forest Seal Stone treatment did not
  // reach the real native actor-root policy. The old 23:00 run predated the
  // corrected bilateral option mapping and silently left B disabled.
  for(let i=0;i<games.length;i++){
    const policy=forestSealRootPolicy(games[i]);
    assert.equal(policy.optIn,modes[i].earlyForestSealRoot,
      modes[i].phase+' Forest Seal Stone root opt-in must be acknowledged');
    assert.equal(policy.ownerSeat,null,
      modes[i].phase+' uses the symmetric two-seat owner policy');
    const paper=games[i].fullNativePaperRootReceipts;
    assert.equal(paper?.schema,
      'agent36-live-paper-root-receipts-v2-attached-energy-custody');
    assert.equal(paper?.originalPhysicalCards?.length,120);
    assert.equal(paper?.acceptedStoreRootCount,games[i].rootCount);
    assert.equal(paper?.rootOrdinalsUnique,true);
    assert.deepEqual(paper.receipts.map(x=>x.actionOrdinal),
      games[i].roots.map(x=>x.actionOrdinal));
    assert.equal(paper?.paperPaymentReviewed,false);
    assert.equal(paper?.clockReviewed,false);
    assert.equal(paper?.competitiveGameQualified,false);
    games[i].nativeAttackDamageCarryover=nativeAttackDamageCarryover(games[i]);
  }
  const heldOpportunity=heldStoneOpportunity(games[0],games[0].candidateSeat);
  assert.ok(heldOpportunity,
    'Frozen 50801 control must contain held Stone plus the free Articuno Tool slot');
  const summaries=games.map(summarize);
  const identicalOpening=games.every(x=>
    x.fullFingerprint===games[0].fullFingerprint &&
    x.sourceFingerprint===games[0].sourceFingerprint);
  const repeatActionDifference=firstDifference(games[0],games[2]);
  const repeatPhysicalDifference=firstPhysicalDivergence(games[0],games[2]);
  const difference=firstDifference(games[0],games[1]);
  const physicalDifference=firstPhysicalDivergence(games[0],games[1]);
  const output={
    schema:'agent36-forest-stone-owner-native-50801-posthoc-aba-v2',
    sourceRegistration:SOURCE,sourceRegistrationSha256,
    trial,pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    printedSixtiesUnchanged:true,symmetricOwnerStonePolicy:true,
    posthocSelectedSeed:true,heldStoneOpportunity:heldOpportunity,
    forestSealRootPolicyAba:games.map(game=>forestSealRootPolicy(game)),
    qualifiedPaperGames:0,
    identicalOpening,repeatActionDifference,repeatPhysicalDifference,
    firstActionDifference:difference,firstPhysicalDifference:physicalDifference,
    summaries,games
  };
  save(output);
  console.log('AGENT36_RANK5_HELD_STONE_50801',JSON.stringify({
    identicalOpening,repeatActionDifference,repeatPhysicalDifference,
    firstActionDifference:difference,firstPhysicalDifference:physicalDifference,
    summaries
  }));
  assert.ok(identicalOpening,'all arms must start from identical 120 physical cards');
  assert.equal(repeatActionDifference,null);
  assert.equal(repeatPhysicalDifference,null);
  return output;
}
if(require.main===module)main();
module.exports={SOURCE,originalTrial,summarize,main,
  forestSealRootPolicy,heldStoneOpportunity,nativeAttackDamageCarryover};
