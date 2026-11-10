'use strict';

const assert=require('node:assert/strict');

const VERSION='agent13-native-physical-zone-transfers-v1';

/** Normalize an original physical card position, omitting stack order. */
function zoneOf(position){
  if(position===null||position===undefined)return null;
  assert.equal(typeof position,'string');
  assert.match(position,/^s[01]\.[^:]+:[0-9]+$/,
    'A physical zone must have one actual player, zone and stack position');
  return position.slice(0,position.lastIndexOf(':'));
}
const hasOwn=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const isPrizeZone=z=>typeof z==='string'&&/^s[01]\.prizes[0-9]+$/.test(z);
const isEnergy=printing=>typeof printing==='string'&&
  /(?:\bEnergy\b|エネルギー)/u.test(printing);

/**
 * Convert raw physical identity moves into meaningful zone transfers.
 * Reordering cards within a shuffled deck or a Pokémon stack is explicitly
 * excluded from transfers, but remains reproducible as a reorder count.
 * This does not certify the legality or strategic value of any move.
 * @param {object} packet Agent36 original-Store full physical receipt packet.
 * @returns {object} Original-root-aligned physical transfer timeline.
 */
function summarizePhysicalZoneTransfers(packet){
  assert.equal(packet?.schema,'agent36-live-paper-root-receipts-v1');
  assert.ok(Array.isArray(packet.originalPhysicalCards));
  const ids=new Map(packet.originalPhysicalCards.map(card=>[card.id,card]));
  assert.equal(ids.size,packet.originalPhysicalCards.length,
    'Physical card identities must be distinct');
  assert.ok(Array.isArray(packet.receipts));
  const timeline=[];
  let totalDeckReorders=0;
  let totalTrueTransfers=0;
  let totalUnaccounted=0;
  for(const [index,receipt] of packet.receipts.entries()){
    assert.equal(receipt.actionOrdinal,index,
      'Physical receipt ordinals must be contiguous');
    assert.ok(receipt.beforePositions&&receipt.afterPositions);
    assert.ok(Array.isArray(receipt.movement));
    const changes=new Map();
    const transfers=[];
    const temporaryUnaccounted=[];
    let reorderedWithinZone=0;
    for(const move of receipt.movement){
      const known=ids.get(move.id);
      assert.ok(known,'A transfer must refer to an original physical card');
      assert.equal(move.printing,known.printing,
        'Physical printing cannot change during native play');
      assert.equal(move.from,receipt.beforePositions[move.id]??null);
      assert.equal(move.to,receipt.afterPositions[move.id]??null);
      assert.ok(!changes.has(move.id),'One change per original physical card');
      changes.set(move.id,move);
      const fromZone=zoneOf(move.from),toZone=zoneOf(move.to);
      if(fromZone===toZone){
        reorderedWithinZone++;
        continue;
      }
      const event={id:move.id,printing:known.printing,
        fromZone,toZone,from:move.from,to:move.to};
      if(fromZone===null||toZone===null)
        temporaryUnaccounted.push(event);
      else transfers.push(event);
    }
    // Detect silently omitted card identity movements, not merely report
    // the subset the upstream observer happened to put in "movement".
    for(const id of ids.keys()){
      const before=receipt.beforePositions[id]??null;
      const after=receipt.afterPositions[id]??null;
      if(before!==after)
        assert.ok(changes.has(id),
          'Native physical movement list omitted a changed original card');
    }
    const prizeClaims=transfers.filter(x=>
      isPrizeZone(x.fromZone) &&
      x.toZone===x.fromZone.slice(0,2)+'.hand');
    const energyDeckAttachments=transfers.filter(x=>
      isEnergy(x.printing)&&/\.deck$/.test(x.fromZone)&&
      /^(s[01])\.(?:active|bench[0-9]+)$/.test(x.toZone));
    const crossSeatMoves=transfers.filter(x=>
      x.fromZone.slice(0,2)!==x.toZone.slice(0,2));
    timeline.push({
      rootOrdinal:index,turnBefore:receipt.turnBefore,
      actorSeat:receipt.seat,action:receipt.action,
      rawChangedPhysicalCards:receipt.movement.length,
      withinZoneReorders:reorderedWithinZone,
      zoneTransferCount:transfers.length,
      temporaryUnaccountedCount:temporaryUnaccounted.length,
      prizeClaims,energyDeckAttachments,crossSeatMoves,
      transfers,temporaryUnaccounted
    });
    totalDeckReorders+=reorderedWithinZone;
    totalTrueTransfers+=transfers.length;
    totalUnaccounted+=temporaryUnaccounted.length;
  }
  return {
    schema:VERSION,rootCount:timeline.length,
    originalPhysicalCardCount:ids.size,
    trueZoneTransfers:totalTrueTransfers,
    withinZoneReorders:totalDeckReorders,
    temporaryUnaccountedIdentityEvents:totalUnaccounted,
    prizeCardsMovedToOwnerHand:timeline.reduce((n,r)=>n+r.prizeClaims.length,0),
    energyDeckAttachments:timeline.reduce((n,r)=>
      n+r.energyDeckAttachments.length,0),
    crossSeatPhysicalMovements:timeline.reduce((n,r)=>
      n+r.crossSeatMoves.length,0),
    completeOriginalFullPhysicalCustodyClaim:
      packet.settledPhysicalIdentityClean===true,
    timeline,paperPaymentCertified:false,
    independentPaperRulesReviewed:false,competitiveGameQualified:false
  };
}

