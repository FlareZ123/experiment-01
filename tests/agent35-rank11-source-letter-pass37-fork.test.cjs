'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {VERSION,selectLetter,withLetterFork,run,write}=
  require('../simulation/evaluation/agent35-rank11-source-letter-pass37-fork.cjs');
const SHA=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const registration={
  selectedOriginalId:'11:102:A:champion-reference',
  sourceTurn:8,originalSourceSeat:1,candidateSeat:0,
  sourceCardToPlay:'Professors Letter BKT',
  sourcePassRootOrdinal:37,
  originalSourceDealSha256:'source-deal',
  originalWholePhysicalDealSha256:'whole-deal'
};
const view={actorSeat:1,globalTurn:8,decisionKind:'owner-root',
  ownHand:['Guzma BUS','Professors Letter BKT','Float Stone BKT'],
  ownTurnResources:{itemPlayLocked:false,energyPlayedTurn:0},
  ownPublic:{publicTurnRestrictions:{itemPlayLocked:false}},
  opponentPublic:{}};
test('owner-only Letter needs right seat, held copy and unlocked Item',()=>{
  assert.equal(selectLetter(view,registration),1);
  for(const change of [
    x=>{x.actorSeat=0;},x=>{x.globalTurn=7;},
    x=>{x.decisionKind='prompt';},x=>{x.ownHand=[];},
    x=>{x.ownTurnResources.itemPlayLocked=true;},
    x=>{x.ownPublic.publicTurnRestrictions.itemPlayLocked=true;}
  ]){
    const mutated=structuredClone(view);
    change(mutated);
    assert.equal(selectLetter(mutated,registration),null);
  }
});
function fixture(){
  const roots=Array.from({length:48},(_,actionOrdinal)=>({
    actionOrdinal,turnBefore:8,playerSlot:1,action:'ResolvePromptAction'
  }));
  const orig=roots.slice(0,37);
  roots[37]={actionOrdinal:37,turnBefore:8,playerSlot:1,
    action:'PlayCardAction',card:"Professor's Letter"};
  roots[38]={actionOrdinal:38,turnBefore:8,playerSlot:1,
    action:'ResolvePromptAction',pendingPrompt:'ChooseCardsPrompt'};
  for(let ordinal=39;ordinal<48;ordinal++)roots[ordinal].turnBefore=9;
  const reg={...registration,beforePassRootPrefixLedgerSha256:SHA(orig)};
  const rows=Array.from({length:8},(_,i)=>({trial:{
    id:i===0?reg.selectedOriginalId:'fixture-'+i},
    sourceDealFingerprint:i===0?reg.originalSourceDealSha256:'other',
    fullPhysicalDealFingerprint:i===0?
      reg.originalWholePhysicalDealSha256:'other',
    status:'root-cap-censored',rootActionLedger:i===0?roots:[],
    nativeAbortEvidence:i===0?{
      failureStage:'bot-decoder',pendingPrompt:'ChooseCardsPrompt',
      actionOrdinal:38,actingSeat:1,
      redactedMessageDigest:'a'.repeat(64),
      decoderFrameAttribution:{errorClass:'TypeError',frames:[
        {file:'choose-cards-prompt-resolver.js',line:42,column:2}]}
    }:null}));
  const observed={result:{
    manifest:{observedTwinleafGitCommit:'fixture-pinned',
      version:'selected-v5'},
    rawDevelopment:{rows}},audit:{selectedCount:1,
      proposedAction:'PlayCardAction',actorSnapshot:view}};
  const withMock=fn=>{fn();return observed;};
  return {reg,rows,withMock};
}
function execute(a){return run({registration:a.reg,
  withLetterFork:a.withMock,runner:()=>{},
  headless:{},SimpleTacticsAi:class{},PlayCardAction:class{}});}
test('native root custody and genuine prompt are counted, zero wins',()=>{
  const a=fixture();
  const r=execute(a);
  assert.equal(r.schema,VERSION);
  assert.equal(r.attemptedNativeOriginalRows,8);
  assert.equal(r.originalPreForkSourceRootTapeMatched,true);
  assert.equal(r.sourceOwnerPass37Reached,true);
  assert.equal(r.sourceOwnerCardAcceptedByNativeStore,true);
  assert.equal(r.sourceFollowthroughPrompts.length,1);
  assert.equal(r.sourceDecoderFailure.failureStage,'bot-decoder');
  assert.equal(r.sourceDecoderFailure.pendingPrompt,'ChooseCardsPrompt');
  assert.equal(r.sourceDecoderFailure.decoderFrameAttribution.frames[0].line,42);
  assert.equal(r.competitiveGamesQualified,0);
  a.rows[0].rootActionLedger[37].card='Other';
  assert.equal(execute(a).sourceOwnerCardAcceptedByNativeStore,false);
});
test('changed original source physical deals are hard vetoes',()=>{
  for(const mutate of [
    a=>{a.rows[0].sourceDealFingerprint='tampered';},
    a=>{a.rows[0].fullPhysicalDealFingerprint='tampered';},
    a=>{a.rows.pop();}
  ]){
    const a=fixture();mutate(a);assert.throws(()=>execute(a));
  }
});
test('receipt writer uses exclusive lock and atomic rename',()=>{
  const r=execute(fixture());
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'agent35-letter-'));
  const file=path.join(temp,'native.json');
  try{
    write(file,r);
    assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).competitiveGamesQualified,0);
    const fd=fs.openSync(file+'.lock','wx');
    try{assert.throws(()=>write(file,r));}
    finally{fs.closeSync(fd);fs.unlinkSync(file+'.lock');}
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
});

