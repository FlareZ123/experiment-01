'use strict';
const fs=require('node:fs');
/** @param {object} r @returns {object} */
function view(r){
 return {physicalParity:r.physicalDealParity,
 previousRoots:r.exactEarlierRootsBeforeSecondIntervention,
 acceptedGX:r.nativePaleMoonGXAttackRootAccepted,
 root:r.actualSecondInterventionRoot?.action,
 attack:r.actualSecondInterventionRoot?.attack,
 validated:r.atLeastNativeProposalValidated,
 winners:[r.controlNativeWinner,r.counterreplyNativeWinner,r.repeatNativeWinner],
 arms:r.arms?.map(x=>({status:x.status,winner:x.winner,turn:x.globalTurns,error:!!x.error})),
 terminalPrizeCounts:r.arms?.map(x=>
  x.terminal?.after?.players?.map(p=>p.prizesRemaining)??null),
 terminalDeckCounts:r.arms?.map(x=>
  x.terminal?.after?.players?.map(p=>p.deckRemaining)??null),
 sourceTurn59:r.arms?.[1]?.sourceTurn59Pass?.actorPublic?.active?.printing,
 sourceTurn61: r.opponentNextTurnOwnerPublic ? {
  sourceActive:r.opponentNextTurnOwnerPublic.actorPublic?.active?.printing,
  opponentActive:r.opponentNextTurnOwnerPublic.opponentPublic?.active?.printing,
  sourceActiveEnergies:r.opponentNextTurnOwnerPublic.actorPublic?.active?.energies?.length,
  sourcePassTransition:r.opponentNextTurnOwnerPublic.nativePassTransitionVerdict
 }:null,
 afterAttackRoots:r.arms?.[1]?.rootActionLedger?.filter(x=>
  x.turnBefore>=60&&x.turnBefore<=66).map(x=>({
   ordinal:x.actionOrdinal,turn:x.turnBefore,
   seat:x.playerSlot,action:x.action,card:x.card,attack:x.attack
  })),
 qualifiedGames:0};
}
if(require.main===module)console.log('PALEMOON_PUBLIC '+JSON.stringify(view(JSON.parse(fs.readFileSync(process.argv[2],'utf8')))));
module.exports={view};
