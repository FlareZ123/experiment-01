'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(base,name));
const {State}=engine('game/store/state/state');
const {Player}=engine('game/store/state/player');
const {PokemonCard}=engine('game/store/card/pokemon-card');
const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
const {EnergyCard}=engine('game/store/card/energy-card');
const {CardList}=engine('game/store/state/card-list');
const {SuperType,CardType}=engine('game/store/card/card-types');
const {PlayerType,SlotType}=engine('game/store/actions/play-card-action');
const {AttachEnergyPrompt}=engine('game/store/prompts/attach-energy-prompt');
const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
const {assertValidPromptAction}=require('../simulation/twinleaf/prompt-integrity.cjs');

function fixture(options={}){
 const state=new State();
 const owner=new Player(),opponent=new Player();
 owner.id=101;opponent.id=202;
 state.players.push(owner,opponent);
 for(let i=0;i<2;i++){
  const slot=new PokemonCardList();
  slot.cards.push(new PokemonCard());
  owner.bench.push(slot);
 }
 const source=new CardList();
 const energy1=new EnergyCard(),energy2=new EnergyCard();
 energy1.provides=[CardType.LIGHTNING];
 energy2.provides=[CardType.LIGHTNING];
 source.cards.push(energy1,energy2);
 const prompt=new AttachEnergyPrompt(101,0,source,
  PlayerType.BOTTOM_PLAYER,[SlotType.BENCH],
  {superType:SuperType.ENERGY},{
   allowCancel:false,min:2,max:2,validCardTypes:[CardType.LIGHTNING],
   differentTargets:true,...options
  });
 prompt.id=17;
 state.prompts.push(prompt);
 const choice=(target0,target1)=>[
  {card:energy1,to:target0},{card:energy2,to:target1}
 ];
 const a={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0};
 const b={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1};
 return {state,prompt,choice,a,b};
}

test('pinned validCardTypes skips differentTargets but opt-in gate rejects',()=>{
 const scene=fixture();
 const repeated=scene.choice(scene.a,{...scene.a});
 assert.equal(scene.prompt.validate(repeated,scene.state),true);
 assert.throws(()=>assertValidPromptAction(scene.state,
  new ResolvePromptAction(17,repeated),
  {enforceAttachEnergyGeometry:true}),/invalid result/);
 assert.doesNotThrow(()=>assertValidPromptAction(scene.state,
  new ResolvePromptAction(17,scene.choice(scene.a,scene.b)),
  {enforceAttachEnergyGeometry:true}));
});
test('pinned recipient block bypass is separately caught',()=>{
 const initial=fixture();
 const scene=fixture({blockedTo:[initial.a]});
 const selected=scene.choice(scene.a,scene.b);
 assert.equal(scene.prompt.validate(selected,scene.state),true);
 assert.throws(()=>assertValidPromptAction(scene.state,
  new ResolvePromptAction(17,selected),
  {enforceAttachEnergyGeometry:true}),/invalid result/);
});
