'use strict';

const assert=require('node:assert/strict');
const categories=Object.freeze({
  energyDenial:['Plumeria','Team Flare Grunt','Crushing Hammer','Enhanced Hammer','Faba'],
  trapAccess:['Guzma','Captivating Poké Puff','Echoing Horn'],
  milling:["Team Rocket's Handiwork"],
  sustain:['Lusamine','Cynthia & Caitlin','Camping Gear','Palace Belt','Tropical Beach',"Player's Ceremony",'Palace Book']
});

/**
 * Diagnostic of accepted source-card plays in native root ledger.
 * Card play is not proof of resolving its intended strategic effect.
 * @param {object[]} roots Native successfully dispatched root actions.
 * @param {0|1} sourceSeat Real rank6 source physical seat.
 */
function rank6ControlExposure(roots,sourceSeat){
  assert.ok(Array.isArray(roots)&&[0,1].includes(sourceSeat));
  const own=roots.filter(r=>r.playerSlot===sourceSeat);
  const plays=own.filter(r=>r.action==='PlayCardAction');
  const groups={};
  for(const [category,cards] of Object.entries(categories)){
    const matches=plays.filter(r=>cards.includes(r.card));
    groups[category]={acceptedRootCount:matches.length,
      byCard:Object.fromEntries(cards.map(c=>[c,
        matches.filter(r=>r.card===c).length]))};
  }
  return {schema:'agent6-rank6-source-accepted-root-census-v1',
    totalOwnRoots:own.length,
    attacks:own.filter(r=>r.action==='AttackAction').length,
    groups,competitiveQualified:false,
    caveat:'Accepted card plays do not prove Energy discard, stranded Active, net mill, paper legality, efficient opponent response or game-clock compliance.'};
}
module.exports={categories,rank6ControlExposure};