test('late registered match owner hook outranks inherited generic decoder and restores descriptors',()=>{
  class PassTurnAction{}
  class PlayCardAction{
    constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
  }
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return new PassTurnAction();}
  }
  const reg={...registration};
  const sourceCard={fullName:reg.sourceCardToPlay};
  const state={turn:8,activePlayer:1,
    players:[{id:11,hand:{cards:[]}},{id:22,hand:{cards:[sourceCard]}}],
    prompts:[]};
  let actualRoots=0;
  const headless={runMatch(){
    const ai=new SimpleTacticsAi(22);
    const root=ai.decodeNextAction(state);
    assert.ok(root instanceof PlayCardAction,
      'registered owner-root Item must bypass incumbent Pass');
    assert.equal(root.id,22);
    assert.equal(root.handIndex,0);
    actualRoots++;
    state.prompts=[{id:55,result:undefined}];
    const next=ai.decodeNextAction(state);
    assert.ok(next instanceof ResolvePromptAction,
      'late nested owner handler must receive real pending prompt');
    return 'native-match';
  }};
  const priorRunMatch=headless.runMatch;
  const priorDecode=SimpleTacticsAi.prototype.decodeNextAction;
  let hooks=0;
  const result=withLetterFork(()=>
    headless.runMatch({label:'test-'+reg.selectedOriginalId}),{
    headless,SimpleTacticsAi,PlayCardAction,registration:reg,
    observe:()=>({...view,ownHand:[reg.sourceCardToPlay]}),
    withOwnerSearchHook:(next,{registration:target})=>{
      assert.equal(target.selectedOriginalId,reg.selectedOriginalId);
      hooks++;
      const descriptor=Object.getOwnPropertyDescriptor(
        SimpleTacticsAi.prototype,'decodeNextAction');
      function lateDecode(actual){
        if(actual.prompts.length)
          return new ResolvePromptAction(actual.prompts[0].id,[]);
        return descriptor.value.call(this,actual);
      }
      Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
        ...descriptor,value:lateDecode});
      try{return {result:next(),audit:{nativeLetterOwnerSearchPrompts:1,
        physicallySettledSearches:1}};}
      finally{Object.defineProperty(SimpleTacticsAi.prototype,
        'decodeNextAction',descriptor);}
    }
  });
  assert.equal(result.result,'native-match');
  assert.equal(result.audit.selectedCount,1);
  assert.equal(result.audit.ownerSearchAudit.nativeLetterOwnerSearchPrompts,1);
  assert.equal(result.audit.ownerSearchAudit.physicallySettledSearches,1);
  assert.equal(hooks,1);
  assert.equal(actualRoots,1);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,priorDecode);
  assert.strictEqual(headless.runMatch,priorRunMatch);
});

test('exact first-turn Letter rescue model reproduces rank11 hypergeometric bounds',()=>{
  const {choose,firstOwnTurnRescue}=
    require('../simulation/evaluation/agent35-firstturn-item-rescue-hypergeom.cjs');
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(60,61),0n);
  const p=firstOwnTurnRescue({basics:11,energies:8,items:4});
  const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-11,
    String(actual)+' differs from '+String(expected));
  near(p.legalSetupProbability,0.7775788585041408);
  near(p.noEnergySeenProbability,0.31468608284142857);
  near(p.noEnergyOrItemSeenProbability,0.16314646448595768);
  near(p.itemSeenProbability,0.4257215506064711);
  near(p.itemRescueProbability,0.1515396183554709);
  near(p.itemGivenNoEnergyProbability,0.48155805616555414);
  assert.equal(p.competitiveGamesQualified,0);
  const less=firstOwnTurnRescue({basics:11,energies:8,items:3});
  assert.ok(less.itemRescueProbability<p.itemRescueProbability);
  assert.equal(firstOwnTurnRescue({
    basics:11,energies:8,items:0}).itemRescueProbability,0);
});
