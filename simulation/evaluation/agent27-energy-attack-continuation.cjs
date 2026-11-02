'use strict';
const assert=require('node:assert/strict');

/**
 * Join an already Store-accepted, physically settled Celestial Roar Energy
 * prompt with the genuine printed source attack and subsequent opponent roots.
 * Observes existing native receipts only; never changes player decisions.
 * @param {object} match Pinned real Store match public traces.
 * @param {object[]} physicalReceipts
 * @param {0|1} sourceSeat Physical original-source seat.
 * @returns {object}
 */
function joinSourceEnergyAttackContinuation(match,physicalReceipts,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.ok(Array.isArray(physicalReceipts));
  assert.ok(Array.isArray(match.publicAttackTransitions));
  assert.ok(Array.isArray(match.rootActionLedger));
  const opponentSeat=1-sourceSeat;
  const roots=match.rootActionLedger;
  return {
    schema:'agent27-source-energy-attack-opponent-continuation-v1',
    sourceSeat,opponentSeat,
    promptEpisodes:physicalReceipts.map(receipt=>{
      const physicalProven=receipt.nativeStoreActionAccepted===true &&
        receipt.twoDistinctPhysicalCards===true &&
        receipt.bothOriginalSourceCards===true &&
        receipt.bothAttachedToOriginalActive===true;
      const candidates=match.publicAttackTransitions.filter(event=>
        event.triggerPlayerSlot===sourceSeat &&
        event.turnBefore===receipt.globalTurn &&
        event.declarations?.some(row=>row.attackName==='Celestial Roar') &&
        event.settled!==null);
      if(!physicalProven||candidates.length!==1) {
        return {promptId:receipt.promptId,sourceTurn:receipt.globalTurn,
          status:!physicalProven?'physical-attachment-unverified':
            candidates.length===0?'source-attack-not-bound':'ambiguous-source-attack',
          boundAttackCount:candidates.length,opponentReply:null};
      }
      const attack=candidates[0],afterOrdinal=attack.settled.completionRootActionOrdinal;
      const opponentRoots=roots.filter(root=>
        root.actionOrdinal>afterOrdinal &&
        root.playerSlot===opponentSeat &&
        root.action!=='ResolvePromptAction' &&
        root.pendingPrompt===null &&
        root.turnBefore>receipt.globalTurn);
      const first=opponentRoots[0]??null;
      const replyActions=first?opponentRoots.filter(root=>
        root.turnBefore===first.turnBefore).slice(0,24).map(root=>({
          ordinal:root.actionOrdinal,action:root.action,
          card:root.card??null,attack:root.attack??null
        })):[];
      const finalPass=replyActions.findLast(row=>row.action==='PassTurnAction');
      const passContext=finalPass ?
        match.ownerPassResources?.find(row=>
          row.actionOrdinal===finalPass.ordinal&&
          row.playerSlot===opponentSeat)??null : null;
      return {
        promptId:receipt.promptId,sourceTurn:receipt.globalTurn,
        status:first?'native-settled-source-attack-with-opponent-root':
          'native-settled-source-attack-no-opponent-root',
        sourceAttack:{actionOrdinal:attack.actionOrdinal,
          attackName:'Celestial Roar',settledRootOrdinal:afterOrdinal,
          beforePrizesRemaining:attack.beforePrizesRemaining,
          afterPrizesRemaining:attack.settled.prizesRemaining,
          beforePublicBoard:attack.before,afterPublicBoard:attack.settled.after
        },
        opponentReply:first?{firstRootOrdinal:first.actionOrdinal,
          turn:first.turnBefore,actions:replyActions,
          finalPassContext:passContext}:null
      };
    }),
    qualifiedCompetitiveGames:0
  };
}

module.exports={joinSourceEnergyAttackContinuation};
