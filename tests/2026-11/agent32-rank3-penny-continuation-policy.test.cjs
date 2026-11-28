'use strict';
/**
 * Pre-native rank3 policy ABI witness. Use with the PR86-based Agent32 branch,
 * which includes the later current-main select-choices worker contract.
 * Separate from the full pinned Store/ActionEnumerator continuation test.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const rank3=require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');

const pokemon=(printing,damage=0)=>({
  printing,name:printing.split(' ').slice(0,-2).join(' '),damage,
  energies:[],tools:[],printed:{stage:'BASIC',subtypes:['Basic'],types:[],retreatCost:[]}
});
const ownActive=()=>pokemon('Snorlax PGO 55',70);
const stunfisk=damage=>pokemon('Galarian Stunfisk SSH 132',damage);
const snorlax=damage=>pokemon('Snorlax PGO 55',damage);
const actionFrontier={schema:'aichi-action-frontier-v1',items:[
  {kind:'play-card',token:'penny',actorPrinting:'Penny SVI 183',
    publicMetadata:{cardType:'supporter'}},
  {kind:'play-card',token:'handi',actorPrinting:"Team Rocket's Handiwork FCO 112",
    publicMetadata:{cardType:'supporter'}},
  {kind:'pass',token:'pass'}
]};
function root(seat,bench){
  return {role:'opponent',seat,prompt:null,publicEventReceipt:null,
    observation:{
      actorSeat:seat,
      ownHand:['Penny SVI 183',"Team Rocket's Handiwork FCO 112"],
      ownTurnResources:{supporterPlayedTurn:0},
      ownPublic:{active:ownActive(),bench,deckCount:50,discard:[],lostZone:[],
        publicTurnRestrictions:{supporterPlayLocked:false}},
      opponentPublic:{active:null,bench:[],deckCount:40}
    },actionFrontier};
}
function promptFor(benchPrinting,benchIndex=0){
  return {promptType:'ChoosePokemonPrompt',
    source:{sourcePrinting:'Penny SVI 183',effectName:'Penny'},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
    choices:[
      {token:'active',kind:'pokemon',printing:'Snorlax PGO 55',
        publicMetadata:{ownerSeat:'actor',targetZone:'active',slotIndex:0}},
      {token:'bench',kind:'pokemon',printing:benchPrinting,
        publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex}}
    ]};
}
for(const seat of [0,1]){
  test('rank3 Penny root rejects Active-only damaged target, seat '+seat,()=>{
    const policy=rank3.createPolicy({role:'opponent',seat,
      policyVersion:rank3.POLICY_VERSION,config:{}});
    const req=root(seat,[stunfisk(0)]);
    assert.deepEqual(policy.decide(req),{kind:'select-action',token:'handi'});
    assert.deepEqual(policy.decide({...req,
      prompt:promptFor('Galarian Stunfisk SSH 132')}),
      {kind:'abstain',reasonCode:'NO_VISIBLE_POKEMON_TARGET'});
  });
  test('rank3 same-print Active vs damaged Bench Snorlax is slot-specific, seat '+seat,()=>{
    const policy=rank3.createPolicy({role:'opponent',seat,
      policyVersion:rank3.POLICY_VERSION,config:{}});
    const req=root(seat,[snorlax(90)]);
    assert.deepEqual(policy.decide(req),{kind:'select-action',token:'penny'});
    const choices=promptFor('Snorlax PGO 55');
    assert.deepEqual(policy.decide({...req,prompt:choices}),
      {kind:'select-choices',tokens:['bench']});
    const mistaken={...req.observation,
      ownPublic:{...req.observation.ownPublic,
        bench:[snorlax(0)]}};
    assert.deepEqual(policy.decide({...req,observation:mistaken}),
      {kind:'select-action',token:'handi'});
  });
  test('rank3 distinct-print damaged Stunfisk Penny is fully selectable, seat '+seat,()=>{
    const policy=rank3.createPolicy({role:'opponent',seat,
      policyVersion:rank3.POLICY_VERSION,config:{}});
    const req=root(seat,[stunfisk(50)]);
    assert.deepEqual(policy.decide(req),{kind:'select-action',token:'penny'});
    assert.deepEqual(policy.decide({...req,
      prompt:promptFor('Galarian Stunfisk SSH 132')}),
      {kind:'select-choices',tokens:['bench']});
  });
}


for(const seat of [0,1]){
  test('rank3 gust ranks identical-print opponent Benches by real slot Energy, seat '+seat,()=>{
    const policy=rank3.createPolicy({role:'opponent',seat,
      policyVersion:rank3.POLICY_VERSION,config:{}});
    const dra=energyCount=>({...pokemon('Regidrago V SIT 135',0),
      energies:Array(energyCount).fill('Psychic Energy MEE 13')});
    const req=root(seat,[stunfisk(0)]);
    req.observation.opponentPublic={
      active:dra(0),bench:[dra(0),dra(3)],deckCount:40
    };
    req.prompt={promptType:'ChoosePokemonPrompt',
      source:{sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
      choices:[
        {token:'bench0',kind:'pokemon',printing:'Regidrago V SIT 135',
          publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}},
        {token:'bench1',kind:'pokemon',printing:'Regidrago V SIT 135',
          publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:1}}
      ]};
    assert.deepEqual(policy.decide(req),
      {kind:'select-choices',tokens:['bench1']});
  });
  test('rank3 own switch ranks identical-print Bench Snorlax by real slot Tool, seat '+seat,()=>{
    const policy=rank3.createPolicy({role:'opponent',seat,
      policyVersion:rank3.POLICY_VERSION,config:{}});
    const req=root(seat,[snorlax(0),{
      ...snorlax(0),tools:['Tool Jammer BST 136']
    }]);
    req.prompt={promptType:'ChoosePokemonPrompt',
      source:{sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
      choices:[
        {token:'bench0',kind:'pokemon',printing:'Snorlax PGO 55',
          publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
        {token:'bench1',kind:'pokemon',printing:'Snorlax PGO 55',
          publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}
      ]};
    assert.deepEqual(policy.decide(req),
      {kind:'select-choices',tokens:['bench1']});
  });
}


for(const seat of [0,1]){
  test('rank3 native root retreat scores each identical-print Bench by targetIndex, seat '+seat,()=>{
    const req=root(seat,[snorlax(0),{
      ...snorlax(0),tools:['Tool Jammer BST 136']
    }]);
    const base={kind:'retreat',token:'retreat',
      targetPrinting:'Snorlax PGO 55'};
    const scoreAt=index=>rank3.scoreAction({
      ...base,publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:index}
    },req);
    assert.equal(scoreAt(0),110);
    assert.equal(scoreAt(1),180);
    assert.equal(rank3.scoreAction({...base,targetPrinting:'Snorlax PGO 999',
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:1}},req),5);
  });
  test('rank3 Capture Energy Bench action is not misread as identical-print Active, seat '+seat,()=>{
    const req=root(seat,[snorlax(0),snorlax(0)]);
    const base={kind:'play-card',token:'energy',
      actorPrinting:'Capture Energy RCL 171',
      targetPrinting:'Snorlax PGO 55'};
    const score=(zone,index)=>rank3.scoreAction({...base,publicMetadata:{
      cardType:'energy',targetSeat:'actor',targetZone:zone,targetIndex:index
    }},req);
    assert.equal(score('active',0),150);
    assert.equal(score('bench',0),105);
    assert.equal(score('bench',1),105);
  });
}
