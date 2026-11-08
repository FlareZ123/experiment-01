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
  // Prospective staged original rank1 reply: it already has a Bench Mimikyu
  // and holds an authentic Guzma, preserving all 60 real opponent cards.
  // This is explicitly a conditioned counterfactual, not opponent bot play.
  const opponent=f.defender;
  const mimikyuIndex=opponent.deck.cards.findIndex(a=>
    a.fullName==='Mimikyu GRI');
  assert.ok(mimikyuIndex>=0);
  const slot=new PokemonCardList();
  slot.cards.push(opponent.deck.cards.splice(mimikyuIndex,1)[0]);
  opponent.bench.push(slot);
  for(const name of ['Guzma BUS','Fog Crystal CRE']){
    if(opponent.hand.cards.some(a=>a.fullName===name))continue;
    const idx=opponent.deck.cards.findIndex(a=>a.fullName===name);
    assert.ok(idx>=0,'Original rank1 has '+name);
    const heldCard=opponent.deck.cards.splice(idx,1)[0];
    const exchanged=opponent.hand.cards.shift();
    assert.ok(exchanged);
    opponent.deck.cards.push(exchanged);
    opponent.hand.cards.push(heldCard);
  }
  const opponentPhysical=[...opponent.active.cards,
    ...opponent.bench.flatMap(s=>s.cards),...opponent.hand.cards,
    ...opponent.deck.cards,...opponent.discard.cards,
    ...opponent.prizes.flatMap(z=>z.cards)];
  assert.equal(opponentPhysical.length,60,
    'Every original rank1 card still occupies one physical zone');

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

/** Run the complete two-attack, source-paid Sentinel lock opener. */
function establishSentinelLock(x){
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
  assert.equal(x.state.activePlayer,1-x.seat);

  return {beforeB,gh,stadiumPrompts,searchPrompts,toolPrompts,
    jetPrompts,two,benched,PlayCardAction,PlayerType,SlotType};
}

