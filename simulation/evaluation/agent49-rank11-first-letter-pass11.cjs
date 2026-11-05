'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const agent35=require('./agent35-rank11-source-letter-pass37-fork.cjs');
const registration=require('../../results/aichi-2026/registrations/agent49-rank11-first-letter-pass11-20261105.json');
const roster=require('../../results/aichi-2026/full-decklists.json');

const VERSION='agent49-original-rank11-first-letter-v1';
const ENERGY='Darkness Energy MEE';
const LETTER='Professors Letter BKT';

/**
 * Paper K0 lower bound based only on the actor's own visible zones and
 * printed original 60. Never inspects an unknown Prize identity or deck.
 * @param {object} view Real pre-policy owner observation.
 * @returns {object} Strict necessary-access and public-Item-play gate.
 */
function paperOwnerLetterGate(view){
  assert.equal(view?.decisionKind,'owner-root');
  assert.equal(view.actorSeat,registration.originalSourceSeat);
  assert.equal(view.globalTurn,registration.sourceTurn);
  const deck=roster.decks.find(d=>d.rank===11);
  assert.ok(deck&&deck.cards.reduce((n,c)=>n+c.count,0)===60);
  assert.equal(deck.cards.find(c=>c.name==='Darkness Energy')?.count,8);
  assert.equal(deck.cards.find(c=>c.name==="Professor's Letter")?.count,4);
  const own=view.ownPublic;
  assert.ok(Number.isInteger(own.prizeCount)&&own.prizeCount<=6);
  const board=[own.active,...own.bench].filter(Boolean);
  const outside=[
    ...view.ownHand,...own.discard,...own.lostZone,
    ...own.resolvingSupporter,...own.stadium,
    ...board.flatMap(p=>[...p.evolutionPrintings,...p.energies,...p.tools])
  ];
  const knownOutside=outside.filter(p=>p===ENERGY).length;
  const lower=Math.max(0,8-knownOutside-own.prizeCount);
  const paperItemUnlocked=
    view.ownTurnResources.itemPlayLocked===false&&
    own.publicTurnRestrictions.itemPlayLocked===false;
  return {
    heldSourceLetter:view.ownHand.includes(LETTER),
    paperItemUnlocked,
    knownDarknessOutsideDeckOrPrizes:knownOutside,
    unknownPrizes:own.prizeCount,guaranteedDarknessInDeck:lower,
    twoBasicDarknessTargetsGuaranteed:lower>=2,
    printedCardSearchTargetsOwnerKnown:false,
    actualPromptCompletionCertified:false
  };
}

/**
 * Reuse the already tested source-only Agent35 native Item substitution
 * at a NEW, earlier preregistered root with exact source/deal/prefix custody.
 * The other seven original registered arms remain in the denominator.
 * @param {{run?:Function}} [deps] Seam for fail-closed unit tests.
 */
function run(deps={}){
  const result=(deps.run??agent35.run)({registration});
  assert.equal(result.registrationId,registration.selectedOriginalId);
  assert.equal(result.observedPinnedTwinleaf,registration.twinleafPin);
  assert.equal(result.attemptedNativeOriginalRows,8);
  assert.equal(result.originalPreForkSourceRootTapeMatched,true);
  assert.equal(result.sourceDealMatched,true);
  assert.equal(result.entirePhysicalDealMatched,true);
  const reached=result.sourceOwnerPass37Reached===true;
  const gate=reached?paperOwnerLetterGate(
    result.sourceOwnerPreDecisionSnapshot):null;
  const root=result.nativeRootAtSelectedOrdinal;
  return {schema:VERSION,registration,sourceReached:reached,
    ownerGate:gate,originalSourcePrintedSixtyUnchanged:true,
    originalCandidatePrintedSixtyUnchanged:true,
    exactOriginalPreRootTapeMatched:true,
    genuineNativeSourceLetterRootAccepted:
      result.sourceOwnerCardAcceptedByNativeStore===true,
    selectedNativeRoot:root,
    sourceFollowthroughPromptCount:result.sourceFollowthroughPrompts.length,
    sourceSameTurnDarknessPlayCount:
      result.sameTurnRealOwnerDarknessEnergyPlayRoots.length,
    sourceDisposition:result.originalSourceRowDisposition,
    sourceAcceptedRoots:result.originalSourceAcceptedRoots,
    sourceAbort:result.sourceDecoderFailure,
    allEightNativeStatuses:result.allNativeArmDispositions,
    qualifiedCompetitiveGames:0,
    capableToJudgePaperCompleteGame:false};
}
/** Exclusively locked, atomic file write for one completed receipt. */
function write(filename,value){
  assert.equal(value.schema,VERSION);
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const lock=filename+'.lock',fd=fs.openSync(lock,'wx');
  const tmp=filename+'.'+process.pid+'.tmp';
  try{
    const buf=JSON.stringify(value,null,2)+'\n';
    fs.writeFileSync(tmp,buf,{flag:'wx'});
    fs.renameSync(tmp,filename);
    return {bytes:Buffer.byteLength(buf),sha256:createHash('sha256')
      .update(buf).digest('hex')};
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
if(require.main===module){
  const file=process.env.AGENT49_EARLY_LETTER_RECEIPT;
  assert.ok(file,'AGENT49_EARLY_LETTER_RECEIPT is required');
  const result=run();
  const archived=write(file,result);
  process.stdout.write('AGENT49_EARLY_LETTER '+JSON.stringify({
    ...archived,reached:result.sourceReached,
    paperTwoTargets:result.ownerGate?.twoBasicDarknessTargetsGuaranteed,
    storeAccepted:result.genuineNativeSourceLetterRootAccepted,
    followthrough:result.sourceFollowthroughPromptCount,
    energyPlays:result.sourceSameTurnDarknessPlayCount,
    disposition:result.sourceDisposition,
    errorClass:result.sourceAbort?.failureStage,
    nativeStatuses:result.allEightNativeStatuses,
    qualifiedGames:0
  })+'\n');
}
module.exports={VERSION,paperOwnerLetterGate,run,write};
