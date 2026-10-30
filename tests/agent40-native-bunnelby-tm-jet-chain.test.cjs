'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stageSourceBunnelbyBoard}=
  require('../simulation/twinleaf/bunnelby-tm-policy-replay.cjs');
const {initializeCards,seededRandom,deckPermutation}=
  require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {withToolAttackAwareness}=
  require('../simulation/twinleaf/tool-attack-policy.cjs');
const {withBunnelbyEvolutionLine}=
  require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');
const {resolveManifestFile}=
  require('../simulation/twinleaf/resolve-field.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(OUTPUT,p));
const TM='Technical Machine: Evolution PAR';
const JET='Jet Energy PAL';

function staged(seat){
  const {fixture:f}=stageSourceBunnelbyBoard();
  const manager=initializeCards();
  const {PokemonCardList}=
    native('game/store/state/pokemon-card-list');
  const attacker=f.attacker;
  const bunnelby=attacker.active.getPokemonCard();
  const jet=attacker.active.energies.cards[0];
  const tool=attacker.active.tools[0];
  assert.equal(bunnelby.fullName,'Bunnelby PRC');
  assert.equal(jet.fullName,JET);
  assert.equal(tool.fullName,TM);
  const dratini=manager.getCardByName('Dratini OBF');
  assert.ok(dratini);
  dratini.id=10001+seat;
  attacker.active.cards.length=0;
  attacker.active.cards.push(dratini);
  attacker.active.energies.cards.length=0;
  attacker.active.tools.length=0;
  const bench=new PokemonCardList();
  bench.cards.push(bunnelby);
  attacker.bench.push(bench);
  const bunnelbyIndex=attacker.bench.length-1;
  attacker.hand.cards.length=0;
  attacker.hand.cards.push(jet,tool);
  const state=f.store.state;
  if(seat===1)
    state.players=[f.defender,f.attacker];
  state.activePlayer=seat;
  state.turn=2;
  const types={
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType
  };
  const catalog=buildActorCardCatalog(manager.getAllCards(),types);
  const all=resolveManifestFile(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const sourceSixty=all.decks.find(x=>x.rank===2)?.cardIds;
  assert.equal(sourceSixty?.length,60,
    'Exact original rank2 source required for K0-safe line');
  const sourceCards=sourceSixty.map(name=>manager.getCardByName(name));
  assert.ok(sourceCards.every(Boolean));
  return {f,state,catalog,sourceSixty,sourceCards,seat,
    bunnelbyIndex,attacker};
}
const options=x=>({
  bunnelbyTmJetRoot:true,ownRegisteredSixty:x.sourceSixty
});

for(const seat of [0,1]){
  test('genuine original rank2 Bunnelby Jet/TM source line on seat '+seat,()=>{
    const x=staged(seat),{attacker,state,catalog,f}=x;
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const {AttackAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    const choose=()=>chooseActorRootIntent(actorObservation(state,seat),
      catalog,options(x));

    const first=choose();
    assert.equal(first.kind,'equip-bunnelby-tm');
    assert.equal(first.slot,'bench');
    assert.equal(first.index,x.bunnelbyIndex);
    assert.equal(attacker.hand.cards[first.handIndex].fullName,TM);
    f.store.dispatch(new PlayCardAction(attacker.id,first.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
      index:first.index
    }));
    assert.equal(attacker.bench[x.bunnelbyIndex].tools[0]?.fullName,TM);
    assert.equal(attacker.hand.cards.includes(attacker.bench[x.bunnelbyIndex].tools[0]),false);

    const second=choose();
    assert.equal(second.kind,'attach-special-energy');
    assert.equal(second.slot,'bench');
    assert.equal(second.index,x.bunnelbyIndex);
    assert.equal(attacker.hand.cards[second.handIndex]?.fullName,JET);
    f.store.dispatch(new PlayCardAction(attacker.id,second.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
      index:second.index
    }));
    assert.equal(attacker.active.getPokemonCard()?.fullName,'Bunnelby PRC');
    assert.equal(attacker.active.tools[0]?.fullName,TM);
    assert.equal(attacker.active.energies.cards[0]?.fullName,JET);
    assert.equal(attacker.bench[x.bunnelbyIndex].getPokemonCard()?.fullName,
      'Dratini OBF');

    const third=choose();
    assert.equal(third.kind,'attack');
    assert.equal(third.attackName,'Evolution');
    f.store.dispatch(new AttackAction(attacker.id,third.attackName));

    const defs=native('simple-bot/simple-bot-definitions');
    const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
    const bot=new SimpleTacticsAi({id:attacker.id},
      withBunnelbyEvolutionLine(withToolAttackAwareness({
        tactics:defs.allSimpleTactics,
        promptResolvers:defs.allPromptResolvers,
        scores:defs.defaultStateScores,
        arbiter:defs.defaultArbiterOptions
      }),{sourceCards:x.sourceCards,targetAwareEvolution:true}),null);
    const promptKinds=[];
    let secondAttack=null;
    for(let i=0;i<60;i++){
      const prompt=state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      const kind=prompt.constructor.name;
      const action=kind==='ShuffleDeckPrompt'?
        new ResolvePromptAction(prompt.id,
          deckPermutation(attacker.deck.cards.length,
            seededRandom(20261030+seat+i))):
        bot.decodeNextAction(state);
      assert.ok(action,'Native bot left unresolved '+kind);
      if(kind==='ChooseAttackPrompt')secondAttack=action.result?.name;
      promptKinds.push(kind);
      f.store.dispatch(action);
    }
    assert.equal(f.store.hasPrompts(),false);
    assert.equal(secondAttack,'Evolution');
    assert.deepEqual(attacker.bench.slice(0,2).map(slot=>
      slot.getPokemonCard()?.name),['Vileplume','Pidgeot ex']);
    assert.equal(state.activePlayer,1-seat,
      'Double TM Evolution must finish and pass turn to opponent');
    console.log('AGENT40_NATIVE_BUNNELBY_TM_JET',JSON.stringify({
      seat,firstKind:first.kind,secondKind:second.kind,
      promoted:attacker.active.getPokemonCard().fullName,
      declaredAttack:third.attackName,secondAttack,finalBench:
        attacker.bench.map(slot=>slot.getPokemonCard()?.name??null),
      promptKinds,competitiveQualifiedGames:0
    }));
  });
}
