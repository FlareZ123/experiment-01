'use strict';

const assert=require('node:assert/strict');
const {attestNativeTurnClosureLineage,OWNER_ROOT_ACTIONS}=
  require('./agent12-native-turn-closure-lineage.cjs');

const VERSION='agent12-native-settled-recovery-lineage-bridge-v1';

/**
 * Retrospective join only. Attaches native settled turn-advance evidence
 * to accepted owner-root intents by the original Store root ordinal.
 * Must never be called inside a player decision policy: the future turn
 * and prompt-completion ledger are not owner-visible at decision time.
 *
 * @param {object[]} acceptedOwnerIntents Source-owner accepted intent rows,
 * each with nativeRootOrdinal, seat, globalTurn, kind, alternatives.
 * @param {object[]} ledger Complete genuine same-episode native Store root ledger.
 * @returns {object} Copy of accepted intents plus independently bound closures.
 */
function joinSettledNativeTurnEnds(acceptedOwnerIntents,ledger){
  assert.ok(Array.isArray(acceptedOwnerIntents));
  const attestation=attestNativeTurnClosureLineage(ledger);
  const byOrigin=new Map();
  for(const closure of attestation.closures){
    const ordinal=closure.initiatingRootOrdinal;
    assert.ok(!byOrigin.has(ordinal),
      'One accepted native owner root cannot end two different turns');
    byOrigin.set(ordinal,closure);
  }
  const seen=new Set();
  const events=acceptedOwnerIntents.map(event=>{
    assert.equal(event.accepted,true,'Only accepted owner roots are joinable');
    assert.ok(event.seat===0||event.seat===1);
    assert.ok(Number.isSafeInteger(event.globalTurn)&&event.globalTurn>=1);
    const id=event.nativeRootOrdinal;
    assert.ok(Number.isSafeInteger(id)&&id>=0&&id<ledger.length,
      'Owner event requires its genuine native accepted root ordinal');
    assert.ok(!seen.has(id),'Duplicate owner-root ordinal in recovery stream');
    seen.add(id);
    const root=ledger[id];
    assert.ok(OWNER_ROOT_ACTIONS.has(root.action),
      'Only original Store owner actions can be recovery anchors');
    assert.equal(root.playerSlot,event.seat,
      'Owner-root physical seat must match original Store');
    assert.equal(root.turnBefore,event.globalTurn,
      'Owner-root global turn must match original Store');
    if(event.nativeRootAction!==undefined)
      assert.equal(event.nativeRootAction,root.action,
        'Owner-root named native action mismatch');
    assert.equal(event.nativeSettledTurnAfter,undefined,
      'Do not accept caller-injected future turn attestation');
    const closure=byOrigin.get(id);
    if(!closure)return {...event};
    assert.equal(closure.actorSeat,event.seat);
    assert.equal(closure.turnBefore,event.globalTurn);
    return {...event,nativeSettledTurnAfter:closure.turnAfter,
      nativeTurnEndReceipt:{
        rootOrdinal:id,terminalOrdinal:closure.terminalOrdinal,
        terminalAction:closure.terminalAction,
        wasPromptClosed:closure.prompted,
        terminalPromptType:closure.terminalPromptType,
        nativeTurnBefore:closure.turnBefore,
        nativeTurnAfter:closure.turnAfter
      }};
  });
  const attested=events.filter(e=>e.nativeTurnEndReceipt);
  return {version:VERSION,events,
    acceptedOwnerEvents:events.length,
    nativeSettledTurnEndsJoined:attested.length,
    nonAttackPassNativeEnds:attested.filter(e=>
      e.kind!=='attack'&&e.kind!=='pass').length,
    nativeLedgerAllTurnEnds:attestation.counts.nativeTurnEnds,
    unmatchedLedgerClosures:attestation.counts.boundNativeTurnEnds-
      attested.length,
    ledgerUnboundNativeEnds:attestation.counts.unresolvedTerminals,
    postgameOnly:true,policyDecisionSafe:false,
    ownerPrivateCardIdentitiesInspected:false,
    competitiveQualifiedGames:0};
}

module.exports={VERSION,joinSettledNativeTurnEnds};
