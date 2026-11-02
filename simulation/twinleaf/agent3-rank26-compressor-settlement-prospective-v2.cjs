'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards}=require('./headless.cjs');
const {runWithResearchProfile,RANK26_PROPAGATION_PROFILE}=
  require('./policy-profiles.cjs');
const {withRank26SourceSetup}=require('./agent3-rank26-energy-setup.cjs');
const {withDealFingerprint}=
  require('./rank26-natural-pre-koko-cologne-cohort.cjs');
const {withSourceCompressorSettlementAudit}=
  require('./agent3-compressor-discard-settlement.cjs');

const ENGINE='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BASE=20261106;
const REPEATS=Object.freeze(Array.from({length:12},(_,i)=>72+i));
const CAP=120;
const digest=cards=>crypto.createHash('sha256')
  .update(JSON.stringify(cards)).digest('hex');

/**
 * Preserve real native run, source owner choices and physical settlement.
 * @param {object} observed Native Store wrapper
 * @param {boolean} treated
 * @param {0|1} seat
 * @param {number} seed
 * @param {object[]} deckA
 * @param {object[]} deckB
 */
function summarize(observed,treated,seat,seed,deckA,deckB){
  const wrapped=observed.result;
  const game=treated?wrapped?.result?.result:wrapped?.result;
  const audit=wrapped?.audit??null;
  const policyAudit=treated?wrapped?.result?.policyAudit??null:null;
  const out={
    initialPhysicalDigest:observed.physicalRoot?.digestSha256??null,
    nativeRootIdentified:observed.liveRootIdentified,
    nativeError:observed.error,
    sourceFirst:null,
    terminal:false,winner:null,actionCapped:false,
    sourceFirstActions:[],
    sourceFirstCompressorPlays:0,
    sourceFirstCrisisPunches:0,
    sourceFirstOpponentPrizesAfter:null,
    settlementAudit:audit,
    sourceOwnerPolicyAudit:policyAudit
  };
  if(!game)return out;
  assert.equal(game.engine,ENGINE);
  assert.equal(game.seed,seed);
  assert.deepEqual(game.deckHashes,[digest(deckA),digest(deckB)]);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
  assert.equal(game.battleCompressorPositiveSelectionCorrection,true);
  out.sourceFirst=game.firstTurnSlot===seat;
  out.terminal=game.finished===true;
  out.winner=out.terminal?game.winner:null;
  out.actionCapped=!out.terminal;
  const rows=(game.decisionTrace||[]).filter(x=>
    x.playerSlot===seat&&x.turnBefore===1);
  out.sourceFirstActions=rows.map(x=>({
    ordinal:x.actionOrdinal,
    action:x.action,
    card:x.card??null,ability:x.ability??null,attack:x.attack??null,
    opponentPrizesAfter:x.prizesAfter?.[1-seat]??null
  }));
  out.sourceFirstCompressorPlays=rows.filter(x=>
    x.action==='PlayCardAction'&&x.card==='Battle Compressor').length;
  out.sourceFirstCrisisPunches=rows.filter(x=>
    x.action==='AttackAction'&&x.attack==='Crisis Punch').length;
  out.sourceFirstOpponentPrizesAfter=rows.at(-1)?.prizesAfter?.[1-seat]??null;
  return out;
}

