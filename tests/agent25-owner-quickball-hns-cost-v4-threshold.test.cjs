'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  chooseHnsQuickBallCost,ownerBallDonorOpportunity,
  withOwnerHnsQuickBallCost
}=require('../simulation/twinleaf/agent25-owner-quickball-hns-cost-v4-threshold.cjs');

function handCard(name,id){return {fullName:name,id};}
function makeState(seat=0,{includeCompressor=true,donor='Shuppet M5',
  source='Quick Ball SSH',forbiddenOpponentHand=false}={}){
  const hand=[
    handCard(donor,13),
    handCard('Grass Energy MEE',14),
    ...(includeCompressor?[handCard('Battle Compressor PHF',15)]:[])
  ];
  const owner={id:seat===0?101:202,
    hand:{cards:hand},discard:{cards:[]},supporter:{cards:[handCard(source,12)]},
    active:{getPokemonCard:()=>({fullName:'Dhelmise M5'})},
    bench:[]};
  const opponent={id:seat===0?202:101};
  if(forbiddenOpponentHand)
    Object.defineProperty(opponent,'hand',{get(){
      throw Error('Opposing hidden hand was read');}
    });
  const prompt={
    constructor:{name:'ChooseCardsPrompt'},
    result:undefined,id:'payment13',playerId:owner.id,
    message:'CHOOSE_CARD_TO_DISCARD',
    cards:{cards:hand},
    options:{min:1,max:1,allowCancel:false},
    validate(answer){return Array.isArray(answer)&&answer.length===1&&
      this.cards.cards.includes(answer[0]);}
  };
  owner.discard.cards.push(handCard('Banette M5',200),handCard('Banette M5',201),handCard('Banette M5',202));
  const players=seat===0?[owner,opponent]:[opponent,owner];
  return {state:{players,activePlayer:seat,turn:3,prompts:[prompt]},
    owner,opponent,prompt};
}

test('pure capacity-aware chooser uses physical offered owner HNS donors',()=>{
  const basic={eligible:true,heldCompressor:true,hasDhelmise:true,
    visibleDiscard:3,offered:['Shuppet M5','Grass Energy MEE'],
    ownHand:['Shuppet M5','Battle Compressor PHF','Grass Energy MEE']};
  assert.equal(chooseHnsQuickBallCost(basic),'Shuppet M5');
  assert.equal(chooseHnsQuickBallCost({...basic,visibleDiscard:4}),null);
  assert.equal(chooseHnsQuickBallCost({...basic,heldCompressor:false}),'Shuppet M5');
  assert.equal(chooseHnsQuickBallCost({...basic,visibleDiscard:0}),null);
  assert.equal(chooseHnsQuickBallCost({...basic,hasDhelmise:false}),null);
  assert.equal(chooseHnsQuickBallCost({...basic,offered:['Grass Energy MEE']}),null);
  assert.equal(chooseHnsQuickBallCost({...basic,
    offered:['Sinistcha M5','Banette M5'],ownHand:['Sinistcha M5','Banette M5']}),'Banette M5');
});

test('native staged Quick Ball classifier tolerates detached offered CardList',()=>{
  for(const seat of [0,1]){
    const x=makeState(seat,{forbiddenOpponentHand:true});
    assert.notStrictEqual(x.prompt.cards,x.owner.hand);
    const event=ownerBallDonorOpportunity(x.state,seat);
    assert.strictEqual(event.card,x.owner.hand.cards[0]);
    assert.equal(event.prompt.id,'payment13');
    assert.equal(event.ownDiscardCount,3);
    assert.equal(ownerBallDonorOpportunity(x.state,1-seat),null);
    assert.equal(ownerBallDonorOpportunity(
      makeState(seat,{includeCompressor:false}).state,seat)?.card.fullName,
      'Shuppet M5');
    assert.equal(ownerBallDonorOpportunity(
      makeState(seat,{source:'Ultra Ball SUM'}).state,seat),null);
  }
});

test('native v2 owner prompt is indifferent to opponent private inventory',()=>{
  const a=makeState(0,{forbiddenOpponentHand:true});
  const b=makeState(0,{forbiddenOpponentHand:true});
  a.opponent.secretDraw=['never reveal'];
  b.opponent.secretDraw=['different secret','secret prize'];
  assert.equal(ownerBallDonorOpportunity(a.state,0)?.card.fullName,
    ownerBallDonorOpportunity(b.state,0)?.card.fullName);
});

