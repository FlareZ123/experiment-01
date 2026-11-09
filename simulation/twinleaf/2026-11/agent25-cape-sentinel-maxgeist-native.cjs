'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../headless.cjs');
const {planAichi}=require('../../evaluation/aichi-pilot.cjs');
const baseline=require('../../../results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json');
const capeCandidate=require('../../../results/aichi-2026/2026-11/agent25-cape-sentinel-v1.json');
const OUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));
const permissions={
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
};

/**
 * Source-printed physical 60 for each side, with exactly six hidden Prizes.
 * Both Vileplume and VMAX are deliberately established; no attempt is made
 * to credit the setup, energy acceleration, or opening-card frequency.
 * @param {{seat:0|1,cape:boolean}} spec
 */
function stage({seat,cape}) {
  const manager=initializeCards();
  const manifest=cape?capeCandidate:baseline;
  const plan=planAichi(manifest,permissions);
  assert.equal(plan.candidate.cards?.length,60,'Unresolved candidate cards');
  const opposing=plan.opponents.find(o=>o.rank===1);
  assert.equal(opposing?.cards?.length,60,'Unresolved source rank1 cards');
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),rank1=new Player();
  owner.id=101;owner.name=cape?'Cape Sentinel':'Original Sentinel';
  rank1.id=202;rank1.name='Aichi original rank1';
  state.players=seat===0?[owner,rank1]:[rank1,owner];
  state.activePlayer=1-seat;
  state.turn=3;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;

  const makeStock=(names,start)=>names.map((fullName,i)=>{
    const card=manager.getCardByName(fullName);
    assert.ok(card,'Native printing not registered: '+fullName);
    card.id=start+i;
    return card;
  });
  const candidateStock=makeStock(plan.candidate.cards,910000+seat*1000);
  const sourceStock=makeStock(opposing.cards,920000+seat*1000);

  /** @param {Array<object>} stock @param {string} name */
  const take=(stock,name)=>{
    const i=stock.findIndex(c=>c.fullName===name);
    assert.ok(i>=0,'Exact original 60 unavailable printing: '+name);
    return stock.splice(i,1)[0];
  };

  owner.active.cards.push(take(candidateStock,'Bunnelby PRC'));
  const vile=new PokemonCardList();
  for(const name of ['Oddish UNB','Gloom UNB','Vileplume AOR'])
    vile.cards.push(take(candidateStock,name));
  vile.pokemonPlayedTurn=1;
  if(cape)vile.tools.push(take(candidateStock,'Luxurious Cape PAR'));
  owner.bench.push(vile);

  rank1.active.cards.push(take(sourceStock,'Shadow Rider Calyrex V CRE'));
  rank1.active.pokemonPlayedTurn=1;
  const vmax=new PokemonCardList();
  for(const name of ['Shadow Rider Calyrex V CRE',
    'Shadow Rider Calyrex VMAX CRE'])
    vmax.cards.push(take(sourceStock,name));
  vmax.pokemonPlayedTurn=1;
  const energies=sourceStock.filter(c=>c.name==='Psychic Energy');
  assert.ok(energies.length>=4,'Original source rank1 needs four physical Psychic');
  vmax.energies.cards.push(...energies.slice(0,4));
  for(const card of energies.slice(0,4))
    sourceStock.splice(sourceStock.indexOf(card),1);
  rank1.bench.push(vmax);
  const mimikyu=new PokemonCardList();
  mimikyu.cards.push(take(sourceStock,'Mimikyu GRI'));
  rank1.bench.push(mimikyu);
  rank1.hand.cards.push(take(sourceStock,'Guzma BUS'));

  for(const [player,stock] of [[owner,candidateStock],[rank1,sourceStock]]){
    const six=stock.splice(0,6);
    player.prizes=six.map(card=>{
      const zone=new CardList();
      zone.cards.push(card);
      return zone;
    });
    player.deck.cards.push(...stock);
  }
  const count=(player)=>{
    const zones=[player.active,...player.bench];
    const attached=zones.flatMap(z=>[
      ...z.cards,...z.energies.cards,...z.tools]);
    return [...attached,...player.hand.cards,...player.deck.cards,
      ...player.discard.cards,...player.lostzone.cards,
      ...player.supporter.cards,...player.stadium.cards,
      ...player.prizes.flatMap(z=>z.cards)];
  };
  assert.equal(count(owner).length,60);
  assert.equal(count(rank1).length,60);
  assert.equal(new Set(count(owner).map(c=>c.id)).size,60);
  assert.equal(new Set(count(rank1).map(c=>c.id)).size,60);
  assert.equal(vile.getPokemonCard().fullName,'Vileplume AOR');
  assert.equal(vile.tools.length,cape?1:0);
  assert.equal(vmax.energies.cards.length,4);
  return {store,owner,rank1,state,seat,cape,count};
}

