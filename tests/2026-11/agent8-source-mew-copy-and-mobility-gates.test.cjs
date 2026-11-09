'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {actorSpecialEnergyEnabled}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {withActorOnlyChooseAttack,actorChooseAttackInput}=
  require('../../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');

test('source-scoped paid DCE Mew retreat cannot activate for candidate in either physical orientation',()=>{
  for(const sourceSeat of [0,1]){
    assert.equal(actorSpecialEnergyEnabled(true,sourceSeat,sourceSeat),true);
    assert.equal(actorSpecialEnergyEnabled(true,sourceSeat,1-sourceSeat),false);
    assert.equal(actorSpecialEnergyEnabled(false,sourceSeat,sourceSeat),false);
  }
  assert.equal(actorSpecialEnergyEnabled(true,null,0),true);
  assert.equal(actorSpecialEnergyEnabled(true,null,1),true);
});

test('actual actor ChooseAttack interceptor prefers Genesect donor only on original source seat',()=>{
  class AddPlayerAction {}
  class ChooseAttackPrompt {}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store{
    dispatch(action){this.action=action;return true;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('native fallback unexpectedly reached');}
  }
  for(const sourceSeat of [0,1]){
    for(const actingSeat of [0,1]){
      const prompt=new ChooseAttackPrompt();
      const miracle={name:'Max Miracle',blocked:false};
      const techno={name:'Techno Blast',blocked:false};
      Object.assign(prompt,{id:71,playerId:100+actingSeat,result:undefined,
        cards:[{fullName:'Mew VMAX FST',attacks:[miracle]},
          {fullName:'Genesect V FST',attacks:[techno]}],
        options:{allowCancel:false,blocked:[]}});
      const state={
        players:[{id:100},{id:101}],
        prompts:[prompt],
        turn:4,secretOpposingCards:['NEVER_EXPOSE_THIS']
      };
      const outcome=withActorOnlyChooseAttack(()=>{
        const store=new Store();
        store.state=state;
        store.dispatch(new AddPlayerAction());
        const action=new SimpleTacticsAi(100+actingSeat).decodeNextAction(state);
        assert.ok(action instanceof ResolvePromptAction);
        store.dispatch(action);
        return action;
      },{
        SimpleTacticsAi,Store,ResolvePromptAction,
        preferMewGenesectTechnoBlast:true,
        preferMewGenesectTechnoBlastOwnerSeat:sourceSeat,
        observe:(native,seat)=>actorChooseAttackInput(native,seat,()=>({
          decisionKind:'owner-prompt',globalTurn:4,
          ownPublic:{active:{printing:'Mew VMAX FST'},
            publicTurnRestrictions:{gxUsed:false}}
        })),
        validate:(native,action)=>{
          assert.strictEqual(native,state);
          assert.ok(action.result===miracle||action.result===techno);
        }
      });
      assert.strictEqual(outcome.result.result,
        actingSeat===sourceSeat?techno:miracle);
      assert.equal(outcome.audit.accepted,1);
      assert.equal(outcome.audit.selections[0].seat,actingSeat);
      assert.equal(JSON.stringify(outcome.audit).includes('NEVER_EXPOSE_THIS'),false);
    }
  }
});

test('invalid copy preference owner seat is rejected before intercepting native prototype',()=>{
  assert.throws(()=>withActorOnlyChooseAttack(()=>{},{
    preferMewGenesectTechnoBlast:true,
    preferMewGenesectTechnoBlastOwnerSeat:2,
    SimpleTacticsAi:class {decodeNextAction(){}},
    Store:class {dispatch(){}},
    ResolvePromptAction:class {}
  }),/assertion|false|expression/i);
});
