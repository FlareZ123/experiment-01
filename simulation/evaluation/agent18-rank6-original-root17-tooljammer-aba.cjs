'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {actorObservation}=
  require('../twinleaf/actor-observation-contract.cjs');
const {runStewardInnermostPrizeV5}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {auditFirstSourcePassPrechoiceHand}=
  require('./agent18-first-source-pass-prechoice-hand-contract.cjs');

const VERSION='agent18-rank6-source-root17-tooljammer-same-deal-v1';
const ROOT=path.resolve(__dirname,'../..');
const OUT=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
const DEFAULT_REG=require('../../results/aichi-2026/registrations/agent18-rank6-original-root17-tooljammer-20261105.json');
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Proposed Tool on the exact source Active, considering only owner-visible
 * source information at the same accepted root. Opportunity cost and opponent
 * response quality are deliberately outside this narrow legality predicate.
 * @param {object} view Pre-decoder actor-only root observation.
 * @param {object} registration Exact historical source root and hand printing.
 * @returns {number|null} Physical held Tool index, or an explicit decline.
 */
function selectSourceTool(view,registration) {
  if(view?.actorSeat!==registration.sourceSeat||
     view?.globalTurn!==registration.sourceTurn||
     view?.decisionKind!=='owner-root'||
     !Array.isArray(view?.ownHand)||
     view?.ownTurnResources?.toolPlayLocked!==false||
     view?.ownPublic?.publicTurnRestrictions?.toolPlayLocked===true||
     !view?.ownPublic?.active||
     !Array.isArray(view.ownPublic.active.tools)||
     view.ownPublic.active.tools.length!==0)
    return null;
  const index=view.ownHand.indexOf(registration.sourceCardToPlay);
  return index>=0?index:null;
}

/**
 * One reversible owner-visible native actor intervention scoped to one
 * registered original 60 and genuine source Pass. No deck or Prize reads.
 * Original v5 inner owner-prompt/energy policy remains on both seats.
 *
 * @template T
 * @param {()=>T} next
 * @param {object} deps Actual pinned Store classes and dependency injection.
 * @returns {{result:T,audit:object}}
 */
function withOriginalSourceToolFork(next,deps) {
  assert.equal(typeof next,'function');
  const {headless,SimpleTacticsAi,PlayCardAction,PlayerType,SlotType,
    registration}=deps;
  const observe=deps.observe??actorObservation;
  const oldRunMatch=headless.runMatch;
  assert.equal(typeof oldRunMatch,'function');
  const audit={schema:VERSION,selectedOriginalId:registration.selectedOriginalId,
    selectedAttempts:0,rootSubstitutions:0,physicalOwnerHandVerified:false,
    publicActorPrerequisitesVerified:false,sourceOriginalPassObserved:false,
    nonSourceMatchCalls:0,opponentConcealedInformationInspected:false,
    nativeStoreAcceptanceObservedSeparately:false,
    competitiveGamesQualified:0};
  function selectRun(request) {
    const selected=typeof request?.label==='string'&&
      request.label.endsWith(registration.selectedOriginalId);
    if(!selected){audit.nonSourceMatchCalls++;return oldRunMatch(request);}
    audit.selectedAttempts++;
    const prior=Object.getOwnPropertyDescriptor(
      SimpleTacticsAi.prototype,'decodeNextAction');
    assert.equal(typeof prior?.value,'function');
    function ownerDecoded(state,...args){
      const source=state?.players?.[registration.sourceSeat];
      const pending=state?.prompts?.some(p=>p.result===undefined);
      const exact=state?.activePlayer===registration.sourceSeat&&
        state?.turn===registration.sourceTurn&&
        source?.id===this.client?.id&&
        !pending&&audit.rootSubstitutions===0;
      const before=exact?observe(state,registration.sourceSeat):null;
      const baseline=prior.value.call(this,state,...args);
      if(!before||baseline?.constructor?.name!=='PassTurnAction')
        return baseline;
      audit.sourceOriginalPassObserved=true;
      const index=selectSourceTool(before,registration);
      if(index===null)return baseline;
      assert.equal(source.hand.cards[index]?.fullName,
        registration.sourceCardToPlay,
        'Original bot mutated the owner-held proposed Tool');
      assert.equal(JSON.stringify(source.hand.cards.map(x=>x.fullName)),
        JSON.stringify(before.ownHand),
        'Original bot changed hand between owner pre-decode and proposed Tool');
      audit.physicalOwnerHandVerified=true;
      audit.publicActorPrerequisitesVerified=true;
      const action=new PlayCardAction(source.id,index,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
      audit.rootSubstitutions++;
      return action;
    }
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
      ...prior,value:ownerDecoded});
    try{return oldRunMatch(request);}
    finally{
      assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
        ownerDecoded,'Native patch ownership changed unexpectedly');
      Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',prior);
    }
  }
  headless.runMatch=selectRun;
  try{return {result:next(),audit};}
  finally{
    assert.strictEqual(headless.runMatch,selectRun);
    headless.runMatch=oldRunMatch;
  }
}

