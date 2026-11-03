'use strict';

const assert = require('node:assert/strict');
const VERSION = 'agent5-archived-paper-pass-opportunities-v1';

// Only source-verified printed effects belong in this metadata. Adding an Item
// requires its independently checked card text, not a name-pattern guess.
const UNRESTRICTED_DECK_DISCARD_ITEMS = Object.freeze({
  'Battle Compressor PHF': Object.freeze({min:1,max:3,cardId:'xy4-92'})
});

// Full printed card names for the observed Stadiums. A caller may provide a
// larger trusted public-print catalog; missing names remain unclassified.
const STADIUM_PRINT_NAMES = Object.freeze({
  'Wondrous Labyrinth Prism Star TEU':'Wondrous Labyrinth Prism Star',
  'Thunder Mountain Prism Star LOT':'Thunder Mountain Prism Star',
  'PokéStop PGO':'PokéStop',
  'Silent Lab PRC':'Silent Lab',
  'Path to the Peak CRE':'Path to the Peak',
  'Sky Field ROS':'Sky Field'
});

/**
 * Certify a printed, physical, alternative pre-Pass action using owner-held
 * exact printings, owner-public Stadium/deck count and real selected Pass.
 * It never inspects or infers the cards inside any hidden zone. These are
 * opportunity proofs, not rankings of strategic value or Store settlement.
 * @param {object} root Detached owner-root audit from the registered observer.
 * @param {Record<string,string>} [stadiumNames] Verified print-to-name mapping.
 * @returns {object} Full public candidate list and unproved decision statuses.
 */
function paperOptionsAtAcceptedPass(root,stadiumNames=STADIUM_PRINT_NAMES){
  assert.ok(root && Array.isArray(root.trainers));
  const pass=root.chosen?.action==='PassTurnAction' &&
    root.dispatch==='native-accepted';
  const board=root.ownerVisibleStadiumContext;
  const candidates=[];
  const unproven=[];
  if(!pass)return {version:VERSION,acceptedPass:false,candidates,unproven};
  for(const held of root.trainers){
    if(held.publicBlocker!==null){
      unproven.push({printing:held.printing,handIndex:held.handIndex,
        reason:'generic-public-blocker'});
      continue;
    }
    const discarder=held.type==='Item'?
      UNRESTRICTED_DECK_DISCARD_ITEMS[held.printing]:null;
    if(discarder){
      const count=board?.ownerDeckCount;
      if(!Number.isSafeInteger(count)||count<=0){
        unproven.push({printing:held.printing,handIndex:held.handIndex,
          reason:'unverified-or-empty-deck'});
        continue;
      }
      candidates.push({printing:held.printing,handIndex:held.handIndex,
        type:'Item',paperBasis:'unrestricted-own-deck-search-and-discard',
        printedCardId:discarder.cardId,
        cardMinDiscard:discarder.min,
        cardMaxDiscard:Math.min(discarder.max,count),
        ownerDeckCount:count,
        nativeEnumeratorOffered:held.nativeEnumeratorOffered===true});
      continue;
    }
    if(held.type==='Stadium'){
      const current=[...(board?.ownerStadium??[]),
        ...(board?.opponentStadium??[])];
      const currentName=current.length===1?stadiumNames[current[0]]:null;
      const attemptedName=stadiumNames[held.printing];
      const quotaUnused=Number.isSafeInteger(board?.ownerStadiumPlayedTurn)&&
        Number.isSafeInteger(root.turn)&&
        board.ownerStadiumPlayedTurn>=0&&
        board.ownerStadiumPlayedTurn<root.turn;
      if(!attemptedName || current.length>1 ||
        (currentName && currentName===attemptedName)||
        !quotaUnused||board?.ownerStadiumPlayLocked!==false){
        unproven.push({printing:held.printing,handIndex:held.handIndex,
          reason:'stadium-identity-quota-or-lock-unproven'});
        continue;
      }
      // No pre-existing Stadium is also allowed, provided the public board
      // proves the two Stadium zones empty and quota is unspent.
      if(current.length===1&&!currentName){
        unproven.push({printing:held.printing,handIndex:held.handIndex,
          reason:'unknown-current-stadium-name'});
        continue;
      }
      candidates.push({printing:held.printing,handIndex:held.handIndex,
        type:'Stadium',paperBasis:'different-name-public-stadium-play',
        previousStadium:current[0]??null,
        ownStadiumPlayedTurn:board.ownerStadiumPlayedTurn,
        turn:root.turn,nativeEnumeratorOffered:
          held.nativeEnumeratorOffered===true});
      continue;
    }
    unproven.push({printing:held.printing,handIndex:held.handIndex,
      reason:'printed-ability-target-or-payment-unverified'});
  }
  return {version:VERSION,acceptedPass:true,candidates,unproven};
}

/**
 * Scan a preregistered native archive without claiming independent games.
 * @param {object} archive Genuine original 6/9 source frontier JSON.
 * @returns {object} Observed root-level proof coverage, retaining failures.
 */
function summarizePaperOpportunities(archive){
  assert.deepEqual(archive?.registeredOriginalRanks,[6,9]);
  assert.equal(archive?.engine,
    'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.ok(Array.isArray(archive.rows)&&archive.rows.length===2);
  const rows=[];
  for(const game of archive.rows){
    const parity=game.sameSeedThreeArmParity;
    assert.match(game.initialFullPhysicalDealDigest,/^[0-9a-f]{64}$/);
    assert.ok(parity&&typeof parity.control==='string');
    assert.equal(parity.control,parity.observed);
    assert.equal(parity.control,parity.repeatedControl);
    assert.equal(game.capped,true,'Preserve historical action-capped source evidence');
    assert.equal(game.completed,false);
    assert.ok(game.frontiers && Array.isArray(game.frontiers.roots));
    const matches=game.frontiers.roots
      .map(root=>({root,
        gate:paperOptionsAtAcceptedPass(root)}))
      .filter(x=>x.gate.acceptedPass)
      .map(({root,gate})=>({
        primaryRankSeat:game.primaryRankSeat,
        physicalDealSha256:game.initialFullPhysicalDealDigest,
        rootOrdinal:root.ordinal,seat:root.seat,turn:root.turn,
        selectedAction:root.chosen.action,
        paperOptions:gate.candidates,
        unproven:gate.unproven
      }));
    rows.push(...matches);
  }
  const evidence=rows.flatMap(row=>row.paperOptions);
  return {version:VERSION,originalPhysicalDeals:archive.rows.length,
    selectedPassRoots:rows.length,
    paperCertifiedPassRoots:rows.filter(x=>x.paperOptions.length>0).length,
    stillUnprovenPassRoots:rows.filter(x=>x.paperOptions.length===0).length,
    printedDeckDiscardOptions:evidence.filter(x=>x.type==='Item').length,
    paperStadiumOptions:evidence.filter(x=>x.type==='Stadium').length,
    nativeEnumeratedCertifiedOptions:evidence.filter(x=>x.nativeEnumeratorOffered).length,
    nativeUnenumeratedCertifiedOptions:evidence.filter(x=>!x.nativeEnumeratorOffered).length,
    competitivelyQualifiedGames:0,strengthProof:false,
    rows};
}

module.exports={VERSION,UNRESTRICTED_DECK_DISCARD_ITEMS,
  STADIUM_PRINT_NAMES,paperOptionsAtAcceptedPass,
  summarizePaperOpportunities};
