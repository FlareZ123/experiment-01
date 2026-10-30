'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent12-native-turn-closure-lineage-v1';
const OWNER_ROOT_ACTIONS = new Set([
  'PlayCardAction','UseAbilityAction','UseStadiumAction',
  'AttackAction','PassTurnAction','RetreatAction'
]);

/**
 * Classify one *settled native turn-advance* after its source accepted root
 * was established, independent of all private card identities and proposals.
 * @param {object} initiator Original Store root.
 */
function actionFamily(initiator){
  if(initiator.action==='PassTurnAction')return 'pass';
  if(initiator.action==='AttackAction')return 'attack';
  if(initiator.action==='PlayCardAction')return 'card-play';
  // Some native UseAbilityAction paths delegate a real attack (Perfection).
  // Without the selected attack prompt, the generic root kind is ambiguous.
  if(initiator.action==='UseAbilityAction')return 'ability-or-delegated-attack';
  if(initiator.action==='UseStadiumAction')return 'stadium-use';
  return 'other-root';
}

/**
 * Reconcile a consecutive accepted native Store root ledger into complete
 * normal-turn transitions, including non-Pass printed terminal effects that
 * ended at a later prompt. Replays/sudden-death clock resets MUST be separated
 * into previously authenticated epochs. This component asserts continuity.
 *
 * We never infer source printed-card identity from a generic same-name card,
 * never consult unowned hidden zones, and never promote a prompt completion
 * without the ledger's same-turn initiating root ordinal.
 *
 * @param {object[]} roots Genuine accepted Store rootActionLedger.
 * @returns {object} Per-transition bound/unknown receipts; not win evidence.
 */
function attestNativeTurnClosureLineage(roots){
  assert.ok(Array.isArray(roots));
  const closures=[],unbound=[];
  for(let i=0;i<roots.length;i++){
    const row=roots[i];
    assert.equal(row.actionOrdinal,i,'Consecutive accepted root ordinal required');
    assert.ok(Number.isSafeInteger(row.turnBefore)&&row.turnBefore>=0);
    assert.ok(Number.isSafeInteger(row.turnAfter)&&row.turnAfter>=0);
    assert.ok(typeof row.action==='string'&&row.action.length>0);
    if(i>0){
      assert.equal(row.turnBefore,roots[i-1].turnAfter,
        'Split native reset epochs and preserve every accepted root');
    }
    if(row.turnAfter===row.turnBefore)continue;
    assert.equal(row.turnAfter,row.turnBefore+1,
      'Unexpected turn clock transition; split/reset before attesting');
    if(row.turnBefore<1)continue;
    const prompted=row.action==='ResolvePromptAction';
    const origin=prompted?row.initiatingRootActionOrdinal:i;
    const init=Number.isSafeInteger(origin)&&origin>=0&&origin<=i?
      roots[origin]:null;
    const originValid=Boolean(init&&init.turnBefore===row.turnBefore&&
      [0,1].includes(init.playerSlot)&&
      OWNER_ROOT_ACTIONS.has(init.action)&&
      (!prompted||origin<i));
    const shared={
      terminalOrdinal:i,turnBefore:row.turnBefore,turnAfter:row.turnAfter,
      terminalAction:row.action,prompted,terminalPromptSeat:prompted?
        row.playerSlot:null,initiatingRootOrdinal:originValid?origin:null
    };
    if(!originValid){
      unbound.push({...shared,
        status:'unbound-terminal-origin',
        reason:prompted?'missing-or-misaligned-prompt-initiating-root':
          'unrecognized-owner-root'});
      continue;
    }
    closures.push({...shared,status:'accepted-native-turn-advance',
      actorSeat:init.playerSlot,initiatingRootAction:init.action,
      initiatingCardName:typeof init.card==='string'?init.card:null,
      initiatingAttackName:typeof init.attack==='string'?init.attack:null,
      actionFamily:actionFamily(init),
      promptCompletionDescendedFromRoot:prompted,
      paperRuleEffectVerified:false,
      opponentReplyVerified:false});
  }
  const counts={ledgerRoots:roots.length,nativeTurnEnds:closures.length+
    unbound.length,boundNativeTurnEnds:closures.length,
    unresolvedTerminals:unbound.length,
    promptClosedTerminals:closures.filter(x=>x.prompted).length,
    certainNonattackTerminalRoots:closures.filter(x=>['card-play',
      'stadium-use'].includes(x.actionFamily)).length,
    ambiguousAbilityTerminals:closures.filter(x=>
      x.actionFamily==='ability-or-delegated-attack').length,
    byFamily:{}};
  for(const c of closures){
    counts.byFamily[c.actionFamily]=(counts.byFamily[c.actionFamily]??0)+1;
  }
  return {version:VERSION,counts,closures,unbound,
    nativeStoreAcceptedOnly:true,sourcePaperFidelityVerified:false,
    allPlayersPolicyQualified:false,competitiveGameQualified:false};
}

module.exports={VERSION,OWNER_ROOT_ACTIONS,actionFamily,
  attestNativeTurnClosureLineage};
