'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {publicCatalog}=require('../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs');
const {chooseGenericFundedFloatStone:choose,VERSION}=
  require('../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs');
const {chooseActorRootIntent}=require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=n=>require(path.join(root,n));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {Format}=native('game/store/card/card-types');
const {PlayCardAction,PlayerType,SlotType}=native('game/store/actions/play-card-action');
const {RetreatAction,AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {CheckRetreatCostEffect}=native('game/store/effects/check-effects');

/** One full pinned Store with physically owned hand, tools and Energy. */
function stage(seat,kind){
  const manager=initializeCards();
  let id=1400000+seat*100000+(kind==='absol'?1000:2000);
  const card=printing=>{
    const result=manager.getCardByName(printing);
    assert.ok(result,'Missing printed '+printing);
    result.id=id++;
    return result;
  };
  const owner=new Player(),foe=new Player();
  owner.id=414;foe.id=415;
  const absol=kind==='absol';
  const active=absol?'Mega Absol ex M1L':'Dedenne-GX UNB';
  const bench=absol?'Mega Absol ex M1L':"Lillie's Clefairy ex JTG";
  const energy=absol?'Darkness Energy MEE':'Psychic Energy MEE';
  owner.active.cards.push(card(active));
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  owner.bench[0].cards.push(card(bench));
  const attach=(slot,n)=>{
    for(let i=0;i<n;i++){
      const e=card(energy);
      slot.cards.push(e);slot.energies.cards.push(e);
    }
  };
  attach(owner.active,1);
  attach(owner.bench[0],absol?3:2);
  owner.hand.cards.push(card('Float Stone BKT'));
  foe.active.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
  foe.bench=Array.from({length:5},()=>new PokemonCardList());
  for(let i=0;i<3;i++)foe.bench[i].cards.push(card('Pidgey MEW'));
  for(const p of [owner,foe]){
    for(let j=0;j<10;j++)p.deck.cards.push(card('Psychic Energy MEE'));
    for(let j=0;j<6;j++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      p.prizes.push(prize);
    }
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,foe]:[foe,owner];
  state.activePlayer=seat;state.turn=11;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,owner,foe,seat,active,bench,kind};
}

for(const kind of ['absol','clefairy'])for(const seat of [0,1])
  test('native generic funded Float Stone '+kind+' seat '+seat,()=>{
    const x=stage(seat,kind),catalog=publicCatalog();
    const before=actorObservation(x.state,seat),first=choose(before,catalog);
    assert.equal(first?.kind,'attach-emergency-floatstone');
    assert.equal(first?.source,VERSION);
    assert.equal(first?.benchIndex,0);
    assert.equal(chooseActorRootIntent(before,catalog,
      {genericFundedFloatStoneRoot:true})?.kind,
      'attach-emergency-floatstone');
    const originalEnergy=x.owner.active.energies.cards[0];
    x.store.dispatch(new PlayCardAction(x.owner.id,first.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.equal(x.owner.hand.cards.length,0);
    assert.equal(x.owner.active.tools[0]?.fullName,'Float Stone BKT');
    const cost=new CheckRetreatCostEffect(x.owner);
    x.store.reduceEffect(x.state,cost);
    assert.equal(cost.cost.length,0);
    const afterTool=actorObservation(x.state,seat),next=choose(afterTool,catalog);
    assert.equal(next?.kind,'retreat-emergency-floatstone');
    assert.equal(chooseActorRootIntent(afterTool,catalog,
      {genericFundedFloatStoneRoot:true})?.kind,
      'retreat-emergency-floatstone');
    x.store.dispatch(new RetreatAction(x.owner.id,next.benchIndex));
    assert.equal(x.owner.active.getPokemonCard()?.fullName,x.bench);
    assert.equal(x.owner.bench[0].getPokemonCard()?.fullName,x.active);
    assert.equal(x.owner.bench[0].energies.cards[0],originalEnergy);
    assert.equal(x.owner.bench[0].tools[0]?.fullName,'Float Stone BKT');
    const beforeDamage=x.foe.active.damage;
    const attack=kind==='absol'?'Claw of Darkness':'Full Moon Rondo';
    x.store.dispatch(new AttackAction(x.owner.id,attack));
    if(kind==='clefairy'){
      for(let i=0;i<12;i++){
        const p=x.state.prompts.find(q=>q.result===undefined);
        if(!p)break;
        assert.equal(p.constructor.name,'WaitPrompt');
        x.store.dispatch(new ResolvePromptAction(p.id,null));
      }
      assert.equal(x.store.hasPrompts(),false);
    }
    const dealt=x.foe.active.damage-beforeDamage;
    assert.ok(dealt>=80);
    console.log('AGENT14_GENERIC_FUNDED_NATIVE',JSON.stringify({
      kind,seat,attack,damage:dealt,
      pending:x.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name),
      competitiveQualified:false
    }));
  });
