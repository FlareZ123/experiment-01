'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {
  shouldOfferHeldBenchMukShake,withApexBenchMukShake
}=require('../simulation/twinleaf/agent43-apex-bench-muk-shake-policy.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(output,name));

test('K0 selected candidate Shake root requires real own held/positioned pieces',()=>{
  const good={turn:1,activeName:'Regidrago V',
    benchNames:['Alolan Grimer'],handNames:['Boost Shake'],
    itemLocked:false,pending:false};
  assert.equal(shouldOfferHeldBenchMukShake(good),true);
  assert.equal(shouldOfferHeldBenchMukShake({...good,turn:2}),true);
  for(const bad of [
    {...good,turn:3},
    {...good,activeName:'Alolan Grimer'},
    {...good,benchNames:[]},
    {...good,handNames:[]},
    {...good,itemLocked:true},
    {...good,pending:true},
    {...good,benchNames:['Alolan Muk','Alolan Grimer']}
  ])assert.equal(shouldOfferHeldBenchMukShake(bad),false,JSON.stringify(bad));
});

/** @param {0|1} seat */
function staged(seat){
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const manager=initializeCards();
  let id=440100+seat*100;
  /** @param {string} name */
  function card(name){
    const c=manager.getCardByName(name);
    assert.ok(c,'Pinned native printing missing '+name);
    c.id=id++;
    return c;
  }
  const owner=new Player(),source=new Player();
  owner.id=seat===0?101:202;
  source.id=seat===0?202:101;
  owner.active.cards.push(card('Regidrago V SIT'));
  source.active.cards.push(card('Iron Thorns ex TWM'));
  const grimer=new PokemonCardList();
  grimer.cards.push(card('Alolan Grimer SUM'));
  grimer.pokemonPlayedTurn=1;
  owner.bench.push(grimer);
  const muk=card('Alolan Muk SUM');
  const shake=card('Boost Shake EVS');
  owner.deck.cards.push(muk);
  owner.hand.cards.push(shake);
  for(const p of [owner,source]){
    for(let i=0;i<12;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const state=new State(),settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.turn=1;state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.players=seat===0?[owner,source]:[source,owner];
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {store,owner,source,grimer,muk,shake,seat};
}

for(const seat of [0,1]){
  test('selected owner K0 Shake and genuine K1 Muk evolution seat '+seat,()=>{
    const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
    const defs=native('simple-bot/simple-bot-definitions');
    const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
    const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
    const {PlayCardAction}=native('game/store/actions/play-card-action');
    const {CheckPokemonPowersEffect}=native('game/store/effects/check-effects');
    const {store,owner,source,grimer,muk,shake}=staged(seat);
    const bot=new SimpleTacticsAi({id:owner.id},{
      tactics:defs.allSimpleTactics,
      promptResolvers:defs.allPromptResolvers,
      scores:defs.defaultStateScores,
      arbiter:defs.defaultArbiterOptions
    },null);
    const original=SimpleTacticsAi.prototype.decodeNextAction;
    const report=withApexBenchMukShake(()=>{
      const roots=[];
      // K0: owner sees held Boost Shake, Active Regidrago V, Bench Grimer.
      const first=bot.decodeNextAction(store.state);
      assert.ok(first instanceof PlayCardAction,
        'Actual AI must select an Item root, not theoretical access');
      roots.push(first.constructor.name);
      store.dispatch(first);
      // Owner-validated K1: native deck search and real owner Bench target.
      for(let i=0;i<3;i++){
        const action=bot.decodeNextAction(store.state);
        assert.ok(action instanceof ResolvePromptAction);
        roots.push(action.constructor.name);
        store.dispatch(action);
      }
      // Boost Shake ends the turn through native clock cleanup.
      for(let i=0;i<5;i++){
        const pending=store.state.prompts.find(p=>p.result===undefined);
        if(!pending)break;
        assert.equal(pending.constructor.name,'WaitPrompt');
        assert.equal(pending.validate(null,store.state),true);
        store.dispatch(new ResolvePromptAction(pending.id,null));
      }
      // Trigger audit's final observation only after opponent decision boundary.
      if(store.state.activePlayer!==seat)bot.decodeNextAction(store.state);
      const eggFree=muk.powers.find(x=>x.name==='Power of Alchemy');
      assert.ok(eggFree);
      const blockedBefore=Boolean(IS_ABILITY_BLOCKED(
        store,store.state,source,source.active.getPokemonCard(),
        source.active.getPokemonCard().powers.find(p=>p.name==='Initialization')
      ));
      const check=new CheckPokemonPowersEffect(source,source.active.getPokemonCard());
      store.reduceEffect(store.state,check);
      return {
        roots,boostShakeDiscarded:owner.discard.cards.includes(shake),
        mukFromDeck:!owner.deck.cards.includes(muk),
        evolvedGrimer:grimer.getPokemonCard()===muk,
        sourceInitBlocked:blockedBefore,
        sourceInitVisible:check.powers.some(p=>p.name==='Initialization'),
        turnAfter:store.state.turn,
        seatAfter:store.state.activePlayer,
        unhandled:store.state.prompts.filter(p=>p.result===undefined)
          .map(p=>p.constructor.name)
      };
    });
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,original);
    console.log('AGENT43_SELECTED_BENCH_SHAKE',JSON.stringify({seat,...report}));
    assert.equal(report.audit.roots.length,1);
    assert.equal(report.audit.roots[0].seat,seat);
    assert.deepEqual(report.audit.prompts.map(p=>p.kind),[
      'owner-deck-Muk-K1','owner-Bench-Grimer-evolution','owner-shuffle'
    ]);
    assert.deepEqual(report.audit.failures,[]);
    assert.equal(report.result.boostShakeDiscarded,true);
    assert.equal(report.result.mukFromDeck,true);
    assert.equal(report.result.evolvedGrimer,true);
    assert.equal(report.result.sourceInitBlocked,true);
    assert.equal(report.result.sourceInitVisible,false);
    assert.equal(report.result.turnAfter,2);
    assert.equal(report.result.seatAfter,1-seat);
    assert.deepEqual(report.result.unhandled,[]);
    assert.equal(report.audit.qualifiedGames,0);
  });
}
