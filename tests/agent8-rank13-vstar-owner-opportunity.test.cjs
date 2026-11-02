'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {observeRank13VstarOpportunity}=
  require('../simulation/twinleaf/agent8-rank13-vstar-owner-opportunity.cjs');

const stages={RESTORED:1,BASIC:2,STAGE_1:3,STAGE_2:4,VMAX:5,VSTAR:6};
function view(){
  return {
    decisionKind:'owner-root',globalTurn:5,
    ownHand:['Regidrago VSTAR SIT','Fire Energy MEE'],
    ownPublic:{
      active:{name:'Budew',printing:'Budew ASC'},
      bench:[{
        name:'Regidrago V',printing:'Regidrago V SIT',
        printed:{stage:stages.BASIC},lastPlayedOrEvolvedTurn:3,
        publicRestrictions:{cannotEvolveNextTurn:false}
      },null,null,null,null]
    },
    ownTurnResources:{
      pokemonPlayLocked:false,evolutionPlayLocked:false,
      abilityPokemonPlayLocked:false
    }
  };
}
test('actual owner-visible VSTAR and in-play V produce ordinary evolution intent',()=>{
  const actual=observeRank13VstarOpportunity(view(),stages);
  assert.deepEqual(actual,{
    turn:5,heldVstarCount:1,inPlayRegidragoVCount:1,
    ordinaryVstarRootLegal:true,
    eligibleSlot:{position:'bench',index:0,printing:'Regidrago VSTAR SIT'}
  });
});
test('new Basic, unknown chronology, first turn and active locks exclude evolution',()=>{
  const v=view();
  v.ownPublic.bench[0].lastPlayedOrEvolvedTurn=5;
  assert.equal(observeRank13VstarOpportunity(v,stages).ordinaryVstarRootLegal,false);
  delete v.ownPublic.bench[0].lastPlayedOrEvolvedTurn;
  assert.equal(observeRank13VstarOpportunity(v,stages).ordinaryVstarRootLegal,false);
  v.ownPublic.bench[0].lastPlayedOrEvolvedTurn=3;
  v.globalTurn=2;
  assert.equal(observeRank13VstarOpportunity(v,stages).ordinaryVstarRootLegal,false);
  v.globalTurn=5;
  v.ownTurnResources.abilityPokemonPlayLocked=true;
  assert.equal(observeRank13VstarOpportunity(v,stages).ordinaryVstarRootLegal,false);
  v.ownTurnResources.abilityPokemonPlayLocked=false;
  v.ownTurnResources.evolutionPlayLocked=true;
  assert.equal(observeRank13VstarOpportunity(v,stages).ordinaryVstarRootLegal,false);
});
test('absence from hand or field prevents intent; opponent-hidden perturbations inert',()=>{
  const v=view();
  v.opponentHiddenHand=['Regidrago VSTAR SIT'];
  v.opponentPrizes=['Regidrago VSTAR SIT'];
  assert.equal(observeRank13VstarOpportunity(v,stages).ordinaryVstarRootLegal,true);
  v.ownHand=['Fire Energy MEE'];
  const absentHand=observeRank13VstarOpportunity(v,stages);
  assert.equal(absentHand.ordinaryVstarRootLegal,false);
  assert.equal(absentHand.inPlayRegidragoVCount,1);
  v.ownHand=['Regidrago VSTAR SIT'];
  v.ownPublic.bench[0]=null;
  const absentField=observeRank13VstarOpportunity(v,stages);
  assert.equal(absentField.ordinaryVstarRootLegal,false);
  assert.equal(absentField.heldVstarCount,1);
});
