'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {probe}=require('./agent25-cape-paid-opening-native.cjs');
const {nativeSinglePokemonChoices}=
  require('../agent8-actor-only-choose-pokemon.cjs');
const OUTPUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));
const PSYCHIC='Psychic Energy';
const V='Shadow Rider Calyrex V CRE';
const VMAX='Shadow Rider Calyrex VMAX CRE';

/** Assert one copy per physical card and one complete printed 60. */
function partition(player){
  const cards=[...player.active.cards,...player.active.tools,
    ...player.bench.flatMap(b=>[...b.cards,...b.tools]),
    ...player.hand.cards,...player.deck.cards,...player.discard.cards,
    ...player.lostzone.cards,...player.supporter.cards,...player.stadium.cards,
    ...player.prizes.flatMap(z=>z.cards)];
  assert.equal(cards.length,60,'Original source printed 60 must be conserved');
  assert.equal(new Set(cards.map(c=>c.id)).size,60,
    'A physical card ID may occupy only one zone');
  return cards;
}

/**
 * Construct an explicitly conditioned possible original rank-1 turn-one
 * allocation. The opponent has played two V, attached one Basic Psychic to
 * a Benched V, and held two VMAX, Guzma and two further Psychic. Another
 * genuine Psychic is placed at the top of their remaining deck for their
 * first Underworld Door. Every card belongs to their unchanged printed 60.
 * @param {object} x Live native source fixture
 */
function prepareRank1(x){
  const p=x.f.defender;
  const source=partition(p);
  const original=source.map(c=>c.fullName).sort();
  const pool=source.slice();
  const take=name=>{
    const i=pool.findIndex(c=>c.fullName===name);
    assert.ok(i>=0,'Missing original rank1 '+name);
    return pool.splice(i,1)[0];
  };
  const takePsychic=()=>{
    const i=pool.findIndex(c=>c.name===PSYCHIC);
    assert.ok(i>=0,'Missing physical original rank1 Psychic');
    return pool.splice(i,1)[0];
  };
  const lead=take(V),bench=take(V),evolutionA=take(VMAX),
    evolutionB=take(VMAX),guzma=take('Guzma BUS'),
    prior=takePsychic(),held1=takePsychic(),
    held2=takePsychic(),deckTop=takePsychic();
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  p.active=new PokemonCardList();
  p.active.cards.push(lead);
  p.active.pokemonPlayedTurn=1;
  p.bench=Array.from({length:5},()=>new PokemonCardList());
  p.bench[0].cards.push(bench,prior);
  p.bench[0].energies.cards.push(prior);
  p.bench[0].pokemonPlayedTurn=1;
  p.hand.cards.splice(0,p.hand.cards.length,
    evolutionA,evolutionB,guzma,held1,held2);
  p.discard.cards.length=0;
  p.lostzone.cards.length=0;
  p.supporter.cards.length=0;
  p.stadium.cards.length=0;
  p.prizes=Array.from({length:6},()=>{
    const z=new CardList();
    z.cards.push(pool.shift());
    return z;
  });
  p.deck.cards.splice(0,p.deck.cards.length,deckTop,...pool);
  p.supporterTurn=0;
  p.energyPlayedTurn=1;
  assert.equal(p.deck.cards[0],deckTop);
  assert.deepEqual(partition(p).map(c=>c.fullName).sort(),original);
  assert.equal(x.state.turn,2,
    'Candidate must really act second on the original first-turn line');
}

/**
 * Execute original rank1's real two VMAX evolutions, both Underworld Doors,
 * manual Psychic attachment, paid Guzma, and 130-damage Max Geist.
 * All prompts are resolved on the live Store with physical offered cards.
 */
