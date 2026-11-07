'use strict';

const assert=require('node:assert/strict');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('./headless.cjs');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(output,name));

/** @param {object} x Resolve native prompts, declining Bunnelby's Ω Barrage repeat. */
function settlePrompts(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const resolved=[];
  for(let n=0;n<24;n++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)return resolved;
    const kind=prompt.constructor.name;
    if(kind==='ConfirmPrompt'){
      resolved.push(kind);
      x.store.dispatch(new ResolvePromptAction(prompt.id,false));
      continue;
    }
    assert.equal(kind,'WaitPrompt',
      'Unexpected discretionary prompt in native Burrow/Copycat sequence');
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
  const bunnelbyEnergy=card('Psychic Energy SVE');
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
  x.owner.active.cards.push(bunnelby,bunnelbyEnergy);
  x.owner.active.energies.cards.push(bunnelbyEnergy);

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
    rows
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\\n');
  return result;
}

if(require.main===module)run();
module.exports={probe,run};
