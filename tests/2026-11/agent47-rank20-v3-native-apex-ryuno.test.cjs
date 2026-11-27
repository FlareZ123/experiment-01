'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../../simulation/twinleaf/agent47-apex-ultraball-original-store.cjs');
const {assertSource60Conserved}=
  require('../../simulation/twinleaf/agent47-apex-ultraball-followthrough-original-store.cjs');
const policy=require('../../simulation/evaluation/2026-11/agent47-rank20-ryuno-terminal-slice.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {projectPrompt,dispatchPromptChoice}=
  require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const {installPromptProvenanceHook}=
  require('../../simulation/evaluation/2026-11/agent36-prompt-provenance.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(root,p));
const {AttackAction}=load('game/store/actions/game-actions');
const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
const getPending=(state,type)=>state.prompts.filter(p=>
  p.result===undefined&&p.constructor.name===type);
function physical(x){
 const p=x.owner;
 return [...p.active.cards,...p.bench.flatMap(s=>s.cards),
   ...p.hand.cards,...p.deck.cards,...p.discard.cards,
   ...p.prizes.flatMap(s=>s.cards),...p.lostzone.cards,
   ...p.stadium.cards,...p.supporter.cards];
}
function equipSourceDragonite(x){
 const p=x.owner;
 const found=p.deck.cards.find(c=>c.fullName==='Mega Dragonite ex M2a');
 if(found){
  p.deck.cards.splice(p.deck.cards.indexOf(found),1);
  p.discard.cards.push(found);return found;
 }
 for(const slot of p.prizes){
  const c=slot.cards.find(c=>c.fullName==='Mega Dragonite ex M2a');
  if(c){slot.cards.splice(slot.cards.indexOf(c),1);p.discard.cards.push(c);return c;}
 }
 throw new Error('SOURCE_RANK20_DRAGONITE_NOT_IN_DECK_OR_PRIZES');
}
function actorBoard(x,seat){
 const p=x.owner,t=x.state.players[1-seat],foe=t.active.getPokemonCard();
 const attacker=p.active.getPokemonCard();
 assert.ok(attacker&&foe);
 const print=c=>c?.fullName??'';
 const stadium=c=>c.cards.map(print);
 const ownRestrictions={
  stadiumAndToolHaveNoEffectTurnsRemaining:p.stadiumAndToolHaveNoEffectTurnsRemaining??0,
  attackLockTurnsRemaining:0,attackMaxEnergyTurnsRemaining:0
 };
 const oppRestrictions={
  stadiumAndToolHaveNoEffectTurnsRemaining:t.stadiumAndToolHaveNoEffectTurnsRemaining??0
 };
 return {
   actorSeat:seat,
   ownPublic:{prizeCount:p.prizes.filter(s=>s.cards.length).length,
     discard:p.discard.cards.map(print),
     stadium:stadium(p.stadium),
     publicTurnRestrictions:ownRestrictions,
     active:{printing:print(attacker),energies:p.active.energies.cards.map(print),
       tools:[],specialConditions:[],
       publicRestrictions:{cannotUseAttacksNextTurn:[],cannotAttackNextTurn:false}}},
   opponentPublic:{stadium:stadium(t.stadium),
     publicTurnRestrictions:oppRestrictions,
     bench:t.bench.map(s=>s.cards.length?{printing:print(s.getPokemonCard())}:null),
     active:{printing:print(foe),hp:foe.hp,damage:t.active.damage,
       tools:[],specialConditions:[],printed:{
         types:[foe.cardType??'Psychic'],subtypes:foe.stage==='BASIC'?['Basic']:['V'],
         weakness:[],resistance:[]},
       publicRestrictions:{cannotUseAttacksNextTurn:[]}}}
 };
}
function single(seat){
 const x=stage(seat);
 const mega=equipSourceDragonite(x);
 assertSource60Conserved(x.owner);
 assert.equal(physical(x).length,60);
 const observe=()=>actorBoard(x,seat);
 const request=prompt=>({
   role:'opponent',seat,observation:observe(),
   actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
     {token:'native-apex',kind:'attack',label:'Attack Apex Dragon',
      actorPrinting:'Regidrago VSTAR SIT',attackName:'Apex Dragon',
      publicMetadata:{attackCostPayable:true,attackSource:{
        sourceKind:'active-pokemon',sourceSlot:'ACTIVE',sourceIndex:0,
        sourceCardName:'Regidrago VSTAR',sourceCardFullName:'Regidrago VSTAR SIT',
        attackName:'Apex Dragon'}}},
     {token:'native-pass',kind:'pass',label:'Pass'}]},
   prompt
 });
 const native={PlayerType,SlotType,ResolvePromptAction};
 const rootRequest=request(null);
 const rootFrontier=protocol.validateFrontier(rootRequest.actionFrontier);
 const rootChoice=policy.decideRank20RyunoSlice(rootRequest);
 assert.deepEqual(rootChoice,{kind:'select-action',token:'native-apex'});
 protocol.validateDecision(rootChoice,null,rootFrontier);
 const hook=installPromptProvenanceHook(x.store);
 let reports=[];
 try{
  // Genuine native AttackAction and engine prompts. The root action token
  // above is protocol-valid but NOT an ActionEnumerator-issued token.
  x.store.dispatch(new AttackAction(x.owner.id,'Apex Dragon'));
  const choices=getPending(x.state,'ChooseAttackPrompt');
  assert.equal(choices.length,1,'Paid Apex must produce exactly one native attack-copy prompt');
  const copied=projectPrompt({prompt:choices[0],state:x.state,actorSeat:seat,native,store:x.store,provenanceHook:hook});
  const donorDecision=policy.decideRank20RyunoSlice(request(copied.promptProjection));
  assert.ok(donorDecision,'Source-bound opponent policy declined native Apex copy prompt: '+JSON.stringify(copied.promptProjection));
  assert.equal(copied.promptProjection.choices.find(c=>c.token===donorDecision.token)?.printing,mega.fullName);
  reports.push({type:'ChooseAttackPrompt',source:copied.promptProjection.source,
    selected:donorDecision,choiceCount:copied.promptProjection.choices.length});
  dispatchPromptChoice({store:x.store,prompt:choices[0],state:x.state,
    actorSeat:seat,projection:copied,decision:donorDecision,native});
  const energy=getPending(x.state,'ChooseEnergyPrompt');
  assert.equal(energy.length,1,'Ryuno must produce one genuine native energy-payment prompt');
  const projected=projectPrompt({prompt:energy[0],state:x.state,actorSeat:seat,native,store:x.store,provenanceHook:hook});
  const paid=policy.decideRank20RyunoSlice(request(projected.promptProjection));
  assert.ok(paid,'Source-bound policy declined native Ryuno payment prompt: '+JSON.stringify(projected.promptProjection));
  assert.equal(paid.kind,'select-choices');
  assert.equal(paid.tokens.length,1);
  assert.match(projected.promptProjection.choices.find(c=>c.token===paid.tokens[0])?.printing??'',/^Double Dragon Energy ROS$/);
  reports.push({type:'ChooseEnergyPrompt',source:projected.promptProjection.source,
    selected:paid,choiceCount:projected.promptProjection.choices.length});
  dispatchPromptChoice({store:x.store,prompt:energy[0],state:x.state,
    actorSeat:seat,projection:projected,decision:paid,native});
  assert.equal(x.owner.active.energies.cards.length,1);
  assert.equal(x.owner.active.energies.cards[0].fullName,'Double Dragon Energy ROS');
  assert.ok(x.owner.discard.cards.some(c=>c.fullName==='Double Dragon Energy ROS'));
  assert.ok(x.state.players[1-seat].active.damage>=210,
    'Copied 330-damage Ryuno must KO target 210HP Shadow Rider Calyrex V');
  assertSource60Conserved(x.owner);
  assert.equal(physical(x).length,60);
  assert.equal(new Set(physical(x).map(c=>c.id)).size,60);
  return {seat,sourceRank:20,originalSource60:true,
    selectedRoot:rootChoice,prompts:reports,
    nativeDamage:x.state.players[1-seat].active.damage,
    physicalSourceCardsAfter:60,pendingEnergyPrompts:getPending(x.state,'ChooseEnergyPrompt').length,
    competitivelyQualified:false};
 } finally {hook.restore();}
}
for(const seat of [0,1]){
 test('pinned native rank20 V3 Apex→Ryuno owner prompt execution seat '+seat,()=>{
  const result=single(seat);
  assert.equal(result.prompts.length,2);
  assert.equal(result.physicalSourceCardsAfter,60);
  console.log(JSON.stringify(result));
 });
}
