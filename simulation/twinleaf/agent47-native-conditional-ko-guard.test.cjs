'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withCertifiedLastOpponentTurnKO,certifiedKO,PRINTS}=
  require('./agent47-native-conditional-ko-guard.cjs');
const {createKnockoutTurnTracker}=
  require('./agent8-ko-turn-tracker.cjs');

class TrainerEffect {
  constructor(player,trainerCard){this.player=player;this.trainerCard=trainerCard;}
}
class GameError extends Error {
  constructor(code){super(code);this.code=code;}
}
const GameMessage={CANNOT_PLAY_THIS_CARD:'cannot-play-this-card'};
const CARD={
  Raihan:{name:'Raihan',set:'EVS',setNumber:'152',fullName:'Raihan EVS'},
  Teammates:{name:'Teammates',set:'PRC',setNumber:'141',fullName:'Teammates PRC'},
  UnfairStamp:{name:'Unfair Stamp',set:'TWM',setNumber:'165',fullName:'Unfair Stamp TWM'}
};
class CardBase{
  constructor(values){Object.assign(this,values);this.effects=0;}
  canPlay(){return true;} // Mimics a stale, positive native marker
  reduceEffect(store,state,effect){
    if(effect instanceof TrainerEffect&&effect.trainerCard===this){
      this.effects++;state.used.push(this.fullName);
    }
    return state;
  }
}
class Raihan extends CardBase{}
class Teammates extends CardBase{}
class UnfairStamp extends CardBase{}
const dependencies={Raihan,Teammates,UnfairStamp,
  TrainerEffect,GameError,GameMessage};

function trial({seat=0,actorExtra=false,positive=true,covered=true}={}){
  const actorId=seat===0?'A':'B',opponentId=seat===0?'B':'A';
  const state={turn:4,activePlayer:seat,
    players:[{id:'A'},{id:'B'}],used:[]};
  const actor=state.players[seat];
  const opponent=state.players[1-seat];
  const tracker=createKnockoutTurnTracker(covered?0:2);
  if(covered){
    if(positive)tracker.record({turn:2,victimPlayerId:actorId,
      attackerPlayerId:opponentId,byAttack:true});
    tracker.completeTurn(2,opponentId);
    tracker.completeTurn(3,actorExtra?actorId:opponentId);
  }else{
    tracker.completeTurn(3,actorId);
  }
  return {state,actor,opponent,tracker,
    store:{reduceEffect(s){return s;}},instances:{
      Raihan:new Raihan(CARD.Raihan),
      Teammates:new Teammates(CARD.Teammates),
      UnfairStamp:new UnfairStamp(CARD.UnfairStamp)
    }};
}

