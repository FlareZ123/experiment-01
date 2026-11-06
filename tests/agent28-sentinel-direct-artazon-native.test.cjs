'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stageSourceBunnelbyBoard}=
  require('../simulation/twinleaf/bunnelby-tm-policy-replay.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const sentinel=require('../results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json');
const {withToolAttackAwareness}=
  require('../simulation/twinleaf/tool-attack-policy.cjs');
const {withBunnelbyEvolutionLine}=
  require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');
const {withBunnelbyBarrageConsent}=
  require('../simulation/twinleaf/agent40-bunnelby-barrage-consent.cjs');

const OUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative */
const native=relative=>require(path.join(OUT,relative));
const TM='Technical Machine: Evolution PAR';
const JET='Jet Energy PAL';
const ART='Artazon PAL';
const BUN='Bunnelby PRC';
const FAN='Fan Rotom SCR';

/**
 * Conditioned seven/seven-after-draw opening, six real Prize cards and
 * 46 remaining source cards. All 60 come from unchanged printed Sentinel v1.
 * Fan Rotom is Prized, and both Bunnelby copies begin in the deck.
 * @param {0|1} seat
 */
function stage(seat){
  const {fixture:f}=stageSourceBunnelbyBoard();
  const plan=planAichi(sentinel,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const sourceSixty=plan.candidate.cards;
  assert.equal(sourceSixty.length,60,'Resolve exactly unchanged Sentinel 60');
  const manager=initializeCards();
  const stock=sourceSixty.map((fullName,i)=>{
    const card=manager.getCardByName(fullName);
    assert.ok(card,'Unresolved pinned printing '+fullName);
    card.id=928000+i+1000*seat;
    return card;
  });
  /** @param {string} name */
  const take=name=>{
    const index=stock.findIndex(c=>c.name===name);
    assert.ok(index>=0,'Unavailable Sentinel printed card: '+name);
    return stock.splice(index,1)[0];
  };

  const initialActive=take('Oddish');
  // Original seven: Oddish (Active), then G&H, Guzma, Karen, Lillie,
  // Buneary, Stealthy Hood. The Pidgey is the turn draw.
  const held=['Guzma & Hala','Guzma','Karen',
    "Lillie's Determination",'Buneary','Stealthy Hood','Pidgey'].map(take);
  const prizes=['Fan Rotom','Grand Tree','Counter Gain',
    'Lusamine','Plumeria','Pokémon Ranger'].map(take);
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const owner=f.attacker,state=f.store.state;
  owner.active.cards.splice(0,owner.active.cards.length,initialActive);
  owner.active.energies.cards.length=0;
  owner.active.tools.length=0;
  owner.bench.splice(0,owner.bench.length,
    ...Array.from({length:5},()=>new PokemonCardList()));
  owner.hand.cards.splice(0,owner.hand.cards.length,...held);
  owner.deck.cards.splice(0,owner.deck.cards.length,...stock);
  owner.discard.cards.length=0;
  owner.lostzone.cards.length=0;
  owner.prizes=prizes.map(card=>{
    const slot=new CardList();slot.cards.push(card);return slot;
  });
  if(seat===1)state.players=[f.defender,owner];
  state.activePlayer=seat;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  const all=[...owner.active.cards,...owner.hand.cards,...owner.deck.cards,
    ...owner.discard.cards,...owner.lostzone.cards,
    ...owner.prizes.flatMap(z=>z.cards),
    ...owner.bench.flatMap(z=>z.cards)];
  assert.equal(all.length,60);
  assert.equal(owner.deck.cards.length,46);
  assert.deepEqual(all.map(c=>c.fullName).sort(),sourceSixty.slice().sort());
  assert.equal(owner.prizes.some(z=>z.cards[0]?.fullName===FAN),true);
  assert.equal(owner.deck.cards.filter(c=>c.fullName===BUN).length,2);
  assert.equal(owner.hand.cards.filter(c=>c.fullName===BUN).length,0);
  assert.equal(owner.active.getPokemonCard()?.fullName,'Oddish UNB');
  return {f,owner,state,seat,sourceSixty,manager};
}

/** @param {ReturnType<typeof stage>} x */
function routine(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const names=[];
  for(let n=0;n<40;n++){
    const p=x.state.prompts.find(a=>a.result===undefined);
    if(!p)return names;
    const kind=p.constructor.name;
    const result=kind==='ShuffleDeckPrompt'?
      x.owner.deck.cards.map((_,i)=>i):
      kind==='WaitPrompt'?null:
      kind==='ShowCardsPrompt'?true:undefined;
    assert.notEqual(result,undefined,'Unexpected live native prompt '+kind);
    names.push(kind);
    x.f.store.dispatch(new ResolvePromptAction(p.id,result));
  }
  assert.fail('Unresolved non-discretionary prompt overflow');
}

/** @param {ReturnType<typeof stage>} x @param {string} name */
function playBoard(x,name){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const index=x.owner.hand.cards.findIndex(c=>c.name===name);
  assert.ok(index>=0);
  x.f.store.dispatch(new PlayCardAction(x.owner.id,index,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
}

/** @param {ReturnType<typeof stage>} x @param {string[]} names */
function chooseDeck(x,names){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const prompt=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'ChooseCardsPrompt');
  assert.equal(prompt.cards,x.owner.deck);
  const cards=names.map(name=>{
    const card=x.owner.deck.cards.find(c=>c.fullName===name);
    assert.ok(card,'Missing searchable '+name);return card;
  });
  assert.equal(prompt.validate(cards,x.state),true);
  x.f.store.dispatch(new ResolvePromptAction(prompt.id,cards));
}

/** @param {ReturnType<typeof stage>} x */
function ghala(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  playBoard(x,'Guzma & Hala');
  let prompt=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'SelectOptionPrompt');
  x.f.store.dispatch(new ResolvePromptAction(prompt.id,1));
  prompt=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'ChooseCardsPrompt');
  assert.equal(prompt.cards,x.owner.hand);
  const discards=['Guzma BUS','Karen XYP'].map(n=>{
    const c=x.owner.hand.cards.find(t=>t.fullName===n);
    assert.ok(c,'Missing paper-paid discard '+n);return c;
  });
  assert.equal(prompt.validate(discards,x.state),true);
  x.f.store.dispatch(new ResolvePromptAction(prompt.id,discards));
  chooseDeck(x,[ART,TM,JET]);
  const follow=routine(x);
  assert.equal(x.owner.supporterTurn>0,true);
  for(const card of discards)assert.ok(x.owner.discard.cards.includes(card));
  for(const card of [ART,TM,JET])
    assert.ok(x.owner.hand.cards.some(c=>c.fullName===card));
  return follow;
}

/** @param {ReturnType<typeof stage>} x */
function evolveTwice(x){
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const defs=native('simple-bot/simple-bot-definitions');
  const sourceCards=x.sourceSixty.map(name=>{
    const card=x.manager.getCardByName(name);assert.ok(card);return card;
  });
  const config=withBunnelbyBarrageConsent(withBunnelbyEvolutionLine(
    withToolAttackAwareness({
      tactics:defs.allSimpleTactics,
      promptResolvers:defs.allPromptResolvers,
      scores:defs.defaultStateScores,
      arbiter:defs.defaultArbiterOptions
    }),{sourceCards,targetAwareEvolution:true}),sourceCards);
  const bot=new SimpleTacticsAi({id:x.owner.id},config,null);
  x.f.store.dispatch(new AttackAction(x.owner.id,'Evolution'));
  const kinds=[];
  let attackCount=1;
  for(let i=0;i<90;i++){
    const pending=x.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    const kind=pending.constructor.name;
    const action=kind==='WaitPrompt'?
      new ResolvePromptAction(pending.id,null):
      kind==='ShuffleDeckPrompt'?
        new ResolvePromptAction(pending.id,
          x.owner.deck.cards.map((_,j)=>j)):
        bot.decodeNextAction(x.state);
    assert.ok(action,'No native resolution for '+kind);
    if(kind==='ChooseAttackPrompt'){
      assert.equal(action.result?.name,'Evolution');
      attackCount++;
    }
    kinds.push(kind);
    x.f.store.dispatch(action);
  }
  assert.equal(x.f.store.hasPrompts(),false);
  return {kinds,attackCount};
}

for(const seat of [0,1]){
  test('Fan-prized Sentinel G&H Artazon directly benches Bunnelby, Jet to Active, double TM to Vileplume: seat '+seat,()=>{
    const x=stage(seat);
    const beforeB=x.owner.deck.cards.filter(c=>c.fullName===BUN).length;
    const gh=ghala(x);
    playBoard(x,'Artazon');
    const stadiumPrompts=routine(x);
    assert.ok(x.owner.stadium.cards.some(c=>c.fullName===ART));
    const {UseStadiumAction}=native('game/store/actions/game-actions');
    x.f.store.dispatch(new UseStadiumAction(x.owner.id));
    chooseDeck(x,[BUN]);
    const searchPrompts=routine(x);
    assert.equal(beforeB,2);
    const bIndex=x.owner.bench.findIndex(b=>b.getPokemonCard()?.fullName===BUN);
    assert.ok(bIndex>=0);
    assert.equal(x.owner.deck.cards.filter(c=>c.fullName===BUN).length,1);
    assert.equal(x.owner.active.getPokemonCard()?.fullName,'Oddish UNB');

    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const tmIndex=x.owner.hand.cards.findIndex(c=>c.fullName===TM);
    assert.ok(tmIndex>=0);
    x.f.store.dispatch(new PlayCardAction(x.owner.id,tmIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:bIndex
    }));
    const toolPrompts=routine(x);
    assert.equal(x.owner.bench[bIndex].tools[0]?.fullName,TM);

    const jetIndex=x.owner.hand.cards.findIndex(c=>c.fullName===JET);
    assert.ok(jetIndex>=0);
    x.f.store.dispatch(new PlayCardAction(x.owner.id,jetIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:bIndex
    }));
    const jetPrompts=routine(x);
    assert.equal(x.owner.active.getPokemonCard()?.fullName,BUN);
    assert.equal(x.owner.active.tools[0]?.fullName,TM);
    assert.equal(x.owner.active.energies.cards[0]?.fullName,JET);
    assert.ok(x.owner.bench.some(b=>
      b.getPokemonCard()?.fullName==='Oddish UNB'));

    const two=evolveTwice(x);
    const benched=x.owner.bench.map(b=>b.getPokemonCard()?.fullName)
      .filter(Boolean);
    assert.ok(two.kinds.includes('ConfirmPrompt'));
    assert.ok(two.kinds.includes('ChooseAttackPrompt'));
    assert.equal(two.attackCount,2);
    assert.ok(benched.includes('Vileplume AOR'),
      'Second Evolution must reach original printed Irritating Pollen');
    assert.equal(x.state.activePlayer,1-seat);

    // An actual original-rank1 opponent Item must fail under the live lock.
    const opponent=x.f.defender;
    const fog=opponent.hand.cards.find(c=>c.fullName==='Fog Crystal CRE')??
      opponent.deck.cards.find(c=>c.fullName==='Fog Crystal CRE');
    assert.ok(fog);
    if(!opponent.hand.cards.includes(fog)){
      opponent.deck.cards.splice(opponent.deck.cards.indexOf(fog),1);
      opponent.hand.cards.push(fog);
    }
    const fogIndex=opponent.hand.cards.indexOf(fog);
    const oldHand=opponent.hand.cards.slice();
    assert.throws(()=>x.f.store.dispatch(new PlayCardAction(
      opponent.id,fogIndex,{player:PlayerType.ANY,
        slot:SlotType.BOARD,index:0})),e=>e?.message==='CANNOT_PLAY_THIS_CARD');
    assert.deepEqual(opponent.hand.cards,oldHand);

    console.log('AGENT28_DIRECT_ARTAZON_NATIVE',JSON.stringify({
      seat,sourceCards:60,fanPrized:true,bunnelbyBefore:beforeB,
      afterArtazonRemainingB:1,ghPaidDiscard:['Guzma BUS','Karen XYP'],
      supporter:gh,stadiumPrompts,searchPrompts,toolPrompts,jetPrompts,
      actualActive:BUN,actualEnergy:JET,actualTool:TM,
      attacks:two.attackCount,attackPrompts:two.kinds,
      benched,opponentItemVeto:'Fog Crystal CRE',competitiveGames:0
    }));
  });
}
