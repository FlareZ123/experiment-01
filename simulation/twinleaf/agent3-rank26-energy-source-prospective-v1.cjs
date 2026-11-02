'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards}=require('./headless.cjs');
const {runWithResearchProfile,RANK26_PROPAGATION_PROFILE}=
  require('./policy-profiles.cjs');
const {withRank26SourceCompressor}=
  require('./agent3-rank26-energy-setup.cjs');
const {withDealFingerprint}=
  require('./rank26-natural-pre-koko-cologne-cohort.cjs');

const PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BASE=20261103;
const REPEATS=Object.freeze(Array.from({length:12},(_,i)=>60+i));
const digest=cards=>crypto.createHash('sha256')
  .update(JSON.stringify(cards)).digest('hex');

/** Preserve every printed source first global turn root, error or native cap. */
function summarize(observed,sourceSeat,seed,a,b){
  const game=observed.result?.result??observed.result;
  const result={physicalRoot:observed.physicalRoot?.digestSha256??null,
    identifiedRoot:observed.liveRootIdentified,error:observed.error,
    actualSourceFirst:null,sourceActions:[],
    firstTurnCompressorPlays:0,firstTurnAttackNames:[],
    nativeTerminal:false,engineWinner:null,actionCap:false,
    sourceFirstOpponentPrizes:null};
  if(!game)return result;
  assert.equal(game.engine,PIN);
  assert.equal(game.seed,seed);
  assert.deepEqual(game.deckHashes,[digest(a),digest(b)]);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
  assert.equal(game.battleCompressorPositiveSelectionCorrection,true);
  result.actualSourceFirst=game.firstTurnSlot===sourceSeat;
  result.nativeTerminal=game.finished===true;
  result.engineWinner=game.finished===true?game.winner:null;
  result.actionCap=game.finished!==true;
  const rows=(game.decisionTrace||[]).filter(e=>
    e.playerSlot===sourceSeat&&e.turnBefore===1);
  result.sourceActions=rows.map(e=>({ordinal:e.actionOrdinal,
    action:e.action,card:e.card??null,ability:e.ability??null,
    attack:e.attack??null,opponentPrizesAfter:e.prizesAfter?.[1-sourceSeat]??null}));
  result.firstTurnCompressorPlays=rows.filter(e=>e.action==='PlayCardAction'&&
    e.card==='Battle Compressor').length;
  result.firstTurnAttackNames=rows.filter(e=>e.action==='AttackAction')
    .map(e=>e.attack);
  result.sourceFirstOpponentPrizes=rows.length?
    rows.at(-1).prizesAfter[1-sourceSeat]:null;
  return result;
}

/** Fresh, unselected physical original source deals across both seats. */
function run(){
  initializeCards();
  const plan=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const source=plan.candidate.cards;
  const defender=plan.opponents.find(x=>x.rank===6)?.cards;
  assert.equal(source.length,60);
  assert.equal(defender?.length,60);
  const cases=[];
  const seedsSeen=new Set();
  for(const repeat of REPEATS){
    const seeds=deriveSlotSeeds(BASE,'pilot',26,repeat);
    for(const [slot,seat,seed] of [['A',0,seeds.A],['B',1,seeds.B]]){
      assert.ok(Number.isSafeInteger(seed)&&seed>0&&!seedsSeen.has(seed));
      seedsSeen.add(seed);
      const a=seat===0?source:defender;
      const b=seat===1?source:defender;
      const request={deckA:a,deckB:b,rank26SourceSeat:seat,
        seed,maxActions:120,strictPromptValidation:true,
        isolatePolicyRandomness:true,captureDecisionTrace:true,
        battleCompressorPositiveSelectionCorrection:true,
        forestSealSearchCorrection:true,leleEntryAbilityLockCorrection:true,
        entryDrawLockCorrection:true,
        label:'agent3-rank26-compressor-owner-'+repeat+'-'+slot};
      const control=withDealFingerprint(()=>
        runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE));
      const treatment=withDealFingerprint(()=>
        withRank26SourceCompressor(seat,()=>
          runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE)));
      const left=summarize(control,seat,seed,a,b);
      const right=summarize(treatment,seat,seed,a,b);
      const same=left.physicalRoot&&right.physicalRoot?
        left.physicalRoot===right.physicalRoot?
          'EXACT_SOURCE_DEAL_MATCH':'SOURCE_DEAL_DIFFERENT':'UNVERIFIED';
      const audit=treatment.result?.policyAudit??null;
      cases.push({repeat,slot,seed,sourceSeat:seat,
        dealDisposition:same,control:left,treatment:right,
        ownerActionAudit:audit,
        paperQualified:false,competitiveGameQualified:false});
    }
  }
  assert.equal(cases.length,24);
  const sourceFirst=cases.filter(c=>c.control.actualSourceFirst===true);
  const summary={
    originalPhysicalDeals:24,nativeArms:48,
    actualSourceFirst:sourceFirst.length,
    physicalMatch:cases.filter(c=>c.dealDisposition==='EXACT_SOURCE_DEAL_MATCH').length,
    physicalMismatch:cases.filter(c=>c.dealDisposition==='SOURCE_DEAL_DIFFERENT').length,
    physicalUnverified:cases.filter(c=>c.dealDisposition==='UNVERIFIED').length,
    errors:cases.flatMap(c=>[
      c.control.error?{repeat:c.repeat,slot:c.slot,arm:'baseline',
        message:c.control.error}:null,
      c.treatment.error?{repeat:c.repeat,slot:c.slot,arm:'intervention',
        message:c.treatment.error}:null
    ]).filter(Boolean),
    sourceFirstTreatmentBCProposed:sourceFirst.filter(c=>
      c.ownerActionAudit?.events.some(e=>e.kind==='native-held-item-proposal')).length,
    sourceFirstTreatmentPromptSelected:sourceFirst.filter(c=>
      c.ownerActionAudit?.events.some(e=>e.kind==='native-own-deck-selection')).length,
    sourceFirstBaselineBCPlay:sourceFirst.filter(c=>
      c.control.firstTurnCompressorPlays>0).length,
    sourceFirstTreatmentBCPlay:sourceFirst.filter(c=>
      c.treatment.firstTurnCompressorPlays>0).length,
    sourceFirstNewFirstTurnAttack:sourceFirst.filter(c=>
      c.treatment.firstTurnAttackNames.length>
        c.control.firstTurnAttackNames.length).length,
    sourceFirstTreatmentFirstTurnAttack:sourceFirst.filter(c=>
      c.treatment.firstTurnAttackNames.length>0).length,
    competitiveQualifiedGames:0
  };
  return {schema:'agent3-rank26-source-owner-energy-prep-v1',
    registeredSeedBase:BASE,repeats:[60,71],seats:[0,1],
    sourceRank:26,defenderRank:6,sourceDigest:digest(source),
    defenderDigest:digest(defender),
    enginePin:PIN,maximumNativeActions:120,
    profile:RANK26_PROPAGATION_PROFILE,
    printablePaperMinimumAppliedToBothSides:true,
    ownerVisibleSourcePolicy:'rank26-item-owner-v1',
    summary,cases};
}

module.exports={run,BASE,REPEATS};
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