/** @param {object} row */
function acceptedRoots(row){
  return row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
}

/** @param {object} row */
function compactRow(row) {
  return {id:row.trial?.id??row.id??null,
    status:row.status??null,
    finished:row.finished===true,
    sourceSeat:row.sourceSeat??
      row.nativeAbortProvenance?.sourceSeat??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    acceptedRootCount:acceptedRoots(row).length,
    rootLedgerSha256:sha(acceptedRoots(row))};
}

/**
 * Compare the same fixed v5 original eight registered physical starts.
 * Treatment changes only exact rank6 source seat0 Pass17 into Tool Jammer.
 * The source-owner first Pass hand parity is independently checked using
 * original pre-bot and post-choice read-only sensors.
 * @param {object} [deps] Dependency injection for tests.
 * @returns {object} Failure-inclusive development receipt, zero paper wins.
 */
function runOriginalRoot17ToolAB(deps={}) {
  const registration=deps.registration??DEFAULT_REG;
  const run=deps.runner??(kwargs=>runStewardInnermostPrizeV5({
    runner:options=>runDevelopment({...options,
      nativeAllOwnerPassFrontier:true,...kwargs})
  }));
  const control=run({});
  const targetTools=deps.targetTools??{
    headless:require('../twinleaf/headless.cjs'),
    SimpleTacticsAi:require(path.join(OUT,'simple-bot/simple-tactics-ai')).SimpleTacticsAi,
    PlayCardAction:require(path.join(OUT,'game/store/actions/play-card-action')).PlayCardAction,
    ...require(path.join(OUT,'game/store/actions/play-card-action')),
    registration
  };
  const wrapper=deps.wrapper??withOriginalSourceToolFork;
  const treatment=wrapper(()=>run({}),targetTools);
  const earlier=control.rawDevelopment?.rows;
  const later=treatment.result.rawDevelopment?.rows;
  assert.ok(Array.isArray(earlier)&&Array.isArray(later));
  assert.equal(earlier.length,registration.originalRegisteredAttempts);
  assert.equal(later.length,earlier.length);
  const byId=new Map(earlier.map(x=>[x.trial.id,x]));
  assert.equal(byId.size,earlier.length);
  const pairs=later.map(row=>{
    const a=byId.get(row.trial.id);
    assert.ok(a,'A treatment original registration was added or removed');
    assert.equal(row.sourceDealFingerprint,a.sourceDealFingerprint);
    assert.equal(row.fullPhysicalDealFingerprint,a.fullPhysicalDealFingerprint);
    assert.equal(row.actualStarterSeat,a.actualStarterSeat);
    const before=acceptedRoots(a),after=acceptedRoots(row);
    let prefix=0;
    while(prefix<Math.min(before.length,after.length)){
      const x=before[prefix],y=after[prefix];
      if(['action','card','attack','playerSlot','turnBefore','pendingPrompt']
        .some(key=>(x[key]??null)!==(y[key]??null)))break;
      prefix++;
    }
    const first=prefix<Math.max(before.length,after.length)?{
      ordinal:prefix,
      control:before[prefix]?{action:before[prefix].action,
        card:before[prefix].card??null,
        turn:before[prefix].turnBefore,seat:before[prefix].playerSlot}:null,
      treatment:after[prefix]?{action:after[prefix].action,
        card:after[prefix].card??null,
        turn:after[prefix].turnBefore,seat:after[prefix].playerSlot}:null
    }:null;
    const subsequentSourcePasses=
      row.nativeAllOwnerPassFrontier?.receipts?.filter(receipt=>
        receipt.role==='source'&&
        receipt.actionOrdinal>registration.sourcePassRootOrdinal)??[];
    const firstSourcePass=subsequentSourcePasses[0]??null;
    const activeAfter=firstSourcePass?.publicBoardBeforePass?.[
      registration.sourceSeat]?.active??null;
    const firstCandidateRootAfterChange=after.slice(prefix+1).find(action=>
      action.playerSlot===1-registration.sourceSeat&&
      !['ResolvePromptAction','WaitForPlayerAction'].includes(action.action));
    return {...compactRow(row),
      controlDisposition:compactRow(a).status,
      controlAcceptedRoots:before.length,
      controlRootLedgerSha256:sha(before),
      commonAcceptedActionPrefixLength:prefix,
      firstChangedNativeRoot:first,
      firstSubsequentSourcePassOrdinal:
        firstSourcePass?.actionOrdinal??null,
      sourceActiveToolAtNextSourcePass:
        activeAfter?.toolCards??null,
      firstOpponentNonpromptAfterRootChange:firstCandidateRootAfterChange?
        {ordinal:firstCandidateRootAfterChange.actionOrdinal,
          action:firstCandidateRootAfterChange.action,
          card:firstCandidateRootAfterChange.card??null,
          attack:firstCandidateRootAfterChange.attack??null}:null
    };
  });
  assert.equal(new Set(pairs.map(p=>p.id)).size,earlier.length);
  const a=byId.get(registration.selectedOriginalId);
  const b=later.find(x=>x.trial.id===registration.selectedOriginalId);
  assert.ok(a&&b,'Frozen exact original source trial missing');
  assert.equal(a.sourceDealFingerprint,registration.originalSourceDealSha256);
  assert.equal(a.fullPhysicalDealFingerprint,
    registration.originalWholePhysicalDealSha256);
  assert.equal(sha(acceptedRoots(a).slice(
    0,registration.sourcePassRootOrdinal)),
    registration.beforePassRootPrefixLedgerSha256);
  const after=acceptedRoots(b);
  assert.equal(sha(after.slice(0,registration.sourcePassRootOrdinal)),
    registration.beforePassRootPrefixLedgerSha256);
  const first=after[registration.sourcePassRootOrdinal]??null;
  const nativeAccepted=first?.action==='PlayCardAction'&&
    first?.card==='Tool Jammer'&&
    first?.playerSlot===registration.sourceSeat&&
    first?.turnBefore===registration.sourceTurn;
  return {schema:VERSION,registrationId:registration.selectedOriginalId,
    originalNativeStoreGitlink:control.manifest?.observedTwinleafGitCommit,
    observedPinnedPolicy:control.manifest?.version??null,
    registeredSourceArms:pairs.length,
    physicalDealEqualityForAll:true,
    sourceFirstPassPrebotHandContract:a?
      auditFirstSourcePassPrechoiceHand(a):null,
    selectedOriginalSourceToolProposal:treatment.audit,
    selectedSourceNativeStoreToolPlayAccepted:nativeAccepted,
    selectedOriginalSourcePublicRootPrefixExact:true,
    selectedOriginalSourceComparison:pairs.find(p=>
      p.id===registration.selectedOriginalId),
    pairedDispositions:pairs,
    nativeTerminals:later.filter(row=>row.finished===true).length,
    paperEligibleOpportunityCertified:false,
    paperEffectAndFutureStrategyCertified:false,
    competitivelyQualifiedGames:0,
    objective99point5Proven:false};
}

