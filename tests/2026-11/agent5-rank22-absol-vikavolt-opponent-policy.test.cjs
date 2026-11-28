'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const policy = require('../../simulation/evaluation/2026-11/agent5-rank22-absol-vikavolt-opponent-policy.cjs');
const P = {
  vikavolt: 'Vikavolt V DAA 60',
  mega: 'Mega Absol ex MEG 86',
  trubbishFst: 'Trubbish FST 168',
  trubbishNvi: 'Trubbish NVI 48',
  garbodor: 'Garbodor BKP 57',
  lightning: 'Lightning Energy MEE 12',
  dark: 'Darkness Energy MEE 15'
};
const poke = (printing, opt = {}) => ({
  printing, energies: opt.energies ?? [], tools: opt.tools ?? [],
  hp: opt.hp ?? 210, damage: opt.damage ?? 0
});
const player = (opt = {}) => ({
  active: opt.active ?? null, bench: opt.bench ?? [], stadium: [],
  discard: opt.discard ?? [], handCount: opt.handCount ?? 0, deckCount: 30,
  prizeCount: 6, publicTurnRestrictions: {}
});
function observation(opt = {}) {
  return {
    actorSeat: opt.actorSeat ?? 0, globalTurn: opt.globalTurn ?? 3,
    ownPublic: opt.ownPublic ?? player(), opponentPublic: opt.opponentPublic ?? player(),
    ownHand: opt.ownHand ?? [], ownTurnResources: { supporterPlayedTurn: 0, vstarUsed: false }
  };
}
const root = (items, o = observation()) => ({
  role: 'opponent', seat: o.actorSeat, observation: o,
  prompt: null, actionFrontier: { items }
});
const attack = (name, damage, metadata = {}) => ({
  token: name, kind: 'attack', attackName: name,
  publicMetadata: { attackCostPayable: true, targetHp: 320, targetDamage: damage, ...metadata }
});
const choice = (token, printing, sourceZone = 'deck') => ({
  token, kind: 'card', printing, publicMetadata: { ownerSeat: 'actor', sourceZone }
});
const pass = { token: 'pass', kind: 'pass' };

