'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {
  withGuzmaOwnerPromptContinuation
}=require('../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs');
const {
  nativeSinglePokemonChoices
}=require('../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));
const {Store}=native('game/store/store');
const {State,GamePhase}=native('game/store/state/state');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=
  native('game/store/actions/resolve-prompt-action');
const {SimpleTacticsAi}=
  native('simple-bot/simple-tactics-ai');
const {Format}=native('game/store/card/card-types');

/** A legally evolved active and two Basic Benched Pokémon, from real cards. */
function staged(seat){
  const manager=initializeCards();
  let physicalId=41000;
  const card=name=>{
    const item=manager.getCardByName(name);
    assert.ok(item,'Native original printing missing: '+name);
    item.id=physicalId++;
    return item;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.name='Owner';opponent.name='Opponent';
  owner.supporterTurn=0;
  owner.active.cards.push(card('Trubbish FST'),card('Garbodor BKP'));
  owner.active.energies.cards.push(card('Darkness Energy MEE'));
  opponent.active.cards.push(card('Galarian Articuno V CRE'));
  for(const player of [owner,opponent]){
    for(let n=0;n<5;n++)player.bench.push(new PokemonCardList());
    for(let n=0;n<15;n++)player.deck.cards.push(card('Psychic Energy MEE'));
    for(let n=0;n<6;n++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }
  owner.bench[0].cards.push(card('Crobat V DAA'));
  owner.bench[1].cards.push(card('Oranguru V ASR'));
  owner.bench[1].energies.cards.push(card('Darkness Energy MEE'));
  opponent.bench[0].cards.push(card('Lunatone OBF'));
  owner.hand.cards.push(card('Guzma BUS'));

  const state=new State();
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.turn=9;
  state.gameSettings.format=Format.EXPANDED;
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {store,state,owner,opponent,seat};
}

/** Native Store, native prompts, and a real physical choice in either seat.
 * @param {0|1} seat
 * @param {Function} [wrap] Optional complete canonical composition.
 */
function check(seat,wrap=withGuzmaOwnerPromptContinuation){
  const {store,state,owner,opponent}=staged(seat);
  const beforeOwn=owner.active.getPokemonCard()?.id;
  const intended=owner.bench[1].getPokemonCard()?.id;
  assert.ok(Number.isSafeInteger(beforeOwn));
  assert.ok(Number.isSafeInteger(intended));
  const botOriginal=SimpleTacticsAi.prototype.decodeNextAction;
  const dispatchOriginal=Store.prototype.dispatch;
  const observation=require('../simulation/twinleaf/actor-observation-contract.cjs').actorObservation(state,seat);
  const publicCatalog=require('../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs').publicCatalog();
  const planned=require('../simulation/twinleaf/agent2-held-guzma-mobility-frontier.cjs').chooseHeldGuzmaMobility(observation,publicCatalog);
  console.log('AG43_PREFLIGHT',JSON.stringify({seat,plan:planned}));
  const result=wrap(()=>{
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    let pending=state.prompts.find(p=>p.result===undefined);
    assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt');
    const offered=nativeSinglePokemonChoices(state,pending);
    const opposing=offered.find(x=>x.seat===1-seat&&
      x.zone==='bench'&&x.index===0);
    assert.ok(opposing,'Guzma must permit the public opponent Bench gust');
    store.dispatch(new ResolvePromptAction(pending.id,[opposing.physical]));
    assert.equal(opponent.active.getPokemonCard()?.fullName,'Lunatone OBF');
    pending=state.prompts.find(p=>p.result===undefined);
    assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt');
    const definitions=native('simple-bot/simple-bot-definitions');
    const botOptions={
      tactics:definitions.allSimpleTactics,
      promptResolvers:definitions.allPromptResolvers,
      scores:definitions.defaultStateScores,
      arbiter:definitions.defaultArbiterOptions
    };
    const menu=nativeSinglePokemonChoices(state,pending).map(x=>({
      seat:x.seat,zone:x.zone,index:x.index,
      printing:x.physical.getPokemonCard()?.fullName
    }));
    console.log('AG43_SECOND_PROMPT',JSON.stringify({seat,
      type:pending.playerType,message:pending.message,
      perspectiveId:pending.getPerspectivePlayerId(),menu}));
    const bot=new SimpleTacticsAi({id:owner.id},botOptions,null);
    const action=bot.decodeNextAction(state);
    assert.ok(action instanceof ResolvePromptAction);
    assert.equal(action.id,pending.id);
    assert.equal(action.result[0]?.getPokemonCard?.()?.fullName,'Oranguru V ASR',
      'Actor bridge should choose the funded second Bench slot');
    store.dispatch(action);
    return {
      actualActivePhysicalId:owner.active.getPokemonCard()?.id,
      actualActive:owner.active.getPokemonCard()?.fullName,
      opponentActive:opponent.active.getPokemonCard()?.fullName,
      handCount:owner.hand.cards.length,
      originalActiveId:beforeOwn
    };
  },{initialLiveStore:store,
    trace:event=>console.log('AG43_HANDOFF',JSON.stringify(event))});
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,botOriginal);
  assert.strictEqual(Store.prototype.dispatch,dispatchOriginal);
  assert.equal(result.result.actualActivePhysicalId,intended);
  assert.equal(result.result.actualActive,'Oranguru V ASR');
  assert.equal(result.result.handCount,0);
  const nativeAudit=result.audit.guzmaPromptAudit??result.audit;
  assert.equal(nativeAudit.acceptedGuzmaRoots,1);
  assert.equal(nativeAudit.guzmaHandConsumptionConfirmed,1);
  assert.equal(nativeAudit.matchedMobilityPlans,1);
  assert.equal(nativeAudit.ownTargetAcceptances,1);
  assert.equal(nativeAudit.ownTargetPhysicalConfirmations,1);
  assert.equal(nativeAudit.ownTargetPhysicalMismatches,0);
  assert.equal(nativeAudit.competitiveGameQualified,false);
  return {...result,audit:nativeAudit,
    canonicalAudit:result.audit.guzmaPromptAudit?result.audit:null};
}

test('native pinned Store seat A Guzma physically promotes the planned second Bench attacker',()=>{
  const result=check(0);
  assert.equal(result.audit.bySeat[0],1);
  assert.equal(result.audit.bySeat[1],0);
});

test('native pinned Store seat B Guzma physically promotes the same planned recipient',()=>{
  const result=check(1);
  assert.equal(result.audit.bySeat[0],0);
  assert.equal(result.audit.bySeat[1],1);
});

/** The existing canonical composition installs the real native Guzma bridge
 * beneath its prompt delegates. No competing full-game policy is created.
 * @param {()=>unknown} execute
 * @param {object} options Pinned Store injection from this test's real fixture.
 * @returns {{result:unknown,audit:object}}
 */
function composedNativeGuzma(execute,options){
  const transparent=run=>({result:run(),audit:{version:'test-pass-through'}});
  return withCanonicalActorOnlyPolicy(execute,{
    root:transparent,fog:transparent,select:transparent,
    option:transparent,attack:transparent,pokemon:transparent,
    guzma:run=>withGuzmaOwnerPromptContinuation(run,options)
  },{actorChoosePokemon:true,guzmaOwnerPromptContinuation:true});
}

test('canonical opt-in both-seat handoff reaches genuine Store Guzma prompt and physical Active',()=>{
  for(const seat of [0,1]){
    const result=check(seat,composedNativeGuzma);
    assert.ok(result.canonicalAudit,'This is the composed native path');
    assert.equal(result.canonicalAudit.guzmaOwnerPromptContinuationOptIn,true);
    assert.equal(result.canonicalAudit.nativeDecisionCounts.guzmaRootsAccepted,1);
    assert.equal(result.canonicalAudit.nativeDecisionCounts.guzmaOwnTargetConfirmed,1);
    assert.equal(result.canonicalAudit.nativeDecisionCounts.guzmaOwnTargetMismatched,0);
    assert.equal(result.canonicalAudit.nativeDecisionCounts.guzmaBySeat[seat],1);
    assert.equal(result.canonicalAudit.qualification.competitiveGames,0);
  }
});
