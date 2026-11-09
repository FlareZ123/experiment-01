'use strict';

const assert=require('node:assert/strict');
const {remainingPrizes,perfectionPrizeReceipts}=
  require('./agent36-perfection-prize-receipts.cjs');

const VERSION='postgame-native-attack-modality-ledger-v1';
const isInitiation=root=>root.action==='AttackAction'||
  (root.action==='UseAbilityAction'&&root.ability==='Perfection');

/**
 * Preserve both ordinary roots and copied-attack initiations in a postgame-only
 * ledger. A physical receipt is a native observation, never paper adjudication.
 * @param {object} evidence Actual accepted-root ledger and optional full tape.
 * @returns {object} Additive attack events and modality counts.
 */
function postgameAttackModalityLedger(evidence){
  const roots=evidence.rootActionLedger;
  assert.ok(Array.isArray(roots));
  for(let i=0;i<roots.length;i++){
    assert.equal(roots[i].actionOrdinal,i,'Root order must be lossless');
    assert.ok(Number.isSafeInteger(roots[i].turnBefore));
  }
  const tape=evidence.physicalZoneTape??null;
  const snapshots=tape?.postAcceptedRoots??null;
  if(tape!==null){
    assert.ok(Array.isArray(snapshots));
    assert.equal(snapshots.length,roots.length,
      'Full physical Store root tape is required for Prize attribution');
    for(let i=0;i<roots.length;i++)
      assert.equal(snapshots[i].rootOrdinal,i,
        'Physical root ordinals must align exactly');
  }
  const ordinaryTransitions=evidence.publicAttackTransitions??[];
  assert.ok(Array.isArray(ordinaryTransitions));
  const copyReceipts=snapshots?[
    ...perfectionPrizeReceipts(roots,tape,0),
    ...perfectionPrizeReceipts(roots,tape,1)
  ]:[];
  const receiptsByRoot=new Map(copyReceipts.map(x=>[x.initiatingRoot,x]));
  const events=[];
  for(let i=0;i<roots.length;i++){
    const root=roots[i];
    if(!isInitiation(root))continue;
    const ownerSeat=root.playerSlot;
    assert.ok(ownerSeat===0||ownerSeat===1,
      'An attack initiation must identify its physical owner seat');
    const modality=root.action==='AttackAction'? 'ordinary-root-attack':
      'perfection-copied-attack-initiation';
    // A distinct initiation or epoch boundary terminates attribution. No
    // root from another game or another attack may inherit the Prize delta.
    let last=i;
    for(let j=i+1;j<roots.length;j++){
      const earlier=roots[j-1];
      if(earlier.turnAfter<earlier.turnBefore ||
        roots[j].turnBefore!==root.turnBefore ||
        (roots[j].playerSlot!==ownerSeat &&
          roots[j].action!=='ResolvePromptAction') ||
        isInitiation(roots[j]))break;
      last=j;
    }
    const linkedChoices=roots.slice(i+1,last+1).filter(r=>
      r.action==='ResolvePromptAction' &&
      r.pendingPrompt==='ChooseAttackPrompt' &&
      r.initiatingRootActionOrdinal===i &&
      r.attackChoice && typeof r.attackChoice.attackName==='string'
    ).map(r=>({rootOrdinal:r.actionOrdinal,
      printing:r.attackChoice.printing,
      attackName:r.attackChoice.attackName,
      sourceIndex:r.attackChoice.sourceIndex,
      attackIndex:r.attackChoice.attackIndex}));
    const copyChoice=linkedChoices.length===1?linkedChoices[0]:null;
    const physicalReceipt=receiptsByRoot.get(i)??null;
    let prizeDelta=null;
    if(snapshots && i>0){
      const before=remainingPrizes(snapshots[i-1].physicalZones[ownerSeat]);
      const after=remainingPrizes(snapshots[last].physicalZones[ownerSeat]);
      assert.ok(after<=before,'Prize count cannot increase within a single epoch');
      prizeDelta=before-after;
    }
    const observedTransition=modality==='ordinary-root-attack'?
      ordinaryTransitions.find(x=>x.actionOrdinal===i &&
        x.triggerPlayerSlot===ownerSeat &&
        x.turnBefore===root.turnBefore &&
        x.triggerAction==='AttackAction')??null:null;
    // A recorded copy choice without a subsequent attack outcome may be a
    // rejected/aborted native branch. Never promote it to an attack settlement.
    const observedNativeSettlement=modality==='ordinary-root-attack'?
      Boolean(observedTransition?.settled?.after):
      Boolean(copyChoice && (
        roots.slice(i,last+1).some(x=>x.turnAfter>root.turnBefore)||
        (evidence.nativeFinished===true && last===roots.length-1 &&
          prizeDelta!==null && prizeDelta>0)));
    const nextOpponent=roots.find(r=>r.actionOrdinal>last &&
      r.playerSlot===1-ownerSeat &&
      r.turnBefore===root.turnBefore+1 &&
      r.action!=='ResolvePromptAction' &&
      !roots.slice(last+1,r.actionOrdinal+1).some(x=>
        x.turnAfter<x.turnBefore))??null;
    events.push({
      initiatingRootOrdinal:i,turnBefore:root.turnBefore,ownerSeat,
      modality,ordinaryAttackName:modality==='ordinary-root-attack'?
        root.attack??null:null,
      copyChoice,
      copyChoiceStatus:modality==='ordinary-root-attack'?'not-applicable':
        linkedChoices.length===1?'observed':
          linkedChoices.length===0?'unknown':'ambiguous',
      nativeSettlementStatus:observedNativeSettlement?'observed':'unknown',
      observedSameTurnPrizeDelta:prizeDelta,
      physicalPrizeEvidenceStatus:snapshots?(i===0?'missing-pre-root':'observed'):
        'unavailable',
      physicalPerfectionReceipt:modality==='perfection-copied-attack-initiation'?
        physicalReceipt:null,
      nextOpponentRoot:nextOpponent?{
        ordinal:nextOpponent.actionOrdinal,
        turn:nextOpponent.turnBefore,
        action:nextOpponent.action
      }:null,
      opponentResponseStatus:nextOpponent?'observed-next-turn-root':
        evidence.nativeFinished===true && last===roots.length-1?
          'native-terminal-no-next-root':'unobserved',
      paperPaymentCertified:false,competitiveGameQualified:false
    });
  }
  return {
    schema:VERSION,rootCount:roots.length,
    ordinaryRootAttackInitiations:events.filter(e=>
      e.modality==='ordinary-root-attack').length,
    perfectionInitiations:events.filter(e=>
      e.modality==='perfection-copied-attack-initiation').length,
    observedPerfectionCopyChoices:events.filter(e=>
      e.modality==='perfection-copied-attack-initiation'&&
      e.copyChoiceStatus==='observed').length,
    perfectionWithObservedNativePrizeChange:events.filter(e=>
      e.modality==='perfection-copied-attack-initiation'&&
      e.observedSameTurnPrizeDelta>0).length,
    physicalTapeAvailable:snapshots!==null,
    events,
    paperPaymentCertified:false,competitiveGameQualified:false
  };
}

