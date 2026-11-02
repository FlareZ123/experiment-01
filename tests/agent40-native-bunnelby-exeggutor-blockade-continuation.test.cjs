'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stageSourceBunnelbyBoard}=
  require('../simulation/twinleaf/bunnelby-tm-policy-replay.cjs');
const {initializeCards,seededRandom,deckPermutation}=
  require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
const {withToolAttackAwareness}=
  require('../simulation/twinleaf/tool-attack-policy.cjs');
const {withBunnelbyEvolutionLine}=
  require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');
const {withBunnelbyBarrageConsent}=
  require('../simulation/twinleaf/agent40-bunnelby-barrage-consent.cjs');
const {resolveManifestFile}=
  require('../simulation/twinleaf/resolve-field.cjs');
const challenge=require('../results/als/agent18-exeggutor-vileplume-native-v2.json');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(OUTPUT,name));
const TM='Technical Machine: Evolution PAR';
const JET='Jet Energy PAL';

/** @param {0|1} seat */
function staged(seat){
  const {fixture:f}=stageSourceBunnelbyBoard();
  const manager=initializeCards();
  const {PokemonCardList}=
    native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const owner=f.attacker,opponent=f.defender;
  const originalBunnelby=owner.active.getPokemonCard();
  const originalJet=owner.active.energies.cards[0];
  const originalTool=owner.active.tools[0];
  assert.equal(originalBunnelby.fullName,'Bunnelby PRC');
  assert.equal(originalJet.fullName,JET);
  assert.equal(originalTool.fullName,TM);

  /** @param {string} name */
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Missing exact pinned source printing: '+name);
    return found;
  };
  owner.active.cards.length=0;
  owner.active.energies.cards.length=0;
  owner.active.tools.length=0;
  owner.active.cards.push(card('Girafarig LOT'));
  owner.bench[1].cards.length=0;
  owner.bench[1].cards.push(card('Exeggcute VIV'));
  const bunnelby=new PokemonCardList();
  bunnelby.cards.push(originalBunnelby);
  owner.bench.push(bunnelby);
  const bunnelbyIndex=owner.bench.length-1;
  owner.hand.cards.length=0;
  owner.hand.cards.push(originalTool,originalJet,card(JET));
  owner.deck.cards.length=0;
  owner.deck.cards.push(...[
    'Gloom UNB','Exeggutor PLF','Vileplume AOR',
    'Grass Energy MEE','Psychic Energy SVE'
  ].map(card));

  const remainingGuzma=opponent.deck.cards.findIndex(
    c=>c.fullName==='Guzma BUS');
  assert.ok(remainingGuzma>=0,'Exact rank1 source deck Guzma expected');
  const heldGuzma=opponent.deck.cards.splice(remainingGuzma,1)[0];
  opponent.hand.cards.push(heldGuzma);

  const state=f.store.state;
  if(seat===1)state.players=[opponent,owner];
  state.activePlayer=seat;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  const types={
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType
  };
  const catalog=buildActorCardCatalog(manager.getAllCards(),types);
  // Public 'Grand Tree' is 'Great Tree SCR' in the pinned CardManager.
  // Derive native-registered printings from the original rank2 source 60,
  // then apply only the challenger v2 published physical copy delta.
  const source=resolveManifestFile(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    }).decks.find(row=>row.rank===2);
  assert.ok(source?.playableUnderEngine);
  const ownRegisteredSixty=[...source.cardIds];
  /** @param {string} printing @param {number} quantity */
  const removeCopies=(printing,quantity)=>{
    for(let count=0;count<quantity;count++){
      const index=ownRegisteredSixty.indexOf(printing);
      assert.ok(index>=0,'Original source missing '+printing);
      ownRegisteredSixty.splice(index,1);
    }
  };
  removeCopies('Lillipup CEC',2);
  removeCopies('Herdier SUM',2);
  removeCopies('Stoutland BCR',1);
  ownRegisteredSixty.push('Exeggcute PLF','Exeggcute VIV',
    'Exeggutor PLF','Exeggutor PLF',JET);
  assert.equal(challenge.schema,
    'agent18-exeggutor-vileplume-v2-native-implemented-60');
  assert.equal(ownRegisteredSixty.length,60);
  assert.equal(ownRegisteredSixty.filter(p=>p===JET).length,3);
  assert.equal(ownRegisteredSixty.filter(p=>p==='Exeggutor PLF').length,2);
  assert.equal(ownRegisteredSixty.filter(p=>p==='Exeggcute VIV').length,1);
  const ownCards=ownRegisteredSixty.map(card);
  const ids=new Set();
  let nextId=70000+seat*1000;
  for(const player of [owner,opponent]){
    for(const zone of [
      player.active,player.hand,player.deck,player.discard,
      ...player.bench,...player.prizes
    ]){
      for(const one of zone.cards){
        if(ids.has(one))continue;
        ids.add(one);
        one.id=nextId++;
      }
    }
    for(const slot of [player.active,...player.bench]){
      for(const one of slot.tools){
        if(ids.has(one))continue;
        ids.add(one);
        one.id=nextId++;
      }
    }
  }
  return {f,state,owner,opponent,seat,bunnelbyIndex,
    ownRegisteredSixty,ownCards,catalog,GamePhase,heldGuzma};
}

