'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const list = require('../../results/aichi-2026/full-decklists.json');
const workerProtocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
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
  ownPrizes=6,gxUsed=false,ownPublic=null,opponentPublic=null}={}) {
  return {
    role:'opponent',seat,prompt,
    observation:{
      actorSeat:seat,ownHand:hand,ownPublic:ownPublic??{
        active,bench,discard:discard.map(printing=>({printing})),stadium:[],
        prizeCount:ownPrizes,publicTurnRestrictions:{gxUsed,vstarUsed:false}
      },opponentPublic:opponentPublic??{active:opponentActive,bench:opponentBench,stadium:[],
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


test('static rank-32 bundle loads with no ambient require, process or code generation',()=>{
  const source=fs.readFileSync(path.join(__dirname,
    '../../simulation/evaluation/2026-11/agent3-rank32-regidrago-worker-bundle.cjs'),
  'utf8');
  const sandbox={module:{exports:{}},require:undefined,process:undefined,
    eval:undefined,Function:undefined,console:undefined};
  const ctx=vm.createContext(sandbox,{codeGeneration:{strings:false,wasm:false}});
  vm.runInContext(source,ctx,{timeout:4000});
  assert.equal(ctx.module.exports.POLICY_VERSION,POLICY_VERSION);
  const policy=ctx.module.exports.createPolicy({role:'opponent',seat:0,
    policyVersion:POLICY_VERSION,config:{},rng:()=>{throw Error('RNG_USED');}});
  const req=request({items:[action('pass','pass')]});
  assert.equal(JSON.stringify(policy.decide(req)),
    JSON.stringify({kind:'select-action',token:'pass'}));
  const p=prompt(P.regidrago,'Apex Dragon',
    [{token:'phantom',kind:'attack',publicMetadata:{sourceAttack:'Phantom Dive'}}],
    'ChooseAttackPrompt');
  const blocked=policy.decide(request({prompt:p}));
  assert.equal(workerProtocol.isAbstentionReasonCode(blocked.reasonCode),true);
  assert.equal(blocked.reasonCode,'NO_SUPPORTED_ATTACK_CHOICE');
});


function player({active=null,bench=[],discard=[],stadium=[]}={}) {
  return {active,bench,discard,stadium,publicTurnRestrictions:{
    gxUsed:false,vstarUsed:false},prizeCount:6};
}

test('target-bound DDE attachment beats single Basic on unfunded Regidrago VSTAR',()=>{
  const ownActive=pokemon(P.regidrago,{energies:[]});
  const items=[
    action('wrong-dde','play-card',P.doubleDragon,{
      targetPrinting:'Dedenne-GX UNB 57',
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}
    }),
    action('grass','play-card',P.energy,{
      targetPrinting:P.regidrago,
      publicMetadata:{targetSeat:'actor',targetZone:'active'}
    }),
    action('dde','play-card',P.doubleDragon,{
      targetPrinting:P.regidrago,
      publicMetadata:{targetSeat:'actor',targetZone:'active'}
    }),
    action('pass','pass')
  ];
  const ownPublic=player({
    active:ownActive,bench:[pokemon('Dedenne-GX UNB 57',{subtypes:['Basic','GX']})]
  });
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'dde'});
});

test('a single Basic Energy completes Apex typed cost after one DDE',()=>{
  const items=[
    action('grass','play-card',P.energy,{
      targetPrinting:P.regidrago,
      publicMetadata:{targetSeat:'actor',targetZone:'active'}
    }),
    action('pass','pass'),
    action('apex','attack',P.regidrago,{attackName:'Apex Dragon'})
  ];
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[P.doubleDragon]}),
    discard:[{printing:P.goodra}]
  });
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'grass'});
  ownPublic.active.energies.push(P.energy);
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'apex'});
});

test('Temple of Sinnoh blocks DDE typed value until stadium is replaced',()=>{
  const items=[
    action('dde','play-card',P.doubleDragon,{
      targetPrinting:P.regidrago,
      publicMetadata:{targetSeat:'actor',targetZone:'active'}
    }),
    action('parallel','play-card','Parallel City BKT 145'),
    action('pass','pass')
  ];
  const ownPublic=player({active:pokemon(P.regidrago,{energies:[P.energy]})});
  const opponentPublic=player({
    active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{subtypes:['VMAX']}),
    stadium:[{printing:'Temple of Sinnoh ASR 155'}]
  });
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items,hand:[P.doubleDragon]})),
    {kind:'select-action',token:'parallel'});
  opponentPublic.stadium=[];
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items,hand:[P.doubleDragon]})),
    {kind:'select-action',token:'dde'});
});

