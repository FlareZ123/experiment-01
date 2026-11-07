'use strict';

const assert=require('node:assert/strict');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('./headless.cjs');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(output,name));
const {installCopycatMultiAttackHistory,dispatchCopycatWithSelectedHistory}=require('./copycat-multiattack-history.cjs');

/** @param {object} prompt @returns {any[]} */
function promptCardChoices(prompt){
  const value=prompt.cards;
  if(Array.isArray(value))return value;
  if(Array.isArray(value?.cards))return value.cards;
  return [];
}

/** @param {object} x @param {object} prompt @returns {number[]} */
function deterministicShuffleOrder(x,prompt){
  const player=x.state.players.find(value=>value.id===prompt.getPerspectivePlayerId());
  assert.ok(player,'Shuffle prompt must identify its deck owner');
  const count=player.deck.cards.length;
  const order=Array.from({length:count},(_,index)=>count-1-index);
  assert.equal(prompt.validate(order,x.state),true);
  return order;
}

/** @param {object} x Resolve Burrow reveal, Omega Barrage choice, and Wait prompts. */
function settlePrompts(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {GameMessage}=native('game/game-message');
  const resolved=[];
  for(let n=0;n<24;n++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)return resolved;
    const kind=prompt.constructor.name;
    if(kind==='ConfirmPrompt'&&prompt.message===GameMessage.WANT_TO_USE_ABILITY){
      assert.equal(prompt.playerId,x.owner.id,
        'Only the Bunnelby owner should receive its Omega Barrage prompt');
      resolved.push(kind);
      x.store.dispatch(new ResolvePromptAction(prompt.id,false));
      continue;
    }
    if(kind==='ShowCardsPrompt'&&
        prompt.message===GameMessage.CARDS_SHOWED_BY_THE_OPPONENT){
      resolved.push(kind);
      x.store.dispatch(new ResolvePromptAction(prompt.id,null));
      continue;
    }
    if(kind==='ShuffleDeckPrompt'){
      resolved.push(kind);
      x.store.dispatch(new ResolvePromptAction(prompt.id,deterministicShuffleOrder(x,prompt)));
      continue;
    }
    assert.equal(kind,'WaitPrompt',
      'Unexpected prompt in native Burrow/Copycat sequence: '+kind);
    resolved.push(kind);
    x.store.dispatch(new ResolvePromptAction(prompt.id,null));
  }
  assert.fail('Native Copycat/Burrow prompt sequence did not settle');
}

/**
 * Execute a naturally sequenced Bunnelby Burrow followed by Mimikyu Copycat
 * through the pinned Store. The first Burrow discards from Mimikyu's deck;
 * the copied Burrow must discard from Bunnelby's deck.
 * @param {0|1} sourceSeat Physical seat that starts with Bunnelby.
 * @returns {object} Detached physical-zone and attack-history evidence.
 */
