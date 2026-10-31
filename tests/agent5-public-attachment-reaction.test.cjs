'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {evaluatePublicAttachmentReaction}=require(
  '../simulation/twinleaf/agent5-public-attachment-reaction.cjs');

const attachment={kind:'attach-special-energy',printing:'Double Dragon Energy ROS',
  handIndex:0,slot:'bench',index:1};
const baseline={kind:'attack',attackName:'Gnaw'};
const view=()=>({decisionKind:'owner-root',globalTurn:4,
  ownHand:['Double Dragon Energy ROS'],
  ownPublic:{prizeCount:6,active:{name:'Venonat',printing:'Venonat MEW'},
    bench:[null,{name:'Regidrago V',printing:'Regidrago V SIT',
      hp:220,damage:200,attacks:[{name:'Raging Claws',cost:[1]}]}]},
  opponentPublic:{prizeCount:2,active:{name:'Minun',printing:'Minun PAR',
    abilities:['Buddy Pulse']},bench:[{name:'Plusle',printing:'Plusle PAR'}]}});

test('fully public two-counter threat can knock out a two-Prize Bench target',()=>{
  const r=evaluatePublicAttachmentReaction(view(),attachment);
  assert.deepEqual(r,{potentialKnockout:true,
    reason:'visible-buddy-pulse-possible-knockout',
    printing:'Regidrago V SIT',remainingHp:20,triggerDamage:20,
    terminalLossPossible:true});
});

test('no trigger, unknown target, safer target and attack are unchanged',()=>{
  const a=view();a.opponentPublic.bench=[];
  assert.equal(evaluatePublicAttachmentReaction(a,attachment).potentialKnockout,false);
  const b=view();b.ownPublic.bench[1].damage=190;
  assert.equal(evaluatePublicAttachmentReaction(b,attachment).potentialKnockout,false);
  assert.equal(evaluatePublicAttachmentReaction(view(),baseline).triggerDamage,0);
  assert.equal(evaluatePublicAttachmentReaction(view(),{
    ...attachment,index:4}).reason,'no-public-target');
});

test('opponent concealed contents and own unseen deck cannot change risk',()=>{
  const a=view(),b=structuredClone(a);
  a.opponentPrivate={hand:['Dedenne-GX UNB'],prizes:['Hidden']};
  b.opponentPrivate={hand:['Other'],prizes:['Other']};
  a.unseenDeck=['unknown-a'];b.unseenDeck=['unknown-b'];
  assert.deepEqual(evaluatePublicAttachmentReaction(a,attachment),
    evaluatePublicAttachmentReaction(b,attachment));
});

test('existing arbiter actually offers this dangerous attachment',()=>{
  const {arbitrateOwnerRootIntent}=require(
    '../simulation/twinleaf/agent41-owner-root-arbitration.cjs');
  const v=view();
  v.ownTurnResources={energyPlayLocked:false,specialEnergyPlayLocked:false,
    energyPlayedTurn:0};
  const offered={probe:'public-special-energy',kind:'attach-special-energy',
    printing:attachment.printing,handIndex:0,slot:'bench',index:1};
  const choice=arbitrateOwnerRootIntent(v,{},baseline,
    {publicContextSpecialEnergy:true},()=>({alternatives:[offered]}));
  assert.equal(choice.intent.kind,'attach-special-energy');
  assert.equal(evaluatePublicAttachmentReaction(v,choice.intent)
    .terminalLossPossible,true);
});

test('public printed-profile award supports exact one- and three-Prize KO hazards',()=>{
  const attach={kind:'attach-basic-energy',printing:'Psychic Energy MEE',
    handIndex:0,slot:'bench',index:1};
  for(const [printing,hp,damage,award] of [
    ['Snorlax PGO',150,130,1],
    ['Trevenant & Dusknoir-GX SMP',270,250,3]
  ]){
    const v=view();
    v.ownPublic.bench[1]={name:printing.split(' ').slice(0,-1).join(' '),
      printing,hp,damage};
    v.opponentPublic.prizeCount=award;
    const profile=new Map([[printing,{prizesOnKnockout:award}]]);
    const r=evaluatePublicAttachmentReaction(v,attach,{
      publicPokemonProfileIndex:profile});
    assert.equal(r.terminalLossPossible,true,
      'Exact printed award was not used for '+printing);
    assert.equal(r.triggerDamage,20);
    assert.equal(evaluatePublicAttachmentReaction(v,attach)
      .terminalLossPossible,false,
      'Unknown source-profile award must stay unknown');
    v.opponentPublic.prizeCount=award+1;
    assert.equal(evaluatePublicAttachmentReaction(v,attach,{
      publicPokemonProfileIndex:profile}).terminalLossPossible,false,
      'A KO must not be mistaken for immediate opponent terminal');
  }
});

test('ambiguous public profile never guesses a prize award',()=>{
  const v=view();
  v.ownPublic.bench[1]={name:'Trevenant & Dusknoir-GX',
    printing:'Trevenant & Dusknoir-GX SMP',hp:270,damage:250};
  v.opponentPublic.prizeCount=3;
  const ambiguous=new Map([['Trevenant & Dusknoir-GX SMP',null]]);
  assert.equal(evaluatePublicAttachmentReaction(v,{
    kind:'attach-basic-energy',slot:'bench',index:1},{
      publicPokemonProfileIndex:ambiguous}).terminalLossPossible,false);
});
