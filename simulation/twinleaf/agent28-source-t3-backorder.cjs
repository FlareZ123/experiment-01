'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @template T @param {()=>T} execute */
function withSourceT3BackOrder(execute) {
 const headless=require('./headless.cjs');
 const load=p=>require(path.join(root,p));
 const {SimpleTacticsAi:Bot}=load('simple-bot/simple-tactics-ai');
 const {UseAbilityAction}=load('game/store/actions/game-actions');
 const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
 const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
 const oldRun=headless.runMatch;
 let calls=0,stage=0;
 const audit={matchedPasses:0,heldDeckStone:null,events:[]};
 function watched(request) {
   ++calls;
   const old=Bot.prototype.decodeNextAction;
   function next(state,...args) {
     const own=state.players?.[0];
     if(state.turn!==3||state.activePlayer!==0||own?.id!==this.client?.id)
       return old.apply(this,[state,...args]);
     const prompt=state.prompts.find(p=>p.result===undefined);
     if(stage===1&&prompt?.constructor?.name==='ChooseCardsPrompt'&&prompt.playerId===own.id) {
       const card=prompt.cards.cards.find(c=>c.name==='Float Stone');
       assert.ok(card); assert.equal(prompt.validate([card],state),true);
       stage=2; audit.events.push({kind:'choose',card:'Float Stone'});
       return new ResolvePromptAction(prompt.id,[card]);
     }
     if(prompt)return old.apply(this,[state,...args]);
     const action=old.apply(this,[state,...args]);
     if(action?.constructor?.name!=='PassTurnAction')return action;
     ++audit.matchedPasses;
     const active=own.active.getPokemonCard();
     const bench=own.bench.findIndex(s=>s.getPokemonCard()?.name==='Garbodor'&&!s.tools.length);
     if(stage===0&&active?.name==='Oranguru V'&&bench>=0){
       audit.heldDeckStone=own.deck.cards.filter(c=>c.name==='Float Stone').length;
       if(!audit.heldDeckStone)return action;
       stage=1;audit.events.push({kind:'ability',name:'Back Order'});
       return new UseAbilityAction(own.id,'Back Order',
         {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
     }
     if(stage===2&&bench>=0){
       const i=own.hand.cards.findIndex(c=>c.name==='Float Stone');
       assert.ok(i>=0);
       stage=3;audit.events.push({kind:'equip',name:'Float Stone',bench});
       return new PlayCardAction(own.id,i,
         {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:bench});
     }
     return action;
   }
   Bot.prototype.decodeNextAction=next;
   try{return oldRun.call(this,request);}
   finally {Bot.prototype.decodeNextAction=old;}
 }
 headless.runMatch=watched;
 try {const result=execute();return {result,audit:{...audit,calls,stage}};}
 finally {headless.runMatch=oldRun;}
}
module.exports={withSourceT3BackOrder};
