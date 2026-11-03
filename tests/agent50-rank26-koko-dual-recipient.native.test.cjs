'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const native=name=>require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {PowerEffect}=native('game/store/effects/game-effects');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
const {GamePhase}=native('game/store/state/state');
const {Format}=native('game/store/card/card-types');
const sourceFullNames=planAichi(26,{
  allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
}).candidate.cards;
assert.equal(sourceFullNames?.length,60);
let id=70000;

/** A deliberately staged original-printing source Ability opportunity. */
function stage(seat){
  const manager=initializeCards();
  const makePrefix=prefix=>{
    const matches=[...new Set(sourceFullNames.filter(n=>n.startsWith(prefix+' ')))];
    assert.equal(matches.length,1,prefix+' must have unique original printing');
    const c=manager.getCardByName(matches[0]);
    assert.ok(c,matches[0]);c.id=id++;
    return c;
  };
  const makeName=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,name);c.id=id++;
    return c;
  };
  const source=new Player(),defender=new Player();
  source.id=101;defender.id=202;
  source.bench=Array.from({length:5},()=>new PokemonCardList());
  defender.bench=Array.from({length:5},()=>new PokemonCardList());
  source.active.cards.push(makePrefix('Squawkabilly ex'));
  defender.active.cards.push(makeName('Shadow Rider Calyrex V CRE'));
  const melo=makePrefix('Meloetta ex'),egg=makePrefix('Exeggcute');
  const koko=makePrefix('Tapu Koko Prism Star');
  source.bench[0].cards.push(melo);
  source.bench[1].cards.push(egg);
  source.bench[1].damage=10;
  source.bench[2].cards.push(koko);
  const lightning=[makePrefix('Lightning Energy'),makePrefix('Lightning Energy')];
  source.discard.cards.push(...lightning);
  for(const p of [source,defender]){
    for(let j=0;j<6;j++){
      const q=new CardList();
      q.cards.push(makeName('Psychic Energy SVE'));p.prizes.push(q);
    }
    for(let j=0;j<8;j++)p.deck.cards.push(makeName('Psychic Energy SVE'));
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[source,defender]:[defender,source];
  state.turn=1;state.activePlayer=seat;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,source,defender,melo,egg,koko,lightning,seat};
}

for(const seat of [0,1]){
  test('original rank26 native Tapu Koko initial two-recipient offer seat '+seat,()=>{
    const x=stage(seat);
    const dance=x.koko.powers.find(p=>p.name==='Dance of the Ancients');
    assert.ok(dance,'original Koko Dance of the Ancients must be implemented');
    const before={sourceDiscard:x.source.discard.cards.length,
      meloEnergy:x.source.bench[0].energies.cards.length,
      eggEnergy:x.source.bench[1].energies.cards.length,
      kokoOnBench:x.source.bench[2].getPokemonCard()===x.koko};
    x.koko.reduceEffect(x.store,x.state,new PowerEffect(x.source,dance,x.koko));
    const offered=x.state.prompts.filter(p=>p.result===undefined);
    console.log('AGENT50_KOKO_INITIAL_NATIVE',JSON.stringify({
      seat,before,power:dance.name,
      offers:offered.map(p=>({
        kind:p.constructor.name,playerId:p.playerId,
        options:p.options,
        validateSignature:String(p.validate).slice(0,1600),
        decodeSignature:String(p.decode).slice(0,1600)
      })),
      meloEnergy:x.source.bench[0].energies.cards.length,
      eggEnergy:x.source.bench[1].energies.cards.length,
      sourceDiscard:x.source.discard.cards.length,
      lostKoko:x.source.lostzone.cards.includes(x.koko),
      actualSourceOnePrize:x.defender.getPrizeLeft()===1,
      nativeGameQualified:false
    }));
    assert.equal(offered.length,1,'expected a single native Energy assignment prompt');
    const prompt=offered[0];
    assert.equal(prompt.constructor.name,'AttachEnergyPrompt');
    assert.equal(prompt.options.differentTargets,true,
      'Koko must attach to two different Benched physical recipients');
    const assignments=[
      {index:0,card:x.lightning[0],
        to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0}},
      {index:1,card:x.lightning[1],
        to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1}}
    ];
    assert.equal(prompt.validate(assignments,x.state),true,
      'native dual-recipient physical assignment must validate');
    x.store.dispatch(new ResolvePromptAction(prompt.id,assignments));
    const actual={
      meloEnergy:x.source.bench[0].energies.cards.map(c=>c.fullName),
      eggEnergy:x.source.bench[1].energies.cards.map(c=>c.fullName),
      remainingLightningInDiscard:x.source.discard.cards
        .filter(c=>c.name==='Lightning Energy').length,
      kokoInLostZone:x.source.lostzone.cards.includes(x.koko),
      kokoStillOnBench:x.source.bench.some(s=>s.getPokemonCard()===x.koko),
      pending:x.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name)
    };
    console.log('AGENT50_KOKO_SETTLED_NATIVE',JSON.stringify({seat,actual}));
    assert.ok(x.source.bench[0].energies.cards.includes(x.lightning[0]));
    assert.ok(x.source.bench[1].energies.cards.includes(x.lightning[1]));
    assert.equal(actual.remainingLightningInDiscard,0);
    assert.equal(actual.kokoInLostZone,true);
    assert.equal(actual.kokoStillOnBench,false);
    assert.deepEqual(actual.pending,[]);
  });
}
