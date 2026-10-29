'use strict';
const assert=require('node:assert/strict');
const NAMES=Object.freeze(['Speed Lightning Energy','Double Colorless Energy','Tag Call','Guzma & Hala','Thunder Mountain Prism Star',"Trainers' Mail",'Camping Gear','Battle VIP Pass','Quick Ball','Carmine','Boost Shake','Trubbish','Garbodor','Float Stone','Forest Seal Stone','Muscle Band']);
const ROOTS=new Set(['PlayCardAction','PassTurnAction','UseAbilityAction','AttackAction','RetreatAction','UseStadiumAction']);
/** Read-only post-decision resource summary. Never consulted by either bot.
 * @param {object[]} trace Original native Store decisionTrace.
 * @param {0|1} seat Source physical player seat.
 * @param {boolean} sourceActuallyFirst Verified first-player identity.
 * @returns {object} Actor-own-hand resource counts, no raw hand printings.
 */
function sourceFirstOwnedAffordances(trace,seat,sourceActuallyFirst){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof sourceActuallyFirst,'boolean');
  assert.ok(Array.isArray(trace));
  const turn=sourceActuallyFirst?1:2;
  const roots=trace.filter(e=>e.playerSlot===seat&&e.turnBefore===turn&&
    ROOTS.has(e.action)&&Number.isSafeInteger(e.actionOrdinal));
  const first=roots[0]??null;
  const pass=roots.find(e=>e.action==='PassTurnAction')??null;
  /** @param {object|null} row */
  function summarize(row){
    const s=row?.decisionHandBefore;
    if(s?.perspectiveSeat!==seat||!Array.isArray(s.ownHandPrintings))return null;
    const resources={};
    for(const name of NAMES)resources[name]=s.ownHandPrintings.filter(x=>
      x===name||x.startsWith(name+' ')).length;
    return {handSize:s.ownHandPrintings.length,resources};
  }
  const firstOwnHand=summarize(first), terminalPassOwnHand=summarize(pass);
  return {schema:'agent1-source-first-owned-affordances-v1',
    sourceSeat:seat,sourceActuallyFirst,sourceFirstOwnTurn:turn,
    status:firstOwnHand&&terminalPassOwnHand?'observed':'incomplete',
    firstRootOrdinal:first?.actionOrdinal??null,
    firstRootAction:first?.action??null,firstOwnHand,
    terminalPassRootOrdinal:pass?.actionOrdinal??null,
    terminalPassOwnHand,sourceTurnRootCount:roots.length,
    playedResources:roots.filter(e=>e.action==='PlayCardAction'&&
      NAMES.includes(e.card)).map(e=>({ordinal:e.actionOrdinal,name:e.card})),
    limitation:'Actor-owned postdecision hand resource counts only; no legal-action, playability or competitive qualification'};
}
module.exports={NAMES,ROOTS,sourceFirstOwnedAffordances};
