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
const fs=require('node:fs');
const {planAichi}=require('../../simulation/evaluation/aichi-pilot.cjs');
const {buildSourcePrintingMap,projectSourcePrintings}=
  require('../../simulation/evaluation/2026-11/agent32-source-printing-bridge.cjs');
const {stage}=require('../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {publicEventReceipt}=require('../../simulation/twinleaf/agent8-public-event-receipt.cjs');
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

  test('real pinned BASIC and native/source printing split in rank3 root; seat '+seat,()=>{
    const x=stage(seat),manager=initializeCards();
    const snorlax=createCard(manager,'Snorlax PGO');
    assert.equal(snorlax.stage,Stage.BASIC);
    replaceActive(x.owner,[snorlax]);
    x.owner.active.damage=70;
    x.owner.hand.cards.length=0;
    const penny=createCard(manager,'Penny SVI');
    const handi=createCard(manager,"Team Rocket's Handiwork FCO");
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
    const genuineDecision=policy.decide(root);
    // Independent native-printing mismatch: pinned CardManager keys omit
    // setNumber (Penny SVI, Handiwork FCO), but rank3's exact source regexes
    // demand Penny SVI 183 and Handiwork FCO 112. Thus the real pinned
    // observation currently reaches PASS even with a correctly mapped BASIC
    // Stage. Retain this expected negative as an integration blocker.
    assert.deepEqual(genuineDecision,{kind:'select-action',token:'pass'});
    assert.deepEqual(protocol.validateDecision(
      genuineDecision,null,allowed.actionTokens),genuineDecision);
    assert.equal(rank3.scoreAction(actions[0],root),0);
    assert.equal(rank3.scoreAction(actions[1],root),0);

    // Controlled *source-stamped* comparator: independently shows why the
    // numeric Stage normalization matters once the identity issue is solved.
    // This comparator is NOT the genuine native observation/action frontier.
    const sourceStamped={...root,actionFrontier:{
      schema:protocol.FRONTIER_SCHEMA,items:[
        {...actions[0],actorPrinting:'Penny SVI 183'},
        {...actions[1],actorPrinting:"Team Rocket's Handiwork FCO 112"},
        actions[2]
      ]
    }};
    assert.deepEqual(policy.decide(sourceStamped),
      {kind:'select-action',token:'penny'});
    const oldView=JSON.parse(JSON.stringify(view));
    oldView.ownPublic.active.printed.stage=Stage.BASIC;
    assert.deepEqual(policy.decide({...sourceStamped,observation:oldView}),
      {kind:'select-action',token:'handi'});

    // An unrecognized future Stage must never become a Basic by assumption.
    const unknownView=JSON.parse(JSON.stringify(view));
    unknownView.ownPublic.active.printed.stage=98765;
    unknownView.ownPublic.active.printed.subtypes=[];
    assert.deepEqual(policy.decide({...sourceStamped,observation:unknownView}),
      {kind:'select-action',token:'handi'});
    
    // Full source-sixty + exact native-sixty order defines the alias; neither
    // a naive string suffix nor a guess from card name is accepted.
    const sourceDeck=JSON.parse(fs.readFileSync(path.resolve(__dirname,
      '../../results/aichi-2026/full-decklists.json'),'utf8'))
      .decks.find(d=>d.rank===3);
    const resolved=planAichi(1,{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    }).opponents.find(d=>d.rank===3);
    assert.equal(resolved.status,'ready');
    const printMap=buildSourcePrintingMap(sourceDeck,resolved.cards);
    assert.equal(printMap.get('Penny SVI'),'Penny SVI 183');
    assert.equal(printMap.get("Team Rocket's Handiwork FCO"),
      "Team Rocket's Handiwork FCO 112");
    assert.equal(printMap.get('Snorlax PGO'),'Snorlax PGO 55');
    // Pinned source has *both* Tropical Beach printings: BWP 28 and
    // independently registered BWP 50. Source rank3 requests BWP 50,
    // which must retain its exact native ID, not collide with BWP 28.
    assert.equal(printMap.get('Tropical Beach BWP 50'),'Tropical Beach BWP 50');
    assert.equal(printMap.has('Tropical Beach BWP'),false);
    const maps=seat===0?[printMap,new Map()]:[new Map(),printMap];

    const realFrontier=buildNativeActionFrontier({
      state:x.state,actorSeat:seat,native:frontierNative()
    });
    const genuineItems=realFrontier.actionFrontier.items;
    const nativePenny=genuineItems.find(a=>a.kind==='play-card'&&
      a.actorPrinting==='Penny SVI');
    const nativeHandi=genuineItems.find(a=>a.kind==='play-card'&&
      a.actorPrinting==="Team Rocket's Handiwork FCO");
    assert.ok(nativePenny,'Native Store must offer actually legal Penny');
    assert.ok(nativeHandi,'Native Store must offer actually legal Handiwork');
    const nativeReceipt=publicEventReceipt(x.state,seat);
    const mapped=projectSourcePrintings(view,realFrontier.actionFrontier,maps,{
      publicEventReceipt:nativeReceipt
    });
    const bridgedRoot={...root,observation:mapped.observation,
      actionFrontier:mapped.actionFrontier};
    assert.equal(mapped.observation.ownHand.includes('Penny SVI 183'),true);
    assert.equal(mapped.observation.ownPublic.active.printing,'Snorlax PGO 55');
    assert.equal(mapped.observation.ownPublic.prizeSlots.every(p=>
      p.printing===undefined),true);
    const nativeRequest={...request,requestId:'agent32-real-printed-'+seat,
      observation:mapped.observation,actionFrontier:mapped.actionFrontier,
      publicEventReceipt:mapped.publicEventReceipt};
    assert.equal(mapped.publicEventReceipt.ownerActive.printing,
      mapped.observation.ownPublic.active.printing);
    assert.equal(mapped.publicEventReceipt.ownerBench.length,
      mapped.observation.ownPublic.bench.length);
    assert.equal(Object.hasOwn(mapped.publicEventReceipt,
      'opponentCopycatChoices'),false);
    const admitted=protocol.validateRequest(nativeRequest,init,0,new Set());
    const selected=policy.decide(bridgedRoot);
    assert.deepEqual(selected,{kind:'select-action',token:nativePenny.token});
    assert.deepEqual(protocol.validateDecision(
      selected,null,admitted.actionTokens),selected);
    const oldMapped=JSON.parse(JSON.stringify(mapped.observation));
    oldMapped.ownPublic.active.printed.stage=Stage.BASIC;
    assert.deepEqual(policy.decide({...bridgedRoot,observation:oldMapped}),
      {kind:'select-action',token:nativeHandi.token});

    // Settle the *actual selected* Penny through the genuine Store. This
    // tests a legal optional Bench target, not source-policy competence for
    // choosing the best Penny target under live match conditions.
    x.store.dispatch(selectedNativeAction(realFrontier,selected.token));
    const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
    let chosePennyTarget=false;
    for(let i=0;i<24;i++){
      const pending=x.state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      if(pending.constructor.name==='WaitPrompt'){
        x.store.dispatch(new ResolvePromptAction(pending.id,null));
        continue;
      }
      assert.equal(pending.constructor.name,'ChoosePokemonPrompt',
        'Penny must request only the owned Basic Pokémon target');
      assert.equal(pending.playerId,x.owner.id);
      assert.equal(chosePennyTarget,false,'Penny should choose one target');
      const answer=[x.owner.bench[1]];
      assert.equal(pending.validate(answer,x.state),true);
      x.store.dispatch(new ResolvePromptAction(pending.id,answer));
      chosePennyTarget=true;
    }
    assert.equal(chosePennyTarget,true);
    assert.equal(x.state.prompts.some(p=>p.result===undefined),false);
    assert.equal(x.owner.bench[1].cards.length,0);
    assert.equal(x.owner.hand.cards.some(c=>c.fullName==='Regidrago V SIT'),true);

  });
}


