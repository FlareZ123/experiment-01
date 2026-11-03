'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash, randomUUID} = require('node:crypto');
const {preflight: priorPreflight} =
  require('./agent1-rank17-actor-compressor-bridge-prospective.cjs');
const {withActorOnlyRootPolicy} =
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withOwnerEarlyCompressorAfterPass} =
  require('../twinleaf/agent1-raichu-actor-compressor-bridge.cjs');
const {withOwnerCompressorPromptCustody} =
  require('../twinleaf/agent1-compressor-prompt-custody.cjs');
const {runMatch} = require('../twinleaf/headless.cjs');
const REG = 'results/aichi-2026/registrations/agent1-rank17-postprompt-custody-retrospective-20261103.json';
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'agent1-rank17-compressor-postprompt-native.json');
const sha = obj => createHash('sha256').update(JSON.stringify(obj)).digest('hex');

function preflight() {
  const registered = JSON.parse(fs.readFileSync(path.join(ROOT, REG),'utf8'));
  const prior = priorPreflight();
  assert.equal(registered.schema,'agent1-rank17-compressor-postprompt-retrospective-v1');
  assert.equal(registered.enginePin,prior.reg.enginePin);
  assert.equal(registered.sourceOriginalFingerprint,prior.reg.sourceOriginalFingerprint);
  assert.deepEqual(registered.sourcePhysicalSeeds,[2208314832,4010383176]);
  assert.equal(registered.sourceSeat,1);
  assert.equal(registered.expectedNativeArms,4);
  assert.equal(prior.source.source.cards.length,60);
  assert.equal(prior.source.plan.candidate.cards.length,60);
  return {registered,source:prior.source};
}

/**
 * Reuse unchanged, originally registered source/response decks and native
 * options. The observer is read-only and only probes source's prompted deck
 * after native search becomes lawfully visible.
 * @param {object} source
 * @param {number} seed
 * @param {boolean} bridgeOn
 * @returns {object}
 */
function arm(source,seed,bridgeOn) {
  const sourceSeat=1;
  const deckA=source.plan.candidate.cards;
  const deckB=source.source.cards;
  const header={seed,sourceSeat,bridgeOn,
    deckAHash:sha(deckA),deckBHash:sha(deckB)};
  try {
    const native=()=>runMatch({deckA,deckB,seed,maxActions:180,
      strictPromptValidation:true,captureDecisionTrace:true,
      captureInitialFullPhysicalDeal:true,
      battleCompressorPositiveSelectionCorrection:true,
      electrodeGXEnergyCorrection:true,
      electroRainDamageCorrection:true,
      rank4RaichuCompressorSeat:sourceSeat,
      label:'agent1-retrospective-postprompt-source-rank17'});
    const outer=withActorOnlyRootPolicy(()=>
      withOwnerCompressorPromptCustody(()=>
        bridgeOn?withOwnerEarlyCompressorAfterPass(native,sourceSeat):
          {result:native(),audit:null},sourceSeat),
      {naturalEvolutionRoot:true});
    const {result:inner}=outer;
    const {result:bridgeResult,audit:custody}=inner;
    const {result:game,audit:bridge}=bridgeResult;
    return {...header,error:null,custody,bridge,
      actualFirstPlayer:game.firstTurnSlot,
      actualInitialFullDealHash:sha(game.initialFullPhysicalDealFingerprint),
      nativeStatus:game.endReason,nativeFinished:game.finished,
      nativeWinner:game.winner??null,numberOfRootActions:game.rootActionLedger?.length??null,
      sourceCompressorAcceptedRoots:(game.rootActionLedger??[]).filter(
        x=>x.playerSlot===sourceSeat&&x.action==='PlayCardAction'&&
          x.card==='Battle Compressor').map(x=>({
          actionOrdinal:x.actionOrdinal,turn:x.turnBefore
        })),
      competitivelyQualifiedGame:false};
  } catch(error) {
    return {...header,error:String(error?.stack??error),
      competitivelyQualifiedGame:false};
  }
}
function evaluate(execute=arm,setup=preflight()) {
  const pairs=[];
  for (const seed of setup.registered.sourcePhysicalSeeds) {
    const control=execute(setup.source,seed,false);
    const treatment=execute(setup.source,seed,true);
    const complete=control.error===null&&treatment.error===null;
    const matched=complete&&
      control.deckAHash===treatment.deckAHash&&
      control.deckBHash===treatment.deckBHash&&
      control.actualInitialFullDealHash===treatment.actualInitialFullDealHash&&
      control.actualFirstPlayer===treatment.actualFirstPlayer;
    pairs.push({seed,sourceSeat:1,cohort:'retrospective',complete,matched,control,treatment});
  }
  return {schema:setup.registered.schema,registration:REG,
    historicalNativeRun:setup.registered.priorObservedNativeRun,
    sourceOriginalRank:17,referenceRank:1,
    attemptedNativeArms:4,completePairs:pairs.filter(p=>p.complete).length,
    matchedPairs:pairs.filter(p=>p.matched).length,
    verifiedSelections:pairs.reduce((n,p)=>n+(p.treatment.custody?.verifiedPhysicalSelections??0),0),
    allReceiptPairs:pairs.filter(p=>p.treatment.custody?.completeNonemptyMoves>0).length,
    pairs,competitiveQualifiedGames:0,certifiedWinRate:null};
}
function save(value) {
  const lock=OUT+'.lock',temp=OUT+'.'+randomUUID()+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try {
    fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,OUT);
  } finally {
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
function main() {
  const result=evaluate();
  save(result);
  process.stdout.write('RANK17_POSTPROMPT_CUSTODY '+JSON.stringify({
    attempted:result.attemptedNativeArms,
    complete:result.completePairs,matched:result.matchedPairs,
    selectedPhysicallyMoved:result.verifiedSelections,
    verifiedPairs:result.allReceiptPairs,competitivelyQualified:0})+'\n');
  assert.equal(result.matchedPairs,2,'Original retrospective physical source pairing failed');
  assert.equal(result.verifiedSelections,2,'No fully observed source-owned chosen cards: inspect raw archive');
}
if(require.main===module)main();
module.exports={preflight,arm,evaluate,save,main};
