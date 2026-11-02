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
const {choosePublicJetBenchSwitch}=
  require('../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs');
const {chooseOwnerBlockadeContinuation}=
  require('../simulation/twinleaf/agent40-owner-blockade-continuation.cjs');
const {resolveManifestFile}=
  require('../simulation/twinleaf/resolve-field.cjs');
const challenge=require('../results/als/agent18-exeggutor-vileplume-native-v2.json');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(OUTPUT,name));
const TM='Technical Machine: Evolution PAR';
const JET='Jet Energy PAL';

/** @param {0|1} seat @param {1|6} opponentRank
 * @param {boolean} poweredRank6 Staged original Speed attachment from turn1.
 */
function staged(seat,opponentRank=1,poweredRank6=false){
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

  // For the original-rank6 counterwindow variation, replace the entire
  // source opponent with its authenticated physical printed 60, preserving
  // every copy in a genuine player/zone. This is still a staged favorable
  // position and cannot be interpreted as a naturally dealt matchup.
  if(opponentRank===6){
    const originalRank6=resolveManifestFile(path.resolve(__dirname,
      '../results/aichi-2026/full-decklists.json'),{
        allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
      }).decks.find(d=>d.rank===6);
    assert.ok(originalRank6?.playableUnderEngine);
    const stock=originalRank6.cardIds.map(card);
    const remove=printing=>{
      const at=stock.findIndex(c=>c.fullName===printing);
      assert.ok(at>=0,'Rank6 registered card missing '+printing);
      return stock.splice(at,1)[0];
    };
    const activeThorns=remove('Iron Thorns ex TWM');
    const benchThorns=remove('Iron Thorns ex TWM');
    const held=remove('Guzma BUS');
    const originalSpeed=poweredRank6?
      remove('Speed Lightning Energy RCL'):null;
    const heldDce=poweredRank6?
      remove('Double Colorless Energy SUM'):null;
    const fillers=stock.splice(0,poweredRank6?5:6);
    const prizeCards=stock.splice(0,6);
    const {CardList}=native('game/store/state/card-list');
    opponent.active.cards.splice(0,opponent.active.cards.length,activeThorns);
    opponent.active.energies.cards.length=0;
    opponent.active.tools.length=0;
    opponent.bench.splice(0,opponent.bench.length,
      ...Array.from({length:5},()=>new PokemonCardList()));
    opponent.bench[0].cards.push(benchThorns);
    if(originalSpeed){
      // Twinleaf's PokemonCardList holds the same attached object in the
      // encompassing cards stack AND typed energies list; a typed-only
      // synthetic insertion is not a legal physical attachment.
      opponent.bench[0].cards.push(originalSpeed);
      opponent.bench[0].energies.cards.push(originalSpeed);
    }
    opponent.hand.cards.splice(0,opponent.hand.cards.length,
      held,...(heldDce?[heldDce]:[]),...fillers);
    opponent.deck.cards.splice(0,opponent.deck.cards.length,...stock);
    opponent.discard.cards.length=0;
    opponent.lostzone.cards.length=0;
    opponent.prizes=prizeCards.map(c=>{
      const slot=new CardList();slot.cards.push(c);return slot;
    });
    const physical=[...new Set([
      ...opponent.active.cards,...opponent.hand.cards,
      ...opponent.deck.cards,...opponent.discard.cards,
      ...opponent.lostzone.cards,
      ...opponent.bench.flatMap(slot=>[
        ...slot.cards,...slot.energies.cards,...slot.tools]),
      ...opponent.prizes.flatMap(slot=>slot.cards)
    ])];
    assert.equal(physical.length,60,'Full rank6 original source supply');
    assert.deepEqual(physical.map(c=>c.fullName).sort(),
      originalRank6.cardIds.slice().sort(),
      'No original rank6 source card duplicated or invented');
    assert.equal(opponent.hand.cards.length,7);
    assert.equal(opponent.active.getPokemonCard()?.fullName,
      'Iron Thorns ex TWM');
    assert.equal(opponent.bench[0].getPokemonCard()?.fullName,
      'Iron Thorns ex TWM');
  }
  const remainingGuzma=opponentRank===1?
    opponent.deck.cards.findIndex(c=>c.fullName==='Guzma BUS'):-1;
  if(opponentRank===1)
    assert.ok(remainingGuzma>=0,'Exact rank1 source deck Guzma expected');
  const heldGuzma=opponentRank===1?
    opponent.deck.cards.splice(remainingGuzma,1)[0]:
    opponent.hand.cards.find(c=>c.fullName==='Guzma BUS');
  if(opponentRank===1)opponent.hand.cards.push(heldGuzma);
  assert.ok(heldGuzma,'Original opponent held Guzma required');

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
  return {f,state,owner,opponent,seat,opponentRank,poweredRank6,
    bunnelbyIndex,ownRegisteredSixty,ownCards,catalog,GamePhase,heldGuzma};
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
    if(kind==='ChooseAttackPrompt')
      assert.equal(action.result?.name,'Evolution',
        'Second Omega Barrage attack must be native TM Evolution');
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
function verify(seat,opponentGuzma=false,continueAfterGuzma=false,
  opponentRank=1,poweredRank6=false){
  const x=staged(seat,opponentRank,poweredRank6);
  if(opponentGuzma&&opponentRank===1){
    // The original rank1 60 supplies a second copy of the same Basic from
    // its initially dealt source hand. Move rather than fabricate a card.
    const index=x.opponent.hand.cards.findIndex(card=>
      card.fullName==='Shadow Rider Calyrex V CRE');
    assert.ok(index>=0);
    const {PokemonCardList}=native('game/store/state/pokemon-card-list');
    const slot=new PokemonCardList();
    slot.cards.push(x.opponent.hand.cards.splice(index,1)[0]);
    x.opponent.bench.push(slot);
  }
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
  const firstTurnBench=x.owner.bench.map(slot=>
    slot.getPokemonCard()?.fullName??null);
  const firstTurnActive=x.owner.active.getPokemonCard()?.fullName;
  assert.equal(x.state.activePlayer,1-seat,
    'Omega Barrage turn must pass to the opponent');
  assert.notEqual(x.opponent.cannotPlaySupporterCards,true,
    'Only Vileplume Item lock is established; no Blockade Supporter lock yet');
  assert.equal(x.owner.hand.cards.filter(card=>card.fullName===JET).length,1);
  assert.ok(x.opponent.hand.cards.includes(x.heldGuzma));

  if(opponentGuzma){
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    const {GameMessage}=native('game/game-message');
    const before=x.owner.active.getPokemonCard()?.fullName;
    assert.equal(before,'Bunnelby PRC');
    if(poweredRank6){
      // The printed Speed Lightning was legitimately staged from rank6's
      // earlier first turn. The second attachment, DCE, is a real T3
      // PlayCardAction before the source rank6 plays its held Guzma.
      assert.equal(opponentRank,6);
      const energyIndex=x.opponent.hand.cards.findIndex(c=>
        c.fullName==='Double Colorless Energy SUM');
      assert.ok(energyIndex>=0);
      x.f.store.dispatch(new PlayCardAction(x.opponent.id,energyIndex,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
      }));
      assert.deepEqual(x.opponent.bench[0].energies.cards.map(c=>c.fullName),
        ['Speed Lightning Energy RCL','Double Colorless Energy SUM']);
    }
    const idx=x.opponent.hand.cards.indexOf(x.heldGuzma);
    assert.ok(idx>=0);
    x.f.store.dispatch(new PlayCardAction(x.opponent.id,idx,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const responses=[];
    for(let n=0;n<16;n++){
      const pending=x.state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      assert.equal(pending.playerId,x.opponent.id,
        'Guzma decisions belong to original source opponent');
      if(pending.constructor.name==='WaitPrompt'){
        x.f.store.dispatch(new ResolvePromptAction(pending.id,null));
        responses.push('WaitPrompt');
        continue;
      }
      assert.equal(pending.constructor.name,'ChoosePokemonPrompt');
      const toGust=pending.message===GameMessage.CHOOSE_POKEMON_TO_SWITCH;
      const toPromote=pending.message===GameMessage.CHOOSE_NEW_ACTIVE_POKEMON;
      assert.ok(toGust||toPromote,
        'Native original Guzma must request targeted gust and own promotion');
      const chosen=toGust?
        x.owner.bench.find(slot=>
          slot.getPokemonCard()?.fullName==='Exeggutor PLF'):
        x.opponent.bench.find(slot=>
          slot.getPokemonCard()?.fullName===(opponentRank===6?
            'Iron Thorns ex TWM':'Shadow Rider Calyrex V CRE'));
      assert.ok(chosen);
      assert.ok(pending.validate([chosen],x.state),
        'Native prompt target is legal and belongs to correct board');
      x.f.store.dispatch(new ResolvePromptAction(pending.id,[chosen]));
      responses.push(toGust?'Gust Exeggutor':'Promote own Bench Basic');
    }
    assert.equal(x.f.store.hasPrompts(),false);
    assert.ok(responses.includes('Gust Exeggutor'));
    assert.ok(responses.includes('Promote own Bench Basic'));
    assert.equal(x.owner.active.getPokemonCard()?.fullName,'Exeggutor PLF');
    assert.notEqual(x.opponent.cannotPlaySupporterCards,true);
    assert.equal(x.opponent.hand.cards.includes(x.heldGuzma),false);
    if(poweredRank6){
      // Same-turn printed TWM Thorns Volt Cyclone, using the newly promoted
      // original rank6 Bench attacker carrying Speed Lightning + DCE.
      assert.equal(x.opponent.active.getPokemonCard()?.fullName,
        'Iron Thorns ex TWM');
      const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
      const defs=native('simple-bot/simple-bot-definitions');
      const {ResolvePromptAction}=
        native('game/store/actions/resolve-prompt-action');
      const activeOriginalRank6Bot=new SimpleTacticsAi({
        id:x.opponent.id
      },{
        tactics:defs.allSimpleTactics,
        promptResolvers:defs.allPromptResolvers,
        scores:defs.defaultStateScores,
        arbiter:defs.defaultArbiterOptions
      },null);
      const priorPrizes=x.opponent.prizes.reduce((n,p)=>n+p.cards.length,0);
      assert.equal(priorPrizes,6);
      x.f.store.dispatch(new AttackAction(x.opponent.id,'Volt Cyclone'));
      const nativeAttackPrompts=[];
      for(let n=0;n<45;n++){
        const pending=x.state.prompts.find(p=>p.result===undefined);
        if(!pending)break;
        const kind=pending.constructor.name;
        let answer;
        if(kind==='WaitPrompt')
          answer=new ResolvePromptAction(pending.id,null);
        else if(kind==='ShuffleDeckPrompt')
          answer=new ResolvePromptAction(pending.id,
            deckPermutation(x.opponent.deck.cards.length,
              seededRandom(20261102+seat+n)));
        else if(pending.playerId===x.opponent.id)
          answer=activeOriginalRank6Bot.decodeNextAction(x.state);
        else if(pending.playerId===x.owner.id&&
          kind==='ChoosePokemonPrompt'){
          const slot=x.owner.bench.find(s=>
            s.getPokemonCard()?.fullName==='Bunnelby PRC');
          assert.ok(slot);
          assert.ok(pending.validate([slot],x.state));
          answer=new ResolvePromptAction(pending.id,[slot]);
        }else assert.fail('Unplanned owner response to native rank6 attack: '+
          kind);
        assert.ok(answer,'Native Volt Cyclone left unresolved '+kind);
        nativeAttackPrompts.push(kind);
        x.f.store.dispatch(answer);
      }
      assert.equal(x.state.prompts.some(p=>p.result===undefined),false,
        'Native attack must settle all pending prompts');
      assert.equal(x.owner.active.getPokemonCard()?.fullName,
        'Bunnelby PRC','Rank6 must Knock Out the gusted 100 HP Exeggutor');
      assert.equal(x.opponent.prizes.reduce((n,p)=>n+p.cards.length,0),5,
        'Real opponent takes one Prize for the native Exeggutor KO');
      assert.notEqual(x.opponent.cannotPlaySupporterCards,true,
        'Opponent plays Guzma before Blockade was applied');
      console.log('AGENT40_NATIVE_ORIGINAL_RANK6_POWERED_GUZMA_KO',
        JSON.stringify({seat,sourceRank:6,
          originalRank6CardsConserved:60,
          originalFirstTurnSpeed:'Speed Lightning Energy RCL',
          actualSecondTurnDce:'Double Colorless Energy SUM',
          actualGuzmaAccepted:true,
          actualVoltCycloneAccepted:true,
          prizeCardsTaken:1,sourceExeggutorKnockedOut:true,
          nativeAttackPrompts,competitivelyQualifiedGames:0}));
      return;
    }
    console.log('AGENT40_BLOCKADE_EXPOSED_WINDOW_GUZMA',JSON.stringify({
      seat,sourceRank:opponentRank,originalHeldSupporter:'Guzma BUS',
      window:'opponent turn immediately after Bunnelby double TM',
      actualOpponentSupporterAccepted:true,
      originalOwnerBunnelbyBefore:before,
      originalOwnerActiveAfter:x.owner.active.getPokemonCard()?.fullName,
      gustPromptReceipts:responses,
      blockerAtTime:'Vileplume AOR',
      blockadeAlreadyActive:false,
      competitiveQualifiedGames:0
    }));
    if(continueAfterGuzma){
      // The opponent's genuine Guzma moved Exeggutor Active before Blockade.
      // Continue the actual, constrained native game to test whether that
      // position helps or prevents the follow-up lock attack.
      x.f.store.dispatch(new PassTurnAction(x.opponent.id));
      const passPrompts=settle(x,null);
      assert.ok(passPrompts.length>0);
      assert.equal(x.state.activePlayer,seat);
      assert.equal(x.state.phase,x.GamePhase.PLAYER_TURN);
      assert.equal(x.owner.active.getPokemonCard()?.fullName,'Exeggutor PLF');
      const sourceView=actorObservation(x.state,seat);
      const intent=chooseActorRootIntent(sourceView,x.catalog,{
        bunnelbyTmJetRoot:true,
        exeggutorBlockadeContinuation:true,
        ownRegisteredSixty:x.ownRegisteredSixty
      });
      assert.equal(intent?.kind,'attach-special-energy');
      assert.equal(intent.slot,'active',
        'Opponent-gusted Exeggutor must attach held Jet directly to Active');
      assert.equal(intent.printing,JET);
      assert.equal(intent.plannedAttackName,'Blockade');
      const before=rootPhysicalSnapshot(x.state,seat,intent);
      x.f.store.dispatch(new PlayCardAction(x.owner.id,intent.handIndex,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
      }));
      const after=rootPhysicalSnapshot(x.state,seat,intent);
      assert.equal(rootPhysicalWitness(intent,before,after,x.GamePhase),
        'confirmed-public-effect');
      assert.equal(x.owner.active.getPokemonCard()?.fullName,'Exeggutor PLF');
      assert.deepEqual(x.owner.active.energies.cards.map(c=>c.fullName),[JET]);
      const priorDamage=x.opponent.active.damage;
      x.f.store.dispatch(new AttackAction(x.owner.id,'Blockade'));
      const attackPrompts=settle(x,null);
      assert.equal(x.state.activePlayer,1-seat);
      assert.equal(x.opponent.cannotPlaySupporterCards,true);
      assert.equal(x.opponent.active.damage-priorDamage,10);
      console.log('AGENT40_NATIVE_GUZMA_GUST_ADAPTIVE_BLOCKADE',JSON.stringify({
        seat,originalRank1GuzmaAccepted:true,
        sourceAfterGust:'Exeggutor PLF',
        sourceSelectedAdaptedJetRecipient:intent.slot,
        physicalJetAttached:'Exeggutor PLF',
        secondTurnAttack:'Blockade',nativeOpponentSupporterLock:true,
        actualAttackDamageDelta:10,passPrompts,attackPrompts,
        competitivelyQualifiedGames:0
      }));
    }
    return;
  }

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
  const sourceView=actorObservation(x.state,seat);
  const defaultJet=choosePublicJetBenchSwitch(sourceView,x.catalog);
  assert.equal(defaultJet,null,
    'Generic Jet policy preserves the paid one-Colorless Burrow');
  const directCandidate=chooseOwnerBlockadeContinuation(sourceView,x.catalog);
  assert.equal(directCandidate?.kind,'attach-special-energy',
    'Printed numeric Colorless Blockade cost must be recognized by policy');

  const intent=chooseActorRootIntent(sourceView,x.catalog,{
    bunnelbyTmJetRoot:true,
    exeggutorBlockadeContinuation:true,
    ownRegisteredSixty:x.ownRegisteredSixty
  });
  assert.equal(intent.kind,'attach-special-energy');
  assert.equal(intent.slot,'bench');
  assert.equal(intent.index,exIndex);
  assert.equal(intent.printing,JET);
  assert.equal(intent.plannedAttackName,'Blockade');
  const heldIndex=intent.handIndex;
  assert.equal(x.owner.hand.cards[heldIndex]?.fullName,JET);
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
    benchAfterFirstTurn:firstTurnBench,
    activeAfterFirstTurn:firstTurnActive,
    benchAfterBlockade:x.owner.bench.map(slot=>
      slot.getPokemonCard()?.fullName??null),
    actualUnblockedOpponentTurn:true,
    genericJetWouldPreserveBurrow:true,
    policySelectedSecondTurnJet:true,
    plannedAttackName:intent.plannedAttackName,
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
  test('original rank1 Guzma can gust Exeggutor during unblocked window, seat '+seat,
    ()=>verify(seat,true));
  test('adapt after original rank1 Guzma and still use Blockade, seat '+seat,
    ()=>verify(seat,true,true));
  test('original rank6 Iron Thorns Guzma can gust Exeggutor, seat '+seat,
    ()=>verify(seat,true,false,6));
  test('adapt Blockade after original rank6 Iron Thorns Guzma, seat '+seat,
    ()=>verify(seat,true,true,6));
  test('original rank6 precharged Thorns uses Guzma + Volt Cyclone KO, seat '+seat,
    ()=>verify(seat,true,false,6,true));
}