/*
 * Stronger executable line: genuine ActionEnumerator -> isolated Simulator
 * legality -> protocol -> rank6 policy -> real Store settlement. The two
 * offered Stadiums are genuine independently validated native root actions.
 * A policy's synthetic action-list victory is not sufficient for this test.
 */
const rank6=require('../../simulation/evaluation/2026-11/agent39-rank6-iron-thorns-opponent-policy.cjs');
const {buildNativeActionFrontier,selectedNativeAction}=
  require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');

function stadiumScene(seat){
  const x=stage(seat),manager=initializeCards();
  replaceActive(x.owner,[createCard(manager,'Iron Thorns ex TWM')]);
  replaceActive(x.opponent,[createCard(manager,'Gardevoir-GX BUS')]);
  const fairy=createCard(manager,'Fairy Energy SVE');
  const dce=createCard(manager,'Double Colorless Energy FCO');
  x.opponent.active.cards.push(fairy,dce);
  x.opponent.active.energies.cards.push(fairy,dce);
  x.owner.hand.cards.length=0;
  x.owner.hand.cards.push(createCard(manager,'Wondrous Labyrinth Prism Star TEU'),
    createCard(manager,'Tropical Beach BWP'));
  x.owner.stadium.cards.length=0;
  x.opponent.stadium.cards.length=0;
  x.owner.deck.cards.length=0;
  x.opponent.deck.cards.length=0;
  for(let i=0;i<20;i++)x.owner.deck.cards.push(createCard(manager,'Psychic Energy SVE'));
  for(let i=0;i<30;i++)x.opponent.deck.cards.push(createCard(manager,'Psychic Energy SVE'));
  return x;
}

