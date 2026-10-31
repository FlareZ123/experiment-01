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