function probe(sourceSeat){
  const x=stage(sourceSeat);
  const manager=initializeCards();
  let id=95000+sourceSeat*100;
  /** @param {string} name */
  const card=name=>{
    const value=manager.getCardByName(name);
    assert.ok(value,'Native card unavailable: '+name);
    value.id=id++;
    return value;
  };

  const bunnelby=card('Bunnelby PRC');
  const bunnelbyEnergyA=card('Psychic Energy SVE');
  const bunnelbyEnergyB=card('Psychic Energy SVE');
  const mimikyu=card('Mimikyu GRI');
  const mimikyuEnergyA=card('Psychic Energy SVE');
  const mimikyuEnergyB=card('Psychic Energy SVE');

  for(const player of [x.owner,x.opponent]){
    player.hand.cards.length=0;
    for(const slot of player.bench){
      slot.cards.length=0;
      slot.energies.cards.length=0;
    }
  }

  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(bunnelby,bunnelbyEnergyA,bunnelbyEnergyB);
  x.owner.active.energies.cards.push(bunnelbyEnergyA,bunnelbyEnergyB);

  x.opponent.active.cards.length=0;
  x.opponent.active.energies.cards.length=0;
  x.opponent.active.cards.push(mimikyu,mimikyuEnergyA,mimikyuEnergyB);
  x.opponent.active.energies.cards.push(mimikyuEnergyA,mimikyuEnergyB);

  x.state.activePlayer=sourceSeat;
  x.state.turn=2;
  x.state.phase=x.GamePhase.PLAYER_TURN;

  const {AttackAction}=native('game/store/actions/game-actions');
  const candidateDeckTopBeforeBurrow=x.opponent.deck.cards.slice(0,2);
  const candidateDeckBeforeBurrow=x.opponent.deck.cards.length;
  const candidateDiscardBeforeBurrow=x.opponent.discard.cards.length;
  const candidateHandBeforeBurrow=x.opponent.hand.cards.length;
  const sourceDeckBeforeBurrow=x.owner.deck.cards.length;

  x.store.dispatch(new AttackAction(x.owner.id,'Burrow'));
  const sourceAttackPrompts=settlePrompts(x);

  assert.equal(x.state.activePlayer,1-sourceSeat,
    'Bunnelby attack must pass the turn to Mimikyu');
  const previous=x.state.playerLastAttack?.[x.owner.id];
  assert.equal(previous?.sourceCard?.fullName,'Bunnelby PRC');
  assert.equal(previous?.attack?.name,'Burrow');
  assert.notEqual(previous.attack.gxAttack,true);
  assert.equal(x.opponent.deck.cards.length,candidateDeckBeforeBurrow-2,
    'One Burrow discard plus the Mimikyu turn draw reduce its deck by two');
  assert.equal(x.opponent.discard.cards.length-candidateDiscardBeforeBurrow,1,
    'The original Burrow must discard exactly one physical Mimikyu deck card');
  assert.equal(x.opponent.hand.cards.length-candidateHandBeforeBurrow,1,
    'Mimikyu draws one card when its turn begins');
  assert.ok(x.opponent.discard.cards.some(value=>value.id===candidateDeckTopBeforeBurrow[0].id),
    'The original Burrow must move the Mimikyu deck top card to its discard');
  assert.ok(x.opponent.hand.cards.some(value=>value.id===candidateDeckTopBeforeBurrow[1].id),
    'The next Mimikyu deck card must be its normal turn draw');

  const sourceDeckTopBeforeCopycat=x.owner.deck.cards.slice(0,2);
  const sourceDeckBeforeCopycat=x.owner.deck.cards.length;
  const sourceDiscardBeforeCopycat=x.owner.discard.cards.length;
  const sourceHandBeforeCopycat=x.owner.hand.cards.length;
  x.store.dispatch(new AttackAction(x.opponent.id,'Copycat'));
  const copiedAttackPrompts=settlePrompts(x);

  const copiedAttack={
    previousSource:previous.sourceCard.fullName,
    previousName:previous.attack.name,
    previousGx:Boolean(previous.attack.gxAttack),
    activePrinting:x.opponent.active.getPokemonCard()?.fullName??null
  };
  const result={
    sourceSeat,
    ownerSeat:1-sourceSeat,
    copiedAttack,
    sourceAttackPrompts,
    copiedAttackPrompts,
    sourceDeckBeforeBurrow,
    sourceDeckBeforeCopycat,
    sourceDeckAfterCopycat:x.owner.deck.cards.length,
    sourceDeckDelta:x.owner.deck.cards.length-sourceDeckBeforeCopycat,
    sourceDiscardDelta:x.owner.discard.cards.length-sourceDiscardBeforeCopycat,
    sourceHandDelta:x.owner.hand.cards.length-sourceHandBeforeCopycat,
    sourceTopMovedToDiscard:x.owner.discard.cards.some(value=>value.id===sourceDeckTopBeforeCopycat[0].id),
    sourceNextTopMovedToHand:x.owner.hand.cards.some(value=>value.id===sourceDeckTopBeforeCopycat[1].id),
    candidateDeckAfterBurrow:x.opponent.deck.cards.length,
    candidateDeckDelta:x.opponent.deck.cards.length-candidateDeckBeforeBurrow,
    candidateDiscardDelta:x.opponent.discard.cards.length-candidateDiscardBeforeBurrow,
    candidateHandDelta:x.opponent.hand.cards.length-candidateHandBeforeBurrow,
    unresolvedPrompts:x.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    ownerActiveEnergyCount:x.opponent.active.energies.cards.length,
    sourceUsedGX:x.owner.usedGX===true,
    ownerUsedGX:x.opponent.usedGX===true,
    nativeTurn:x.state.turn,
    activeSeat:x.state.activePlayer,
    competitiveQualifiedGames:0
  };
  assert.equal(result.sourceDeckDelta,-2,
    'Copied Burrow discard plus Bunnelby turn draw reduce its deck by two');
  assert.equal(result.sourceDiscardDelta,1,
    'Copied Burrow must discard exactly one card from Bunnelby owner deck');
  assert.equal(result.sourceHandDelta,1,
    'Bunnelby draws one card when its turn begins');
  assert.equal(result.sourceTopMovedToDiscard,true);
  assert.equal(result.sourceNextTopMovedToHand,true);
  assert.equal(result.candidateDeckDelta,-2);
  assert.equal(result.candidateDiscardDelta,1);
  assert.equal(result.candidateHandDelta,1);
  assert.deepEqual(result.unresolvedPrompts,[]);
  return result;
}

