'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {captureChooseAttackReference} = require('./choose-attack-reference.cjs');
const {newlyLoggedAttackDeclarations} =
  require('../evaluation/twinleaf-attack-log-declarations.cjs');

const PINNED = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/**
 * Two donor inventories have the same selected live Latios-EX Attack object,
 * but reverse the relative discard order of a different GX attack also named
 * Fast Raid. The second donor's attack is unaffordable with only Psychic.
 * This is a staged diagnostic, never an actual Aichi source opening.
 *
 * @param {'latios-first'|'pheromosa-first'} order
 * @returns {object}
 */
function probe(order) {
  const manager = initializeCards();
  let serial = 1;
  /** @param {string} name */
  const make = name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Pinned printing missing: ' + name);
    card.id = serial++;
    return card;
  };
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format} = load('game/store/card/card-types');
  const {UseAbilityAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType} = load('game/store/actions/play-card-action');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const opponent = new Player();
  opponent.id = 101;
  opponent.name = 'controlled defender';
  opponent.active.cards.push(make('Pidgey MEW'));
  const player = new Player();
  player.id = 202;
  player.name = 'controlled copy attacker';
  player.active.cards.push(make('Mewtwo & Mew-GX UNM'));
  player.active.energies.cards.push(make('Psychic Energy SVE'));
  const latios = make('Latios-EX ROS');
  const pheromosa = make('Pheromosa-GX UPR');
  const ordered = order === 'latios-first' ? [latios,pheromosa] : [pheromosa,latios];
  player.discard.cards.push(...ordered);
  for (const owner of [opponent,player]) {
    owner.deck.cards.push(make('Psychic Energy SVE'),make('Psychic Energy SVE'));
    for (let i=0; i<6; i++) {
      const prize = new CardList();
      prize.cards.push(make('Psychic Energy SVE'));
      owner.prizes.push(prize);
    }
  }
  state.players=[opponent,player];
  state.activePlayer=1;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const trace=[];
  /** @returns {object|undefined} */
  const pending = () => state.prompts.find(p=>p.result===undefined);
  /** @param {object} action */
  const dispatch=action=>{
    const before=state.logs.length;
    const ordinal=trace.length+1;
    const turnBefore=state.turn;
    store.dispatch(action);
    const declarations=newlyLoggedAttackDeclarations(state.logs,before,{
      actionOrdinal:ordinal,turnBefore,triggerAction:action.constructor.name
    });
    trace.push({
      ordinal,action:action.constructor.name,
      declarations:declarations.map(d=>d.attackName),
      damageAfter:opponent.active.damage
    });
  };
  dispatch(new UseAbilityAction(player.id,'Perfection',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  for (let i=0; pending()?.constructor.name==='WaitPrompt' && i<12;i++) {
    dispatch(new ResolvePromptAction(pending().id,true));
  }
  const prompt=pending();
  assert.equal(prompt?.constructor.name,'ChooseAttackPrompt');
  const target=prompt.cards.find(c=>c===latios);
  assert.ok(target,'Latios source object must be present in real prompt');
  const selection=target.attacks.find(a=>a.name==='Fast Raid');
  assert.equal(selection?.damage,40);
  assert.equal(selection.cost?.length,1);
  assert.equal(prompt.validate(selection),true,
    'Latios Psychic Fast Raid must be selectable with one Psychic Energy');
  const blockedPheromosa=prompt.options.blocked.some(b=>
    prompt.cards[b.index]===pheromosa && b.attack==='Fast Raid');
  assert.equal(blockedPheromosa,true,
    'Pheromosa Grass Fast Raid is blocked with one Psychic Energy');
  const choice=new ResolvePromptAction(prompt.id,selection);
  const attackReference=captureChooseAttackReference(prompt,choice);
  dispatch(choice);
  for (let i=0; pending()?.constructor.name==='WaitPrompt' && i<12;i++) {
    dispatch(new ResolvePromptAction(pending().id,true));
  }
  const declared=trace.flatMap(x=>x.declarations);
  assert.ok(declared.includes('Fast Raid'));
  assert.equal(attackReference.selection.printing,'Latios-EX ROS');
  assert.equal(attackReference.selection.attackName,'Fast Raid');
  return {
    order,sourceOrder:ordered.map(c=>c.fullName),
    selectedPrinting:attackReference.selection.printing,
    selectedAttackName:attackReference.selection.attackName,
    selectedPrintedDamage:selection.damage,
    blockedOtherSource:blockedPheromosa,
    observedDefenderDamage:opponent.active.damage,
    rootTrace:trace
  };
}
/** @returns {object} */
function run() {
  const latiosFirst=probe('latios-first');
  const pheromosaFirst=probe('pheromosa-first');
  assert.equal(latiosFirst.observedDefenderDamage,40,
    'Baseline selected Latios Fast Raid should deal printed 40 damage');
  assert.equal(pheromosaFirst.observedDefenderDamage,30,
    'Pinned source-name fallback should reproduce unselected Pheromosa 30 damage');
  assert.equal(latiosFirst.selectedPrinting,pheromosaFirst.selectedPrinting);
  assert.equal(latiosFirst.selectedPrintedDamage,pheromosaFirst.selectedPrintedDamage);
  return {
    schema:'duplicate-attack-name-source-printing-mismatch-staged-v1',
    engine:PINNED,
    scope:'Pinned staged Store, not a source-dealt matchup; known unpatched defect reproduction',
    selectedSourceStable:true,
    orderSensitiveDamage:true,
    latiosFirst,pheromosaFirst,
    competitiveQualification:false
  };
}
if (require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
