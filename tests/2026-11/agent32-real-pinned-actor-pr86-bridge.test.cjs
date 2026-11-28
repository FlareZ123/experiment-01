'use strict';

/**
 * Actual pinned PokemonCard instances -> shared actor observation -> strict
 * worker protocol -> two-seat opponent decision. Deliberately no game/CI or
 * policy-strength claim; the action frontier here is a controlled comparison
 * rather than a native legal-action enumeration.
 *
 * Intended to accompany the narrowly scoped host normalization in PR #86.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../../simulation/twinleaf/actor-observation-contract.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const rank3=require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');

const native=n=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',n));
const {Stage,CardType}=native('game/store/card/card-types');
let nextId=930000;

function createCard(manager,name){
  const card=manager.getCardByName(name);
  assert.ok(card,'Pinned manager lacks '+name);
  card.id=nextId++;
  return card;
}

function replaceActive(player,cards){
  player.active.cards.length=0;
  player.active.energies.cards.length=0;
  player.active.cards.push(...cards);
  player.active.damage=0;
}

for(const seat of [0,1]){
  test('real pinned VMAX/VSTAR instance types, costs and weakness; physical seat '+seat,()=>{
    const x=stage(seat),manager=initializeCards();
    const basic=createCard(manager,'Shadow Rider Calyrex V CRE');
    const vmax=createCard(manager,'Shadow Rider Calyrex VMAX CRE');
    const regiv=createCard(manager,'Regidrago V SIT');
    const registar=createCard(manager,'Regidrago VSTAR SIT');
    assert.equal(vmax.stage,Stage.VMAX);
    assert.equal(vmax.cardType.includes(CardType.PSYCHIC),true);
    assert.equal(registar.stage,Stage.VSTAR);
    assert.equal(registar.cardType.includes(CardType.DRAGON),true);
    // These are native Card instances in the genuine pinned Player/Store
    // slots, not hand-assembled JSON pretending to be native Pokémon.
    replaceActive(x.owner,[basic,vmax]);
    replaceActive(x.opponent,[regiv,registar]);
    const view=actorObservation(x.state,seat);
    assert.equal(view.actorSeat,seat);
    assert.deepEqual(view.ownPublic.active.printed.types,['Psychic']);
    assert.equal(view.ownPublic.active.printed.stage,'VMAX');
    assert.ok(view.ownPublic.active.printed.subtypes.includes('VMAX'));
    assert.ok(view.ownPublic.active.printed.subtypes.includes('V'));
    assert.equal(view.opponentPublic.active.printed.stage,'VSTAR');
    assert.deepEqual(view.opponentPublic.active.printed.types,['Dragon']);
    const geist=view.ownPublic.active.attacks.find(a=>a.name==='Max Geist');
    assert.ok(geist,'Native Shadow Rider VMAX is missing Max Geist');
    assert.deepEqual(geist.cost,['Colorless','Colorless','Colorless']);
    assert.ok(view.ownPublic.active.printed.weakness.some(w=>
      w.type==='Darkness'&&w.value===2));
    assert.ok(view.ownPublic.prizeSlots.every(p=>p.printing===undefined));
    assert.ok(view.opponentPublic.prizeSlots.every(p=>p.printing===undefined));
    assert.doesNotThrow(()=>protocol.validateActorObservation(view,seat));
  });

  test('real pinned BASIC stage changes rank3 Penny versus Handiwork root decision; seat '+seat,()=>{
    const x=stage(seat),manager=initializeCards();
    const snorlax=createCard(manager,'Snorlax PGO 55');
    assert.equal(snorlax.stage,Stage.BASIC);
    replaceActive(x.owner,[snorlax]);
    x.owner.active.damage=70;
    x.owner.hand.cards.length=0;
    const penny=createCard(manager,'Penny SVI 183');
    const handi=createCard(manager,"Team Rocket's Handiwork FCO 112");
    x.owner.hand.cards.push(penny,handi);
    x.owner.deck.cards.length=0;
    x.opponent.deck.cards.length=0;
    for(let i=0;i<20;i++)x.owner.deck.cards.push(createCard(manager,'Psychic Energy SVE'));
    for(let i=0;i<30;i++)x.opponent.deck.cards.push(createCard(manager,'Psychic Energy SVE'));
    // Keep a nonempty Bench as a possible Active replacement; this is not
    // itself a native PlayCardAction validation.
    assert.ok(x.owner.bench.some(slot=>slot.cards.length>0));
    const view=actorObservation(x.state,seat);
    assert.equal(view.ownPublic.active.printed.stage,'BASIC');
    assert.deepEqual(view.ownPublic.active.printed.subtypes,['Basic']);
    assert.equal(view.ownPublic.active.damage,70);
    assert.ok(view.ownHand.includes(penny.fullName));
    assert.ok(view.ownHand.includes(handi.fullName));
    assert.doesNotThrow(()=>protocol.validateActorObservation(view,seat));

    const actions=[
      {token:'penny',kind:'play-card',actorPrinting:penny.fullName,publicMetadata:{}},
      {token:'handi',kind:'play-card',actorPrinting:handi.fullName,publicMetadata:{}},
      {token:'pass',kind:'pass'}
    ];
    const frontier={schema:protocol.FRONTIER_SCHEMA,items:actions};
    const request={schema:protocol.REQUEST_SCHEMA,type:'decision',
      requestId:'agent32-pinned-'+seat,sequence:0,role:'opponent',seat,
      observationSchema:protocol.OBSERVATION_SCHEMA,observation:view,
      prompt:null,publicEventReceipt:null,actionFrontier:frontier};
    const init={role:'opponent',seat,policyVersion:rank3.POLICY_VERSION,config:{}};
    const allowed=protocol.validateRequest(request,init,0,new Set());
    assert.deepEqual([...allowed.actionTokens].sort(),['handi','pass','penny']);
    const root={role:'opponent',seat,observation:view,prompt:null,
      publicEventReceipt:null,actionFrontier:frontier};
    const policy=rank3.createPolicy(init);
    const decision=policy.decide(root);
    assert.deepEqual(decision,{kind:'select-action',token:'penny'});
    assert.deepEqual(protocol.validateDecision(decision,null,allowed.actionTokens),decision);

    // Controlled pre-fix native stage: the old bridge emitted numeric 2
    // rather than BASIC and gave a different strategic root decision.
    const oldView=JSON.parse(JSON.stringify(view));
    oldView.ownPublic.active.printed.stage=Stage.BASIC;
    const oldDecision=policy.decide({...root,observation:oldView});
    assert.deepEqual(oldDecision,{kind:'select-action',token:'handi'});

    // A future unrecognized Stage must not be mislabeled as Basic.
    const unknownView=JSON.parse(JSON.stringify(view));
    unknownView.ownPublic.active.printed.stage=98765;
    unknownView.ownPublic.active.printed.subtypes=[];
    assert.deepEqual(policy.decide({...root,observation:unknownView}),
      {kind:'select-action',token:'handi'});
  });
}
