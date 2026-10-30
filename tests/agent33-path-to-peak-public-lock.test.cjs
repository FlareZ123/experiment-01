'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choosePathToPeakOpposingAbility}=
  require('../simulation/twinleaf/agent33-path-to-peak-public-lock.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const catalog={basics:new Set(),abilityBasics:new Set(),
  ruleboxAbilityPrintings:new Set(['Genesect V FST',
    'Shadow Rider Calyrex VMAX CRE','Regidrago VSTAR SIT']),
  ruleboxPokemonPrintings:new Set(['Genesect V FST',
    'Shadow Rider Calyrex VMAX CRE','Regidrago VSTAR SIT',
    'Palkia V ASR']),
  basicEnergies:new Set(),specialConditions:{ASLEEP:-1,PARALYZED:-2}};
function view(){
 return {decisionKind:'owner-root',globalTurn:6,
  ownHand:['Path to the Peak CRE','Trainer Item'],ownPublic:{
    active:{name:'Trubbish',printing:'Trubbish FST',
      energies:[],attacks:[]},bench:[null,null,null,null,null],stadium:[]},
  opponentPublic:{active:{printing:'Genesect V FST',
    name:'Genesect V'},bench:[null,null,null,null,null],stadium:[]},
  ownTurnResources:{stadiumPlayedTurn:0,stadiumPlayLocked:false,
    pokemonPlayLocked:false,energyPlayLocked:true}};
}
test('opponent public Genesect Ability and no owner Rule Box makes Path candidate',()=>{
 assert.deepEqual(choosePathToPeakOpposingAbility(view(),catalog),{
  kind:'play-path-to-peak',handIndex:0,
  printing:'Path to the Peak CRE',
  reason:'public-opposing-rulebox-ability-and-no-owner-self-lock'});
});
test('any owner rule-box Ability Pokémon vetoes self-lock',()=>{
 const x=view();x.ownPublic.bench[0]={printing:'Regidrago VSTAR SIT'};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('held future owner rule-box Ability Pokémon vetoes premature Path',()=>{
 const x=view();x.ownHand.push('Shadow Rider Calyrex VMAX CRE');
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('no visible opponent rule-box Ability avoids speculative Stadium',()=>{
 const x=view();x.opponentPublic.active={printing:'Iron Thorns ex TWM'};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('prior Stadium is not replaced without counterfactual',()=>{
 const x=view();x.opponentPublic.stadium=['Sky Field ROS'];
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('once-per-turn and Stadium lock are respected',()=>{
 const x=view();x.ownTurnResources.stadiumPlayedTurn=6;
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
 x.ownTurnResources.stadiumPlayedTurn=0;
 x.ownTurnResources.stadiumPlayLocked=true;
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('unknown Rule Box catalog fails closed',()=>{
 const c={...catalog,ruleboxAbilityPrintings:null};
 assert.equal(choosePathToPeakOpposingAbility(view(),c),null);
});
test('no held Path means no placement',()=>{
 const x=view();x.ownHand=['Ultra Ball SUM'];
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('default owner behavior unaffected without explicit flag',()=>{
 const x=view();
 assert.equal(chooseActorRootIntent(x,catalog).kind,'pass');
 assert.equal(chooseActorRootIntent(x,catalog,{
   pathToPeakOpposingAbility:true}).kind,'play-path-to-peak');
});
test('opponent secret zones cannot change printed target assessment',()=>{
 const x=view(),y=view();y.opponentSecret={
   deck:['Shadow Rider Calyrex VMAX'],hand:['Forest Seal Stone']};
 assert.deepEqual(choosePathToPeakOpposingAbility(x,catalog),
   choosePathToPeakOpposingAbility(y,catalog));
});

test('Forest Seal Stone on own otherwise abilityless V is a self-lock veto',()=>{
 const x=view();x.ownPublic.active={
   printing:'Palkia V ASR',tools:['Forest Seal Stone SIT']};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('opponent Seal Stone VSTAR Power grants public lock opportunity',()=>{
 const x=view();x.opponentPublic.active={
   printing:'Palkia V ASR',tools:['Sky Seal Stone CRZ']};
 x.opponentPublic.publicTurnRestrictions={vstarUsed:false};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog)?.kind,
   'play-path-to-peak');
});
test('spent opponent VSTAR Seal Stone is no longer the only Path target',()=>{
 const x=view();x.opponentPublic.active={
   printing:'Palkia V ASR',tools:['Forest Seal Stone SIT']};
 x.opponentPublic.publicTurnRestrictions={vstarUsed:true};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('spent owner VSTAR Seal Stone no longer blocks Path opportunity',()=>{
 const x=view();x.ownPublic.active={
   printing:'Palkia V ASR',tools:['Forest Seal Stone SIT']};
 x.ownPublic.publicTurnRestrictions={vstarUsed:true};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog)?.kind,
   'play-path-to-peak');
});
