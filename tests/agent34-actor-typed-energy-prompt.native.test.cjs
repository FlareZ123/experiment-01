'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withActorUnderworldPromptContinuation}=
  require('../simulation/twinleaf/agent34-actor-typed-energy-prompt.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs');
const native=n=>require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',n));

/** Actual pinned Store, source-stamped owner root, WaitPrompt, paper-legal
 *  AttachEnergyPrompt and two physical deck draws. No qualified game. */
function stagedSource(seat){
  const x=stage(seat),manager=initializeCards();
  let id=83000+seat*200;
  const card=n=>{
    const c=manager.getCardByName(n);
    assert.ok(c,n);
    c.id=id++;
    return c;
  };
  const psychic=x.owner.bench[0],offType=x.owner.bench[1];
  psychic.cards.length=0;
  psychic.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  offType.cards.length=0;
  offType.cards.push(card('Dialga-GX UPR'));
  x.owner.hand.cards.length=0;
  const energy=card('Psychic Energy SVE');
  x.owner.hand.cards.push(energy);
  x.owner.deck.cards.length=0;
  for(let i=0;i<4;i++)x.owner.deck.cards.push(card('Psychic Energy SVE'));
  return {x,energy,psychic,offType};
}

for(const seat of [0,1])test('native paper-paid owner Underworld prompt, physical seat '+seat,()=>{
  const {x,energy,psychic,offType}=stagedSource(seat);
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const ownerId=x.owner.id;
  const preBot=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,
    'decodeNextAction');
  const restorePaper=installUnderworldDoorPsychicRecipientHook();
  try{
    const run=withActorUnderworldPromptContinuation(()=>{
      x.store.dispatch(new UseAbilityAction(ownerId,'Underworld Door',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
      }));
      let pending=x.state.prompts.find(p=>p.result===undefined);
      assert.equal(pending?.constructor.name,'WaitPrompt');
      x.store.dispatch(new ResolvePromptAction(pending.id,null));
      pending=x.state.prompts.find(p=>p.result===undefined);
      assert.equal(pending?.constructor.name,'AttachEnergyPrompt');
      const action=SimpleTacticsAi.prototype.decodeNextAction.call(
        {client:{id:ownerId}},x.state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.equal(action.id,pending.id);
      assert.equal(action.result?.[0]?.card,energy);
      assert.equal(action.result?.[0]?.to?.index,0);
      assert.equal(pending.validate(action.result),true);
      x.store.dispatch(action);
      return {attached:psychic.energies.cards.includes(energy),
        offTypeUntouched:!offType.energies.cards.includes(energy),
        ownDeckLeft:x.owner.deck.cards.length,
        ownHandLeft:x.owner.hand.cards.length,
        promptsLeft:x.state.prompts.filter(p=>p.result===undefined).length};
    },{stagedStore:x.store});
    assert.equal(run.result.attached,true);
    assert.equal(run.result.offTypeUntouched,true);
    assert.equal(run.result.ownDeckLeft,2);
    assert.equal(run.result.ownHandLeft,2);
    assert.equal(run.result.promptsLeft,0);
    assert.equal(run.audit.sourceUnderworldRootsAccepted,1);
    assert.equal(run.audit.sourceMatchedEnergyPrompts,1);
    assert.equal(run.audit.sourcePromptProposals,1);
    assert.equal(run.audit.sourcePromptNativeAccepted,1);
    assert.equal(run.audit.sourcePromptNativeRejected,0);
    assert.equal(run.audit.competitiveGameQualified,false);
  }finally{
    restorePaper();
    assert.deepEqual(Object.getOwnPropertyDescriptor(
      SimpleTacticsAi.prototype,'decodeNextAction'),preBot);
  }
});
