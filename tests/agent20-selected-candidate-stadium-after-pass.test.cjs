'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withCandidateStadiumAfterSelectedPass,
  withRegisteredCandidateStadiumPanel}=require(
  '../simulation/twinleaf/agent20-selected-candidate-stadium-after-pass.cjs');

class TrainerCard{
  constructor(fullName,name,type='stadium'){
    Object.assign(this,{fullName,name,trainerType:type});
  }
}
class PlayCardAction{
  constructor(id,handIndex,target){
    Object.assign(this,{id,handIndex,target});
  }
}
class PassTurnAction{}
class AddPlayerAction{}
class Bot{
  constructor(id){this.client={id};}
  decodeNextAction(){return new PassTurnAction();}
}
class Store{
  constructor(){
    this.state={
      turn:4,activePlayer:0,prompts:[],
      players:[
        {id:1,stadium:{cards:[]},stadiumPlayedTurn:0,
          cannotPlayStadiumCards:false,
          hand:{cards:[new TrainerCard('Path to the Peak CRE',
            'Path to the Peak')]},discard:{cards:[]}},
        {id:2,stadium:{cards:[new TrainerCard(
          'Thunder Mountain Prism Star LOT','Thunder Mountain')]},
          stadiumPlayedTurn:0,cannotPlayStadiumCards:false,
          hand:{cards:[]},discard:{cards:[]}}
      ]
    };
    this.actions=[];
  }
  dispatch(action){
    this.actions.push(action.constructor.name);
    if(action instanceof PlayCardAction){
      const p=this.state.players.find(p=>p.id===action.id);
      const c=p?.hand.cards[action.handIndex];
      if(!c)throw Error('No card in owner hand');
      p.hand.cards.splice(action.handIndex,1);
      p.stadium.cards.push(c);
      p.stadiumPlayedTurn=this.state.turn;
    }
    return 'accepted';
  }
}
const deps={
  bot:{SimpleTacticsAi:Bot},store:{Store},
  play:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}},
  trainer:{TrainerCard},types:{TrainerType:{STADIUM:'stadium'}}
};
const trial=slot=>({id:'6:0:'+slot+':champion-reference',
  rank:6,candidateSlot:slot,candidateId:'champion-reference'});

function runTrial(slot,mutate){
 const store=new Store();
 if(mutate)mutate(store.state);
 const owners=[new Bot(1),new Bot(2)];
 return withCandidateStadiumAfterSelectedPass(()=>{
   store.dispatch(new AddPlayerAction());
   const chosen=owners[store.state.activePlayer]
     .decodeNextAction(store.state);
   store.dispatch(chosen);
   return {chosen,store};
 },trial(slot),deps);
}

test('authentic candidate seat A turn4 Pass is converted to physical Stadium',()=>{
 const out=runTrial('A');
 assert.equal(out.result.chosen.constructor.name,'PlayCardAction');
 assert.equal(out.audit.nativeAccepted,1);
 assert.equal(out.audit.nativeRejected,0);
 assert.equal(out.audit.selectedAlternates[0].printing,'Path to the Peak CRE');
 assert.deepEqual(out.audit.selectedAlternates[0].sourceStadiumBefore,
   ['Thunder Mountain Prism Star LOT']);
 assert.deepEqual(out.audit.selectedAlternates[0].candidateStadiumAfter,
   ['Path to the Peak CRE']);
 assert.equal(out.audit.competitiveQualifiedGames,0);
});
test('physically source-controlled seat never receives Stadium override',()=>{
 const out=runTrial('B');
 assert.equal(out.result.chosen.constructor.name,'PassTurnAction');
 assert.equal(out.audit.nativeAccepted,0);
});
test('wrong turn or expended Stadium quota leaves original Pass unchanged',()=>{
 const changed=runTrial('A',s=>{s.turn=6;});
 assert.equal(changed.audit.proposed,0);
 const spent=runTrial('A',s=>{s.players[0].stadiumPlayedTurn=4;});
 assert.equal(spent.audit.proposed,0);
});
test('Stadium with the same printed name is never offered as replacement',()=>{
 const r=runTrial('A',s=>{s.players[1].stadium.cards[0].name=
   'Path to the Peak';});
 assert.equal(r.audit.proposed,0);
});
test('public Stadium lock prevents altered native candidate action',()=>{
 const r=runTrial('A',s=>{
   s.players[0].cannotPlayStadiumCards=true;
 });
 assert.equal(r.audit.proposed,0);
});
test('prompt or wrong acting physical seat never changes native Pass',()=>{
 const pending=runTrial('A',s=>{s.prompts=[{result:undefined}];});
 assert.equal(pending.audit.proposed,0);
 const other=runTrial('A',s=>{s.activePlayer=1;});
 assert.equal(other.audit.proposed,0);
});
test('rejected Store action remains error, with observer restored',()=>{
 const original=Store.prototype.dispatch;
 class RejectStore extends Store{
   dispatch(action){
     if(action instanceof PlayCardAction)throw Error('paper-blocked');
     return super.dispatch(action);
   }
 }
 assert.throws(()=>withCandidateStadiumAfterSelectedPass(()=>{
   const s=new RejectStore();
   s.dispatch(new AddPlayerAction());
   const bot=new Bot(1);
   s.dispatch(bot.decodeNextAction(s.state));
 },trial('A'),{...deps,store:{Store:RejectStore}}),/paper-blocked/);
 assert.equal(Store.prototype.dispatch,original);
});

test('registered panel binds precisely four frozen actor compositions and restores export',()=>{
 const original=run=>run();
 const root={withActorOnlyRootPolicy:original};
 const inputs=['A','A','B','B'].map((slot,i)=>({
   id:'6:'+i+':'+slot+':reference',candidateSlot:slot
 }));
 const got=withRegisteredCandidateStadiumPanel(()=>{
   return inputs.map((x,i)=>root.withActorOnlyRootPolicy(
     ()=>({result:i}),{actorOnly:true}));
 },inputs,{root,runTrial:(inner,trial)=>({
   result:inner(),audit:{trialId:trial.id}
 })});
 assert.equal(got.audit.rootCompositions,4);
 assert.deepEqual(got.audit.interventions.map(x=>x.trialId),
   inputs.map(x=>x.id));
 assert.strictEqual(root.withActorOnlyRootPolicy,original);
});
