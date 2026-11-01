'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choosePathToPeakOpposingAbility}=
  require('../simulation/twinleaf/agent33-path-to-peak-public-lock.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const catalog={basics:new Set(),abilityBasics:new Set(),
  ruleboxAbilityPrintings:new Set(['Genesect V FST',
    'Shadow Rider Calyrex VMAX CRE','Regidrago VSTAR SIT',
    'Dedenne-GX UNB','Crobat V DAA',
    'Tapu Lele-GX GRI','Eldegoss V RCL']),
  ruleboxPokemonPrintings:new Set(['Genesect V FST',
    'Shadow Rider Calyrex VMAX CRE','Regidrago VSTAR SIT',
    'Dedenne-GX UNB','Crobat V DAA',
    'Tapu Lele-GX GRI','Eldegoss V RCL',
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

test('native Rule Box catalog uses engine hasRuleBox rather than false heuristic tag',()=>{
  // A printed historical tag is not sufficient: the pinned Card.hasRuleBox
  // decides current Rule Box status, and GX/VMAX names are not identifiers.
  const {buildActorCardCatalog}=require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  class PokemonCard {
    constructor(name,ruleBox,withAbility){
      this.fullName=name;this.name=name;
      this.stage='BASIC';this.tags=['Lv.X'];this.powers=withAbility?
        [{powerType:'ABILITY',name:'Printed Ability'}]:[];
      this.ruleBox=ruleBox;this.attacks=[];this.cardType=[];
    }
    hasRuleBox(){return this.ruleBox;}
  }
  class EnergyCard {}
  const all=[
    new PokemonCard('Historical Leveller UNL',false,true),
    new PokemonCard('Exact Rule Box ex CRE',true,true),
    new PokemonCard('Rule Box Attacker CRE',true,false)
  ];
  const c=buildActorCardCatalog(all,{
    PokemonCard,EnergyCard,Stage:{BASIC:'BASIC',STAGE_1:'1',
      STAGE_2:'2',VMAX:'VMAX',VSTAR:'VSTAR'},
    EnergyType:{BASIC:'BASIC',SPECIAL:'SPECIAL'},
    CardType:{DRAGON:'DRAGON'},PowerType:{ABILITY:'ABILITY'},
    SpecialCondition:{ASLEEP:-1,PARALYZED:-2}
  });
  assert.equal(c.ruleboxPokemonPrintings.has('Historical Leveller UNL'),false);
  assert.equal(c.ruleboxAbilityPrintings.has('Historical Leveller UNL'),false);
  assert.equal(c.ruleboxAbilityPrintings.has('Exact Rule Box ex CRE'),true);
  assert.equal(c.ruleboxPokemonPrintings.has('Rule Box Attacker CRE'),true);
  assert.equal(c.ruleboxAbilityPrintings.has('Rule Box Attacker CRE'),false);
});

test('board-arrival Dedenne and Crobat do not prevent an active opposing Genesect lock',()=>{
 const x=view();
 x.ownPublic.bench[0]={printing:'Dedenne-GX UNB'};
 x.ownPublic.bench[1]={printing:'Crobat V DAA'};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog)?.kind,
   'play-path-to-peak');
});
test('a held Dedenne, Crobat or Tapu Lele keeps its future one-shot access protected',()=>{
 for(const printing of ['Dedenne-GX UNB','Crobat V DAA','Tapu Lele-GX GRI']){
   const x=view();
   x.ownHand.push(printing);
   assert.equal(choosePathToPeakOpposingAbility(x,catalog),null,printing);
 }
});
test('spent board-entry-only powers are not fictitious opposing lock targets',()=>{
 const x=view();
 x.opponentPublic.active={printing:'Dedenne-GX UNB'};
 x.opponentPublic.bench[0]={printing:'Tapu Lele-GX GRI'};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('spent Legacy Star on own Regidrago VSTAR removes its immediate self-lock veto',()=>{
 const x=view();
 x.ownPublic.bench[0]={printing:'Regidrago VSTAR SIT'};
 x.ownPublic.publicTurnRestrictions={vstarUsed:true};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog)?.kind,
   'play-path-to-peak');
});
test('unspent Legacy Star still protects own Regidrago VSTAR',()=>{
 const x=view();
 x.ownPublic.bench[0]={printing:'Regidrago VSTAR SIT'};
 x.ownPublic.publicTurnRestrictions={vstarUsed:false};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('opponent with only spent Legacy Star has no immediately actionable Ability target',()=>{
 const x=view();
 x.opponentPublic.active={printing:'Regidrago VSTAR SIT'};
 x.opponentPublic.publicTurnRestrictions={vstarUsed:true};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('held spent Legacy Star is inert, while an unspent copy is protected',()=>{
 const x=view();
 x.ownHand.push('Regidrago VSTAR SIT');
 x.ownPublic.publicTurnRestrictions={vstarUsed:true};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog)?.kind,
   'play-path-to-peak');
 x.ownPublic.publicTurnRestrictions.vstarUsed=false;
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('unknown or reusable Genesect is still a self-lock veto',()=>{
 const x=view();
 x.ownPublic.bench[0]={printing:'Genesect V FST'};
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
test('spent printed power is independent of a held pending Dedenne trigger',()=>{
 const x=view();
 x.ownPublic.bench[0]={printing:'Crobat V DAA'};
 x.ownHand.push('Dedenne-GX UNB');
 assert.equal(choosePathToPeakOpposingAbility(x,catalog),null);
});
