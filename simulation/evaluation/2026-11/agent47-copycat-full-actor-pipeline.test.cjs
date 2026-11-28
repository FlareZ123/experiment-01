'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {actorObservation}=
  require('../../twinleaf/actor-observation-contract.cjs');
const {installCopycatMultiAttackHistory}=
  require('../../twinleaf/copycat-multiattack-history.cjs');
const {copycatPublicEventReceipt}=
  require('../../twinleaf/agent47-copycat-v3-receipt-bridge.cjs');
const {validatePublicEventReceipt}=
  require('./agent49-policy-protocol.cjs');
const {createPolicy,POLICY_VERSION}=
  require('./agent46-candidate-policy.cjs');
const {AttackAction}=
  require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions');

const psychic={name:'Basic Psychic Energy',fullName:'Psychic Energy CRE'};
const simpleCard=(name,fullName,attacks,hp,types,subtypes=['Basic'])=>({
  name,fullName,attacks,powers:[],hp,cardType:types,stage:subtypes[0],
  weakness:[],resistance:[],retreat:['Colorless'],tags:[],
  hasTag:()=>false
});
const copycat=simpleCard('Mimikyu','Mimikyu GRI',[
  {name:'Copycat',cost:['Psychic','Colorless'],damage:0,
    text:"If your opponent's Pokémon used an attack that is not a GX attack during their last turn, use it as this attack."}
],70,['Psychic']);
const regi=simpleCard('Regidrago VSTAR','Regidrago VSTAR SIT',[
  {name:'Apex Dragon',cost:['Grass','Grass','Fire'],damage:0,
    copycatAttack:true}
],280,['Dragon'],['VSTAR']);
const dialga=simpleCard('Dialga-GX','Dialga-GX UPR',[
  {name:'Timeless-GX',cost:['Metal','Metal','Metal','Colorless','Colorless'],
    damage:150,gxAttack:true}],180,['Dragon']);
const radiant=simpleCard('Radiant Eternatus','Radiant Eternatus CRZ',[
  {name:'Power Beam',cost:['Fire','Dark','Colorless'],damage:200}
],170,['Dragon']);

function slot(card,energies=[],damage=0){
  return {getPokemonCard:()=>card,cards:[card],
    energies:{cards:energies},tools:[],damage,
    marker:{hasMarker:()=>false}};
}
const empty={cards:[]};
const zone=cards=>({cards});
const prize=()=>({cards:[{name:'unknown'}],faceUpPrize:false});
function player(id,active){
  return {id,active,bench:[],stadium:zone([]),
    discard:zone([]),lostzone:zone([]),supporter:zone([]),
    hand:zone([]),deck:zone([{name:'unknown'}]),
    prizes:Array.from({length:6},prize),
    usedGX:false,usedVSTAR:false,usedTurnSkip:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0,
    supporterTurn:0,retreatedTurn:0,energyPlayedTurn:0,
    stadiumPlayedTurn:0,stadiumUsedTurn:0,
    movedToActiveThisTurn:[],marker:{hasMarker:()=>false},
    pokemonKnockedOutDuringOpponentsLastTurn:true,
    pokemonKnockedOutByAttackDuringOpponentsLastTurn:true};
}
function stage(seat){
  const actor=player(seat===0?'A':'B',slot(copycat,[psychic,psychic]));
  actor.discard.cards.push(dialga,radiant);
  const opponent=player(seat===0?'B':'A',slot(regi,[
    {name:'Double Dragon Energy',fullName:'Double Dragon Energy ROS'},
    {name:'Double Dragon Energy',fullName:'Double Dragon Energy ROS'}
  ]));
  const state={players:[],turn:2,phase:3,prompts:[],activePlayer:1-seat};
  state.players[seat]=actor;
  state.players[1-seat]=opponent;
  const store={state,dispatch(action){
    if(action instanceof AttackAction) {
      assert.equal(action.clientId,state.players[state.activePlayer].id);
    } else assert.equal(action?.kind,'pass');
    state.turn++;
    state.activePlayer=Number.isSafeInteger(action?.nextSeat)?
      action.nextSeat:1-state.activePlayer;
    return state;
  }};
  const original=store.dispatch;
  const tracker=installCopycatMultiAttackHistory(store);
  return {actor,opponent,state,store,tracker,original,seat};
}
const worker=seat=>createPolicy({role:'candidate',seat,
  policyVersion:POLICY_VERSION,config:{}});
