'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {installElectrodeGXEnergyHook}=
  require('../simulation/twinleaf/electrode-gx-energy-hook.cjs');

const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const native=p=>require(path.join(root,p));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {Format}=native('game/store/card/card-types');
const {UseAbilityAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
let serial=291100;

/**
 * One original-rank9 CES48 Ability opportunity: real evolved Electrode,
 * genuine Prism Energy from source discard, eligible source Mega Absol ex.
 * Source deck, hand and Prize zones are staged, not naturally dealt.
 * @param {0|1} sourceSeat
 * @param {1|3} availableEnergy
 */
function freshStore(sourceSeat,availableEnergy){
  const manager=initializeCards();
  /** @param {string} print */
  const card=print=>{
    const c=manager.getCardByName(print);
    assert.ok(c,'Missing pinned printed card '+print);
    c.id=serial++;
    return c;
  };
  const owner=new Player();
  const opponent=new Player();
  owner.id=2911;
  opponent.id=2912;
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  owner.active.cards.push(card('Mega Absol ex M1L'));
  owner.bench[0].cards.push(card('Voltorb ROS'),card('Electrode-GX CES'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  const energy=Array.from({length:availableEnergy},()=>card('Prism Energy ASC'));
  owner.discard.cards.push(...energy);
  for(const p of [owner,opponent]){
    for(let i=0;i<8;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    p.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=sourceSeat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=sourceSeat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,owner,opponent,energy};
}

/** @param {ReturnType<typeof freshStore>} s */
function openBomb(s){
  s.store.dispatch(new UseAbilityAction(s.owner.id,'Extra Energy Bomb',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  }));
  for(let i=0;i<8;i++){
    const wait=s.state.prompts.find(p=>
      p.result===undefined&&p.constructor.name==='WaitPrompt');
    if(!wait)break;
    s.store.dispatch(new ResolvePromptAction(wait.id,null));
  }
  const prompt=s.state.prompts.find(p=>
    p.result===undefined&&p.constructor.name==='AttachEnergyPrompt');
  assert.ok(prompt,'Native CES48 AttachEnergyPrompt required');
  assert.equal(prompt.playerId,s.owner.id);
  return prompt;
}

/** @param {ReturnType<typeof freshStore>} s */
function settleKo(s){
  for(let i=0;i<20;i++){
    const prompt=s.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    let reply;
    if(prompt.constructor.name==='WaitPrompt')reply=null;
    else if(prompt.constructor.name==='ChoosePrizePrompt'){
      assert.equal(prompt.playerId,s.opponent.id);
      reply=s.opponent.prizes.filter(p=>p.cards.length)
        .slice(0,prompt.options.count);
    }else if(prompt.constructor.name==='ShuffleDeckPrompt'){
      const p=s.state.players.find(x=>x.id===prompt.playerId);
      assert.ok(p);
      reply=Array.from({length:p.deck.cards.length},(_,i)=>i);
    }else throw new Error('Unexpected CES48 continuation '+prompt.constructor.name);
    assert.equal(prompt.validate(reply,s.state),true);
    s.store.dispatch(new ResolvePromptAction(prompt.id,reply));
  }
  assert.equal(s.state.prompts.some(p=>p.result===undefined),false);
  assert.equal(s.opponent.getPrizeLeft(),4);
  assert.equal(s.owner.bench[0].getPokemonCard(),undefined);
}

for(const seat of /** @type {const} */ ([0,1])){
  for(const count of /** @type {const} */ ([1,3])){
    test('Unmodified pinned CES48 permits empty Energy choice and self-KO, seat '+
      seat+' available '+count,()=>{
      // Isolated fresh Store. No invalid native action is attempted or caught.
      const s=freshStore(seat,count);
      const prompt=openBomb(s);
      assert.equal(prompt.options.min,0);
      assert.equal(prompt.validate([],s.state),true);
      s.store.dispatch(new ResolvePromptAction(prompt.id,[]));
      settleKo(s);
      assert.equal(s.owner.active.energies.cards.length,0);
      assert.equal(s.energy.every(c=>s.owner.discard.cards.includes(c)),true);
      console.log('AGENT29_CES48_EMPTY_NATIVE_SELFKO',JSON.stringify({
        seat,availableEnergy:count,attached:0,sourceEnergyStillDiscarded:count,
        opponentPrizesTaken:2,nativeAccepted:true,paperValid:false,
        competitivelyQualifiedGames:0
      }));
    });

    test('Opt-in paper hook requires all available Energy, seat '+
      seat+' available '+count,()=>{
      const restore=installElectrodeGXEnergyHook();
      try{
        // Fresh Store, separate from the native-invalid empty-selection state.
        const s=freshStore(seat,count);
        const prompt=openBomb(s);
        assert.equal(prompt.options.min,count);
        assert.equal(prompt.validate([],s.state),false,
          'Hook must reject an empty payment without dispatch');
        const to={player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.ACTIVE,index:0};
        const choice=prompt.decode(s.energy.map((_,index)=>({to,index})),s.state);
        assert.equal(prompt.validate(choice,s.state),true);
        s.store.dispatch(new ResolvePromptAction(prompt.id,choice));
        settleKo(s);
        assert.equal(s.owner.active.energies.cards.length,count);
        assert.equal(s.energy.every(c=>s.owner.active.energies.cards.includes(c)),true);
        assert.equal(s.energy.some(c=>s.owner.discard.cards.includes(c)),false);
        console.log('AGENT29_CES48_REQUIRED_NATIVE_PAYMENT',JSON.stringify({
          seat,availableEnergy:count,attached:count,opponentPrizesTaken:2,
          zeroPaymentRejectedBeforeDispatch:true,competitivelyQualifiedGames:0
        }));
      }finally{restore();}
    });
  }
}

/**
 * The actual stock SimpleTacticsAi prompt resolver also has a zero-card
 * candidate when min=0. This development probe observes which actual native
 * ResolvePromptAction it chooses after CES48 has already been activated.
 * It does not claim the stock bot would autonomously activate this Ability.
 */
function stockBotForOwner(ownerId){
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const definitions=native('simple-bot/simple-bot-definitions');
  const {BotFlipMode,BotShuffleMode}=native('game/bots/bot-arbiter');
  return new SimpleTacticsAi({id:ownerId},{
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:{flipMode:BotFlipMode.RANDOM,shuffleMode:BotShuffleMode.RANDOM}
  },null);
}

for(const seat of /** @type {const} */ ([0,1])){
  for(const count of /** @type {const} */ ([1,3])){
    test('Observe stock native CES48 prompt policy after activation, seat '+
      seat+' available '+count,()=>{
      const s=freshStore(seat,count);
      const prompt=openBomb(s);
      const bot=stockBotForOwner(s.owner.id);
      const action=bot.decodeNextAction(s.state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.ok(Array.isArray(action.result));
      const selected=action.result.length;
      assert.equal(prompt.validate(action.result,s.state),true);
      s.store.dispatch(action);
      settleKo(s);
      const attached=s.owner.active.energies.cards.filter(c=>
        s.energy.includes(c)).length;
      assert.equal(attached,selected);
      console.log('AGENT29_CES48_STOCK_PROMPT_POLICY',JSON.stringify({
        seat,availableEnergy:count,selected,attached,
        stockWouldSelectPaperInvalidZero:selected===0,
        opponentPrizesTaken:2,notAutonomousAbilityActivation:true,
        competitivelyQualifiedGames:0
      }));
    });
  }
}