/**
 * Run both Bunnelby Ω Barrage attack orders and optionally select either
 * prior-turn attack for Mimikyu Copycat through the research adapter.
 * Rototiller is given a real recovery card; Mimikyu is given a discard card
 * so a copied Rototiller can settle through the native selection prompt.
 * @param {0|1} sourceSeat
 * @param {'Burrow'|'Rototiller'} firstAttack
 * @param {'Burrow'|'Rototiller'} secondAttack
 * @param {'engine'|'second'} [copycatChoice='engine']
 * @returns {object}
 */
function probeAttackOrder(sourceSeat,firstAttack,secondAttack,copycatChoice='engine'){
  assert.notEqual(firstAttack,secondAttack);
  const x=stage(sourceSeat);
  const history=installCopycatMultiAttackHistory(x.store);
  const manager=initializeCards();
  let id=97000+sourceSeat*100;
  /** @param {string} name */
  const card=name=>{
    const value=manager.getCardByName(name);
    assert.ok(value,'Native card unavailable: '+name);
    value.id=id++;
    return value;
  };
  const bunnelby=card('Bunnelby PRC');
  const bunnelbyEnergy=card('Psychic Energy SVE');
  const mimikyu=card('Mimikyu GRI');
  const mimikyuEnergyA=card('Psychic Energy SVE');
  const mimikyuEnergyB=card('Psychic Energy SVE');
  const recovery=card("Team Rocket's Handiwork FCO");
  const mimikyuRecovery=card('Psychic Energy SVE');

  for(const player of [x.owner,x.opponent]){
    player.hand.cards.length=0;
    for(const slot of player.bench){
      slot.cards.length=0;
      slot.energies.cards.length=0;
    }
  }
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(bunnelby,bunnelbyEnergy);
  x.owner.active.energies.cards.push(bunnelbyEnergy);
  x.opponent.active.cards.length=0;
  x.opponent.active.energies.cards.length=0;
  x.opponent.active.cards.push(mimikyu,mimikyuEnergyA,mimikyuEnergyB);
  x.opponent.active.energies.cards.push(mimikyuEnergyA,mimikyuEnergyB);
  x.owner.discard.cards.push(recovery);
  x.opponent.discard.cards.push(mimikyuRecovery);

  x.state.activePlayer=sourceSeat;
  x.state.turn=2;
  x.state.phase=x.GamePhase.PLAYER_TURN;

  const mimikyuDeckTopBeforeSource=x.opponent.deck.cards.slice(0,2);
  const mimikyuDeckBeforeSource=x.opponent.deck.cards.length;
  const mimikyuDiscardBeforeSource=x.opponent.discard.cards.length;
  const mimikyuHandBeforeSource=x.opponent.hand.cards.length;
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {GameMessage}=native('game/game-message');
  const sourcePrompts=[];
  let omegaAccepted=false,secondChosen=false,recoverySelected=false;

  x.store.dispatch(new AttackAction(x.owner.id,firstAttack));
  for(let n=0;n<36;n++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    const kind=prompt.constructor.name;
    if(kind==='WaitPrompt'){
      sourcePrompts.push(kind);
      x.store.dispatch(new ResolvePromptAction(prompt.id,null));
      continue;
    }
    if(kind==='ShuffleDeckPrompt'){
      sourcePrompts.push(kind);
      x.store.dispatch(new ResolvePromptAction(prompt.id,deterministicShuffleOrder(x,prompt)));
      continue;
    }
    if(kind==='ShowCardsPrompt'&&prompt.message===GameMessage.CARDS_SHOWED_BY_THE_OPPONENT){
      sourcePrompts.push(kind);
      x.store.dispatch(new ResolvePromptAction(prompt.id,null));
      continue;
    }
    if(kind==='ConfirmPrompt'&&prompt.message===GameMessage.WANT_TO_USE_ABILITY){
      assert.equal(prompt.playerId,x.owner.id);
      assert.equal(omegaAccepted,false,'Omega Barrage can be accepted only once per turn');
      assert.equal(prompt.validate(true),true);
      sourcePrompts.push(kind);
      omegaAccepted=true;
      x.store.dispatch(new ResolvePromptAction(prompt.id,true));
      continue;
    }
    if(kind==='ChooseAttackPrompt'&&prompt.message===GameMessage.CHOOSE_ATTACK_TO_COPY){
      assert.equal(prompt.playerId,x.owner.id);
      assert.equal(secondChosen,false,'Omega Barrage should grant only one additional attack');
      const source=promptCardChoices(prompt).find(value=>value.fullName==='Bunnelby PRC');
      const attack=source?.attacks.find(value=>value.name===secondAttack);
      assert.ok(attack,'Omega Barrage must offer '+secondAttack);
      const promptResult={index:0,attack:secondAttack};
      const decoded=prompt.decode(promptResult,x.state);
      assert.equal(decoded?.name,secondAttack);
      assert.equal(prompt.validate(decoded,x.state),true);
      sourcePrompts.push(kind);
      secondChosen=true;
      x.store.dispatch(new ResolvePromptAction(prompt.id,decoded));
      continue;
    }
    if(kind==='ChooseCardsPrompt'&&prompt.message==='CHOOSE_CARD_TO_DECK'){
      assert.equal(prompt.playerId,x.owner.id);
      assert.equal(recoverySelected,false,'Rototiller should select exactly one recovery card');
      const choice=promptCardChoices(prompt).find(value=>value.id===recovery.id);
      assert.ok(choice,'Rototiller must offer the physical Handiwork in Bunnelby discard');
      assert.equal(prompt.validate([choice]),true);
      sourcePrompts.push(kind);
      recoverySelected=true;
      x.store.dispatch(new ResolvePromptAction(prompt.id,[choice]));
      continue;
    }
    throw new Error('Unexpected source prompt '+kind+' '+String(prompt.message));
  }
  assert.equal(x.state.prompts.some(p=>p.result===undefined),false);
  assert.equal(omegaAccepted,true);
  assert.equal(secondChosen,true);
  assert.equal(recoverySelected,true,'Rototiller must recycle the physical Handiwork');
  assert.ok(x.owner.deck.cards.some(value=>value.id===recovery.id),
    'Rototiller must return the physical Handiwork to Bunnelby deck');
  assert.ok(!x.owner.discard.cards.some(value=>value.id===recovery.id));
  assert.equal(x.state.activePlayer,1-sourceSeat);
  assert.equal(x.opponent.deck.cards.length,mimikyuDeckBeforeSource-2,
    'One Bunnelby Burrow discard plus Mimikyu turn draw reduce its deck by two');
  assert.equal(x.opponent.discard.cards.length-mimikyuDiscardBeforeSource,1);
  assert.equal(x.opponent.hand.cards.length-mimikyuHandBeforeSource,1);
  assert.ok(x.opponent.discard.cards.some(value=>value.id===mimikyuDeckTopBeforeSource[0].id));
  assert.ok(x.opponent.hand.cards.some(value=>value.id===mimikyuDeckTopBeforeSource[1].id));
  const historyAttacks=history.getPreviousTurnAttacks(x.owner.id);
  const eligibleHistoryAttacks=history.getEligiblePreviousTurnAttacks(x.owner.id);
  const copycatChoices=history.getCopycatChoices(x.owner.id);
  assert.deepEqual(historyAttacks.map(value=>value.attackName),[firstAttack,secondAttack],
    'adapter history must retain both declared attacks in their original order');
  assert.equal(eligibleHistoryAttacks.length,2);
  assert.deepEqual(copycatChoices.map(value=>value.attackName),[firstAttack,secondAttack],
    'Copycat choices must be exactly the verified Ω Barrage pair');
  assert.equal(copycatChoices[0].barragePairId,copycatChoices[1].barragePairId);
  assert.deepEqual(copycatChoices.map(value=>value.barragePairRole),['first','second']);
  const previous=x.state.playerLastAttack?.[x.owner.id];
  assert.equal(previous?.sourceCard?.fullName,'Bunnelby PRC');
  assert.equal(previous?.attack?.name,firstAttack,
    'pinned Store records the original AttackAction attack, not the Ω Barrage follow-up');
  const copycatAttackName=copycatChoice==='second'?secondAttack:firstAttack;

  const sourceDeckTop=x.owner.deck.cards.slice(0,2);
  const sourceDeckBefore=x.owner.deck.cards.length;
  const sourceDiscardBefore=x.owner.discard.cards.length;
  const sourceHandBefore=x.owner.hand.cards.length;
  const mimikyuDeckBefore=x.opponent.deck.cards.length;
  const mimikyuDiscardBefore=x.opponent.discard.cards.length;
  const copycatPrompts=[];
  if(copycatChoice==='second'){
    dispatchCopycatWithSelectedHistory(
      x.store,x.opponent.id,copycatChoices[1],
      new AttackAction(x.opponent.id,'Copycat')
    );
  }else{
    x.store.dispatch(new AttackAction(x.opponent.id,'Copycat'));
  }
  assert.equal(x.state.playerLastAttack?.[x.owner.id]?.attack?.name,firstAttack,
    'temporary Copycat selection must restore the truthful engine record');
  let mimikyuRecoverySelected=false;
  for(let n=0;n<36;n++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    const kind=prompt.constructor.name;
    if(kind==='WaitPrompt'){
      copycatPrompts.push(kind);
      x.store.dispatch(new ResolvePromptAction(prompt.id,null));
      continue;
    }
    if(kind==='ShuffleDeckPrompt'){
      copycatPrompts.push(kind);
      x.store.dispatch(new ResolvePromptAction(prompt.id,deterministicShuffleOrder(x,prompt)));
      continue;
    }
    if(kind==='ShowCardsPrompt'&&prompt.message===GameMessage.CARDS_SHOWED_BY_THE_OPPONENT){
      copycatPrompts.push(kind);
      x.store.dispatch(new ResolvePromptAction(prompt.id,null));
      continue;
    }
    if(kind==='ChooseCardsPrompt'&&prompt.message==='CHOOSE_CARD_TO_DECK'){
      assert.equal(prompt.playerId,x.opponent.id);
      assert.equal(mimikyuRecoverySelected,false,'Copied Rototiller should select exactly one Mimikyu discard card');
      const choice=promptCardChoices(prompt).find(value=>value.id===mimikyuRecovery.id);
      assert.ok(choice,'Copied Rototiller must offer the physical Psychic Energy in Mimikyu discard');
      assert.equal(prompt.validate([choice]),true);
      copycatPrompts.push(kind);
      mimikyuRecoverySelected=true;
      x.store.dispatch(new ResolvePromptAction(prompt.id,[choice]));
      continue;
    }
    throw new Error('Unexpected Copycat prompt '+kind+' '+String(prompt.message));
  }
  assert.equal(x.state.prompts.some(p=>p.result===undefined),false);

  const result={
    sourceSeat,
    ownerSeat:1-sourceSeat,
    firstAttack,
    secondAttack,
    recordedPreviousAttack:previous.attack.name,
    paperRuleEligibleAttacks:[firstAttack,secondAttack],
    engineRecordedAttackCount:1,
    historyRecordedAttackCount:historyAttacks.length,
    historyAttackNames:historyAttacks.map(value=>value.attackName),
    eligibleHistoryAttackNames:eligibleHistoryAttacks.map(value=>value.attackName),
    copycatChoice,
    copycatExecutedAttack:copycatAttackName,
    adapterOverrideApplied:copycatChoice==='second',
    sourceTurnMimikyuDeckDelta:x.opponent.deck.cards.length-mimikyuDeckBeforeSource,
    sourceTurnMimikyuDiscardDelta:x.opponent.discard.cards.length-mimikyuDiscardBeforeSource,
    sourceTurnMimikyuHandDelta:x.opponent.hand.cards.length-mimikyuHandBeforeSource,
    sourcePrompts,
    copycatPrompts,
    sourceDeckDelta:x.owner.deck.cards.length-sourceDeckBefore,
    sourceDiscardDelta:x.owner.discard.cards.length-sourceDiscardBefore,
    sourceHandDelta:x.owner.hand.cards.length-sourceHandBefore,
    sourceTopMovedToDiscard:x.owner.discard.cards.some(value=>value.id===sourceDeckTop[0].id),
    sourceTopMovedToHand:x.owner.hand.cards.some(value=>value.id===sourceDeckTop[0].id),
    sourceNextTopMovedToHand:x.owner.hand.cards.some(value=>value.id===sourceDeckTop[1].id),
    mimikyuDeckDelta:x.opponent.deck.cards.length-mimikyuDeckBefore,
    mimikyuDiscardDelta:x.opponent.discard.cards.length-mimikyuDiscardBefore,
    mimikyuRecoveryReturnedToDeck:x.opponent.deck.cards.some(value=>value.id===mimikyuRecovery.id),
    mimikyuRecoverySelected,
    sourceUsedGX:x.owner.usedGX===true,
    ownerUsedGX:x.opponent.usedGX===true,
    unresolvedPrompts:x.state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name),
    competitiveQualifiedGames:0
  };

  if(copycatAttackName==='Burrow'){
    assert.equal(result.sourceDeckDelta,-2,
      'Store copies the first Burrow: one discard plus Bunnelby turn draw reduce its deck by two');
    assert.equal(result.sourceDiscardDelta,1);
    assert.equal(result.sourceHandDelta,1);
    assert.equal(result.sourceTopMovedToDiscard,true);
    assert.equal(result.sourceNextTopMovedToHand,true);
    assert.equal(result.mimikyuDeckDelta,0);
    assert.equal(result.mimikyuRecoverySelected,false);
  }else{
    assert.equal(result.sourceDeckDelta,-1,
      'Store copies the first Rototiller: Bunnelby only takes its normal turn draw');
    assert.equal(result.sourceDiscardDelta,0);
    assert.equal(result.sourceHandDelta,1);
    assert.equal(result.sourceTopMovedToHand,true);
    assert.equal(result.sourceTopMovedToDiscard,false);
    assert.equal(result.mimikyuDeckDelta,1,
      'Copycat Rototiller must return one Mimikyu discard card to Mimikyu deck');
    assert.equal(result.mimikyuDiscardDelta,-1);
    assert.equal(result.mimikyuRecoveryReturnedToDeck,true);
    assert.equal(result.mimikyuRecoverySelected,true);
  }
  assert.deepEqual(result.unresolvedPrompts,[]);
  history.restore();
  return result;
}

/** @returns {object} Both physical seat orientations. */
function run(){
  const rows=[probe(0),probe(1)];
  const result={
    schema:'agent8-mimikyu-copycat-bunnelby-burrow-native-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    nativeStore:true,
    naturalPriorAttackTransition:true,
    bothPhysicalSeats:true,
    copiedBurrowSettles:true,
    copiedBurrowDiscardCount:1,
    competitiveQualifiedGames:0,
    rows,
    attackOrderRows:[
      probeAttackOrder(0,'Rototiller','Burrow'),
      probeAttackOrder(1,'Rototiller','Burrow'),
      probeAttackOrder(0,'Burrow','Rototiller'),
      probeAttackOrder(1,'Burrow','Rototiller')
    ]
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\\n');
  return result;
}

if(require.main===module)run();
module.exports={probe,probeAttackOrder,run};
