'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runSeat}=require('./rank26-unown-starter-source-fixture.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));
const {PlayCardAction,PlayerType,SlotType}=
  engine('game/store/actions/play-card-action');
const {UseAbilityAction,AttackAction}=
  engine('game/store/actions/game-actions');
const {ResolvePromptAction}=
  engine('game/store/actions/resolve-prompt-action');
const {GamePhase}=engine('game/store/state/state');

const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
const bench=index=>({player:PlayerType.BOTTOM_PLAYER,
  slot:SlotType.BENCH,index});

/** Gather physical original-60 identities, including Active and Bench attachments. */
function physical(player){
  return [player.active,...player.bench].flatMap(slot=>[
    ...slot.cards,...slot.tools,...slot.energies.cards])
    .concat(player.stadium.cards,player.supporter.cards,
      player.hand.cards,player.deck.cards,player.discard.cards,
      player.lostzone.cards,...player.prizes.flatMap(p=>p.cards));
}

/** Find one original owner card and preserve six populated Prize positions. */
function prepareCard(player,name,destination){
  const zones=[player.hand,player.deck,...player.prizes];
  for(const zone of zones){
    const index=zone.cards.findIndex(c=>c.name===name);
    if(index<0)continue;
    if(player.prizes.includes(zone)){
      const displaced=player.deck.cards[0];
      assert.ok(displaced,'Cannot stage card from Prize with empty deck');
      const selected=zone.cards[index];
      zone.cards[index]=displaced;
      player.deck.cards[0]=selected;
      if(destination!==player.deck)player.deck.moveCardTo(selected,destination);
      return selected;
    }
    const selected=zone.cards[index];
    if(zone!==destination)zone.moveCardTo(selected,destination);
    return selected;
  }
  throw Error('Missing registered original rank26 card: '+name);
}

/** Play a physical held original source Item, Tool or attachment. */
function play(f,name,target,receipts){
  const index=f.own.hand.cards.findIndex(c=>c.name===name);
  assert.ok(index>=0,'Source not holding '+name);
  const original=f.own.hand.cards[index];
  f.store.dispatch(new PlayCardAction(f.own.id,index,target));
  assert.equal(f.own.hand.cards.includes(original),false,
    'Real Store did not consume owner card '+name);
  receipts.push({phase:'native-source-play',card:original.fullName,
    cardId:original.id,target,pending:f.state.prompts
      .find(p=>p.result===undefined)?.constructor.name??null});
  return original;
}

