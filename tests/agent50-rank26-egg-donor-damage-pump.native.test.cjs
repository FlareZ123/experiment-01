'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {planAichi} = require('../simulation/evaluation/aichi-pilot.cjs');
const sourceFullNames=planAichi(26,{
  allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
}).candidate.cards;
assert.ok(sourceFullNames?.length===60,'original rank26 must resolve all 60 in native Store');
const load = name => require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',name));
const {Store} = load('game/store/store');
const {Player} = load('game/store/state/player');
const {CardList} = load('game/store/state/card-list');
const {PokemonCardList} = load('game/store/state/pokemon-card-list');
const {GamePhase} = load('game/store/state/state');
const {Format} = load('game/store/card/card-types');
const {PlayCardAction,PlayerType,SlotType} =
  load('game/store/actions/play-card-action');
const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
let nextId = 50500;

/**
 * Source-owned actual native Store at the one-Pump threshold.
 * This is a physically staged original-printing state, not a shuffled game.
 * @param {0|1} seat
 * @param {'melo-two'|'koko-two'|'egg-one'} variant
 */
function stage(seat,variant) {
  const manager=initializeCards();
  const make=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Pinned original printing missing '+name);
    c.id=nextId++;
    return c;
  };
  const source=new Player();source.id=101;
  const defender=new Player();defender.id=202;
  source.bench=Array.from({length:5},()=>new PokemonCardList());
  defender.bench=Array.from({length:5},()=>new PokemonCardList());
  source.active.cards.push(make(
    [...new Set(sourceFullNames.filter(name=>name.startsWith('Squawkabilly ex ')))][0]
  ));
  defender.active.cards.push(make('Shadow Rider Calyrex V CRE'));
  // Use only native names admitted by the original printed-60 resolver.
  // Original BLK and TEU set labels are not necessarily Twinleaf fullName tokens.
  const sourceCard=label=>{
    const sourceMatches=[...new Set(sourceFullNames.filter(name=>
      name.startsWith(label+' ') || name===label))];
    assert.equal(sourceMatches.length,1,'expected one original source printing for '+label+
      ' but saw '+JSON.stringify(sourceMatches));
    return make(sourceMatches[0]);
  };
  const melo=sourceCard('Meloetta ex');
  const koko=sourceCard('Tapu Koko');
  const a=sourceCard('Exeggcute'),b=sourceCard('Exeggcute');
  for(const [slot,c] of [[0,melo],[1,koko],[2,a],[3,b]]){
    source.bench[slot].cards.push(c);
  }
  source.bench[0].damage=variant==='melo-two'?20:0;
  source.bench[1].damage=variant==='koko-two'?20:0;
  source.bench[2].damage=20;
  source.bench[3].damage=20;
  const pump=sourceCard('Damage Pump');
  source.hand.cards.push(pump);
  // Six source Prizes; opponent already took 0/2/4 on the intended line.
  const opponentRemaining=variant==='melo-two'?6:variant==='koko-two'?4:2;
  for(const player of [source,defender]) {
    player.prizes=Array.from({length:6},(_,i)=>{
      const slot=new CardList();
      if(player===source||i<opponentRemaining)
        slot.cards.push(make('Psychic Energy SVE'));
      return slot;
    });
    for(let i=0;i<8;i++)player.deck.cards.push(make('Psychic Energy SVE'));
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[source,defender]:[defender,source];
  state.turn=1;state.activePlayer=seat;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  assert.equal(defender.getPrizeLeft(),opponentRemaining);
  assert.equal(source.bench[3].damage,20);
  return {store,state,source,defender,pump,melo,koko,a,b,variant,seat,
    opponentRemaining};
}

/** Use only real Store actions and real owner-visible native prompt. */
function perform(x) {
  const source=x.source;
  x.store.dispatch(new PlayCardAction(source.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const seen=[];
  const transfers=x.variant==='egg-one' ? [{
    from:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:3},
    to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:2}
  }] : [2,3].map(index=>({
    from:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
      index:x.variant==='melo-two'?0:1},
    to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index}
  }));
  let paid=false;
  for(let i=0;i<12;i++){
    const p=x.state.prompts.find(row=>row.result===undefined);
    if(!p)break;
    seen.push(p.constructor.name);
    if(p.constructor.name==='MoveDamagePrompt'){
      assert.equal(p.playerId,source.id);
      assert.equal(p.validate(transfers,x.state),true,
        'real native prompt must accept one physical original donor');
      x.store.dispatch(new ResolvePromptAction(p.id,transfers));
      paid=true;
    }else if(p.constructor.name==='ChoosePrizePrompt'){
      assert.equal(p.playerId,x.defender.id,
        'self-KO awards a genuine opponent-owned Prize choice');
      const first=x.defender.prizes.findIndex(slot=>slot.cards.length>0);
      assert.ok(first>=0);
      const decoded=[
        {tag:'number',value:first},
        {tag:'array',value:[first]},
        {tag:'selected-prize',value:[x.defender.prizes[first]]}
      ].filter(row=>{
        try{return p.validate(row.value,x.state)===true;}
        catch{return false;}
      });
      assert.ok(decoded.length>0,JSON.stringify({
        kind:p.constructor.name,promptKeys:Object.keys(p),
        options:p.options??null,first,
        validator:String(p.validate).slice(0,1000)
      }));
      x.store.dispatch(new ResolvePromptAction(p.id,decoded[0].value));
    }else if(p.constructor.name==='WaitPrompt'){
      x.store.dispatch(new ResolvePromptAction(p.id,null));
    }else throw new Error('Unexpected native Damage Pump prompt '+p.constructor.name);
  }
  assert.equal(paid,true,'actual MoveDamagePrompt must be reached');
  assert.equal(x.state.prompts.some(p=>p.result===undefined),false);
  return {seen,transfers};
}

for(const seat of [0,1]){
  for(const variant of ['melo-two','koko-two','egg-one']){
    test('native original rank26 '+variant+' Damage Pump in physical seat '+seat,()=>{
      const x=stage(seat,variant);
      const {seen,transfers}=perform(x);
      const doubled=variant!=='egg-one';
      assert.equal(x.source.bench[2].getPokemonCard(),null,
        'first recipient Exeggcute at 30 damage should KO');
      assert.equal(x.source.discard.cards.includes(x.a),true);
      assert.equal(x.defender.getPrizeLeft(),x.opponentRemaining-(doubled?2:1),
        'only actual 30-HP self-KOs award opponent prizes');
      if(doubled){
        assert.equal(x.source.bench[3].getPokemonCard(),null);
        assert.ok(x.source.discard.cards.includes(x.b));
      }else{
        assert.strictEqual(x.source.bench[3].getPokemonCard(),x.b);
        assert.equal(x.source.bench[3].damage,10,
          'Egg donor must remain alive and ready as Koko second recipient');
      }
      assert.ok(x.source.discard.cards.includes(x.pump),
        'played Damage Pump must enter owner discard');
      console.log('AGENT50_RANK26_NATIVE_PUMP',JSON.stringify({
        seat,variant,seen,transfers,sourceEggAInDiscard:
          x.source.discard.cards.includes(x.a),
        sourceEggBInDiscard:x.source.discard.cards.includes(x.b),
        opponentPrizesAfter:x.defender.getPrizeLeft(),
        survivingEggDamage:x.source.bench[3].damage,
        paperQualifiedGame:false
      }));
    });
  }
}
