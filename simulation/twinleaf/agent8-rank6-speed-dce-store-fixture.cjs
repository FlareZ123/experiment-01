'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {prepare}=require('./iron-thorns-turn2-attack.cjs');
const {initializeCards}=require('./headless.cjs');
const load=p=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',p));
const {AttackAction}=load('game/store/actions/game-actions');
const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
/** Conditional attack fixture; no authentic draw or source policy. */
function probe(){
 const g=prepare(false);
 const dce=g.a.active.energies.cards.pop();
 g.a.active.cards.splice(g.a.active.cards.indexOf(dce),1);
 g.a.hand.cards.push(dce);
 const speed=initializeCards().getCardByName('Speed Lightning Energy RCL');
 assert.ok(speed);speed.id=777777;
 g.a.active.cards.push(speed);g.a.active.energies.cards.push(speed);
 g.state.turn=3;
 g.store.dispatch(new PlayCardAction(g.a.id,0,
  {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}));
 assert.equal(g.a.active.energies.cards.length,2);
 g.store.dispatch(new AttackAction(g.a.id,'Volt Cyclone'));
 for(let i=0;i<12;i++){
  const p=g.state.prompts.find(x=>x.result===undefined);
  if(!p)break;
  assert.equal(p.constructor.name,'WaitPrompt');
  g.store.dispatch(new ResolvePromptAction(p.id,null));
 }
 assert.equal(g.b.active.damage,140);
 return {noStadiumSpeedPlusDceDamage:140,competitiveQualified:false};
}
if(require.main===module)console.log(JSON.stringify(probe(),null,2));
module.exports={probe};
