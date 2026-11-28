'use strict';
/* Test pure policy source in a no-import, no-process VM. No Twinleaf game. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../../simulation/evaluation/2026-11');
const v2=fs.readFileSync(path.join(dir,'agent1-newmoon-v2-jammer-decision.cjs'),'utf8');
const v3=fs.readFileSync(path.join(dir,'agent1-newmoon-v3-finisher-slice.cjs'),'utf8');
const bundled=fs.readFileSync(path.join(dir,'agent1-newmoon-v3-worker-standalone.cjs'),'utf8');
const needle="const oldSetup=require('./agent1-newmoon-v2-jammer-decision.cjs');";
const canonical=v3.replace(needle,[
 '/* Bundled v2 generic opening module in isolated lexical scope; no runtime import. */',
 'const oldSetup=(()=>{',
 ' const module={exports:{}};',
 v2,
 ' return module.exports;',
 '})();'
].join('\n'));
assert.equal(bundled,canonical,'checked-in bundle must exactly match canonical build');
const forbidden=['require','process','fetch','Date','crypto','Buffer','console',
 'setTimeout','setInterval','eval','Function','SharedArrayBuffer','WebAssembly'];
const context=vm.createContext({module:{exports:{}},exports:{}},
 {codeGeneration:{strings:false,wasm:false}});
for(const key of forbidden)vm.runInContext('globalThis['+JSON.stringify(key)+']=undefined',context);
vm.runInContext(bundled,context,{timeout:5000,filename:'agent1-v3-standalone-sandbox.cjs'});
const p=context.module.exports;
assert.equal(p.POLICY_VERSION,'agent1-newmoon-dusknoir-v3-finisher-research-v1');
assert.equal(p.DECK_SHA,'0db19a75d0d1ce43128b9a9fdc4fe3013833eaaba4641972af7af30f4b41e7dd');
assert.equal(typeof p.createPolicy,'function');
const w=p.createPolicy({role:'candidate',seat:0,policyVersion:p.POLICY_VERSION,config:{}});
const act={printing:'Mewtwo & Mew-GX UNM71',specialConditions:[],
 abilities:['Perfection'],abilitySuppressions:[{abilityName:'Perfection',suppressed:false}]};
const dusk={printing:'Dusknoir SFA20',
 abilities:['Cursed Blast'],abilitySuppressions:[{abilityName:'Cursed Blast',suppressed:false}]};
const donor={printing:'Trevenant & Dusknoir-GX SM217'};
const opp={printing:'Regidrago VSTAR SIT136',hp:280,damage:0,tools:[]};
const obs={actorSeat:0,globalTurn:5,decisionKind:'owner-root',
 ownPublic:{active:act,bench:[dusk,donor],prizeCount:5,
 publicTurnRestrictions:{gxUsed:false}},
 opponentPublic:{active:opp,bench:[],prizeCount:5,handCount:5},
 ownHand:['Ace Trainer ROS69'],ownTurnResources:{supporterPlayedTurn:0}};
const blast={kind:'use-ability',token:'blast',actorPrinting:dusk.printing,
 publicMetadata:{abilityName:'Cursed Blast',sourceZone:'bench',sourceIndex:0}};
const night={kind:'attack',token:'night',actorPrinting:donor.printing,
 attackName:'Night Watch',publicMetadata:{attackCostPayable:true,
 attackSource:{sourceKind:'bench-pokemon',sourceSlot:'BENCH',sourceIndex:1,
 sourceCardName:'Trevenant & Dusknoir-GX',
 sourceCardFullName:donor.printing,attackName:'Night Watch'}}};
const req={role:'candidate',seat:0,prompt:null,observation:obs,actionFrontier:{items:[night,blast]}};
assert.equal(w.decide(req).token,'blast');
assert.equal(w.decideWithAudit({...req,observation:{...obs,
 decisionKind:'owner-prompt'},actionFrontier:null,prompt:{
 actingSeat:0,promptType:'ChoosePokemonPrompt',
 source:{classification:'actor-choice',sourceKind:'card-effect',
 effectName:'Cursed Blast',sourcePrinting:dusk.printing},
 publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
 choices:[{kind:'pokemon',token:'reg',printing:opp.printing,
 publicMetadata:{ownerSeat:'opponent',targetZone:'active',isOwnerVisible:true}}]
}}).decision.kind,'select-choices');
console.log('v3 standalone: exact bundle + restricted VM + root/prompt decisions passed');