/**
 * A read-only Store callback adapter for postgame physical Prize/Active
 * receipts. It never feeds Store snapshots to either bot. Each snapshot keeps
 * only the zones required for the already published Agent36 prize observer.
 * These are NOT complete sixty-card physical-custody certificates.
 */
function createPostgameAttackTape(){
  let store=null;
  let ordinal=0;
  let nextId=0;
  const identities=new WeakMap();
  const postAcceptedRoots=[];
  const physicalCard=card=>{
    if(card===undefined||card===null)return null;
    if(!identities.has(card))identities.set(card,nextId++);
    return {id:identities.get(card),printing:card.fullName??card.name??null};
  };
  function onRootStoreCreated(liveStore){
    assert.equal(store,null,'One exact native Store per physical tape');
    store=liveStore;
  }
  function onRootActionDispatched(liveStore,action,rootOrdinal){
    assert.strictEqual(liveStore,store,'Only the original Store may provide receipts');
    assert.equal(rootOrdinal,ordinal++,'Accepted root ordinals must be contiguous');
    assert.equal(store?.state?.players?.length,2,'Two player Store required');
    const physicalZones=store.state.players.map(player=>({
      // Face-down printed card identities are intentionally excluded.
      prizes:player.prizes.map(slot=>slot.cards.map(()=>null)),
      active:{cards:(player.active?.cards??[]).map(physicalCard)},
      discard:(player.discard?.cards??[]).map(physicalCard)
    }));
    postAcceptedRoots.push({rootOrdinal,physicalZones});
  }
  const result=()=>({schema:'postgame-attack-physical-snapshot-v1',
    postAcceptedRoots:postAcceptedRoots.slice(),
    capturesFullDeckCustody:false,paperReviewed:false});
  return {onRootStoreCreated,onRootActionDispatched,result};
}

module.exports={VERSION,postgameAttackModalityLedger,
  createPostgameAttackTape};
