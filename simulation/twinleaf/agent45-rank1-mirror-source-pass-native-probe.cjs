'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent45-native-original-rank1-mirror-source-pass-postchoice-attack-availability-v1';
const TARGET='1:212:B:champion-reference';
const PREFIX='agent41-bilateral-v2-common-policy-development-';

/**
 * Exactly one original native Store is observed per headless match.
 * The cloned native announcer executes only after the source policy chose
 * Pass and before its actual Pass root is dispatched. An audit does not
 * influence the actor's original decision.
 *
 * @template T
 * @param {()=>T} execute
 * @param {{Store?:Function,probe?:Function,trialId?:string,sourceSeat?:0|1}} [deps]
 */
function withActualOwnerMirrorSourcePassAttackProbe(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const probe=deps.probe??require('./pass-attack-announcement-probe.cjs')
    .probePassedAttackOptions;
  assert.equal(typeof probe,'function');
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const audit={schema:VERSION,trialId:deps.trialId??null,
    actualStores:0,selectedSourcePassCount:0,
    sourcePasses:[],auditErrors:0,
    decisionsChanged:false,opponentPrivateCardsUsedForDecisions:false,
    fullPaperGamesQualified:0};
  const sourceSeat=deps.sourceSeat??0;
  assert.ok(sourceSeat===0||sourceSeat===1);
  let actualStore=null,ordinal=0;
  function intercepted(action,...args){
    const kind=action?.constructor?.name;
    if(kind==='AddPlayerAction'&&actualStore===null){
      actualStore=this;
      audit.actualStores++;
    }
    if(this!==actualStore)
      return original.value.call(this,action,...args);
    const currentOrdinal=ordinal++;
    if(kind==='PassTurnAction'){
      const before=this.state;
      const actor=before.players.findIndex(p=>p.id===action.id);
      if(actor===sourceSeat){
        const owner=before.players[actor];
        assert.ok(owner);
        const entry={
          ordinal:currentOrdinal,turn:before.turn,seat:sourceSeat,
          visibleActivePrinting:owner.active.getPokemonCard()?.fullName??null,
          visibleAttachedEnergyPrintings:owner.active.energies.cards
            .map(c=>c.fullName),
          actualActorChosePass:true,sourceOwnedActualRootStore:true,
          activePrintedAttacksProbed:null,
          truncated:false,possibleEngineAttackAnnouncements:0,
          status:'post-decision-audit-not-yet-run'
        };
        try{
          const observation=probe(before,owner.id);
          entry.activePrintedAttacksProbed=
            observation?.tested?.map(t=>({
              name:t.name,source:t.source,
              nativeCloneAcceptedAnnouncement:
                t.engineAcceptedAnnouncement===true
            }))??[];
          entry.truncated=observation?.truncated===true;
          entry.possibleEngineAttackAnnouncements=
            entry.activePrintedAttacksProbed.filter(t=>
              t.nativeCloneAcceptedAnnouncement===true).length;
          entry.status=observation?'post-choice-detached-clone-probed':
            'no-unresolved-prompt-eligible-probe';
        }catch(error){
          entry.status='post-choice-probe-error';
          entry.auditError=String(error?.message??error);
          audit.auditErrors++;
        }
        // No selected or proposed actions are changed. This observer must
        // never provide these detached-clone outcomes to policy code.
        audit.sourcePasses.push(entry);
        audit.selectedSourcePassCount++;
      }
    }
    return original.value.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',
    {...original,value:intercepted});
  try{
    return {result:execute(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent45SourcePassProbeAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,intercepted);
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

/**
 * Default-independent wrapper for the exact original v8 eight-arm baseline
 * with owner Telepath plus Confirm false. Only TARGET is instrumented.
 * @param {{runner?:Function,headless?:object,observer?:Function}} [deps]
 */
function runActualOriginalRank1MirrorPassProbe(deps={}){
  const engine=deps.headless??
    require('./headless.cjs');
  const runner=deps.runner??
    require('../evaluation/agent32-issue25-v8-telepath-confirm-default-false.cjs')
      .runIssue25V8WithTelepathAndDefaultConfirmFalse;
  const observer=deps.observer??withActualOwnerMirrorSourcePassAttackProbe;
  const before=engine.runMatch;
  assert.equal(typeof before,'function');
  const observations=[];
  function capture(request){
    const id=typeof request.label==='string'&&
      request.label.startsWith(PREFIX)?
      request.label.slice(PREFIX.length):request.label;
    if(id!==TARGET)return before(request);
    try{
      const receipt=observer(()=>before(request),
        {trialId:id,sourceSeat:0});
      observations.push({trialId:id,nativeReturned:true,audit:receipt.audit});
      return receipt.result;
    }catch(error){
      observations.push({trialId:id,nativeReturned:false,
        audit:error?.agent45SourcePassProbeAudit??null});
      throw error;
    }
  }
  engine.runMatch=capture;
  let execution;
  try{execution=runner();}
  finally{
    assert.strictEqual(engine.runMatch,capture);
    engine.runMatch=before;
  }
  assert.equal(observations.length,1);
  assert.equal(observations[0].trialId,TARGET);
  return {schema:VERSION,execution,mirrorSourcePass:observations[0]};
}

module.exports={VERSION,TARGET,PREFIX,
  withActualOwnerMirrorSourcePassAttackProbe,
  runActualOriginalRank1MirrorPassProbe};
