'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {preparedRegidrago}=require('./apex-attack-action.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {any} */
const load=p=>require(path.join(output,p));

/**
 * One physical Store-paid Apex Dragon copy of the PAL153 Noivern donor
 * into a published rank-6 Basic Iron Thorns ex defender. We stage cards,
 * not a source-dealt opening, so this tests attack resolution only.
 * @param {'Covert Flight'|'Dominating Echo'} attackName
 * @returns {object}
 */
function paidApexNoivernCopy(attackName) {
  const manager=initializeCards();
  const get=name=>manager.getCardByName(name);
  const noivern=get('Noivern ex PAL');
  const thorns=get('Iron Thorns ex TWM');
  assert.ok(noivern&&thorns,'Expected pinned Noivern PAL and Iron Thorns TWM');
  assert.equal(noivern.stage!==undefined,true);
  assert.ok(noivern.attacks.some(a=>a.name===attackName),
    'Noivern printed attack missing: '+attackName);
  const fixture=preparedRegidrago();
  fixture.attachFire();
  fixture.attacking.discard.cards.push(noivern);
  fixture.defending.active.cards.splice(0,1,thorns);
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {clearCopyAttackSessionsForTests}=
    load('game/store/prefabs/copy-attack-delegation');
  try {
    fixture.store.dispatch(new AttackAction(101,'Apex Dragon'));
    const prompt=fixture.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='ChooseAttackPrompt');
    assert.ok(prompt,'Paid Apex Dragon must prompt for discard donor attack');
    assert.ok(prompt.cards.includes(noivern),
      'Noivern ex must be available in the physical discard');
    const attack=noivern.attacks.find(a=>a.name===attackName);
    assert.ok(prompt.validate(attack,fixture.state),
      'Native attack choice must accept '+attackName);
    fixture.store.dispatch(new ResolvePromptAction(prompt.id,attack));
    const expected=attackName==='Covert Flight'?70:140;
    assert.equal(fixture.defending.active.damage,expected,
      'Copy damage must settle through native Store');
    assert.equal(fixture.attacking.active.getPokemonCard().attacks[0].name,
      'Apex Dragon','Copied attack must preserve original printed name');
    return {attack:attackName,donorPrinting:noivern.fullName,
      opponentPrinting:thorns.fullName,
      attackerPrint:fixture.attacking.active.getPokemonCard().fullName,
      directDamage:fixture.defending.active.damage,
      nativeTurn:fixture.state.turn,activePlayer:fixture.state.activePlayer,
      pendingPromptKinds:fixture.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name),
      qualifiedGame:false};
  } finally {
    clearCopyAttackSessionsForTests();
  }
}

/** @returns {object} */
function noivernSourceAttackContract() {
  return {kind:'apex-noivern-source-basic-native-copy-v1',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases:[paidApexNoivernCopy('Covert Flight'),
      paidApexNoivernCopy('Dominating Echo')],
    scope:'Staged funded attacker/physical discard and Basic defender. Opponent turn, duration of protection/hand lock, owner setup policy and competitive wins untested',
    competitiveGamesQualified:0};
}
if(require.main===module)process.stdout.write(
  JSON.stringify(noivernSourceAttackContract(),null,2)+'\n');
module.exports={paidApexNoivernCopy,noivernSourceAttackContract};
