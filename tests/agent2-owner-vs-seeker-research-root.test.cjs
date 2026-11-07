'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerSeekerResearchRoot}=require(
  '../simulation/twinleaf/agent2-owner-vs-seeker-research-root.cjs');
const {chooseActorRootIntent}=require(
  '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {selectOwnerVsSeekerSupporterPrompt}=require(
  '../simulation/twinleaf/agent48-owner-vs-seeker-supporter.cjs');

const SEEKER='VS Seeker PHF';
const RESEARCH="Professor's Research JTG";

/** @returns {object} Detached public-only fixture. */
function view(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:11,
    ownHand:[SEEKER],
    ownPublic:{
      active:{printing:'Regidrago VSTAR SIT',name:'Regidrago VSTAR',
        energies:[],attacks:[],specialConditions:[],
        printed:{stage:5,types:[],retreatCost:[]},publicRestrictions:{}},
      bench:[null,null,null,null,null],discard:[RESEARCH],
      deckCount:22,prizeCount:6,stadium:[],resolvingSupporter:[],
      publicTurnRestrictions:{
        supporterPlayLocked:false,itemPlayLocked:false,
        attackLockTurnsRemaining:0
      }
    },
    opponentPublic:{active:{printing:'Bunnelby PRC'},stadium:[],bench:[]},
    ownTurnResources:{
      supporterPlayedTurn:0,supporterPlayLocked:false,itemPlayLocked:false,
      energyPlayedTurn:11,energyPlayLocked:false,
      specialEnergyPlayLocked:false,stadiumPlayedTurn:0
    }
  };
}
test('owner-only exact single-card Seeker recovers visible Research target',()=>{
  assert.deepEqual(chooseOwnerSeekerResearchRoot(view()),{
    kind:'play-seeker-get-research',handIndex:0,
    printing:SEEKER,target:RESEARCH
  });
});
test('new root is default-off in canonical chooser',()=>{
  const v=view();
  const catalog={basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set(),stages:{},specialConditions:{},
    basicEnergyTypes:{},colorlessEnergyType:9};
  const baseline=chooseActorRootIntent(v,catalog,{});
  assert.equal(baseline.kind,'pass');
  assert.deepEqual(chooseActorRootIntent(v,catalog,{seekerResearchRoot:true}),
    {kind:'play-seeker-get-research',handIndex:0,
      printing:SEEKER,target:RESEARCH});
});
test('recovered Research is supported as next actor-owned root',()=>{
  const v=view();v.ownHand=[RESEARCH];v.ownPublic.discard=[SEEKER];
  assert.deepEqual(chooseOwnerSeekerResearchRoot(v),{
    kind:'play-seeker-recovered-research',handIndex:0,
    printing:RESEARCH,target:RESEARCH
  });
});
test('cannot discard additional protected hand cards for draw shortcut',()=>{
  const v=view();v.ownHand=[SEEKER,'Forest Seal Stone SIT'];
  assert.equal(chooseOwnerSeekerResearchRoot(v),null);
});
test('no matching discard Supporter or held Seeker declines',()=>{
  const v=view();v.ownPublic.discard=['Guzma BUS'];
  assert.equal(chooseOwnerSeekerResearchRoot(v),null);
  v.ownHand=['Quick Ball FST'];v.ownPublic.discard=[RESEARCH];
  assert.equal(chooseOwnerSeekerResearchRoot(v),null);
});
test('Item lock, Supporter lock, already-used Supporter all decline',()=>{
  const v=view();v.ownTurnResources.itemPlayLocked=true;
  assert.equal(chooseOwnerSeekerResearchRoot(v),null);
  v.ownTurnResources.itemPlayLocked=false;
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseOwnerSeekerResearchRoot(v),null);
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseOwnerSeekerResearchRoot(v),null);
});
test('insufficient real deck, opening turn, absent Active all decline',()=>{
  const v=view();v.ownPublic.deckCount=6;
  assert.equal(chooseOwnerSeekerResearchRoot(v),null);
  v.ownPublic.deckCount=22;v.globalTurn=1;
  assert.equal(chooseOwnerSeekerResearchRoot(v),null);
  v.globalTurn=11;v.ownPublic.active=null;
  assert.equal(chooseOwnerSeekerResearchRoot(v),null);
});
test('native exact physical owner discard target is prompt validated',()=>{
  const supporter={fullName:RESEARCH};
  const owner={id:'owner0',discard:{cards:[supporter]}};
  const foe={id:'foe1',discard:{cards:[]}};
  const state={players:[owner,foe]};
  class ChooseCardsPrompt{
    constructor(){
      this.id=71;this.playerId=owner.id;
      this.cards=owner.discard;
    }
    validate(cards){return Array.isArray(cards)&&cards.length===1&&
      cards[0]===supporter;}
  }
  class ResolvePromptAction{
    constructor(id,cards){this.id=id;this.cards=cards;}
  }
  const prompt=new ChooseCardsPrompt();
  const result=selectOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,RESEARCH);
  assert.strictEqual(result.card,supporter);
  assert.strictEqual(result.action.cards[0],supporter);
  assert.equal(result.targetPrinting,RESEARCH);
  prompt.cards=foe.discard;
  assert.throws(()=>selectOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,RESEARCH),/Owner VS Seeker/);
});
