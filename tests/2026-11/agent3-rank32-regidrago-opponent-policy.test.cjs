'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const list = require('../../results/aichi-2026/full-decklists.json');
const workerProtocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {
  POLICY_VERSION, SOURCE_RANK, SOURCE_LIST_BLOB_SHA1, ENGINE_PIN,
  createPolicy, bestAction, promptDecision
} = require('../../simulation/evaluation/2026-11/agent3-rank32-regidrago-opponent-policy.cjs');

const P = Object.freeze({
  regidrago: 'Regidrago VSTAR SIT 136',
  regidragoV: 'Regidrago V SIT 135',
  goodra: 'Hisuian Goodra VSTAR LOR 136',
  dragonite: 'Mega Dragonite ex ASC 152',
  dragapult: 'Dragapult ex TWM 130',
  dialga: 'Dialga-GX UPR 100',
  noivern: 'Noivern ex PAL 153',
  energy: 'Grass Energy MEE 9',
  doubleDragon: 'Double Dragon Energy ROS 97'
});
function pokemon(printing, options = {}) {
  return { printing, hp: 280, damage: 0, energies: [], tools: [],
    abilityDetails: [], printed: {subtypes:['VSTAR']}, ...options };
}
function request({seat=0,active=pokemon(P.regidrago,{energies:[P.energy,P.doubleDragon]}),
  bench=[],discard=[],hand=[],opponentActive=pokemon('Shadow Rider Calyrex VMAX CRE 75',
    {hp:320,printed:{subtypes:['VMAX']}}),opponentBench=[],items=[],prompt=null,
  ownPrizes=6,gxUsed=false}={}) {
  return {
    role:'opponent',seat,prompt,
    observation:{
      actorSeat:seat,ownHand:hand,ownPublic:{
        active,bench,discard:discard.map(printing=>({printing})),stadium:[],
        prizeCount:ownPrizes,publicTurnRestrictions:{gxUsed,vstarUsed:false}
      },opponentPublic:{active:opponentActive,bench:opponentBench,stadium:[],
        prizeCount:6}
    },actionFrontier:{items}
  };
}
function action(token, kind, actorPrinting, other={}) {
  return {token,kind,actorPrinting,...other};
}
function prompt(sourcePrinting,effectName,choices,kind='ChooseCardsPrompt',count=[1,3]) {
  return {promptType:kind,source:{sourcePrinting,effectName},
    description: 'Select from offered native tokens',choices,
    publicMetadata:{selectionType:'card-combination',minimumCount:count[0],
      maximumCount:count[1]}};
}
function choice(token,printing) { return {token,kind:'card',printing,label:printing}; }

test('exact published rank 32 source contains 60 and the distinct Goodra/Dragonite/Compressor core', () => {
  const source = list.decks.find(x=>x.rank===32);
  assert.equal(POLICY_VERSION,'agent3-rank32-regidrago-opponent-v1');
  assert.equal(SOURCE_RANK,32);
  assert.match(SOURCE_LIST_BLOB_SHA1,/^[0-9a-f]{40}$/);
  assert.equal(ENGINE_PIN,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(source.cards.reduce((n,x)=>n+x.count,0),60);
  for(const [name,count] of [['Mega Dragonite ex',1],['Hisuian Goodra VSTAR',1],
    ['Battle Compressor',1],['Regidrago VSTAR',3]]) {
    assert.equal(source.cards.find(x=>x.name===name)?.count,count);
  }
  for (const name of ['Koraidon ex','Echoing Horn','Path to the Peak']) {
    assert.equal(source.cards.some(x=>x.name===name),false);
  }
});

test('factory binds role and seat, with no RNG draw for either physical seat', () => {
  for (const seat of [0,1]) {
    let draws=0;
    const p=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,
      config:{},rng:()=>{draws++;return 0.5;}});
    const root=request({seat,items:[action('pass','pass')]});
    assert.deepEqual(p.decide(root),{kind:'select-action',token:'pass'});
    assert.equal(draws,0);
    assert.deepEqual(p.decide(request({seat:1-seat,items:[action('pass','pass')]})),
      {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'});
  }
  assert.throws(()=>createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,
    config:{},rng:()=>0.5}),/INIT_MISMATCH/);
});

test('a Goodra-only donor permits Regidrago to attack',()=>{
  assert.deepEqual(bestAction(request({discard:[P.goodra],
    items:[action('apex','attack',P.regidrago,{attackName:'Apex Dragon'}),
      action('pass','pass')]})),{kind:'select-action',token:'apex'});
});

