'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const load=file=>require(path.join(output,file));

/**
 * Temporal counter to a source-owned Forest Seal Stone search: opponent plays
 * the Stadium first, then Oranguru V tries to use attached Star Alchemy.
 * These are injected-board mechanics, not natural starting-state rates.
 * @param {{sourceSeat:0|1,tower:boolean}} params
 */
function probe(params) {
  const manager=initializeCards();let id=1;
  /** @param {string} name */
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing implemented printing: '+name);
    c.id=id++;return c;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {UseAbilityAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const source=new Player(),candidate=new Player();
  source.id=params.sourceSeat===0?101:202;
  candidate.id=params.sourceSeat===0?202:101;
  state.players=params.sourceSeat===0?[source,candidate]:[candidate,source];
  const v=card('Oranguru V ASR');
  source.active.cards.push(v);
  const stone=card('Forest Seal Stone SIT');
  source.active.tools.push(stone);
  candidate.active.cards.push(card('Bunnelby PRC'));
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
    player.deck.cards.push(card('Psychic Energy SVE'));
  }
  source.deck.cards.push(card('Boost Shake EVS'));
  state.turn=3;state.activePlayer=1-params.sourceSeat;
  if(params.tower) {
    const tower=card('Jamming Tower TWM');
    candidate.hand.cards.push(tower);
    store.dispatch(new PlayCardAction(candidate.id,
      candidate.hand.cards.indexOf(tower),{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
    assert.equal(candidate.stadium.cards[0],tower);
  }
  state.turn=4;state.activePlayer=params.sourceSeat;
  let error=null;
  let resolvedAbilityAnimation=false;
  try{
    store.dispatch(new UseAbilityAction(source.id,'Star Alchemy',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    const animation=store.state.prompts.find(p=>
      p.result===undefined && p.constructor.name==='WaitPrompt');
    if(animation){
      store.dispatch(new ResolvePromptAction(animation.id,null));
      resolvedAbilityAnimation=true;
    }
  }catch(e){error=e.message;}
  const effective=store.state;
  const effectiveSource=effective.players[params.sourceSeat];
  const pending=effective.prompts.filter(p=>p.result===undefined)
    .map(p=>p.constructor.name);
  const accepted=!error && pending.includes('ChooseCardsPrompt') &&
    effectiveSource.usedVSTAR===true;
  let searchCompleted=false;
  let shuffleCompleted=false;
  if(accepted){
    const search=effective.prompts.find(p=>
      p.result===undefined && p.constructor.name==='ChooseCardsPrompt');
    const shake=effectiveSource.deck.cards.find(c=>c.name==='Boost Shake');
    assert.ok(search && shake && search.validate([shake],effective));
    store.dispatch(new ResolvePromptAction(search.id,[shake]));
    searchCompleted=effectiveSource.hand.cards.includes(shake) &&
      !effectiveSource.deck.cards.includes(shake);
    const shuffle=store.state.prompts.find(p=>
      p.result===undefined && p.constructor.name==='ShuffleDeckPrompt');
    assert.ok(shuffle);
    const order=effectiveSource.deck.cards.map((_,i)=>i);
    assert.equal(shuffle.validate(order,store.state),true);
    store.dispatch(new ResolvePromptAction(shuffle.id,order));
    shuffleCompleted=store.state.prompts.every(p=>p.result!==undefined);
  }
  return {...params,error,accepted,pending,resolvedAbilityAnimation,
    searchCompleted,shuffleCompleted,
    sourceStoneStillAttached:store.state.players[params.sourceSeat].active.tools
      .some(item=>item.name==='Forest Seal Stone'),
    sourceVSTARUsed:store.state.players[params.sourceSeat].usedVSTAR,
    stadium:store.state.players[1-params.sourceSeat].stadium.cards
      .map(c=>c.fullName)};
}
function run(){
  const cases=[];
  for(const sourceSeat of [0,1])for(const tower of [false,true]){
    cases.push(probe({sourceSeat,tower}));
  }

  for(const row of cases) {
    assert.equal(row.accepted,!row.tower,
      'Star Alchemy acceptance differs from printed Tool text: '+
      JSON.stringify(row));
    assert.equal(row.sourceStoneStillAttached,true);
    assert.equal(row.stadium.length,Number(row.tower));
    assert.equal(row.searchCompleted,!row.tower);
    assert.equal(row.shuffleCompleted,!row.tower);
  }
  return {schema:'staged-jamming-tower-preemption-star-alchemy-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases,competitiveQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
