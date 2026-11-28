'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withCertifiedLastOpponentTurnKO,certifiedKO,PRINTS}=
  require('./agent47-native-conditional-ko-guard.cjs');
const {createKnockoutTurnTracker,installStoreKnockoutTurnTracker}=
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
// Pinned card classes own these methods; model that prototype shape exactly.
class Raihan extends CardBase{
  canPlay(...args){return super.canPlay(...args);}
  reduceEffect(...args){return super.reduceEffect(...args);}
}
class Teammates extends CardBase{
  canPlay(...args){return super.canPlay(...args);}
  reduceEffect(...args){return super.reduceEffect(...args);}
}
class UnfairStamp extends CardBase{
  canPlay(...args){return super.canPlay(...args);}
  reduceEffect(...args){return super.reduceEffect(...args);}
}
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

const GamePhase={PLAYER_TURN:1,ATTACK:2};
class KnockOutEffect{
  constructor(victim){this.player=victim;
    this.target={getPokemonCard:()=>({name:'one-Prizer'})};
    this.preventDefault=false;
  }
}
class EndTurnEffect{constructor(player){this.player=player;}}

for(const seat of [0,1])for(const actorExtra of [false,true]){
  test('seat '+seat+' native-observer-to-card-fence full fake Store chain, actorExtra='+actorExtra,()=>{
    const t=trial({seat,actorExtra,positive:false}); // replace hand-seeded tracker
    const state=t.state;
    const originalStoreReduce=(s,e)=>{
      if(e instanceof KnockOutEffect&&e.preventDefault!==true){
        const attacker=s.players[s.activePlayer],victim=e.player;
        if(attacker!==victim&&
           [GamePhase.PLAYER_TURN,GamePhase.ATTACK].includes(s.phase))
          victim.pokemonKnockedOutLastTurnEntries.push({ko:true});
      }
      if(e instanceof EndTurnEffect)s.turn++;
      return s;
    };
    t.actor.pokemonKnockedOutLastTurnEntries=[];
    t.opponent.pokemonKnockedOutLastTurnEntries=[];
    t.actor.marker={hasMarker:()=>true};
    state.turn=0; // install before all event turns that will be certified
    t.store.state=state;
    t.store.reduceEffect=originalStoreReduce;
    const {tracker,uninstall}=installStoreKnockoutTurnTracker(t.store,{
      KnockOutEffect,EndTurnEffect,GamePhase
    });
    try{
      state.turn=2;
      state.activePlayer=1-seat;
      state.phase=GamePhase.ATTACK;
      t.store.reduceEffect(state,new KnockOutEffect(t.actor));
      t.store.reduceEffect(state,new EndTurnEffect(t.opponent));
      state.activePlayer=actorExtra?seat:1-seat;
      state.phase=GamePhase.PLAYER_TURN;
      t.store.reduceEffect(state,new EndTurnEffect(actorExtra?t.actor:t.opponent));
      state.activePlayer=seat;
      state.phase=GamePhase.PLAYER_TURN;
      assert.equal(state.turn,4);
      const own=tracker.snapshotWithTurn(t.actor.id,t.opponent.id,4);
      assert.equal(own.turn,actorExtra?2:3);
      assert.equal(own.events.length,actorExtra?1:0);
      withCertifiedLastOpponentTurnKO({
        store:t.store,tracker,dependencies,execute(){
          for(const card of Object.values(t.instances)){
            assert.equal(card.canPlay(t.store,state,t.actor),actorExtra);
            if(actorExtra)card.reduceEffect(t.store,state,
              new TrainerEffect(t.actor,card));
            else assert.throws(()=>card.reduceEffect(t.store,state,
              new TrainerEffect(t.actor,card)));
          }
        }
      });
      assert.equal(state.used.length,actorExtra?3:0);
    }finally{uninstall();}
  });
}

test('Promise-valued workload is rejected and native prototype restored',()=>{
  const t=trial();
  const original=Raihan.prototype.canPlay;
  assert.throws(()=>withCertifiedLastOpponentTurnKO({
    store:t.store,tracker:t.tracker,dependencies,execute(){
      return Promise.resolve('not-allowed');
    }
  }),/synchronous work only/);
  assert.strictEqual(Raihan.prototype.canPlay,original);
});

test('nested same-Store guard rejects concurrent prototype scope, outer restores',()=>{
  const t=trial();
  const original=Raihan.prototype.canPlay;
  const response=withCertifiedLastOpponentTurnKO({
    store:t.store,tracker:t.tracker,dependencies,execute(){
      assert.throws(()=>withCertifiedLastOpponentTurnKO({
        store:t.store,tracker:t.tracker,dependencies,execute(){}
      }),/Nested conditional-KO guard/);
      return 'outer-still-correct';
    }
  });
  assert.equal(response.result,'outer-still-correct');
  assert.equal(response.audit.restored,true);
  assert.strictEqual(Raihan.prototype.canPlay,original);
});

test('partially installed hook is rolled back when native prototype rejects reducer',()=>{
  const t=trial();
  function FragileRaihan(){}
  const base={};
  Object.defineProperty(base,'canPlay',{value:function canPlay(){return true;},
    writable:true,configurable:true,enumerable:false});
  Object.defineProperty(base,'reduceEffect',{value:function reduceEffect(){return null;},
    writable:true,configurable:true,enumerable:false});
  let failInstall=true;
  const proto=new Proxy(base,{
    defineProperty(target,key,desc){
      if(key==='reduceEffect'&&failInstall)
        throw new Error('native-reducer-install-failure');
      return Reflect.defineProperty(target,key,desc);
    }
  });
  FragileRaihan.prototype=proto;
  const originals={
    can:base.canPlay,
    reduce:base.reduceEffect
  };
  assert.throws(()=>withCertifiedLastOpponentTurnKO({
    store:t.store,tracker:t.tracker,
    dependencies:{...dependencies,Raihan:FragileRaihan},
    execute(){throw new Error('should-never-run');}
  }),/native-reducer-install-failure/);
  failInstall=false;
  assert.strictEqual(base.canPlay,originals.can);
  assert.strictEqual(base.reduceEffect,originals.reduce);
  // Failure must not poison the same Store for a subsequent normal scope.
  const after=withCertifiedLastOpponentTurnKO({
    store:t.store,tracker:t.tracker,dependencies,execute(){return 8;}
  });
  assert.equal(after.result,8);
  assert.equal(after.audit.restored,true);
});