test('unsafe Energy root without exact target metadata never attaches blindly',()=>{
  const ownPublic=player({active:pokemon(P.regidrago,{energies:[]})});
  const items=[
    action('unbound','play-card',P.doubleDragon),
    action('fake-target','play-card',P.doubleDragon,{
      targetPrinting:P.regidrago,
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:3}
    }),
    action('pass','pass')
  ];
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'pass'});
});


test('Cynthia root starts only when a real source Supporter can be recovered',()=>{
  const items=[
    action('cc','play-card','Cynthia & Caitlin CEC 189'),
    action('pass','pass')
  ];
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[P.doubleDragon]}),
    discard:[{printing:'Crispin SCR 133'}]
  });
  assert.deepEqual(bestAction(request({ownPublic,items,hand:['Cynthia & Caitlin CEC 189']})),
    {kind:'select-action',token:'cc'});
  ownPublic.discard=[];
  assert.deepEqual(bestAction(request({ownPublic,items,hand:['Cynthia & Caitlin CEC 189']})),
    {kind:'select-action',token:'pass'});
});

test('Cynthia recovery selects only native offered useful Supporter token',()=>{
  const ownPublic=player({active:pokemon(P.regidrago,{energies:[P.doubleDragon]})});
  const p=prompt('Cynthia & Caitlin CEC 189','Cynthia & Caitlin',
    [choice('self','Cynthia & Caitlin CEC 189'),
      choice('crispin','Crispin SCR 133'),
      choice('guzma','Guzma BUS 115')],'ChooseCardsPrompt',[1,1]);
  p.publicMetadata.sourceZone='discard';
  assert.deepEqual(promptDecision(request({ownPublic,prompt:p})),
    {kind:'select-choices',tokens:['crispin']});
});

test('Cynthia optional hand discard chooses Dragon donor and never needed Double Dragon',()=>{
  const p=prompt('Cynthia & Caitlin CEC 189','Cynthia & Caitlin',
    [choice('dde',P.doubleDragon),choice('g',P.goodra),
      {token:'none',kind:'empty-selection',label:'Select none'}],
    'ChooseCardsPrompt',[0,1]);
  p.publicMetadata.sourceZone='hand';
  assert.deepEqual(promptDecision(request({prompt:p})),
    {kind:'select-choices',tokens:['g']});
  p.choices=[choice('dde',P.doubleDragon),
    {token:'none',kind:'empty-selection',label:'Select none'}];
  assert.deepEqual(promptDecision(request({prompt:p})),
    {kind:'select-choice',token:'none'});
});

test('Cynthia optional confirmation defers card discard if no donor is in hand',()=>{
  const p=prompt('Cynthia & Caitlin CEC 189','Cynthia & Caitlin',
    [{token:'yes',kind:'confirm',label:'Yes'},
      {token:'no',kind:'confirm',label:'No'}],'ConfirmPrompt');
  p.publicMetadata.selectionType='confirm';
  assert.deepEqual(promptDecision(request({prompt:p,hand:[P.doubleDragon]})),
    {kind:'select-choice',token:'no'});
  assert.deepEqual(promptDecision(request({prompt:p,hand:[P.goodra]})),
    {kind:'select-choice',token:'yes'});
});


test('Legacy Star root consumes VSTAR only with deck safety and real payload',()=>{
  const items=[
    action('star','use-ability',P.regidrago,
      {publicMetadata:{abilityName:'Legacy Star'}}),
    action('pass','pass')
  ];
  const ownPublic=player({
    active:pokemon(P.regidrago),
    discard:[{printing:P.doubleDragon}]
  });
  ownPublic.deckCount=29;
  assert.deepEqual(bestAction(request({ownPublic,items,hand:[P.energy]})),
    {kind:'select-action',token:'star'});
  ownPublic.deckCount=7;
  assert.deepEqual(bestAction(request({ownPublic,items,hand:[P.energy]})),
    {kind:'select-action',token:'pass'});
  ownPublic.deckCount=29;
  ownPublic.publicTurnRestrictions.vstarUsed=true;
  assert.deepEqual(bestAction(request({ownPublic,items,hand:[P.energy]})),
    {kind:'select-action',token:'pass'});
});

