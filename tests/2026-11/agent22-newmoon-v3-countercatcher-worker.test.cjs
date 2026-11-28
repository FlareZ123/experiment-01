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
 'A22_MIRACULOUS_GX_NATIVE_ANNOTATED_TERMINAL');
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
check(r.policyAudit.selectionRuleCode,'A22_NATIVE_ANNOTATED_DIRECT_TERMINAL');
check(DECK_PATH,'results/als/new-moon-dusknoir-shadow-bind-v3-60.json');
// Actual native action-frontier has no damageAfterResistance, so source-
// printed Mewtwo 200 damage must be assessed from unmodified actor-visible
// card/target printings. Never accept absent print data or unseen Stadium.
const natural=base();
natural.observation.ownPublic.active.attacks=[{name:'Miraculous Duo-GX',damage:200}];
natural.observation.ownPublic.active.tools=[];
natural.observation.ownPublic.stadium=[];
natural.observation.opponentPublic.stadium=[];
natural.observation.opponentPublic.active={printing:'Mega Absol ex ME1086',
 hp:280,damage:100,tools:[],printed:{resistance:[]}};
natural.observation.opponentPublic.bench=[{printing:'Pikachu'}];
delete natural.actionFrontier.items[1].publicMetadata.damageAfterResistance;
check(supportedDirectTerminal(natural.observation,natural.actionFrontier.items),true);
const sourceOnly=createPolicy({role:'candidate',seat:0,
 policyVersion:POLICY_VERSION,config:{}});
r=sourceOnly.decideWithAudit(natural);
check(r.decision.token,'duo');
check(r.policyAudit.selectionRuleCode,
 'A22_PRINTED_DIRECT_BASE_DAMAGE_TERMINAL_PROJECTION');
const unknown=clone(natural);unknown.observation.opponentPublic.stadium=['Temple of Sinnoh ASR'];
check(supportedDirectTerminal(unknown.observation,unknown.actionFrontier.items),false);
const resistance=clone(natural);
resistance.observation.opponentPublic.active.printed.resistance=[{type:'Psychic',value:-20}];
check(supportedDirectTerminal(resistance.observation,resistance.actionFrontier.items),false);
// Already-behind Prize clock (3>2) makes Counter Catcher legal *now*.
// Gust a previously damaged Mega, take the final 3 Prizes WITHOUT Dusk KO.
const behind=base();
behind.observation.opponentPublic.prizeCount=2;
behind.observation.opponentPublic.bench=[{
 printing:'Mega Absol ex ME1',hp:280,damage:80,tools:[],
 printed:{resistance:[]}}];
behind.observation.ownPublic.active.tools=[];
behind.observation.ownPublic.active.attacks=[{
 name:'Miraculous Duo-GX',damage:200}];
behind.observation.ownPublic.stadium=[];
behind.observation.opponentPublic.stadium=[];
behind.actionFrontier.items.unshift({kind:'play-card',token:'catchDirect',
 actorPrinting:'Counter Catcher PAR',
 publicMetadata:{cardType:'trainer',handIndex:0}});
const directGust=createPolicy({role:'candidate',seat:0,
 policyVersion:POLICY_VERSION,config:{}});
r=directGust.decideWithAudit(behind);
check(r.decision.token,'catchDirect');
check(r.policyAudit.selectionRuleCode,
 'A22_DIRECT_CC_GUST_NO_DUSK_SELF_KO_TERMINAL');
const directPrompt=benchPrompt(behind,'Counter Catcher PAR','Counter Catcher');
directPrompt.prompt.choices[0].printing='Mega Absol ex ME1';
r=directGust.decideWithAudit(directPrompt);
check(r.decision.tokens[0],'target-0');
const newActive=clone(behind);
newActive.observation.opponentPublic.active=clone(behind.observation.opponentPublic.bench[0]);
newActive.observation.opponentPublic.bench=[behind.observation.opponentPublic.active];
newActive.actionFrontier.items=[clone(behind.actionFrontier.items[2])];
r=directGust.decideWithAudit(newActive);
check(r.decision.token,'duo');
check(r.policyAudit.selectionRuleCode,
 'A22_DIRECT_CC_PRINTED_GX_CONDITIONAL_TERMINAL');
// Once the Item is played, a malformed reply cannot be handed to the
// parent v3 policy or silently interpreted as a new self-KO route.
const aborted=createPolicy({role:'candidate',seat:0,
 policyVersion:POLICY_VERSION,config:{}});
aborted.decideWithAudit(behind);
const badReply=clone(directPrompt);badReply.prompt.source.effectName='Unknown';
r=aborted.decideWithAudit(badReply);
check(r.decision.kind,'abstain');
check(r.policyAudit.selectionRuleCode,'A22_DIRECT_GUST_SEQUENCE_ABORTED');
assert.equal(assertions,26);
console.log('Agent22 v3 Counter Catcher worker overlay: '+assertions+' checked decisions passed');