function decide(s,prompt,effect){
  const view=actorObservation(s.state,s.seat);
  const receipt=copycatPublicEventReceipt(s.state,s.seat,s.tracker);
  assert.equal(receipt.priorOpponentTurnKO.any,null,
    'Native stale KO marker must never be trusted');
  validatePublicEventReceipt(receipt,view);
  if(prompt===null){
    assert.equal(view.decisionKind,'owner-root');
    return worker(s.seat).decide({
      role:'candidate',seat:s.seat,
      observation:view,prompt:null,publicEventReceipt:receipt,
      actionFrontier:{items:[
        {kind:'attack',token:'copycat-action',attackName:'Copycat'},
        {kind:'pass',token:'pass-action'}
      ]}
    });
  }
  assert.equal(view.decisionKind,'owner-prompt');
  return worker(s.seat).decide({
    role:'candidate',seat:s.seat,
    observation:view,publicEventReceipt:receipt,
    prompt:{actingSeat:s.seat,promptType:'ChooseAttackPrompt',
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Mimikyu GRI',effectName:effect},
      choices:prompt.map(([name,token])=>({
        kind:'attack',token,publicMetadata:{sourceAttack:name,
          sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true}
      }))}
  });
}
function setPrompt(s,has){
  s.state.prompts=has?[{
    playerId:s.actor.id,result:undefined,
    constructor:{name:'ChooseAttackPrompt'}
  }]:[];
}

for(const seat of [0,1]){
  test('seat '+seat+' authenticated Apex → paid Copycat Timeless → own extra Copycat Power Beam',()=>{
    const s=stage(seat);
    try{
      // Actual Store *event history* observer sees printed Regidrago Apex.
      s.store.dispatch(new AttackAction(s.opponent.id,'Apex Dragon'));
      assert.equal(s.state.turn,3);
      const before=copycatPublicEventReceipt(s.state,seat,s.tracker);
      assert.equal(before.opponentCopycatChoices.length,1);
      assert.equal(before.opponentCopycatChoices[0].attackName,'Apex Dragon');
      assert.equal(before.opponentCopycatChoices[0].copycatAttack,true);
      assert.deepEqual(decide(s,null),{kind:'select-action',token:'copycat-action'});

      // The native engine would prompt for Dragon discard source after
      // Copycat delegated Apex. The actor sees only its own discard cards.
      setPrompt(s,true);
      assert.deepEqual(decide(s,[['Power Beam','power'],['Timeless-GX','time']],
        'Apex Dragon'),{kind:'select-choice',token:'time'});
      setPrompt(s,false);

      // Synthetic public effect outcome of a successful printed Timeless-GX:
      // 150 damage to Regidrago, GX spent, and consecutive actor turn.
      s.actor.usedGX=true;
      s.actor.usedTurnSkip=true;
      s.opponent.active.damage=150;
      const copiedFirst=new AttackAction(s.actor.id,'Copycat');
      copiedFirst.nextSeat=seat;
      s.store.dispatch(copiedFirst);
      assert.equal(s.state.turn,4);
      assert.equal(s.state.activePlayer,seat);
      const publicView=actorObservation(s.state,seat);
      assert.equal(publicView.ownTurnResources.extraTurnActive,true);
      assert.equal(publicView.ownPublic.publicTurnRestrictions.gxUsed,true);

      const follow=copycatPublicEventReceipt(s.state,seat,s.tracker);
      assert.equal(follow.opponentLastTurnTurn,2);
      assert.equal(follow.opponentCopycatChoices.length,1);
      assert.deepEqual(decide(s,null),
        {kind:'select-action',token:'copycat-action'});
      setPrompt(s,true);
      assert.deepEqual(decide(s,[['Apex Dragon','apex'],['Foul Play','foul']],
        'Copycat'),{kind:'select-choice',token:'apex'});
      assert.deepEqual(decide(s,[['Timeless-GX','time'],['Power Beam','power']],
        'Apex Dragon'),{kind:'select-choice',token:'power'});
      setPrompt(s,false);
      assert.equal(s.opponent.active.damage+200>=regi.hp,true);
    }finally{s.tracker.restore();}
    assert.strictEqual(s.store.dispatch,s.original);
  });

  test('seat '+seat+' opponent extra without an Apex supersedes previous history',()=>{
    const s=stage(seat);
    try{
      const apexAction=new AttackAction(s.opponent.id,'Apex Dragon');
      apexAction.nextSeat=1-seat; // opponent earns extra turn
      s.store.dispatch(apexAction);
      s.store.dispatch({kind:'pass',nextSeat:seat});
      assert.equal(s.state.turn,4);
      const receipt=copycatPublicEventReceipt(s.state,seat,s.tracker);
      assert.equal(receipt.opponentLastTurnTurn,3);
      assert.deepEqual(receipt.opponentCopycatChoices,[]);
      assert.deepEqual(decide(s,null),{kind:'select-action',token:'pass-action'});
    }finally{s.tracker.restore();}
  });
}
