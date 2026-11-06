'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withSourceMarkedPaperRandomNightWatch}=
  require('../simulation/twinleaf/agent43-nightwatch-source-marked-random.cjs');

const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(BASE,name));

/**
 * Staged actual Store, one printed Mewtwo & Mew-GX copying the printed
 * Trevenant & Dusknoir-GX Night Watch attack from its owner's discard.
 * This is a constructed eligibility witness, not a natural-deal game.
 * @param {0|1} attackerSeat
 */
function stage(attackerSeat){
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {GamePhase}=native('game/store/state/state');
  const {CardList}=native('game/store/state/card-list');
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
  attacker.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  const donor=card('Trevenant & Dusknoir-GX SMP');
  attacker.discard.cards.push(donor);
  for(let n=0;n<3;n++){
    const energy=card('Psychic Energy SVE');
    attacker.active.cards.push(energy);
    attacker.active.energies.cards.push(energy);
  }
  defender.active.cards.push(card('Rotom V LOR'));
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
  return {store,state,attacker,defender,donor,victimHand};
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
