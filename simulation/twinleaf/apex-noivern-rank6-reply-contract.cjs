'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {preparedRegidrago}=require('./apex-attack-action.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {any} */
const load=p=>require(path.join(output,p));

/**
 * Staged Store-copy followed by a deliberately staged opponent action. This
 * is a mechanical contrast, NOT a legal engine-controlled turn handoff.
 * @param {'Tail Snap'|'Covert Flight'} attackName
 * @returns {object}
 */
function stagedIronThornsResponse(attackName){
  const manager=initializeCards();
  const get=name=>manager.getCardByName(name);
  const dratini=get('Dratini OBF');
  const noivern=get('Noivern ex PAL');
  const thorns=get('Iron Thorns ex TWM');
  const lightning=get('Lightning Energy MEE');
  const dce=get('Double Colorless Energy SUM');
  assert.ok(dratini&&noivern&&thorns&&lightning&&dce,
    'Required pinned response printing unavailable');
  const fixture=preparedRegidrago();
  fixture.attachFire();
  const donor=attackName==='Tail Snap'?fixture.dratini:noivern;
  if(donor===noivern)fixture.attacking.discard.cards.push(donor);
  fixture.defending.active.cards.splice(0,1,thorns);
  fixture.defending.active.cards.push(lightning,dce);
  fixture.defending.active.energies.cards.push(lightning,dce);
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {GamePhase}=load('game/store/state/state');
  const {clearCopyAttackSessionsForTests}=
    load('game/store/prefabs/copy-attack-delegation');
  try {
    fixture.store.dispatch(new AttackAction(101,'Apex Dragon'));
    const choice=fixture.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='ChooseAttackPrompt');
    assert.ok(choice?.cards.includes(donor),
      'Copied attack donor must be in actual Store prompt');
    const copied=donor.attacks.find(a=>a.name===attackName);
    assert.ok(copied&&choice.validate(copied,fixture.state));
    fixture.store.dispatch(new ResolvePromptAction(choice.id,copied));
    for(let i=0;i<12;i++){
      const pending=fixture.state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      assert.equal(pending.constructor.name,'WaitPrompt',
        'Unexpected pending response setup prompt');
      fixture.store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    const initial={turn:fixture.state.turn,activePlayer:fixture.state.activePlayer,
      phase:fixture.state.phase,
      pending:fixture.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name)};
    // Only the opponent action is staged; the prior copy was actually
    // executed and the effect was installed through the real Store.
    fixture.state.activePlayer=1;
    fixture.state.turn=5;
    fixture.state.phase=GamePhase.PLAYER_TURN;
    fixture.store.dispatch(new AttackAction(202,'Volt Cyclone'));
    for(let i=0;i<12;i++){
      const pending=fixture.state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      assert.equal(pending.constructor.name,'WaitPrompt',
        'Unexpected turn-two attack-response prompt');
      fixture.store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    const damaged=fixture.attacking.active.damage;
    return {copiedName:attackName,sourceAttacker:'Iron Thorns ex TWM',
      opponentAttack:'Volt Cyclone',damageToRegidrago:damaged,
      firstAttackDamage:fixture.defending.active.damage,
      afterCopyBeforeManualAdvance:initial,
      replyState:{turn:fixture.state.turn,activePlayer:fixture.state.activePlayer,
        phase:fixture.state.phase},
      nativeStoreUsedForBothAttacks:true,storeOwnTurnHandoff:false,
      qualifiedGame:false};
  }finally{
    clearCopyAttackSessionsForTests();
  }
}

/** @returns {object} */
function noivernResponseContrast(){
  const control=stagedIronThornsResponse('Tail Snap');
  const protectedCase=stagedIronThornsResponse('Covert Flight');
  assert.equal(control.damageToRegidrago,140,
    'Copied non-protective attack must leave native Volt Cyclone damage');
  assert.equal(protectedCase.damageToRegidrago,0,
    'Copied Covert Flight should prevent Basic Volt Cyclone damage');
  return {kind:'native-staged-regidrago-noivern-basic-response-v1',
    control,protectedCase,
    boundary:'Native paid attacks but manually staged next opponent action. No full Store turn/Checkup transition or legal opening',
    competitiveGamesQualified:0};
}

if(require.main===module)process.stdout.write(
  JSON.stringify(noivernResponseContrast(),null,2)+'\n');
module.exports={stagedIronThornsResponse,noivernResponseContrast};
