'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const contract=require('../../simulation/twinleaf/actor-observation-contract.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const worker=require('../../simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs');

// Real pinned Twinleaf CardType enum values, not synthetic string labels.
// card-types.ts @ a9905a76: GRASS=1, PSYCHIC=5, DARK=7,
// COLORLESS=9, FAIRY=10, DRAGON=11.
const PSY=5,COLORLESS=9,DRAGON=11,DARK=7;
const FOG='Fog Crystal CRE';
const PSY_ENERGY='Psychic Energy SVE';
const PATH='Path to the Peak CRE';
const profiles=[
  {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',
    deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
  {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',
    deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
const card=fullName=>({fullName});
function nativeSlot({fullName,name,types,hp,subtypes,damage=0,
  energies=[],attacks=[],powers=[],weakness=[],resistance=[]}){
  // Faithful pinned shape: Card exposes `tags`, PokemonCard exposes numeric
  // `stage`; there is no trustworthy native `subtypes` field.
  const stage=subtypes.includes('VMAX')?5:subtypes.includes('VSTAR')?6:2;
  const tags=subtypes.filter(t=>!['Basic','Stage 1','Stage 2'].includes(t));
  const pokemon={fullName,name,cardType:types,hp,
    stage,tags,retreat:[COLORLESS],
    weakness,resistance,attacks,powers};
  return {cards:[pokemon],getPokemonCard(){return pokemon;},damage,
    pokemonPlayedTurn:1,abilityLockActivationOrder:0,energies:{cards:energies.map(card)},
    tools:[],specialConditions:[]};
}
function emptySlot(){
  return {cards:[],getPokemonCard(){return null;},damage:0,
    energies:{cards:[]},tools:[],specialConditions:[]};
}
function nativePlayer(id,{own=false}={}){
  const active=own?nativeSlot({
    fullName:'Shadow Rider Calyrex VMAX CRE',name:'Shadow Rider Calyrex VMAX',
    types:[PSY],hp:320,subtypes:['V','VMAX'],
    energies:Array(5).fill(PSY_ENERGY),
    attacks:[{name:'Max Geist',cost:[COLORLESS,COLORLESS,COLORLESS],
      damage:'10+',damageCalculation:null,text:null,gxAttack:false,barrage:false}],
    powers:[{name:'Underworld Door',powerType:'ABILITY',text:null}],
    weakness:[{type:DARK}]
  }):nativeSlot({
    fullName:'Regidrago VSTAR SIT',name:'Regidrago VSTAR',
    types:[DRAGON],hp:280,subtypes:['VSTAR'],damage:120,
    powers:[{name:'Legacy Star',powerType:'ABILITY',text:null}],
    weakness:[{type:10}],
    attacks:[{name:'Apex Dragon',cost:[1,1,2],
      damage:'',damageCalculation:null,text:null,gxAttack:false,barrage:false}]
  });
  const bench=own?[]:[nativeSlot({
    fullName:'Regidrago V SIT',name:'Regidrago V',
    types:[DRAGON],hp:220,subtypes:['V'],
    attacks:[{name:'Celestial Roar',cost:[1],damage:'0',damageCalculation:null,
      text:null,gxAttack:false,barrage:false}]
  })];
  const hidden=()=>({get fullName(){throw Error('Should never read a face-down Prize identity');}});
  return {id,active,bench:[...bench,...Array(5-bench.length).fill(null).map(emptySlot)],
    hand:{cards:own?[card(FOG)]:[],isPublic:false},
    deck:{cards:Array(30).fill(null).map((_,i)=>({fullName:'deck '+i}))},
    discard:{cards:[]},lostzone:{cards:[]},supporter:{cards:[]},
    stadium:{cards:own?[card(PATH)]:[],stadiumDirection:null},
    prizes:Array.from({length:own?2:6},()=>({cards:[hidden()],faceUpPrize:false})),
    usedGX:false,usedVSTAR:false,legacyEnergyUsed:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0,supporterTurn:0,retreatedTurn:0,
    energyPlayedTurn:false,stadiumPlayedTurn:false,stadiumUsedTurn:false};
}
function request(seat,view){
  return {role:'candidate',seat,observation:view,prompt:null,publicEventReceipt:null,
    actionFrontier:{items:[
      {kind:'play-card',token:'fog',actorPrinting:FOG,publicMetadata:{}},
      {kind:'attack',token:'hit',attackName:'Max Geist'},
      {kind:'pass',token:'pass'}
    ]}};
}
for(const seat of [0,1]){
  test('pinned numeric Twinleaf enum projection reaches a legal final-attack policy, physical seat '+seat,()=>{
    const state={players:[0,1].map(i=>nativePlayer(i,{own:i===seat})),
      activePlayer:seat,turn:4,phase:2,prompts:[]};
    const view=contract.actorObservation(state,seat);
    assert.deepEqual(view.ownPublic.active.printed.types,['Psychic']);
    assert.ok(view.ownPublic.active.printed.subtypes.includes('VMAX'));
    assert.ok(view.ownPublic.active.printed.subtypes.includes('V'));
    assert.ok(view.opponentPublic.active.printed.subtypes.includes('VSTAR'));
    assert.ok(view.opponentPublic.bench[0].printed.subtypes.includes('Basic'));
    assert.deepEqual(view.ownPublic.active.printed.retreatCost,['Colorless']);
    assert.deepEqual(view.ownPublic.active.printed.weakness,[{type:'Darkness',value:2}]);
    assert.equal(worker.__test.weaknessMultiplier(
      {printed:{types:['Darkness']}},view.ownPublic.active,view,'opponent'),2,
      'Pinned absent Weakness.value means x2 rather than no Weakness');
    assert.deepEqual(view.ownPublic.active.attacks[0].cost,['Colorless','Colorless','Colorless']);
    assert.deepEqual(view.opponentPublic.active.printed.types,['Dragon']);
    assert.deepEqual(view.opponentPublic.active.printed.weakness,[{type:'Fairy',value:2}]);
    assert.doesNotThrow(()=>protocol.validateActorObservation(view,seat));
    for(const profile of profiles){
      const policy=worker.createPolicy({role:'candidate',seat,
        policyVersion:worker.POLICY_VERSION,config:profile});
      const root=request(seat,view);
      const envelope={...root,schema:protocol.REQUEST_SCHEMA,type:'decision',
        requestId:'native-shape-'+seat+'-'+profile.profileId,sequence:0,
        observationSchema:protocol.OBSERVATION_SCHEMA,
        actionFrontier:{...root.actionFrontier,schema:protocol.FRONTIER_SCHEMA}};
      const registered={role:'candidate',seat,policyVersion:worker.POLICY_VERSION,
        config:profile};
      const admissible=protocol.validateRequest(envelope,registered,0,new Set());
      assert.deepEqual([...admissible.actionTokens].sort(),['fog','hit','pass']);
      const result=policy.decideWithAudit(root);
      assert.deepEqual(result.decision,{kind:'select-action',token:'hit'});
      assert.equal(result.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
      // Explicit comparison to the previously emitted raw numeric enums:
      // the policy's string-based cost preflight could not evaluate that hit.
      const legacy=JSON.parse(JSON.stringify(view));
      legacy.ownPublic.active.printed.types=[PSY];
      legacy.ownPublic.active.printed.retreatCost=[COLORLESS];
      legacy.ownPublic.active.attacks[0].cost=[COLORLESS,COLORLESS,COLORLESS];
      legacy.opponentPublic.active.printed.types=[DRAGON];
      assert.deepEqual(policy.decideWithAudit(request(seat,legacy)).decision,
        {kind:'select-action',token:'fog'});
    }
  });
}
