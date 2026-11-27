'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const field=require('../../results/aichi-2026/full-decklists.json');
const rank14=require('../../simulation/evaluation/2026-11/agent3-rank14-regidrago-opponent-policy.cjs');

const R='Regidrago VSTAR SIT 136';
const E='Double Dragon Energy ROS 97';
function pokemon(printing,add={}){return {printing,energies:[],tools:[],printed:{subtypes:['VSTAR']},...add};}
function board({active=pokemon(R),bench=[],discard=[],stadium=[]}={}){
  return {active,bench,discard,stadium,prizeCount:6,
    publicTurnRestrictions:{gxUsed:false,vstarUsed:false}};
}
function request({
  own=board(),opponent=board({active:pokemon('Shadow Rider Calyrex VMAX CRE 75')}),
  hand=[],items=[],prompt=null,seat=0,turn=3,receipt=null
}={}){
  return {
    role:'opponent',seat,publicEventReceipt:receipt,
    observation:{
      actorSeat:seat,globalTurn:turn,phase:2,ownHand:hand,ownPublic:own,
      opponentPublic:opponent,ownTurnResources:{supporterPlayedTurn:0}
    },prompt,actionFrontier:{items}
  };
}
function action(token,kind,printing,extra={}){return {token,kind,actorPrinting:printing,...extra};}
function setupPrompt(hand){
  return {
    promptType:'ChooseCardsPrompt',description:'CHOOSE_STARTING_POKEMONS',
    source:{classification:'actor-choice',sourceKind:'engine',
      sourcePrinting:null,effectName:'CHOOSE_STARTING_POKEMONS'},
    publicMetadata:{
      selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,minimumCount:1,maximumCount:hand.length,
      allowCancel:false,isSecret:false
    },choices:hand.map((printing,i)=>({
      token:'s'+i,kind:'card',printing,
      publicMetadata:{sourceZone:'hand',ownerSeat:'actor',
        isOwnerVisible:true,selectionIndex:i,selectedCount:1}
    }))
  };
}
function confirm(name){
  return {
    promptType:'ConfirmPrompt',
    description:name,source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Squawkabilly ex PAL 169',effectName:name},
    publicMetadata:{selectionType:'confirm'},
    choices:[{token:'yes',kind:'confirm',label:'Yes'},
      {token:'no',kind:'confirm',label:'No'}]
  };
}

test('rank14 source contains exactly 21 Pokemon, 29 Trainers, 10 Energy and distinct Sky Field',()=>{
  const src=field.decks.find(x=>x.rank===14);
  assert.equal(rank14.SOURCE_RANK,14);
  assert.equal(rank14.POLICY_VERSION,'agent3-rank14-regidrago-opponent-v1');
  assert.equal(src.cards.reduce((n,x)=>n+x.count,0),60);
  assert.equal(src.cards.filter(x=>x.category==='Pokémon').reduce((n,x)=>n+x.count,0),21);
  for(const name of ['Sky Field','Squawkabilly ex','Oricorio-GX','Sudowoodo','Mega Dragonite ex','Hisuian Goodra VSTAR']){
    assert.equal(src.cards.find(c=>c.name===name)?.count,1);
  }
  for(const name of ['Stealthy Hood','Cynthia & Caitlin','Silent Lab','Koraidon ex']){
    assert.equal(src.cards.some(c=>c.name===name),false);
  }
});

test('native Sky Field root unlocks congested Bench only with real supporting Basics',()=>{
  const five=Array.from({length:5},(_,i)=>pokemon(i===0?'Regidrago V SIT 135':'Budew ASC 16'));
  const items=[action('sky','play-card','Sky Field ROS 89'),action('pass','pass')];
  const own=board({bench:five});
  const hand=['Sky Field ROS 89','Squawkabilly ex PAL 169','Tapu Lele-GX GRI 60'];
  assert.deepEqual(rank14.bestAction(request({own,hand,items})),
    {kind:'select-action',token:'sky'});
  hand.splice(1,2);
  assert.deepEqual(rank14.bestAction(request({own,hand,items})),
    {kind:'select-action',token:'pass'});
  own.bench.pop();
  assert.deepEqual(rank14.bestAction(request({own,hand,items})),
    {kind:'select-action',token:'pass'});
});

test('turn-one Squawkabilly play and Squawk and Seize beat pass only on low hand',()=>{
  const items=[action('squawk','play-card','Squawkabilly ex PAL 169'),
    action('pass','pass')];
  assert.deepEqual(rank14.bestAction(request({turn:2,hand:['Guzma BUS 115'],items})),
    {kind:'select-action',token:'squawk'});
  assert.deepEqual(rank14.bestAction(request({turn:4,hand:['Guzma BUS 115'],items})),
    {kind:'select-action',token:'pass'});
  const ability=[action('squawk','use-ability','Squawkabilly ex PAL 169',
    {publicMetadata:{abilityName:'Squawk and Seize'}}),action('pass','pass')];
  assert.deepEqual(rank14.bestAction(request({turn:1,hand:['Grass Energy MEE 9'],items:ability})),
    {kind:'select-action',token:'squawk'});
});

