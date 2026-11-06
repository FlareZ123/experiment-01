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
 qualifiedGames:0};
}
if(require.main===module)console.log('PALEMOON_PUBLIC '+JSON.stringify(view(JSON.parse(fs.readFileSync(process.argv[2],'utf8')))));
module.exports={view};
