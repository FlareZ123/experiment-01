'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {withPaperKoBeforeEndTurn,PINNED}=
  require('./agent37-paper-ko-before-endturn-hook.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {any} */
const load=p=>require(path.join(OUTPUT,p));

/**
 * Native three-Psychic Eon Blade200 on surviving 280HP Mega Absol ex.
 * Test that original and paper-KO-first adapter both enforce the printed
 * "can't attack on your next turn" across a genuine opponent pass.
 *
 * @param {0|1} actorSeat
 * @returns {object} Physical turn, board and next-own-turn block receipt.
 */
function eonBladeNextOwnTurn(actorSeat){
  const cards=initializeCards();
  let cardId=27100;
  const card=name=>{
    const c=cards.getCardByName(name);
    assert.ok(c,'Unknown pinned printed card '+name);
    c.id=cardId++;return c;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {Format}=load('game/store/card/card-types');
  const {GamePhase}=load('game/store/state/state');
  const {AttackAction,PassTurnAction}=
    load('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');
  const store=new Store({onStateChange(){}});
  const state=store.state,actor=new Player(),defender=new Player();
  actor.id=314;actor.name='Eon Blade owner';
  defender.id=628;defender.name='surviving Mega Absol';
  state.players=actorSeat===0?[actor,defender]:[defender,actor];
  state.activePlayer=actorSeat;state.turn=16;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  actor.active.cards.push(card('Latias ex SSP'));
  for(let i=0;i<3;i++)actor.active.energies.cards.push(card('Psychic Energy MEE'));
  defender.active.cards.push(card('Mega Absol ex M1L'));
  for(const p of [actor,defender]){
    for(let i=0;i<8;i++)p.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      p.prizes.push(prize);
    }
  }
  /**
   * Resolve only mandatory native WaitPrompt animations. Other prompts are
   * a fixture error rather than silently choosing owner resources.
   */
  function settleWaits(){
    const prompts=[];
    for(let i=0;i<36;i++){
      const p=state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      prompts.push(p.constructor.name);
      assert.equal(p.constructor.name,'WaitPrompt');
      store.dispatch(new ResolvePromptAction(p.id,null));
    }
    assert.equal(state.prompts.filter(x=>x.result===undefined).length,0);
    return prompts;
  }
  store.dispatch(new AttackAction(actor.id,'Eon Blade'));
  const afterAttackPrompts=settleWaits();
  assert.equal(defender.active.damage,200,'Printed 200 damage on Mega Absol ex');
  assert.equal(actor.active.cannotAttackNextTurn,true,
    'Eon Blade restriction must be active after own attack');
  assert.equal(actor.active.cannotAttackNextTurnPending,false);
  assert.equal(state.activePlayer,1-actorSeat);
  const afterAttackTurn=state.turn;
  store.dispatch(new PassTurnAction(defender.id));
  const afterDefenderPassPrompts=settleWaits();
  assert.equal(state.activePlayer,actorSeat);
  assert.equal(state.phase,GamePhase.PLAYER_TURN);
  assert.equal(actor.active.cannotAttackNextTurn,true,
    'Eon Blade still blocks owner's immediately following turn');
  const nextOwnTurn=state.turn;
  assert.throws(
    ()=>store.dispatch(new AttackAction(actor.id,'Eon Blade')),
    err=>err?.message==='BLOCKED_BY_EFFECT',
    'Native Store must reject repeat Eon Blade on next owner turn'
  );
  return {
    actorSeat,card:'Latias ex SSP',target:'Mega Absol ex M1L',
    afterAttackTurn,nextOwnTurn,
    afterAttackPrompts,afterDefenderPassPrompts,
    physicalDamageOnDefender:200,
    activeRestrictionOnOwnerNextTurn:true,
    repeatedEonBladeRejectedAs:'BLOCKED_BY_EFFECT',
    competitiveGamesQualified:0
  };
}

/** @returns {object} Four real native A/B next-own-turn restriction receipts. */
function auditEonBladeHook(){
  const pairs=[0,1].map(actorSeat=>{
    const baseline=eonBladeNextOwnTurn(actorSeat);
    const hooked=withPaperKoBeforeEndTurn(
      ()=>eonBladeNextOwnTurn(actorSeat));
    assert.equal(hooked.audit.attackEndTurnIntercepts,1);
    assert.equal(hooked.audit.completedAttackEndTurns,1);
    assert.equal(hooked.audit.originalStoreMethodRestored,true);
    assert.deepEqual(hooked.result,baseline);
    return {actorSeat,baseline,hooked:hooked.result,audit:hooked.audit};
  });
  return {pinnedTwinleaf:PINNED,passed:true,twoSeats:true,
    printedRestrictionPreserved:true,
    nativeMatchesBaseline:true,competitiveGamesQualified:0,pairs};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(auditEonBladeHook(),null,2)+'\n');
module.exports={auditEonBladeHook};