test('turn-one Squawk setup and activation both preserve protected DDE',()=>{
  const options=[action('sq','play-card','Squawkabilly ex PAL 169'),
    action('pass','pass')];
  const protectedHand=[E,'Quick Ball FST 237'];
  assert.deepEqual(rank14.bestAction(request({turn:1,hand:protectedHand,items:options})),
    {kind:'select-action',token:'pass'});
  const cp=confirm('Squawk and Seize');
  assert.deepEqual(rank14.promptDecision(request({turn:1,hand:protectedHand,prompt:cp})),
    {kind:'select-choice',token:'no'});
  assert.deepEqual(rank14.promptDecision(request({turn:1,hand:['Grass Energy MEE 9'],prompt:cp})),
    {kind:'select-choice',token:'yes'});
});

test('Oricorio-GX Dance of Tribute only after publicly known prior opponent-turn KO',()=>{
  const items=[action('ori','play-card','Oricorio-GX CEC 95'),
    action('pass','pass')];
  const receipt={priorOpponentTurnKO:{any:true}};
  assert.deepEqual(rank14.bestAction(request({turn:5,receipt,items})),
    {kind:'select-action',token:'ori'});
  assert.deepEqual(rank14.bestAction(request({turn:5,items})),
    {kind:'select-action',token:'pass'});
  const cp=confirm('Dance of Tribute');
  assert.deepEqual(rank14.promptDecision(request({receipt,prompt:cp})),
    {kind:'select-choice',token:'yes'});
  assert.deepEqual(rank14.promptDecision(request({prompt:cp})),
    {kind:'select-choice',token:'no'});
});

test('Sudowoodo Roadblock offered only against wide opposing Bench',()=>{
  const options=[action('sud','play-card','Sudowoodo GRI 66'),action('pass','pass')];
  const opp=board({bench:Array.from({length:4},()=>pokemon('Shadow Rider Calyrex V CRE 74'))});
  assert.deepEqual(rank14.bestAction(request({opponent:opp,items:options})),
    {kind:'select-action',token:'sud'});
  opp.bench.pop();opp.bench.pop();
  assert.deepEqual(rank14.bestAction(request({opponent:opp,items:options})),
    {kind:'select-action',token:'pass'});
});

test('Professor Research not chosen if initial hand large',()=>{
  const options=[action('research','play-card',"Professor's Research JTG 155"),
    action('pass','pass')];
  assert.deepEqual(rank14.bestAction(request({hand:['one','two','three','four','five'],items:options})),
    {kind:'select-action',token:'research'});
  // Remains a legal option, but has low urgency when the hand is already healthy.
  assert.equal(rank14.rank14RootScore(options[0],request({hand:[E,'one','two']})),0);
});

test('identical Regidrago donor root works on rank14 after Goodra is discarded',()=>{
  const own=board({discard:[{printing:'Hisuian Goodra VSTAR LOR 136'}]});
  const items=[action('apex','attack',R,{attackName:'Apex Dragon'}),action('pass','pass')];
  assert.deepEqual(rank14.bestAction(request({own,items})),
    {kind:'select-action',token:'apex'});
});

test('rank14 setup keeps Squawkabilly, Oricorio and Tapu Lele as future on-play utilities',()=>{
  const hand=['Squawkabilly ex PAL 169','Oricorio-GX CEC 95',
    'Regidrago V SIT 135','Tapu Lele-GX GRI 60','Latias ex SSP 76'];
  const req=request({own:board({active:null,bench:[null,null,null,null,null]}),
    turn:1,hand,prompt:setupPrompt(hand)});
  req.observation.phase=1;
  assert.deepEqual(rank14.promptDecision(req),{kind:'select-choices',tokens:['s2','s4']});
});

test('rank14 factory binds both seats without drawing RNG',()=>{
  for(const seat of [0,1]){
    let draws=0;
    const p=rank14.createPolicy({role:'opponent',seat,
      policyVersion:rank14.POLICY_VERSION,config:{},
      rng:()=>{draws++;return 0.5;}});
    assert.deepEqual(p.decide(request({seat,items:[action('pass','pass')]})),
      {kind:'select-action',token:'pass'});
    assert.equal(draws,0);
    assert.deepEqual(p.decide(request({seat:1-seat,items:[action('pass','pass')]})),
      {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'});
  }
});
