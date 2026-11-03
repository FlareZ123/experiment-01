'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(root,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {GamePhase}=native('game/store/state/state');
const {Format}=native('game/store/card/card-types');
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');

const {installFlf69WildBlazePaperHook}=
  require('../simulation/twinleaf/flf69-wild-blaze-paper-hook.cjs');

const variants=[
  {name:'M Charizard EX FLF',own:10,other:5},
  {name:'M Charizard-EX FLF 69',own:5,other:10}
];

/**
 * An actual pinned native Store attack, staged at the attack window.
 * The complete five-Energy cost and all target and deck zones exist physically.
 * This deliberately excludes initial-deal probabilities, normal evolution,
 * opponent policy, and competitive outcomes.
 *
 * @param {0|1} seat
 * @param {string} printing
 * @returns {object}
 */
function attack(seat,printing){
  const cards=initializeCards();
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.gameSettings.format=Format.EXPANDED;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.activePlayer=seat;
  const owner=new Player(),opponent=new Player();
  owner.id=101;owner.name='FLF69 owner';
  opponent.id=202;opponent.name='FLF69 opponent';
  state.players=seat===0?[owner,opponent]:[opponent,owner];

  /** @param {string} fullName */
  const get=fullName=>{
    const result=cards.getCardByName(fullName);
    assert.ok(result,'Missing exact native printing '+fullName);
    return result;
  };
  const mega=get(printing);
  assert.equal(mega.name,'M Charizard-EX');
  assert.equal(mega.set,'FLF');
  assert.equal(String(mega.setNumber),'69');
  assert.equal(mega.attacks[0].name,'Wild Blaze');
  assert.equal(mega.attacks[0].damage,300);
  owner.active.cards.push(mega);
  const fire=cards.getAllCards().find(c=>c.name==='Fire Energy');
  const dark=cards.getAllCards().find(c=>c.name==='Darkness Energy');
  assert.ok(fire&&dark,'Real printed basic Energy is required for payment');
  // Two Fire, one Darkness and two additional Fire satisfy FF D CC.
  for(const fullName of [fire.fullName,fire.fullName,dark.fullName,
    fire.fullName,fire.fullName]){
    const energy=get(fullName);
    owner.active.cards.push(energy);
    owner.active.energies.cards.push(energy);
  }
  opponent.active.cards.push(get('Shadow Rider Calyrex VMAX CRE'));
  assert.ok(opponent.active.getPokemonCard().hp>300,
    'Target must survive so no unrelated Prize prompt obscures the deck effect');
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(get('Exeggcute PLF'));
      return prize;
    });
    for(let i=0;i<10;i++)player.deck.cards.push(get('Exeggcute PLF'));
  }
  assert.equal(owner.deck.cards.length,10);
  assert.equal(opponent.deck.cards.length,10);
  store.dispatch(new AttackAction(owner.id,'Wild Blaze'));
  for(let step=0;step<30 && store.hasPrompts();step++){
    const pending=state.prompts.find(p=>p.result===undefined);
    assert.ok(pending,'Unresolved native prompt without a selectable object');
    assert.equal(pending.constructor.name,'WaitPrompt',
      'Unexpected non-wait prompt: '+pending.constructor.name);
    store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.equal(store.hasPrompts(),false,'Native attack did not settle');
  return {
    seat,printing,ownerDeck:owner.deck.cards.length,
    opponentDeck:opponent.deck.cards.length,
    ownerDiscard:owner.discard.cards.length,
    opponentDiscard:opponent.discard.cards.length,
    damage:opponent.active.damage,
    turn:state.turn,
    competitiveQualified:false
  };
}

for(const v of variants){
  for(const seat of [0,1]){
    test('FLF69 real native Wild Blaze '+v.name+' seat '+seat,()=>{
      const r=attack(seat,v.name);
      assert.equal(r.damage,300,'Both variants must settle the actual 300 damage');
      assert.equal(r.ownerDeck,v.own,'Actual native owner deck transition');
      assert.equal(r.opponentDeck,v.other-1,
        'Opponent draws exactly one card at the start of its next turn');
      assert.equal(r.ownerDiscard,10-v.own,'Exact own top-five discard count');
      assert.equal(r.opponentDiscard,10-v.other,'Exact opponent top-five discard count');
      assert.equal(r.turn,5,'Native attack ends the attacking turn');
      console.log('AGENT5_FLF69_NATIVE_ATTACK',JSON.stringify(r));
    });
  }
}