/** Resolve an original rank1 own-hand Guzma plus both genuine Pokemon prompts. */
function resolveRank1Guzma(x){
  const seat=x.seat;
  const opponent=x.f.defender;
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  // The original opponent's legal Supporter remains usable under Item lock:
  // true native Guzma prompts promote Vileplume and own Benched Mimikyu.
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {nativeSinglePokemonChoices}=
    require('../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');
  const handGuzma=opponent.hand.cards.findIndex(c=>
    c.fullName==='Guzma BUS');
  assert.ok(handGuzma>=0);
  console.log('AGENT28_PRE_GUZMA',JSON.stringify({
    seat,turn:x.state.turn,phase:x.state.phase,activePlayer:x.state.activePlayer,
    opponentSupporterTurn:opponent.supporterTurn,
    opponentSupporterZone:opponent.supporter.cards.length,
    sourceBench:x.owner.bench.map(b=>b.getPokemonCard()?.fullName).filter(Boolean),
    opponentBench:opponent.bench.map(b=>b.getPokemonCard()?.fullName).filter(Boolean)
  }));
  x.f.store.dispatch(new PlayCardAction(opponent.id,handGuzma,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  console.log('AGENT28_POST_GUZMA',JSON.stringify({
    seat,turn:x.state.turn,phase:x.state.phase,
    opponentSupporterTurn:opponent.supporterTurn,
    cardInHand:opponent.hand.cards.some(c=>c.fullName==='Guzma BUS'),
    cardInSupporter:opponent.supporter.cards.some(c=>c.fullName==='Guzma BUS'),
    cardInDiscard:opponent.discard.cards.some(c=>c.fullName==='Guzma BUS'),
    prompts:x.state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name)
  }));
  let gust=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(gust?.constructor.name,'ChoosePokemonPrompt');
  const target=nativeSinglePokemonChoices(x.state,gust).find(opt=>
    opt.seat===seat&&opt.physical.getPokemonCard()?.fullName===
      'Vileplume AOR');
  assert.ok(target,'Guzma must offer Benched Vileplume');
  assert.equal(gust.validate([target.physical],x.state),true);
  x.f.store.dispatch(new ResolvePromptAction(gust.id,[target.physical]));
  assert.equal(x.owner.active.getPokemonCard()?.fullName,'Vileplume AOR');
  gust=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(gust?.constructor.name,'ChoosePokemonPrompt');
  const mimikyu=nativeSinglePokemonChoices(x.state,gust).find(opt=>
    opt.seat===1-seat&&
    opt.physical.getPokemonCard()?.fullName==='Mimikyu GRI');
  assert.ok(mimikyu,'Guzma must offer own legal Benched Mimikyu');
  assert.equal(gust.validate([mimikyu.physical],x.state),true);
  x.f.store.dispatch(new ResolvePromptAction(gust.id,[mimikyu.physical]));
  assert.equal(opponent.active.getPokemonCard()?.fullName,'Mimikyu GRI');
  assert.equal(opponent.hand.cards.some(c=>c.fullName==='Guzma BUS'),false);
  assert.ok(opponent.discard.cards.some(c=>c.fullName==='Guzma BUS') ||
    opponent.supporter.cards.some(c=>c.fullName==='Guzma BUS'),
    'Guzma must leave hand and occupy its legal played zone');
  assert.equal(x.f.store.hasPrompts(),false);
  assert.equal(x.state.activePlayer,1-seat);

  return {opponent};
}

for(const seat of [0,1]){
  test('Fan-prized Sentinel G&H Artazon directly benches Bunnelby, Jet to Active, double TM to Vileplume: seat '+seat,()=>{
    const x=stage(seat);
    const {beforeB,gh,stadiumPrompts,searchPrompts,toolPrompts,
      jetPrompts,two,benched,PlayCardAction,PlayerType,SlotType}=
      establishSentinelLock(x);
    const opponent=x.f.defender;
    assert.strictEqual(x.f.store.state,x.state,
      'Opponent reply must use the current Store game state');

    resolveRank1Guzma(x);

    // An illegal native Item attempt rolls the Store back into a fresh State.
    // Run this negative control last, so earlier reply actions use live refs.
    // An actual original-rank1 opponent Item must fail under the live lock.
    const fog=opponent.hand.cards.find(c=>c.fullName==='Fog Crystal CRE')??
      opponent.deck.cards.find(c=>c.fullName==='Fog Crystal CRE');
    assert.ok(fog);
    if(!opponent.hand.cards.includes(fog)){
      opponent.deck.cards.splice(opponent.deck.cards.indexOf(fog),1);
      opponent.hand.cards.push(fog);
    }
    const fogIndex=opponent.hand.cards.indexOf(fog);
    const oldHand=opponent.hand.cards.slice();
    const stateBeforeRejection=x.f.store.state;
    assert.throws(()=>x.f.store.dispatch(new PlayCardAction(
      opponent.id,fogIndex,{player:PlayerType.ANY,
        slot:SlotType.BOARD,index:0})),e=>e?.message==='CANNOT_PLAY_THIS_CARD');
    assert.deepEqual(opponent.hand.cards,oldHand);

    const liveOpponentAfterRejection=x.f.store.state.players[1-seat];
    assert.notStrictEqual(x.f.store.state,stateBeforeRejection,
      'Rejected Item must replace the live native State');
    assert.deepEqual(liveOpponentAfterRejection.hand.cards.map(c=>c.fullName),
      oldHand.map(c=>c.fullName));
    assert.equal(x.f.store.state.players[seat].active.getPokemonCard()?.fullName,
      'Vileplume AOR');

    console.log('AGENT28_DIRECT_ARTAZON_NATIVE',JSON.stringify({
      seat,sourceCards:60,fanPrized:true,bunnelbyBefore:beforeB,
      afterArtazonRemainingB:1,ghPaidDiscard:['Guzma BUS','Karen XYP'],
      supporter:gh,stadiumPrompts,searchPrompts,toolPrompts,jetPrompts,
      actualActive:BUN,actualEnergy:JET,actualTool:TM,
      attacks:two.attackCount,attackPrompts:two.kinds,
      benched,opponentItemVeto:'Fog Crystal CRE',
      prospectiveOpponentSupporter:'Guzma BUS',
      promotedSource:'Vileplume AOR',promotedOpponent:'Mimikyu GRI',
      opponentReplyMode:'conditioned genuine Store Supporter, not autonomous',
      competitiveGames:0
    }));
  });
}

/**
 * Independent conditioned original-rank1 Wonder Tag access arm:
 * no Guzma held at turn start, original printed Guzma reachable only in deck.
 * The active source Item lock remains in force throughout Lele's Ability.
 */
for(const seat of [0,1]){
  test('Original rank1 Tapu Lele Wonder Tag obtains and resolves Guzma under the Sentinel Item lock: seat '+seat,()=>{
    const x=stage(seat);
    const opponent=x.f.defender;
    const handGuzma=opponent.hand.cards.find(c=>c.fullName==='Guzma BUS');
    const prizeLele=opponent.prizes.find(p=>p.cards[0]?.name==='Tapu Lele-GX');
    const deckFiller=opponent.deck.cards.find(c=>c.fullName!=='Guzma BUS');
    assert.ok(handGuzma&&prizeLele&&deckFiller,
      'Treat one printed Lele from deterministic original rank1 Prizes');
    // Source order put both genuine Lele in Prizes. Recondition this as a
    // different physical deal: one Prize Lele to hand, one deck card to Prize,
    // and original held Guzma to deck; every source card remains physically used.
    const playedLele=prizeLele.cards[0];
    opponent.hand.cards.splice(opponent.hand.cards.indexOf(handGuzma),1);
    opponent.deck.cards.push(handGuzma);
    opponent.deck.cards.splice(opponent.deck.cards.indexOf(deckFiller),1);
    prizeLele.cards.splice(0,1,deckFiller);
    opponent.hand.cards.push(playedLele);

    const {PokemonCardList}=native('game/store/state/pokemon-card-list');
    while(opponent.bench.length<5)opponent.bench.push(new PokemonCardList());
    const physical=[...opponent.active.cards,...opponent.bench.flatMap(b=>b.cards),
      ...opponent.hand.cards,...opponent.deck.cards,...opponent.discard.cards,
      ...opponent.prizes.flatMap(p=>p.cards)];
    assert.equal(physical.length,60);
    assert.equal(new Set(physical).size,60);

    establishSentinelLock(x);
    assert.equal(opponent.hand.cards.some(c=>c.fullName==='Guzma BUS'),false);
    assert.equal(opponent.deck.cards.some(c=>c.fullName==='Guzma BUS'),true);
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    const leleIndex=opponent.hand.cards.indexOf(playedLele);
    const benchIndex=opponent.bench.findIndex(b=>b.cards.length===0);
    assert.ok(leleIndex>=0&&benchIndex>=0);
    x.f.store.dispatch(new PlayCardAction(opponent.id,leleIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:benchIndex
    }));
    let prompt=x.state.prompts.find(p=>p.result===undefined);
    assert.equal(prompt?.constructor.name,'ConfirmPrompt',
      'Actual Wonder Tag on-hand Bench play must ask for consent');
    x.f.store.dispatch(new ResolvePromptAction(prompt.id,true));
    prompt=x.state.prompts.find(p=>p.result===undefined);
    assert.equal(prompt?.constructor.name,'ChooseCardsPrompt',
      'Wonder Tag must search a real own-deck Supporter');
    assert.equal(prompt.cards,opponent.deck);
    const selected=opponent.deck.cards.find(c=>c.fullName==='Guzma BUS');
    assert.ok(selected);
    assert.equal(prompt.validate([selected],x.state),true);
    x.f.store.dispatch(new ResolvePromptAction(prompt.id,[selected]));
    const promptKinds=['ConfirmPrompt','ChooseCardsPrompt'];
    for(let i=0;i<20;i++){
      prompt=x.state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      const kind=prompt.constructor.name;
      const answer=kind==='ShuffleDeckPrompt'?
        opponent.deck.cards.map((_,j)=>j):
        kind==='WaitPrompt'?null:
        kind==='ShowCardsPrompt'?true:undefined;
      assert.notEqual(answer,undefined,'Unexpected Wonder Tag prompt '+kind);
      x.f.store.dispatch(new ResolvePromptAction(prompt.id,answer));
      promptKinds.push(kind);
    }
    assert.equal(x.f.store.hasPrompts(),false);
    assert.equal(opponent.bench[benchIndex].getPokemonCard()?.fullName,
      'Tapu Lele-GX GRI');
    assert.equal(opponent.hand.cards.some(c=>c.fullName==='Guzma BUS'),true);
    assert.equal(opponent.deck.cards.some(c=>c.fullName==='Guzma BUS'),false);
    assert.equal(opponent.supporterTurn,0);
    resolveRank1Guzma(x);
    assert.equal(x.owner.active.getPokemonCard()?.fullName,'Vileplume AOR');
    assert.equal(opponent.active.getPokemonCard()?.fullName,'Mimikyu GRI');
    console.log('AGENT28_WONDERTAG_GUZMA_NATIVE',JSON.stringify({
      seat,sourceFixed60:true,opponentFixed60:true,
      sourceVileplumeLockedBefore:true,
      wonderTagSource:'Tapu Lele-GX GRI',wonderTagPrompts:promptKinds,
      searchedOpponentSupporter:'Guzma BUS',
      gustTarget:'Vileplume AOR',rank1Active:'Mimikyu GRI',
      opponentSupporterTurn:opponent.supporterTurn,
      conditionedScriptedSelection:true,competitiveGames:0
    }));
  });
}
