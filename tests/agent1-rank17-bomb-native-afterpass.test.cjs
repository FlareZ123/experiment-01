'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withSourceBombAfterPass}=
  require('../simulation/twinleaf/agent1-rank17-bomb-native-afterpass.cjs');

class PassTurnAction{constructor(id){this.clientId=id;}}
class UseAbilityAction{
  constructor(id,name,target){this.clientId=id;this.name=name;this.target=target;}
}
class AddPlayerAction{}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return new PassTurnAction(this.client.id);}
}
const gxPrint='Electrode-GX CES';
const sourceEnergy='Reversal Energy PAL';
/** @param {string} name */
const slot=name=>({
  getPokemonCard:()=>name?({fullName:name}):null,
  energies:{cards:[]},damage:0
});
/** @param {string[]} discard */
function makeState(discard){
  const player=id=>({
    id,active:slot('Unown AOR'),bench:[
      slot(gxPrint),slot('Unown AOR'),slot(null),slot(null),slot(null)
    ],discard:{cards:discard.map(fullName=>({fullName}))},
    prizes:Array.from({length:6},()=>({cards:[{}]}))
  });
  return {activePlayer:1,turn:20,phase:2,
    players:[player(10),player(20)],prompts:[]};
}
/** @param {string[]} discard */
function visible(discard){
  return {
    actorSeat:1,decisionKind:'owner-root',globalTurn:20,
    ownPublic:{
      active:{name:'Unown',printing:'Unown AOR',abilities:[],tools:[]},
      bench:[{name:'Electrode-GX',printing:gxPrint,
        abilities:['Extra Energy Bomb'],tools:[]},
        {name:'Unown',printing:'Unown AOR',abilities:[],tools:[]},
        null,null,null],
      discard,stadium:[]
    },
    opponentPublic:{active:null,bench:[],stadium:[]}
  };
}

/** @param {{enabled:boolean,discard?:string[],locked?:boolean}} opt */
function runFixture(opt){
  class Store{
    constructor(){this.state=makeState(opt.discard??Array(3).fill(sourceEnergy));}
    dispatch(action){return action;}
  }
  const orig=SimpleTacticsAi.prototype.decodeNextAction,
    prev=Store.prototype.dispatch;
  const store=new Store();
  const result=withSourceBombAfterPass(()=>{
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi(20).decodeNextAction(store.state);
    store.dispatch(action);
    return {
      kind:action.constructor.name,abilityName:action.name??null,
      target:action.target??null
    };
  },1,{
    enabled:opt.enabled,
    observe:()=>({
      ...visible(opt.discard??Array(3).fill(sourceEnergy)),
      ...(opt.locked?{opponentPublic:{
        active:{name:'Wobbuffet',printing:'Wobbuffet PHF',
          abilities:['Bide Barricade'],tools:[]},
        bench:[],stadium:[]
      }}:{})
    }),
    deps:{
      SimpleTacticsAi,Store,
      gamePhase:{GamePhase:{PLAYER_TURN:2}},
      gameActions:{PassTurnAction,UseAbilityAction},
      cardActions:{PlayerType:{BOTTOM_PLAYER:0},
        SlotType:{BENCH:2,ACTIVE:1}}
    }
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,orig);
  assert.strictEqual(Store.prototype.dispatch,prev);
  return result;
}
test('source after-Pass with 3 physical Energy and Unown proposes exact native Ability',()=>{
  const {result,audit}=runFixture({enabled:true});
  assert.equal(result.kind,'UseAbilityAction');
  assert.equal(result.abilityName,'Extra Energy Bomb');
  assert.deepEqual(result.target,{player:0,slot:2,index:0});
  assert.equal(audit.optedNativeAbilityRootProposals,1);
  assert.equal(audit.nativeAbilityActionAccepted,1);
  assert.equal(audit.nativeAbilityActionRejected,0);
  assert.equal(audit.competitiveGameQualified,false);
  assert.equal(audit.publicSnapshots.length,0);
});
test('disabled intervention and 2-card partial funding retain ordinary Pass',()=>{
  const disabled=runFixture({enabled:false});
  const underThreshold=runFixture({enabled:true,
    discard:Array(2).fill(sourceEnergy)});
  assert.equal(disabled.result.kind,'PassTurnAction');
  assert.equal(underThreshold.result.kind,'PassTurnAction');
  assert.equal(disabled.audit.nativeAbilityActionAccepted,0);
  assert.equal(underThreshold.audit.nativeAbilityActionAccepted,0);
});
test('public active Ability-lock clue prevents experimental source Ability proposal',()=>{
  const {result,audit}=runFixture({enabled:true,locked:true});
  assert.equal(result.kind,'PassTurnAction');
  assert.equal(audit.nativeAbilityActionAccepted,0);
});
