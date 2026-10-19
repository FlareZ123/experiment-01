'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(output,name));

/**
 * Test paid Apex Dragon copying BLK Haxorus's Basic-only instant KO.
 * Staged real Store action, with legitimate three-Energy Apex payment;
 * does not measure search/discard feasibility, game decisions or win rate.
 *
 * @param {string} targetName Exact pinned engine name.
 * @param {boolean} basic Whether the printed target is Basic.
 * @param {number} prizesExpected Printed Prize rule of the target.
 * @returns {object}
 */
function runHaxorusApexTarget(targetName,basic,prizesExpected) {
  const cards=initializeCards();
  const get=name=>cards.getCardByName(name);
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format,Stage}=load('game/store/card/card-types');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {ChoosePrizePromptResolver}=
    load('simple-bot/prompt-resolver/choose-prize-prompt-resolver');
  const {defaultStateScores}=
    load('simple-bot/simple-bot-definitions');
  const {clearCopyAttackSessionsForTests}=
    load('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const attackerCard=get('Regidrago VSTAR SIT');
  const payload=get('Haxorus SV11B');
  const defenderCard=get(targetName);
  assert.ok(attackerCard&&payload&&defenderCard,'Pinned target or payload unavailable');
  assert.equal(payload.stage,Stage.STAGE_2);
  assert.equal(payload.attacks.length,2);
  assert.equal(payload.attacks[1].name,'Axe Bomber',
    'Pinned Haxorus names its printed Axe Blast attack Axe Bomber');
  assert.equal(defenderCard.stage===Stage.BASIC,basic);

  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.activePlayer=0;
  state.gameSettings.format=Format.EXPANDED;

  const attacker=new Player();
  attacker.id=101;
  attacker.name='Regidrago';
  const defender=new Player();
  defender.id=202;
  defender.name='Opponent';
  state.players=[attacker,defender];

  attacker.active.cards.push(attackerCard);
  attacker.discard.cards.push(payload);
  defender.active.cards.push(defenderCard);
  const benched=new PokemonCardList();
  benched.cards.push(get('Dratini OBF'));
  defender.bench.push(benched);
  for(const player of state.players) {
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(get('Dratini OBF'));
      return prize;
    });
    player.deck.cards.push(get('Dratini OBF'));
  }
  for(const type of ['Grass','Grass','Fire']) {
    const card=get(type+' Energy MEE');
    assert.ok(card,'Expected MEE '+type);
    attacker.active.cards.push(card);
    attacker.active.energies.cards.push(card);
  }
  assert.equal(defender.active.getPokemonCard().name,defenderCard.name);
  const beforePrizes=attacker.getPrizeLeft();

  store.dispatch(new AttackAction(attacker.id,'Apex Dragon'));
  const prompt=state.prompts.find(p=>
    p.result===undefined && p.constructor.name==='ChooseAttackPrompt');
  assert.ok(prompt,'Paid Apex must open actual attack-copy prompt');
  assert.ok(prompt.cards.includes(payload),
    'Dragon BLK Haxorus must appear as legal discard attack source');
  assert.ok(prompt.validate(payload.attacks[1],state),
    'Chosen Haxorus attack must be valid under Apex copy prompt');
  store.dispatch(new ResolvePromptAction(prompt.id,payload.attacks[1]));

  // Prize awards use a real ChoosePrizePrompt. The Prize array keeps all six
  // slots and empties their CardLists, so count nonempty slots after settling.
  const prizeResolver=new ChoosePrizePromptResolver({scores:defaultStateScores});
  const settledPrompts=[];
  for(let i=0;i<12;i++) {
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    if(pending.constructor.name==='WaitPrompt') {
      store.dispatch(new ResolvePromptAction(pending.id,null));
    } else if(pending.constructor.name==='ChoosePrizePrompt') {
      const chooser=state.players.find(p=>p.id===pending.playerId);
      assert.ok(chooser);
      const action=prizeResolver.resolvePrompt(state,chooser,pending);
      assert.ok(action,'Real Prize resolver must choose valid Prize cards');
      store.dispatch(action);
    } else break;
    settledPrompts.push(pending.constructor.name);
  }
  const remainingPrizes=attacker.getPrizeLeft();
  const claimed=beforePrizes-remainingPrizes;
  const discarded=defender.discard.cards.some(c=>c.name===defenderCard.name);
  if(basic) {
    assert.equal(discarded,true,
      'Basic Active should be Knocked Out by Haxorus copied attack');
    assert.equal(claimed,prizesExpected,
      'Copied attack must award printed Basic target Prize count');
  } else {
    assert.equal(discarded,false,
      'Evolution Active must not be Knocked Out by Haxorus');
    assert.equal(claimed,0);
  }
  const observed={
    target:targetName,printedStage:basic?'Basic':'Evolution',
    underlyingPrintedAttack:'Axe Blast',pinnedAttackName:payload.attacks[1].name,
    apexEnergyPayment:'Grass Grass Fire',
    targetDiscarded:discarded,prizesTaken:claimed,
    settledPrompts,
    expectedPrizes:basic?prizesExpected:0,
    attackerActiveAttackName:attacker.active.getPokemonCard().attacks[0].name,
    qualification:'Staged Store action, no full game or human policy'
  };
  clearCopyAttackSessionsForTests();
  return observed;
}

/** @returns {object} */
function testHaxorusApexBasicKo(){
  const cases=[
    runHaxorusApexTarget('Iron Thorns ex TWM',true,2),
    runHaxorusApexTarget('Mega Absol ex MEG',true,3),
    runHaxorusApexTarget('Regidrago VSTAR SIT',false,0)
  ];
  return {engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases,competitiveGamesQualified:0};
}
if(require.main===module) {
  process.stdout.write(JSON.stringify(testHaxorusApexBasicKo(),null,2)+'\n');
}
module.exports={testHaxorusApexBasicKo,runHaxorusApexTarget};