test('Legacy Star chooses funding Energy, then future gust, not copyable Dragon donors',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago),
    discard:[{printing:P.doubleDragon},{printing:P.goodra},{printing:P.dragonite},
      {printing:'Guzma BUS 115'}]
  });
  const opponentPublic=player({
    active:pokemon('Shadow Rider Calyrex VMAX CRE 75'),
    bench:[pokemon('Shadow Rider Calyrex V CRE 74')]
  });
  const p=prompt(P.regidrago,'Legacy Star',[
    choice('goodra',P.goodra),choice('dragonite',P.dragonite),
    choice('dde',P.doubleDragon),choice('guzma','Guzma BUS 115')
  ],'ChooseCardsPrompt',[0,2]);
  p.publicMetadata.sourceZone='discard';
  assert.deepEqual(promptDecision(request({ownPublic,opponentPublic,prompt:p})),
    {kind:'select-choices',tokens:['dde','guzma']});
});

test('Legacy Star up-to-two allows selecting none instead of damaging Apex discard',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago),
    discard:[{printing:P.goodra},{printing:P.dragonite}]
  });
  const p=prompt(P.regidrago,'Legacy Star',[
    choice('g',P.goodra),choice('m',P.dragonite),
    {token:'none',kind:'empty-selection',label:'Select none'}
  ],'ChooseCardsPrompt',[0,2]);
  p.publicMetadata.sourceZone='discard';
  assert.deepEqual(promptDecision(request({ownPublic,prompt:p})),
    {kind:'select-choice',token:'none'});
});

test('Legacy Star after the native mill accepts valid offers with stale prerecovery discard',()=>{
  const ownPublic=player({active:pokemon(P.regidrago),discard:[]});
  ownPublic.publicTurnRestrictions.vstarUsed=true;
  const p=prompt(P.regidrago,'Legacy Star',
    [choice('dde',P.doubleDragon)],'ChooseCardsPrompt',[0,2]);
  p.publicMetadata.sourceZone='discard';
  assert.deepEqual(promptDecision(request({ownPublic,prompt:p})),
    {kind:'select-choices',tokens:['dde']});
});


test('Super Rod root is vetoed when discard contains only needed Apex attack donors',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[P.doubleDragon,P.energy]}),
    discard:[{printing:P.goodra},{printing:P.dragonite}]
  });
  const items=[action('rod','play-card','Super Rod PAL 188'),action('pass','pass')];
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'pass'});
  ownPublic.discard.push({printing:'Regidrago VSTAR SIT 136'});
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'rod'});
});

test('Super Rod chooses Regidrago and Basic Energy, never Goodra or Mega Dragonite',()=>{
  const ownPublic=player({
    active:pokemon('Budew ASC 16'),
    discard:[{printing:P.goodra},{printing:P.dragonite},
      {printing:P.regidrago},{printing:'Fire Energy MEE 10'}]
  });
  const p=prompt('Super Rod PAL 188','Super Rod',[
    choice('g',P.goodra),choice('m',P.dragonite),
    choice('vstar',P.regidrago),choice('fire','Fire Energy MEE 10')
  ],'ChooseCardsPrompt',[0,3]);
  p.publicMetadata.sourceZone='discard';
  assert.deepEqual(promptDecision(request({ownPublic,prompt:p})).tokens.slice().sort(),
    ['fire','vstar']);
});

test('Super Rod up-to-three can recover none rather than shuffle away all attack payloads',()=>{
  const p=prompt('Super Rod PAL 188','Super Rod',[
    choice('goodra',P.goodra),choice('mega',P.dragonite),
    {token:'none',kind:'empty-selection',label:'Select none'}
  ],'ChooseCardsPrompt',[0,3]);
  p.publicMetadata.sourceZone='discard';
  assert.deepEqual(promptDecision(request({prompt:p})),
    {kind:'select-choice',token:'none'});
});


