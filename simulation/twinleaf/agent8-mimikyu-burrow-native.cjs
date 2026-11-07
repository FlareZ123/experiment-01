'use strict';

const assert=require('node:assert/strict');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('./headless.cjs');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(output,name));

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
  const sourceDeckTopBeforeBurrow=x.opponent.deck.cards[0];
  const candidateDeckBeforeBurrow=x.opponent.deck.cards.length;
  const sourceDeckBeforeBurrow=x.owner.deck.cards.length;

  x.store.dispatch(new AttackAction(x.owner.id,'Burrow'));
  const sourceAttackPrompts=settlePrompts(x);

  assert.equal(x.state.activePlayer,1-sourceSeat,
    'Bunnelby attack must pass the turn to Mimikyu');
  const previous=x.state.playerLastAttack?.[x.owner.id];
  assert.equal(previous?.sourceCard?.fullName,'Bunnelby PRC');
  assert.equal(previous?.attack?.name,'Burrow');
  assert.notEqual(previous.attack.gxAttack,true);
  assert.equal(x.opponent.deck.cards.length,candidateDeckBeforeBurrow-1,
    'The original Burrow must discard from the opponent Mimikyu deck');
  assert.ok(x.opponent.discard.cards.includes(sourceDeckTopBeforeBurrow),
    'The original Burrow must move the Mimikyu deck top card to its discard');

  const sourceDeckTopBeforeCopycat=x.owner.deck.cards[0];
  const sourceDeckBeforeCopycat=x.owner.deck.cards.length;
  const sourceDiscardBeforeCopycat=x.owner.discard.cards.length;
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
    sourceTopMovedToDiscard:x.owner.discard.cards.includes(sourceDeckTopBeforeCopycat),
    candidateDeckAfterBurrow:x.opponent.deck.cards.length,
    candidateDeckDelta:x.opponent.deck.cards.length-candidateDeckBeforeBurrow,
    unresolvedPrompts:x.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    ownerActiveEnergyCount:x.opponent.active.energies.cards.length,
    sourceUsedGX:x.owner.usedGX===true,
    ownerUsedGX:x.opponent.usedGX===true,
    nativeTurn:x.state.turn,
    activeSeat:x.state.activePlayer,
    competitiveQualifiedGames:0
  };
  assert.equal(result.sourceDeckDelta,-1,
    'Copied Burrow must discard exactly one card from Bunnelby owner deck');
  assert.equal(result.sourceDiscardDelta,1);
  assert.equal(result.sourceTopMovedToDiscard,true);
  assert.equal(result.candidateDeckDelta,-1);
  assert.deepEqual(result.unresolvedPrompts,[]);
  return result;
}

/**
 * Run both Bunnelby Ω Barrage attack orders, then copy the final attack.
 * Rototiller is given a real recovery card; Mimikyu is given a discard card
 * so a copied Rototiller can settle through the native selection prompt.
 * @param {0|1} sourceSeat
 * @param {'Burrow'|'Rototiller'} firstAttack
 * @param {'Burrow'|'Rototiller'} secondAttack
 * @returns {object}
 */