function resolveRank1(x){
  const p=x.f.defender,store=x.f.store,state=x.state;
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {UseAbilityAction,AttackAction}=
    native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const chosen=[];
  const settle=()=>{
    for(let n=0;n<30;n++){
      const pending=state.prompts.find(q=>q.result===undefined);
      if(!pending)return;
      const kind=pending.constructor.name;
      const answer=kind==='WaitPrompt'?null:
        kind==='ShowCardsPrompt'?true:
        kind==='ShuffleDeckPrompt'?
          state.players.find(z=>z.id===pending.playerId)
            .deck.cards.map((_,i)=>i):undefined;
      assert.notEqual(answer,undefined,'Unscripted source prompt '+kind);
      assert.equal(pending.validate(answer,state),true,kind);
      chosen.push(kind);
      store.dispatch(new ResolvePromptAction(pending.id,answer));
    }
    assert.fail('Unbounded source prompt settlement');
  };
  const playVMAX=(slot,index)=>{
    const i=p.hand.cards.findIndex(c=>c.fullName===VMAX);
    assert.ok(i>=0,'Original VMAX must be held');
    store.dispatch(new PlayCardAction(p.id,i,{
      player:PlayerType.BOTTOM_PLAYER,slot,index
    }));
  };
  playVMAX(SlotType.ACTIVE,0);
  playVMAX(SlotType.BENCH,0);
  assert.equal(p.active.getPokemonCard().fullName,VMAX);
  assert.equal(p.bench[0].getPokemonCard().fullName,VMAX);
  for(let n=0;n<2;n++){
    store.dispatch(new UseAbilityAction(p.id,'Underworld Door',{
      player:PlayerType.BOTTOM_PLAYER,
      slot:n===0?SlotType.ACTIVE:SlotType.BENCH,index:0
    }));
    for(let i=0;i<8;i++){
      const q=state.prompts.find(z=>z.result===undefined);
      if(q?.constructor.name!=='WaitPrompt')break;
      store.dispatch(new ResolvePromptAction(q.id,null));
      chosen.push('WaitPrompt');
    }
    const q=state.prompts.find(z=>z.result===undefined);
    assert.equal(q?.constructor.name,'AttachEnergyPrompt');
    const psychic=p.hand.cards.find(c=>c.name===PSYCHIC);
    assert.ok(psychic,'Native Underworld Door must pay a real Psychic');
    const assignment=[{
      to:{player:PlayerType.BOTTOM_PLAYER,
        slot:SlotType.BENCH,index:0},card:psychic
    }];
    assert.equal(q.validate(assignment,state),true);
    chosen.push('AttachEnergyPrompt');
    store.dispatch(new ResolvePromptAction(q.id,assignment));
    settle();
  }
  const i=p.hand.cards.findIndex(c=>c.name===PSYCHIC);
  assert.ok(i>=0);
  store.dispatch(new PlayCardAction(p.id,i,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  }));
  assert.equal(p.bench[0].energies.cards.length,4);
  assert.equal(p.energyPlayedTurn,state.turn);
  const guzma=p.hand.cards.findIndex(c=>c.fullName==='Guzma BUS');
  assert.ok(guzma>=0);
  store.dispatch(new PlayCardAction(p.id,guzma,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  let q=state.prompts.find(z=>z.result===undefined);
  assert.equal(q?.constructor.name,'ChoosePokemonPrompt');
  const vile=nativeSinglePokemonChoices(state,q).find(a=>
    a.seat===x.seat&&
    a.physical.getPokemonCard()?.fullName==='Vileplume AOR');
  assert.ok(vile);
  assert.equal(q.validate([vile.physical],state),true);
  chosen.push('ChoosePokemonPrompt');
  store.dispatch(new ResolvePromptAction(q.id,[vile.physical]));
  q=state.prompts.find(z=>z.result===undefined);
  assert.equal(q?.constructor.name,'ChoosePokemonPrompt');
  const powered=nativeSinglePokemonChoices(state,q).find(a=>
    a.seat===1-x.seat&&
    a.physical.getPokemonCard()?.fullName===VMAX&&
    a.physical.energies.cards.length===4);
  assert.ok(powered);
  assert.equal(q.validate([powered.physical],state),true);
  chosen.push('ChoosePokemonPrompt');
  store.dispatch(new ResolvePromptAction(q.id,[powered.physical]));
  assert.equal(p.active.getPokemonCard().fullName,VMAX);
  assert.equal(p.active.energies.cards.length,4);
  assert.equal(x.owner.active.getPokemonCard().fullName,'Vileplume AOR');
  const before=p.prizes.filter(z=>z.cards.length>0).length;
  assert.equal(p.supporterTurn,1,'Guzma must be paid on source turn');
  store.dispatch(new AttackAction(p.id,'Max Geist'));
  settle();
  const active=x.owner.active;
  const after=p.prizes.filter(z=>z.cards.length>0).length;
  assert.equal(active.getPokemonCard()?.fullName,'Vileplume AOR');
  assert.equal(active.tools[0]?.fullName,'Luxurious Cape PAR');
  assert.equal(active.damage,130);
  assert.equal(before-after,0);
  partition(p);
  partition(x.owner);
  return {rank1UsedTwoNativeUnderworldDoors:true,
    rank1RealManualPsychic:true,rank1FourPhysicalPsychic:true,
    rank1RealGuzma:true,rank1RealMaxGeist:true,
    actualDamageToCapedVileplume:active.damage,
    actualOpponentPrizeGain:before-after,
    candidateVileplumeStillActive:true,
    promptTypes:chosen,fullGameTerminal:false,
    competitiveGames:0};
}

function run(){
  const rows=[probe(0,{prepareOpponent:prepareRank1,
    resolveReply:resolveRank1}),
  probe(1,{prepareOpponent:prepareRank1,
    resolveReply:resolveRank1})];
  for(const row of rows){
    assert.equal(row.actualFirstTurnPaidCape,true);
    assert.equal(row.reply.rank1RealMaxGeist,true);
    assert.equal(row.reply.actualOpponentPrizeGain,0);
  }
  return {scenario:'One continuous paid Cape opening and real accelerated Max Geist reply',
    originalPrintedSixties:true,sourceConditioned:true,
    nativeSourceOriginalRank1:true,fieldGamesQualified:0,rows};
}
module.exports={prepareRank1,resolveRank1,run};
if(require.main===module)
  process.stdout.write('AGENT25_CONTINUOUS_CAPE_MAXGEIST '+
    JSON.stringify(run())+'\n');
