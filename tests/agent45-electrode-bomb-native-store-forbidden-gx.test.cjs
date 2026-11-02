'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(base,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {Format}=native('game/store/card/card-types');
const {UseAbilityAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
let id=45700;

/** @param {0|1} seat */
function stage(seat){
 const manager=initializeCards();
 const card=name=>{
  const found=manager.getCardByName(name);
  assert.ok(found,'Required printing missing: '+name);
  found.id=id++;
  return found;
 };
 const owner=new Player(),opponent=new Player();
 owner.id=451;opponent.id=452;
 owner.name='electrode-owner';opponent.name='native-defender';
 owner.bench=Array.from({length:5},()=>new PokemonCardList());
 opponent.bench=Array.from({length:5},()=>new PokemonCardList());
 owner.active.cards.push(card('Tapu Lele-GX GRI'));
 owner.bench[0].cards.push(card('Voltorb ROS'),card('Electrode-GX CES'));
 owner.bench[1].cards.push(card('Duskull PRE'));
 opponent.active.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
 const energy=Array.from({length:5},()=>card('Lightning Energy SVE'));
 owner.discard.cards.push(...energy);
 for(const player of [owner,opponent]){
  for(let j=0;j<8;j++)player.deck.cards.push(card('Psychic Energy SVE'));
  player.prizes=Array.from({length:6},()=>{
   const list=new CardList();
   list.cards.push(card('Psychic Energy SVE'));
   return list;
  });
 }
 const store=new Store({onStateChange(){}});
 const state=store.state;
 state.players=seat===0?[owner,opponent]:[opponent,owner];
 state.activePlayer=seat;state.turn=4;
 state.phase=GamePhase.PLAYER_TURN;
 state.gameSettings.format=Format.EXPANDED;
 return {store,state,owner,opponent,energy};
}
for(const seat of [0,1]){
 test('native CES48 source Extra Energy Bomb forbidden GX recipient seat '+seat,()=>{
  const s=stage(seat);
  s.store.dispatch(new UseAbilityAction(s.owner.id,'Extra Energy Bomb',{
   player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  }));
  for(let i=0;i<5;i++){
   const wait=s.state.prompts.find(p=>p.result===undefined&&
     p.constructor.name==='WaitPrompt');
   if(!wait)break;
   s.store.dispatch(new ResolvePromptAction(wait.id,null));
  }
  const prompt=s.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='AttachEnergyPrompt');
  assert.ok(prompt,'Printed CES48 Ability must create real AttachEnergyPrompt');
  assert.equal(prompt.playerId,s.owner.id);
  const gx={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
  assert.ok(prompt.options.blockedTo.some(x=>
    x.player===gx.player&&x.slot===gx.slot&&x.index===gx.index));
  const chosen=prompt.decode([{to:gx,index:0}],s.state);
  assert.equal(prompt.validate(chosen),true,
    'Pinned validator accepts a blocked GX target');
  s.store.dispatch(new ResolvePromptAction(prompt.id,chosen));
  assert.ok(s.owner.active.cards.includes(s.energy[0]),
    'Native Store moved first Lightning Energy onto forbidden GX');
  assert.equal(s.owner.active.energies.cards.includes(s.energy[0]),true);
  assert.equal(s.owner.bench[0].getPokemonCard(),undefined,
    'Electrode should have been KO from activating bomb');
  console.log('AGENT45_NATIVE_CES48_BLOCKED_GX_ACCEPTED',JSON.stringify({
   seat,discardedEnergyOneOfFive:true,
   recipient:'Tapu Lele-GX GRI',competitiveQualifiedGames:0
  }));
 });
}

const {installElectrodeGXEnergyHook}=
  require('../simulation/twinleaf/electrode-gx-energy-hook.cjs');

for(const seat of [0,1]){
 test('research hook refuses five forbidden GX attachments seat '+seat,()=>{
  const restore=installElectrodeGXEnergyHook();
  try {
   const s=stage(seat);
   s.store.dispatch(new UseAbilityAction(s.owner.id,'Extra Energy Bomb',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
   }));
   for(let j=0;j<5;j++){
    const wait=s.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='WaitPrompt');
    if(!wait)break;
    s.store.dispatch(new ResolvePromptAction(wait.id,null));
   }
   const prompt=s.state.prompts.find(p=>p.result===undefined&&
     p.constructor.name==='AttachEnergyPrompt');
   assert.ok(prompt);
   assert.equal(prompt.options.min,5);
   const blocked={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
   const chosen=prompt.decode(s.energy.map((card,index)=>({
    to:blocked,index
   })),s.state);
   assert.equal(prompt.validate(chosen),true,
     'Native prompt still accepts five forbidden physical targets');
   assert.throws(()=>s.store.dispatch(new ResolvePromptAction(prompt.id,chosen)),
     /ILLEGAL_ACTION/);
   assert.equal(s.owner.active.energies.cards.length,0);
   assert.equal(s.energy.every(card=>s.owner.discard.cards.includes(card)),true);
   assert.equal(s.owner.bench[0].getPokemonCard()?.fullName,'Electrode-GX CES');
   console.log('AGENT45_CES48_HOOK_REJECTED_FORBIDDEN_GX',JSON.stringify({
    seat,selected:5,accepted:false,competitiveQualifiedGames:0
   }));
  }finally{restore();}
 });
}