function probeAttackOrder(sourceSeat,firstAttack,secondAttack){
  assert.notEqual(firstAttack,secondAttack);
  const x=stage(sourceSeat);
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

  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {GameMessage}=native('game/game-message');
  const sourcePrompts=[];
  let omegaAccepted=false,secondChosen=false,recoverySelected=false,burrowShown=false;

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
    if(kind==='ShowCardsPrompt'&&prompt.message===GameMessage.CARDS_SHOWED_BY_THE_OPPONENT){
      sourcePrompts.push(kind);
      burrowShown=true;
      x.store.dispatch(new ResolvePromptAction(prompt.id,null));
      continue;
    }
    if(kind==='ConfirmPrompt'&&prompt.message===GameMessage.WANT_TO_USE_ABILITY){
      assert.equal(prompt.playerId,x.owner.id);
      assert.equal(prompt.validate(true),true);
      sourcePrompts.push(kind);
      omegaAccepted=true;
      x.store.dispatch(new ResolvePromptAction(prompt.id,true));
      continue;
    }
    if(kind==='ChooseAttackPrompt'&&prompt.message===GameMessage.CHOOSE_ATTACK_TO_COPY){
      assert.equal(prompt.playerId,x.owner.id);
      const source=prompt.cards.find(value=>value.fullName==='Bunnelby PRC');
      const attack=source?.attacks.find(value=>value.name===secondAttack);
      assert.ok(attack,'Omega Barrage must offer '+secondAttack);
      assert.equal(prompt.validate(attack),true);
      sourcePrompts.push(kind);
      secondChosen=true;
      x.store.dispatch(new ResolvePromptAction(prompt.id,attack));
      continue;
    }
    if(kind==='ChooseCardsPrompt'&&prompt.message==='CHOOSE_CARD_TO_DECK'){
      assert.equal(prompt.playerId,x.owner.id);
      assert.strictEqual(prompt.cards,x.owner.discard);
      assert.equal(prompt.validate([recovery]),true);
      sourcePrompts.push(kind);
      recoverySelected=true;
      x.store.dispatch(new ResolvePromptAction(prompt.id,[recovery]));
      continue;
    }
    throw new Error('Unexpected source prompt '+kind+' '+String(prompt.message));
  }
  assert.equal(x.state.prompts.some(p=>p.result===undefined),false);
  assert.equal(omegaAccepted,true);
  assert.equal(secondChosen,true);
  assert.equal(recoverySelected,true,'Rototiller must recycle the physical Handiwork');
  assert.equal(burrowShown,true,'the source turn must resolve its Burrow reveal');
  assert.equal(x.state.activePlayer,1-sourceSeat);
  const previous=x.state.playerLastAttack?.[x.owner.id];
  assert.equal(previous?.sourceCard?.fullName,'Bunnelby PRC');
  assert.equal(previous?.attack?.name,secondAttack,
    'the final Bunnelby attack must replace the first attack in public history');

  const sourceDeckTop=x.owner.deck.cards[0];
  const sourceDeckBefore=x.owner.deck.cards.length;
  const sourceDiscardBefore=x.owner.discard.cards.length;
  const mimikyuDeckBefore=x.opponent.deck.cards.length;
  const mimikyuDiscardBefore=x.opponent.discard.cards.length;
  const copycatPrompts=[];
  x.store.dispatch(new AttackAction(x.opponent.id,'Copycat'));
  let mimikyuRecoverySelected=false,copycatBurrowShown=false;
  for(let n=0;n<36;n++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    const kind=prompt.constructor.name;
    if(kind==='WaitPrompt'){
      copycatPrompts.push(kind);
      x.store.dispatch(new ResolvePromptAction(prompt.id,null));
      continue;
    }
    if(kind==='ShowCardsPrompt'&&prompt.message===GameMessage.CARDS_SHOWED_BY_THE_OPPONENT){
      copycatPrompts.push(kind);
      copycatBurrowShown=true;
      x.store.dispatch(new ResolvePromptAction(prompt.id,null));
      continue;
    }
    if(kind==='ChooseCardsPrompt'&&prompt.message==='CHOOSE_CARD_TO_DECK'){
      assert.equal(prompt.playerId,x.opponent.id);
      assert.strictEqual(prompt.cards,x.opponent.discard);
      assert.equal(prompt.validate([mimikyuRecovery]),true);
      copycatPrompts.push(kind);
      mimikyuRecoverySelected=true;
      x.store.dispatch(new ResolvePromptAction(prompt.id,[mimikyuRecovery]));
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
    finalPreviousAttack:previous.attack.name,
    sourcePrompts,
    copycatPrompts,
    sourceDeckDelta:x.owner.deck.cards.length-sourceDeckBefore,
    sourceDiscardDelta:x.owner.discard.cards.length-sourceDiscardBefore,
    sourceTopMovedToDiscard:x.owner.discard.cards.includes(sourceDeckTop),
    mimikyuDeckDelta:x.opponent.deck.cards.length-mimikyuDeckBefore,
    mimikyuDiscardDelta:x.opponent.discard.cards.length-mimikyuDiscardBefore,
    mimikyuRecoveryReturnedToDeck:x.opponent.deck.cards.includes(mimikyuRecovery),
    mimikyuRecoverySelected,
    copycatBurrowShown,
    sourceUsedGX:x.owner.usedGX===true,
    ownerUsedGX:x.opponent.usedGX===true,
    unresolvedPrompts:x.state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name),
    competitiveQualifiedGames:0
  };

  if(secondAttack==='Burrow'){
    assert.equal(result.sourceDeckDelta,-1,
      'Copycat Burrow must mill one card from Bunnelby owner deck');
    assert.equal(result.sourceDiscardDelta,1);
    assert.equal(result.sourceTopMovedToDiscard,true);
    assert.equal(result.mimikyuDeckDelta,0);
    assert.equal(result.copycatBurrowShown,true);
    assert.equal(result.mimikyuRecoverySelected,false);
  }else{
    assert.equal(result.sourceDeckDelta,0,
      'Copycat Rototiller must not mill Bunnelby owner deck');
    assert.equal(result.sourceDiscardDelta,0);
    assert.equal(result.sourceTopMovedToDiscard,false);
    assert.equal(result.mimikyuDeckDelta,1,
      'Copycat Rototiller must return one Mimikyu discard card to Mimikyu deck');
    assert.equal(result.mimikyuDiscardDelta,-1);
    assert.equal(result.mimikyuRecoveryReturnedToDeck,true);
    assert.equal(result.mimikyuRecoverySelected,true);
    assert.equal(result.copycatBurrowShown,false);
  }
  assert.deepEqual(result.unresolvedPrompts,[]);
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