/**
 * Tie a settled attack's selected prompt and subsequent physical transfers
 * to the original actual accepted attack root for one local turn. A copied
 * attack can be paid on the root and take Prizes on later prompt roots.
 */
function attackTransferWindows(roots,modality,transfers){
  assert.ok(Array.isArray(roots));
  assert.equal(roots.length,transfers.rootCount);
  assert.equal(modality.rootCount,roots.length);
  const windows=[];
  for(const event of modality.events){
    const from=event.initiatingRootOrdinal,turn=event.turnBefore;
    let end=from+1;
    while(end<roots.length&&roots[end].turnBefore===turn &&
      roots[end].action!=='AttackAction'&&
      !(roots[end].action==='UseAbilityAction'&&
        roots[end].ability==='Perfection'))
      end++;
    const steps=transfers.timeline.slice(from,end);
    const claims=steps.flatMap(x=>x.prizeClaims)
      .filter(x=>x.fromZone.startsWith('s'+event.ownerSeat+'.'));
    const enemyActiveDiscards=steps.flatMap(x=>x.transfers).filter(x=>
      x.fromZone==='s'+(1-event.ownerSeat)+'.active'&&
      x.toZone==='s'+(1-event.ownerSeat)+'.discard');
    windows.push({
      initiatingRootOrdinal:from,turnBefore:turn,
      actorSeat:event.ownerSeat,attackMechanism:event.attackMechanism,
      copiedAttackName:event.copyChoice?.attackName??null,
      ordinaryAttackName:event.ordinaryAttackName,
      coveredThroughRootOrdinal:end-1,
      prizeClaims:claims.length,
      physicallyMovedEnemyActiveCardsToDiscard:enemyActiveDiscards.length,
      physicalPrizeChangeFromSeparateObserver:
        event.observedSameTurnPrizeDelta,
      prizeObserversAgree:event.observedSameTurnPrizeDelta===null?
        null:event.observedSameTurnPrizeDelta===claims.length,
      collectedZoneTransfers:steps.reduce((n,x)=>n+x.zoneTransferCount,0),
      energyAttachmentsFromDeck:steps.flatMap(x=>x.energyDeckAttachments),
      paperPaymentCertified:false,competitiveGameQualified:false
    });
  }
  return {schema:'agent13-causal-attack-physical-transfers-v1',
    windows,competitiveGameQualified:false};
}
module.exports={VERSION,zoneOf,summarizePhysicalZoneTransfers,
  attackTransferWindows};
