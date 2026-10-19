'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {beforeGladionRootPrizeChoice,afterGladionRootPrizeChoice}=
  require('../simulation/twinleaf/gladion-root-prize-choice-evidence.cjs');

class ChoosePrizePrompt{
  constructor(){this.playerId=101;this.options={count:1,useOpponentPrizes:false};}
}
class ResolvePromptAction{
  constructor(result){this.result=result;}
}
function fixture(){
  const tree={fullName:'Great Tree SCR'};
  const energy={fullName:'Psychic Energy SVE'};
  const gladion={fullName:'Gladion CIN'};
  const prizes=[
    {isSecret:false,cards:[energy]},
    {isSecret:false,cards:[tree]}
  ];
  const player={id:101,hand:{cards:[]},supporter:{cards:[gladion]},prizes};
  const state={turn:5,players:[player,{id:202}]};
  return {tree,energy,gladion,prizes,player,state,
    prompt:new ChoosePrizePrompt(),action:new ResolvePromptAction([prizes[1]])};
}

test('actual owner-visible root choice captures and verifies one physical Prize',()=>{
  const f=fixture();
  const before=beforeGladionRootPrizeChoice(f.state,f.prompt,f.action,0,46);
  assert.deepEqual(before.revealedPrizes,[
    {slot:0,printing:'Psychic Energy SVE'},
    {slot:1,printing:'Great Tree SCR'}
  ]);
  f.player.hand.cards.push(f.tree);
  f.prizes[1].cards=[f.gladion];
  f.prizes[1].isSecret=true;
  const after=afterGladionRootPrizeChoice(before,f.state);
  assert.equal(after.actionOrdinal,46);
  assert.equal(after.selectedSlot,1);
  assert.equal(after.selectedPrinting,'Great Tree SCR');
  assert.equal(after.selectedPhysicalPrizeReachedHand,true);
  assert.equal(after.selectionCount,1);
  assert.equal(after.competitiveGameQualified,false);
  assert.ok(!('refs' in after));
});

test('no choice evidence when Prize identities remain concealed',()=>{
  const f=fixture();
  f.prizes[1].isSecret=true;
  assert.equal(beforeGladionRootPrizeChoice(f.state,f.prompt,f.action,0,46),null);
});

test('live Gladion, own Prize mode, owner prompt and actual resolve are mandatory',()=>{
  const f=fixture();
  assert.equal(beforeGladionRootPrizeChoice(f.state,f.prompt,f.action,1,46),null);
  f.prompt.options.useOpponentPrizes=true;
  assert.equal(beforeGladionRootPrizeChoice(f.state,f.prompt,f.action,0,46),null);
  f.prompt.options.useOpponentPrizes=false;
  f.player.supporter.cards=[];
  assert.equal(beforeGladionRootPrizeChoice(f.state,f.prompt,f.action,0,46),null);
  f.player.supporter.cards=[f.gladion];
  assert.equal(beforeGladionRootPrizeChoice(f.state,f.prompt,{constructor:{name:'PassTurnAction'}},0,46),null);
});

test('missing physical hand receipt is an explicit incomplete observation',()=>{
  const f=fixture();
  const before=beforeGladionRootPrizeChoice(f.state,f.prompt,f.action,0,189);
  const after=afterGladionRootPrizeChoice(before,f.state);
  assert.equal(after.selectedSlot,null);
  assert.equal(after.selectedPrinting,null);
  assert.equal(after.selectedPhysicalPrizeReachedHand,false);
  assert.equal(after.selectionCount,0);
});
