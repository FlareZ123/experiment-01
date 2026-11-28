'use strict';
/*
 * Source-identity-bound rank30 policy decisions, not native Store results.
 * Missing ordinary Bench roles: Tapu Lele-GX, Mimikyu, Empoleon V, Dialga-GX.
 * These are deliberately preserved except for an offered terminal Rondo.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const worker=require('./agent8-rank30-clefairy-opponent-policy.cjs');
const CLEF="Lillie's Clefairy ex JTG 56";
const TECHS=['Mimikyu GRI 58','Dialga-GX UPR 100','Empoleon V BST 40'];
const BASE_BENCH=['Unown AOR 30','Latias ex SSP 76','Dedenne-GX UNB 57',
  'Crobat V DAA 104','Fezandipiti ex ASC 142'];
function state(seat,{prizes=3,stadium=false,attack=true,techs=TECHS,hp=220}={}) {
  const hand=[...(stadium?[]:['Sky Field ROS 89']),...techs];
  const items=hand.map((actorPrinting,i)=>({kind:'play-card',
    actorPrinting,token:'play-'+i}));
  if(attack)items.push({kind:'attack',actorPrinting:CLEF,
    attackName:'Full Moon Rondo',token:'rondo'});
  items.push({kind:'pass',token:'pass'});
  return {role:'opponent',seat,prompt:null,
    observation:{actorSeat:seat,globalTurn:4,ownHand:hand,
      ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:0,vstarUsed:true,
        pokemonPlayLocked:false},
      ownPublic:{active:{printing:CLEF,energies:['Psychic Energy MEE 13',
        'Psychic Energy MEE 13']},bench:BASE_BENCH.map(printing=>({printing})),
        discard:[],stadium:stadium?['Sky Field ROS 89']:[],deckCount:25,
        prizeCount:prizes},
      opponentPublic:{active:{printing:'Shadow Rider Calyrex VMAX CRE 75',
        hp,damage:0},bench:[{printing:'Gardevoir ex SVI 86'},
          {printing:'Regidrago V SIT 135'}],
        discard:[],stadium:[],prizeCount:3,deckCount:25}},
    actionFrontier:{items}};
}
function policy(seat) {
  return worker.createPolicy({role:'opponent',seat,
    policyVersion:worker.POLICY_VERSION,config:{}});
}
function playToken(req,token) {
  const items=req.actionFrontier.items;
  const item=items.find(x=>x.token===token);
  assert.equal(item.kind,'play-card');
  assert.ok(req.observation.ownHand.includes(item.actorPrinting));
  const at=req.observation.ownHand.indexOf(item.actorPrinting);
  req.observation.ownHand.splice(at,1);
  req.observation.ownPublic.bench.push({printing:item.actorPrinting});
  items.splice(items.indexOf(item),1);
}
for(const seat of [0,1]) {
  test('seat '+seat+' offered Sky Field plus 3 protected Basics yields terminal Rondo',()=>{
    const req=state(seat);
    const decide=policy(seat).decide;
    let d=decide(req);
    assert.deepEqual(d,{kind:'select-action',token:'play-0'});
    req.observation.ownPublic.stadium=['Sky Field ROS 89'];
    req.observation.ownHand.shift();
    req.actionFrontier.items.shift();
    for(let i=0;i<3;i++){
      d=decide(req);
      assert.equal(d.kind,'select-action');
      assert.ok(d.token!=='rondo');
      playToken(req,d.token);
    }
    assert.equal(req.observation.ownPublic.bench.length,8);
    assert.equal(worker.projectedRondo(req.observation).damage,220);
    assert.deepEqual(decide(req),{kind:'select-action',token:'rondo'});
  });
  test('seat '+seat+' preserves Mimikyu/Dialga/Empoleon when knockout is not terminal',()=>{
    const req=state(seat,{prizes:4,stadium:true});
    assert.deepEqual(policy(seat).decide(req),{kind:'select-action',token:'rondo'});
    const noSky=state(seat,{prizes:4,stadium:false});
    assert.notDeepEqual(policy(seat).decide(noSky),{kind:'select-action',token:'play-0'});
  });
  test('seat '+seat+' protected techs require a legal offered Rondo root',()=>{
    const req=state(seat,{stadium:true,attack:false});
    const d=policy(seat).decide(req);
    assert.notEqual(d.kind,'select-action');
  });
  test('seat '+seat+' refuses a three-body terminal setup with only two techs',()=>{
    const req=state(seat,{stadium:true,techs:TECHS.slice(0,2)});
    assert.deepEqual(policy(seat).decide(req),{kind:'select-action',token:'rondo'});
  });
  test('seat '+seat+' one protected Bench body may create a final Rondo',()=>{
    const req=state(seat,{stadium:true,techs:[TECHS[0]],hp:180});
    assert.deepEqual(policy(seat).decide(req),{kind:'select-action',token:'play-0'});
  });
}