test('Apex chooses no-discard Rolling Iron KO over expensive Ryuno overkill',()=>{
  const p=prompt(P.regidrago,'Apex Dragon',[
    {token:'ryuno',publicMetadata:{sourceAttack:'Ryuno Glide'}},
    {token:'rolling',publicMetadata:{sourceAttack:'Rolling Iron'}}
  ],'ChooseAttackPrompt');
  const ownPublic=player({
    active:pokemon(P.regidrago,{
      hp:280,damage:0,energies:[P.doubleDragon,P.energy]})
  });
  const opponentPublic=player({
    active:pokemon('Wobbuffet PHF 36',{
      hp:110,damage:0,printed:{subtypes:['Basic'],weakness:[],resistance:[]}})
  });
  assert.deepEqual(promptDecision(request({ownPublic,opponentPublic,prompt:p})),
    {kind:'select-choice',token:'rolling'});
});

test('Apex Ryuno still KOs high-HP VMAX when Rolling Iron cannot',()=>{
  const p=prompt(P.regidrago,'Apex Dragon',[
    {token:'ryuno',publicMetadata:{sourceAttack:'Ryuno Glide'}},
    {token:'rolling',publicMetadata:{sourceAttack:'Rolling Iron'}}
  ],'ChooseAttackPrompt');
  const ownPublic=player({active:pokemon(P.regidrago,{
    hp:280,damage:0,energies:[P.doubleDragon,P.energy]})});
  const opponentPublic=player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
    hp:320,damage:0,printed:{subtypes:['VMAX'],weakness:[],resistance:[]}})});
  assert.deepEqual(promptDecision(request({ownPublic,opponentPublic,prompt:p})),
    {kind:'select-choice',token:'ryuno'});
});

test('Apex Rolling Iron takes advantage of known Dragon Weakness for no-cost KO',()=>{
  const p=prompt(P.regidrago,'Apex Dragon',[
    {token:'ryuno',publicMetadata:{sourceAttack:'Ryuno Glide'}},
    {token:'rolling',publicMetadata:{sourceAttack:'Rolling Iron'}}
  ],'ChooseAttackPrompt');
  const ownPublic=player({active:pokemon(P.regidrago,{
    hp:280,damage:0,energies:[P.doubleDragon,P.energy]})});
  const opponentPublic=player({active:pokemon('Example Pokemon ex TWM 2',{
    hp:320,damage:0,printed:{subtypes:['ex'],
      weakness:[{type:'Dragon',value:'×2'}],resistance:[]}})});
  assert.deepEqual(promptDecision(request({ownPublic,opponentPublic,prompt:p})),
    {kind:'select-choice',token:'rolling'});
});


test('Ryuno 330 doubles into an otherwise unreachable Dragon-weak 440 HP KO',()=>{
  const p=prompt(P.regidrago,'Apex Dragon',[
    {token:'rolling',publicMetadata:{sourceAttack:'Rolling Iron'}},
    {token:'ryuno',publicMetadata:{sourceAttack:'Ryuno Glide'}}
  ],'ChooseAttackPrompt');
  const ownPublic=player({active:pokemon(P.regidrago,{
    hp:280,energies:[P.doubleDragon,P.energy]})});
  const opponentPublic=player({active:pokemon('High HP example ex TWM 3',{
    hp:440,damage:0,printed:{subtypes:['ex'],
      weakness:[{type:'Dragon',value:'×2'}],resistance:[]}})});
  assert.deepEqual(promptDecision(request({ownPublic,opponentPublic,prompt:p})),
    {kind:'select-choice',token:'ryuno'});
});

test('a native-ineligible Rolling Iron must not suppress a legal Ryuno active KO',()=>{
  const p=prompt(P.regidrago,'Apex Dragon',[
    {token:'rolling',publicMetadata:{sourceAttack:'Rolling Iron',eligible:false}},
    {token:'ryuno',publicMetadata:{sourceAttack:'Ryuno Glide',eligible:true}}
  ],'ChooseAttackPrompt');
  const ownPublic=player({active:pokemon(P.regidrago,{
    hp:280,energies:[P.doubleDragon,P.energy]})});
  const opponentPublic=player({active:pokemon('Wobbuffet PHF 36',{
    hp:110,damage:0,printed:{subtypes:['Basic'],weakness:[],resistance:[]}})});
  assert.deepEqual(promptDecision(request({ownPublic,opponentPublic,prompt:p})),
    {kind:'select-choice',token:'ryuno'});
});


