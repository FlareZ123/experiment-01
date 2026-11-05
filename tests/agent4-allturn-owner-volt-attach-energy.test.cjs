'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnVoltTransfer,withOwnerVoltTransfer}=
  require('../simulation/twinleaf/agent4-allturn-owner-volt-attach-energy.cjs');
const enums={
  PlayerType:{BOTTOM_PLAYER:'SELF'},
  SlotType:{BENCH:'BENCH'},
  SuperType:{ENERGY:'ENERGY'}
};
class AttachEnergyPrompt {
  constructor(owner,id=23){
    this.id=id;this.playerId=owner.id;
    this.result=undefined;
    this.min=1;this.max=1;this.allowCancel=false;
    this.cardList=owner.active;
    this.playerType=enums.PlayerType.BOTTOM_PLAYER;
    this.slots=[enums.SlotType.BENCH];
  }
  validate(entries,state){
    const owner=state.players.find(x=>x.id===this.playerId);
    const move=entries?.[0];
    return entries.length===1&&
      owner.active.energies.cards.includes(move.card)&&
      move.to.player===this.playerType&&
      move.to.slot===enums.SlotType.BENCH&&
      owner.bench[move.to.index]?.getPokemonCard()!==null;
  }
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class SimpleTacticsAi {
  constructor(id){this.client={id};}
  decodeNextAction(){throw new Error('Old raw State fallback forbidden');}
}
function board(seat){
  const moves=['Speed Lightning Energy','Double Colorless Energy',
    'Capture Energy'].map(name=>({
      name,superType:enums.SuperType.ENERGY
    }));
  const active={
    getPokemonCard:()=>({name:'Iron Thorns ex',
      fullName:'Iron Thorns ex TWM 77'}),
    cards:[{name:'Iron Thorns ex'},...moves],
    energies:{cards:moves}
  };
  const bench=[
    {getPokemonCard:()=>null,energies:{cards:[]}},
    {getPokemonCard:()=>({name:'Iron Thorns ex'}),energies:{cards:[]}},
    {getPokemonCard:()=>({name:'Latias ex'}),energies:{cards:[]}}
  ];
  const owner={id:110+seat,active,bench};
  const other={id:110+1-seat};
  Object.defineProperty(other,'hand',{get(){
    throw new Error('Opponent hidden hand forbidden');}});
  Object.defineProperty(other,'deck',{get(){
    throw new Error('Opponent hidden deck forbidden');}});
  const players=seat===0?[owner,other]:[other,owner];
  return {owner,moves,state:{turn:17,
    players,prompts:[new AttachEnergyPrompt(owner)]}};
}
test('both physical seats choose exact visible Capture donor and occupied own Iron Thorns Bench',()=>{
  for(const seat of [0,1]){
    const v=board(seat),old=SimpleTacticsAi.prototype.decodeNextAction;
    const result=withOwnerVoltTransfer(()=>
      new SimpleTacticsAi(v.owner.id).decodeNextAction(v.state),{
      SimpleTacticsAi,ResolvePromptAction,enums
    });
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,old);
    assert.ok(result.result instanceof ResolvePromptAction);
    assert.equal(result.result.id,23);
    assert.equal(result.result.result.length,1);
    assert.strictEqual(result.result.result[0].card,v.moves[2]);
    assert.equal(result.result.result[0].to.index,1);
    assert.equal(result.audit.sourceOwnerPhysicalSeatCounts[seat],1);
    assert.equal(result.audit.publicOwnerSelectionReceipts[0]
      .chosenEnergyName,'Capture Energy');
  }
});
test('no native receiver or no owner prompt delegates to original fail-closed decoder',()=>{
  const v=board(1),before=SimpleTacticsAi.prototype.decodeNextAction;
  v.owner.bench[1].getPokemonCard=()=>null;
  v.owner.bench[2].getPokemonCard=()=>null;
  assert.equal(chooseOwnVoltTransfer(v.state,v.owner.id,enums),null);
  assert.throws(()=>withOwnerVoltTransfer(()=>
    new SimpleTacticsAi(v.owner.id).decodeNextAction(v.state),{
    SimpleTacticsAi,ResolvePromptAction,enums
  }),/Old raw State fallback forbidden/);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,before);
});
test('no opponent private field or foreign owner prompt can become a valid response',()=>{
  const v=board(0);
  assert.equal(chooseOwnVoltTransfer(v.state,111,enums),null);
  assert.ok(chooseOwnVoltTransfer(v.state,v.owner.id,enums));
  v.state.prompts[0].playerId=111;
  assert.equal(chooseOwnVoltTransfer(v.state,v.owner.id,enums),null);
});
test('physical identity and validator must agree before reply',()=>{
  const v=board(0);
  v.state.prompts[0].validate=()=>false;
  assert.equal(chooseOwnVoltTransfer(v.state,v.owner.id,enums),null);
  v.state.prompts[0].validate=AttachEnergyPrompt.prototype.validate;
  v.owner.active.energies.cards=[];
  assert.equal(chooseOwnVoltTransfer(v.state,v.owner.id,enums),null);
});
