'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {actorObservation}=
  require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseFundedMimikyuApexPromotion,VERSION}=
  require('../../simulation/twinleaf/2026-11/agent6-funded-mimikyu-apex-promotion.cjs');

const NATIVE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const fromNative=p=>require(path.join(NATIVE,p));
const ENERGY='Psychic Energy SVE';
const MIMIKYU='Mimikyu GRI';
const REGIDRAGO='Regidrago VSTAR SIT';

/**
 * Genuine pinned Store with typed physical cards in their public zones.
 * Prior attack eligibility is supplied as a separately attributed public
 * history receipt; this test settles the new Retreat, not the past Apex.
 *
 * @param {0|1} seat Physical owner.
 * @returns {object} Stage and actual physical card identities.
 */
function stagePaidPromotion(seat){
  const x=stage(seat);
  const {initializeCards}=
    require('../../simulation/twinleaf/headless.cjs');
  const manager=initializeCards();
  let nextId=917000;
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Missing exact pinned printing: '+name);
    found.id=nextId++;
    return found;
  };
  x.state.turn=34;
  x.owner.retreatedTurn=0;
  const active=x.owner.active;
  active.cards.length=0;
  active.energies.cards.length=0;
  active.cards.push(card('Shadow Rider Calyrex V CRE'));
  active.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
  const paid=[card(ENERGY),card(ENERGY)];
  active.cards.push(...paid);
  active.energies.cards.push(...paid);

  const bench=x.owner.bench[0];
  bench.cards.length=0;
  bench.energies.cards.length=0;
  bench.cards.push(card(MIMIKYU));
  const saved=[card(ENERGY),card(ENERGY)];
  bench.cards.push(...saved);
  bench.energies.cards.push(...saved);

  x.opponent.active.cards.length=0;
  x.opponent.active.energies.cards.length=0;
  x.opponent.active.cards.push(card('Regidrago V SIT'));
  x.opponent.active.cards.push(card(REGIDRAGO));
  x.owner.discard.cards.push(card('Dialga-GX UPR'));

  const original=actorObservation(x.state,seat);
  const view=Object.freeze({
    ...original,
    publicEventReceipt:Object.freeze({
      actorSeat:seat,turn:34,opponentLastTurnTurn:33,
      opponentCopycatChoices:Object.freeze([Object.freeze({
        turn:33,sourcePrinting:REGIDRAGO,attackName:'Apex Dragon',
        gxAttack:false,copycatAttack:true
      })])
    })
  });
  return {...x,active,bench,paid,saved,view};
}

/**
 * Resolve the genuine native Store's optional Energy-payment and waiting
 * prompts. The selected cards are exact attached physical references.
 * @param {object} game Native Store and acting owner.
 * @returns {string[]} Exact prompt types encountered.
 */
function resolveRetreatPrompts(game){
  const {ResolvePromptAction}=
    fromNative('game/store/actions/resolve-prompt-action');
  const seen=[];
  for(let i=0;i<20;i++){
    const pending=game.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    seen.push(pending.constructor.name);
    assert.equal(pending.playerId,game.owner.id);
    if(pending.constructor.name==='WaitPrompt'){
      game.store.dispatch(new ResolvePromptAction(pending.id,null));
    }else{
      assert.equal(pending.constructor.name,'ChooseCardsPrompt');
      assert.strictEqual(pending.cards,game.active.energies);
      assert.equal(pending.validate(game.paid),true);
      game.store.dispatch(new ResolvePromptAction(pending.id,game.paid));
    }
  }
  assert.equal(game.state.prompts.some(p=>p.result===undefined),false);
  return seen;
}

for(const seat of [0,1]){
  test('native funded Mimikyu paid promotion physically settles in seat '+seat,()=>{
    const x=stagePaidPromotion(seat);
    const intent=chooseFundedMimikyuApexPromotion(x.view,x.catalog);
    assert.equal(intent?.source,VERSION);
    assert.equal(intent?.paymentMode,'two-unit-basic-paid');
    assert.equal(intent?.benchIndex,0);
    assert.equal(x.owner.active.getPokemonCard()?.fullName,
      'Shadow Rider Calyrex VMAX CRE');
    assert.equal(x.owner.bench[0].getPokemonCard()?.fullName,MIMIKYU);
    const beforeDiscard=x.owner.discard.cards.slice();
    const {RetreatAction}=
      fromNative('game/store/actions/game-actions');
    x.store.dispatch(new RetreatAction(x.owner.id,intent.benchIndex));
    const prompts=resolveRetreatPrompts(x);
    assert.strictEqual(x.owner.active,x.bench);
    assert.strictEqual(x.owner.bench[0],x.active);
    assert.equal(x.owner.active.getPokemonCard()?.fullName,MIMIKYU);
    assert.equal(x.owner.retreatedTurn,34);
    assert.deepEqual(x.bench.energies.cards,x.saved);
    assert.equal(x.active.energies.cards.length,0);
    assert.equal(x.paid.every(c=>x.owner.discard.cards.includes(c)),true);
    assert.equal(x.paid.every(c=>!beforeDiscard.includes(c)),true);
    assert.equal(new Set(x.paid).size,2);
    assert.equal(x.state.players[seat],x.owner);
    assert.ok(Array.isArray(prompts));
  });
}

test('a real pinned opponent Snorlax Block prevents a misleading paid promotion',()=>{
  const x=stagePaidPromotion(0);
  const {initializeCards}=
    require('../../simulation/twinleaf/headless.cjs');
  const block=initializeCards().getCardByName('Snorlax PGO');
  assert.ok(block);
  block.id=917100;
  x.opponent.active.cards.splice(0,x.opponent.active.cards.length,block);
  const view=Object.freeze({
    ...actorObservation(x.state,0),
    publicEventReceipt:x.view.publicEventReceipt
  });
  assert.equal(chooseFundedMimikyuApexPromotion(view,x.catalog),null);
});
