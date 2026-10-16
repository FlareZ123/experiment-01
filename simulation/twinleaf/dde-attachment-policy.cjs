'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {preparedRegidrago}=require('./apex-attack-action.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const load=file=>require(path.join(output,file));

/**
 * Suspected failure: AttachEnergyTactic reads static provides,
 * but Double Dragon computes provision in its Effect reducer.
 * Prove default tactic passes while the same manual play is legal.
 * @returns {object}
 */
function checkDoubleDragonAttachment() {
  const f=preparedRegidrago();
  const cards=initializeCards();
  const dde=cards.getCardByName('Double Dragon Energy ROS');
  assert.ok(dde,'Pinned Double Dragon card missing');
  f.attacking.hand.cards.push(dde);
  const {AttachEnergyTactic}=load('simple-bot/simple-tactics/attach-energy-tactic');
  const {EnergyScore}=load('simple-bot/state-score/energy-score');
  const defs=load('simple-bot/simple-bot-definitions');
  const opts={
    tactics:defs.allSimpleTactics,
    promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,
    arbiter:defs.defaultArbiterOptions
  };
  assert.deepEqual(dde.provides,[],'Static provision must be empty');
  const score=new EnergyScore(opts);
  const before=score.getScore(f.state,f.attacking.id);
  const chosen=new AttachEnergyTactic(opts).useTactic(f.state,f.attacking);
  assert.equal(chosen,undefined,'Default tactic should miss dynamically-provided Energy');
  const {withDoubleDragonRecovery}=require('./dde-attach-tactic.cjs');
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const recoveryOptions=withDoubleDragonRecovery(opts);
  const recoveryAction=new SimpleTacticsAi({id:f.attacking.id},recoveryOptions,null)
    .decodeNextAction(f.state);
  assert.ok(recoveryAction,'Research-owned policy should find an attachment');
  assert.equal(recoveryAction.constructor.name,'PlayCardAction');
  assert.equal(recoveryAction.handIndex,f.attacking.hand.cards.indexOf(dde));
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {CheckProvidedEnergyEffect}=load('game/store/effects/check-effects');
  const {CardType}=load('game/store/card/card-types');
  const provided=()=>{
    const e=new CheckProvidedEnergyEffect(f.attacking);
    f.store.reduceEffect(f.state,e);
    return e.energyMap.filter(row=>row.card===dde).flatMap(row=>row.provides);
  };
  assert.deepEqual(provided(),[]);
  const handIndex=f.attacking.hand.cards.indexOf(dde);
  assert.ok(handIndex>=0);
  f.store.dispatch(recoveryAction);
  assert.ok(f.attacking.active.cards.includes(dde),'Manual PlayCardAction should attach DDE');
  assert.deepEqual(provided(),[CardType.ANY,CardType.ANY]);
  const after=score.getScore(f.store.state,f.attacking.id);
  assert.equal(before,after,'EnergyScore ignores dynamic provision');
  return {
    passed:true,defaultAttachEnergyAction:null,
    optInAction:recoveryAction.constructor.name,
    directlyPlayedCard:'Double Dragon Energy ROS',
    providedAfterManualPlay:['ANY','ANY'],
    energyScoreBefore:before,energyScoreAfter:after,
    scope:'real pinned engine tactic versus legal manual single attachment; not a completed game'
  };
}
if(require.main===module)console.log(JSON.stringify(checkDoubleDragonAttachment(),null,2));
module.exports={checkDoubleDragonAttachment};
