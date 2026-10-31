'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {collectSoloBenchChoice}=
  require('../simulation/twinleaf/agent14-owner-solo-bench-choice-contract.cjs');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const native=p=>require(path.join(output,p));

/** @param {0|1} seat @returns {object} Native original-printing Store. */
function staged(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  let id=150000;
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Missing native printing '+name);
    found.id=id++;return found;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=131;opponent.id=242;
  owner.active.cards.push(card('Iron Thorns ex TWM'));
  const dce=card('Double Colorless Energy SUM');
  owner.active.cards.push(dce);
  owner.active.energies.cards.push(dce);
  owner.hand.cards.push(card('Iron Thorns ex TWM'));
  owner.stadium.cards.push(card('Thunder Mountain Prism Star LOT'));
  opponent.active.cards.push(card('Dialga-GX UPR'));
  for(const p of [owner,opponent]){
    for(let i=0;i<5;i++)p.bench.push(new PokemonCardList());
    for(let i=0;i<10;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;state.gameSettings.format=Format.EXPANDED;
  const types={
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType
  };
  const catalog=buildActorCardCatalog(manager.getAllCards(),types);
  const view=actorObservation(state,seat);
  const receipt=collectSoloBenchChoice(view,catalog,chooseActorRootIntent,{
    thornsSoloEnergyRetention:true,thornsDirectLine:true});
  assert.deepEqual(receipt?.alternatives.map(x=>x.intent.kind),
    ['bench-basic','attack']);
  assert.deepEqual(receipt.chosen,{kind:'attack',attackName:'Volt Cyclone'});
  return {store,state,owner,opponent,seat,receipt};
}

test('same native owner view gives genuinely accepted Bench or solo attack in both seats',()=>{
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  for(const seat of [0,1]){
    const baseline=staged(seat);
    baseline.store.dispatch(new PlayCardAction(baseline.owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0}));
    assert.equal(baseline.owner.hand.cards.length,0);
    assert.equal(baseline.owner.bench[0].getPokemonCard()?.fullName,
      'Iron Thorns ex TWM');
    // Settle the baseline's mandatory Volt Cyclone recipient on the genuine
    // pinned Store as a separate identical setup, not an invented payoff.
    const baselineStartDamage=baseline.opponent.active.damage;
    baseline.store.dispatch(new AttackAction(baseline.owner.id,'Volt Cyclone'));
    const baselinePrompts=[];
    for(let i=0;i<15;i++){
      const pending=baseline.state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      baselinePrompts.push(pending.constructor.name);
      const response=pending.constructor.name==='WaitPrompt'?null:
        pending.constructor.name==='AttachEnergyPrompt'?[{
          to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0},
          card:baseline.owner.active.energies.cards[0]
        }]:undefined;
      assert.notEqual(response,undefined,
        'Unsupported native baseline prompt '+pending.constructor.name);
      if(pending.constructor.name==='AttachEnergyPrompt')
        assert.equal(pending.validate(response),true);
      baseline.store.dispatch(new ResolvePromptAction(pending.id,response));
    }
    assert.equal(baseline.store.hasPrompts(),false);
    assert.equal(baseline.opponent.active.damage-baselineStartDamage,140);
    assert.equal(baseline.owner.active.energies.cards.length,0);
    assert.deepEqual(baseline.owner.bench[0].energies.cards.map(c=>c.fullName),
      ['Double Colorless Energy SUM']);
    const treatment=staged(seat),{store,state,owner,opponent,receipt}=treatment;
    const before=opponent.active.damage;
    store.dispatch(new AttackAction(owner.id,receipt.chosen.attackName));
    const prompts=[];
    for(let i=0;i<15;i++){
      const pending=state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      prompts.push(pending.constructor.name);
      assert.equal(pending.constructor.name,'WaitPrompt');
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(store.hasPrompts(),false);
    assert.equal(opponent.active.damage-before,140);
    assert.deepEqual(owner.active.energies.cards.map(c=>c.fullName),
      ['Double Colorless Energy SUM']);
    assert.equal(owner.bench.filter(p=>p.getPokemonCard()).length,0);
    assert.equal(owner.hand.cards[0].fullName,'Iron Thorns ex TWM');
    process.stdout.write('# AGENT14_NATIVE_CHOICE '+JSON.stringify({
      seat,control:'native-bench-and-attack-energy-moved',
      treatment:'native-solo-attack-energy-retained',
      damage:140,controlDceOnBench:true,energyRetained:true,
      publicBenchCount:0,prompts,baselinePrompts,
      competitiveQualified:false})+'\n');
  }
});
