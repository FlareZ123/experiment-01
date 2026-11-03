'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} x */
const native=x=>require(path.join(OUTPUT,x));

/**
 * Actual native Store / original printed rank26 Exeggcute in discard.
 * Staged zones make this a mechanical witness, never a natural deal or win.
 * @param {0|1} seat Original rank26 owner physical seat.
 * @param {'none'|'opponent-bench'|'owner-bench'|'opponent-discard'} mode
 */
function fixture(seat,mode) {
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {CheckPokemonPowersEffect}=native('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const manager=initializeCards();
  let id=440000;
  /** @param {string} name */
  function card(name) {
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing registered native printing: '+name);
    c.id=id++;
    return c;
  }
  const source=new Player(),opponent=new Player();
  source.id=seat===0?101:202;
  opponent.id=seat===0?202:101;
  source.active.cards.push(card('Meloetta ex SV11B'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  const egg=card('Exeggcute PLF');
  source.discard.cards.push(egg);
  if(mode!=='none'){
    const holder=mode==='owner-bench'?source:opponent;
    const grimer=card('Alolan Grimer SUM');
    const muk=card('Alolan Muk SUM');
    if(mode==='opponent-discard') {
      holder.discard.cards.push(grimer,muk);
    } else {
      const slot=new PokemonCardList();
      slot.cards.push(grimer,muk);
      slot.pokemonPlayedTurn=1;
      holder.bench.push(slot);
    }
  }
  for(const p of [source,opponent]){
    for(let i=0;i<8;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const settings=new GameSettings(),state=new State();
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.turn=3;
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.players=seat===0?[source,opponent]:[opponent,source];
  const store=new Store({onStateChange(){}});
  store.state=state;
  const power=egg.powers.find(p=>p.name==='Propagation');
  assert.ok(power);
  const check=new CheckPokemonPowersEffect(source,egg);
  store.reduceEffect(state,check);
  const observed={
    blocked:Boolean(IS_ABILITY_BLOCKED(store,state,source,egg,power)),
    discoverable:check.powers.some(p=>p.name==='Propagation')
  };
  let error=null;
  try {
    store.dispatch(new UseAbilityAction(source.id,'Propagation',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.DISCARD,index:0
    }));
  }catch(e){error=String(e.message);}
  const settledSource=store.state.players[seat];
  return {seat,mode,observed,error,
    eggInDiscard:settledSource.discard.cards.some(c=>c.fullName===egg.fullName),
    eggInHand:settledSource.hand.cards.some(c=>c.fullName===egg.fullName),
    pendingPrompts:store.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)};
}

for(const seat of [0,1]){
  for(const mode of ['none','opponent-bench','owner-bench','opponent-discard']){
    test('native Propagation across Muk '+mode+' on seat '+seat,()=>{
      const row=fixture(seat,mode);
      console.log('AGENT43_MUK_PROPAGATION',JSON.stringify(row));
      const blocked=mode==='opponent-bench'||mode==='owner-bench';
      assert.equal(row.observed.blocked,blocked,JSON.stringify(row));
      assert.equal(row.observed.discoverable,!blocked,JSON.stringify(row));
      assert.equal(row.eggInDiscard,blocked,JSON.stringify(row));
      assert.equal(row.eggInHand,!blocked,JSON.stringify(row));
      assert.deepEqual(row.pendingPrompts,[]);
    });
  }
}


/**
 * An actual owner-paid Cologne Item, followed by original discard Propagation.
 * Source and opponent stages are placed directly into a staged board.
 * @param {0|1} seat
 * @param {boolean} mukActive Whether enemy Muk itself is Active.
 */
function cologneContinuation(seat,mukActive){
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const manager=initializeCards();
  let id=450000;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing native source printing: '+name);
    c.id=id++;
    return c;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=seat===0?101:202;
  opponent.id=seat===0?202:101;
  owner.active.cards.push(card('Meloetta ex SV11B'));
  const egg=card('Exeggcute PLF');
  const cologne=card('Canceling Cologne ASR');
  owner.discard.cards.push(egg);
  owner.hand.cards.push(cologne);
  const mukSlot=new PokemonCardList();
  mukSlot.cards.push(card('Alolan Grimer SUM'),card('Alolan Muk SUM'));
  mukSlot.pokemonPlayedTurn=1;
  if(mukActive) {
    opponent.active.cards.push(...mukSlot.cards);
    opponent.active.pokemonPlayedTurn=1;
  } else {
    opponent.active.cards.push(card('Regidrago V SIT'));
    opponent.bench.push(mukSlot);
  }
  for(const p of [owner,opponent]){
    for(let i=0;i<8;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const state=new State(),settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;state.rules=settings.rules;
  state.turn=3;state.phase=GamePhase.PLAYER_TURN;state.activePlayer=seat;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  const store=new Store({onStateChange(){}});
  store.state=state;
  const firstBlocked=Boolean(IS_ABILITY_BLOCKED(store,state,owner,egg,egg.powers[0]));
  assert.equal(firstBlocked,true);
  const target={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  store.dispatch(new PlayCardAction(owner.id,0,target));
  const afterItem=store.state.players[seat];
  const opponentAfter=store.state.players[1-seat];
  assert.equal(afterItem.discard.cards.some(c=>c.fullName==='Canceling Cologne ASR'),true);
  assert.equal(afterItem.hand.cards.some(c=>c.fullName==='Canceling Cologne ASR'),false);
  const stillEgg=afterItem.discard.cards.find(c=>c.fullName==='Exeggcute PLF');
  assert.ok(stillEgg);
  const afterBlocked=Boolean(IS_ABILITY_BLOCKED(store,store.state,afterItem,stillEgg,stillEgg.powers[0]));
  let abilityError=null;
  try{
    store.dispatch(new UseAbilityAction(owner.id,'Propagation',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.DISCARD,
      index:afterItem.discard.cards.indexOf(stillEgg)
    }));
  }catch(error){abilityError=String(error.message);}
  const finalOwner=store.state.players[seat];
  return {seat,mukActive,firstBlocked,afterBlocked,abilityError,
    cologneInDiscard:finalOwner.discard.cards.some(c=>c.fullName==='Canceling Cologne ASR'),
    eggInHand:finalOwner.hand.cards.some(c=>c.fullName==='Exeggcute PLF'),
    eggInDiscard:finalOwner.discard.cards.some(c=>c.fullName==='Exeggcute PLF'),
    cologneMarker:opponentAfter.marker.hasMarker('CANCELING_COLOGNE_MARKER',cologne),
    pending:store.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)};
}
for(const seat of [0,1]){
  for(const mukActive of [true,false]){
    test('native printed Cologne versus '+(mukActive?'Active':'Benched')+' Muk seat '+seat,()=>{
      const row=cologneContinuation(seat,mukActive);
      console.log('AGENT43_MUK_COLOGNE_PROPAGATION',JSON.stringify(row));
      assert.equal(row.afterBlocked,!mukActive);
      assert.equal(row.eggInHand,mukActive);
      assert.equal(row.eggInDiscard,!mukActive);
      assert.equal(row.abilityError,mukActive?null:'UNKNOWN_POWER');
      assert.equal(row.cologneInDiscard,true);
      assert.equal(row.cologneMarker,true);
      assert.deepEqual(row.pending,[]);
    });
  }
}


/**
 * Staged paper response: source plays its physical Escape Rope, opponent
 * chooses a real Bench target, then source pays Canceling Cologne and
 * attempts discard-pile Propagation. Requires no opponent hidden cards.
 * @param {0|1} seat
 * @param {boolean} additionalBench Another actual opposing Bench choice.
 */
function ropeCologneContinuation(seat,additionalBench) {
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const manager=initializeCards();
  let physical=460000+seat*100;
  /** @param {string} name */
  function card(name) {
    const instance=manager.getCardByName(name);
    assert.ok(instance,'Missing pinned printing '+name);
    instance.id=physical++;
    return instance;
  }
  const source=new Player(),opponent=new Player();
  source.id=seat===0?101:202;
  opponent.id=seat===0?202:101;
  source.active.cards.push(card('Meloetta ex SV11B'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  const egg=card('Exeggcute PLF');
  source.discard.cards.push(egg);
  source.hand.cards.push(card('Escape Rope BST'),card('Canceling Cologne ASR'));
  const mukBench=new PokemonCardList();
  mukBench.cards.push(card('Alolan Grimer SUM'),card('Alolan Muk SUM'));
  mukBench.pokemonPlayedTurn=1;
  opponent.bench.push(mukBench);
  if(additionalBench){
    const other=new PokemonCardList();
    other.cards.push(card('Lunatone OBF'));
    opponent.bench.push(other);
  }
  for(const player of [source,opponent]){
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state=new State(),settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;state.rules=settings.rules;
  state.turn=3;state.phase=GamePhase.PLAYER_TURN;state.activePlayer=seat;
  state.players=seat===0?[source,opponent]:[opponent,source];
  const store=new Store({onStateChange(){}});
  store.state=state;
  const initialBlocked=Boolean(IS_ABILITY_BLOCKED(store,state,source,egg,egg.powers[0]));
  assert.equal(initialBlocked,true);
  const target={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  store.dispatch(new PlayCardAction(source.id,0,target));
  const pending=store.state.prompts.find(p=>p.result===undefined);
  assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt',
    'Native Rope must ask opponent to choose a Benched Pokémon');
  assert.equal(pending.playerId,opponent.id);
  const chosen=opponent.bench[additionalBench?1:0];
  assert.ok(pending.validate([chosen],store.state),'Chosen target must be native legal');
  const chosenPhysicalId=chosen.getPokemonCard().id;
  store.dispatch(new ResolvePromptAction(pending.id,[chosen]));
  assert.equal(opponent.active.getPokemonCard()?.id,chosenPhysicalId);
  assert.equal(source.active.getPokemonCard()?.fullName,'Meloetta ex SV11B');
  assert.equal(source.discard.cards.some(c=>c.fullName==='Escape Rope BST'),true);
  const cologneIndex=source.hand.cards.findIndex(c=>c.fullName==='Canceling Cologne ASR');
  assert.ok(cologneIndex>=0);
  store.dispatch(new PlayCardAction(source.id,cologneIndex,target));
  assert.equal(source.discard.cards.some(c=>c.fullName==='Canceling Cologne ASR'),true);
  const afterBlocked=Boolean(IS_ABILITY_BLOCKED(store,store.state,source,egg,egg.powers[0]));
  let error=null;
  try{
    store.dispatch(new UseAbilityAction(source.id,'Propagation',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.DISCARD,
      index:source.discard.cards.indexOf(egg)
    }));
  }catch(e){error=String(e.message);}
  return {
    seat,additionalBench,initialBlocked,afterBlocked,error,
    chosenPhysicalId,activeOpponent:opponent.active.getPokemonCard()?.fullName,
    mukOnBench:opponent.bench.some(x=>x.getPokemonCard()?.fullName==='Alolan Muk SUM'),
    ropeDiscarded:source.discard.cards.some(c=>c.fullName==='Escape Rope BST'),
    cologneDiscarded:source.discard.cards.some(c=>c.fullName==='Canceling Cologne ASR'),
    eggInHand:source.hand.cards.some(c=>c.fullName==='Exeggcute PLF'),
    eggInDiscard:source.discard.cards.some(c=>c.fullName==='Exeggcute PLF'),
    unresolved:store.state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name)
  };
}
for(const seat of [0,1]){
  for(const additionalBench of [false,true]){
    test('actual Rope then Cologne against '+(additionalBench?'two-choice':'sole')+
      ' Bench Muk seat '+seat,()=>{
      const row=ropeCologneContinuation(seat,additionalBench);
      console.log('AGENT43_MUK_ROPE_COLOGNE',JSON.stringify(row));
      assert.equal(row.afterBlocked,additionalBench);
      assert.equal(row.eggInHand,!additionalBench);
      assert.equal(row.eggInDiscard,additionalBench);
      assert.equal(row.error,additionalBench?'UNKNOWN_POWER':null);
      assert.equal(row.ropeDiscarded,true);
      assert.equal(row.cologneDiscarded,true);
      assert.deepEqual(row.unresolved,[]);
    });
  }
}


/**
 * Source-printed Counter Catcher picks opposing Benched Muk directly,
 * even when opponent has another Bench option. Printed Prize prerequisite
 * is tested as an explicit negative control.
 * @param {0|1} seat Original rank26 owner seat.
 * @param {boolean} sourceBehind Source has more Prizes remaining.
 */
function catcherCologneContinuation(seat,sourceBehind) {
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const manager=initializeCards();
  let physical=470000+seat*100;
  /** @param {string} name */
  function card(name) {
    const x=manager.getCardByName(name);
    assert.ok(x,'Missing printed native card '+name);
    x.id=physical++;
    return x;
  }
  const source=new Player(),opponent=new Player();
  source.id=seat===0?101:202;
  opponent.id=seat===0?202:101;
  source.active.cards.push(card('Meloetta ex SV11B'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  const egg=card('Exeggcute PLF');
  source.discard.cards.push(egg);
  source.hand.cards.push(card('Counter Catcher PAR'),card('Canceling Cologne ASR'));
  const muk=new PokemonCardList();
  muk.cards.push(card('Alolan Grimer SUM'),card('Alolan Muk SUM'));
  muk.pokemonPlayedTurn=1;
  const other=new PokemonCardList();
  other.cards.push(card('Lunatone OBF'));
  opponent.bench.push(muk,other);
  for(const player of [source,opponent]){
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    const numberOfPrizes=player===opponent&&sourceBehind?5:6;
    for(let i=0;i<numberOfPrizes;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state=new State(),settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;state.rules=settings.rules;
  state.turn=3;state.phase=GamePhase.PLAYER_TURN;state.activePlayer=seat;
  state.players=seat===0?[source,opponent]:[opponent,source];
  const store=new Store({onStateChange(){}});
  store.state=state;
  const initialBlocked=Boolean(IS_ABILITY_BLOCKED(store,state,source,egg,egg.powers[0]));
  assert.equal(initialBlocked,true);
  const target={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const originalActiveId=opponent.active.getPokemonCard()?.id;
  const catcher=source.hand.cards[0];
  // The native Item's printed eligibility check throws instead of
  // returning false for invalid public Prize counts.
  let nativeCanPlay=false;
  let nativeEligibilityError=null;
  try{nativeCanPlay=catcher.canPlay(store,state,source);}
  catch(e){nativeEligibilityError=String(e.message);}
  if(!sourceBehind){
    // The printed card's own canPlay() throws CANNOT_PLAY_THIS_CARD
    // before any legal Store root. Never dispatch a known-illegal
    // paper action: the engine's failed-action mutation semantics are
    // outside this source-policy counterfactual.
    const rejection=nativeEligibilityError;
    return {
      seat,sourceBehind,nativeCanPlay,nativeEligibilityError,rejection,
      catcherHeld:source.hand.cards.includes(catcher),
      originalActiveId,finalActiveId:opponent.active.getPokemonCard()?.id,
      mukStillBenched:opponent.bench.includes(muk),
      pending:store.state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name)
    };
  }
  assert.equal(nativeCanPlay,true);
  store.dispatch(new PlayCardAction(source.id,0,target));
  const pending=store.state.prompts.find(p=>p.result===undefined);
  assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt',
    'Paid Counter Catcher must offer source the target Bench Pokémon');
  assert.equal(pending.playerId,source.id);
  assert.ok(pending.validate([muk],store.state));
  const mukPhysicalId=muk.getPokemonCard()?.id;
  store.dispatch(new ResolvePromptAction(pending.id,[muk]));
  assert.equal(opponent.active.getPokemonCard()?.id,mukPhysicalId);
  assert.equal(source.discard.cards.some(c=>c.fullName==='Counter Catcher PAR'),true);
  const cologneIndex=source.hand.cards.findIndex(c=>c.fullName==='Canceling Cologne ASR');
  assert.ok(cologneIndex>=0);
  store.dispatch(new PlayCardAction(source.id,cologneIndex,target));
  assert.equal(source.discard.cards.some(c=>c.fullName==='Canceling Cologne ASR'),true);
  const afterBlocked=Boolean(IS_ABILITY_BLOCKED(store,store.state,source,egg,egg.powers[0]));
  let error=null;
  try{
    store.dispatch(new UseAbilityAction(source.id,'Propagation',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.DISCARD,
      index:source.discard.cards.indexOf(egg)
    }));
  }catch(e){error=String(e.message);}
  return {
    seat,sourceBehind,nativeCanPlay,nativeEligibilityError,afterBlocked,error,
    originalActiveId,mukPhysicalId,finalActiveId:opponent.active.getPokemonCard()?.id,
    sourcePrizeCount:source.prizes.length,opponentPrizeCount:opponent.prizes.length,
    mukStillBenched:opponent.bench.includes(muk),
    catcherDiscarded:source.discard.cards.some(c=>c.fullName==='Counter Catcher PAR'),
    cologneDiscarded:source.discard.cards.some(c=>c.fullName==='Canceling Cologne ASR'),
    eggInHand:source.hand.cards.some(c=>c.fullName==='Exeggcute PLF'),
    eggInDiscard:source.discard.cards.some(c=>c.fullName==='Exeggcute PLF'),
    pending:store.state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name)
  };
}
for(const seat of [0,1]){
  for(const sourceBehind of [true,false]){
    test('source Counter Catcher+Cologne vs Muk from Bench seat '+seat+
      ' behind='+sourceBehind,()=>{
      const row=catcherCologneContinuation(seat,sourceBehind);
      console.log('AGENT43_MUK_CATCHER_COLOGNE',JSON.stringify(row));
      if(sourceBehind){
        assert.equal(row.nativeCanPlay,true);
        assert.equal(row.afterBlocked,false);
        assert.equal(row.error,null);
        assert.equal(row.finalActiveId,row.mukPhysicalId);
        assert.equal(row.mukStillBenched,false);
        assert.equal(row.catcherDiscarded,true);
        assert.equal(row.cologneDiscarded,true);
        assert.equal(row.eggInHand,true);
        assert.equal(row.eggInDiscard,false);
      }else{
        assert.equal(row.nativeCanPlay,false);
        assert.equal(row.nativeEligibilityError,'CANNOT_PLAY_THIS_CARD');
        assert.equal(row.rejection,'CANNOT_PLAY_THIS_CARD');
        assert.equal(row.catcherHeld,true);
        assert.equal(row.finalActiveId,row.originalActiveId);
        assert.equal(row.mukStillBenched,true);
      }
      assert.deepEqual(row.pending,[]);
    });
  }
}
