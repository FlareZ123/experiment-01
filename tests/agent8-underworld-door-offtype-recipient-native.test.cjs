'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const load=n=>require(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output',n));
const {installUnderworldDoorPsychicRecipientHook}=
 require('../simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs');

/** @param {0|1} seat @param {boolean} psychicRecipient @param {boolean} corrected */
function probe(seat,psychicRecipient,corrected=false){
 const restore=corrected?installUnderworldDoorPsychicRecipientHook():null;
 try{
 const x=stage(seat),m=initializeCards();
 let id=69000+seat*1000;
 const card=n=>{const c=m.getCardByName(n);assert.ok(c,n);c.id=id++;return c;};
 const psychic=x.owner.bench[0],colorless=x.owner.bench[1];
 psychic.cards.length=0;colorless.cards.length=0;
 psychic.cards.push(card('Shadow Rider Calyrex V CRE'),
  card('Shadow Rider Calyrex VMAX CRE'));
 colorless.cards.push(card('Dialga-GX UPR'));
 x.owner.hand.cards.length=0;
 const energy=card('Psychic Energy SVE');
 x.owner.hand.cards.push(energy);
 x.owner.deck.cards.length=0;
 for(let i=0;i<4;i++)x.owner.deck.cards.push(card('Psychic Energy SVE'));
 const {UseAbilityAction}=load('game/store/actions/game-actions');
 const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
 const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
 const dest=i=>({player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:i});
 x.store.dispatch(new UseAbilityAction(x.owner.id,'Underworld Door',dest(0)));
 const prompt=x.state.prompts.find(q=>q.result===undefined);
 assert.equal(prompt?.constructor.name,'AttachEnergyPrompt');
 const answer=[{card:energy,to:dest(psychicRecipient?0:1)}];
 const accepted=prompt.validate(answer);
 let error=null;
 try{x.store.dispatch(new ResolvePromptAction(prompt.id,answer));}
 catch(e){error=e.message;}
 const recipient=psychicRecipient?psychic:colorless;
 return {seat,psychicRecipient,corrected,accepted,error,
  attached:recipient.energies.cards.includes(energy),
  recipient:recipient.getPokemonCard()?.fullName,qualifiedGames:0};
 }finally{restore?.();}
}

for(const seat of [0,1])test('Underworld Door native non-Psychic target, seat '+seat,()=>{
 const legal=probe(seat,true),illegal=probe(seat,false);
 const repairedLegal=probe(seat,true,true);
 const repairedIllegal=probe(seat,false,true);
 assert.equal(legal.accepted,true);assert.equal(legal.attached,true);
 assert.equal(illegal.accepted,true);
 assert.equal(illegal.error,null);assert.equal(illegal.attached,true);
 assert.equal(repairedLegal.accepted,true);
 assert.equal(repairedLegal.error,null);
 assert.equal(repairedLegal.attached,true);
 assert.equal(repairedIllegal.accepted,false);
 assert.equal(repairedIllegal.error,'INVALID_PROMPT_RESULT');
 assert.equal(repairedIllegal.attached,false);
 console.log('AGENT8_UNDERWORLD_OFFTYPE',
  JSON.stringify({legal,illegal,repairedLegal,repairedIllegal}));
});
