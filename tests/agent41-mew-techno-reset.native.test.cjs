'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {
  MEW,GENESECT,DCE,chooseGuzmaMewCooldownReset,
  chooseFreeRetreatToDceMew
}=require('../simulation/twinleaf/agent41-mew-techno-reset-frontier.cjs');
const {publicCatalog}=require(
  '../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs');
const {nativeSinglePokemonChoices}=require(
  '../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=relative=>require(path.join(OUTPUT,relative));
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const {Store}=native('game/store/store');
const {State,GamePhase}=native('game/store/state/state');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GameSettings}=native('game/core/game-settings');
const {Format}=native('game/store/card/card-types');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=native(
  'game/store/actions/resolve-prompt-action');
const {AttackAction,PassTurnAction,RetreatAction}=
  native('game/store/actions/game-actions');
const {AddPlayerAction}=native('game/store/actions/add-player-action');
const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
const {withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

/**
 * Fully physical staged Store: authentic exact printed rank5 attacker line,
 * genuine Mew V to VMAX evolution stacks, double-Colorless card and Genesect
 * donor, live opposing Mimikyu PAL and safe Lunatone OBF.
 * Snorlax PGO Block is independently excluded as a negative gust target. The staging replaces
 * opening draw/game history, so its conclusions remain unqualified.
 * @param {0|1} seat
 */
function stage(seat,opponentBenchPrinting='Lunatone OBF'){
  const manager=initializeCards();
  let nextId=85000+1000*seat;
  const card=fullName=>{
    const c=manager.getCardByName(fullName);
    assert.ok(c,'Native print missing: '+fullName);
    c.id=nextId++;
    return c;
  };
  const owner=new Player(),opp=new Player();
  owner.id=101;owner.name='Aichi rank5 original Mew source';
  opp.id=202;opp.name='Staged opponent Mimikyu/Lunatone';
  owner.active.cards.push(card('Mew V FST'),card(MEW));
  owner.active.pokemonPlayedTurn=1;
  const dce=card(DCE);
  owner.active.cards.push(dce);
  owner.active.energies.cards.push(dce);
  const donor=new PokemonCardList();
  donor.cards.push(card(GENESECT));
  const spare=new PokemonCardList();
  spare.cards.push(card('Mew V FST'),card(MEW));
  spare.pokemonPlayedTurn=1;
  owner.bench.push(donor,spare);
  opp.active.cards.push(card('Mimikyu PAL'));
  const gustTarget=new PokemonCardList();
  gustTarget.cards.push(card(opponentBenchPrinting));
  opp.bench.push(gustTarget);
  for(const player of [owner,opp]){
    for(let n=0;n<14;n++)
      player.deck.cards.push(card('Psychic Energy SVE'));
    for(let n=0;n<6;n++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state=new State();
  state.players=seat===0?[owner,opp]:[opp,owner];
  state.activePlayer=seat;
  state.turn=5;
  state.phase=GamePhase.PLAYER_TURN;
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;
  state.rules=settings.rules;
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {store,state,owner,opp,card,seat,catalog:publicCatalog(),
    originalMewId:owner.active.getPokemonCard().id,
    spareMewId:spare.getPokemonCard().id,
    opponentTargetId:gustTarget.getPokemonCard().id};
}

/** Resolve the actual native attack/KO/Prize prompt chain. */
function completeAttack(x,receipts){
  const {store,state,owner}=x;
  for(let i=0;i<64;i++){
    const prompt=state.prompts.find(p=>p.result===undefined);
    if(!prompt)return;
    const kind=prompt.constructor.name;
    let value;
    if(kind==='ChooseAttackPrompt'){
      assert.equal(prompt.playerId,owner.id);
      const genesect=prompt.cards.find(c=>c.fullName===GENESECT);
      assert.ok(genesect,'Authentic Genesect donor must appear in native menu');
      value=genesect.attacks.find(a=>a.name==='Techno Blast');
      assert.ok(value,'Techno Blast must be a printed option');
      assert.equal(prompt.validate(value),true);
    }else if(kind==='WaitPrompt')value=null;
    else if(kind==='ChoosePrizePrompt'){
      const viewer=state.players.find(p=>p.id===
        prompt.getPerspectivePlayerId());
      assert.ok(viewer);
      value=viewer.prizes.filter(p=>p.cards.length>0)
        .slice(0,prompt.options.count);
      assert.equal(prompt.validate(value,state),true);
    }else if(kind==='ChoosePokemonPrompt'){
      const choices=nativeSinglePokemonChoices(state,prompt);
      assert.ok(choices.length,'At least one native promotion target');
      value=[choices[0].physical];
      assert.equal(prompt.validate(value,state),true);
    }else assert.fail('Unexpected attack prompt: '+kind);
    store.dispatch(new ResolvePromptAction(prompt.id,value));
    receipts.push({id:prompt.id,kind,owner:prompt.playerId,
      accepted:prompt.result!==undefined});
  }
  assert.fail('Native attack prompts did not settle within 64 replies');
}

/**
 * Resolve exactly the announced native Guzma opponent and owner targets.
 * Both prompt menus are supplied by the real Store; no stored hand/deck
 * identities are consumed to choose either physical Bench recipient.
 */
function completeGuzma(x,plan,receipts){
  const {store,state,owner,seat}=x;
  for(const [expectedSeat,expectedIndex] of [
    [1-seat,plan.opponentBenchIndex],[seat,plan.benchIndex]
  ]){
    const pending=state.prompts.find(p=>p.result===undefined);
    assert.equal(pending?.constructor?.name,'ChoosePokemonPrompt');
    assert.equal(pending.playerId,owner.id);
    const choices=nativeSinglePokemonChoices(state,pending);
    const selected=choices.find(c=>c.seat===expectedSeat&&
      c.zone==='bench'&&c.index===expectedIndex);
    assert.ok(selected,'Actual native menu must include planned Bench index');
    assert.equal(pending.validate([selected.physical],state),true);
    store.dispatch(new ResolvePromptAction(pending.id,[selected.physical]));
    receipts.push({
      id:pending.id,kind:'ChoosePokemonPrompt',
      side:expectedSeat===seat?'own':'opponent',
      benchIndex:expectedIndex,
      physicalId:selected.physical.getPokemonCard()?.id??null,
      accepted:pending.result!==undefined
    });
  }
}

/**
 * Real pinned-Store same-turn owner reset, with explicit negative baseline
 * attempt and independently observed second attack, in one physical seat.
 * @param {0|1} seat
 */
function trial(seat){
  const x=stage(seat);
  const {store,catalog}=x;
  let {state,owner,opp}=x;
  const receipts=[];
  const beforePrizes=owner.prizes.filter(p=>p.cards.length>0).length;
  console.log('AGENT41_STAGE',seat,'first-copied-attack');
  store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike'));
  completeAttack(x,receipts);
  assert.equal(state.turn,6);
  // The native engine may store next-turn attack restrictions on a separate
  // deferred clock; the paper-relevant invariant is the next owner turn.
  const cooldownPendingAfterAttack=owner.active.cannotAttackNextTurnPending;
  console.log('AGENT41_STAGE',seat,'opponent-pass-after-first-copy');
  store.dispatch(new PassTurnAction(opp.id));
  completeAttack(x,receipts);
  assert.equal(state.turn,7);
  assert.equal(owner.active.cannotAttackNextTurn,true);
  assert.equal(owner.active.getPokemonCard().id,x.originalMewId);
  let lockedAttackRejected=false;
  try{store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike'));}
  catch(e){lockedAttackRejected=true;}
  assert.equal(lockedAttackRejected,true,
    'Control: native Store must reject immediate recopy while cooldown active');
  assert.equal(state.turn,7);
  // A rejected genuine native action rolls Store.state back to a deepClone.
  // Reacquire live board, owners, and all future prompt targets. Mutating the
  // obsolete Player object would fabricate owner-hand access to Guzma.
  assert.notStrictEqual(store.state,state,
    'Native rollback must not leave the rejected mutable State current');
  state=store.state;
  owner=state.players.find(p=>p.id===101);
  opp=state.players.find(p=>p.id===202);
  assert.ok(owner&&opp);
  Object.assign(x,{state,owner,opp});
  assert.equal(owner.active.cannotAttackNextTurn,true);
  console.log('AGENT41_STAGE',seat,'after-illegal-control-before-adding-guzma');
  owner.hand.cards.push(x.card('Guzma BUS'));
  console.log('AGENT41_STAGE',seat,'before-owner-observation');
  const view=actorObservation(state,seat);
  console.log('AGENT41_STAGE',seat,'before-guzma-selector');
  const proposal=chooseGuzmaMewCooldownReset(view,catalog);
  assert.equal(proposal?.kind,'play-guzma-mew-cooldown-reset');
  assert.equal(proposal.benchIndex,1);
  assert.equal(proposal.opponentBenchIndex,0);
  const oldSupporter=owner.supporterTurn;
  const originalDce=owner.active.energies.cards[0];
  const beforeGuzma=rootPhysicalSnapshot(state,seat,proposal);
  console.log('AGENT41_STAGE',seat,'before-native-guzma',JSON.stringify({
    handIndex:proposal.handIndex,
    selectedHand:owner.hand.cards[proposal.handIndex]?.fullName??null,
    ownerHand:owner.hand.cards.map(c=>c.fullName),
    activeSeat:state.activePlayer,
    activePlayerId:state.players[state.activePlayer]?.id??null,
    ownerId:owner.id,phase:state.phase,globalTurn:state.turn,
    supporterTurn:owner.supporterTurn,
    status:owner.active.cannotAttackNextTurn
  }));
  try {
    store.dispatch(new PlayCardAction(owner.id,proposal.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  } catch(e){
    console.error('AGENT41_GUZMA_STORE_ERROR',JSON.stringify({seat,
      error:String(e),stack:e?.stack??null,
      currentHand:owner.hand.cards.map(c=>c.fullName),
      pending:state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor?.name??null)
    }));
    throw e;
  }
  const afterGuzma=rootPhysicalSnapshot(state,seat,proposal);
  console.log('AGENT41_STAGE',seat,'before-guzma-prompts');
  completeGuzma(x,proposal,receipts);
  assert.equal(owner.active.getPokemonCard().id,x.spareMewId);
  assert.equal(owner.bench[1].getPokemonCard().id,x.originalMewId);
  assert.equal(owner.bench[1].energies.cards[0],originalDce);
  const cooldownAfterGuzma=owner.bench[1].cannotAttackNextTurn;
  const supporterSpent=rootPhysicalWitness(proposal,beforeGuzma,
    afterGuzma,GamePhase);
  const nextPlan=chooseFreeRetreatToDceMew(
    actorObservation(state,seat),catalog);
  assert.equal(nextPlan?.kind,'free-retreat',
    'Native moved-to-Bench original Mew must lose copied cooldown');
  const beforeRetreat=rootPhysicalSnapshot(state,seat,nextPlan);
  console.log('AGENT41_STAGE',seat,'before-native-return-retreat');
  store.dispatch(new RetreatAction(owner.id,nextPlan.benchIndex));
  // A zero-cost Mew VMAX Retreat normally needs no discard prompt.
  for(let i=0;i<20;i++){
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    assert.equal(pending.constructor.name,'WaitPrompt');
    store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  const afterRetreat=rootPhysicalSnapshot(state,seat,nextPlan);
  assert.equal(owner.active.getPokemonCard().id,x.originalMewId);
  assert.equal(owner.bench[1].getPokemonCard().id,x.spareMewId);
  assert.equal(owner.active.energies.cards[0],originalDce);
  assert.equal(owner.retreatedTurn,7);
  const returnConfirmed=rootPhysicalWitness(nextPlan,
    beforeRetreat,afterRetreat,GamePhase);
  assert.equal(returnConfirmed,'confirmed-public-effect');
  console.log('AGENT41_STAGE',seat,'before-native-second-copy');
  const secondBefore=owner.active.cannotAttackNextTurn;
  assert.equal(secondBefore,false,
    'Second Cross Fusion Strike needs genuinely reset current restriction');
  store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike'));
  completeAttack(x,receipts);
  const newPrizes=owner.prizes.filter(p=>p.cards.length>0).length;
  assert.equal(newPrizes,beforePrizes-1,
    'Source must actually take safe gust-target Prize after same-turn reset');
  assert.equal(state.turn,8,'Second genuine attack must end owner turn');
  const result={
    schema:'agent41-mew-techno-reset-guzma-native-staged-v1',
    pinnedTwinleaf:PIN,attackerSeat:seat,
    originalMewPhysicalId:x.originalMewId,
    temporaryMewPhysicalId:x.spareMewId,
    opponentTargetPhysicalId:x.opponentTargetId,
    firstAttackDeclared:true,cooldownPendingAfterAttack,
    lockedAttackRejected,
    originalCooldownBeforeGuzma:true,
    originalCooldownAfterGuzma:cooldownAfterGuzma,
    guzmaSupporterTurnBefore:oldSupporter,
    guzmaSupporterTurnAfter:owner.supporterTurn,
    guzmaSupporterSpendWitness:supporterSpent,
    nativeGuzmaPromptReceipts:receipts.filter(r=>
      r.kind==='ChoosePokemonPrompt'&&r.benchIndex!==undefined),
    nativeReturnRetreatWitness:returnConfirmed,
    afterReturnAttackDeclared:true,
    prizesBefore:beforePrizes,prizesAfter:newPrizes,
    finalGlobalTurn:state.turn,
    pairedNaturalGame:false,
    fullOriginal60:false,
    competitiveQualified:false
  };
  console.log('AGENT41_MEW_RESET_NATIVE_STAGED',JSON.stringify(result));
  return result;
}

for(const seat of [0,1]){
  test('staged pinned-Store original Mew cooldown Guzma-return attack, seat '+seat,
    ()=>trial(seat));
}

/**
 * Two additional constructed physical seats validate the actual active
 * canonical owner-root bridge, rather than manually dispatching each pure
 * intent. Real Store handles all cards, both Guzma prompts and returned attack.
 * Its AddPlayerAction records the staged Store for reversible actor adapters,
 * and is a setup-phase no-op once the synthetic board is already live.
 */
function actorRootTrial(seat){
  const x=stage(seat);
  const {store,state,owner,opp}=x;
  const replies=[];
  store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike'));
  completeAttack(x,replies);
  store.dispatch(new PassTurnAction(opp.id));
  completeAttack(x,replies);
  assert.equal(state.turn,7);
  assert.equal(owner.active.cannotAttackNextTurn,true);
  owner.hand.cards.push(x.card('Guzma BUS'));
  const firstPlan=chooseGuzmaMewCooldownReset(
    actorObservation(store.state,seat),x.catalog);
  assert.equal(firstPlan?.kind,'play-guzma-mew-cooldown-reset');

  const first=withActorOnlyRootPolicy(()=>{
    store.dispatch(new AddPlayerAction(owner.id,owner.name,[]));
    const action=new SimpleTacticsAi({id:owner.id},
      {tactics:[],promptResolvers:[]},null).decodeNextAction(store.state);
    assert.ok(action instanceof PlayCardAction);
    assert.equal(action.handIndex,firstPlan.handIndex);
    store.dispatch(action);
    return action;
  },{mewTechnoReset:true});
  assert.equal(first.audit.typedIntentCounts['play-guzma-mew-cooldown-reset'],1);
  assert.equal(store.state.prompts.filter(p=>p.result===undefined).length,1);
  completeGuzma(x,firstPlan,replies);
  assert.equal(owner.active.getPokemonCard().id,x.spareMewId);
  assert.equal(owner.bench[1].cannotAttackNextTurn,false);

  const beforeRetreat=rootPhysicalSnapshot(store.state,seat,{
    kind:'free-retreat',benchIndex:1,printing:MEW
  });
  const second=withActorOnlyRootPolicy(()=>{
    store.dispatch(new AddPlayerAction(owner.id,owner.name,[]));
    const action=new SimpleTacticsAi({id:owner.id},
      {tactics:[],promptResolvers:[]},null).decodeNextAction(store.state);
    assert.ok(action instanceof RetreatAction);
    assert.equal(action.benchIndex,1);
    store.dispatch(action);
    return action;
  },{mewTechnoReset:true});
  assert.equal(second.audit.typedIntentCounts['free-retreat'],1);
  assert.equal(owner.active.getPokemonCard().id,x.originalMewId);
  assert.equal(rootPhysicalWitness(
    {kind:'free-retreat',benchIndex:1,printing:MEW},
    beforeRetreat,
    rootPhysicalSnapshot(store.state,seat,{
      kind:'free-retreat',benchIndex:1,printing:MEW
    }),
    GamePhase),'confirmed-public-effect');
  store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike'));
  completeAttack(x,replies);
  assert.equal(owner.prizes.filter(p=>p.cards.length>0).length,5);
  assert.equal(store.state.turn,8);
  console.log('AGENT41_MEW_RESET_NATIVE_ACTOR',JSON.stringify({
    pinnedTwinleaf:PIN,seat,firstNativeActorIntent:'play-guzma-mew-cooldown-reset',
    secondNativeActorIntent:'free-retreat',
    rootGuzmaNativeAccepted:first.audit.nativePhysicalConfirmations??null,
    rootRetreatNativeAccepted:second.audit.nativePhysicalConfirmations??null,
    actualPrizesRemaining:5,fullOriginal60:false,
    competitiveQualified:false
  }));
  return {first,second};
}

for(const seat of [0,1]){
  test('native owner root executes actual staged Mew reset in seat '+seat,
    ()=>actorRootTrial(seat));
}


/**
 * Falsifying counterpart to the positive native test. A public print target
 * with active Block makes the proposed free retreat illegal even if the spare
 * Mew has zero printed Retreat. The planner veto must precede the attempted
 * card play; forcing the root here is only an engine-specific negative test.
 */
function snorlaxBlockTrial(seat){
  const x=stage(seat,'Snorlax PGO');
  const {state,store,owner,opp}=x;
  const receipts=[];
  store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike'));
  completeAttack(x,receipts);
  store.dispatch(new PassTurnAction(opp.id));
  completeAttack(x,receipts);
  assert.equal(state.turn,7);
  assert.equal(owner.active.cannotAttackNextTurn,true);
  owner.hand.cards.push(x.card('Guzma BUS'));
  assert.equal(chooseGuzmaMewCooldownReset(
    actorObservation(store.state,seat),x.catalog),null,
  'The conservative planner must reject a sole opponent Snorlax Block target');
  const plan={kind:'play-guzma-mew-cooldown-reset',
    handIndex:owner.hand.cards.length-1,
    opponentBenchIndex:0,benchIndex:1,printing:'Guzma BUS'};
  store.dispatch(new PlayCardAction(owner.id,plan.handIndex,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  completeGuzma(x,plan,receipts);
  assert.equal(owner.active.getPokemonCard().id,x.spareMewId);
  assert.equal(opp.active.getPokemonCard().fullName,'Snorlax PGO');
  assert.throws(
    ()=>store.dispatch(new RetreatAction(owner.id,1)),
    error=>{
      assert.equal(error.message,'BLOCKED_BY_EFFECT');
      return true;
    }
  );
  console.log('AGENT41_MEW_RESET_BLOCK_VETO',JSON.stringify({
    seat,pinnedTwinleaf:PIN,forcedOpponentActive:'Snorlax PGO',
    realGuzmaPrompts:receipts.filter(r=>r.benchIndex!==undefined).length,
    zeroRetreatNative:'BLOCKED_BY_EFFECT',guardedPlannerProposals:0,
    competitiveQualified:false
  }));
}
for(const seat of [0,1]){
  test('native Snorlax Block correctly vetoes staged Mew reset in seat '+seat,
    ()=>snorlaxBlockTrial(seat));
}

module.exports={stage,completeAttack,completeGuzma,trial,actorRootTrial,
  snorlaxBlockTrial};
