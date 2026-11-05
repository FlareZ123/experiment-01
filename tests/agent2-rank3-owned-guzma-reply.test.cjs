'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank3SourceGuzmaReply}=
  require('../simulation/twinleaf/agent2-rank3-owned-guzma-reply.cjs');

class PlayCardAction{
  constructor(playerId,handIndex,target){
    this.playerId=playerId;this.handIndex=handIndex;this.target=target;
  }
}
class ResolvePromptAction{
  constructor(promptId,answer){this.promptId=promptId;this.answer=answer;}
}
class ChoosePokemonPrompt{
  constructor(id){this.id=id;this.playerId='source';this.result=undefined;}
  validate(answer){return Array.isArray(answer)&&answer.length===1;}
}
class SimpleTacticsAi{
  decodeNextAction(){return {fallback:true};}
}
const fake={
  ai:{SimpleTacticsAi},
  play:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}},
  prompt:{ResolvePromptAction}
};
const pokemon=(fullName)=>({getPokemonCard:()=>({fullName,
  name:fullName.split(' ').slice(0,-1).join(' ')}),
  energies:{cards:[]}});
const makeState=()=>({
  turn:16,activePlayer:0,prompts:[],
  players:[
    {id:'source',active:pokemon('Snorlax PGO'),
      bench:[{...pokemon('Bunnelby PRC'),energies:{cards:[{fullName:'Capture Energy RCL'}]}}],
      hand:{cards:[{fullName:'Guzma BUS'}]},
      supporterTurn:0,cannotPlaySupporterCards:false},
    {id:'opponent',bench:[pokemon('Dialga-GX UPR')],
      hand:{cards:[{fullName:'secret-one'}]},
      deck:{cards:[{fullName:'secret-two'}]},
      prizes:{cards:[{fullName:'secret-three'}]}}
  ]
});

test('native root plus both owner-choice prompts select physical eligible Pokemon',()=>{
  const state=makeState();
  const dialga=state.players[1].bench[0];
  const bunnelby=state.players[0].bench[0];
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const res=withRank3SourceGuzmaReply(()=>{
    const root=SimpleTacticsAi.prototype.decodeNextAction(state);
    assert.ok(root instanceof PlayCardAction);
    assert.equal(root.playerId,'source');
    assert.equal(root.handIndex,0);
    state.prompts=[new ChoosePokemonPrompt(20)];
    const opp=SimpleTacticsAi.prototype.decodeNextAction(state);
    assert.ok(opp instanceof ResolvePromptAction);
    assert.equal(opp.answer[0],dialga);
    state.prompts=[new ChoosePokemonPrompt(21)];
    const own=SimpleTacticsAi.prototype.decodeNextAction(state);
    assert.ok(own instanceof ResolvePromptAction);
    assert.equal(own.answer[0],bunnelby);
    state.prompts=[];
    assert.deepEqual(SimpleTacticsAi.prototype.decodeNextAction(state),{fallback:true});
    return 'performed';
  },{...fake,choices:(_,p)=>p.id===20?
    [{physical:dialga,seat:1,zone:'bench',index:0}]:
    [{physical:bunnelby,seat:0,zone:'bench',index:0}]});
  assert.equal(res.result,'performed');
  assert.equal(res.audit.roots,1);
  assert.equal(res.audit.opposingChoices,1);
  assert.equal(res.audit.ownChoices,1);
  assert.equal(res.audit.receipts.length,3);
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction,original);
});

test('source conditions block root without silently choosing',()=>{
  for(const modify of [
    s=>{s.activePlayer=1;},
    s=>{s.turn=15;},
    s=>{s.players[0].supporterTurn=1;},
    s=>{s.players[0].supporterTurn=2;},
    s=>{s.players[0].cannotPlaySupporterCards=true;},
    s=>{s.players[0].hand.cards=[];},
    s=>{s.players[0].bench[0].energies.cards=[];},
    s=>{s.players[1].bench=[];}
  ]){
    const state=makeState();modify(state);
    const res=withRank3SourceGuzmaReply(()=>
      SimpleTacticsAi.prototype.decodeNextAction(state),fake);
    assert.deepEqual(res.result,{fallback:true});
    assert.equal(res.audit.roots,0);
  }
});

test('opponent concealed cards cannot change owner root decision',()=>{
  const state=makeState();
  const first=withRank3SourceGuzmaReply(()=>
    SimpleTacticsAi.prototype.decodeNextAction(state),fake).result;
  state.players[1].hand.cards=[{fullName:'different-secret'}];
  state.players[1].deck.cards=[];
  state.players[1].prizes.cards=[{fullName:'another-secret'}];
  const second=withRank3SourceGuzmaReply(()=>
    SimpleTacticsAi.prototype.decodeNextAction(state),fake).result;
  assert.equal(first.playerId,second.playerId);
  assert.equal(first.handIndex,second.handIndex);
  assert.deepEqual(first.target,second.target);
});

test('original native decoder is restored after work throws',()=>{
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  assert.throws(()=>withRank3SourceGuzmaReply(()=>{
    throw new Error('injected failure');
  },fake),/injected failure/);
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction,original);
});
