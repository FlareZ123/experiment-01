'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {AttackAction}=
  require(path.join(output,'game/store/actions/game-actions'));
const {ResolvePromptAction}=
  require(path.join(output,'game/store/actions/resolve-prompt-action'));
const {GameMessage}=require(path.join(output,'game/game-message'));
const {
  installCopycatMultiAttackHistory,
  dispatchCopycatWithSelectedHistory
}=require('../simulation/twinleaf/copycat-multiattack-history.cjs');

class ChooseAttackPrompt{
  constructor(playerId,sourceCard,selectedAttack){
    this.id='copycat-choice';
    this.playerId=playerId;
    this.message=GameMessage.CHOOSE_ATTACK_TO_COPY;
    this.cards=[sourceCard];
    this.decode=()=>selectedAttack;
  }
}

function makeStore(sourceCard){
  const player={
    id:1,
    active:{getPokemonCard:()=>sourceCard}
  };
  const opponent={
    id:2,
    active:{getPokemonCard:()=>({fullName:'Opponent Pokemon',attacks:[]})}
  };
  return {
    state:{
      players:[player,opponent],
      activePlayer:0,
      turn:1,
      prompts:[],
      playerLastAttack:{}
    },
    dispatch(action){
      if(action?.kind==='end-turn'){
        this.state={
          ...this.state,
          activePlayer:1,
          turn:2
        };
      }
    }
  };
}

function runChoicePrompt(powers,options={}){
  const first={name:'First attack',gxAttack:false,copycatAttack:false};
  const second={
    name:options.secondName??'Second attack',
    gxAttack:options.secondGx===true,
    copycatAttack:options.secondCopycat===true
  };
  const sourceCard={
    name:options.sourceCardName??'Fixture Pokemon',
    fullName:options.sourceCardFullName??'Fixture Pokemon',
    powers,
    attacks:[first,second]
  };
  const store=makeStore(sourceCard);
  const history=installCopycatMultiAttackHistory(store);
  try{
    store.dispatch(new AttackAction(1,first.name));
    if(options.declareSecondAttack===true)
      store.dispatch(new AttackAction(1,second.name));
    const prompt=new ChooseAttackPrompt(1,sourceCard,second);
    store.state.prompts=[prompt];
    store.dispatch(new ResolvePromptAction(prompt.id,{name:second.name}));
    store.dispatch({kind:'end-turn'});
    return {
      snapshot:history.getPreviousTurnSnapshot(1),
      copycatChoices:history.getCopycatChoices(1)
    };
  }finally{
    history.restore();
  }
}

test('generic CHOOSE_ATTACK_TO_COPY prompt without Barrage is not a two-attack Copycat pair',()=>{
  const result=runChoicePrompt([]);
  assert.ok(result.snapshot);
  assert.equal(result.snapshot.turn,1);
  assert.deepEqual(result.snapshot.attacks.map(row=>row.attackName),['First attack']);
  assert.deepEqual(result.copycatChoices.map(row=>row.attackName),['First attack']);
});

test('Barrage power marks the preceding attack and selected follow-up as the Copycat pair',()=>{
  const result=runChoicePrompt([{name:'Barrage',barrage:true}]);
  assert.ok(result.snapshot);
  assert.equal(result.snapshot.turn,1);
  assert.deepEqual(result.snapshot.attacks.map(row=>row.attackName),
    ['First attack','Second attack']);
  assert.deepEqual(result.snapshot.attacks.map(row=>row.barragePairRole),
    ['first','second']);
  assert.equal(result.snapshot.attacks[0].barragePairId,
    result.snapshot.attacks[1].barragePairId);
  assert.deepEqual(result.copycatChoices.map(row=>row.attackName),
    ['First attack','Second attack']);
});

