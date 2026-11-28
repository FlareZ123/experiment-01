'use strict';
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION,DECK_PATH,supportedDirectTerminal}=
 require('../../simulation/evaluation/2026-11/agent22-newmoon-v3-countercatcher-worker.cjs');
let assertions=0;
const check=(a,b)=>{assert.equal(a,b);assertions++;};
const clone=x=>JSON.parse(JSON.stringify(x));
const base=()=>({
 role:'candidate',seat:0,prompt:null,
 observation:{decisionKind:'owner-root',globalTurn:7,actorSeat:0,
  ownHand:['Counter Catcher PAR160'],
  ownPublic:{prizeCount:3,active:{printing:'Mewtwo & Mew-GX UNM071',
    specialConditions:[]},bench:[{printing:'Dusknoir SFA020',
     abilities:['Cursed Blast'],abilitySuppressions:[
      {abilityName:'Cursed Blast',suppressed:false}]}],
   publicTurnRestrictions:{gxUsed:false}},
  opponentPublic:{prizeCount:3,active:{printing:'Rattata',hp:40,
   damage:0,tools:[]},
   bench:[{printing:'Mega Lopunny ex ME2084',hp:330,
    damage:0,tools:[]}]}
 },actionFrontier:{items:[
  {kind:'use-ability',token:'blast',actorPrinting:'Dusknoir SFA020',
   publicMetadata:{abilityName:'Cursed Blast',sourceZone:'bench',
    sourceIndex:0}},
  {kind:'attack',token:'duo',actorPrinting:'Mewtwo & Mew-GX UNM071',
   attackName:'Miraculous Duo-GX',publicMetadata:{
    attackCostPayable:true,damageAfterResistance:200,
    attackSource:{sourceKind:'active-pokemon',sourceSlot:'ACTIVE',
     sourceIndex:0,sourceCardFullName:'Mewtwo & Mew-GX UNM071',
     attackName:'Miraculous Duo-GX'}}}]}
});
function benchPrompt(req,card,effect){
 const x=clone(req);x.observation.decisionKind='owner-prompt';
 x.actionFrontier=null;x.prompt={
  actingSeat:0,promptType:'ChoosePokemonPrompt',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:card,effectName:effect},
  publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
  choices:[{kind:'pokemon',token:'target-0',
   printing:'Mega Lopunny ex ME2084',
   publicMetadata:{ownerSeat:'opponent',isOwnerVisible:true,
    targetZone:'bench',benchIndex:0}}]
 };return x;
}
const p=createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,config:{}});
const req=base();
let r=p.decideWithAudit(req);
check(r.decision.token,'blast');check(r.policyAudit.policyVersion,POLICY_VERSION);
check(r.policyAudit.selectedTokens[0],'blast');
r=p.decideWithAudit(benchPrompt(req,'Dusknoir SFA020','Cursed Blast'));
check(r.decision.tokens[0],'target-0');
const post=clone(req);
post.observation.opponentPublic.prizeCount=2;
post.observation.opponentPublic.bench[0].damage=130;
post.actionFrontier.items=[{kind:'play-card',token:'catch',
 actorPrinting:'Counter Catcher PAR160',
 publicMetadata:{cardType:'trainer',handIndex:0}}];
r=p.decideWithAudit(post);check(r.decision.token,'catch');
r=p.decideWithAudit(benchPrompt(post,'Counter Catcher PAR160','Counter Catcher'));
check(r.decision.tokens[0],'target-0');
const finish=clone(post);
finish.observation.opponentPublic.active=clone(post.observation.opponentPublic.bench[0]);
finish.observation.opponentPublic.bench=[post.observation.opponentPublic.active];
finish.actionFrontier.items=[req.actionFrontier.items[1]];
r=p.decideWithAudit(finish);check(r.decision.token,'duo');
check(r.policyAudit.selectionRuleCode,
 'A22_MIRACULOUS_GX_AFTER_GUST_FOR_FINAL_THREE_PRIZES');
// Fail-closed invalid action sequence rather than delegate unrecognized
// prompt (e.g. source attribution unexpectedly changes mid-chain).
const broken=createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,config:{}});
broken.decideWithAudit(req);
const wrong=benchPrompt(req,'Some Other Card','Cursed Blast');
r=broken.decideWithAudit(wrong);
check(r.decision.kind,'abstain');
check(r.decision.reasonCode,'UNTRUSTED_PROMPT');
// A direct paid legal game-winner is not sacrificed to the alternate gust.
// This is checked against the actual source-bound active attack frontier.
const direct=base();
direct.observation.opponentPublic.active={
 printing:'Mega Lopunny ex ME2084',hp:330,damage:130,tools:[]};
direct.observation.opponentPublic.bench=[{printing:'Pikachu',hp:60,damage:0,tools:[]}];
check(supportedDirectTerminal(direct.observation,direct.actionFrontier.items),true);
const prio=createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,config:{}});
r=prio.decideWithAudit(direct);
check(r.decision.token,'duo');
check(r.policyAudit.selectionRuleCode,'A22_DIRECT_NO_SELFKO_TERMINAL_PRIORITY');
check(DECK_PATH,'results/als/new-moon-dusknoir-shadow-bind-v3-60.json');
assert.equal(assertions,14);
console.log('Agent22 v3 Counter Catcher worker overlay: '+assertions+' checked decisions passed');
