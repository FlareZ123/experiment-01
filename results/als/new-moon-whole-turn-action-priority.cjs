'use strict';
/**
 * Research-only whole-turn tactical arbiter for fixed New Moon v3-v9.
 * This composes independent actor-visible policy gates without taking actions.
 *
 * Input branch contexts must be built from the same current authoritative
 * native actor state. A null context declares a branch inapplicable; any
 * explicitly provided branch returning 'unsupported' blocks final selection
 * rather than silently skipping uncertain facts. Higher-priority legal
 * no-selfKO attacks always beat voluntary Dusknoir Cursed Blast.
 *
 * This is NOT a full policy or engine-integrated game-winning planner.
 */
const {fairyZoneNoSelfKoPriority}=require('./new-moon-fairyzone-no-selfko-priority-gate.cjs');
const {analyzeDusknoirFinisher}=require('./new-moon-dusknoir-actor-finisher-gate.cjs');
const {terminalCursedBlast}=require('./new-moon-dusknoir-terminal-ability-gate.cjs');
const {assessRondoAfterBlast,assessDragonRondoAfterBlast}=
  require('./new-moon-thorns-postblast-rondo-actor-gate.cjs');
const {eligibleRoot}=require('./new-moon-guzma-hala-actor-opportunity-gate.cjs');

const branches=Object.freeze([
 {key:'fairyZoneDirect', rank:0, fn:fairyZoneNoSelfKoPriority, offers:['priority-no-self-ko']},
 {key:'duskTerminalBlast', rank:1, fn:terminalCursedBlast, offers:['terminal-candidate']},
 {key:'duskExactAttack', rank:2, fn:analyzeDusknoirFinisher, offers:['candidate']},
 {key:'duskDragonRondo', rank:3, fn:assessDragonRondoAfterBlast, offers:['candidate']},
 {key:'duskThornsRondo', rank:4, fn:assessRondoAfterBlast, offers:['candidate']},
 {key:'guzmaHala', rank:5, fn:eligibleRoot, offers:['candidate']}
]);
function compareNewMoonTurn(view){
 if(!view||typeof view!=='object'||typeof view.actorStateFingerprint!=='string'||
    !view.actorStateFingerprint.length||!view.branchContexts||
    typeof view.branchContexts!=='object'||Array.isArray(view.branchContexts))
   return {status:'unsupported',reason:'NO_COMMON_NATIVE_ACTOR_STATE_FINGERPRINT'};
 const outputs=[],unresolved=[];
 for(const branch of branches){
   const source=view.branchContexts[branch.key];
   if(source===undefined||source===null){
     outputs.push({branch:branch.key,status:'inapplicable',reason:'NOT_EXPOSED_AT_THIS_ROOT'});
     continue;
   }
   if(typeof source!=='object'||Array.isArray(source))
     return {status:'unsupported',reason:'NON_OBJECT_BRANCH_STATE',branch:branch.key};
   let result;
   try{result=branch.fn(source);}catch(e){
     return {status:'unsupported',reason:'BRANCH_GATE_THROW',branch:branch.key};
   }
   if(!result||typeof result.status!=='string')
     return {status:'unsupported',reason:'INVALID_BRANCH_GATE_OUTPUT',branch:branch.key};
   outputs.push({branch:branch.key,status:result.status,reason:result.reason});
   if(result.status==='unsupported')unresolved.push(branch.key);
   if(branch.offers.includes(result.status)){
     if(unresolved.length)
       return {status:'unsupported',reason:'HIGHER_PRIORITY_BRANCH_UNCERTIFIED',
         firstUnresolvedBranch:unresolved[0],tentative:branch.key,evaluations:outputs};
     return {
       status:'candidate',branch:branch.key,
       firstAction:typeof result.firstAction==='string' ?
         {type:result.firstAction,name:result.name,discardIntents:result.discardIntents||[]} :
         result.firstAction,
       continuation:result.conditionalContinuation||result.continuation||null,
       actorStateFingerprint:view.actorStateFingerprint,
       revalidateAfterEachAction:true,reason:result.reason,
       priority:branch.rank,entry:result,evaluations:outputs,
       condition:'No native turn or opponent response was executed; root proposal only.'
     };
   }
 }
 if(unresolved.length)
  return {status:'unsupported',reason:'BRANCHES_UNCERTIFIED',
    unresolved,evaluations:outputs};
 return {status:'none',reason:'NO_CERTIFIED_TACTICAL_BRANCH',
  evaluations:outputs};
}
module.exports={compareNewMoonTurn,branches};
