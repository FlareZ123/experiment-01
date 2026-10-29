'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,ENERGY_PROMPT_SCHEMA,
  firstAcceptedEnergyPromptDifference,comparePairedAcceptedTargets}=
  require('../simulation/evaluation/agent41-native-paired-target-audit.cjs');

/** @param {number} bench @param {number} [dispatchOrdinal] */
function prompt(bench,dispatchOrdinal=53){
  const publicChanges=[{seat:0,position:'bench',index:bench,
    before:{pokemon:'Crobat V',energies:[],tools:[]},
    after:{pokemon:'Crobat V',energies:['Darkness Energy'],tools:[]}}];
  return {schema:ENERGY_PROMPT_SCHEMA,observedLiveStore:true,
    events:[{dispatchOrdinal,promptId:135,turnBefore:7,playerSlot:0,
      nativeDispatchAccepted:true,publicAfterDispatch:true,
      promptType:'AttachEnergyPrompt',action:'ResolvePromptAction',
      publicChanges}]};
}
/** @param {number} bench */
function root(bench){
  return {schema:'actual-store-declared-target-sidecar-v1',
    observedLiveStore:true,rootOrdinalLinked:true,
    events:[{actionOrdinal:52,rootActionOrdinal:49,turnBefore:7,
      playerSlot:0,action:'PlayCardAction',storeAccepted:true,
      declared:{status:'captured',kind:'play-card',handIndex:1,
        ownerHandPrinting:'Darkness Energy SVE 7',
        target:{player:2,slot:bench===0?1:2,index:0}},
      publicBoardChanges:[{seat:0,position:bench===0?'active':'bench',
        index:0,before:{pokemon:'Garbodor BKP 57',energies:[],tools:[]},
        after:{pokemon:'Garbodor BKP 57',
          energies:['Darkness Energy SVE 7'],tools:[]}}],
      visibility:'public-after-dispatch'}]};
}
/** @param {object} [overrides] */
function row(overrides={}){
  return {trial:{rank:11,seed:482443328,candidateSlot:'B',
      candidateId:'new-moon-lockbreaker-v1'},
    sourceSeat:0,candidateSeat:1,enginePin:'a9905a76',
    candidateDeckFingerprint:'candidate-60',sourceDeckFingerprint:'source-60',
    sourceDealFingerprint:'real-physical-deal',actualStarterSeat:0,
    verifiedFirstTurn:true,rootActionLedgerSha256:'legacy-root-sha',
    nativeAcceptedTargetSidecar:root(0),
    nativeAcceptedEnergyPromptSidecar:prompt(0),...overrides};
}

test('identical legacy root hash can conceal a native typed prompt destination',()=>{
  const a=row(),b=row({nativeAcceptedEnergyPromptSidecar:prompt(1)});
  const compared=comparePairedAcceptedTargets(a,b);
  assert.equal(compared.version,VERSION);
  assert.equal(compared.status,'selective-physical-evidence');
  assert.equal(compared.legacyRootLabelsEqual,true);
  assert.equal(compared.root.status,'same-observed-targets');
  assert.equal(compared.energyPrompt.status,'different');
  assert.equal(compared.energyPrompt.index,0);
  assert.equal(compared.fullPhysicalParityCertified,false);
  assert.equal(compared.competitiveQualified,false);
});

test('native target divergence uses authenticated root ordinal 49, not dispatch 52',()=>{
  const out=comparePairedAcceptedTargets(row(),
    row({nativeAcceptedTargetSidecar:root(1)}));
  assert.deepEqual(out.root,{status:'different',index:0,
    firstOrdinal:49,secondOrdinal:49});
  assert.equal(out.energyPrompt.status,'same-observed-prompt-effects');
});

test('prompt bookkeeping IDs and dispatch totals do not produce false physical divergence',()=>{
  const a=prompt(0,52),b=prompt(0,59);
  b.events[0].promptId=999;
  assert.deepEqual(firstAcceptedEnergyPromptDifference(a,b),{
    status:'same-observed-prompt-effects',observed:1,
    scope:'Immediate public effects of accepted AttachEnergyPrompt only'
  });
});

test('empty public effect and missing observer are explicitly unobserved',()=>{
  const silent=prompt(0);
  silent.events[0].publicChanges=[];
  assert.equal(firstAcceptedEnergyPromptDifference(prompt(0),silent).status,
    'target-unobserved');
  const none=row({nativeAcceptedTargetSidecar:null});
  const out=comparePairedAcceptedTargets(none,row());
  assert.deepEqual(out.root,{status:'target-unobserved',
    reason:'missing-actual-native-Store-observation'});
  assert.equal(firstAcceptedEnergyPromptDifference(null,prompt(0)).status,
    'target-unobserved');
});

test('different fixed lists, actual deals, engine and errors veto causal comparisons',()=>{
  const base=row();
  const newMoonVsChampion=row({trial:{...base.trial,
    candidateId:'champion-reference'}});
  assert.equal(comparePairedAcceptedTargets(base,newMoonVsChampion).reason,
    'different-fixed-60');
  assert.equal(comparePairedAcceptedTargets(base,row({
    sourceDealFingerprint:'another-physical-deal'})).reason,
    'different-or-missing-source-deal');
  assert.equal(comparePairedAcceptedTargets(base,row({
    enginePin:'different-engine'})).reason,'unverified-engine-pin');
  assert.equal(comparePairedAcceptedTargets(base,row({
    candidateDeckFingerprint:'changed-60'})).reason,
    'missing-or-different-deck-fingerprint');
  assert.equal(comparePairedAcceptedTargets(base,row({
    status:'engine-error'})).status,'incomplete-native-pair');
  assert.equal(comparePairedAcceptedTargets(base,row({
    verifiedFirstTurn:false})).reason,'unverified-actual-starter');
});
