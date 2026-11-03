'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const native=name=>require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {Format}=native('game/store/card/card-types');
const {AttackAction}=native('game/store/actions/game-actions');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');

const original=planAichi(26,{
  allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
}).candidate.cards;
assert.equal(original.length,60);
let id=80000;

/**
 * Physical first-turn state reached only conditionally after five source
 * Exeggcute KOs, not a natural shuffled source game.
 * @param {0|1} seat
 */
function stage(seat){
  const manager=initializeCards();
  const cardBySourcePrefix=prefix=>{
    const ids=[...new Set(original.filter(name=>name.startsWith(prefix+' ')))];
    assert.equal(ids.length,1,'exact original source printing '+prefix);
    const c=manager.getCardByName(ids[0]);
    assert.ok(c);c.id=id++;return c;
  };
  const normalCard=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,name);c.id=id++;return c;
  };
  const source=new Player(),opponent=new Player();
  source.id=101;opponent.id=202;
  source.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  const melo=cardBySourcePrefix('Meloetta ex');
  const lightning=cardBySourcePrefix('Lightning Energy');
  const dce=cardBySourcePrefix('Double Colorless Energy');
  const tool=cardBySourcePrefix('Technical Machine: Crisis Punch');
  source.active.cards.push(melo);
  source.active.energies.cards.push(lightning);
  source.hand.cards.push(dce); // Perform actual legal manual attachment below.
  source.active.tools.push(tool);
  source.bench[0].cards.push(cardBySourcePrefix('Squawkabilly ex'));
  const defending=normalCard('Shadow Rider Calyrex V CRE');
  opponent.active.cards.push(defending);
  for(const p of [source,opponent]){
    for(let j=0;j<6;j++){
      const q=new CardList();
      if(p===source||j===0)q.cards.push(normalCard('Psychic Energy SVE'));
      p.prizes.push(q);
    }
    for(let i=0;i<8;i++)p.deck.cards.push(normalCard('Psychic Energy SVE'));
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[source,opponent]:[opponent,source];
  state.activePlayer=seat;state.turn=1;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {source,opponent,melo,lightning,dce,tool,defending,store,state,seat};
}

for(const seat of [0,1]){
  test('original Meloetta first global turn Tool Crisis Punch native seat '+seat,()=>{
    const x=stage(seat);
    const initial={
      globalTurn:x.state.turn,
      sourceActive:x.source.active.getPokemonCard()?.fullName,
      opponentActive:x.opponent.active.getPokemonCard()?.fullName,
      sourceEnergy:x.source.active.energies.cards.map(c=>c.fullName),
      sourceTool:x.source.active.tools.map(c=>c.fullName),
      opponentPrizes:x.opponent.getPrizeLeft(),
      opponentBenchCount:x.opponent.bench.filter(s=>s.getPokemonCard()).length,
      sourceAbility:x.melo.powers?.map(p=>p.name)
    };
    assert.equal(x.opponent.getPrizeLeft(),1);
    const printedAbility=x.melo.powers?.some(p=>p.name==='Debut Performance')===true;
    const toolHasAttack=x.tool.attacks?.some(a=>a.name==='Crisis Punch')===true;
    console.log('AGENT50_MELOETTA_NATIVE_PRINT',
      JSON.stringify({seat,meloName:x.melo.fullName,
        powers:x.melo.powers?.map(p=>p.name),
        baseAttacks:x.melo.attacks?.map(a=>a.name),
        toolName:x.tool.fullName,toolAttacks:x.tool.attacks?.map(a=>a.name),
        printedAbility,toolHasAttack}));
    assert.equal(toolHasAttack,true,'original printed TM must expose Crisis Punch');
    const energyHandIndex=x.source.hand.cards.indexOf(x.dce);
    assert.ok(energyHandIndex>=0);
    x.store.dispatch(new PlayCardAction(x.source.id,energyHandIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.ok(x.source.active.energies.cards.includes(x.dce),
      'normal DCE attachment must settle before the attack');
    const attackAction=new AttackAction(x.source.id,'Crisis Punch');
    console.log('AGENT50_MELOETTA_ATTACK_PRESTATE',JSON.stringify({
      seat,initial,
      actionKeys:Object.keys(attackAction),
      actionCtor:String(AttackAction).slice(0,1100),
      dceProvides:x.dce.provides,
      lightningProvides:x.lightning.provides,
      activeCardIds:x.source.active.cards.map(c=>c.fullName),
      activeEnergyCards:x.source.active.energies.cards.map(c=>c.fullName),
      toolAttached:x.source.active.tools.includes(x.tool),
      nativeAttack:x.tool.attacks?.find(a=>a.name==='Crisis Punch')
    }));
    x.store.dispatch(attackAction);
    const promptKinds=[];
    for(let i=0;i<20;i++){
      const p=x.state.prompts.find(p=>p.result===undefined);
      if(!p)break;
      promptKinds.push(p.constructor.name);
      if(p.constructor.name==='WaitPrompt'){
        x.store.dispatch(new ResolvePromptAction(p.id,null));
      }else if(p.constructor.name==='ChoosePrizePrompt'){
        assert.equal(p.playerId,x.source.id,
          'opposing Active KO must award owner a source Prize');
        const physical=x.source.prizes.filter(slot=>slot.cards.length>0)
          .slice(0,Math.min(p.options.count,x.source.getPrizeLeft()));
        assert.equal(p.validate(physical,x.state),true);
        x.store.dispatch(new ResolvePromptAction(p.id,physical));
      }else break;
    }
    const out={
      seat,initial,after:{opponentDamage:x.opponent.active.damage,
        opponentActive:x.opponent.active.getPokemonCard()?.fullName??null,
        opponentLostAllPokemon:![x.opponent.active.getPokemonCard()]&&
          !x.opponent.bench.some(s=>s.getPokemonCard()),
        sourcePrizeLeft:x.source.getPrizeLeft(),
        opponentPrizeLeft:x.opponent.getPrizeLeft(),
        phase:x.state.phase,turn:x.state.turn,
        pending:x.state.prompts.filter(p=>p.result===undefined)
          .map(p=>p.constructor.name),
        promptKinds,sourceDiscardNames:x.source.discard.cards.map(c=>c.fullName)
      },
      evidence:'staged physical firstturn native original card interactions; no competitive games'
    };
    console.log('AGENT50_MELOETTA_TOOL_NATIVE',JSON.stringify(out));
    assert.ok(x.opponent.active.damage>=210 ||
      x.opponent.active.getPokemonCard()===undefined,
      'original first-turn Crisis Punch should damage 210-HP unlocked lone Active');
  });
}