/**
 * Resolve only observed native animation and own Bunnelby evolution prompts.
 * A discretionary opponent decision is a test failure.
 * @param {object} x Staged original Store.
 * @param {object|null} bot Owner prompt policy, null for phase-only checks.
 * @returns {string[]}
 */
function settle(x,bot){
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const kinds=[];
  for(let i=0;i<70;i++){
    const pending=x.state.prompts.find(p=>p.result===undefined);
    if(!pending)return kinds;
    const kind=pending.constructor.name;
    let action;
    if(kind==='WaitPrompt'){
      action=new ResolvePromptAction(pending.id,null);
    }else if(kind==='ShuffleDeckPrompt'&&bot){
      action=new ResolvePromptAction(pending.id,
        deckPermutation(x.owner.deck.cards.length,seededRandom(20261102+x.seat+i)));
    }else{
      assert.ok(bot,'Discretionary prompt in phase-only transition: '+kind);
      assert.equal(pending.playerId,x.owner.id,
        'Opponent discretionary prompts require unforced opponent policy');
      action=bot.decodeNextAction(x.state);
    }
    assert.ok(action,'No native action for '+kind);
    kinds.push(kind);
    x.f.store.dispatch(action);
  }
  assert.fail('Native prompt chain exceeded 70 physical actions');
}

/** @param {object} x @returns {object} */
function sourceBunnelbyBot(x){
  const defs=native('simple-bot/simple-bot-definitions');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const options=withBunnelbyBarrageConsent(withBunnelbyEvolutionLine(
    withToolAttackAwareness({
      tactics:defs.allSimpleTactics,
      promptResolvers:defs.allPromptResolvers,
      scores:defs.defaultStateScores,
      arbiter:defs.defaultArbiterOptions
    }),{sourceCards:x.ownCards,targetAwareEvolution:true}
  ),x.ownCards);
  return new SimpleTacticsAi({id:x.owner.id},options,null);
}

