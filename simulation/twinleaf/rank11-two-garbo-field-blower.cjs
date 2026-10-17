'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename */
const engine=filename=>require(path.join(output,filename));

/**
 * Field Blower single-Item response to one or two Garbotoxin sources.
 * Staged board, genuine printed Item and Store effect prompts.
 * @param {{candidateSeat:0|1,garbodorCount:1|2,selectedTools:1|2}} request
 */
function probe(request){
  const manager=initializeCards();
  let id=1;
  /** @param {string} name */
  const card=name=>{
    const value=manager.getCardByName(name);
    assert.ok(value,'Missing pinned '+name);
    value.id=id++;
    return value;
  };
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {CardList}=engine('game/store/state/card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {Format}=engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {IS_ABILITY_BLOCKED}=engine('game/store/prefabs/prefabs');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;state.activePlayer=request.candidateSeat;
  state.gameSettings.format=Format.EXPANDED;
  const candidate=new Player(),opponent=new Player();
  candidate.id=101;candidate.name='rank-one Shadow Rider reference';
  opponent.id=202;opponent.name='rank-eleven Garbotoxin source';
  state.players=request.candidateSeat===0?[candidate,opponent]:[opponent,candidate];
  candidate.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const vmax=new PokemonCardList();
  vmax.cards.push(card('Shadow Rider Calyrex V CRE'),card('Shadow Rider Calyrex VMAX CRE'));
  candidate.bench.push(vmax);
  opponent.active.cards.push(card('Oranguru V ASR'));
  const attachedTools=[];
  for(let n=0;n<request.garbodorCount;n++){
    const garbo=new PokemonCardList();
    garbo.cards.push(card('Trubbish FST'),card('Garbodor BKP'));
    const tool=card('Float Stone BKT');
    garbo.tools.push(tool);
    opponent.bench.push(garbo);
    attachedTools.push(tool);
  }
  const blower=card('Field Blower GRI');
  candidate.hand.cards.push(blower);
  for(const p of state.players){
    p.deck.cards.push(card('Psychic Energy SVE'),card('Psychic Energy SVE'));
    for(let n=0;n<6;n++){
      const c=new CardList();
      c.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(c);
    }
  }
  const live=()=>store.state;
  const my=()=>live().players.find(p=>p.id===candidate.id);
  const enemy=()=>live().players.find(p=>p.id===opponent.id);
  const blocked=()=>{
    const power=my().bench[0].getPokemonCard().powers.find(p=>p.name==='Underworld Door');
    assert.ok(power,'Pinned Shadow Rider VMAX Underworld Door must exist');
    return IS_ABILITY_BLOCKED(store,live(),my(),my().bench[0].getPokemonCard(),power);
  };
  assert.equal(blocked(),true,'Equipped Garbotoxin must block Underworld Door');
  const playIndex=my().hand.cards.findIndex(c=>c.id===blower.id);
  assert.ok(playIndex>=0);
  store.dispatch(new PlayCardAction(candidate.id,playIndex,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const pending=()=>live().prompts.find(p=>p.result===undefined);
  const choose=pending();
  assert.equal(choose?.constructor.name,'ChoosePokemonPrompt',
    'No Stadium: Field Blower should target Tools directly');
  const targets=enemy().bench.slice(0,request.selectedTools);
  assert.equal(choose.validate(targets,live()),true);
  store.dispatch(new ResolvePromptAction(choose.id,targets));
  assert.equal(pending(),undefined);
  const discarded=attachedTools.filter(tool=>enemy().discard.cards.some(c=>c.id===tool.id)).length;
  assert.equal(discarded,request.selectedTools);
  assert.equal(my().discard.cards.some(c=>c.id===blower.id),true);
  const remaining=request.garbodorCount-request.selectedTools;
  assert.equal(blocked(),remaining>0,
    'Garbotoxin lock should survive exactly while an equipped source persists');
  return {...request,discarded,remaining,underworldDoorBlocked:blocked(),
    qualification:'staged board, genuine Item and prompt resolution; no source deal or game outcome'};
}

function run(){
  const cases=[
    {garbodorCount:1,selectedTools:1},
    {garbodorCount:2,selectedTools:1},
    {garbodorCount:2,selectedTools:2}
  ];
  const rows=[0,1].flatMap(candidateSeat=>cases.map(x=>probe({...x,candidateSeat})));
  assert.equal(rows.length,6);
  return {engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'rank1 Field Blower GRI vs rank11 Garbodor BKP/Float Stone BKT',
    rows,qualifiedForCompetitiveInference:false};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
