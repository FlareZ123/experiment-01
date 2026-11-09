'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseArvenHoodRoot,resolveArvenHoodSearch}=
  require('../../simulation/twinleaf/agent31/arven-hood-owner-frontier.cjs');

const view=()=>({
  decisionKind:'owner-root',actorSeat:0,globalTurn:5,
  ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
  ownHand:['Arven SVI','Psychic Energy MEE'],
  ownPublic:{
    active:{printing:'Shadow Rider Calyrex V CRE'},
    publicTurnRestrictions:{supporterPlayLocked:false},
    bench:[
      {printing:'Shadow Rider Calyrex VMAX CRE',
        abilities:['Underworld Door'],tools:[]},
      null,null,null,null],
    stadium:[]},
  opponentPublic:{
    active:{printing:'Iron Thorns ex TWM',
      abilities:['Initialization'],tools:[]},
    bench:[null,null,null,null,null],stadium:[]}
});

test('Owner Arven root requires visible Thorns, unprotected VMAX and exact unspent Supporter',()=>{
  const v=view(),catalog={toolPrintings:new Set(['Stealthy Hood UNB'])};
  const x=chooseArvenHoodRoot(v,catalog);
  assert.equal(x.kind,'play-arven-for-hood');
  assert.equal(x.handIndex,0);
  assert.equal(x.benchIndex,0);
  assert.equal(x.requestedTool,'Stealthy Hood UNB');
  assert.equal(x.itemAccessOutcomeUnknown,true);
  const alreadyHeld=view();alreadyHeld.ownHand.push('Stealthy Hood UNB');
  assert.equal(chooseArvenHoodRoot(alreadyHeld,catalog),null);
  const quota=view();quota.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseArvenHoodRoot(quota,catalog),null);
  const blank=view();blank.ownPublic.bench[0].tools=['Forest Seal Stone SIT'];
  assert.equal(chooseArvenHoodRoot(blank,catalog),null);
  const benches=view();benches.opponentPublic.bench[1]={printing:'Garbodor BKP'};
  assert.equal(chooseArvenHoodRoot(benches,catalog),null);
  const blocked=view();blocked.ownTurnResources.supporterPlayLocked=true;
  assert.equal(chooseArvenHoodRoot(blocked,catalog),null);
});

test('Authentic owner-deck search accepts actual physical Hood and one legal Item',()=>{
  class ChooseCardsPrompt {
    constructor(owner,deck) {
      this.id='arven-hood-search';this.playerId=owner;this.result=undefined;
      this.cards=deck;
    }
    validate(cards) {
      return cards.length===2&&
        cards.some(x=>x.fullName==='Stealthy Hood UNB')&&
        cards.some(x=>x.fullName==='Fog Crystal CRE');
    }
  }
  class ResolvePromptAction {
    constructor(id,result){this.id=id;this.result=result;}
  }
  const hood={fullName:'Stealthy Hood UNB',trainerType:'TOOL'};
  const item={fullName:'Fog Crystal CRE',trainerType:'ITEM'};
  const other={fullName:'Psychic Energy MEE'};
  const owner={id:'owner0',deck:{cards:[other,hood,item]}};
  const state={players:[owner,{id:'rival',deck:{cards:[]}}]};
  const pending=new ChooseCardsPrompt(owner.id,owner.deck);
  const outcome=resolveArvenHoodSearch(
    state,0,pending,ResolvePromptAction,'ITEM');
  assert.ok(outcome);
  assert.deepEqual(outcome.chosen,
    ['Stealthy Hood UNB','Fog Crystal CRE']);
  assert.equal(outcome.complete,true);
  assert.equal(outcome.nativePromptId,'arven-hood-search');
  assert.strictEqual(outcome.action.result[0],hood);
  assert.strictEqual(outcome.action.result[1],item);
  assert.equal(outcome.action.id,'arven-hood-search');
});

test('Search never reads an unowned deck or invents absent Hood cards',()=>{
  class ChooseCardsPrompt {
    constructor(owner,deck){
      this.id=5;this.playerId=owner;this.result=undefined;this.cards=deck;
    }
    validate(){return true;}
  }
  const owner={id:1,deck:{cards:[{fullName:'Fog Crystal CRE',trainerType:'ITEM'}]}};
  const state={players:[owner,{id:2,deck:{cards:[{fullName:'Stealthy Hood UNB'}]}}]};
  const p=new ChooseCardsPrompt(owner.id,owner.deck);
  assert.equal(resolveArvenHoodSearch(state,0,p,class {}),null);
  p.cards=state.players[1].deck;
  assert.equal(resolveArvenHoodSearch(state,0,p,class {}),null);
  assert.equal(chooseArvenHoodRoot({...view(),ownHand:['Psychic Energy MEE']},
    {toolPrintings:new Set(['Stealthy Hood UNB'])}),null);
});
