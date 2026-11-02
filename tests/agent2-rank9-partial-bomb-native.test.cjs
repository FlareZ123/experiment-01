'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {installElectrodeGXEnergyHook}=
  require('../simulation/twinleaf/electrode-gx-energy-hook.cjs');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(output,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {Format}=native('game/store/card/card-types');
const {UseAbilityAction,AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
let serial=202611020;

/**
 * Stage a physically possible original rank9 three/four/five-card Energy
 * discard packet. This is a prepared board, never a natural original deal.
 * @param {0|1} seat
 * @param {3|4|5} count
 */
function stage(seat,count){
  const manager=initializeCards();
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Missing compiled print '+name);
    found.id=serial++;
    return found;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=2021;opponent.id=2022;
  owner.name='rank9-original-ces48-owner';
  opponent.name='rank10-original-printed-defender';
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  owner.active.cards.push(card('Mega Absol ex M1L'));
  owner.bench[0].cards.push(card('Voltorb ROS'),card('Electrode-GX CES'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  opponent.hand.cards.push(card('Fog Crystal CRE'));
  const names=['Prism Energy ASC','Prism Energy ASC','Darkness Energy SVE'];
  if(count>=4)names.push('Prism Energy ASC');
  if(count>=5)names.push('Prism Energy ASC');
  assert.equal(names.length,count);
  const energy=names.map(card);
  owner.discard.cards.push(...energy);
  for(const player of [owner,opponent]){
    for(let n=0;n<8;n++)player.deck.cards.push(card('Psychic Energy SVE'));
    player.prizes=Array.from({length:6},()=>{
      const list=new CardList();
      list.cards.push(card('Psychic Energy SVE'));
      return list;
    });
  }
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,owner,opponent,energy};
}

/** @param {ReturnType<typeof stage>} s */
function beginBomb(s){
  s.store.dispatch(new UseAbilityAction(s.owner.id,'Extra Energy Bomb',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  }));
  for(let n=0;n<5;n++){
    const wait=s.state.prompts.find(p=>p.result===undefined&&p.constructor.name==='WaitPrompt');
    if(!wait)break;
    s.store.dispatch(new ResolvePromptAction(wait.id,null));
  }
  const prompt=s.state.prompts.find(p=>p.result===undefined&&p.constructor.name==='AttachEnergyPrompt');
  assert.ok(prompt,'Expected physical Extra Energy Bomb AttachEnergyPrompt');
  assert.equal(prompt.playerId,s.owner.id);
  const to={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
  const choose=n=>prompt.decode(s.energy.slice(0,n).map((card,index)=>({to,index})),s.state);
  return {prompt,choose};
}

/** @param {ReturnType<typeof stage>} s */
function finishBomb(s){
  for(let n=0;n<16;n++){
    const pending=s.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    let reply;
    if(pending.constructor.name==='WaitPrompt')reply=null;
    else if(pending.constructor.name==='ChoosePrizePrompt'){
      reply=s.opponent.prizes.filter(x=>x.cards.length).slice(0,pending.options.count);
    }else if(pending.constructor.name==='ShuffleDeckPrompt'){
      reply=Array.from({length:s.owner.deck.cards.length},(_,i)=>i);
    }else throw new Error('Unexpected Electrode continuation: '+pending.constructor.name);
    assert.equal(pending.validate(reply,s.state),true,pending.constructor.name);
    s.store.dispatch(new ResolvePromptAction(pending.id,reply));
  }
  assert.equal(s.state.prompts.some(p=>p.result===undefined),false);
  assert.equal(s.opponent.getPrizeLeft(),4,'Real self-KO must award two Prizes');
}

/** @param {ReturnType<typeof stage>} s */
function settleClaw(s){
  const initial=s.opponent.active.damage;
  s.store.dispatch(new AttackAction(s.owner.id,'Claw of Darkness'));
  for(let n=0;n<5;n++){
    const wait=s.state.prompts.find(p=>p.result===undefined&&p.constructor.name==='WaitPrompt');
    if(!wait)break;
    s.store.dispatch(new ResolvePromptAction(wait.id,null));
  }
  const prompt=s.state.prompts.find(p=>p.result===undefined&&p.constructor.name==='ChooseCardsPrompt');
  assert.ok(prompt,'Claw must select an opponent hand card');
  const index=s.opponent.hand.cards.findIndex(c=>c.fullName==='Fog Crystal CRE');
  assert.ok(index>=0);
  const chosen=prompt.decode([index]);
  assert.equal(prompt.validate(chosen),true);
  s.store.dispatch(new ResolvePromptAction(prompt.id,chosen));
  for(let n=0;n<5&&s.opponent.active.damage===initial;n++){
    const wait=s.state.prompts.find(p=>p.result===undefined&&p.constructor.name==='WaitPrompt');
    assert.ok(wait,'Pending attack animation should settle damage');
    s.store.dispatch(new ResolvePromptAction(wait.id,null));
  }
  assert.equal(s.opponent.active.damage-initial,200);
  assert.equal(s.opponent.discard.cards.some(c=>c.fullName==='Fog Crystal CRE'),true);
}

for(const seat of [0,1]){
  for(const count of [3,4]){
    test('official paper partial Bomb '+count+' of '+count+', native seat '+seat,()=>{
      const release=installElectrodeGXEnergyHook();
      try{
        const s=stage(seat,count);
        const {prompt,choose}=beginBomb(s);
        assert.equal(prompt.options.min,count,'Available packet is mandatory count');
        const chosen=choose(count);
        assert.equal(prompt.validate(chosen),true);
        s.store.dispatch(new ResolvePromptAction(prompt.id,chosen));
        assert.equal(s.owner.active.energies.cards.length,count);
        assert.equal(s.energy.every(c=>s.owner.active.energies.cards.includes(c)),true);
        assert.equal(s.energy.some(c=>s.owner.discard.cards.includes(c)),false);
        finishBomb(s);
        settleClaw(s);
        console.log('CES48_RANK9_OFFICIAL_PARTIAL_NATIVE',JSON.stringify({
          seat,sourceRank:9,sourceEnergyAvailable:count,paid:count,
          firstAttack:'Claw of Darkness',firstAttackDamage:200,
          selfKoOpponentPrizes:2,paperQuestion:'official-JP-CES48-partial',
          competitiveQualifiedGames:0
        }));
      }finally{release();}
    });
  }
  test('five available forbids choosing four, native seat '+seat,()=>{
    const release=installElectrodeGXEnergyHook();
    try{
      const s=stage(seat,5);
      const {prompt,choose}=beginBomb(s);
      assert.equal(prompt.options.min,5);
      const underpaid=choose(4);
      assert.equal(prompt.validate(underpaid),false);
      assert.throws(()=>s.store.dispatch(new ResolvePromptAction(prompt.id,underpaid)));
      assert.equal(s.owner.discard.cards.filter(c=>s.energy.includes(c)).length,5);
      assert.equal(s.owner.active.energies.cards.length,0);
    }finally{release();}
  });
}