function frontierNative(){
  return {
    ActionEnumerator:native('advanced-bot/action-enumerator').ActionEnumerator,
    Simulator:native('game/bots/simulator').Simulator,
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    TrainerCard:native('game/store/card/trainer-card').TrainerCard,
    PlayerType:native('game/store/actions/play-card-action').PlayerType,
    SlotType:native('game/store/actions/play-card-action').SlotType,
    TrainerType:native('game/store/card/card-types').TrainerType,
    GameError:native('game/game-error').GameError
  };
}

function rank6Root(seat,{rawOldType=false}={}){
  const x=stadiumScene(seat);
  const observation=actorObservation(x.state,seat);
  assert.deepEqual(observation.opponentPublic.active.printed.types,['Fairy']);
  assert.deepEqual(observation.opponentPublic.active.energies,
    ['Fairy Energy SVE','Double Colorless Energy FCO']);
  const view=rawOldType?JSON.parse(JSON.stringify(observation)):observation;
  if(rawOldType)view.opponentPublic.active.printed.types=[CardType.FAIRY];
  if(!rawOldType)assert.doesNotThrow(()=>
    protocol.validateActorObservation(view,seat));
  const available=buildNativeActionFrontier({
    state:x.state,actorSeat:seat,native:frontierNative()
  });
  const entries=available.actionFrontier.items;
  const beach=entries.find(a=>a.kind==='play-card'&&
    a.actorPrinting?.startsWith('Tropical Beach BWP'));
  const wondrous=entries.find(a=>a.kind==='play-card'&&
    a.actorPrinting?.startsWith('Wondrous Labyrinth'));
  assert.ok(beach,'Tropical Beach must be genuinely offered and native-legal');
  assert.ok(wondrous,'Wondrous Labyrinth must be genuinely offered and native-legal');
  assert.notEqual(beach.token,wondrous.token);
  const request={schema:protocol.REQUEST_SCHEMA,type:'decision',
    requestId:'agent32-rank6-'+seat+'-'+(rawOldType?'old':'fixed'),
    sequence:0,role:'opponent',seat,
    observationSchema:protocol.OBSERVATION_SCHEMA,observation:view,
    prompt:null,publicEventReceipt:rawOldType?null:publicEventReceipt(x.state,seat),
    actionFrontier:available.actionFrontier};
  const init={role:'opponent',seat,policyVersion:rank6.POLICY_VERSION,config:{}};
  if(!rawOldType)protocol.validateRequest(request,init,0,new Set());
  const policy=rank6.createPolicy(init);
  const decision=policy.decide({
    role:'opponent',seat,observation:view,prompt:null,
    publicEventReceipt:null,actionFrontier:available.actionFrontier
  });
  assert.equal(decision.kind,'select-action');
  assert.equal(decision.token,(rawOldType?wondrous:beach).token);
  const chosen=selectedNativeAction(available,decision.token);
  assert.equal(chosen.type,'PLAY_CARD_ACTION');
  x.store.dispatch(chosen);
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  for(let i=0;i<16;i++){
    const pending=x.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    assert.equal(pending.constructor.name,'WaitPrompt',
      'Stadium settlement requested an unsupported non-visual prompt');
    x.store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.equal(x.owner.stadium.cards.length,1);
  assert.equal(x.owner.stadium.cards[0].fullName,
    (rawOldType?wondrous:beach).actorPrinting);
  assert.equal(x.state.prompts.some(p=>p.result===undefined),false,
    'Chosen Stadium must completely settle with no pending prompt');
  return {seat,chosenPrinting:x.owner.stadium.cards[0].fullName,
    offered:[wondrous.actorPrinting,beach.actorPrinting]};
}

for(const seat of [0,1]){
  test('native legal Stadium root/protocol/worker/settlement changed by Fairy enum; seat '+seat,()=>{
    const fixed=rank6Root(seat);
    const old=rank6Root(seat,{rawOldType:true});
    assert.notEqual(fixed.chosenPrinting,old.chosenPrinting);
    assert.deepEqual(fixed.offered,old.offered);
  });
}
