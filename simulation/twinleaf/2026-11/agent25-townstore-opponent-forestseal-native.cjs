'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stage,solve}=require('./agent25-townstore-cape-paid-search-native.cjs');
const {prepareRank1}=
  require('./agent25-cape-source-paid-maxgeist-reply-native.cjs');
const {nativeSinglePokemonChoices}=
  require('../agent8-actor-only-choose-pokemon.cjs');
const {withNumericShufflePromptValidation}=
  require('../agent33-shuffle-prompt-numeric-validation.cjs');
const {installForestSealSearchHook}=
  require('../forest-seal-search-hook.cjs');
const OUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));
const FSS='Forest Seal Stone SIT',GUZMA='Guzma BUS';
const CAPE='Luxurious Cape PAR';

/** Include every original physical card exactly once. */
function custody(p){
  const cards=[...p.active.cards,...p.active.tools,
    ...p.bench.flatMap(b=>[...b.cards,...b.tools]),
    ...p.hand.cards,...p.deck.cards,...p.discard.cards,
    ...p.lostzone.cards,...p.supporter.cards,...p.stadium.cards,
    ...p.prizes.flatMap(z=>z.cards)];
  assert.equal(cards.length,60);
  assert.equal(new Set(cards.map(c=>c.id)).size,60);
  return cards;
}

/** Change rank1's conditioned possible original deal, preserving its exact 60. */
function prepare(x){
  prepareRank1(x);
  const p=x.f.defender;
  const original=custody(p).map(c=>c.fullName).sort();
  const guzma=p.hand.cards.find(c=>c.fullName===GUZMA);
  assert.ok(guzma,'Base staged original rank1 holds native Guzma');
  // Preserve the top physical card for the mandatory next-turn source draw:
  // a Guzma moved to deck top would simply be redrawn before Town Store.
  const filler=p.deck.cards.findLast(c=>
    c.fullName!=='Forest Seal Stone SIT'&&
    c.fullName!=='Guzma BUS');
  assert.ok(filler);
  p.hand.cards.splice(p.hand.cards.indexOf(guzma),1,filler);
  p.deck.cards.splice(p.deck.cards.indexOf(filler),1,guzma);
  // If original source assigned the singleton Stone to a Prize, construct
  // a different possible opening Prize deal with a real deck filler.
  const prize=p.prizes.find(z=>z.cards[0]?.fullName===FSS);
  if(prize){
    const replacement=p.deck.cards.find(c=>c.fullName!==GUZMA);
    assert.ok(replacement);
    p.deck.cards.splice(p.deck.cards.indexOf(replacement),1);
    const stone=prize.cards.splice(0,1,replacement)[0];
    p.deck.cards.push(stone);
  }
  assert.equal(p.hand.cards.some(c=>c.fullName===GUZMA),false);
  assert.equal(p.deck.cards.some(c=>c.fullName===GUZMA),true);
  assert.equal(p.deck.cards.some(c=>c.fullName===FSS),true);
  assert.deepEqual(custody(p).map(c=>c.fullName).sort(),original);
}

