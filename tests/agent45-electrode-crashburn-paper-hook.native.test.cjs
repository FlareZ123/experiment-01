'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withElectrodeCrashBurnPaper,VERSION}=
  require('../simulation/twinleaf/agent50-electrode-gx-paper-hook.cjs');

const native=name=>require(path.resolve(
  __dirname,'../vendor/twinleaf/ptcg-server/output',name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
const {Format}=native('game/store/card/card-types');

let nextId=45500;

/**
 * Actual pinned Store, authenticated CES printing, two independently chosen
 * physical Energy cards and a high-HP defender. Staged native control only.
 * @param {0|1} seat
 */
function stage(seat){
  const manager=initializeCards();
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Pinned card missing: '+name);
    found.id=nextId++;
    return found;
  };
  const source=new Player(),defender=new Player();
  source.id=451;defender.id=452;
  source.name='original-CES48';defender.name='printed-damage-target';
  for(const player of [source,defender]){
    player.bench=Array.from({length:5},()=>new PokemonCardList());
    for(let n=0;n<8;n++)player.deck.cards.push(card('Psychic Energy SVE'));
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }
  const lightning=[card('Lightning Energy SVE'),card('Lightning Energy SVE')];
  source.active.cards.push(card('Voltorb ROS'),card('Electrode-GX CES'),...lightning);
  source.active.energies.cards.push(...lightning);
  defender.active.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
  defender.bench[0].cards.push(card('Duskull PRE'));
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=seat===0?[source,defender]:[defender,source];
  state.activePlayer=seat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,source,defender,lightning};
}

/**
 * Settle the real GX AttackAction and every native prompt. The payment
 * selections come from exact physical card indices, never phantom Energy.
 * @param {ReturnType<typeof stage>} game
 * @param {0|1|2} count
 */
function settle(game,count){
  game.store.dispatch(new AttackAction(game.source.id,'Crash and Burn-GX'));
  let paid=false;
  for(let step=0;step<25;step++){
    const prompt=game.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    if(prompt.constructor.name==='WaitPrompt'){
      game.store.dispatch(new ResolvePromptAction(prompt.id,null));
      continue;
    }
    assert.equal(prompt.constructor.name,'DiscardEnergyPrompt');
    assert.equal(paid,false,'GX card should create one payment prompt');
    assert.equal(prompt.playerId,game.source.id);
    paid=true;
    const chosen=[2,3].slice(0,count).map(index=>({
      from:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0},index
    }));
    const transfers=prompt.decode(chosen,game.state);
    assert.equal(prompt.validate(transfers),true,
      'selected physical Energy payment must validate');
    game.store.dispatch(new ResolvePromptAction(prompt.id,transfers));
  }
  assert.equal(paid,true);
  assert.equal(game.store.hasPrompts(),false);
  assert.equal(game.source.getPrizeLeft(),6);
  assert.equal(game.state.phase!==GamePhase.FINISHED,true);
  return game.defender.active.damage;
}

for(const seat of [0,1]){
  test('CES48 paper hook real Store seat '+seat+' two-Energy damage',()=>{
    const game=stage(seat);
    const observed=withElectrodeCrashBurnPaper(()=>settle(game,2));
    assert.equal(observed.result,130,'printed 30 + 2*50');
    assert.equal(game.source.usedGX,true);
    assert.equal(game.lightning.every(x=>game.source.discard.cards.includes(x)),true);
    assert.equal(observed.audit.version,VERSION);
    assert.equal(observed.audit.markedPrompts,1);
    assert.deepEqual(observed.audit.settled.map(row=>({
      count:row.count,removedExcess:row.removedExcess
    })),[{count:2,removedExcess:100}]);
    console.log('AGENT45_CES48_NATIVE_CORRECTED',JSON.stringify({
      seat,count:2,observedRaw:observed.result,printedRaw:130,
      selectedPhysicalDiscards:2,competitiveQualifiedGames:0
    }));
  });

  test('CES48 paper hook real Store seat '+seat+' zero-Energy GX usage',()=>{
    const game=stage(seat);
    const observed=withElectrodeCrashBurnPaper(()=>settle(game,0));
    assert.equal(observed.result,30,'printed zero-discard base damage');
    assert.equal(game.source.usedGX,true,
      'even a zero-payment attack consumes the GX privilege');
    assert.equal(game.lightning.every(x=>game.source.active.cards.includes(x)),true);
    assert.equal(observed.audit.markedPrompts,1);
    assert.equal(observed.audit.settled.length,1);
    assert.equal(observed.audit.settled[0].count,0);
    assert.equal(observed.audit.settled[0].removedExcess,0);
    console.log('AGENT45_CES48_NATIVE_ZERO',JSON.stringify({
      seat,count:0,observedRaw:observed.result,usedGX:game.source.usedGX,
      competitiveQualifiedGames:0
    }));
  });
}

const {withOwnerCes48GXPayment}=
  require('../simulation/twinleaf/agent45-owner-ces48-gx-payment.cjs');
const {SimpleTacticsAi}=
  native('simple-bot/simple-tactics-ai');

for(const seat of [0,1]){
 for(const count of [0,1,2]){
  test('owner-only CES48 native GX payment seat '+seat+' count '+count,()=>{
   const s=stage(seat);
   const remaining=30+50*count;
   const printedHp=s.defender.active.getPokemonCard().hp;
   s.defender.active.damage=printedHp-remaining;
   const bot=new SimpleTacticsAi({id:s.source.id},
     {tactics:[],promptResolvers:[]},null);
   const wrapped=withElectrodeCrashBurnPaper(()=>
     withOwnerCes48GXPayment(()=>{
      s.store.dispatch(new AttackAction(s.source.id,'Crash and Burn-GX'));
      for(let j=0;j<12;j++){
       const waiting=s.state.prompts.find(p=>p.result===undefined&&
         p.constructor.name==='WaitPrompt');
       if(!waiting)break;
       s.store.dispatch(new ResolvePromptAction(waiting.id,null));
      }
      const p=s.state.prompts.find(x=>x.result===undefined&&
        x.constructor.name==='DiscardEnergyPrompt');
      assert.ok(p,'Real GX payment must remain pending');
      const action=bot.resolvePrompt(s.source,s.state,p);
      assert.equal(action?.constructor.name,'ResolvePromptAction');
      assert.equal(action.result?.length,count);
      assert.equal(p.validate(action.result),true);
      s.store.dispatch(action);
      return {chosen:action.result.length,
        discarded:s.lightning.filter(card=>
          s.source.discard.cards.includes(card)).length,
        gxConsumed:s.source.usedGX};
     },{initialLiveStore:s.store}));
   assert.equal(wrapped.result.result.chosen,count);
   assert.equal(wrapped.result.result.discarded,count);
   assert.equal(wrapped.result.result.gxConsumed,true);
   assert.equal(wrapped.result.audit.selected,1);
   assert.equal(wrapped.result.audit.accepted,1);
   assert.equal(wrapped.result.audit.bySeat[seat],1);
   assert.equal(wrapped.audit.settled.length,1);
   assert.equal(wrapped.audit.settled[0].count,count);
   console.log('AGENT45_OWNER_CES48_NATIVE_GX_PAYMENT',JSON.stringify({
    seat,count,printedRaw:remaining,physicalDiscards:count,
    selected:1,accepted:1,competitiveQualifiedGames:0
   }));
  });
 }
}
