'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {initializeCards}=require('./headless.cjs');
const {withRank26ExeggcutePump}=
  require('./rank26-exeggcute-pump-policy.cjs');
const {installDamagePumpSingleSourceHook}=
  require('./damage-pump-single-source-hook.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=rel=>require(path.join(OUTPUT,rel));

/**
 * Construct a source-60 card-conserved prepared board for a legal Pump effect.
 * Staging prior setup actions is not a valid first-turn draw or game sample.
 *
 * @param {0|1} sourceSeat
 * @returns {object}
 */
function fixture(sourceSeat) {
  const field=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const source60=field.candidate.cards.slice();
  const defending60=field.opponents.find(x=>x.rank===6)?.cards.slice();
  assert.equal(source60.length,60);
  assert.equal(defending60?.length,60);
  const remaining=source60.slice();
  /** @param {string} name */
  const take=name=>{
    const i=remaining.indexOf(name);
    assert.ok(i>=0,'Source physical card missing: '+name);
    return remaining.splice(i,1)[0];
  };
  const active=take('Meloetta ex SV11B');
  const benchNames=['Unown AOR','Squawkabilly ex PAL',
    'Dedenne-GX UNB','Exeggcute PLF','Exeggcute PLF'].map(take);
  const stadium=take('Risky Ruins MEG');
  const hand=[take('Damage Pump LOR'),...remaining.splice(0,6)];
  const prizes=remaining.splice(0,6);
  const deck=remaining;
  assert.equal(deck.length,40);
  assert.deepEqual([active,...benchNames,stadium,...hand,...prizes,...deck].sort(),
    source60.slice().sort(),'Exact rank26 source copies conserved.');

  const opposingRemaining=defending60.slice();
  const opposingIndex=opposingRemaining.indexOf('Iron Thorns ex TWM');
  assert.ok(opposingIndex>=0);
  const opposingActive=opposingRemaining.splice(opposingIndex,1)[0];
  const opposingHand=opposingRemaining.splice(0,7);
  const opposingPrizes=opposingRemaining.splice(0,6);
  assert.equal(opposingRemaining.length,46);
  assert.deepEqual([opposingActive,...opposingHand,...opposingPrizes,
    ...opposingRemaining].sort(),defending60.slice().sort());

  const manager=initializeCards();
  let id=200000;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Printed instance missing: '+name);
    c.id=id++;
    return c;
  };
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {CardList}=engine('game/store/state/card-list');
  const {GameSettings}=engine('game/core/game-settings');
  const {GamePhase}=engine('game/store/state/state');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const settings=new GameSettings();
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.turn=1;
  state.activePlayer=sourceSeat;
  state.phase=GamePhase.PLAYER_TURN;
  const own=new Player(),opponent=new Player();
  own.id=sourceSeat===0?101:202;
  opponent.id=sourceSeat===0?202:101;
  own.active.cards.push(card(active));
  for(const name of benchNames){
    const slot=new PokemonCardList();
    slot.cards.push(card(name));
    slot.damage=20;
    own.bench.push(slot);
  }
  own.stadium.cards.push(card(stadium));
  own.hand.cards.push(...hand.map(card));
  own.deck.cards.push(...deck.map(card));
  const toPrizes=cards=>cards.map(name=>{
    const p=new CardList();
    p.cards.push(card(name));
    return p;
  });
  own.prizes=toPrizes(prizes);
  opponent.active.cards.push(card(opposingActive));
  opponent.hand.cards.push(...opposingHand.map(card));
  opponent.deck.cards.push(...opposingRemaining.map(card));
  opponent.prizes=toPrizes(opposingPrizes);
  state.players=sourceSeat===0?[own,opponent]:[opponent,own];
  const ownCopies=[...own.active.cards,...own.bench.flatMap(s=>s.cards),
    ...own.stadium.cards,...own.hand.cards,...own.prizes.flatMap(s=>s.cards),
    ...own.deck.cards];
  assert.equal(ownCopies.length,60);
  assert.equal(new Set(ownCopies.map(c=>c.id)).size,60);
  return {store,state,own,opponent,sourceSeat,source60,defending60};
}