test('Counter Catcher beats attacking a nonlethal Active to win on 2-Prize Bench KO',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[P.doubleDragon,P.energy]}),
    discard:[{printing:P.goodra}]
  });
  ownPublic.prizeCount=2;
  const opponentPublic=player({
    active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
      hp:320,damage:0,printed:{subtypes:['VMAX'],weakness:[],resistance:[]}}),
    bench:[pokemon('Dedenne-GX UNB 57',{hp:160,damage:0,
      printed:{subtypes:['GX'],weakness:[],resistance:[]}})]
  });
  const items=[
    action('attack','attack',P.regidrago,{attackName:'Apex Dragon'}),
    action('counter','play-card','Counter Catcher PAR 160'),
    action('pass','pass')
  ];
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'counter'});
  opponentPublic.bench=[];
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'attack'});
});

test('native gust prompt benchIndex beats shuffled presentation selectionIndex',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[P.doubleDragon,P.energy]}),
    discard:[{printing:P.goodra}]
  });
  ownPublic.prizeCount=2;
  const opponentPublic=player({
    active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
      hp:320,damage:0,printed:{subtypes:['VMAX'],weakness:[],resistance:[]}}),
    bench:[
      pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,damage:0,
        printed:{subtypes:['VMAX'],weakness:[],resistance:[]}}),
      pokemon('Dedenne-GX UNB 57',{hp:160,damage:0,
        printed:{subtypes:['GX'],weakness:[],resistance:[]}})
    ]
  });
  const p=prompt('Counter Catcher PAR 160','Counter Catcher',[
    {token:'den',kind:'pokemon',printing:'Dedenne-GX UNB 57',
      publicMetadata:{ownerSeat:'opponent',targetZone:'bench',
        benchIndex:1,selectionIndex:0}},
    {token:'tank',kind:'pokemon',printing:'Shadow Rider Calyrex VMAX CRE 75',
      publicMetadata:{ownerSeat:'opponent',targetZone:'bench',
        benchIndex:0,selectionIndex:1}}
  ],'ChoosePokemonPrompt',[1,1]);
  p.publicMetadata.selectionType='pokemon';
  assert.deepEqual(promptDecision(request({ownPublic,opponentPublic,prompt:p})),
    {kind:'select-choices',tokens:['den']});
});

test('Guzma does not strand a sole powered Active VSTAR on the Bench',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[P.doubleDragon,P.energy]}),
    bench:[pokemon('Latias ex SSP 76')],
    discard:[{printing:P.goodra}]
  });
  const opponentPublic=player({
    active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
      hp:320,damage:0,printed:{subtypes:['VMAX'],weakness:[],resistance:[]}}),
    bench:[pokemon('Dedenne-GX UNB 57',{hp:160,damage:0,
      printed:{subtypes:['GX'],weakness:[],resistance:[]}})]
  });
  const items=[
    action('attack','attack',P.regidrago,{attackName:'Apex Dragon'}),
    action('guzma','play-card','Guzma BUS 115'),
    action('pass','pass')
  ];
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'attack'});
  ownPublic.bench=[pokemon(P.regidrago,{energies:[P.doubleDragon,P.energy]})];
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'guzma'});
});


test('one weak opponent Special Energy is not worth a singleton Megaton Blower',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[P.doubleDragon,P.energy]}),
    discard:[{printing:P.goodra}]
  });
  const opponentPublic=player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
    hp:320,damage:0,energies:[P.doubleDragon],
    printed:{subtypes:['VMAX'],weakness:[],resistance:[]}})});
  const items=[
    action('blower','play-card','Megaton Blower SSP 182'),
    action('apex','attack',P.regidrago,{attackName:'Apex Dragon'}),
    action('pass','pass')
  ];
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'apex'});
  opponentPublic.active.energies=[P.doubleDragon,P.doubleDragon,P.doubleDragon];
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'blower'});
  ownPublic.prizeCount=2;
  opponentPublic.active.hp=180;
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'apex'});
});

test('Temple suppressing own Double Dragon justifies single-use Megaton when no Stadium replacement',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[P.doubleDragon]}),
    discard:[{printing:P.goodra}]
  });
  const opponentPublic=player({
    active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320}),
    stadium:[{printing:'Temple of Sinnoh ASR 155'}]
  });
  const items=[
    action('blower','play-card','Megaton Blower SSP 182'),action('pass','pass')
  ];
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'blower'});
});

