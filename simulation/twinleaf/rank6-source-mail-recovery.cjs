'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withSourceOpeningProbe} = require('./rank6-seed-opening-probe.cjs');
const {withGuzmaHalaSourceFork,withDamageObserver} =
  require('./rank6-seed-guzma-hala-fork.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const engine=p=>require(path.join(output,p));
const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
const {PlayCardAction,PlayerType,SlotType}=
  engine('game/store/actions/play-card-action');
const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
const {AttackAction}=engine('game/store/actions/game-actions');

const seed=20367160;

/**
 * Try ordinary held Trainers' Mail on source rank-6's first turn, after the
 * established G&H → DCE → Thunder sequence but before Volt Cyclone.
 *
 * Only select cards physically offered by the Mail top-four prompt.
 * If VS Seeker is visible, select it and actually retrieve Guzma from the
 * discard pile before attacking. Never read the unsearched deck or Prizes.
 *
 * @template T
 * @param {()=>T} work
 * @returns {{result:T,events:object[],mailTried:boolean,foundVs:boolean,recoveredGuzma:boolean}}
 */
function withSourceMailRecovery(work) {
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  let stage='watch-attack',mailTried=false,foundVs=false,recoveredGuzma=false;
  const events=[];

  /** @param {object} state @param {object} p */
  function attack(state,p) {
    stage='finished';
    events.push({phase:'attack',turn:state.turn,card:'Volt Cyclone',
      heldGuzma:p.hand.cards.some(c=>c.name==='Guzma')});
    return new AttackAction(p.id,'Volt Cyclone');
  }

  SimpleTacticsAi.prototype.decodeNextAction=function sourceMailChoice(state) {
    const p=state.players.find(player=>player.id===this.client.id);
    if (!p || p.id!==202 || state.turn!==2 || stage==='finished') {
      return original.call(this,state);
    }
    const prompt=state.prompts.find(x=>x.playerId===p.id && x.result===undefined);

    if (stage==='watch-attack') {
      const proposed=original.call(this,state);
      if (!(proposed instanceof AttackAction) ||
          proposed.name!=='Volt Cyclone') return proposed;
      assert.equal(prompt,undefined);
      const at=p.hand.cards.findIndex(c=>c.name==="Trainers' Mail");
      assert.ok(at>=0,'Declared held Mail is missing before attack');
      mailTried=true;
      stage='mail-played';
      events.push({phase:'mail-play',turn:state.turn,
        handNames:p.hand.cards.map(c=>c.name)});
      return new PlayCardAction(p.id,at,
        {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    }

    if (stage==='mail-played' && prompt?.constructor.name==='ChooseCardsPrompt') {
      const exposed=prompt.cards.cards.map(c=>c.name);
      const eligibleVs=prompt.cards.cards.find(c=>c.name==='VS Seeker' &&
        prompt.validate([c],state));
      const cards=eligibleVs?[eligibleVs]:[];
      assert.equal(prompt.validate(cards,state),true);
      foundVs=Boolean(eligibleVs);
      stage='mail-selected';
      events.push({phase:'mail-top-four',turn:state.turn,
        revealedCardNames:exposed,eligibleVS:foundVs,
        selectedNames:cards.map(c=>c.name)});
      return new ResolvePromptAction(prompt.id,cards);
    }

    if (prompt) return original.call(this,state);

    if (stage==='mail-played') {
      stage='mail-selected';
      foundVs=false;
      events.push({phase:'mail-top-four',turn:state.turn,
        noEligibleTrainerPrompt:true,selectedNames:[]});
    }

    if (stage==='mail-selected') {
      if (foundVs) {
        const at=p.hand.cards.findIndex(c=>c.name==='VS Seeker');
        assert.ok(at>=0,'Selected VS Seeker was not moved to hand');
        stage='vs-played';
        events.push({phase:'vs-play',turn:state.turn});
        return new PlayCardAction(p.id,at,
          {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
      }
      return attack(state,p);
    }

    if (stage==='vs-played') {
      assert.equal(prompt?.constructor.name,'ChooseCardsPrompt');
      const guzma=prompt.cards.cards.find(c=>c.name==='Guzma');
      assert.ok(guzma,'Discarded source Guzma not in VS prompt');
      assert.equal(prompt.validate([guzma],state),true);
      stage='vs-selected';
      events.push({phase:'vs-pick-guzma',turn:state.turn,
        selectedName:guzma.name});
      return new ResolvePromptAction(prompt.id,[guzma]);
    }

    if (stage==='vs-selected') {
      assert.ok(p.hand.cards.some(c=>c.name==='Guzma'),
        'Guzma not in hand after VS Seeker');
      recoveredGuzma=true;
      return attack(state,p);
    }
    return original.call(this,state);
  };

  try {
    const result=work();
    return {result,events,mailTried,foundVs,recoveredGuzma};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

/** @returns {object} One exact source-dealt paired test result. */
function main() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(entry=>entry.rank===6);
  assert.ok(plan.candidate.cards && opponent?.cards);
  const request={
    deckA:plan.candidate.cards,deckB:opponent.cards,seed,maxActions:125,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true
  };
  const control=withSourceOpeningProbe(()=>
    withGuzmaHalaSourceFork(()=>
      withDamageObserver(()=>runMatch(request)),
    ['Guzma','Tropical Beach']));
  const mail=withSourceOpeningProbe(()=>
    withGuzmaHalaSourceFork(()=>
      withSourceMailRecovery(()=>
        withDamageObserver(()=>runMatch(request))),
    ['Guzma','Tropical Beach']));

  assert.deepEqual(control.observed.hand,mail.observed.hand);
  assert.deepEqual(control.observed.prizes,mail.observed.prizes);
  assert.deepEqual(control.observed.doubleColorless,mail.observed.doubleColorless);
  assert.equal(mail.out.completed,true,'Original conditional G&H line failed');
  assert.equal(mail.out.result.mailTried,true);
  assert.equal(control.out.result.attack.damageAfter,140);
  assert.equal(mail.out.result.result.attack.damageAfter,140);
  const source=mail.out.result;
  assert.equal(source.recoveredGuzma,source.foundVs);
  const damage=source.result.attack;
  assert.equal(damage.recoveryZoneCounts.Guzma.prizes,2);
  assert.equal(damage.recoveryZoneCounts.VS\u0020Seeker.prizes,0);
  assert.equal(damage.recoveryZoneCounts.Guzma.hand,
    source.foundVs?1:0);
  const record={
    evidence:'Exact source physical-seed optional Mail pre-attack attempt',
    seed,controlDamage:control.out.result.attack.damageAfter,
    mailDamage:damage.damageAfter,
    sourceSevenMatched:true,physicalPrizesMatched:true,
    mailTried:source.mailTried,topFourContainedVs:source.foundVs,
    guzmaRecoveredIntoHandBeforeAttack:source.recoveredGuzma,
    physicalPostAttackGuzma:damage.recoveryZoneCounts.Guzma,
    steps:source.events,qualifiedForCompetitiveInference:false,
    caveat:'A single physical look at Mail after the search. No rate, no optimality assertion, no vetted opponent response.'
  };
  console.log(JSON.stringify(record,null,2));
  return record;
}

if(require.main===module)main();
module.exports={main,withSourceMailRecovery};