/** @param {0|1} sourceSeat @param {2|6} [opponentPrizesRemaining] */
function runSeat(sourceSeat,opponentPrizesRemaining=6) {
  const f=fixture(sourceSeat);
  // Stage four already-claimed opposing Prizes into their owner's hand,
  // preserving both printed 60s for the fifth-self-KO boundary.
  const alreadyTaken=f.opponent.prizes.slice(opponentPrizesRemaining)
    .flatMap(slot=>slot.cards.splice(0));
  f.opponent.hand.cards.push(...alreadyTaken);
  assert.equal(f.opponent.getPrizeLeft(),opponentPrizesRemaining);
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GamePhase}=engine('game/store/state/state');
  const restore=installDamagePumpSingleSourceHook();
  try{
    const audit=withRank26ExeggcutePump(sourceSeat,()=>{
      const actor={client:{id:f.own.id}};
      const decide=()=>SimpleTacticsAi.prototype.decodeNextAction.call(actor,f.state);
      const first=decide();
      assert.equal(first.constructor.name,'PlayCardAction');
      assert.equal(f.own.hand.cards[first.handIndex]?.name,'Damage Pump');
      f.store.dispatch(first);
      const prompt=f.state.prompts.find(x=>x.result===undefined);
      assert.equal(prompt?.constructor.name,'MoveDamagePrompt');
      assert.equal(prompt.options.singleSourceTarget,true);
      const next=decide();
      assert.equal(next.constructor.name,'ResolvePromptAction');
      assert.equal(prompt.validate(next.result,f.state),true);
      f.store.dispatch(next);
      const prizePrompt=f.state.prompts.find(x=>x.result===undefined);
      assert.equal(prizePrompt?.constructor.name,'ChoosePrizePrompt');
      const expectedKOs=opponentPrizesRemaining===2?1:2;
      assert.equal(prizePrompt.options.count,expectedKOs);
      const chosen=f.opponent.prizes.filter(x=>x.cards.length)
        .slice(0,expectedKOs);
      assert.equal(prizePrompt.validate(chosen,f.state),true);
      f.store.dispatch(new ResolvePromptAction(prizePrompt.id,chosen));
      assert.equal(f.opponent.getPrizeLeft(),
        opponentPrizesRemaining-expectedKOs);
      assert.equal(f.own.bench[3].cards.length,0);
      assert.equal(f.own.bench[4].cards.length,expectedKOs===1?1:0);
      assert.equal(f.own.bench[0].damage,20-10*expectedKOs);
      assert.equal(f.own.discard.cards.filter(c=>c.name==='Exeggcute').length,
        expectedKOs);
      return {card:'Damage Pump LOR',
        prompt:'MoveDamagePrompt',oneDonor:true,
        exeggcuteKnockedOut:expectedKOs,
        opponentPrizesBefore:opponentPrizesRemaining,
        opponentPrizesAfter:opponentPrizesRemaining-expectedKOs,
        stateStillPlayerTurn:f.state.phase===GamePhase.PLAYER_TURN};
    });
    assert.deepEqual(audit.policyAudit.actions.map(x=>x.action),
      ['PlayCardAction','ResolvePromptAction']);
    return {sourceSeat,opponentPrizesRemaining,result:audit.result,
      decisionAudit:audit.policyAudit,
      sourcePrintedCopies:60,
      opponentPrintedCopies:60};
  }finally{restore();}
}

/** Both physical seats must execute the same legal source-conserved move. */
function run(){
  return {
    schema:'aichi-rank26-autonomous-pump-prize-capped-physical-fixture-v2',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    samples:[runSeat(0),runSeat(1),runSeat(0,2),runSeat(1,2)],
    conservation:'Both registered Aichi 60s exactly conserved, but hand and board are prearranged.',
    sampledNaturalOpening:false,
    stagedFifthKOWithoutSixth:true,
    fullFiveKOsQualified:false,
    attackQualified:false,
    opponentPolicyQualified:false,
    competitiveGameQualified:false
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={fixture,runSeat,run};