test('Phantom Dive alone is NOT a complete Apex line; root passes instead',()=>{
  for(const discard of [[],[P.dragapult]]) {
    assert.deepEqual(bestAction(request({discard,
      items:[action('apex','attack',P.regidrago,{attackName:'Apex Dragon'}),
        action('pass','pass')]})),{kind:'select-action',token:'pass'});
  }
});

test('rank-32 Compressor wins a VSTAR no-donor root over premature redraw',()=>{
  const items=[action('compressor','play-card','Battle Compressor PHF 92'),
    action('lillie','play-card',"Lillie's Determination MEG 119"),
    action('pass','pass')];
  assert.deepEqual(bestAction(request({hand:[P.energy],items})),
    {kind:'select-action',token:'compressor'});
  const noAttacker=request({active:pokemon('Budew ASC 16'),hand:[P.energy],items});
  assert.deepEqual(bestAction(noAttacker),{kind:'select-action',token:'lillie'});
});

test('Compressor chooses native donor tokens; avoids incomplete Phantom-only donor',()=>{
  const req=request({prompt:prompt('Battle Compressor PHF 92','Battle Compressor',
    [choice('ph',P.dragapult),choice('g',P.goodra),
     choice('m',P.dragonite),choice('e',P.energy)],'ChooseCardsPrompt',[1,3])});
  assert.deepEqual(promptDecision(req),{kind:'select-choices',tokens:['m','g']});
});

test('Compressor does not waste a singleton already present in discard',()=>{
  const req=request({discard:[P.dragonite],prompt:prompt('Battle Compressor PHF 92',
    'Battle Compressor',[choice('m',P.dragonite),choice('g',P.goodra)],
    'ChooseCardsPrompt',[1,2])});
  assert.deepEqual(promptDecision(req),{kind:'select-choices',tokens:['g']});
});

test('funded Ultra Ball discards donor and surplus Basic rather than Double Dragon Energy',()=>{
  const req=request({
    active:pokemon(P.regidrago,{energies:[P.energy,'Fire Energy MEE 10',P.doubleDragon]}),
    hand:['Grass Energy MEE 9','Fire Energy MEE 10',P.goodra],
    prompt:prompt('Ultra Ball MEG 131','Ultra Ball discard 2 cards',
    [choice('dde',P.doubleDragon),choice('g',P.goodra),
     choice('fire','Fire Energy MEE 10')],'ChooseCardsPrompt',[2,2])});
  assert.deepEqual(promptDecision(req),{kind:'select-choices',tokens:['g','fire']});
});
test('unfunded Ultra Ball with only one donor and protected Energy is not a complete root',()=>{
  const items=[action('ball','play-card','Ultra Ball MEG 131'),action('pass','pass')];
  const hand=['Ultra Ball MEG 131',P.goodra,P.doubleDragon,'Fire Energy MEE 10'];
  const root=request({hand,items});
  assert.deepEqual(bestAction(root),{kind:'select-action',token:'pass'});
  const selection=prompt('Ultra Ball MEG 131','Ultra Ball discard 2 cards',
    [choice('g',P.goodra),choice('dde',P.doubleDragon),
     choice('fire','Fire Energy MEE 10')],'ChooseCardsPrompt',[2,2]);
  assert.deepEqual(promptDecision(request({hand,prompt:selection})),
    {kind:'abstain',reasonCode:'RANK32_BALL_NO_SAFE_DISCARD'});
});

test('Ryuno Glide becomes the strongest available copied active KO in the offered choice',()=>{
  const req=request({opponentActive:pokemon('Shadow Rider Calyrex VMAX CRE 75',
    {hp:320,damage:10,printed:{subtypes:['VMAX']}}),prompt:prompt(
    P.regidrago,'Apex Dragon',[
      {token:'iron',publicMetadata:{sourceAttack:'Rolling Iron'}},
      {token:'ryuno',publicMetadata:{sourceAttack:'Ryuno Glide'}}],
    'ChooseAttackPrompt')});
  assert.deepEqual(promptDecision(req),{kind:'select-choice',token:'ryuno'});
});