/** @param {0|1} seat */
function verify(seat){
  const x=staged(seat);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {AttackAction,PassTurnAction}=
    native('game/store/actions/game-actions');
  const chooser=()=>chooseActorRootIntent(actorObservation(x.state,seat),
    x.catalog,{bunnelbyTmJetRoot:true,
      ownRegisteredSixty:x.ownRegisteredSixty});
  const first=chooser();
  assert.equal(first.kind,'equip-bunnelby-tm');
  assert.equal(first.index,x.bunnelbyIndex);
  const beforeTool=rootPhysicalSnapshot(x.state,seat,first);
  x.f.store.dispatch(new PlayCardAction(x.owner.id,first.handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:first.index
  }));
  const afterTool=rootPhysicalSnapshot(x.state,seat,first);
  assert.equal(rootPhysicalWitness(first,beforeTool,afterTool,x.GamePhase),
    'confirmed-public-effect');

  const second=chooser();
  assert.equal(second.kind,'attach-special-energy');
  assert.equal(second.slot,'bench');
  assert.equal(second.index,x.bunnelbyIndex);
  const beforeJet=rootPhysicalSnapshot(x.state,seat,second);
  x.f.store.dispatch(new PlayCardAction(x.owner.id,second.handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:second.index
  }));
  const afterJet=rootPhysicalSnapshot(x.state,seat,second);
  assert.equal(rootPhysicalWitness(second,beforeJet,afterJet,x.GamePhase),
    'confirmed-public-effect');
  assert.equal(x.owner.active.getPokemonCard()?.fullName,'Bunnelby PRC');

  const third=chooser();
  assert.equal(third.kind,'attack');
  assert.equal(third.attackName,'Evolution');
  x.f.store.dispatch(new AttackAction(x.owner.id,'Evolution'));
  const promptKinds=settle(x,sourceBunnelbyBot(x));

  assert.ok(promptKinds.includes('ConfirmPrompt'),
    'Actual Omega Barrage must ask its real second-attack consent');
  assert.ok(promptKinds.includes('ChooseAttackPrompt'),
    'Native second Omega Barrage attack must be selected');
  assert.equal(x.owner.active.getPokemonCard()?.fullName,'Bunnelby PRC');
  assert.ok(x.owner.bench.some(p=>p.getPokemonCard()?.fullName==='Exeggutor PLF'),
    'Bunnelby TM must actually evolve Exeggcute VIV');
  assert.ok(x.owner.bench.some(p=>p.getPokemonCard()?.fullName==='Vileplume AOR'),
    'Second TM must actually establish AOR Item lock');
  assert.equal(x.state.activePlayer,1-seat,
    'Omega Barrage turn must pass to the opponent');
  assert.notEqual(x.opponent.cannotPlaySupporterCards,true,
    'Only Vileplume Item lock is established; no Blockade Supporter lock yet');
  assert.equal(x.owner.hand.cards.filter(card=>card.fullName===JET).length,1);
  assert.ok(x.opponent.hand.cards.includes(x.heldGuzma));

  // The opponent has an actual ordinary action window before Exeggutor can
  // take Active and use its player-directed Supporter-lock attack.
  x.f.store.dispatch(new PassTurnAction(x.opponent.id));
  const turnPrompts=settle(x,null);
  assert.ok(turnPrompts.length>0);
  assert.equal(x.state.activePlayer,seat);
  assert.equal(x.state.phase,x.GamePhase.PLAYER_TURN);
  assert.notEqual(x.opponent.cannotPlaySupporterCards,true);

  const exIndex=x.owner.bench.findIndex(slot=>
    slot.getPokemonCard()?.fullName==='Exeggutor PLF');
  assert.ok(exIndex>=0);
  const heldIndex=x.owner.hand.cards.findIndex(card=>card.fullName===JET);
  assert.ok(heldIndex>=0);
  const intent={kind:'attach-special-energy',handIndex:heldIndex,
    printing:JET,slot:'bench',index:exIndex,
    reason:'exeggutor-blockade-next-owner-turn'};
  const pre=rootPhysicalSnapshot(x.state,seat,intent);
  x.f.store.dispatch(new PlayCardAction(x.owner.id,heldIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:exIndex
  }));
  const post=rootPhysicalSnapshot(x.state,seat,intent);
  assert.equal(rootPhysicalWitness(intent,pre,post,x.GamePhase),
    'confirmed-public-effect');
  assert.equal(x.owner.active.getPokemonCard()?.fullName,'Exeggutor PLF');
  assert.deepEqual(x.owner.active.energies.cards.map(card=>card.fullName),
    [JET],'Second Jet must attach to promoted Exeggutor Active');

  const opponentBefore=x.opponent.active.damage;
  x.f.store.dispatch(new AttackAction(x.owner.id,'Blockade'));
  const blockadePrompts=settle(x,null);
  assert.equal(x.state.activePlayer,1-seat);
  assert.equal(x.opponent.cannotPlaySupporterCards,true,
    'Native effect must lock opponent Supporter only after settled attack');
  assert.equal(x.opponent.active.damage-opponentBefore,10);

  const guzmaIndex=x.opponent.hand.cards.indexOf(x.heldGuzma);
  assert.ok(guzmaIndex>=0);
  const opponentHandBefore=x.opponent.hand.cards.map(card=>card.fullName);
  assert.throws(()=>x.f.store.dispatch(new PlayCardAction(
    x.opponent.id,guzmaIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }
  )),error=>error?.message==='BLOCKED_BY_EFFECT');
  assert.deepEqual(x.opponent.hand.cards.map(card=>card.fullName),
    opponentHandBefore,'Forbidden held Guzma must remain in opposing hand');
  console.log('AGENT40_NATIVE_BLOCKADE_TWO_TURN',JSON.stringify({
    seat,challenger:'Agent18 Exeggutor Vileplume native v2',
    initialToolAndJetRoots:['equip-bunnelby-tm','attach-special-energy'],
    bunnelbyAttack:'Evolution',omegaBarrageSecondAttackPrompt:true,
    benchAfterFirstTurn:x.owner.bench.map(slot=>
      slot.getPokemonCard()?.fullName??null),
    actualUnblockedOpponentTurn:true,
    secondSourceTurnJetPromotion:'Exeggutor PLF',
    settledAttack:'Blockade',opponentActiveDamageDelta:10,
    actualPlayerSupporterLock:true,
    opposingHeldOriginalRank1GuzmaRejected:'BLOCKED_BY_EFFECT',
    promptKinds,turnPrompts,blockadePrompts,
    competitiveQualifiedGames:0
  }));
}

for(const seat of [0,1]){
  test('native Bunnelby TM leads to later Exeggutor Blockade, seat '+seat,
    ()=>verify(seat));
}
