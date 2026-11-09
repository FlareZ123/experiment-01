'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const source=require('../results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {stageSourceBunnelbyBoard}=require('../simulation/twinleaf/bunnelby-tm-policy-replay.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const OUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} subpath */
const native=subpath=>require(path.join(OUT,subpath));
const ROWLET='Rowlet & Alolan Exeggutor-GX UNM';
const TAG='Tag Call CEC';
const HALA='Guzma & Hala CEC';
const JET='Jet Energy PAL';
const ART='Artazon PAL';

/** Complete 60 original cards, exactly one TM-to-Rowlet change. */
function hybrid(){
  const changed=structuredClone(source);
  changed.label='agent10-hybrid-one-Rowlet-one-TM-fixed-60';
  changed.category_counts.Pokémon++;
  changed.category_counts.Trainer--;
  const tool=changed.cards.find(c=>c.name==='Technical Machine: Evolution');
  assert.equal(tool.count,2);
  tool.count=1;
  changed.cards.push({
    category:'Pokémon',count:1,name:'Rowlet & Alolan Exeggutor-GX',
    printing:{set:'UNM',number:'1',language:'en'}
  });
  assert.equal(changed.cards.reduce((sum,c)=>sum+c.count,0),60);
  return changed;
}

/**
 * Genuine 60-card physical source inventory. Stage a deliberately favorable
 * opening hand for checking only the native paid sequence. Original opponent
 * remains the authentic native rank1 deck. No hidden lookups by a turn bot.
 * @param {0|1} seat
 */
function stage(seat){
  const f=stageSourceBunnelbyBoard().fixture;
  const plan=planAichi(hybrid(),{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const names=plan.candidate.cards;
  assert.equal(names?.length,60,
    'Hybrid Rowlet print must map to actual pinned Twinleaf card');
  const manager=initializeCards();
  const stock=names.map((fullName,index)=>{
    const card=manager.getCardByName(fullName);
    assert.ok(card,'Pinned native card unimplemented: '+fullName);
    card.id=1000000+1000*seat+index;
    return card;
  });
  /** @param {string} name */
  const take=name=>{
    const index=stock.findIndex(c=>c.name===name);
    assert.ok(index>=0,'Missing actual physical card '+name);
    return stock.splice(index,1)[0];
  };
  const active=take('Bunnelby');
  const held=['Tag Call','Guzma','Karen','Pidgey','Buneary',
    'Stealthy Hood','Pidgeotto'].map(take);
  const prizes=['Fan Rotom','Grand Tree','Counter Gain','Lusamine',
    'Plumeria','Pokémon Ranger'].map(take);
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const owner=f.attacker;
  const state=f.store.state;
  owner.active.cards.splice(0,owner.active.cards.length,active);
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
    ...owner.prizes.flatMap(p=>p.cards),
    ...owner.bench.flatMap(p=>p.cards)];
  assert.equal(all.length,60);
  assert.equal(owner.deck.cards.length,46);
  assert.deepEqual(all.map(c=>c.fullName).sort(),names.slice().sort());
  assert.ok(owner.deck.cards.some(c=>c.fullName===ROWLET));
  assert.ok(owner.deck.cards.some(c=>c.fullName===ART));
  return {f,owner,state,seat,names};
}

/** @param {ReturnType<typeof stage>} x */
function pending(x){
  return x.f.store.state.prompts.find(p=>p.result===undefined)??null;
}

/** @param {ReturnType<typeof stage>} x @param {string} expected @param {any} result */
function answer(x,expected,result){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const p=pending(x);
  assert.equal(p?.constructor.name,expected,
    'Expected '+expected+' got '+(p?.constructor.name??'no prompt'));
  if(typeof p.validate==='function'){
    const accepted=p.validate(result,x.f.store.state);
    assert.equal(accepted,true,'Native prompt rejects '+expected+' result');
  }
  x.f.store.dispatch(new ResolvePromptAction(p.id,result));
}

/** @param {ReturnType<typeof stage>} x */
function routine(x){
  for(let i=0;i<40;i++){
    const p=pending(x);
    if(!p)return;
    const kind=p.constructor.name;
    const result=kind==='ShuffleDeckPrompt'?
      x.owner.deck.cards.map((_,index)=>index):
      kind==='WaitPrompt'?null:
      kind==='ShowCardsPrompt'?true:undefined;
    assert.notEqual(result,undefined,'New native prompt needs decision '+kind);
    answer(x,kind,result);
  }
  assert.fail('Native routine prompt loop');
}

/** @param {ReturnType<typeof stage>} x @param {string} fullName */
function play(x,fullName,where){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const handIndex=x.owner.hand.cards.findIndex(c=>c.fullName===fullName);
  assert.ok(handIndex>=0,'Must physically hold '+fullName);
  const target=where===undefined?
    {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}:
    {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:where};
  x.f.store.dispatch(new PlayCardAction(x.owner.id,handIndex,target));
}

/** @param {ReturnType<typeof stage>} x @param {string[]} names */
function fromDeck(x,names){
  const p=pending(x);
  assert.equal(p?.constructor.name,'ChooseCardsPrompt',
    'Deck selection must be a real opened native prompt');
  assert.strictEqual(p.cards,x.owner.deck);
  const cards=names.map(name=>{
    const card=x.owner.deck.cards.find(c=>c.fullName===name);
    assert.ok(card,'Cannot fetch unavailable physical '+name);
    return card;
  });
  answer(x,'ChooseCardsPrompt',cards);
}

/** @param {ReturnType<typeof stage>} x */
function run(x){
  const initialHand=x.owner.hand.cards.length;
  assert.equal(initialHand,7);
  play(x,TAG);
  console.log('SUPERGROWTH_NATIVE_TAG_PROMPT',pending(x)?.constructor.name);
  fromDeck(x,[ROWLET,HALA]);
  routine(x);
  assert.ok(x.owner.hand.cards.some(c=>c.fullName===ROWLET));
  assert.ok(x.owner.hand.cards.some(c=>c.fullName===HALA));
  play(x,ROWLET,0);
  routine(x);
  assert.equal(x.owner.bench[0].getPokemonCard()?.fullName,ROWLET);

  play(x,HALA);
  console.log('SUPERGROWTH_NATIVE_HALA_PROMPT',pending(x)?.constructor.name);
  answer(x,'SelectOptionPrompt',1);
  const discardNames=['Guzma BUS','Karen XYP'];
  const discards=discardNames.map(name=>{
    const c=x.owner.hand.cards.find(card=>card.fullName===name);
    assert.ok(c);return c;
  });
  answer(x,'ChooseCardsPrompt',discards);
  fromDeck(x,[ART,JET]);
  routine(x);
  assert.ok(discards.every(c=>x.owner.discard.cards.includes(c)));
  assert.equal(x.owner.supporterTurn>0,true);

  play(x,ART);
  routine(x);
  const {UseStadiumAction,AttackAction}=native('game/store/actions/game-actions');
  x.f.store.dispatch(new UseStadiumAction(x.owner.id));
  fromDeck(x,['Oddish UNB']);
  routine(x);
  const oddish=x.owner.bench.findIndex(s=>s.getPokemonCard()?.name==='Oddish');
  assert.ok(oddish>=0);
  play(x,JET,0);
  routine(x);
  assert.equal(x.owner.active.getPokemonCard()?.fullName,ROWLET);
  assert.equal(x.owner.active.energies.cards.length,1);
  const active=x.owner.active.getPokemonCard();
  assert.equal(active.fullName,ROWLET);

  x.f.store.dispatch(new AttackAction(x.owner.id,'Super Growth'));
  const choices=[];
  for(let i=0;i<50;i++){
    const p=pending(x);
    if(!p)break;
    const kind=p.constructor.name;
    const receipt={prompt:kind,choices:[]};
    console.log('SUPERGROWTH_NATIVE_ATTACK_PROMPT',JSON.stringify({
      seat:x.seat,kind,
      min:p.min,max:p.max,
      cardsSource:p.cards===x.owner.deck?'own-deck':
        p.cards===x.owner.hand?'own-hand':null,
      stateTurn:x.f.store.state.turn,
      board:x.owner.bench.map(s=>s.getPokemonCard()?.fullName??null)
    }));
    if(kind==='ChoosePokemonPrompt'){
      const slot=x.owner.bench.find(s=>s.getPokemonCard()?.fullName==='Oddish UNB');
      assert.ok(slot,'Must select actual owner's Oddish');
      answer(x,kind,[slot]);
      receipt.choices.push('Oddish UNB');
    }else if(kind==='ChooseCardsPrompt'){
      assert.strictEqual(p.cards,x.owner.deck,'Evolution should select real deck cards');
      const name=x.owner.bench.some(s=>s.getPokemonCard()?.fullName==='Gloom UNB')?
        'Vileplume AOR':'Gloom UNB';
      fromDeck(x,[name]);
      receipt.choices.push(name);
    }else if(kind==='ShuffleDeckPrompt'){
      answer(x,kind,x.owner.deck.cards.map((_,j)=>j));
    }else if(kind==='WaitPrompt'){
      answer(x,kind,null);
    }else if(kind==='ShowCardsPrompt'){
      answer(x,kind,true);
    }else{
      assert.fail('Unimplemented native attack prompt '+kind);
    }
    choices.push(receipt);
  }
  assert.equal(pending(x),null,'Super Growth must fully settle');
  assert.ok(x.owner.bench.some(s=>s.getPokemonCard()?.fullName==='Vileplume AOR'),
    'Native actual printed attack must establish Stage2 Vileplume');
  assert.equal(x.f.store.state.activePlayer,1-x.seat);
  const now=[...x.owner.active.cards,...x.owner.bench.flatMap(s=>s.cards),
    ...x.owner.hand.cards,...x.owner.deck.cards,
    ...x.owner.discard.cards,...x.owner.prizes.flatMap(p=>p.cards)];
  assert.equal(now.length,60,'Native owner card custody after entire transaction');
  console.log('SUPERGROWTH_NATIVE_SETTLED',JSON.stringify({
    seat:x.seat,attack:'Super Growth',
    active:x.owner.active.getPokemonCard()?.fullName,
    bench:x.owner.bench.map(s=>s.getPokemonCard()?.fullName??null),
    prompts:choices,
    sourceCards:now.length,
    prizeCount:x.owner.prizes.length,
    opponentTurn:x.f.store.state.activePlayer,
    qualifiedCompetitiveGames:0
  }));
}

/** One conditioned original fixed-60 source setup on both actual seats. */
for(const seat of [0,1]){
  test('native genuine Tag Call/Hala/Artazon/Jet/Super Growth locks items: seat '+seat,()=>{
    run(stage(seat));
  });
}