test('Muscle Band must target real ready VSTAR and cross a KO threshold',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[P.doubleDragon,P.energy]}),
    bench:[pokemon('Dedenne-GX UNB 57')],
    discard:[{printing:P.goodra}]
  });
  const opponentPublic=player({active:pokemon('Wobbuffet PHF 36',{
    hp:210,damage:0,printed:{subtypes:['Basic'],weakness:[],resistance:[]}})});
  const items=[
    action('wrong','play-card','Muscle Band XY 121',{
      targetPrinting:'Dedenne-GX UNB 57',
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}
    }),
    action('band','play-card','Muscle Band XY 121',{
      targetPrinting:P.regidrago,
      publicMetadata:{targetSeat:'actor',targetZone:'active'}
    }),
    action('attack','attack',P.regidrago,{attackName:'Apex Dragon'}),
    action('pass','pass')
  ];
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'band'});
  opponentPublic.active.hp=180;
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'attack'});
});


test('evolve the powered Regidrago V instead of the empty copy via native Bench slot',()=>{
  const ownPublic=player({
    active:pokemon('Budew ASC 16'),
    bench:[
      pokemon('Regidrago V SIT 135',{energies:[]}),
      pokemon('Regidrago V SIT 135',{energies:[P.doubleDragon,P.energy]})
    ],
    discard:[{printing:P.goodra}]
  });
  const items=[
    action('bad','play-card',P.regidrago,{
      targetPrinting:'Regidrago V SIT 135',
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}
    }),
    action('ready','play-card',P.regidrago,{
      targetPrinting:'Regidrago V SIT 135',
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:1}
    }),
    action('pass','pass')
  ];
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'ready'});
  items[1].publicMetadata.targetIndex=4;
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'bad'});
});

test('retreat support Active into ready Regidrago VSTAR rather than dead utility',()=>{
  const ownPublic=player({
    active:pokemon('Budew ASC 16'),
    bench:[
      pokemon('Latias ex SSP 76'),
      pokemon(P.regidrago,{energies:[P.doubleDragon,P.energy]})
    ],
    discard:[{printing:P.goodra}]
  });
  const items=[
    action('latias','retreat','Budew ASC 16',{
      targetPrinting:'Latias ex SSP 76',
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}
    }),
    action('regidrago','retreat','Budew ASC 16',{
      targetPrinting:P.regidrago,
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:1}
    }),
    action('pass','pass')
  ];
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'regidrago'});
  ownPublic.active=pokemon(P.regidrago,{energies:[P.doubleDragon,P.energy]});
  items.push(action('attack','attack',P.regidrago,{attackName:'Apex Dragon'}));
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'attack'});
});


test('gust Prize modeling distinguishes Mega Evolution ex and protected Legacy Energy',()=>{
  const {prizeValue}=require('../../simulation/evaluation/2026-11/agent3-rank32-regidrago-opponent-policy.cjs');
  assert.equal(prizeValue(pokemon('Mega Lucario ex MEG 77',{
    printed:{subtypes:['Stage 1','ex']}})),3);
  assert.equal(prizeValue(pokemon('Mega Lucario ex MEG 77',{
    printed:{subtypes:['Stage 1','ex']},
    energies:['Legacy Energy TWM 167']})),2);
  assert.equal(prizeValue(pokemon('Shadow Rider Calyrex VMAX CRE 75',{
    printed:{subtypes:['VMAX']}})),3);
  assert.equal(prizeValue(pokemon('Hisuian Goodra VSTAR LOR 136',{
    printed:{subtypes:['VSTAR']}})),2);
  assert.equal(prizeValue(pokemon('Budew ASC 16',{
    printed:{subtypes:['Basic']}})),1);
});


test('Megaton Blower strips Legacy Energy to turn same-turn VMAX KO into final 3 Prizes',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[P.doubleDragon,P.energy]}),
    discard:[{printing:P.dragonite}]
  });
  ownPublic.prizeCount=3;
  const opponentPublic=player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
    hp:320,damage:0,energies:['Legacy Energy TWM 167'],
    printed:{subtypes:['VMAX'],weakness:[],resistance:[]}})});
  const items=[
    action('blower','play-card','Megaton Blower SSP 182'),
    action('apex','attack',P.regidrago,{attackName:'Apex Dragon'}),
    action('pass','pass')
  ];
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'blower'});
  opponentPublic.active.energies=[];
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'apex'});
  opponentPublic.active.energies=['Legacy Energy TWM 167'];
  ownPublic.prizeCount=2;
  assert.deepEqual(bestAction(request({ownPublic,opponentPublic,items})),
    {kind:'select-action',token:'apex'});
});