for(const seat of [0,1]){
  test('seat '+seat+' stale positive native KO marker rejected for every exact card',()=>{
    const t=trial({seat,actorExtra:false,positive:true});
    const orig=Raihan.prototype.canPlay;
    const ran=withCertifiedLastOpponentTurnKO({
      store:t.store,tracker:t.tracker,dependencies,execute(){
        for(const key of Object.keys(t.instances)){
          const card=t.instances[key];
          assert.equal(card.canPlay(t.store,t.state,t.actor),false);
          assert.throws(()=>card.reduceEffect(t.store,t.state,
            new TrainerEffect(t.actor,card)),
            /cannot-play-this-card/);
          assert.equal(card.effects,0);
        }
      }
    });
    assert.strictEqual(Raihan.prototype.canPlay,orig);
    assert.equal(ran.audit.blocksCanPlay,3);
    assert.equal(ran.audit.blocksEffect,3);
    assert.equal(ran.audit.validContinuations,0);
    assert.equal(ran.audit.restored,true);
    assert.deepEqual(t.state.used,[]);
  });

  test('seat '+seat+' valid old opponent KO survives own extra turn',()=>{
    const t=trial({seat,actorExtra:true,positive:true});
    const v=certifiedKO(t.tracker,t.state,t.actor);
    assert.deepEqual(v,{eligible:true,turn:2,
      reason:'CERTIFIED_LAST_OPPONENT_TURN_KO'});
    const ran=withCertifiedLastOpponentTurnKO({
      store:t.store,tracker:t.tracker,dependencies,execute(){
        for(const key of Object.keys(t.instances)){
          const card=t.instances[key];
          assert.equal(card.canPlay(t.store,t.state,t.actor),true);
          card.reduceEffect(t.store,t.state,new TrainerEffect(t.actor,card));
          assert.equal(card.effects,1);
        }
      }
    });
    assert.equal(ran.audit.validContinuations,6);
    assert.deepEqual(t.state.used,PRINTS.map(p=>p.print));
  });

  test('seat '+seat+' completed opponent no-KO turn stays false',()=>{
    const t=trial({seat,positive:false});
    assert.deepEqual(certifiedKO(t.tracker,t.state,t.actor),
      {eligible:false,turn:3,reason:'CERTIFIED_LAST_TURN_EMPTY'});
    withCertifiedLastOpponentTurnKO({
      store:t.store,tracker:t.tracker,dependencies,execute(){
        for(const card of Object.values(t.instances))
          assert.equal(card.canPlay(t.store,t.state,t.actor),false);
      }
    });
  });

  test('seat '+seat+' mid-turn missing owner history blocks canPlay and reducer',()=>{
    const t=trial({seat,covered:false});
    const ran=withCertifiedLastOpponentTurnKO({
      store:t.store,tracker:t.tracker,dependencies,execute(){
        for(const card of Object.values(t.instances)){
          assert.equal(card.canPlay(t.store,t.state,t.actor),false);
          assert.throws(()=>card.reduceEffect(t.store,t.state,
            new TrainerEffect(t.actor,card)));
        }
      }
    });
    assert.equal(ran.audit.uncertainBlocks,6);
  });
}

test('other Store and other printing remain unchanged; event fan-out unaffected',()=>{
  const t=trial({actorExtra:false});
  const otherStore={reduceEffect(){}};
  const changed=new Raihan({...CARD.Raihan,setNumber:'999'});
  withCertifiedLastOpponentTurnKO({
    store:t.store,tracker:t.tracker,dependencies,execute(){
      assert.equal(t.instances.Raihan.canPlay(otherStore,t.state,t.actor),true);
      assert.equal(changed.canPlay(t.store,t.state,t.actor),true);
      const e={player:t.actor};
      t.instances.Raihan.reduceEffect(t.store,t.state,e);
      assert.equal(t.instances.Raihan.effects,0);
    }
  });
});

test('reducing while wrong seat or uncertified actor is rejected',()=>{
  const t=trial();
  const wrong=t.state.players[1];
  withCertifiedLastOpponentTurnKO({
    store:t.store,tracker:t.tracker,dependencies,execute(){
      assert.equal(t.instances.Raihan.canPlay(t.store,t.state,wrong),false);
      assert.throws(()=>t.instances.Raihan.reduceEffect(t.store,t.state,
        new TrainerEffect(wrong,t.instances.Raihan)));
    }
  });
});

test('guard restores all native prototypes when its workload throws',()=>{
  const t=trial();
  const previous=Object.fromEntries(
    Object.entries(dependencies)
      .filter(([key])=>['Raihan','Teammates','UnfairStamp'].includes(key))
      .map(([key,ctor])=>[key,ctor.prototype.reduceEffect]));
  assert.throws(()=>withCertifiedLastOpponentTurnKO({
    store:t.store,tracker:t.tracker,dependencies,execute(){
      throw new Error('intentional-workload-error');
    }
  }),/intentional-workload-error/);
  for(const [key,fn] of Object.entries(previous))
    assert.strictEqual(dependencies[key].prototype.reduceEffect,fn);
});
