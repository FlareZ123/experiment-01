'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {prepare,generatePrompt}=
  require('./agent39-volt-cyclone-paper-native.cjs');
const {initializeCards}=require('./headless.cjs');
const {canPayVoltCost}=
  require('../evaluation/agent45-volt-cyclone-donor-debt.cjs');
const {withPaperPromptPortfolio}=
  require('./agent39-paper-prompt-portfolio.cjs');
const {withPrintedVoltDonorPreference,VERSION}=
  require('./agent45-volt-donor-printed-cost-hook.cjs');

const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(root,p));

/**
 * Create a native original TWM77 Volt Cyclone after-attack reducer with
 * three physically distinct Active Special Energy cards. No native turn
 * was played to acquire these cards; this is a controlled printed prompt.
 * @param {0|1} sourceSeat
 * @returns {object}
 */
function sourceState(sourceSeat){
  const scene=prepare(sourceSeat);
  const manager=initializeCards();
  const speed=manager.getCardByName('Speed Lightning Energy RCL');
  const spiky=manager.getCardByName('Spiky Energy JTG');
  assert.ok(speed&&spiky);
  speed.id=99135+sourceSeat;
  spiky.id=99139+sourceSeat;
  const active=scene.opponent.active;
  const dceIndex=active.cards.indexOf(scene.energy);
  assert.ok(dceIndex>=0);
  active.cards.splice(dceIndex,1);
  active.cards.push(speed,spiky,scene.energy);
  active.energies.cards.splice(0,active.energies.cards.length,
    speed,spiky,scene.energy);
  assert.deepEqual(active.energies.cards.map(x=>x.name),[
    'Speed Lightning Energy','Spiky Energy','Double Colorless Energy']);
  assert.equal(canPayVoltCost(active.energies.cards.map(x=>x.name),[]),true);
  return {...scene,speed,spiky};
}

/**
 * Direct native reducer/prompt/Store effects in each real physical seat.
 * Not a complete paper game, attack-cost payment, or competitive result.
 * @param {0|1} seat
 * @param {boolean} preferPrintedCost
 * @returns {object}
 */
function runSeatArm(seat,preferPrintedCost){
  const scene=sourceState(seat);
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {AttachEnergyPromptResolver}=native(
    'simple-bot/prompt-resolver/attach-energy-prompt-resolver');
  const beforeMethod=AttachEnergyPromptResolver.prototype.getPromptResult;
  const beforeReduce=scene.attacker.constructor.prototype.reduceEffect;
  const beforeDispatch=native('game/store/store').Store.prototype.dispatch;
  const guard=withPaperPromptPortfolio(()=>{
    const effect=()=>{
      const prompt=generatePrompt(scene);
      const originalNativeResolver=Object.create(
        AttachEnergyPromptResolver.prototype);
      const choice=originalNativeResolver.getPromptResult(scene.state,prompt);
      assert.equal(prompt.options.min,1);
      assert.equal(prompt.options.max,1);
      assert.equal(prompt.options.allowCancel,false);
      assert.equal(Array.isArray(choice),true);
      assert.equal(choice.length,1);
      assert.equal(prompt.validate(choice,scene.state),true);
      const donor=choice[0].card;
      const before=scene.opponent.active.energies.cards.slice();
      const target=scene.opponent.bench[choice[0].to.index];
      scene.store.dispatch(new ResolvePromptAction(prompt.id,choice));
      assert.ok(before.includes(donor));
      assert.ok(!scene.opponent.active.energies.cards.includes(donor));
      assert.ok(target.energies.cards.includes(donor));
      return {chosenDonor:donor.name,
        activeAfter:scene.opponent.active.energies.cards.map(c=>c.name),
        benchAfter:target.energies.cards.map(c=>c.name),
        nativePrintedCostPayable:canPayVoltCost(
          scene.opponent.active.energies.cards.map(x=>x.name),[]),
        paperPromptPhysicallySettled:true};
    };
    return preferPrintedCost?withPrintedVoltDonorPreference(effect,{seat}):
      {result:effect(),audit:null};
  });
  assert.strictEqual(AttachEnergyPromptResolver.prototype.getPromptResult,
    beforeMethod);
  assert.strictEqual(scene.attacker.constructor.prototype.reduceEffect,
    beforeReduce);
  assert.strictEqual(native('game/store/store').Store.prototype.dispatch,
    beforeDispatch);
  assert.equal(guard.audit.paperVerifiedNativeAccepted,1);
  assert.equal(guard.audit.paperInvalidVetoed,0);
  const nested=guard.result;
  const actual=nested.result;
  assert.equal(actual.paperPromptPhysicallySettled,true);
  if(preferPrintedCost){
    assert.equal(actual.chosenDonor,'Spiky Energy');
    assert.equal(actual.nativePrintedCostPayable,true);
    assert.equal(nested.audit.nativeValidAlternativesSelected,1);
    assert.equal(nested.audit.nativeAcceptedSelectedMoves,1);
    assert.equal(nested.audit.acceptedPhysicalTransferReceipts.length,1);
    assert.equal(nested.audit.acceptedPhysicalTransferReceipts[0].movedFromActive,true);
    assert.equal(nested.audit.acceptedPhysicalTransferReceipts[0].receivedOnBench,true);
  }else{
    assert.equal(actual.chosenDonor,'Speed Lightning Energy');
    assert.equal(actual.nativePrintedCostPayable,false);
  }
  return {sourceSeat:seat,preferPrintedCost,mode:preferPrintedCost?
    'owner-paper-cost-preserving-donor':'generic-native-first-donor',
    ...actual,
    paperPromptVerdict:'PAPER_PROMPT_VERIFIED_BOUND_ONE_CARD_TRANSFER',
    activeAfterPaidPotential:actual.nativePrintedCostPayable,
    ownerHookAudit:nested.audit};
}

function run(){
  const cases=[];
  for(const seat of [0,1]){
    cases.push(runSeatArm(seat,false),runSeatArm(seat,true));
  }
  return {version:VERSION,setup:'prepared-pinned-Store-after-attack-printed-TWM77',
    cases,realStore:true,fullOriginal60:false,completeNativeAttack:false,
    nativeFullGames:0,competitivelyQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={sourceState,runSeatArm,run};