test('Copycat excludes GX and Mimikyu Copycat, not copied-attack metadata generally',()=>{
  const gxResult=runChoicePrompt([],{declareSecondAttack:true,secondGx:true});
  assert.deepEqual(gxResult.snapshot.attacks.map(row=>row.attackName),
    ['First attack','Second attack']);
  assert.deepEqual(gxResult.copycatChoices,[]);

  const mimikyuResult=runChoicePrompt([],{declareSecondAttack:true,
    secondName:'Copycat',secondCopycat:true,
    sourceCardName:'Mimikyu',sourceCardFullName:'Mimikyu GRI'});
  assert.deepEqual(mimikyuResult.copycatChoices,[]);

  const apexResult=runChoicePrompt([],{declareSecondAttack:true,
    secondName:'Apex Dragon',secondCopycat:true,
    sourceCardName:'Regidrago VSTAR',
    sourceCardFullName:'Regidrago VSTAR SIT'});
  assert.deepEqual(apexResult.copycatChoices.map(row=>row.attackName),
    ['Apex Dragon']);

  const foulPlayResult=runChoicePrompt([],{declareSecondAttack:true,
    secondName:'Foul Play',secondCopycat:true,
    sourceCardName:'Zoroark BREAK',sourceCardFullName:'Zoroark BREAK BKT'});
  assert.deepEqual(foulPlayResult.copycatChoices.map(row=>row.attackName),
    ['Foul Play']);
});

test('a Barrage pair with one uncopyable member exposes only the other member',()=>{
  const result=runChoicePrompt([{name:'Barrage',barrage:true}],
    {secondGx:true});
  assert.deepEqual(result.copycatChoices.map(row=>row.attackName),
    ['First attack']);
});

test('Copycat dispatch requires a matching native action and a completed prior-turn record',()=>{
  const attack={name:'Apex Dragon',gxAttack:false,copycatAttack:true};
  const sourceCard={name:'Regidrago VSTAR',fullName:'Regidrago VSTAR SIT',
    attacks:[attack]};
  const selected={
    playerId:2,turn:14,sourceCard,attack,
    sourceCardName:'Regidrago VSTAR',
    sourceCardFullName:'Regidrago VSTAR SIT',attackName:'Apex Dragon',
    gxAttack:false,copycatAttack:true
  };
  const originalRecord={sourceCard:{fullName:'Original'},attack:{name:'Original'}};
  const store={
    state:{
      players:[{id:1},{id:2}],
      turn:15,
      playerLastAttack:{2:originalRecord}
    },
    dispatch(action){
      assert.equal(action.name,'Copycat');
      assert.equal(this.state.playerLastAttack[2].attack,selected.attack);
      assert.equal(this.state.playerLastAttack[2].sourceCard,selected.sourceCard);
      return 'dispatched';
    }
  };
  assert.equal(dispatchCopycatWithSelectedHistory(
    store,1,selected,new AttackAction(1,'Copycat')
  ),'dispatched');
  assert.equal(store.state.playerLastAttack[2],originalRecord);

  assert.throws(()=>dispatchCopycatWithSelectedHistory(
    store,1,{...selected,turn:15},new AttackAction(1,'Copycat')
  ));
  assert.throws(()=>dispatchCopycatWithSelectedHistory(
    store,1,selected,new AttackAction(1,'Filch')
  ));
  assert.throws(()=>dispatchCopycatWithSelectedHistory(
    store,1,selected,new AttackAction(2,'Copycat')
  ));
  assert.equal(store.state.playerLastAttack[2],originalRecord);

  const mimikyuAttack={name:'Copycat',gxAttack:false,copycatAttack:true};
  const mimikyuCard={name:'Mimikyu',fullName:'Mimikyu GRI',
    attacks:[mimikyuAttack]};
  const forbidden={...selected,sourceCard:mimikyuCard,
    sourceCardName:'Mimikyu',sourceCardFullName:'Mimikyu GRI',
    attack:mimikyuAttack,attackName:'Copycat'};
  assert.throws(()=>dispatchCopycatWithSelectedHistory(
    store,1,forbidden,new AttackAction(1,'Copycat')
  ),/Mimikyu cannot copy/);
  assert.equal(store.state.playerLastAttack[2],originalRecord);
});
