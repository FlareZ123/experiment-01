'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {firstTurnBoxOffer,selectLaterBasicDiscardNames,witnessOpponentTurn}=
  require('../simulation/twinleaf/agent44-owner-boxshake-native-policy.cjs');

function originalFirstTurn(){
  return {
    turn:1,
    handNames:['Carmine','Float Stone','Quick Ball','Dark Patch',
      'Battle VIP Pass','Secret Box','Trubbish'],
    activeName:'Mega Absol ex',
    benchNames:[null,null,null,null,null],
    itemLocked:false,toolLocked:false
  };
}
test('original native first-turn K0 physical offer preserves Tool and Basic',()=>{
  const offer=firstTurnBoxOffer(originalFirstTurn());
  assert.equal(offer.eligible,true);
  assert.equal(offer.toolName,'Float Stone');
  assert.deepEqual(offer.discardNames,
    ['Battle VIP Pass','Quick Ball','Dark Patch']);
});
test('same shared rule is seat-neutral and does not accept opponent data',()=>{
  const offer=firstTurnBoxOffer(originalFirstTurn());
  assert.deepEqual(Object.keys(offer).sort(),
    ['discardNames','eligible','reason','toolName']);
});
test('cannot pay three upfront by imagining future Box search outputs',()=>{
  const x=originalFirstTurn();
  x.handNames=['Secret Box','Trubbish','Float Stone','Quick Ball','Dark Patch'];
  assert.equal(firstTurnBoxOffer(x).eligible,false);
  assert.equal(firstTurnBoxOffer(x).reason,'CANNOT_PAY_BOX_THREE');
});
test('one full Bench or locked Item prevents owner root',()=>{
  const x=originalFirstTurn();
  x.benchNames=['Budew','Crobat V','Dedenne-GX','Tapu Lele-GX','Mew'];
  assert.equal(firstTurnBoxOffer(x).eligible,false);
  x.benchNames=[null,null,null,null,null];
  x.itemLocked=true;
  assert.equal(firstTurnBoxOffer(x).reason,'PUBLIC_LOCK');
});
test('no synthetic draw of singleton Shake or evolved Basic',()=>{
  const x=originalFirstTurn();
  x.handNames.push('Boost Shake');
  assert.equal(firstTurnBoxOffer(x).eligible,false);
  x.handNames.pop();
  x.handNames=x.handNames.filter(name=>name!=='Trubbish');
  assert.equal(firstTurnBoxOffer(x).eligible,false);
});
test('opening clocks accept both first-owner turns and reject later',()=>{
  const x=originalFirstTurn();
  x.turn=2;
  assert.equal(firstTurnBoxOffer(x).eligible,true);
  x.turn=3;
  assert.equal(firstTurnBoxOffer(x).reason,'NOT_FIRST_GLOBAL_TURN');
});
test('preserve useful held Tool even when other same-name copies exist',()=>{
  const x=originalFirstTurn();
  x.handNames.push('Float Stone');
  const offer=firstTurnBoxOffer(x);
  assert.equal(offer.eligible,true);
  assert.deepEqual(offer.discardNames,
    ['Battle VIP Pass','Quick Ball','Dark Patch']);
});

function slot(name,tool){
  return {getPokemonCard:()=>name?{name}:null,
    tools:tool?[{name:tool}]:[]};
}
test('opponent decision receives settled first-turn Tool Garbodor witness',()=>{
  const stages=new Map([[0,{stage:'complete',toolName:'Float Stone'}]]);
  const audit={opponentContinuations:[]};
  const phase={PLAYER_TURN:1};
  const source={active:slot(null,null),bench:[slot('Garbodor','Float Stone')]};
  const opponent={active:slot('Mew',null),bench:[slot('Mew',null)]};
  const state={players:[source,opponent],turn:2,activePlayer:1,phase:1};
  witnessOpponentTurn(stages,audit,state,null,phase);
  assert.deepEqual(audit.opponentContinuations,[{
    sourceSeat:0,opponentSeat:1,turn:2,
    originalBotDecisionRequested:true,equippedGarbodor:true
  }]);
  witnessOpponentTurn(stages,audit,state,null,phase);
  assert.equal(audit.opponentContinuations.length,1);
});
test('pending prompt and own turn never count as opponent continuation',()=>{
  const stages=new Map([[1,{stage:'complete',toolName:'Float Stone'}]]);
  const audit={opponentContinuations:[]};
  const phase={PLAYER_TURN:1};
  const state={players:[{active:slot('Mew',null),bench:[slot('Mew',null)]},
    {active:slot(null,null),bench:[slot('Garbodor','Float Stone')]}],
    turn:2,activePlayer:1,phase:1};
  witnessOpponentTurn(stages,audit,state,null,phase);
  state.activePlayer=0;
  witnessOpponentTurn(stages,audit,state,{id:7},phase);
  assert.equal(audit.opponentContinuations.length,0);
  witnessOpponentTurn(stages,audit,state,null,phase);
  assert.equal(audit.opponentContinuations[0].sourceSeat,1);
});
test('unsettled Tool attachment can never satisfy native completion witness',()=>{
  const stages=new Map([[0,{stage:'complete',toolName:'Float Stone'}]]);
  const audit={opponentContinuations:[]};
  const state={players:[{active:slot(null,null),bench:[slot('Garbodor',null)]},
    {active:slot('Mew',null),bench:[slot('Mew',null)]}],turn:2,activePlayer:1,phase:1};
  witnessOpponentTurn(stages,audit,state,null,{PLAYER_TURN:1});
  assert.equal(audit.opponentContinuations[0].equippedGarbodor,false);
});

test('source index289 native Quick Ball can discard one of two Float Stones',()=>{
  const names=['Float Stone','Float Stone','Boost Shake'];
  assert.deepEqual(
    selectLaterBasicDiscardNames(names,1,'Float Stone'),
    ['Float Stone']);
});
test('one physical indispensable Tool and Shake stay protected',()=>{
  const names=['Boost Shake','Float Stone','Dark Patch','VS Seeker'];
  assert.deepEqual(
    selectLaterBasicDiscardNames(names,2,'Float Stone'),
    ['Dark Patch','VS Seeker']);
});
test('same-name Tool multiplicity can pay native Ultra Ball without burning final Tool',()=>{
  const names=['Boost Shake','Float Stone','Float Stone','Float Stone'];
  assert.deepEqual(
    selectLaterBasicDiscardNames(names,2,'Float Stone'),
    ['Float Stone','Float Stone']);
});
test('unaffordable payment remains empty when only protected resources in hand',()=>{
  assert.deepEqual(
    selectLaterBasicDiscardNames(['Boost Shake','Float Stone'],1,'Float Stone'),
    []);
});