for(const seat of [0,1]){
  test('opt-in patched original FLF69 discards only its own top five seat '+seat,()=>{
    const hook=installFlf69WildBlazePaperHook();
    try{
      const r=attack(seat,'M Charizard EX FLF');
      assert.equal(r.damage,300);
      assert.equal(r.ownerDeck,5);
      assert.equal(r.opponentDeck,9,
        'Opponent draws one card at the beginning of its next turn');
      assert.equal(r.ownerDiscard,5);
      assert.equal(r.opponentDiscard,0);
      assert.equal(hook.evidence().correctedWildBlazeEffects,1);
      assert.equal(hook.evidence().megaEvolutionReducerPreserved,true);
      console.log('AGENT5_FLF69_CORRECTED_NATIVE_ATTACK',JSON.stringify({
        ...r,correction:hook.evidence()
      }));
    }finally{
      hook.restore();
    }
  });
}

/**
 * Candidate-relevant copied payload: Regidrago VSTAR actually declares Apex
 * Dragon and selects exact FLF69 Wild Blaze from its OWN discard pile.
 * This is an actual native attack with a staged board, not a normal 60-card
 * game's natural deck access or a competitive matchup.
 *
 * @param {0|1} seat
 * @param {boolean} corrected
 */
function copiedWildBlaze(seat,corrected){
  const cards=initializeCards();
  const {clearCopyAttackSessionsForTests}=
    native('game/store/prefabs/copy-attack-delegation');
  clearCopyAttackSessionsForTests();
  const hook=corrected?installFlf69WildBlazePaperHook():null;
  try{
    const store=new Store({onStateChange(){}});
    const state=store.state;
    state.gameSettings.format=Format.EXPANDED;
    state.phase=GamePhase.PLAYER_TURN;
    state.turn=4;
    state.activePlayer=seat;
    const owner=new Player(),opponent=new Player();
    owner.id=101;owner.name='Regidrago donor owner';
    opponent.id=202;opponent.name='Apex target';
    state.players=seat===0?[owner,opponent]:[opponent,owner];
    /** @param {string} name */
    const card=name=>{
      const result=cards.getCardByName(name);
      assert.ok(result,'Missing required native printing '+name);
      return result;
    };
    const donor=card('M Charizard EX FLF');
    owner.active.cards.push(card('Regidrago VSTAR SIT'));
    for(const energyName of ['Grass Energy SVE','Grass Energy SVE',
      'Fire Energy SVE']){
      const energy=card(energyName);
      owner.active.cards.push(energy);
      owner.active.energies.cards.push(energy);
    }
    owner.discard.cards.push(donor);
    opponent.active.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
    assert.ok(opponent.active.getPokemonCard().hp>300);
    for(const player of state.players){
      player.prizes=Array.from({length:6},()=>{
        const prize=new CardList();
        prize.cards.push(card('Exeggcute PLF'));
        return prize;
      });
      for(let i=0;i<10;i++)player.deck.cards.push(card('Exeggcute PLF'));
    }
    store.dispatch(new AttackAction(owner.id,'Apex Dragon'));
    const prompt=state.prompts.find(p=>
      p.constructor.name==='ChooseAttackPrompt'&&p.result===undefined);
    assert.ok(prompt,'Native Apex Dragon must offer a Dragon donor');
    assert.ok(prompt.cards.includes(donor),
      'Original FLF69 printing must be in owner-visible copied attack menu');
    store.dispatch(new ResolvePromptAction(prompt.id,donor.attacks[0]));
    for(let step=0;step<30&&store.hasPrompts();step++){
      const pending=state.prompts.find(p=>p.result===undefined);
      assert.ok(pending);
      assert.equal(pending.constructor.name,'WaitPrompt');
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(store.hasPrompts(),false);
    const result={
      seat,corrected,declared:'Apex Dragon',chosen:'Wild Blaze',
      damage:opponent.active.damage,
      ownerDeck:owner.deck.cards.length,
      opponentDeck:opponent.deck.cards.length,
      ownerDiscard:owner.discard.cards.length,
      opponentDiscard:opponent.discard.cards.length,
      hookEffects:hook?.evidence().correctedWildBlazeEffects??0,
      competitiveQualified:false
    };
    assert.equal(result.damage,300);
    assert.equal(result.ownerDeck,corrected?5:10);
    assert.equal(result.opponentDeck,corrected?9:4);
    assert.equal(result.ownerDiscard,corrected?6:1,
      'Original FLF69 donor remains in discard alongside corrected own milling');
    assert.equal(result.opponentDiscard,corrected?0:5);
    if(corrected)assert.equal(result.hookEffects,1);
    console.log('AGENT5_APEX_FLF69_COPY',JSON.stringify(result));
    return result;
  }finally{
    if(hook)hook.restore();
    clearCopyAttackSessionsForTests();
  }
}

for(const seat of [0,1]){
  for(const corrected of [false,true]){
    test('native Apex Dragon Wild Blaze donor seat '+seat+
      ' paper correction '+corrected,()=>{
      copiedWildBlaze(seat,corrected);
    });
  }
}

/**
 * Separate real native PlayCardAction for the Mega Evolution rule. The
 * legitimate Charizard-EX was already in the Active Spot on an earlier turn.
 * This resolves a normal Mega card from hand and observes whether the turn
 * automatically ends without a Spirit Link.
 *
 * @param {0|1} seat
 * @param {string} printing
 * @param {boolean} corrected
 */
function evolveMega(seat,printing,corrected){
  const cards=initializeCards();
  const hook=corrected?installFlf69WildBlazePaperHook():null;
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  try{
    const store=new Store({onStateChange(){}});
    const state=store.state;
    state.gameSettings.format=Format.EXPANDED;
    state.phase=GamePhase.PLAYER_TURN;
    state.turn=4;
    state.activePlayer=seat;
    const owner=new Player(),opponent=new Player();
    owner.id=101;owner.name='Mega evolution owner';
    opponent.id=202;opponent.name='Opposing Active';
    state.players=seat===0?[owner,opponent]:[opponent,owner];
    const charizard=cards.getCardByName('Charizard-EX FLF');
    const mega=cards.getCardByName(printing);
    assert.ok(charizard&&mega);
    owner.active.cards.push(charizard);
    owner.active.pokemonPlayedTurn=2;
    owner.hand.cards.push(mega);
    opponent.active.cards.push(cards.getCardByName('Shadow Rider Calyrex V CRE'));
    for(const player of state.players){
      player.prizes=Array.from({length:6},()=>{
        const prize=new CardList();
        prize.cards.push(cards.getCardByName('Exeggcute PLF'));
        return prize;
      });
      for(let i=0;i<10;i++)
        player.deck.cards.push(cards.getCardByName('Exeggcute PLF'));
    }
    let target=null;
    owner.forEachPokemon(PlayerType.BOTTOM_PLAYER,(_slot,pokemon,t)=>{
      if(pokemon===charizard)target=t;
    });
    assert.ok(target);
    assert.equal(target.slot,SlotType.ACTIVE);
    store.dispatch(new PlayCardAction(owner.id,0,target));
    for(let step=0;step<20&&store.hasPrompts();step++){
      const pending=state.prompts.find(p=>p.result===undefined);
      assert.ok(pending);
      assert.equal(pending.constructor.name,'WaitPrompt');
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(store.hasPrompts(),false);
    assert.equal(owner.active.getPokemonCard()?.fullName,printing,
      'The native PlayCardAction should actually evolve the prior Charizard');
    const r={
      seat,printing,corrected,turn:state.turn,
      activePokemon:owner.active.getPokemonCard()?.fullName,
      ownerHand:owner.hand.cards.length,
      competitiveQualified:false
    };
    console.log('AGENT5_FLF69_MEGA_EVOLUTION',JSON.stringify(r));
    // Both source and corrected original must retain the printed Mega turn end.
    if(printing==='M Charizard EX FLF')
      assert.equal(r.turn,5,'Original Mega reducer must end the evolution turn');
    return r;
  }finally{
    if(hook)hook.restore();
  }
}

for(const seat of [0,1]){
  for(const printing of ['M Charizard EX FLF','M Charizard-EX FLF 69']){
    test('native actual Mega evolution '+printing+' seat '+seat,()=>{
      evolveMega(seat,printing,false);
    });
  }
  test('native original paper-hook preserves Mega evolution seat '+seat,()=>{
    evolveMega(seat,'M Charizard EX FLF',true);
  });
}
