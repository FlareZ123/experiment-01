'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {withNightWatchRandomHook}=require('./night-watch-random-hook.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(root,p));
/** Execute conditioned second attacking turn with real ability, Supporter and copy prompts. */
function sourceSecondTurn() {
 const mgr=initializeCards();let id=100;
 const card=n=>{const c=mgr.getCardByName(n);assert.ok(c,n);c.id=id++;return c;};
 const {Store}=load('game/store/store'),{Player}=load('game/store/state/player');
 const {CardList}=load('game/store/state/card-list');
 const {PokemonCardList}=load('game/store/state/pokemon-card-list');
 const {GamePhase}=load('game/store/state/state');
 const {Format}=load('game/store/card/card-types');
 const {PowerEffect}=load('game/store/effects/game-effects');
 const {UseAbilityAction}=load('game/store/actions/game-actions');
 const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
 const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
 const store=new Store({onStateChange(){}}),s=store.state;
 const me=new Player(),opp=new Player();me.id=101;opp.id=202;s.players=[me,opp];
 s.activePlayer=0;s.turn=4;s.phase=GamePhase.PLAYER_TURN;
 s.gameSettings.format=Format.EXPANDED;
 const attacker=card('Mewtwo & Mew-GX UNM');
 me.active.cards.push(attacker);
 for(let i=0;i<3;i++){
  const e=card('Psychic Energy MEE');me.active.cards.push(e);me.active.energies.cards.push(e);
 }
 const dusk=card('Duskull SFA'),dusclops=card('Dusclops SFA');
 const stack=new PokemonCardList();stack.cards.push(dusk,dusclops);me.bench.push(stack);
 for(const n of ['Solrock CES','Lunatone OBF']){
  const b=new PokemonCardList();b.cards.push(card(n));me.bench.push(b);
 }
 me.stadium.cards.push(card('Path to the Peak CRE'));
 const payload=card('Trevenant & Dusknoir-GX SMP');
 me.discard.cards.push(payload);
 const ace=card('Ace Trainer AOR');me.hand.cards.push(ace);
 opp.active.cards.push(card('Shadow Rider Calyrex V CRE'));
 for(let i=0;i<4;i++)opp.hand.cards.push(card('Psychic Energy MEE'));
 for(const p of s.players){
  for(let i=0;i<25;i++)p.deck.cards.push(card('Psychic Energy MEE'));
  for(let i=0;i<6;i++){const prize=new CardList();prize.cards.push(card('Psychic Energy MEE'));p.prizes.push(prize);}
 }
 const pending=()=>s.prompts.find(p=>p.result===undefined);
 const resolve=(p,result)=>store.dispatch(new ResolvePromptAction(p.id,result));
 const settle=()=>{
  for(let k=0;k<48;k++){
   const p=pending();if(!p)return;
   if(p.constructor.name==='WaitPrompt'){resolve(p,null);continue;}
   if(p.constructor.name==='ShuffleDeckPrompt'){
    const who=s.players.find(x=>x.id===p.playerId);
    assert.ok(who);resolve(p,who.deck.cards.map((_,i)=>i));continue;
   }
   throw Error('Unexpected prompt '+p.constructor.name);
  }
  throw Error('Prompt chain failed to settle');
 };
 assert.equal(me.getPrizeLeft(),6);assert.equal(opp.getPrizeLeft(),6);
 assert.equal(ace.canPlay(store,s,me),false,'Ace requires opponent to be ahead');
 dusclops.reduceEffect(store,s,new PowerEffect(me,dusclops.powers[0],dusclops));
 const target=pending();assert.equal(target.constructor.name,'ChoosePokemonPrompt');
 resolve(target,[opp.active]);
 assert.equal(opp.active.damage,50);
 assert.equal(opp.getPrizeLeft(),5,'Dusclops Prize checkpoint: '+JSON.stringify({prize:opp.getPrizeLeft(),holderDamage:stack.damage,activeDamage:opp.active.damage,bench:me.bench.map(x=>x.getPokemonCard()?.name),discard:me.discard.cards.map(x=>x.name),phase:s.phase,prompts:s.prompts.map(x=>x.constructor.name)}));
 assert.equal(ace.canPlay(store,s,me),true,'Self-KO must unlock Ace Trainer');
 store.dispatch(new PlayCardAction(me.id,me.hand.cards.indexOf(ace),
  {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BOARD,index:0}));
 settle();
 assert.equal(opp.hand.cards.length,3,'Ace Trainer must draw exactly three opposing cards');
 assert.equal(me.hand.cards.length,6,'Ace Trainer must draw six for user');
 me.usedGX=true;
 return withNightWatchRandomHook(()=>{
  store.dispatch(new UseAbilityAction(me.id,'Perfection',
   {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}));
  const w=pending();assert.equal(w.constructor.name,'WaitPrompt');resolve(w,null);
  const attack=pending();assert.equal(attack.constructor.name,'ChooseAttackPrompt');
  assert.ok(attack.cards.includes(payload));
  assert.equal(attack.validate(payload.attacks[0]),true);
  resolve(attack,payload.attacks[0]);
  const choice=pending();assert.equal(choice.constructor.name,'ChooseCardsPrompt');
  assert.equal(choice.cards.cards.length,2,'Random subset must be preselected');
  resolve(choice,choice.cards.cards);
  assert.equal(opp.hand.cards.length,1,'Night Watch leaves one card after Ace');
  return {prizes:[me.getPrizeLeft(),opp.getPrizeLeft()],
   opponentHand:opp.hand.cards.length,meHand:me.hand.cards.length,
   damage:opp.active.damage,usedGX:me.usedGX,source:payload.fullName,
   nextPrompts:s.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name),
   scope:'Injected turn-two board; no real intervening opponent turn or legal opener'};
 });
}
if(require.main===module)console.log(JSON.stringify(sourceSecondTurn(),null,2));
module.exports={sourceSecondTurn};