/** All 24 preregistered fresh physical seeds, without post-selection. */
function run(){
  initializeCards();
  const field=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const source=field.candidate.cards;
  const opponent=field.opponents.find(x=>x.rank===6)?.cards;
  assert.equal(source.length,60);
  assert.equal(opponent?.length,60);
  const cases=[],seen=new Set();
  for(const repeat of REPEATS){
    const seeds=deriveSlotSeeds(BASE,'pilot',26,repeat);
    for(const [slot,seat,seed] of [['A',0,seeds.A],['B',1,seeds.B]]){
      assert.ok(Number.isSafeInteger(seed)&&seed>0&&!seen.has(seed));
      seen.add(seed);
      const deckA=seat===0?source:opponent;
      const deckB=seat===1?source:opponent;
      const request={deckA,deckB,rank26SourceSeat:seat,
        seed,maxActions:CAP,strictPromptValidation:true,
        isolatePolicyRandomness:true,captureDecisionTrace:true,
        battleCompressorPositiveSelectionCorrection:true,
        forestSealSearchCorrection:true,leleEntryAbilityLockCorrection:true,
        entryDrawLockCorrection:true,
        label:'agent3-rank26-compressor-physical-v2-'+repeat+'-'+slot};
      const control=withDealFingerprint(()=>
        withSourceCompressorSettlementAudit(seat,()=>
          runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE)));
      const variant=withDealFingerprint(()=>
        withSourceCompressorSettlementAudit(seat,()=>
          withRank26SourceSetup(seat,()=>
            runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE))));
      const baseline=summarize(control,false,seat,seed,deckA,deckB);
      const treatment=summarize(variant,true,seat,seed,deckA,deckB);
      const physicalDisposition=baseline.initialPhysicalDigest&&
        treatment.initialPhysicalDigest?
        baseline.initialPhysicalDigest===treatment.initialPhysicalDigest?
          'EXACT_SOURCE_DEAL_MATCH':'SOURCE_DEAL_DIFFERENT':'UNVERIFIED';
      cases.push({repeat,slot,seed,sourceSeat:seat,
        physicalDisposition,baseline,treatment,
        competitiveGameQualified:false});
    }
  }
  const sourceFirst=cases.filter(c=>c.baseline.sourceFirst===true);
  const moves=arm=>arm.settlementAudit?.receipts.flatMap(r=>
    r.physicallyMoved??[])??[];
  const errors=cases.flatMap(c=>[
    c.baseline.nativeError?{repeat:c.repeat,slot:c.slot,arm:'baseline',
      error:c.baseline.nativeError}:null,
    c.treatment.nativeError?{repeat:c.repeat,slot:c.slot,arm:'treatment',
      error:c.treatment.nativeError}:null
  ]).filter(Boolean);
  const summary={
    originalSourceDeals:cases.length,nativeArms:cases.length*2,
    physicallyMatched:cases.filter(c=>
      c.physicalDisposition==='EXACT_SOURCE_DEAL_MATCH').length,
    physicallyDifferent:cases.filter(c=>
      c.physicalDisposition==='SOURCE_DEAL_DIFFERENT').length,
    physicalUnverified:cases.filter(c=>
      c.physicalDisposition==='UNVERIFIED').length,
    nativeErrors:errors,
    actualSourceFirst:sourceFirst.length,
    sourceFirstBaselineCompressor:sourceFirst.filter(c=>
      c.baseline.sourceFirstCompressorPlays>0).length,
    sourceFirstTreatmentCompressor:sourceFirst.filter(c=>
      c.treatment.sourceFirstCompressorPlays>0).length,
    sourceFirstTreatmentOwnerProposals:sourceFirst.filter(c=>
      c.treatment.sourceOwnerPolicyAudit?.events.some(e=>
        e.kind==='native-held-item-proposal')).length,
    sourceFirstTreatmentOwnerPromptSelections:sourceFirst.filter(c=>
      c.treatment.sourceOwnerPolicyAudit?.events.some(e=>
        e.kind==='native-own-deck-selection')).length,
    sourceFirstBaselinePhysicalSettlements:sourceFirst.filter(c=>
      c.baseline.settlementAudit?.acceptedPositiveResolutions>0).length,
    sourceFirstTreatmentPhysicalSettlements:sourceFirst.filter(c=>
      c.treatment.settlementAudit?.acceptedPositiveResolutions>0).length,
    sourceFirstTreatmentPhysicalLightningCopies:sourceFirst.reduce((n,c)=>
      n+moves(c.treatment).filter(x=>x.name==='Lightning Energy').length,0),
    sourceFirstTreatmentPhysicalExeggcuteCopies:sourceFirst.reduce((n,c)=>
      n+moves(c.treatment).filter(x=>x.name==='Exeggcute').length,0),
    sourceFirstNewCrisisPunch:sourceFirst.filter(c=>
      c.treatment.sourceFirstCrisisPunches>c.baseline.sourceFirstCrisisPunches).length,
    controlNativeTerminals:cases.filter(c=>c.baseline.terminal).length,
    treatmentNativeTerminals:cases.filter(c=>c.treatment.terminal).length,
    competitiveQualifiedGames:0
  };
  return {schema:'agent3-rank26-physical-compressor-prospective-v2',
    seedBase:BASE,repeats:[72,83],sourceSeats:[0,1],
    sourceRank:26,opponentRank:6,sourceDigest:digest(source),
    opponentDigest:digest(opponent),engineRevision:ENGINE,
    originalCopiesPerSide:60,maxActions:CAP,
    controlPolicy:RANK26_PROPAGATION_PROFILE,
    treatmentPolicy:'rank26-item-owner-v1 over rank26-propagation-v3',
    observer:'agent3-source-compressor-physical-settlement-readonly-v1',
    summary,cases};
}

/** Atomic exclusive-locked JSON result, including any unsuccessful arms. */
function saveResult(file,data){
  const lock=file+'.lock',temporary=file+'.partial';
  const fd=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(temporary,JSON.stringify(data,null,2)+'\n','utf8');
    fs.renameSync(temporary,file);
  }finally{
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
module.exports={BASE,REPEATS,run,summarize,saveResult};
if(require.main===module){
  const result=run();
  saveResult(path.resolve(process.cwd(),
    'agent3-rank26-physical-compressor-v2.json'),result);
  process.stdout.write('AGENT3_RANK26_PHYSICAL_V2 '+
    JSON.stringify({schema:result.schema,seedBase:result.seedBase,
      summary:result.summary})+'\n');
  const s=result.summary;
  if(s.originalSourceDeals!==24||s.nativeArms!==48||
     s.physicallyMatched!==24||s.physicallyDifferent!==0||
     s.physicalUnverified!==0||s.nativeErrors.length)
    process.exitCode=1;
}