test('v2 native decoder chooses physical staged Quick Ball cost and restores Store on both seats',()=>{
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class AddPlayerAction{}
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return {kind:'native-fallback'};}
  }
  class Store{
    constructor(state){this.state=state;}
    dispatch(action){
      if(action instanceof AddPlayerAction)return;
      if(action instanceof ResolvePromptAction){
        const p=this.state.prompts.find(x=>x.id===action.id);
        assert.ok(p);
        assert.ok(p.validate(action.result,this.state));
        const owner=this.state.players.find(x=>x.id===p.playerId);
        for(const card of action.result){
          const index=owner.hand.cards.indexOf(card);
          assert.ok(index>=0);
          owner.hand.cards.splice(index,1);
          owner.discard.cards.push(card);
        }
        p.result=action.result;
      }
    }
  }
  const oldDecoder=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  for(const seat of [0,1]){
    const x=makeState(seat,{forbiddenOpponentHand:true});
    const result=withOwnerHnsQuickBallCost(seat,()=>{
      const store=new Store(x.state);
      store.dispatch(new AddPlayerAction());
      const bot=new SimpleTacticsAi(x.owner.id);
      const action=bot.decodeNextAction(x.state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.equal(action.result[0].fullName,'Shuppet M5');
      store.dispatch(action);
      assert.ok(x.owner.discard.cards.includes(action.result[0]));
      return 'native-root-executed';
    },{SimpleTacticsAi,Store,ResolvePromptAction});
    assert.equal(result.result,'native-root-executed');
    assert.equal(result.audit.eligible,1);
    assert.equal(result.audit.selected,1);
    assert.equal(result.audit.accepted,1);
    assert.equal(result.audit.physicallyMoved,1);
    assert.equal(result.audit.errored,0);
    assert.equal(result.audit.decisions[0].physicalMovedToDiscard,true);
    assert.deepEqual(Object.getOwnPropertyDescriptor(
      SimpleTacticsAi.prototype,'decodeNextAction'),oldDecoder);
    assert.deepEqual(Object.getOwnPropertyDescriptor(
      Store.prototype,'dispatch'),oldDispatch);
  }
});

test('v2 owner-only Ball chooser never probes own deck, Prize cards or opponent hidden zones',()=>{
  for(const seat of [0,1]){
    const x=makeState(seat,{source:'Quick Ball FST',forbiddenOpponentHand:true});
    for(const [target,prop] of [[x.owner,'deck'],[x.owner,'prizes'],
      [x.opponent,'deck'],[x.opponent,'prizes']]){
      Object.defineProperty(target,prop,{get(){
        throw Error('Forbidden K0 undisclosed zone probed: '+prop);
      }});
    }
    assert.equal(ownerBallDonorOpportunity(x.state,seat)?.card.fullName,
      'Shuppet M5');
    const y=makeState(seat);
    y.prompt.cards.cards=[...y.prompt.cards.cards,handCard('Shuppet M5',9999)];
    assert.equal(ownerBallDonorOpportunity(y.state,seat),null,
      'Native offered card outside physical owner hand must fail closed');
  }
});

test('staged source is required even if an alien prompt spoofs sourceCard',()=>{
  const x=makeState(0,{source:'Ultra Ball SUM'});
  x.prompt.sourceCard={fullName:'Quick Ball SSH'};
  assert.equal(ownerBallDonorOpportunity(x.state,0),null);
  x.owner.supporter.cards=[];
  assert.equal(ownerBallDonorOpportunity(x.state,0),null);
  const y=makeState(0);
  y.prompt.sourceCard=undefined;
  assert.equal(ownerBallDonorOpportunity(y.state,0)?.card.fullName,'Shuppet M5');
});

test('v3 observes a real owner-held Quick Ball without altering fallback decision',()=>{
  class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
  class AddPlayerAction{}
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return {kind:'native-fallback'};}
  }
  class Store{
    constructor(state){this.state=state;}
    dispatch(){}
  }
  for(const seat of [0,1]){
    const x=makeState(seat,{forbiddenOpponentHand:true});
    x.state.prompts=[];
    x.owner.supporter.cards=[];
    x.owner.hand.cards.push(handCard('Quick Ball SSH',99));
    const {result,audit}=withOwnerHnsQuickBallCost(seat,()=>{
      const store=new Store(x.state);
      store.dispatch(new AddPlayerAction());
      const bot=new SimpleTacticsAi(x.owner.id);
      const decision=bot.decodeNextAction(x.state);
      assert.equal(decision.kind,'native-fallback');
      return 'observed-no-intervention';
    },{SimpleTacticsAi,Store,ResolvePromptAction});
    assert.equal(result,'observed-no-intervention');
    assert.equal(audit.ownerRootDecisions,1);
    assert.equal(audit.rootsThreeDonorQuickBallReady,1);
    assert.equal(audit.rootsHeldQuickBall,1);
    assert.equal(audit.rootsHeldBallCompressorDonor,1);
    assert.equal(audit.botChosenQuickBallRoots,0);
    assert.equal(audit.selected,0);
    assert.equal(audit.ownerQuickBallRootSamples[0].heldHnsDonors[0],'Shuppet M5');
  }
});