test('Temple of Sinnoh suppresses Legacy prize shield: attack directly and save Megaton',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[P.energy,P.energy,'Fire Energy MEE 10']}),
    discard:[{printing:P.dragonite}]
  });
  ownPublic.prizeCount=3;
  const opponentPublic=player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
    hp:320,damage:0,energies:['Legacy Energy TWM 167'],
    printed:{subtypes:['VMAX'],weakness:[],resistance:[]}
  })});
  const items=[action('blower','play-card','Megaton Blower SSP 182'),
    action('apex','attack',P.regidrago,{attackName:'Apex Dragon'}),
    action('pass','pass')];
  const {prizeValue}=require('../../simulation/evaluation/2026-11/agent3-rank32-regidrago-opponent-policy.cjs');
  for(const seat of [0,1]){
    const root=()=>request({seat,ownPublic,opponentPublic,items});
    assert.equal(prizeValue(opponentPublic.active,root().observation),2);
    assert.deepEqual(bestAction(root()),{kind:'select-action',token:'blower'});
    opponentPublic.stadium=['Temple of Sinnoh ASR 155'];
    assert.equal(prizeValue(opponentPublic.active,root().observation),3);
    assert.deepEqual(bestAction(root()),{kind:'select-action',token:'apex'});
    opponentPublic.stadium=[];
    ownPublic.stadium=['Temple of Sinnoh ASR 155'];
    assert.equal(prizeValue(opponentPublic.active,root().observation),3);
    assert.deepEqual(bestAction(root()),{kind:'select-action',token:'apex'});
    ownPublic.stadium=[];
  }
});

test('Crispin on unfunded VSTAR uses distinct Basic Fire and Grass, not two Grass',()=>{
  const ownPublic=player({
    active:pokemon(P.regidrago,{energies:[]}),
    discard:[{printing:P.goodra}]
  });
  const items=[action('crispin','play-card','Crispin SCR 133'),
    action('pass','pass')];
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'crispin'});
  ownPublic.active.energies=[P.doubleDragon,P.energy];
  assert.deepEqual(bestAction(request({ownPublic,items})),
    {kind:'select-action',token:'pass'});
  const p=prompt('Crispin SCR 133','Crispin',[
    choice('grass1',P.energy),choice('grass2',P.energy),
    choice('fire','Fire Energy MEE 10'),choice('metal','Metal Energy MEE 8')
  ],'ChooseCardsPrompt',[1,2]);
  p.publicMetadata.sourceZone='deck';
  assert.deepEqual(promptDecision(request({ownPublic,prompt:p})),
    {kind:'select-choices',tokens:['fire','grass1']});
  p.publicMetadata.minimumCount=2;
  p.choices=[choice('g1',P.energy),choice('g2',P.energy)];
  assert.deepEqual(promptDecision(request({ownPublic,prompt:p})),
    {kind:'abstain',reasonCode:'RANK32_CRISPIN_NO_DISTINCT_BASIC_TYPES'});
});

test('Crispin Native Pokemon target resolves benchIndex, not selectionIndex',()=>{
  const ownPublic=player({
    active:pokemon('Budew ASC 16'),
    bench:[
      pokemon('Latias ex SSP 76'),
      pokemon(P.regidrago,{energies:[]})
    ]
  });
  const p=prompt('Crispin SCR 133','Crispin',[
    {token:'regi',kind:'pokemon',printing:P.regidrago,
      publicMetadata:{ownerSeat:'actor',targetZone:'bench',
        benchIndex:1,selectionIndex:0}},
    {token:'lat',kind:'pokemon',printing:'Latias ex SSP 76',
      publicMetadata:{ownerSeat:'actor',targetZone:'bench',
        benchIndex:0,selectionIndex:1}}
  ],'ChoosePokemonPrompt',[1,1]);
  p.publicMetadata.selectionType='pokemon';
  assert.deepEqual(promptDecision(request({ownPublic,prompt:p})),
    {kind:'select-choices',tokens:['regi']});
});