test('rank22 policy is anchored to all and only the 60 printed source copies', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const field = JSON.parse(fs.readFileSync(
    path.join(rootDir, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const entry = field.decks.find(deck => deck.rank === 22);
  const actual = policy.SOURCE_INVENTORY.slice().sort((a,b)=>a[0].localeCompare(b[0]));
  const expected = entry.cards.map(c => [
    c.name + ' ' + c.printing.set + ' ' + c.printing.number, c.count
  ]).sort((a,b)=>a[0].localeCompare(b[0]));
  assert.equal(policy.SOURCE_RANK,22);
  assert.deepEqual(actual,expected);
  assert.equal(actual.reduce((n,c)=>n+c[1],0),60);
});
test('Vikavolt Paralyzing Bolt has nonlethal early Item-lock priority', () => {
  const o = observation({ ownPublic: player({active: poke(P.vikavolt)}),
    opponentPublic: player({active: poke('Shadow Rider Calyrex VMAX CRE 75', {hp: 320}),handCount: 5}) });
  assert.deepEqual(policy.bestAction(root([
    attack('Super Zap Cannon',0), attack('Paralyzing Bolt',0), pass
  ],o)), {kind:'select-action',token:'Paralyzing Bolt'});
});
test('Super Zap Cannon can overtake Bolt for immediate knockout despite 2-Energy discard', () => {
  const o = observation({ ownPublic: player({active: poke(P.vikavolt)}),
    opponentPublic: player({active: poke('Shadow Rider Calyrex V CRE 74',{hp: 210,damage: 40}),handCount: 5}) });
  assert.deepEqual(policy.bestAction(root([
    attack('Super Zap Cannon',40,{targetHp:210}),attack('Paralyzing Bolt',40,{targetHp:210}),pass
  ],o)), {kind:'select-action',token:'Super Zap Cannon'});
});
test('paid Lightning attachment is directed to developing Vikavolt', () => {
  const o=observation({ownPublic:player({active:poke(P.mega),
    bench:[poke(P.vikavolt, {energies:[P.lightning]})]})});
  const v={kind:'play-card',actorPrinting:P.lightning,targetPrinting:P.vikavolt};
  const m={kind:'play-card',actorPrinting:P.lightning,targetPrinting:P.mega};
  assert.ok(policy.scoreAction(v,root([],o))>policy.scoreAction(m,root([],o)));
});
test('Quick Ball prefers missing Vikavolt to redundant Mega Absol with lock already staged', () => {
  const o=observation({ownPublic:player({active:poke(P.trubbishNvi),
    bench:[poke(P.garbodor),poke(P.mega)]})});
  const prompt={
    promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'},
    choices:[choice('mega',P.mega),choice('vikavolt',P.vikavolt)]
  };
  assert.deepEqual(policy.promptDecision({observation:o,prompt}), {kind:'select-choice',token:'vikavolt'});
});
test('both rank22 Trubbish printings feed Garbodor evolution priority', () => {
  for (const basic of [P.trubbishFst,P.trubbishNvi]) {
    const o=observation({ownPublic:player({active:poke(basic)})});
    assert.ok(policy.scoreAction({kind:'play-card',actorPrinting:P.garbodor},root([],o))>0);
  }
});
test('Terminal Period only wins at six counters, never thirty', () => {
  const o=observation();
  for (const damage of [50,60,70,300]) {
    assert.equal(policy.scoreAttack(attack('Terminal Period',damage),o),damage===60?340:0);
  }
});
test('source rank/physical seat binding is fail closed', () => {
  const instance = policy.createPolicy({
    role:'opponent',seat:1,policyVersion:policy.POLICY_VERSION,config:{}
  });
  const o=observation({actorSeat:0});
  assert.deepEqual(instance.decide(root([pass],o)),
    {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'});
});

function setupPrompt(cards, min = 1, max = 4) {
  return {
    promptType: 'ChooseCardsPrompt',
    source: { sourceKind: 'engine', sourcePrinting: null, effectName: 'choose_starting_pokemons' },
    description: 'choose_starting_pokemons',
    publicMetadata: {
      ownerSeat: 'actor', sourceZone: 'hand', isOwnerVisible: true,
      selectionType: 'card-combination', minimumCount: min, maximumCount: max
    },
    choices: cards.map(([token, printing]) => ({
      token, kind: 'card', printing,
      publicMetadata: { ownerSeat: 'actor', sourceZone: 'hand', isOwnerVisible: true }
    }))
  };
}
test('initial setup chooses Vikavolt Active with Lightning and Trubbish without it', () => {
  const cards = [['mega', P.mega], ['vikavolt', P.vikavolt], ['trubbish', P.trubbishFst]];
  const prompt = setupPrompt(cards);
  const decision = ownHand => policy.promptDecision({
    prompt, observation: { ...observation({ ownHand }), phase: 1 }
  });
  assert.deepEqual(decision([P.lightning]), {
    kind: 'select-choices', tokens: ['vikavolt', 'trubbish', 'mega']
  });
  assert.deepEqual(decision([P.dark]), {
    kind: 'select-choices', tokens: ['trubbish', 'vikavolt', 'mega']
  });
});
test('post-mulligan bonus preserves existing Active and respects three-Bench budget', () => {
  const prompt = setupPrompt([['trubbish',P.trubbishNvi],['mega',P.mega],
    ['vikavolt',P.vikavolt]],0,3);
  const o={...observation({ownPublic:player({
    active:poke(P.vikavolt),bench:[poke(P.trubbishFst)]
  })}),phase:1};
  const decision=policy.promptDecision({observation:o,prompt});
  assert.deepEqual(decision,{kind:'select-choices',tokens:['mega']});
});
test('engine setup refuses a card not actually included in the source 60', () => {
  const prompt=setupPrompt([['foreign','Iron Thorns ex TWM 77']]);
  const decision=policy.promptDecision({
    observation:{...observation(),phase:1},prompt
  });
  assert.deepEqual(decision,{kind:'abstain',reasonCode:'RANK22_UNKNOWN_SETUP_BASIC'});
});
test('engine chooses maximum lawful opponent mulligan bonus draw', () => {
  const prompt={
    promptType:'SelectPrompt',
    source:{sourceKind:'engine',sourcePrinting:null,effectName:'want_to_draw_cards'},
    description:'want_to_draw_cards',
    choices:[{token:'0',label:'0'},{token:'1',label:'1'},{token:'2',label:'2'}]
  };
  assert.deepEqual(policy.promptDecision({
    prompt,observation:{...observation(),phase:1}
  }),{kind:'select-choice',token:'2'});
});

test('post-evolution Garbodor with empty Tool slot receives Float Stone before attacker Tool', () => {
  const own=player({active:poke(P.garbodor,{tools:[]}),bench:[poke(P.mega,{tools:[]})]});
  const o=observation({ownPublic:own});
  const item={kind:'play-card',actorPrinting:'Float Stone BKT 137',
    targetPrinting:P.garbodor};
  assert.ok(policy.scoreAction(item,root([],o))>=260);
  const prompt={
    promptType:'ChoosePokemonPrompt',
    source:{sourcePrinting:'Float Stone BKT 137',effectName:'Float Stone'},
    choices:[
      {token:'mega',kind:'pokemon',printing:P.mega,publicMetadata:{
        ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
      {token:'garb',kind:'pokemon',printing:P.garbodor,publicMetadata:{
        ownerSeat:'actor',targetZone:'active',benchIndex:0}}
    ]
  };
  assert.deepEqual(policy.promptDecision({observation:o,prompt}),
    {kind:'select-choice',token:'garb'});
});

test('Battle Compressor root has a real 2-Darkness Dark Patch payoff', () => {
  const o=observation({globalTurn:3,ownPublic:player({
    bench:[poke(P.mega)],discard:[]
  }),ownHand:['Dark Patch ASR 139']});
  const action={kind:'play-card',actorPrinting:'Battle Compressor PHF 92'};
  assert.equal(policy.scoreAction(action,root([],o)),260);
  const exhausted=observation({ownPublic:player({
    bench:[poke(P.mega)],discard:[P.dark,P.dark]
  }),ownHand:['Dark Patch ASR 139']});
  assert.equal(policy.scoreAction(action,root([],exhausted)),0);
});
test('Battle Compressor gets two Dark patches then expired VIP, never singleton attacker', () => {
  const o=observation({globalTurn:3});
  const prompt={
    promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Battle Compressor PHF 92',effectName:'Battle Compressor'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:3},
    choices:[choice('dark1',P.dark),choice('dark2',P.dark),
      choice('vip','Battle VIP Pass FST 225'),choice('mega',P.mega)]
  };
  assert.deepEqual(policy.promptDecision({observation:o,prompt}),
    {kind:'select-choices',tokens:['dark1','dark2','vip']});
  const oneDark={...o,ownPublic:player({discard:[P.dark]})};
  assert.deepEqual(policy.promptDecision({observation:oneDark,prompt}),
    {kind:'select-choices',tokens:['dark1','vip']});
});
test('Battle Compressor preserves still-live first-turn VIP and fails closed on bad bounds', () => {
  const o=observation({globalTurn:2});
  const prompt={
    promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Battle Compressor PHF 92',effectName:'Battle Compressor'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:3},
    choices:[choice('vip','Battle VIP Pass FST 225'),choice('dark1',P.dark)]
  };
  assert.deepEqual(policy.promptDecision({observation:o,prompt}),
    {kind:'select-choices',tokens:['dark1']});
  assert.deepEqual(policy.promptDecision({observation:o,prompt:{
    ...prompt, publicMetadata:{selectionType:'card-combination',minimumCount:4,maximumCount:4}
  }}),{kind:'abstain',reasonCode:'RANK22_COMPRESSOR_SCHEMA_UNSUPPORTED'});
});

test('energy plans distinguish colored costs from interchangeable Colorless', () => {
  const s=(pokemon,energies,fromHand) => {
    const o=observation({ownPublic:player({active:poke(pokemon,{energies})})});
    return policy.scoreAction({kind:'play-card',
      actorPrinting:fromHand,targetPrinting:pokemon},root([],o));
  };
  assert.equal(s(P.vikavolt,[P.lightning],P.dark),235,
    'Darkness supplies the second Colorless of Paralyzing Bolt');
  assert.equal(s(P.vikavolt,[P.dark],P.lightning),260,
    'Lightning is required to finish the typed part of Paralyzing Bolt');
  assert.equal(s(P.mega,[P.dark],P.dark),220,
    'second Darkness advances Claw of Darkness');
  assert.equal(s(P.mega,[P.dark],P.lightning),125,
    'Lightning can still supply Terminal Period Colorless');
  assert.equal(s(P.mega,[P.lightning],P.lightning),0,
    'two Lightning without Darkness do not satisfy either Mega Absol attack');
});

test('Crobat draw beats attaching Float Stone to Garbodor before self-Garbotoxin', () => {
  const garb=poke(P.garbodor,{tools:[]});
  const o=observation({ownPublic:player({active:garb}),
    ownHand:['Crobat V DAA 104','Float Stone BKT 137']});
  const crobat={kind:'play-card',actorPrinting:'Crobat V DAA 104'};
  const float={kind:'play-card',actorPrinting:'Float Stone BKT 137',targetPrinting:P.garbodor};
  assert.ok(policy.scoreAction(crobat,root([],o))>policy.scoreAction(float,root([],o)));
  assert.deepEqual(policy.bestAction(root([
    {...crobat,token:'crobat'},{...float,token:'garb-lock'},pass
  ],o)),{kind:'select-action',token:'crobat'});
  const after={...o,ownHand:['Float Stone BKT 137']};
  assert.ok(policy.scoreAction(float,root([],after))>0,
    'lock is not permanently postponed after Crobat leaves hand');
});
test('Garbodor suppresses draw only when a Tool is attached', () => {
  const toolLess=observation({ownPublic:player({active:poke(P.garbodor)})});
  const equipped=observation({ownPublic:player({active:poke(P.garbodor,{
    tools:['Float Stone BKT 137']})})});
  const asset={kind:'use-ability',publicMetadata:{abilityName:'Dark Asset'}};
  const crobat={kind:'play-card',actorPrinting:'Crobat V DAA 104'};
  assert.ok(policy.scoreAction(asset,root([],toolLess))>0);
  assert.equal(policy.scoreAction(asset,root([],equipped)),0);
  assert.equal(policy.scoreAction(crobat,root([],
    {...equipped,ownHand:['Crobat V DAA 104']})),0);
});
test('opponent Garbotoxin also blocks source hand-play Ability payoffs', () => {
  const o=observation({ownPublic:player({active:poke(P.mega)}),
    opponentPublic:player({active:poke(P.garbodor,{tools:['Float Stone BKT 137']})}),
    ownHand:['Crobat V DAA 104','Tapu Lele-GX GRI 60']});
  assert.equal(policy.scoreAction({
    kind:'play-card',actorPrinting:'Crobat V DAA 104'
  },root([],o)),0);
  assert.equal(policy.scoreAction({
    kind:'play-card',actorPrinting:'Tapu Lele-GX GRI 60'
  },root([],o)),0);
});

test('Enhanced Hammer root is legal-value-positive only for attached Special Energy', () => {
  const hammer={kind:'play-card',actorPrinting:'Enhanced Hammer TWM 148'};
  const score=energyName=>policy.scoreAction(hammer,root([],
    observation({opponentPublic:player({active:poke('Regidrago VSTAR SIT 136',
      {energies:[energyName]})})})));
  assert.equal(score('Double Dragon Energy ROS 97'),305);
  assert.ok(score('Jet Energy PAL 190')>0);
  assert.ok(score('Telepathic Psychic Energy MEG 181')>0);
  assert.equal(score('Psychic Energy MEE 13'),0);
  assert.equal(score('Lightning Energy MEE 12'),0);
});
test('Enhanced Hammer chooses the actual Special Energy holder, not a Basic-only target', () => {
  const o=observation({opponentPublic:player({
    active:poke('Shadow Rider Calyrex VMAX CRE 75',{energies:[P.dark]}),
    bench:[poke('Regidrago VSTAR SIT 136',{energies:['Double Dragon Energy ROS 97']})]
  })});
  const prompt={
    promptType:'ChoosePokemonPrompt',
    source:{sourcePrinting:'Enhanced Hammer TWM 148',effectName:'Enhanced Hammer'},
    choices:[
      {token:'active',kind:'pokemon',printing:'Shadow Rider Calyrex VMAX CRE 75',
        publicMetadata:{ownerSeat:'opponent',targetZone:'active'}},
      {token:'drago',kind:'pokemon',printing:'Regidrago VSTAR SIT 136',
        publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}}
    ]
  };
  assert.deepEqual(policy.promptDecision({observation:o,prompt}),
    {kind:'select-choice',token:'drago'});
});
test('Enhanced Hammer selects a public Special attachment, never hidden Energy', () => {
  const o=observation();
  const make=(token,printing,sourceZone='attached',ownerSeat='opponent')=>({
    token,kind:'card',printing,publicMetadata:{ownerSeat,sourceZone}});
  const prompt={
    promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Enhanced Hammer TWM 148',effectName:'Enhanced Hammer'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1},
    choices:[make('dark',P.dark),make('jet','Jet Energy PAL 190'),
      make('double','Double Dragon Energy ROS 97'),make('hidden','Legacy Energy TWM 167','hand')]
  };
  assert.deepEqual(policy.promptDecision({observation:o,prompt}),
    {kind:'select-choices',tokens:['double']});
  const onlyHidden={...prompt,choices:[make('hidden','Double Dragon Energy ROS 97','hand')]};
  assert.deepEqual(policy.promptDecision({observation:o,prompt:onlyHidden}),
    {kind:'abstain',reasonCode:'RANK22_HAMMER_NO_VISIBLE_SPECIAL'});
});

test('Battle Compressor declines empty selection despite pinned native min zero', () => {
  const o=observation({globalTurn:2});
  const prompt={
    promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Battle Compressor PHF 92',effectName:'Battle Compressor'},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:3},
    choices:[
      {token:'empty',kind:'empty-selection'},
      choice('vip','Battle VIP Pass FST 225')
    ]
  };
  assert.deepEqual(policy.promptDecision({observation:o,prompt}),
    {kind:'abstain',reasonCode:'RANK22_COMPRESSOR_NO_SAFE_PAYLOAD'});
});

test('Ultra Ball ranks evolved Garbodor ahead of extra Basic, unlike Quick Ball', () => {
  const o=observation({globalTurn:4,
    ownPublic:player({active:poke(P.trubbishFst)}),
    ownHand:['Ultra Ball MEG 131','Battle VIP Pass FST 225','Battle VIP Pass FST 225']
  });
  const ultra={kind:'play-card',actorPrinting:'Ultra Ball MEG 131'};
  assert.equal(policy.scoreAction(ultra,root([],o)),185);
  const cards=[choice('mega',P.mega),choice('garb',P.garbodor)];
  const ultraPrompt={promptType:'ChooseCardsPrompt',source:{
    sourcePrinting:'Ultra Ball MEG 131',effectName:'Ultra Ball'
  },choices:cards};
  assert.deepEqual(policy.promptDecision({observation:o,prompt:ultraPrompt}),
    {kind:'select-choice',token:'garb'});
  const quickPrompt={...ultraPrompt,source:{
    sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'
  }};
  assert.deepEqual(policy.promptDecision({observation:o,prompt:quickPrompt}),
    {kind:'select-choice',token:'mega'});
});
test('Ultra Ball root declines two protected singleton payment cards', () => {
  const o=observation({globalTurn:4,
    ownPublic:player({active:poke(P.trubbishNvi)}),
    ownHand:['Ultra Ball MEG 131',P.garbodor,'Tapu Koko ♢ TEU 51']
  });
  assert.equal(policy.scoreAction({kind:'play-card',
    actorPrinting:'Ultra Ball MEG 131'},root([],o)),0);
});
test('real card-combination and Pokémon prompts yield multi-selection worker shape', () => {
  const worker=policy.createPolicy({role:'opponent',seat:0,
    policyVersion:policy.POLICY_VERSION,config:{}});
  const o=observation({ownPublic:player({active:poke(P.trubbishFst)})});
  const cardPrompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Ultra Ball MEG 131',effectName:'Ultra Ball'},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1},
    choices:[choice('garb',P.garbodor)]};
  assert.deepEqual(worker.decide({...root([],o),prompt:cardPrompt}),
    {kind:'select-choices',tokens:['garb']});
  const holder=player({active:poke(P.garbodor,{tools:[]})});
  const targetPrompt={promptType:'ChoosePokemonPrompt',
    source:{sourcePrinting:'Float Stone BKT 137',effectName:'Float Stone'},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
    choices:[{kind:'pokemon',token:'holder',printing:P.garbodor,
      publicMetadata:{ownerSeat:'actor',targetZone:'active'}}]};
  assert.deepEqual(worker.decide({...root([],observation({ownPublic:holder})),
    prompt:targetPrompt}),{kind:'select-choices',tokens:['holder']});
});

test('Wally converts first-turn source Trubbish directly into Garbodor with Tool', () => {
  const o=observation({globalTurn:2,ownPublic:player({
    active:poke(P.trubbishNvi,{tools:['Float Stone BKT 137']})
  }),ownHand:['Wally ROS 94']});
  const action={kind:'play-card',actorPrinting:'Wally ROS 94',token:'wally'};
  assert.equal(policy.scoreAction(action,root([],o)),330);
  assert.deepEqual(policy.bestAction(root([action,pass],o)),
    {kind:'select-action',token:'wally'});
  const cardPrompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Wally ROS 94',effectName:'Wally'},
    choices:[choice('garb',P.garbodor),choice('mega',P.mega)]};
  assert.deepEqual(policy.promptDecision({observation:o,prompt:cardPrompt}),
    {kind:'select-choice',token:'garb'});
  const targetPrompt={promptType:'ChoosePokemonPrompt',
    source:{sourcePrinting:'Wally ROS 94',effectName:'Wally'},
    choices:[{token:'trubbish',kind:'pokemon',printing:P.trubbishNvi,
      publicMetadata:{ownerSeat:'actor',targetZone:'active'}}]};
  assert.deepEqual(policy.promptDecision({observation:o,prompt:targetPrompt}),
    {kind:'select-choice',token:'trubbish'});
});
test('Wally is no longer used when no Trubbish exists or Garbodor already is live', () => {
  const rootAction={kind:'play-card',actorPrinting:'Wally ROS 94'};
  const absent=observation({ownPublic:player({active:poke(P.mega)}),
    ownHand:['Wally ROS 94']});
  const settled=observation({ownPublic:player({active:poke(P.garbodor)}),
    ownHand:['Wally ROS 94']});
  assert.equal(policy.scoreAction(rootAction,root([],absent)),0);
  assert.equal(policy.scoreAction(rootAction,root([],settled)),0);
});

test('Marnie hand-reset turns on only when it meaningfully disrupts a large opposing hand', () => {
  const marnie={kind:'play-card',actorPrinting:'Marnie SSH 169'};
  const score=(own,other,spent=0) => policy.scoreAction(marnie,root([],
    observation({ownHand:Array.from({length:own},()=> 'Marnie SSH 169'),
      ownPublic:player({deckCount:30}),
      opponentPublic:player({handCount:other}),
      ownTurnResources:{supporterPlayedTurn:spent}})));
  assert.equal(score(2,7),240);
  assert.equal(score(2,5),185);
  assert.equal(score(2,3),0);
  assert.equal(score(6,7),0);
  assert.equal(score(2,7,1),0);
});

test('Karen recycles visible Regidrago attack donors and wins real Supporter contention', () => {
  const regidrago=player({
    active:poke('Regidrago VSTAR SIT 136'),
    discard:['Dialga-GX UPR 100','Dragapult ex TWM 130']
  });
  const o=observation({opponentPublic:regidrago,ownHand:['Karen XYP 177','Marnie SSH 169']});
  const karen={kind:'play-card',actorPrinting:'Karen XYP 177',token:'karen'};
  const marnie={kind:'play-card',actorPrinting:'Marnie SSH 169',token:'marnie'};
  assert.equal(policy.scoreAction(karen,root([],o)),300);
  assert.deepEqual(policy.bestAction(root([marnie,karen,pass],o)),
    {kind:'select-action',token:'karen'});
});
test('Karen is not burned when Regidrago has no discarded attack donors', () => {
  const karen={kind:'play-card',actorPrinting:'Karen XYP 177'};
  const without=observation({opponentPublic:player({
    active:poke('Regidrago VSTAR SIT 136'),discard:['Quick Ball FST 237']
  }),ownHand:['Karen XYP 177']});
  const other=observation({opponentPublic:player({
    active:poke('Shadow Rider Calyrex VMAX CRE 75'),
    discard:['Dialga-GX UPR 100']}),
    ownHand:['Karen XYP 177']});
  assert.equal(policy.scoreAction(karen,root([],without)),0);
  assert.equal(policy.scoreAction(karen,root([],other)),0);
});
test('VS Seeker Karen is search-prioritized in a live Regidrago donor board', () => {
  const o=observation({opponentPublic:player({
    active:poke('Regidrago VSTAR SIT 136'),
    discard:['Kyurem SHF 47','Noivern ex PAL 153']
  }),ownPublic:player({discard:['Karen XYP 177','Marnie SSH 169']})});
  const prompt={promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'VS Seeker PHF 109',effectName:'VS Seeker'},
    choices:[choice('karen','Karen XYP 177','discard'),
      choice('marnie','Marnie SSH 169','discard')]};
  assert.deepEqual(policy.promptDecision({observation:o,prompt}),
    {kind:'select-choice',token:'karen'});
});
