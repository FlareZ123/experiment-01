'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseFirstCrispinSeekerRecovery,VERSION}=
  require('../../simulation/twinleaf/agent49/first-turn-crispin-seeker-recovery.cjs');
const {chooseActorRootIntent}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {selectOwnerVsSeekerSupporterPrompt}=
  require('../../simulation/twinleaf/agent48-owner-vs-seeker-supporter.cjs');

const CRISPIN='Crispin SCR',SEEKER='VS Seeker PHF';
const GRASS='Grass Energy MEE';
const catalog={
  basicEnergies:new Set([GRASS]),basics:new Set(),
  abilityBasics:new Set(),dragonPokemonPrintings:new Set(),
  basicEnergyTypes:{Grass:1,Lightning:4,Psychic:5},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
/** @param {object} [options] */
function view(options={}){
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn:options.turn??1,
    ownHand:options.hand??[SEEKER,'Battle Compressor PHF',GRASS],
    ownPublic:{
      active:{name:'Dedenne-GX',printing:'Dedenne GX UNB',
        energies:[],attacks:[]},
      bench:[{name:'Regidrago V',printing:'Regidrago V SIT',
        energies:[],attacks:[]},null,null,null,null],
      discard:options.discard??[CRISPIN,'Mysterious Treasure FLI'],
      deckCount:43,publicTurnRestrictions:{
        itemPlayLocked:options.locked??false,
        energyPlayLocked:false
      }
    },
    ownTurnResources:{
      itemPlayLocked:options.locked??false,
      energyPlayLocked:false,energyPlayedTurn:0,
      supporterPlayedTurn:0
    },
    opponentPublic:{bench:[null,null,null,null,null]}
  };
}
test('first-turn recovery matches exact paid Crispin and held VS Seeker',()=>{
  const root=chooseFirstCrispinSeekerRecovery(view());
  assert.equal(root.source,VERSION);
  assert.equal(root.kind,'play-seeker-get-crispin');
  assert.equal(root.target,CRISPIN);
  assert.equal(root.printing,SEEKER);
  assert.equal(root.handIndex,0);
  assert.equal(root.retrievedSupporterNotPlayableOnFirstTurn,true);
});
test('canonical narrow recovery wins the following optional Basic attachment',()=>{
  const root=chooseActorRootIntent(view(),catalog,{
    firstCrispinSeekerRecovery:true
  });
  assert.equal(root.kind,'play-seeker-get-crispin');
  const baseline=chooseActorRootIntent(view(),catalog,{});
  assert.equal(baseline.kind,'attach-basic-energy');
});
test('unavailable paid source, no VS Seeker, lock or later turn declines',()=>{
  const opts=[
    {turn:2},
    {locked:true},
    {discard:[CRISPIN]},
    {discard:['Mysterious Treasure FLI']},
    {hand:[CRISPIN,SEEKER]},
    {hand:['Battle Compressor PHF']}
  ];
  for(const o of opts)
    assert.equal(chooseFirstCrispinSeekerRecovery(view(o)),null);
});
test('exact native owner discard prompt returns the same Crispin object',()=>{
  const card={fullName:CRISPIN,id:41};
  const owner={id:17,discard:{cards:[card]}};
  const state={players:[owner,{id:18}]};
  const prompt={
    id:91,playerId:17,cards:owner.discard,result:undefined,
    constructor:{name:'ChooseCardsPrompt'},
    validate(cards){return cards.length===1&&cards[0]===card;}
  };
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  const response=selectOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,CRISPIN);
  assert.equal(response.targetPrinting,CRISPIN);
  assert.strictEqual(response.card,card);
  assert.deepEqual(response.action.result,[card]);
});
