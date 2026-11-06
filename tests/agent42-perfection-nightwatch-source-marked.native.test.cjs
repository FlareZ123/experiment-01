'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withSourceMarkedPaperRandomNightWatch}=
  require('../simulation/twinleaf/agent43-nightwatch-source-marked-random.cjs');
const {isDirectNightWatchHandPrompt}=
  require('../simulation/twinleaf/agent43-nightwatch-paper-random-resolver.cjs');
const {withNumericShufflePromptValidation}=
  require('../simulation/twinleaf/agent33-shuffle-prompt-numeric-validation.cjs');
const {newlyLoggedAttackDeclarations}=
  require('../simulation/evaluation/twinleaf-attack-log-declarations.cjs');

const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(BASE,name));

/**
 * Staged actual Store, one printed Mewtwo & Mew-GX copying the printed
 * Trevenant & Dusknoir-GX Night Watch attack from its owner's discard.
 * This is a constructed eligibility witness, not a natural-deal game.
 * @param {0|1} attackerSeat
 * @param {{ironThornsActive?:boolean,heldCologne?:boolean,
 *   garbodorBench?:boolean,heldBlower?:boolean}} [options]
 */
function stage(attackerSeat,options={}){
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {GamePhase}=native('game/store/state/state');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {Format}=native('game/store/card/card-types');
  const manager=initializeCards();
  let id=420000+attackerSeat*100;
  /** @param {string} name */
  function card(name){
    const value=manager.getCardByName(name);
    assert.ok(value,'Missing compiled printing: '+name);
    value.id=id++;
    return value;
  }
  const attacker=new Player(),defender=new Player();
  attacker.id=attackerSeat===0?101:202;
  defender.id=attackerSeat===0?202:101;
  attacker.name='Attacker Mewtwo seat '+attackerSeat;
  defender.name='Defender Rotom seat '+(1-attackerSeat);
  attacker.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  const donor=card('Trevenant & Dusknoir-GX SMP');
  attacker.discard.cards.push(donor);
  for(let n=0;n<3;n++){
    const energy=card('Psychic Energy SVE');
    attacker.active.cards.push(energy);
    attacker.active.energies.cards.push(energy);
  }
  defender.active.cards.push(card(options.ironThornsActive?
    'Iron Thorns ex TWM':'Rotom V LOR'));
  const heldCologne=options.heldCologne?
    card('Canceling Cologne ASR'):null;
  if(heldCologne)attacker.hand.cards.push(heldCologne);
  const heldBlower=options.heldBlower?card('Field Blower GRI'):null;
  if(heldBlower)attacker.hand.cards.push(heldBlower);
  let garbodorSlot=null,garbodorTool=null;
  if(options.garbodorBench){
    garbodorSlot=new PokemonCardList();
    garbodorSlot.cards.push(card('Trubbish BKP'),card('Garbodor BKP'));
    garbodorTool=card('Float Stone BKT');
    garbodorSlot.tools.push(garbodorTool);
    defender.bench.push(garbodorSlot);
  }
  const victimHand=['Psychic Energy SVE','Water Energy SVE','Grass Energy SVE']
    .map(card);
  defender.hand.cards.push(...victimHand);
  for(const player of [attacker,defender]){
    for(let i=0;i<10;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=attackerSeat===0?[attacker,defender]:[defender,attacker];
  state.activePlayer=attackerSeat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,attacker,defender,donor,victimHand,heldCologne,
    heldBlower,garbodorSlot,garbodorTool};
}

/**
 * Drive only engine-created WaitPrompts; meaningful choice prompts are made
 * explicitly by the owner below, preserving source-card provenance.
 * @param {object} f Stage.
 */
function settleWait(f){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  for(let i=0;i<12;i++){
    const pending=f.state.prompts.find(p=>p.result===undefined);
    if(pending?.constructor?.name!=='WaitPrompt')return pending;
    f.store.dispatch(new ResolvePromptAction(pending.id,true));
  }
  throw new Error('Unexpected >12 native WaitPrompts');
}

for(const seat of [0,1]){
  test('actual Perfection -> copied Night Watch source-marked paper indices, seat '+seat,()=>{
    const {clearCopyAttackSessionsForTests}=
      native('game/store/prefabs/copy-attack-delegation');
    const {UseAbilityAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
    const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
    const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
    const {ChooseCardsPrompt}=native('game/store/prompts/choose-cards-prompt');
    const original=SimpleTacticsAi.prototype.resolvePrompt;
    clearCopyAttackSessionsForTests();
    const f=stage(seat);
    const bot=Object.create(SimpleTacticsAi.prototype);
    try{
      const result=withSourceMarkedPaperRandomNightWatch(()=>{
        f.store.dispatch(new UseAbilityAction(f.attacker.id,'Perfection',{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
        }));
        const select=settleWait(f);
        assert.equal(select?.constructor?.name,'ChooseAttackPrompt');
        assert.equal(select.playerId,f.attacker.id);
        const source=select.cards.find(x=>
          x.fullName==='Trevenant & Dusknoir-GX SMP');
        assert.strictEqual(source,f.donor);
        const nightWatch=source.attacks.find(x=>x.name==='Night Watch');
        assert.ok(nightWatch);
        assert.equal(select.validate(nightWatch),true);
        f.store.dispatch(new ResolvePromptAction(select.id,nightWatch));
        const randomHand=settleWait(f);
        assert.ok(randomHand instanceof ChooseCardsPrompt);
        assert.equal(randomHand.playerId,f.attacker.id);
        assert.strictEqual(randomHand.cards,f.defender.hand);
        assert.equal(isDirectNightWatchHandPrompt(f.state,f.attacker,randomHand),false,
          'Direct-only paper-random resolver misses an otherwise matching Perfection copy');
        assert.equal(randomHand.options.min,2);
        assert.equal(randomHand.options.max,2);
        const answer=bot.resolvePrompt(f.attacker,f.state,randomHand);
        assert.ok(answer instanceof ResolvePromptAction);
        assert.equal(randomHand.validate(answer.result,f.state),true);
        f.store.dispatch(answer);
        assert.equal(f.defender.hand.cards.length,1);
        assert.ok(answer.result.every(x=>f.defender.deck.cards.includes(x)));
        return {chosen:answer.result,remaining:f.defender.hand.cards.slice(),
          next:settleWait(f)?.constructor?.name??null};
      },{seed:20261106+seat});
      assert.equal(result.audit.markedSourcePrompts,1);
      assert.equal(result.audit.samples.length,1);
      assert.equal(result.audit.prototypeRestored,true);
      assert.strictEqual(SimpleTacticsAi.prototype.resolvePrompt,original);
      const sample=result.audit.samples[0];
      assert.equal(sample.seat,seat);
      assert.equal(sample.handSize,3);
      assert.equal(sample.sourcePrinting,'Trevenant & Dusknoir-GX SMP');
      assert.equal(sample.activeUser,'Mewtwo & Mew-GX UNM');
      assert.equal(sample.sourceBoundToCopycat,true);
      assert.equal(sample.opponentPrivateCardNamesReadForDecision,false);
      assert.deepEqual(result.result.chosen,
        sample.sampledPhysicalIndices.map(i=>f.victimHand[i]));
      console.log('AGENT42_PERFECTION_NIGHTWATCH_NATIVE',JSON.stringify({
        seat,printedDonor:'Trevenant & Dusknoir-GX SMP',
        actingPokemon:'Mewtwo & Mew-GX UNM',
        promptCount:result.audit.markedSourcePrompts,
        sampleIndex:sample.sampledPhysicalIndices,
        nextPrompt:result.result.next,
        qualifiedCompetitiveGames:0
      }));
    }finally{
      clearCopyAttackSessionsForTests();
      assert.strictEqual(SimpleTacticsAi.prototype.resolvePrompt,original);
    }
  });
}


/**
 * Advance the mandatory printed reveal and deck shuffle after Night Watch.
 * This fixed diagnostic shuffle is independent of opponent card identities.
 * @param {object} f Stage.
 * @returns {string[]} Prompt types actually settled.
 */
function settleOriginalNightWatchPostPrompts(f){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {seededRandom}=require('../simulation/twinleaf/headless.cjs');
  const rng=seededRandom(42062026);
  const settled=[];
  for(let step=0;step<24;step++){
    const prompt=f.state.prompts.find(x=>x.result===undefined);
    if(!prompt)return settled;
    const kind=prompt.constructor.name;
    let answer;
    if(kind==='WaitPrompt'||kind==='ShowCardsPrompt')answer=true;
    else if(kind==='ShuffleDeckPrompt'){
      const recipient=f.state.players.find(x=>x.id===prompt.playerId);
      assert.ok(recipient);
      answer=Array.from({length:recipient.deck.cards.length},(_,i)=>i);
      for(let i=answer.length-1;i>0;i--){
        const j=Math.floor(rng()*(i+1));
        [answer[i],answer[j]]=[answer[j],answer[i]];
      }
      assert.equal(prompt.validate(answer,f.state),true);
    }else throw new Error('Unexpected Perfection attack prompt: '+kind);
    settled.push(kind);
    f.store.dispatch(new ResolvePromptAction(prompt.id,answer));
  }
  throw new Error('Mandatory Night Watch post-prompts did not settle within 24 roots');
}

for(const seat of [0,1]){
  test('complete original copied Night Watch damage and ledger origin, seat '+seat,()=>{
    const {clearCopyAttackSessionsForTests}=
      native('game/store/prefabs/copy-attack-delegation');
    const {UseAbilityAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
    const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
    const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
    const original=SimpleTacticsAi.prototype.resolvePrompt;
    clearCopyAttackSessionsForTests();
    const f=stage(seat);
    const storeDispatch=f.store.dispatch.bind(f.store);
    const actionTape=[];
    const loggedAttackDeclarations=[];
    f.store.dispatch=function(action){
      const logStart=f.state.logs.length;
      const turnBefore=f.state.turn;
      const name=action.constructor.name;
      const ordinal=actionTape.length;
      actionTape.push(name);
      const result=storeDispatch(action);
      loggedAttackDeclarations.push(...newlyLoggedAttackDeclarations(
        f.state.logs,logStart,{actionOrdinal:ordinal,turnBefore,
          triggerAction:name}));
      return result;
    };
    const bot=Object.create(SimpleTacticsAi.prototype);
    try{
      const shuffled=withNumericShufflePromptValidation(()=>
        withSourceMarkedPaperRandomNightWatch(()=>{
        f.store.dispatch(new UseAbilityAction(f.attacker.id,'Perfection',{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
        }));
        const choice=settleWait(f);
        assert.equal(choice?.constructor?.name,'ChooseAttackPrompt');
        const source=choice.cards.find(x=>
          x.fullName==='Trevenant & Dusknoir-GX SMP');
        assert.ok(source);
        const attack=source.attacks.find(x=>x.name==='Night Watch');
        assert.ok(attack);
        assert.equal(choice.validate(attack),true);
        f.store.dispatch(new ResolvePromptAction(choice.id,attack));
        const randomHand=settleWait(f);
        assert.equal(randomHand?.constructor.name,'ChooseCardsPrompt');
        assert.equal(isDirectNightWatchHandPrompt(f.state,f.attacker,randomHand),
          false);
        const resolve=bot.resolvePrompt(f.attacker,f.state,randomHand);
        assert.ok(resolve instanceof ResolvePromptAction);
        f.store.dispatch(resolve);
        const handAfterDisruption=f.defender.hand.cards.length;
        assert.equal(handAfterDisruption,1,
          'Before the next-turn draw, two printed-random cards left the three-card hand');
        const followup=settleOriginalNightWatchPostPrompts(f);
        return {followup,handAfterDisruption,
          handAfterNextTurn:f.defender.hand.cards.length,
          damaged:f.defender.active.damage,phase:f.state.phase,
          turn:f.state.turn,currentPlayer:f.state.activePlayer,
          lastAttack:f.state.lastAttack?.name??null,
          lastOwnerAttack:f.state.playerLastAttack?.[f.attacker.id]?.attack?.name??null};
      },{seed:429260+seat}));
      const corrected=shuffled.result;
      assert.ok(shuffled.audit.rawRejectedCorrected>=1,
        'Existing Agent33 numeric shuffle hook must correct real pinned 12-card reject');
      assert.equal(corrected.audit.samples.length,1);
      assert.equal(corrected.audit.markedSourcePrompts,1);
      assert.equal(corrected.audit.prototypeRestored,true);
      console.log('AGENT42_PERFECTION_SETTLED_DIAGNOSTIC',JSON.stringify({
        seat,actionTape,loggedAttackDeclarations,shuffleAudit:shuffled.audit,
        observed:corrected.result,competitivelyQualifiedGames:0
      }));
      assert.equal(corrected.result.handAfterDisruption,1);
      assert.equal(corrected.result.damaged,150,
        'Fully resolved copied printed attack must deal 150 to Rotom V');
      assert.equal(actionTape.filter(x=>x==='UseAbilityAction').length,1);
      assert.equal(actionTape.filter(x=>x==='AttackAction').length,0);
      assert.equal(loggedAttackDeclarations.length,1,
        'One native copy produces exactly one engine attack declaration');
      assert.equal(loggedAttackDeclarations[0].attackName,'Night Watch');
      assert.equal(loggedAttackDeclarations[0].playerName,f.attacker.name,
        'The logged attacker identity must match real owner on both seats');
      assert.equal(loggedAttackDeclarations[0].triggerAction,'ResolvePromptAction',
        'The attack declaration occurs when its Perfection source prompt is answered');
      assert.ok(corrected.result.followup.includes('ShowCardsPrompt'));
      assert.ok(corrected.result.followup.includes('ShuffleDeckPrompt'));
      console.log('AGENT42_PERFECTION_ATTACK_LEDGER',JSON.stringify({
        seat,actionTape,loggedAttackDeclarations,
        postPromptTypes:corrected.result.followup,
        resultingActiveDamage:corrected.result.damaged,
        phase:corrected.result.phase,turn:corrected.result.turn,
        currentPlayer:corrected.result.currentPlayer,
        lastAttack:corrected.result.lastAttack,
        lastOwnerAttack:corrected.result.lastOwnerAttack,
        competitiveGamesQualified:0
      }));
    }finally{
      clearCopyAttackSessionsForTests();
      assert.strictEqual(SimpleTacticsAi.prototype.resolvePrompt,original);
    }
  });
}


for(const seat of [0,1]){
  test('actual Cologne unlock -> paid Perfection Night Watch through Iron Thorns, seat '+seat,()=>{
    const {clearCopyAttackSessionsForTests}=
      native('game/store/prefabs/copy-attack-delegation');
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const {UseAbilityAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
    const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
    const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
    const original=SimpleTacticsAi.prototype.resolvePrompt;
    clearCopyAttackSessionsForTests();
    const f=stage(seat,{ironThornsActive:true,heldCologne:true});
    const mew=f.attacker.active.getPokemonCard();
    assert.equal(f.defender.active.getPokemonCard().fullName,'Iron Thorns ex TWM');
    assert.equal(IS_ABILITY_BLOCKED(f.store,f.state,f.attacker,mew),true);
    const bot=Object.create(SimpleTacticsAi.prototype);
    try{
      f.store.dispatch(new PlayCardAction(f.attacker.id,
        f.attacker.hand.cards.indexOf(f.heldCologne),
        {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
      assert.equal(f.attacker.hand.cards.includes(f.heldCologne),false);
      assert.equal(f.defender.marker.hasMarker('CANCELING_COLOGNE_MARKER',
        f.heldCologne),true);
      assert.equal(IS_ABILITY_BLOCKED(f.store,f.state,f.attacker,mew),false);
      const settled=withNumericShufflePromptValidation(()=>
        withSourceMarkedPaperRandomNightWatch(()=>{
          f.store.dispatch(new UseAbilityAction(f.attacker.id,'Perfection',{
            player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
          }));
          const choose=settleWait(f);
          assert.equal(choose?.constructor?.name,'ChooseAttackPrompt');
          assert.equal(choose.playerId,f.attacker.id);
          const source=choose.cards.find(x=>x===f.donor);
          assert.ok(source);
          const nightWatch=source.attacks.find(x=>x.name==='Night Watch');
          assert.ok(nightWatch);
          assert.equal(choose.validate(nightWatch),true);
          f.store.dispatch(new ResolvePromptAction(choose.id,nightWatch));
          const hand=settleWait(f);
          assert.equal(hand?.constructor?.name,'ChooseCardsPrompt');
          assert.strictEqual(hand.cards,f.defender.hand);
          assert.equal(isDirectNightWatchHandPrompt(f.state,f.attacker,hand),
            false);
          f.store.dispatch(bot.resolvePrompt(f.attacker,f.state,hand));
          const disruptedHand=f.defender.hand.cards.length;
          const postPrompts=settleOriginalNightWatchPostPrompts(f);
          return {disruptedHand,postPrompts,damage:f.defender.active.damage,
            turn:f.state.turn,activeSeat:f.state.activePlayer};
        },{seed:420010+seat}));
      assert.equal(settled.audit.rawRejectedCorrected,1);
      const actual=settled.result;
      assert.equal(actual.audit.markedSourcePrompts,1);
      assert.equal(actual.audit.samples.length,1);
      assert.equal(actual.audit.prototypeRestored,true);
      assert.equal(actual.audit.samples[0].sourceBoundToCopycat,true);
      assert.equal(actual.audit.samples[0].activeUser,'Mewtwo & Mew-GX UNM');
      assert.equal(actual.result.disruptedHand,1);
      assert.equal(actual.result.damage,150);
      assert.equal(actual.result.turn,5);
      assert.equal(actual.result.activeSeat,1-seat);
      assert.ok(actual.result.postPrompts.includes('ShuffleDeckPrompt'));
      console.log('AGENT42_COLOGNE_PERFECTION_THORNS_NATIVE',JSON.stringify({
        seat,attackingPokemon:mew.fullName,
        opponentActive:'Iron Thorns ex TWM',source:'Trevenant & Dusknoir-GX SMP',
        paidCopiedAttack:'Night Watch',damage:actual.result.damage,
        handAfterDisruption:actual.result.disruptedHand,
        turnAfterSettlement:actual.result.turn,
        correctedShuffle: settled.audit.rawRejectedCorrected,
        sample:actual.audit.samples[0],qualifiedGames:0
      }));
    }finally{
      clearCopyAttackSessionsForTests();
      assert.strictEqual(SimpleTacticsAi.prototype.resolvePrompt,original);
    }
  });
}
