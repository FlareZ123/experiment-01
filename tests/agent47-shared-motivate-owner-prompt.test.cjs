'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,chooseOwnMotivateAssignment,withSharedMotivatePrompt
}=require('../simulation/twinleaf/agent47-shared-motivate-owner-prompt.cjs');

const enums={
  PlayerType:{BOTTOM_PLAYER:2},SlotType:{BENCH:4},
  SuperType:{ENERGY:1},EnergyType:{BASIC:1}
};

test('symmetric physically accepted Motivate attaches two owner-discard Basics',()=>{
  assert.equal(VERSION,
    'agent47-bilateral-squawkabilly-motivate-owner-prompt-v1');
  for(const seat of [0,1]){
    const energies=[0,1].map(index=>({
      fullName:'Basic Psychic Energy '+index,
      superType:1,energyType:1
    }));
    const discard={cards:[...energies],
      filter(fn){return this.cards.filter(fn);}};
    const bench=[{
      pokemon:{name:'Unown'},energies:{cards:[]},
      getPokemonCard(){return this.pokemon;}
    }];
    const owner={id:200+seat,discard,bench,
      active:{getPokemonCard:()=>({name:'Squawkabilly ex'})},
      forEachPokemon(side,fn){
        assert.equal(side,2);
        for(let i=0;i<this.bench.length;i++){
          const slot=this.bench[i];
          fn(slot,slot.getPokemonCard(),{player:2,slot:4,index:i});
        }
      }};
    const opponent={id:201-seat,
      discard:{cards:[]},bench:[],
      active:{getPokemonCard:()=>({name:'Unown'})}};
    const players=seat===0?[owner,opponent]:[opponent,owner];
    const state={turn:40,activePlayer:seat,players,prompts:[]};
    class AttackAction{
      constructor(id){this.clientId=id;this.name='Motivate';}
    }
    class ResolvePromptAction{
      constructor(id,result){this.id=id;this.result=result;}
    }
    class AttachEnergyPrompt{
      constructor(){
        this.id=19;this.playerId=owner.id;
        this.cardList=owner.discard;this.result=undefined;
        this.playerType=2;this.slots=[4];this.min=0;this.max=2;
        this.filter=card=>card.superType===1&&card.energyType===1;
        this.options={sameTarget:true};
      }
      validate(assignments){
        return Array.isArray(assignments)&&assignments.length<=2&&
          assignments.every(({card,to})=>
            discard.cards.includes(card)&&to.player===2&&
            to.slot===4&&to.index===0);
      }
    }
    class Store{
      constructor(){this.state=state;}
      dispatch(action){
        if(action instanceof AttackAction){
          state.prompts.push(new AttachEnergyPrompt());
          return 'attack';
        }
        if(action instanceof ResolvePromptAction){
          const prompt=state.prompts.find(p=>p.id===action.id);
          assert.ok(prompt?.validate(action.result));
          prompt.result=action.result;
          for(const assignment of action.result){
            discard.cards.splice(discard.cards.indexOf(assignment.card),1);
            bench[assignment.to.index].energies.cards.push(assignment.card);
          }
          return 'attached';
        }
        throw Error('unsupported mocked action');
      }
    }
    class SimpleTacticsAi{
      constructor(id){this.client={id};}
      decodeNextAction(){return {nativeFallback:true};}
    }
    const store=new Store();
    const rootBinding={current:store};
    const beforeStore=Store.prototype.dispatch;
    const beforeAi=SimpleTacticsAi.prototype.decodeNextAction;
    const output=withSharedMotivatePrompt(()=>{
      assert.equal(store.dispatch(new AttackAction(owner.id)),'attack');
      const prompt=state.prompts[0];
      assert.equal(chooseOwnMotivateAssignment(state,owner,prompt,enums).length,2);
      const reply=new SimpleTacticsAi(owner.id).decodeNextAction(state);
      assert.ok(reply instanceof ResolvePromptAction);
      assert.equal(reply.result.length,2);
      assert.equal(store.dispatch(reply),'attached');
      return 'native-completed';
    },{
      Store,SimpleTacticsAi,ResolvePromptAction,enums,rootBinding,
      validate:(current,action)=>{
        assert.equal(current,state);
        assert.ok(action instanceof ResolvePromptAction);
        assert.ok(state.prompts[0].validate(action.result));
      }
    });
    assert.equal(output.result,'native-completed');
    assert.equal(output.audit.acceptedMotivateRoots,1);
    assert.equal(output.audit.genuineOwnerDiscardPrompts,1);
    assert.equal(output.audit.submitted,1);
    assert.equal(output.audit.nativeAccepted,1);
    assert.equal(output.audit.physicallyAttached,2);
    assert.equal(output.audit.failedPhysicalTransfers,0);
    assert.equal(output.audit.readOpponentConcealed,false);
    assert.equal(output.audit.readUnopenedDeck,false);
    assert.equal(discard.cards.length,0);
    assert.deepEqual(bench[0].energies.cards,energies);
    assert.equal(output.audit.physicalMoves[0].seat,seat);
    assert.equal(Store.prototype.dispatch,beforeStore);
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,beforeAi);
  }
});

test('Motivate owner Energy selector rejects opponent discard and blocked Bench',()=>{
  const energy={fullName:'Psychic Energy',superType:1,energyType:1};
  const discard={cards:[energy],filter:(fn)=>[energy].filter(fn)};
  const slot={getPokemonCard:()=>({name:'Unown'}),energies:{cards:[]}};
  const owner={id:4,discard,bench:[slot],active:{},forEachPokemon:(side,cb)=>
    cb(slot,{name:'Unown'},{player:2,slot:4,index:0})};
  const prompt={
    constructor:{name:'AttachEnergyPrompt'},playerId:4,
    result:undefined,cardList:discard,playerType:2,slots:[4],
    min:0,max:2,filter:()=>true,
    options:{blockedTo:[{player:2,slot:4,index:0}]},
    validate:()=>true
  };
  assert.deepEqual(chooseOwnMotivateAssignment({},owner,prompt,enums),[]);
  assert.equal(chooseOwnMotivateAssignment({},{
    ...owner,discard:{cards:[],filter:()=>[]}},prompt,enums),null,
  'a different card source does not authenticate this prompt');
  prompt.cardList={cards:[energy],filter:discard.filter};
  assert.equal(chooseOwnMotivateAssignment({},owner,prompt,enums),null,
  'foreign or cloned card pool is never selected');
});