/** @param {{seat:0|1,cape:boolean}} spec */
function probe(spec){
  const x=stage(spec);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const index=x.rank1.hand.cards.findIndex(c=>c.fullName==='Guzma BUS');
  assert.equal(index,0);
  x.store.dispatch(new PlayCardAction(x.rank1.id,index,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  let prompt=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'ChoosePokemonPrompt');
  const benchVile=x.owner.bench.find(b=>b.getPokemonCard()?.fullName==='Vileplume AOR');
  assert.ok(benchVile);
  assert.equal(prompt.validate([benchVile],x.state),true);
  x.store.dispatch(new ResolvePromptAction(prompt.id,[benchVile]));
  prompt=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'ChoosePokemonPrompt');
  const benchedVmax=x.rank1.bench.find(b=>b.getPokemonCard()?.fullName===
    'Shadow Rider Calyrex VMAX CRE');
  assert.ok(benchedVmax);
  assert.equal(prompt.validate([benchedVmax],x.state),true);
  x.store.dispatch(new ResolvePromptAction(prompt.id,[benchedVmax]));
  assert.equal(x.owner.active.getPokemonCard().fullName,'Vileplume AOR');
  assert.equal(x.rank1.active.getPokemonCard().fullName,
    'Shadow Rider Calyrex VMAX CRE');
  assert.equal(x.rank1.active.energies.cards.length,4);
  assert.equal(x.rank1.supporterTurn,1);
  const oldPrizes=x.rank1.prizes.filter(z=>z.cards.length>0).length;
  x.store.dispatch(new AttackAction(x.rank1.id,'Max Geist'));
  const promptNames=[];
  for(let j=0;j<30;j++){
    prompt=x.store.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    const kind=prompt.constructor.name;
    promptNames.push(kind);
    let answer;
    if(kind==='WaitPrompt')answer=null;
    else if(kind==='ShowCardsPrompt')answer=true;
    else if(kind==='ShuffleDeckPrompt'){
      const p=x.store.state.players.find(z=>z.id===prompt.playerId);
      answer=p.deck.cards.map((_,i)=>i);
    }else if(kind==='ChoosePokemonPrompt'){
      const owner=x.store.state.players.find(z=>z.id===x.owner.id);
      const b=owner.bench.find(z=>z.getPokemonCard()?.fullName==='Bunnelby PRC');
      assert.ok(b,'KO promotion must find genuine Bunnelby');
      answer=[b];
    }else if(kind==='ChoosePrizePrompt'){
      const rank1=x.store.state.players.find(z=>z.id===x.rank1.id);
      answer=rank1.prizes.filter(z=>z.cards.length>0).slice(0,1);
    }
    assert.notEqual(answer,undefined,'Unhandled real Store '+kind);
    assert.equal(prompt.validate(answer,x.store.state),true,kind);
    x.store.dispatch(new ResolvePromptAction(prompt.id,answer));
  }
  assert.equal(x.store.hasPrompts(),false);
  const owner=x.store.state.players.find(p=>p.id===x.owner.id);
  const opponent=x.store.state.players.find(p=>p.id===x.rank1.id);
  const vileInDiscard=owner.discard.cards.some(c=>c.fullName==='Vileplume AOR');
  const vileStillActive=owner.active.getPokemonCard()?.fullName==='Vileplume AOR';
  const taken=oldPrizes-opponent.prizes.filter(z=>z.cards.length>0).length;
  if(x.cape){
    assert.equal(vileInDiscard,false);
    assert.equal(vileStillActive,true);
    assert.equal(owner.active.damage,130,'Four Psychic Max Geist must deal exactly 130');
    assert.equal(owner.active.getPokemonCard().hp,130);
    assert.equal(owner.active.tools[0].fullName,'Luxurious Cape PAR');
    assert.equal(taken,0);
  }else{
    assert.equal(vileInDiscard,true,'Unprotected Vileplume must be Knocked Out');
    assert.equal(vileStillActive,false);
    assert.equal(taken,1);
  }
  assert.equal(x.count(owner).length,60);
  assert.equal(x.count(opponent).length,60);
  return {
    candidateSeat:x.seat,hasCape:x.cape,
    originalOpponentPhysicalSixty:true,
    candidatePhysicalSixty:true,
    opponentOriginalGuzmaPaid:true,
    opponentPsychicEnergyAttached:4,
    attack:'Max Geist',printedDamage:130,
    actualKnockOut:vileInDiscard,
    VileplumeSurvivesWithCape:vileStillActive,
    opponentPrizesTaken:taken,
    nativePromptTypes:promptNames,
    competitorGames:0
  };
}

/** @returns {object} */
function run(){
  const cases=[];
  for(const seat of [0,1]){
    for(const cape of [false,true])
      cases.push(probe({seat,cape}));
  }
  assert.equal(cases.length,4);
  return {
    originalBaseline:'candidate-sentinel-lopunny-vileplume-v1',
    candidate:'agent25-cape-sentinel-v1',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    conditioning:'staged post-setup turn3 and original four paid Psychic; no setup probability',
    cases, competitivelyQualifiedGames:0
  };
}

module.exports={stage,probe,run};
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
