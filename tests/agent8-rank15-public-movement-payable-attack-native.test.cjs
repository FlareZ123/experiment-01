'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {publicEventReceipt}=require('../simulation/twinleaf/agent8-public-event-receipt.cjs');
const {choosePayablePrintedAttackOffer}=
  require('../simulation/twinleaf/agent41-public-payable-attack-offer.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {collectAndChooseOwnerRoot}=
  require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');

const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(root,name));

/**
 * Exact original source PFL #84 on a real Store, with one real attached DCE.
 * Two states share identical printed board and owner-hand observations.
 * Movement is staged in the engine's real public movement ledger.
 * @param {0|1} seat
 * @param {boolean} moved
 */
function stagedRank15(seat,moved){
  const x=stage(seat),manager=initializeCards();
  let nextId=120000+seat*1000;
  /** @param {string} name */
  const card=name=>{
    const result=manager.getCardByName(name);
    assert.ok(result,'Missing native printing '+name);
    result.id=nextId++;
    return result;
  };
  /** @param {string} name @param {string} number */
  const source=(name,number)=>{
    const found=manager.getAllCards().filter(p=>
      p.name===name&&p.set==='PFL'&&String(p.setNumber)===number);
    assert.equal(found.length,1,'Exact rank15 PFL printing required');
    return found[0].fullName;
  };
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(card(source('Buneary','83')),
    card(source('Mega Lopunny ex','84')));
  const dce=card('Double Colorless Energy SUM');
  x.owner.active.cards.push(dce);
  x.owner.active.energies.cards.push(dce);
  x.owner.hand.cards.length=0;
  x.opponent.active.cards.length=0;
  x.opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  x.state.turn=4;
  const lopunny=x.owner.active.getPokemonCard();
  assert.equal(lopunny.fullName,'Mega Lopunny ex M2',
    'Pinned native fullName M2 aliases authenticated source set PFL #84');
  if(moved)x.owner.movedToActiveThisTurn.push(lopunny.id);
  const base=actorObservation(x.state,seat);
  const event=publicEventReceipt(x.state,seat);
  assert.equal(event.ownerActive.movedFromBenchToActiveThisTurn,moved);
  const informed=Object.freeze({...base,publicEventReceipt:event});
  const historical=choosePayablePrintedAttackOffer(base,x.catalog);
  const proposal=choosePayablePrintedAttackOffer(informed,x.catalog);
  assert.ok(historical);
  assert.ok(proposal);
  const baseline=chooseActorRootIntent(base,x.catalog,{
    publicContextSpecialEnergy:true
  });
  assert.equal(baseline.kind,'attack');
  assert.equal(baseline.attackName,'Gale Thrust');
  const selected=collectAndChooseOwnerRoot(informed,x.catalog,baseline,{
    payablePrintedAttackOffer:true,sameRootChoiceApply:true,
    sameRootPublicEventReceipt:true
  });
  assert.equal(selected.intent.kind,'attack');
  assert.equal(selected.receipt.selectorErrors.length,0);
  assert.equal(selected.intent.attackName,proposal.attackName);
  // Verify the applied selector, not merely a read-only offer.
  const control=collectAndChooseOwnerRoot(base,x.catalog,baseline,{
    payablePrintedAttackOffer:true,sameRootChoiceApply:true,
    sameRootPublicEventReceipt:false
  });
  assert.equal(control.intent.attackName,'Gale Thrust');
  // An independent real Store attack checks whether the offered attack and
  // its attached Energy can actually produce this state-dependent damage.
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const before=x.opponent.active.damage;
  x.store.dispatch(new AttackAction(x.owner.id,selected.intent.attackName));
  for(let i=0;i<24;i++){
    const pending=x.store.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    assert.equal(pending.constructor.name,'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.equal(x.store.hasPrompts(),false);
  return {seat,moved,base,event,historical,proposal,selected,control,
    settledDamage:x.opponent.active.damage-before,
    finalTurn:x.store.state.turn};
}

for(const seat of [0,1]){
  test('rank15 public movement selects payable printed attack, seat '+seat,()=>{
    const stationary=stagedRank15(seat,false);
    const moved=stagedRank15(seat,true);
    assert.deepEqual(stationary.base,moved.base);
    assert.equal(stationary.historical.attackName,'Gale Thrust');
    assert.equal(moved.historical.attackName,'Gale Thrust');
    assert.equal(stationary.proposal.attackName,'Spiky Hopper');
    assert.equal(stationary.proposal.estimatedDamage,160);
    assert.equal(moved.proposal.attackName,'Gale Thrust');
    assert.equal(moved.proposal.estimatedDamage,230);
    assert.equal(stationary.settledDamage,160);
    assert.equal(moved.settledDamage,230);
    assert.equal(stationary.finalTurn,5);
    assert.equal(moved.finalTurn,5);
    console.log('RANK15_PUBLIC_MOVEMENT_ATTACK_PROPOSAL',JSON.stringify({
      seat,originalObservationSame:true,
      withoutPublicReceipt:'Gale Thrust',
      stationary:{attack:stationary.proposal.attackName,
        estimated:stationary.proposal.estimatedDamage,
        nativeDamage:stationary.settledDamage},
      moved:{attack:moved.proposal.attackName,
        estimated:moved.proposal.estimatedDamage,
        nativeDamage:moved.settledDamage},
      independentMatchQualified:false
    }));
  });
}