test('when available, unspent Timeless-GX extra turn beats nonlethal copied attack',()=>{
  const req=request({opponentActive:pokemon('Shadow Rider Calyrex VMAX CRE 75',
    {hp:400,printed:{subtypes:['VMAX']}}),prompt:prompt(
    P.regidrago,'Apex Dragon',[
      {token:'ryuno',publicMetadata:{sourceAttack:'Ryuno Glide'}},
      {token:'timeless',publicMetadata:{sourceAttack:'Timeless-GX'}}],
    'ChooseAttackPrompt')});
  assert.deepEqual(promptDecision(req),{kind:'select-choice',token:'timeless'});
});

test('Phantom Dive allocation remains an explicitly unsupported native continuation',()=>{
  const req=request({prompt:prompt(P.regidrago,'Apex Dragon',[
    {token:'phantom',publicMetadata:{sourceAttack:'Phantom Dive'}}],
    'ChooseAttackPrompt')});
  assert.deepEqual(promptDecision(req),
    {kind:'abstain',reasonCode:'RANK32_APEX_NO_COMPLETE_SUPPORTED_ATTACK'});
});

test('native ChooseEnergyPrompt uses energyCount and retains DDE if two Basics available',()=>{
  const options=[
    {token:'dde',kind:'energy',printing:P.doubleDragon},
    {token:'g',kind:'energy',printing:P.energy},
    {token:'f',kind:'energy',printing:'Fire Energy MEE 10'}
  ];
  const p=prompt(P.dragonite,'Ryuno Glide',options,'ChooseEnergyPrompt',[1,2]);
  p.publicMetadata={selectionType:'energy-payment',energyCount:3,count:3,allowCancel:false};
  assert.deepEqual(promptDecision(request({prompt:p})),
    {kind:'select-choices',tokens:['g','f']});
  p.choices=[options[0]];
  p.publicMetadata.energyCount=1;
  p.publicMetadata.count=1;
  assert.deepEqual(promptDecision(request({prompt:p})),
    {kind:'select-choices',tokens:['dde']});
  delete p.publicMetadata.energyCount;
  assert.deepEqual(promptDecision(request({prompt:p})),
    {kind:'abstain',reasonCode:'RANK32_RYUNO_ENERGY_PROMPT_UNPROJECTED'});
  p.promptType='DiscardEnergyPrompt';
  assert.deepEqual(promptDecision(request({prompt:p})),
    {kind:'abstain',reasonCode:'RANK32_RYUNO_ENERGY_PROMPT_UNPROJECTED'});
});

test('Sky Transport selects own Regidrago rather than an opposing Pokemon',()=>{
  const req=request({active:pokemon('Mega Dragonite ex ASC 152'),
    prompt:{...prompt(P.dragonite,'Sky Transport',[
      choice('attacker',P.regidrago),choice('random','Dedenne-GX UNB 57')],
      'ChoosePokemonPrompt',[1,1]),
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1}}});
  assert.deepEqual(promptDecision(req),{kind:'select-choices',tokens:['attacker']});
});

test('Silent Lab is not played to disable own unused Basic-Ability draw support',()=>{
  const items=[action('lab','play-card','Silent Lab PRC 140'),action('pass','pass')];
  const opponentActive=pokemon('Dedenne-GX UNB 57',
    {abilityDetails:[{name:'Dedechange'}],printed:{subtypes:['Basic','GX']}});
  const selfSupport=pokemon('Crobat V DAA 104',
    {abilityDetails:[{name:'Dark Asset'}],printed:{subtypes:['Basic','V']}});
  assert.deepEqual(bestAction(request({opponentActive,bench:[selfSupport],items})),
    {kind:'select-action',token:'pass'});
  assert.deepEqual(bestAction(request({opponentActive,items})),
    {kind:'select-action',token:'lab'});
});

test('unknown prompts abstain, never fabricate a choice token',()=>{
  assert.deepEqual(promptDecision(request({prompt:{promptType:'MysteryPrompt',
    source:{effectName:'unknown'},choices:[{token:'first',label:'go'}]}})),
    {kind:'abstain',reasonCode:'UNSUPPORTED_RANK32_PROMPT_TYPE'});
});


test('Lockbridge Temple on DDE funds a regular Stadium response before burning Megaton',()=>{
  const req=request({items:[
    action('parallel','play-card','Parallel City BKT 145'),
    action('megaton','play-card','Megaton Blower SSP 182'),
    action('pass','pass')
  ],active:pokemon(P.regidrago,{energies:[P.doubleDragon,P.doubleDragon,P.energy]})});
  req.observation.opponentPublic.stadium=[{printing:'Temple of Sinnoh ASR 155'}];
  assert.deepEqual(bestAction(req),{kind:'select-action',token:'parallel'});
});

