'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const load=n=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',n));
function run(){
 const m=initializeCards(),card=n=>{const c=m.getCardByName(n);assert.ok(c,n);return c};
 const {Store}=load('game/store/store'),{Player}=load('game/store/state/player');
 const {GamePhase}=load('game/store/state/state');
 const {EndTurnEffect}=load('game/store/effects/game-phase-effects');
 const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
 const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
 const s=new Store({onStateChange(){}}),z=s.state,p=new Player(),o=new Player();
 p.id=101;o.id=202;z.players=[p,o];z.activePlayer=0;z.turn=2;z.phase=GamePhase.PLAYER_TURN;
 p.active.cards.push(card('Mewtwo & Mew-GX UNM'));
 o.active.cards.push(card('Shadow Rider Calyrex V CRE'));
 p.active.tools.push(card('Powerglass SFA'));
 const basic=card('Psychic Energy MEE'),special=card('Double Colorless Energy SUM');
 p.discard.cards.push(basic,special);
 s.reduceEffect(z,new EndTurnEffect(p));
 const q=z.prompts.find(x=>x.result===undefined&&x.constructor.name==='AttachEnergyPrompt');
 assert.ok(q,'Powerglass prompt absent');
 const result=[{card:special,to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}}];
 const validates=q.validate(result,z);
 s.dispatch(new ResolvePromptAction(q.id,result));
 return {validates,attachedSpecial:p.active.energies.cards.includes(special)};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
