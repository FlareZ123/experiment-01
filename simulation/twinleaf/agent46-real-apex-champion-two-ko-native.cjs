'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {initializeCards} = require('./headless.cjs');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {installMimikyuNonGxCopycatHook} = require('./copycat-compat.cjs');
const {installDeclaredCopyHistoryHook} = require('./copycat-declared-history-hook.cjs');

const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output,name));

/**
 * Genuine Store attack/prompt contract for real Regidrago Apex, followed
 * by Mimikyu Copycat -> Timeless-GX and bonus-turn Power Beam.
 * The evolved/funded board is staged but the prior Apex Store attack runs
 * and chooses its Dragon payload through an original validated prompt.
 * No original-source 60 game, policy or win-rate conclusion follows.
 */
function stagedChampionPowerBeamAfterRealApex(options={}) {
  const useOriginal60=options.useOriginal60===true;
  const rawControl=options.rawControl===true;
  if(rawControl)assert.equal(useOriginal60,true,'Raw control requires authentic 60-card source inventories');
  const ownerSeat=options.ownerSeat??0;
  assert.ok(ownerSeat===0||ownerSeat===1,'Physical champion owner seat must be 0 or 1');
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(d=>d.rank===1);
  const opponentOriginal=roster.decks.find(d=>d.rank===10);
  assert.ok(champion&&opponentOriginal,'Both original 60-card inventories required');
  const requireOriginal=(deck,name,set,minimum)=> {
    const found=deck.cards.find(c=>c.name===name &&
      (set===null || c.printing?.set===set));
    assert.ok(found?.count>=minimum,
      'Original rank'+deck.rank+' requires '+minimum+' '+name+' '+set);
  };
  for(const [name,set,minimum] of [
    ['Mimikyu','GRI',1],['Dialga-GX','UPR',1],
    ['Radiant Eternatus','CRZ',1],["Lillie's Clefairy ex",'JTG',1],
    ['Psychic Energy',null,2]])requireOriginal(champion,name,set,minimum);
  for(const [name,set,minimum] of [
    ['Regidrago V','SIT',2],['Regidrago VSTAR','SIT',2],
    ['Double Dragon Energy','ROS',2],['Dialga-GX','UPR',1],
    ['Budew','ASC',1]])requireOriginal(opponentOriginal,name,set,minimum);
  const cards = initializeCards();
  const get = name => {
    const card = cards.getCardByName(name);
    assert.ok(card,'Missing pinned card: '+name);
    return card;
  };
  const plan=useOriginal60?planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  }):null;
  const sourceRank10=plan?.opponents.find(d=>d.rank===10)??null;
  if(useOriginal60){
    assert.equal(plan.candidate.cards?.length,60,
      'Original rank1 printed inventory must resolve to a native 60');
    assert.equal(sourceRank10?.cards?.length,60,
      'Original rank10 printed inventory must resolve to a native 60');
  }
  const championPool=plan?.candidate.cards.map(get)??[];
  const regidragoPool=sourceRank10?.cards.map(get)??[];
  const allChampionCards=championPool.slice();
  const allRegidragoCards=regidragoPool.slice();
  const take=(pool,name)=>{
    const index=pool.findIndex(card=>card.fullName===name ||
      (name==='Psychic Energy SVE' && card.name==='Psychic Energy'));
    assert.ok(index>=0,'Missing original-60 physical resource: '+name);
    return pool.splice(index,1)[0];
  };
  const champ=name=>useOriginal60?take(championPool,name):get(name);
  const regi=name=>useOriginal60?take(regidragoPool,name):get(name);
  const mimikyu=champ('Mimikyu GRI');
  const regidragoFirstBase=regi('Regidrago V SIT');
  const regidragoFirst=regi('Regidrago VSTAR SIT');
  const regidragoSecondBase=regi('Regidrago V SIT');
  const regidragoSecond=regi('Regidrago VSTAR SIT');
  const dialga=champ('Dialga-GX UPR');
  const radiant=champ('Radiant Eternatus CRZ');
  const clefairy=champ("Lillie's Clefairy ex JTG");
  const psychic1=champ('Psychic Energy SVE');
  const psychic2=champ('Psychic Energy SVE');
  const budew=regi('Budew ASC');
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {AttackAction}=engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {clearCopyAttackSessionsForTests}=
    engine('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const restoreCopy=rawControl?null:installMimikyuNonGxCopycatHook();
  const restoreHistory=rawControl?null:installDeclaredCopyHistoryHook({mimikyu:true,regidrago:true});
  try {
    const store=new Store({onStateChange() {}});
    const state=store.state;
    const candidate=new Player();
    candidate.id=101;
    candidate.name='shadow-rider-copycat-staged';
    const opponent=new Player();
    opponent.id=202;
    opponent.name='regidrago-staged';
    state.players=ownerSeat===0?[candidate,opponent]:[opponent,candidate];
    candidate.active.cards.push(mimikyu,psychic1,psychic2);
    candidate.active.energies.cards.push(psychic1,psychic2);
    candidate.discard.cards.push(dialga,radiant);
    const support=new PokemonCardList();
    support.cards.push(clefairy);
    candidate.bench.push(support);
    const opponentDialga=regi('Dialga-GX UPR');
    const dragonEnergy1=regi('Double Dragon Energy ROS');
    const dragonEnergy2=regi('Double Dragon Energy ROS');
    opponent.active.cards.push(regidragoFirstBase,regidragoFirst,dragonEnergy1,dragonEnergy2);
    opponent.active.energies.cards.push(dragonEnergy1,dragonEnergy2);
    opponent.discard.cards.push(opponentDialga);
    const second=new PokemonCardList();
    second.cards.push(regidragoSecondBase,regidragoSecond);
    opponent.bench.push(second);
    const spare=new PokemonCardList();
    spare.cards.push(budew);
    opponent.bench.push(spare);
    const zoneChecks=[];
    if(useOriginal60){
      candidate.deck.cards.push(...championPool);
      opponent.deck.cards.push(...regidragoPool);
      for(const player of state.players){
        player.prizes=Array.from({length:6},()=>{
          const prize=new CardList();
          prize.cards.push(player.deck.cards.shift());
          return prize;
        });
      }
    }else{
      for(const player of state.players) {
        player.prizes=Array.from({length:6},()=>
          CardList.fromList(['Psychic Energy SVE']));
        player.deck=CardList.fromList(Array(12).fill('Psychic Energy SVE'));
      }
    }
    /**
     * One physical object in exactly one player-owned zone at each checkpoint.
     * Secondary energy/card indexes are references and must not be recounted.
     */
    function auditPhysicalZones(label){
      if(!useOriginal60)return;
      for(const [player,original] of [
        [candidate,allChampionCards],[opponent,allRegidragoCards]]){
        const visible=[
          ...player.deck.cards,...player.hand.cards,...player.discard.cards,
          ...player.lostzone.cards,...player.prizes.flatMap(prize=>prize.cards),
          ...player.active.cards,...player.bench.flatMap(spot=>spot.cards)
        ];
        assert.equal(visible.length,60,
          label+': full original source 60 count must be preserved');
        assert.equal(new Set(visible).size,60,
          label+': no physical card can occupy multiple zones');
        assert.ok(visible.every(card=>original.includes(card)),
          label+': source-card object must remain in its original owner zones');
        zoneChecks.push({
          stage:label,rank:player.id===candidate.id?1:10,
          totalPhysicalCards:visible.length,uniquePhysicalCards:60,
          deck:player.deck.cards.length,hand:player.hand.cards.length,
          discard:player.discard.cards.length,
          prizes:player.prizes.flatMap(prize=>prize.cards).length,
          active:player.active.cards.length,
          bench:player.bench.flatMap(spot=>spot.cards).length
        });
      }
    }
    auditPhysicalZones('after-staged-original60-zones');
    const originalPrizeCards=candidate.prizes.flatMap(slot=>slot.cards);
    assert.equal(originalPrizeCards.length,6);
    assert.equal(new Set(originalPrizeCards).size,6,
      'The owner must begin with six distinct physical Prized cards');
    assert.equal(new Set([regidragoFirstBase,regidragoFirst,
      regidragoSecondBase,regidragoSecond]).size,4,
      'Both target Regidrago must have distinct physical V and VSTAR cards');
    const originalPrizeInHand=()=>
      originalPrizeCards.filter(card=>candidate.hand.cards.includes(card));
    state.activePlayer=1-ownerSeat;
    state.phase=GamePhase.PLAYER_TURN;
    state.turn=4;
    state.playerLastAttack={};
    const sourceDeckBeforeApex=opponent.deck.cards.length;
    store.dispatch(new AttackAction(opponent.id,'Apex Dragon'));
    const sourceChoice=state.prompts.find(p=>p.result===undefined &&
      p.constructor.name==='ChooseAttackPrompt');
    assert.ok(sourceChoice,'Actual Regidrago Apex must offer its Dragon discard');
    assert.ok(sourceChoice.cards.includes(opponentDialga));
    const sourceOverclock=opponentDialga.attacks.find(a=>a.name==='Overclock');
    assert.equal(sourceChoice.validate(sourceOverclock),true);
    store.dispatch(new ResolvePromptAction(sourceChoice.id,sourceOverclock));
    for(let i=0;i<16;i++){
      const pending=state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      assert.equal(pending.constructor.name,'WaitPrompt',
        'Original Apex source must close without another discretionary prompt');
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    const sourceHandAfterApex=opponent.hand.cards.length;
    const sourceDeckAfterApex=opponent.deck.cards.length;
    assert.equal(sourceHandAfterApex,6);
    assert.equal(sourceDeckAfterApex,sourceDeckBeforeApex-6,
      'Overclock must transfer six unique physical cards from source deck to hand');
    assert.equal(state.playerLastAttack[opponent.id]?.attack?.name,
      rawControl?'Overclock':'Apex Dragon',
      'Raw or corrected prior-attack name must match the selected mode');
    assert.equal(state.activePlayer,ownerSeat,'Opponent passed turn after Apex');
    assert.equal(state.phase,GamePhase.PLAYER_TURN);
    auditPhysicalZones('after-native-opponent-apex-overclock');

    /** Resolve a copied attack from own discard through a real source prompt. */
    function copyPayload(payload,attackName) {
      assert.equal(state.activePlayer,ownerSeat);
      assert.equal(state.phase,GamePhase.PLAYER_TURN);
      store.dispatch(new AttackAction(candidate.id,'Copycat'));
      const prompt=state.prompts.find(p=>p.result===undefined &&
        p.constructor.name==='ChooseAttackPrompt');
      assert.ok(prompt,'Copycat must offer the nested Apex payload');
      assert.ok(prompt.cards.includes(payload),'Own discarded payload missing');
      const selected=payload.attacks.find(a=>a.name===attackName);
      assert.ok(selected,attackName+' not printed on payload');
      assert.equal(prompt.validate(selected),true,'Copy prompt rejects '+attackName);
      store.dispatch(new ResolvePromptAction(prompt.id,selected));
      assert.equal(state.playerLastAttack[candidate.id]?.attack?.name,'Copycat');
      return {payload:payload.fullName,chosen:attackName,
        possible:prompt.cards.flatMap(c=>c.attacks.map(a=>a.name))};
    }

    /**
     * Advance all real Store KO, Prize, promotion and turn-boundary prompts.
     * Promote the prepared second VSTAR before the spare Dratini.
     */
    function finish() {
      const prompts=[];
      for(let i=0;i<24;i++) {
        const pending=state.prompts.find(p=>p.result===undefined);
        if(!pending)break;
        const label=pending.constructor.name;
        if(label==='WaitPrompt') {
          store.dispatch(new ResolvePromptAction(pending.id,null));
        } else if(label==='ChoosePrizePrompt') {
          const player=state.players.find(p=>p.id===pending.playerId);
          const n=pending.options.count;
          const prize=player.prizes.filter(x=>x.cards.length>0).slice(0,n);
          assert.equal(prize.length,n);
          store.dispatch(new ResolvePromptAction(pending.id,prize));
        } else if(label==='ChoosePokemonPrompt') {
          assert.equal(pending.playerId,opponent.id);
          const promote=opponent.bench.find(p=>p.cards.length>0);
          assert.ok(promote);
          store.dispatch(new ResolvePromptAction(pending.id,[promote]));
        } else {
          assert.fail('Unexpected actual source prompt '+label);
        }
        prompts.push(label);
      }
      assert.equal(state.prompts.some(p=>p.result===undefined),false,
        'Unresolved prompt after actual attack chain');
      return prompts;
    }

    const originalSourceAttack={
      declared:state.playerLastAttack[opponent.id]?.attack?.name,
      copiedDragonPayload:sourceOverclock.name,
      sourceHandAfterApex,sourceDeckBeforeApex,sourceDeckAfterApex,
      opponentDiscardDragonPresent:opponent.discard.cards.includes(opponentDialga)
    };
    if(rawControl){
      const beforeCopyHand=candidate.hand.cards.length;
      const beforeCopyDeck=candidate.deck.cards.length;
      store.dispatch(new AttackAction(candidate.id,'Copycat'));
      const prompts=finish();
      auditPhysicalZones('after-raw-mimikyu-copycat-overclock');
      assert.equal(opponent.active.damage,0,
        'Raw previous Overclock must not become the printed Apex Timeless KO');
      assert.equal(candidate.getPrizeLeft(),6);
      assert.equal(candidate.usedGX,false);
      const afterCopyHand=candidate.hand.cards.length;
      const afterCopyDeck=candidate.deck.cards.length;
      assert.equal(afterCopyHand-beforeCopyHand,
        beforeCopyDeck-afterCopyDeck,'Raw Overclock copy must conserve draw transfer');
      return {
        schema:'agent46-unpatched-original60-real-apex-copycat-control-v1',
        championOwnerSeat:ownerSeat,regidragoSourceSeat:1-ownerSeat,
        candidateNativeOrderedSha256:plan.candidateNativeOrderedSha256,
        originalSourceAttack,
        previousAttackMetadataInjected:false,
        bothReversibleHooksEnabled:false,
        exactOriginal60PhysicalObjectsStaged:true,
        original60ZoneChecks:zoneChecks,
        firstOwnerHandBeforeCopycat:beforeCopyHand,
        firstOwnerHandAfterCopycat:afterCopyHand,
        firstOwnerDeckBeforeCopycat:beforeCopyDeck,
        firstOwnerDeckAfterCopycat:afterCopyDeck,
        resolvedPrompts:prompts,
        resultingRegidragoDamage:opponent.active.damage,
        originalPrizesTaken:6-candidate.getPrizeLeft(),
        gxSpent:candidate.usedGX,
        qualifiedForCompetitiveInference:false
      };
    }
    const first=copyPayload(dialga,'Timeless-GX');
    assert.equal(candidate.usedGX,true);
    assert.equal(candidate.usedTurnSkip,true);
    assert.equal(opponent.active.damage,300,
      'Fairy Zone must double the first copied Psychic attack');
    const firstPrompts=finish();
    assert.ok(firstPrompts.includes('ChoosePrizePrompt'));
    assert.ok(firstPrompts.includes('ChoosePokemonPrompt'));
    assert.ok(opponent.discard.cards.includes(regidragoFirst));
    assert.ok(opponent.discard.cards.includes(regidragoFirstBase),
      'First Knock Out must discard its underlying physical Regidrago V');
    assert.ok(opponent.discard.cards.includes(dragonEnergy1));
    assert.ok(opponent.discard.cards.includes(dragonEnergy2));
    assert.equal(candidate.getPrizeLeft(),4);
    const physicalFirstPrizes=originalPrizeInHand();
    assert.equal(physicalFirstPrizes.length,2,
      'First two actual Prize card objects must enter owner hand');
    assert.strictEqual(opponent.active.getPokemonCard(),regidragoSecond);
    assert.equal(state.activePlayer,ownerSeat,
      'Timeless-GX bonus turn must skip the opponent after promoted KO');
    assert.equal(state.phase,GamePhase.PLAYER_TURN);
    assert.equal(state.playerLastAttack[opponent.id]?.attack?.name,'Apex Dragon',
      'Last printed opponent Apex remains eligible on immediate bonus turn');
    assert.equal(candidate.usedGX,true);
    auditPhysicalZones('after-first-native-knockout');

    const bonusTurn=state.turn;
    const secondCopy=copyPayload(radiant,'Power Beam');
    assert.equal(candidate.usedGX,true,
      'Second non-GX payload must keep prior GX allowance spent');
    assert.equal(opponent.active.damage,400,
      'Fairy Zone doubles copied Power Beam 200 against Dragon');
    const secondPrompts=finish();
    assert.ok(opponent.discard.cards.includes(regidragoSecond));
    assert.ok(opponent.discard.cards.includes(regidragoSecondBase),
      'Second Knock Out must discard its underlying physical Regidrago V');
    const physicalFourPrizes=originalPrizeInHand();
    assert.equal(physicalFourPrizes.length,4,
      'Four distinct originally Prized card objects must enter owner hand');
    assert.ok(physicalFirstPrizes.every(card=>physicalFourPrizes.includes(card)),
      'First two physical Prizes must remain owned after the second Knock Out');
    assert.equal(candidate.getPrizeLeft(),2,
      'Two additional Prizes must be taken for the second VSTAR');
    assert.strictEqual(opponent.active.getPokemonCard(),budew);
    assert.equal(state.playerLastAttack[candidate.id]?.attack?.name,'Copycat');
    auditPhysicalZones('after-second-native-knockout');

    return {
      schema:'agent46-real-prior-apex-champion-two-copycat-extra-turn-v1',
      originalSourceAttack,
      priorAttackMetadataInjected:false,
      championOwnerSeat:ownerSeat,
      regidragoSourceSeat:1-ownerSeat,
      bothReversibleHooksEnabled:true,
      priorAttackStoreSettled:true,
      bothRegidragoEvolutionStacksPresent:true,
      stagedSourceGlobalTurn:4,
      originalRank1AndRank10StagedNamedCardCountsVerified:true,
      exactOriginal60PhysicalObjectsStaged:useOriginal60,
      original60ZoneChecks:zoneChecks,
      candidateNativeOrderedSha256:plan?.candidateNativeOrderedSha256??null,
      rank10PrintSubstitutions:sourceRank10?.substitutions??null,
      candidatePrintSubstitutions:plan?.candidate.substitutions??null,
      sourceRank1BasicPsychicPrinting:'MEE',
      nativeBasicPsychicPrinting:useOriginal60?'MEE (resolver native card)':'SVE (synthetic fixture)',
      activeAfterTwoKnockouts:'Budew ASC',
      first,second:secondCopy,
      firstPrompts,secondPrompts,secondTurn:bonusTurn,
      firstKo:opponent.discard.cards.includes(regidragoFirst),
      secondKo:opponent.discard.cards.includes(regidragoSecond),
      firstUnderlyingVDiscarded:opponent.discard.cards.includes(regidragoFirstBase),
      secondUnderlyingVDiscarded:opponent.discard.cards.includes(regidragoSecondBase),
      firstKnockedOutSpecialEnergiesInOwnerDiscard:
        [dragonEnergy1,dragonEnergy2].every(e=>opponent.discard.cards.includes(e)),
      distinctInitiallyPrizedCardObjects:originalPrizeCards.length,
      distinctOriginalPrizeObjectsInHandAtFirstKO:physicalFirstPrizes.length,
      distinctOriginalPrizeObjectsInHandAtSecondKO:physicalFourPrizes.length,
      physicalOriginalPrizeObjectCustodyValidated:true,
      prizesTaken:4,usedGX:candidate.usedGX,
      declaredLastAttack:state.playerLastAttack[candidate.id]?.attack?.name,
      scope:'Staged Source Store only, no natural 60-card deal or policy inference',
      qualifiedForCompetitiveInference:false
    };
  } finally {
    if(restoreHistory)restoreHistory();
    if(restoreCopy)restoreCopy();
    clearCopyAttackSessionsForTests();
  }
}

if(require.main===module){
  process.stdout.write(JSON.stringify(stagedChampionPowerBeamAfterRealApex(),
    null,2)+'\n');
}
module.exports={stagedChampionPowerBeamAfterRealApex};