test('no Temple threat means rank-32 does not waste a singleton Stadium',()=>{
  const req=request({hand:[P.energy],items:[
    action('parallel','play-card','Parallel City BKT 145'),
    action('lillie','play-card',"Lillie's Determination MEG 119"),
    action('pass','pass')
  ]});
  assert.deepEqual(bestAction(req),{kind:'select-action',token:'lillie'});
});

test('Active Wobbuffet lock merits Hood on unused Regidrago VSTAR',()=>{
  const items=[
    action('wrong-hood','play-card','Stealthy Hood UNB 186',{
      targetPrinting:'Dedenne-GX UNB 57',
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}
    }),
    action('hood','play-card','Stealthy Hood UNB 186',{
      targetPrinting:P.regidrago,
      publicMetadata:{targetSeat:'actor',targetZone:'active'}
    }),
    action('lillie','play-card',"Lillie's Determination MEG 119"),
    action('pass','pass')
  ];
  const req=request({hand:[P.energy],items,
    opponentActive:pokemon('Wobbuffet PHF 36',
      {printed:{subtypes:['Basic']},abilityDetails:[{name:'Bide Barricade'}]})});
  assert.deepEqual(bestAction(req),{kind:'select-action',token:'hood'});
  const used=request({hand:[P.energy],items,opponentActive:req.observation.opponentPublic.active});
  used.observation.ownPublic.publicTurnRestrictions.vstarUsed=true;
  assert.deepEqual(bestAction(used),{kind:'select-action',token:'lillie'});
  const noLock=request({hand:[P.energy],items});
  assert.deepEqual(bestAction(noLock),{kind:'select-action',token:'lillie'});
});

test('Stealthy Hood attachment targets the VSTAR only within active Wobbuffet lock window',()=>{
  const p=prompt('Stealthy Hood UNB 186','Stealthy Hood',[
    choice('vstar',P.regidrago),choice('support','Dedenne-GX UNB 57')
  ],'ChoosePokemonPrompt',[1,1]);
  p.publicMetadata.selectionType='pokemon';
  const req=request({prompt:p,opponentActive:pokemon('Wobbuffet PHF 36',
    {printed:{subtypes:['Basic']},abilityDetails:[{name:'Bide Barricade'}]})});
  assert.deepEqual(promptDecision(req),{kind:'select-choices',tokens:['vstar']});
  const noLock=request({prompt:p});
  assert.deepEqual(promptDecision(noLock),
    {kind:'abstain',reasonCode:'RANK32_HOOD_LOCK_WINDOW_ABSENT'});
});


test('production V3 codebook accepts worker abstentions, never internal RANK32 codes',()=>{
  const policy=createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,
    config:{},rng:()=>0.5});
  const rp=request({items:[action('ball','play-card','Ultra Ball MEG 131')]});
  assert.deepEqual(policy.decide(rp),
    {kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
  assert.ok(workerProtocol.isAbstentionReasonCode(policy.decide(rp).reasonCode));
  assert.deepEqual(workerProtocol.validateDecision(policy.decide(rp),null,new Set(['ball'])),
    {kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
  const pp=request({prompt:prompt(P.regidrago,'Apex Dragon',
    [{token:'phantom',kind:'attack',publicMetadata:{sourceAttack:'Phantom Dive'}}],
    'ChooseAttackPrompt')});
  const result=policy.decide(pp);
  assert.deepEqual(result,{kind:'abstain',reasonCode:'NO_SUPPORTED_ATTACK_CHOICE'});
  assert.deepEqual(workerProtocol.validateDecision(result,pp.prompt,new Set()),result);
});

test('production V3 validates a copied Ryuno ChooseEnergyPrompt selection',()=>{
  const p=prompt(P.dragonite,'Ryuno Glide',[
    {token:'dde',kind:'energy',printing:P.doubleDragon},
    {token:'g',kind:'energy',printing:P.energy},
    {token:'f',kind:'energy',printing:'Fire Energy MEE 10'}],
    'ChooseEnergyPrompt');
  p.publicMetadata={selectionType:'energy-payment',energyCount:3,count:3,allowCancel:false};
  const req=request({prompt:p});
  const policy=createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,
    config:{},rng:()=>0.5});
  const decision=policy.decide(req);
  assert.deepEqual(decision,{kind:'select-choices',tokens:['g','f']});
  assert.deepEqual(workerProtocol.validateDecision(decision,p,new Set()),decision);
});
