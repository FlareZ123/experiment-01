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
  try{
    store.dispatch(new UseAbilityAction(source.id,'Star Alchemy',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
  }catch(e){error=e.message;}
  const pending=state.prompts.filter(p=>p.result===undefined)
    .map(p=>p.constructor.name);
  const accepted=!error && pending.includes('ChooseCardsPrompt');
  const effective=store.state;
  const effectiveSource=effective.players[params.sourceSeat];
  return {...params,error,accepted,pending,
    stateReplaced:effective!==state,
    sourceReplaced:effectiveSource!==source,
    effectivePending:effective.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    sourceStoneStillAttached:source.active.tools.includes(stone),
    effectiveStoneAttached:effectiveSource.active.tools.some(
      item=>item.name==='Forest Seal Stone'),
    sourceVSTARUsed:source.usedVSTAR,
    effectiveVSTARUsed:effectiveSource.usedVSTAR,
    stadium:candidate.stadium.cards.map(c=>c.fullName)};
}
function run(){
  const cases=[];
  for(const sourceSeat of [0,1])for(const tower of [false,true]){
    cases.push(probe({sourceSeat,tower}));
  }
  process.stderr.write('Star Alchemy source-controlled diagnostic: '+
    JSON.stringify(cases)+'\n');
  for(const row of cases) {
    assert.equal(row.accepted,!row.tower,
      'Star Alchemy acceptance differs from printed Tool text: '+
      JSON.stringify(row));
    assert.equal(row.sourceStoneStillAttached,true);
    assert.equal(row.stadium.length,Number(row.tower));
  }
  return {schema:'staged-jamming-tower-preemption-star-alchemy-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases,competitiveQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
