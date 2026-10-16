'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runMatch,initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadDefaultCampaign}=require('../../scripts/aichi-comparison-campaign.cjs');
const {clonedStoreAcceptsAttack}=require('./pass-attack-announcement-probe.cjs');

/** @param {unknown} obj @returns {string} */
const hash=obj=>createHash('sha256').update(JSON.stringify(obj)).digest('hex');

/**
 * Fingerprint the complete public board at an identified preselected pass.
 * Concealed identities are deliberately excluded.
 * @param {object} state Pinned Twinleaf State.
 */
function publicPosition(state){
  return {turn:state.turn,activeSeat:state.activePlayer,
    boards:state.players.map(player=>({
      id:player.id,
      active:player.active.getPokemonCard()?.fullName??null,
      energy:player.active.energies.cards.map(x=>x.fullName),
      tools:player.active.tools.map(x=>x.fullName),
      bench:player.bench.map(x=>x.getPokemonCard()?.fullName).filter(Boolean),
      handSize:player.hand.cards.length,deckSize:player.deck.cards.length,
      prizes:player.prizes.filter(x=>x.cards.length>0).length
    }))};
}

/**
 * Preserve original bot decisions until a precisely conditioned source
 * rank-2 Bunnelby Pass. On the experimental replay alone, replace that
 * selected action with a pinned-engine-accepted Evolution announcement.
 *
 * @param {object} request Two source-resolved fixed 60-card lists and seed.
 * @param {boolean} intervene Replace the specific Pass with Evolution.
 */
function replay(request,intervene){
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const {AttackAction}=require(path.join(output,'game/store/actions/game-actions'));
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  let observed=null;
  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const selected=original.call(this,state);
    if(observed||selected?.constructor.name!=='PassTurnAction'||
       selected.clientId!==101||state.turn!==56)return selected;
    const player=state.players.find(p=>p.id===101);
    if(player.active.getPokemonCard()?.fullName!=='Bunnelby PRC'||
       !player.active.tools.some(c=>c.fullName==='Technical Machine: Evolution PAR')||
       !player.active.energies.cards.some(c=>c.fullName==='Jet Energy PAL')||
       !player.bench.some(slot=>slot.getPokemonCard()?.name==='Gloom'))return selected;
    const accepted=clonedStoreAcceptsAttack(state,101,'Evolution');
    observed={turn:state.turn,selected:'PassTurnAction',accepted,
      publicDigest:hash(publicPosition(state)),intervened:intervene&&accepted};
    return intervene&&accepted?new AttackAction(101,'Evolution'):selected;
  };
  try{
    const game=runMatch({...request,maxActions:600,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true});
    return {observed,game};
  }finally{
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

/** @param {object} result */
function project(result){
  const g=result.game;
  return {observation:result.observed,actions:g.actions,turns:g.turns,
    finished:g.finished,engineWinnerSlot:g.winner,firstTurnSlot:g.firstTurnSlot,
    deckHashes:g.deckHashes,prizesRemaining:g.prizesRemaining,
    attacks:g.attackTrace.length,
    traceDigest:hash(g.decisionTrace?.map(x=>[
      x.actionOrdinal,x.playerSlot,x.action,x.card,x.attack,x.attacker]))};
}

/** @returns {object} One conditional, explicitly noncompetitive source replay. */
function runCounterfactual(){
  initializeCards();
  const campaign=loadDefaultCampaign('independent-slots-v2');
  const trial=campaign.trials.find(t=>t.trialId==='pilot:2:0:hood-shield-v1:B');
  assert.ok(trial,'Published fixed plan lacks expected trial');
  const dir=path.resolve(__dirname,'../../results/aichi-2026');
  const candidate=JSON.parse(fs.readFileSync(
    path.join(dir,'candidate-hood-shadow-rider.json'),'utf8'));
  const plan=planAichi(candidate,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(x=>x.rank===2);
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(opponent.cards.length,60);
  const request={deckA:opponent.cards,deckB:plan.candidate.cards,seed:trial.seed};
  const baseline=replay(request,false),changed=replay(request,true);
  assert.equal(baseline.observed?.accepted,true);
  assert.equal(changed.observed?.accepted,true);
  assert.equal(baseline.observed.publicDigest,changed.observed.publicDigest);
  assert.deepEqual(baseline.game.deckHashes,changed.game.deckHashes);
  assert.equal(baseline.game.firstTurnSlot,changed.game.firstTurnSlot);
  return {
    kind:'rank2-hood-b-single-action-counterfactual-not-win-rate',
    sourceTrial:trial.trialId,seed:trial.seed,campaignDigest:campaign.planDigest,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    baseline:project(baseline),forcedEvolution:project(changed),
    caveat:'Pinned-engine action override at a selected AI pass. No paper rules certification, tactical superiority, opponent competence or matchup win probability claim.'
  };
}

if(require.main===module)console.log(JSON.stringify(runCounterfactual(),null,2));
module.exports={publicPosition,replay,runCounterfactual};
