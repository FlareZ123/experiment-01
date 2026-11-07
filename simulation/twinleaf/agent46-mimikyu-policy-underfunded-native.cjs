'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stageCopycat}=require('./agent46-mimikyu-apex-copycat-native.cjs');
const {withCopycatApexTimelessPolicy,isCopycatApexTimelessSituation}=
  require('./mimikyu-counter-policy.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(OUTPUT,name));
const {AttackAction}=native('game/store/actions/game-actions');
const {Simulator}=native('game/bots/simulator');
const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
const definitions=native('simple-bot/simple-bot-definitions');
const {clearCopyAttackSessionsForTests}=
  native('game/store/prefabs/copy-attack-delegation');

/**
 * Ask the actual pinned SimpleTacticsAi to choose on a staged Copycat/Apex
 * root, recording the custom tactic's proposed action before common
 * Simulator validation.
 *
 * @param {0|1} seat Physical owner seat.
 * @param {1|2} energyCount Psychic Energy attached to Mimikyu.
 * @returns {object} Tactic proposal, Simulator legality and selected action.
 */
function probe(seat,energyCount){
  assert.ok(energyCount===1||energyCount===2);
  clearCopyAttackSessionsForTests();
  const staged=stageCopycat(seat,'apex');
  const x=staged.x;
  const energies=x.owner.active.energies.cards.slice();
  assert.equal(energies.length,2);
  while(energies.length>energyCount){
    const energy=energies.pop();
    const index=x.owner.active.cards.indexOf(energy);
    assert.ok(index>=0);
    x.owner.active.cards.splice(index,1);
    x.owner.active.energies.cards.splice(
      x.owner.active.energies.cards.indexOf(energy),1);
    x.owner.discard.cards.push(energy);
  }
  for(const slot of x.owner.bench){
    slot.cards.length=0;
    slot.energies.cards.length=0;
  }
  x.owner.hand.cards.length=0;
  x.state.activePlayer=seat;
  x.state.phase=x.GamePhase.PLAYER_TURN;

  assert.equal(x.owner.active.getPokemonCard()?.fullName,'Mimikyu GRI');
  assert.equal(x.owner.active.energies.cards.length,energyCount);
  assert.equal(isCopycatApexTimelessSituation(x.state,x.owner),true,
    'All public Copycat/Apex/unused-GX/discard conditions must hold');

  const baseOptions={
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions
  };
  const policyOptions=withCopycatApexTimelessPolicy(baseOptions);
  const customClass=policyOptions.tactics.find(
    tactic=>tactic.name==='CopycatApexTimelessTactic');
  assert.ok(customClass);
  const originalUse=customClass.prototype.useTactic;
  let tacticInvocations=0;
  let proposed=null;
  customClass.prototype.useTactic=function(state,player){
    tacticInvocations++;
    proposed=originalUse.call(this,state,player);
    return proposed;
  };

  let selected;
  let baseline;
  try{
    const bot=new SimpleTacticsAi({id:x.owner.id},policyOptions,null);
    selected=bot.decodeNextAction(x.state);

    const baseBot=new SimpleTacticsAi({id:x.owner.id},baseOptions,null);
    baseline=baseBot.decodeNextAction(x.state);
  }finally{
    customClass.prototype.useTactic=originalUse;
  }

  assert.equal(tacticInvocations,1,
    'Visible conditions must invoke the specialized tactic exactly once');
  assert.ok(proposed instanceof AttackAction,
    'The specialized tactic must propose the Copycat attack before validation');
  assert.equal(proposed.name,'Copycat');

  let simulatorError=null;
  try{
    new Simulator(x.state).dispatch(proposed);
  }catch(error){
    simulatorError=String(error?.message??error);
  }

  const result={
    seat,energyCount,
    visibleSituation:true,
    tacticInvocations,
    proposedAction:{type:proposed.type,name:proposed.name},
    explicitSimulatorAccepted:simulatorError===null,
    explicitSimulatorError:simulatorError,
    selectedAction:{type:selected?.type??null,name:selected?.name??null,
      clientId:selected?.clientId??selected?.id??null},
    baselineAction:{type:baseline?.type??null,name:baseline?.name??null,
      clientId:baseline?.clientId??baseline?.id??null},
    sameActionAsBaseline:selected?.type===baseline?.type&&
      selected?.name===baseline?.name&&
      (selected?.clientId??selected?.id)===(baseline?.clientId??baseline?.id),
    selectedCopycat:selected?.type==='ATTACK_ACTION'&&selected?.name==='Copycat'
  };

  clearCopyAttackSessionsForTests();
  return result;
}

/** @returns {object} Both-seat underfunded rejection and funded positive controls. */
function run(){
  const rows=[];
  for(const seat of [0,1]){
    const underfunded=probe(seat,1);
    assert.equal(underfunded.explicitSimulatorAccepted,false,
      'One Psychic Energy must not pay Mimikyu Copycat');
    assert.notEqual(underfunded.selectedAction.type,'ATTACK_ACTION',
      'SimpleTacticsAi must reject the proposed underfunded Copycat');
    assert.equal(underfunded.sameActionAsBaseline,true,
      'Invalid custom tactic must leave the remaining tactic order unchanged');

    const funded=probe(seat,2);
    assert.equal(funded.explicitSimulatorAccepted,true,
      'Two Psychic Energy must make Mimikyu Copycat legal');
    assert.equal(funded.selectedCopycat,true,
      'The specialized tactic must win precedence when its attack is legal');
    rows.push({seat,underfunded,funded});
  }
  const out={
    schema:'agent46-mimikyu-apex-policy-underfunded-simulator-gate-both-seats-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    realSimpleTacticsAi:true,
    realSimulatorValidation:true,
    visibleSituationHeldInBothBranches:true,
    bothPhysicalSeats:true,
    underfundedProposalsRejected:true,
    fundedPositiveControlsAccepted:true,
    qualifiedCompetitiveGames:0,
    rows
  };
  console.log('AGENT46_MIMIKYU_POLICY_UNDERFUNDED '+JSON.stringify(out));
  return out;
}

if(require.main===module)run();
module.exports={probe,run};