/** Rank1 freely uses symmetric Stadium despite active Item lock. */
function reply(x){
  const p=x.f.defender,owner=x.owner,state=x.state,store=x.f.store;
  const {UseStadiumAction,UseAbilityAction}=
    native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const pending=()=>state.prompts.find(q=>q.result===undefined);
  const kinds=[];
  const settle=()=>{
    for(let i=0;i<24;i++){
      const q=pending();
      if(!q)return;
      const kind=q.constructor.name;
      const answer=kind==='WaitPrompt'?null:
        kind==='ShowCardsPrompt'?true:
        kind==='ShuffleDeckPrompt'?p.deck.cards.map((_,i)=>i):
        undefined;
      assert.notEqual(answer,undefined,'Unexpected opponent tool path '+kind);
      assert.equal(q.validate(answer,state),true,kind);
      store.dispatch(new ResolvePromptAction(q.id,answer));
      kinds.push(kind);
    }
    assert.fail('Opponent source tool prompt overflow');
  };
  const choose=printing=>{
    const q=pending();
    assert.equal(q?.constructor.name,'ChooseCardsPrompt');
    assert.equal(q.cards,p.deck);
    const card=p.deck.cards.find(c=>c.fullName===printing);
    assert.ok(card,'Original rank1 must own searchable '+printing);
    assert.equal(q.validate([card],state),true);
    store.dispatch(new ResolvePromptAction(q.id,[card]));
    kinds.push('ChooseCardsPrompt');
  };
  assert.equal(state.activePlayer,1-x.seat);
  assert.equal(owner.bench.some(b=>
    b.getPokemonCard()?.fullName==='Vileplume AOR' &&
    b.tools[0]?.fullName===CAPE),true);
  assert.equal(owner.stadium.cards.some(c=>
    c.fullName==='Town Store OBF'),true);
  assert.equal(p.hand.cards.some(c=>c.fullName===GUZMA),false);
  store.dispatch(new UseStadiumAction(p.id));
  choose(FSS);
  settle();
  assert.equal(p.hand.cards.some(c=>c.fullName===FSS),true);
  const fssIndex=p.hand.cards.findIndex(c=>c.fullName===FSS);
  store.dispatch(new PlayCardAction(p.id,fssIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.equal(p.active.tools[0]?.fullName,FSS);
  assert.equal(p.active.getPokemonCard()?.fullName,'Shadow Rider Calyrex V CRE');
  assert.equal(p.usedVSTAR,false);
  store.dispatch(new UseAbilityAction(p.id,'Star Alchemy',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  while(pending()?.constructor.name==='WaitPrompt'){
    const q=pending();
    store.dispatch(new ResolvePromptAction(q.id,null));
    kinds.push('WaitPrompt');
  }
  choose(GUZMA);
  settle();
  assert.equal(p.usedVSTAR,true);
  assert.equal(p.hand.cards.some(c=>c.fullName===GUZMA),true);
  const i=p.hand.cards.findIndex(c=>c.fullName===GUZMA);
  store.dispatch(new PlayCardAction(p.id,i,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  let q=pending();
  assert.equal(q?.constructor.name,'ChoosePokemonPrompt');
  const vile=nativeSinglePokemonChoices(state,q).find(z=>
    z.seat===x.seat&&z.physical.getPokemonCard()?.fullName==='Vileplume AOR');
  assert.ok(vile);
  store.dispatch(new ResolvePromptAction(q.id,[vile.physical]));
  q=pending();
  assert.equal(q?.constructor.name,'ChoosePokemonPrompt');
  const ownBench=nativeSinglePokemonChoices(state,q).find(z=>
    z.seat===1-x.seat&&z.physical.getPokemonCard()?.fullName===
      'Shadow Rider Calyrex V CRE');
  assert.ok(ownBench);
  store.dispatch(new ResolvePromptAction(q.id,[ownBench.physical]));
  assert.equal(owner.active.getPokemonCard()?.fullName,'Vileplume AOR');
  assert.equal(p.active.getPokemonCard()?.fullName,'Shadow Rider Calyrex V CRE');
  assert.equal(p.supporterTurn,1);
  assert.equal(store.hasPrompts(),false);
  custody(p);custody(owner);
  return {sourceInitiallyGuzmaUnheld:true,
    sourceUsedOpponentTurnTownStoreToolSearch:true,
    searchedPhysicalFSS:FSS,attachedActualFSS:true,
    sourceStarAlchemySpent:true,
    sourceStarAlchemyFetchedOriginalGuzma:true,
    sourceGenuineGuzmaPromotedCapeVileplume:true,
    symmetricSearchUnderIrritatingPollen:true,
    sourceFssSearchPromptPaperHook:true,
    actualFullGamesQualified:0,promptKinds:kinds};
}
function probe(seat){
  const x=stage(seat);
  prepare(x);
  const opening=solve(x);
  const response=reply(x);
  return {seat,opening,response,
    originalPrintedSixties:true,competitiveGames:0};
}
function run(){
  const restore=installForestSealSearchHook();
  try{
    const checked=withNumericShufflePromptValidation(()=>[probe(0),probe(1)]);
    assert.ok(checked.audit.checked>=4);
    return {candidate:'Town Store Cape Sentinel v1',
      experiment:'symmetric opponent Forest Seal Stone and paid Guzma',
      paperHooks:['Forest Seal minimum-one-card','numeric shuffle validator'],
      twoSeats:checked.result,
      shuffleAudit:checked.audit,competitiveGames:0};
  }finally{
    restore();
  }
}
module.exports={prepare,reply,probe,run};
if(require.main===module)
  process.stdout.write('AGENT25_TOWN_OPP_FSS '+JSON.stringify(run())+'\n');
