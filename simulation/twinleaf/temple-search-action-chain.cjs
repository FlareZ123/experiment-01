'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const crypto=require('node:crypto');
const {initializeCards}=require('./headless.cjs');
const {preparedRegidrago}=require('./apex-attack-action.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load=modulePath=>require(path.join(root,modulePath));

/** Apply real pending pinned Store prompts using the precise expected cards. */
function resolvePrompts(store) {
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const transcript=[];
  for(let i=0;i<12;i++){
    const prompt=store.state.prompts.find(x=>x.result===undefined);
    if(!prompt)return transcript;
    const name=prompt.constructor.name;
    if(name==='ShuffleDeckPrompt') {
      const deck=store.state.players.find(x=>x.id===prompt.playerId).deck.cards;
      const order=deck.map((_,index)=>index);
      for(let k=order.length-1;k>0;k--){
        const j=crypto.randomInt(k+1);
        [order[k],order[j]]=[order[j],order[k]];
      }
      store.dispatch(new ResolvePromptAction(prompt.id,order));
      transcript.push({type:name,cardCount:order.length});
      continue;
    }
    if(name==='ShowCardsPrompt') {
      store.dispatch(new ResolvePromptAction(prompt.id,true));
      transcript.push({type:name,choice:true});
      continue;
    }
    if(name==='WaitPrompt') {
      store.dispatch(new ResolvePromptAction(prompt.id,null));
      transcript.push({type:name,choice:null});
      continue;
    }
    assert.equal(name,'ChooseCardsPrompt','Unexpected prompt during Item chain');
    const options=prompt.cards.cards;
    const selected=options.find(x=>x.name==='Grass Energy')||
      options.find(x=>x.name==='Marshadow');
    assert.ok(selected,'Expected Grass discard or Marshadow deck search target');
    assert.equal(prompt.validate([selected]),true,'Prompt requires a valid selection');
    transcript.push({type:name,choice:selected.fullName});
    store.dispatch(new ResolvePromptAction(prompt.id,[selected]));
  }
  throw Error('Item chain exceeded twelve prompts');
}

/**
 * Synthetic source-print action chain: paid Quick Ball / Mysterious Treasure
 * from a two-card hand, an unprized Marshadow, Temple suppression, actual
 * Bench placement and Resetting Hole to re-enable a printed Apex Dragon.
 *
 * @param {string} trainerName Exact pinned printing.
 */
function testTempleSearchChain(trainerName) {
  const f=preparedRegidrago();
  const manager=initializeCards();
  const card=name=>{
    const x=manager.getCardByName(name);
    assert.ok(x,name);return x;
  };
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {UseAbilityAction,AttackAction}=load('game/store/actions/game-actions');
  const {Simulator}=load('game/bots/simulator');
  const temple=card('Temple of Sinnoh ASR');
  const marshadow=card('Marshadow UNB');
  const basic=card('Grass Energy MEE');
  const trainer=card(trainerName);
  f.attacking.active.cards=f.attacking.active.cards.filter(x=>x.name!=='Grass Energy');
  f.attacking.active.energies.cards.length=0;
  for(let i=0;i<2;i++){
    const dde=card('Double Dragon Energy ROS');
    f.attacking.active.cards.push(dde);
    f.attacking.active.energies.cards.push(dde);
  }
  f.defending.stadium.cards.push(temple);
  f.attacking.hand.cards.push(trainer,basic);
  f.attacking.deck.cards.push(marshadow);
  const start=new Simulator(f.state);
  assert.throws(()=>start.dispatch(new AttackAction(101,'Apex Dragon')),
    'Opposing Temple must prevent typed Apex payment');
  const item=new PlayCardAction(101, f.attacking.hand.cards.indexOf(trainer),{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BOARD,index:0
  });
  f.store.dispatch(item);
  const prompts=resolvePrompts(f.store);
  assert.ok(f.attacking.discard.cards.includes(basic),'Must pay chosen Basic Grass discard');
  assert.ok(f.attacking.hand.cards.includes(marshadow),'Searcher must return Marshadow');
  const benchAction=new PlayCardAction(101,f.attacking.hand.cards.indexOf(marshadow),{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  });
  f.store.dispatch(benchAction);
  resolvePrompts(f.store);
  assert.equal(f.attacking.bench[0]?.getPokemonCard()?.name,'Marshadow');
  const ability=new UseAbilityAction(101,'Resetting Hole',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  });
  f.store.dispatch(ability);
  resolvePrompts(f.store);
  assert.ok(f.defending.discard.cards.includes(temple));
  assert.ok(f.attacking.discard.cards.includes(marshadow));
  f.store.dispatch(new AttackAction(101,'Apex Dragon'));
  const pending=f.store.state.prompts.find(x=>x.result===undefined&&
    x.constructor.name==='ChooseAttackPrompt');
  assert.ok(pending,'Actual Apex Dragon should become payable after removal');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  f.store.dispatch(new ResolvePromptAction(pending.id,f.dratini.attacks[0]));
  assert.equal(f.defending.active.damage,20);
  return {trainer:trainerName,twoCardOpeningHand:true,
    chosenCards:prompts,marshadowSearched:true,
    templeDiscarded:true,apexCopiedDamage:20,
    scope:'Injected midgame legal actions, not a sampled first-turn game'};
}

/** @returns {object} */
function run(){
  return {
    mysteriousTreasure:testTempleSearchChain('Mysterious Treasure FLI'),
    quickBall:testTempleSearchChain('Quick Ball SSH')
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={testTempleSearchChain,run};