/**
 * Publish one all-eight native result atomically under an exclusive writer
 * lock. A missing or failed run never becomes a competitive denominator.
 * @param {string} filename Root-relative native receipt output path.
 * @param {object} result Complete result including caps and engine errors.
 */
function writeNativeReceipt(filename,result){
  const fs=require('node:fs');
  assert.equal(typeof filename,'string');
  assert.equal(result?.schema,VERSION);
  const parent=path.dirname(path.resolve(filename));
  fs.mkdirSync(parent,{recursive:true});
  const lock=path.resolve(filename)+'.lock';
  const fd=fs.openSync(lock,'wx');
  const tmp=path.resolve(filename)+'.'+process.pid+'.tmp';
  const target=path.resolve(filename);
  try{
    fs.writeFileSync(tmp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    fs.renameSync(tmp,target);
    const sidecar=target+'.sha256';
    const tmpDigest=sidecar+'.'+process.pid+'.tmp';
    try{
      fs.writeFileSync(tmpDigest,createHash('sha256')
        .update(require('node:fs').readFileSync(target)).digest('hex')+
        '  '+path.basename(target)+'\n',{flag:'wx'});
      fs.renameSync(tmpDigest,sidecar);
    }finally{if(fs.existsSync(tmpDigest))fs.unlinkSync(tmpDigest);}
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

if(require.main===module){
  assert.ok(process.env.AGENT18_TOOLJAMMER_V5_OUTPUT,
    'Set AGENT18_TOOLJAMMER_V5_OUTPUT');
  const result=runOriginalRoot17ToolAB();
  writeNativeReceipt(process.env.AGENT18_TOOLJAMMER_V5_OUTPUT,result);
  process.stdout.write(JSON.stringify({
    schema:VERSION,sourcePassPrebotHandStatus:
      result.sourceFirstPassPrebotHandContract?.status,
    selectedSourceToolAccepted:
      result.selectedSourceNativeStoreToolPlayAccepted,
    registeredArms:result.registeredSourceArms,
    root:result.selectedOriginalSourceComparison?.firstChangedNativeRoot,
    allDispositions:result.pairedDispositions.map(p=>({
      id:p.id,control:p.controlDisposition,treatment:p.status})),
    qualifiedGames:0
  })+'\n');
}

module.exports={VERSION,DEFAULT_REG,selectSourceTool,
  withOriginalSourceToolFork,acceptedRoots,runOriginalRoot17ToolAB,
  writeNativeReceipt};