/** Finish one prepared original source's five authentic Store self-KOs. */
function continueAfterFiveKOs(f){
  const source=f.own,defender=f.opponent;
  const sourceBefore=physical(source).map(c=>c.id).sort((a,b)=>a-b);
  const defenderBefore=physical(defender).map(c=>c.id).sort((a,b)=>a-b);
  assert.equal(sourceBefore.length,60);
  assert.equal(defenderBefore.length,60);
  assert.equal(new Set(sourceBefore).size,60);
  assert.equal(new Set(defenderBefore).size,60);
  assert.equal(defender.getPrizeLeft(),1);
  assert.equal(defender.bench.filter(s=>s.getPokemonCard()).length,0);
  assert.equal(source.active.getPokemonCard()?.name,'Unown');
  assert.equal(source.bench[0].getPokemonCard()?.name,'Meloetta ex');
  assert.equal(source.bench[1].getPokemonCard()?.name,'Tapu Koko Prism Star');

  // This source-60 fixture stages printed hand and two discarded Lightning
  // cards. They could be obtained by search/compression in a real game, but
  // this fixture DOES NOT establish actual first-turn acquisition.
  const items=['Canceling Cologne','Double Colorless Energy',
    'Technical Machine: Crisis Punch','Escape Rope'];
  for(const name of items)prepareCard(source,name,source.hand);
  prepareCard(source,'Lightning Energy',source.discard);
  prepareCard(source,'Lightning Energy',source.discard);
  assert.equal(source.discard.cards.filter(c=>c.name==='Lightning Energy').length,2);
  assert.deepEqual(physical(source).map(c=>c.id).sort((a,b)=>a-b),sourceBefore);
  assert.equal(source.getPrizeLeft(),6);

  const receipts=[];
  const cologne=play(f,'Canceling Cologne',board,receipts);
  assert.ok(source.discard.cards.includes(cologne),
    'Cologne must enter owner discard before suppressed Koko use');
  const koko=source.bench[1].getPokemonCard();
  assert.equal(koko?.name,'Tapu Koko Prism Star');

  f.store.dispatch(new UseAbilityAction(source.id,'Dance of the Ancients',bench(1)));
  // Native Store may request opponent acknowledgements before the queued
  // AttachEnergyPrompt. These acknowledgements have no card selection.
  for(let i=0;i<12;i++){
    const pending=f.state.prompts.find(p=>p.result===undefined);
    if(pending?.constructor.name!=='WaitPrompt')break;
    receipts.push({phase:'native-koko-wait',owner:pending.playerId});
    f.store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  const energyPrompt=f.state.prompts.find(p=>p.result===undefined);
  assert.equal(energyPrompt?.constructor.name,'AttachEnergyPrompt',
    'Koko prompt after acknowledgement: '+
      JSON.stringify(f.state.prompts.filter(p=>p.result===undefined)
        .map(p=>({type:p.constructor.name,owner:p.playerId}))));
  assert.equal(energyPrompt.playerId,source.id);
  const lightnings=source.discard.cards
    .filter(c=>c.name==='Lightning Energy');
  assert.equal(lightnings.length,2);
  const transfers=[{card:lightnings[0],to:bench(0)},
    {card:lightnings[1],to:bench(2)}];
  assert.equal(energyPrompt.validate(transfers,f.state),true);
  f.store.dispatch(new ResolvePromptAction(energyPrompt.id,transfers));
  assert.equal(source.bench[0].energies.cards.some(c=>
    c.id===lightnings[0].id),true);
  assert.equal(source.bench[2].energies.cards.some(c=>
    c.id===lightnings[1].id),true);
  assert.equal(source.lostzone.cards.includes(koko),true,
    'One real Prism Star should enter source Lost Zone');
  receipts.push({phase:'native-koko-owner-ability',sourceAbility:
    'Dance of the Ancients',prompt:'AttachEnergyPrompt',
    distinctRecipients:[0,2],originalLightningIds:lightnings.map(x=>x.id),
    prismLostZoneId:koko.id});

  const dce=play(f,'Double Colorless Energy',bench(0),receipts);
  assert.equal(source.bench[0].energies.cards.includes(dce),true);
  const tm=play(f,'Technical Machine: Crisis Punch',bench(0),receipts);
  assert.equal(source.bench[0].tools.includes(tm),true);
  const energyOnMelo=source.bench[0].energies.cards.map(c=>c.name);
  assert.deepEqual(energyOnMelo.sort(),
    ['Double Colorless Energy','Lightning Energy'].sort());

  play(f,'Escape Rope',board,receipts);
  const switchPrompt=f.state.prompts.find(p=>p.result===undefined);
  assert.equal(switchPrompt?.constructor.name,'ChoosePokemonPrompt');
  assert.equal(switchPrompt.playerId,source.id);
  assert.equal(switchPrompt.validate([source.bench[0]],f.state),true);
  f.store.dispatch(new ResolvePromptAction(switchPrompt.id,[source.bench[0]]));
  assert.equal(source.active.getPokemonCard()?.name,'Meloetta ex');
  assert.equal(source.active.tools.includes(tm),true);
  assert.equal(source.active.energies.cards.includes(dce),true);
  receipts.push({phase:'native-escape-rope-promotion',
    sourceActive:'Meloetta ex',target:'own Bench index 0'});

  assert.equal(defender.getPrizeLeft(),1,
    'The fifth self-KO must precede the TM attack');
  assert.equal(f.state.turn,1);
  assert.equal(f.state.activePlayer,f.sourceSeat);
  f.store.dispatch(new AttackAction(source.id,'Crisis Punch'));
  receipts.push({phase:'native-attack-root',name:'Crisis Punch',
    opponentPrizeBefore:1,sourcePrizesBefore:source.getPrizeLeft()});
  for(let i=0;i<12;i++){
    const prompt=f.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    if(prompt.constructor.name==='WaitPrompt'){
      f.store.dispatch(new ResolvePromptAction(prompt.id,null));
      receipts.push({phase:'native-attack-wait',owner:prompt.playerId});
      continue;
    }
    if(prompt.constructor.name==='ChoosePrizePrompt'&&
      prompt.playerId===source.id){
      const choices=source.prizes.filter(p=>p.cards.length)
        .slice(0,prompt.options.count);
      assert.equal(prompt.validate(choices,f.state),true);
      f.store.dispatch(new ResolvePromptAction(prompt.id,choices));
      receipts.push({phase:'native-source-prize',count:choices.length});
      continue;
    }
    throw Error('Unexpected native attack prompt '+prompt.constructor.name+
      ' owned by '+prompt.playerId);
  }
  assert.equal(f.state.phase,GamePhase.FINISHED);
  assert.equal(f.state.winner,f.sourceSeat);
  assert.equal(defender.active.getPokemonCard(),undefined);
  assert.deepEqual(physical(source).map(c=>c.id).sort((a,b)=>a-b),sourceBefore);
  assert.deepEqual(physical(defender).map(c=>c.id).sort((a,b)=>a-b),
    defenderBefore);
  return {realStoreAttack:true,engineWinner:f.state.winner,
    firstPlayerSourceSeat:f.sourceSeat,sourceTurn:f.state.turn,
    original60BothSeatsConserved:true,sourceSelfKnockoutsBefore:5,
    opponentPrizesBeforeAttack:1,sourceActive:'Meloetta ex SV11B',
    attack:'Crisis Punch',sourceEnergy:['Lightning Energy',
      'Double Colorless Energy'],kokoTwoDistinctBenchRecipients:true,
    heldColognePlayedBeforeKoko:true,sourceEscapeRopePromotion:true,
    opponentSoleActiveKnockedOut:true,receipts,
    stagedInitialCards:true,actualRandomDeal:false,
    rootPaper:'unverified-original-hands-staged',
    promptPaper:'bounded-native-validated',
    paymentPaper:'bounded-source-original-physical',
    effectPaper:'bounded-native-five-KO-plus-attack',
    randomnessPaper:'not-encountered',
    opponentDecisionPolicyQualified:false,
    paperClockQualified:false,competitiveGameQualified:false};
}

/** Execute both source seats against unmodified rank6 original 60. */
function run(){
  return {schema:'rank26-unown-2plus2plus1-koko-crisis-staged-native-v1',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases:[runSeat(0,continueAfterFiveKOs),
      runSeat(1,continueAfterFiveKOs)],
    paperOriginalSource60:true,randomizedOriginalDeal:false,
    competitiveGameQualified:false};
}
module.exports={run,continueAfterFiveKOs,physical,prepareCard};
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
