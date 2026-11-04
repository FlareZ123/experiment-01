'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName @returns {any} */
const engine=moduleName=>require(path.join(OUTPUT,moduleName));

/**
 * Opt-in real-Store card-mechanics canary for the newly registered fixed 60.
 * The board and three-card search targets are deliberately staged. This
 * proves no actual drawn source opportunity, owner policy choice, opponent
 * autonomy, physical source-pair comparability or game outcome.
 *
 * @param {0|1} candidateSeat Physical seat for the Arven Shake candidate.
 * @returns {object} Native accepted actions, card custody and Ability state.
 */
function probeArvenShake(candidateSeat){
  assert.ok(candidateSeat===0||candidateSeat===1);
  const cards=initializeCards();
  let serial=0;
  /** @param {string} printing */
  const card=printing=>{
    const c=cards.getCardByName(printing);
    assert.ok(c,'Missing pinned printed card: '+printing);
    c.id=++serial;
    return c;
  };
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {Format}=engine('game/store/card/card-types');
  const {GamePhase}=engine('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {IS_ABILITY_BLOCKED}=
    engine('game/store/prefabs/prefabs');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  const candidate=new Player(),opponent=new Player();
  candidate.id=101;candidate.name='Arven Shake Absol v1, staged card line';
  opponent.id=202;opponent.name='Shadow Rider response fixture';
  state.players=candidateSeat===0?[candidate,opponent]:[opponent,candidate];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=2;state.activePlayer=candidateSeat;
  state.gameSettings.format=Format.EXPANDED;
  candidate.active.cards.push(card('Mega Absol ex MEG'));
  const trubbish=new PokemonCardList();
  const trub=card('Trubbish FST');
  trubbish.cards.push(trub);
  candidate.bench.push(trubbish);
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const vmax=new PokemonCardList();
  vmax.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  opponent.bench.push(vmax);

  const arven=card('Arven SVI');
  const shake=card('Boost Shake EVS');
  const stone=card('Float Stone BKT');
  const garb=card('Garbodor BKP');
  candidate.hand.cards.push(arven);
  candidate.deck.cards.push(shake,stone,garb);
  for(const p of state.players){
    p.deck.cards.push(card('Psychic Energy SVE'));
    for(let k=0;k<6;k++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }

  /** @returns {any} */
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const bench={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0};
  const audit={candidateSeat,source:'staged owner visible hand/deck, no deal',
    cardIdentity:{arven:arven.fullName,shake:shake.fullName,
      stone:stone.fullName,garbodor:garb.fullName},
    physicalCardIds:{trubbish:trub.id,arven:arven.id,
      shake:shake.id,stone:stone.id,garbodor:garb.id},
    steps:[]};

  /** @param {string} label @param {any} selected @param {object} target */
  function play(label,selected,target){
    const index=candidate.hand.cards.indexOf(selected);
    assert.ok(index>=0,label+': physical card not in acting hand');
    store.dispatch(new PlayCardAction(candidate.id,index,target));
    audit.steps.push({label,action:'PlayCardAction',
      card:selected.fullName,physicalId:selected.id,
      target:{...target}});
  }
  /** @param {string} label @param {any[]} selection @param {string} promptName */
  function answer(label,selection,promptName){
    const p=pending();
    assert.equal(p?.constructor?.name,promptName,label+': wrong Store prompt');
    assert.equal(p.validate(selection,state),true,label+': invalid physical choice');
    store.dispatch(new ResolvePromptAction(p.id,selection));
    audit.steps.push({label,action:'ResolvePromptAction',
      prompt:promptName,selected:selection.map(x=>({
        name:x.fullName||x.getPokemonCard?.()?.fullName||null,
        physicalId:x.id??x.getPokemonCard?.()?.id??null
      }))});
  }
  function drainAdministrative(){
    let count=0;
    while(pending()&&['WaitPrompt','ShuffleDeckPrompt','ShowCardsPrompt']
      .includes(pending().constructor.name)){
      const p=pending();
      const value=p.constructor.name==='WaitPrompt'?null:
        p.constructor.name==='ShowCardsPrompt'?true:
        Array.from({length:candidate.deck.cards.length},(_,index)=>index);
      store.dispatch(new ResolvePromptAction(p.id,value));
      count++;
      assert.ok(count<=8,'Too many administrative prompt transitions');
    }
    return count;
  }
  const door=opponent.bench[0].getPokemonCard().powers.find(
    power=>power.name==='Underworld Door');
  assert.ok(door,'Shadow Rider VMAX Underworld Door witness missing');
  const blocked=()=>IS_ABILITY_BLOCKED(store,state,opponent,
    opponent.bench[0].getPokemonCard(),door);
  assert.equal(blocked(),false,'Initial staged opponent Ability must work');

  play('Arven Supporter from physical hand',arven,board);
  answer('Arven searches Item and Tool',[shake,stone],'ChooseCardsPrompt');
  const afterArvenAdmin=drainAdministrative();
  assert.ok(candidate.hand.cards.includes(shake));
  assert.ok(candidate.hand.cards.includes(stone));
  assert.ok(!candidate.deck.cards.includes(shake)&&
    !candidate.deck.cards.includes(stone));
  assert.ok(candidate.supporterTurn>0,'Supporter quota must be spent');

  play('Attach searched Float Stone to Benched Trubbish',stone,bench);
  assert.ok(candidate.bench[0].tools.includes(stone));
  assert.equal(blocked(),false,
    'Attached Tool without Garbodor should not trigger Garbotoxin');

  play('Boost Shake turn-ending Item',shake,board);
  answer('Boost Shake own-deck Garbodor search',[garb],'ChooseCardsPrompt');
  const afterSearchAdmin=drainAdministrative();
  answer('Evolve the equipped Benched Trubbish',
    [candidate.bench[0]],'ChoosePokemonPrompt');
  const afterEvolutionAdmin=drainAdministrative();
  assert.strictEqual(candidate.bench[0].getPokemonCard(),garb);
  assert.ok(candidate.bench[0].cards.includes(trub));
  assert.ok(candidate.bench[0].tools.includes(stone));
  assert.ok(!candidate.deck.cards.includes(garb));
  assert.equal(blocked(),true,
    'Actual Store Garbotoxin should suppress opponent Underworld Door');

  return {...audit,
    sourcePrintsUnprized:true,
    arvenTurnCostPaid:true,
    searchedItemAndToolHeld:true,
    targetWasBench:true,
    boostShakePrintedTurnEndingEffect:true,
    observedTurnAfterLine:state.turn,
    observedPhaseAfterLine:state.phase,
    observedActivePlayerAfterLine:state.activePlayer,
    noOutstandingStorePrompt:pending()===undefined,
    benchedGarbodorWithTool:true,
    opponentAbilityBlocked:true,
    physicalCustodyAfterLine:{
      activeName:candidate.active.getPokemonCard()?.fullName,
      benchedEvolutionName:candidate.bench[0].getPokemonCard()?.fullName,
      benchedEvolutionPhysicalId:candidate.bench[0].getPokemonCard()?.id,
      benchedBasicPhysicalId:trub.id,
      benchedToolName:stone.fullName,
      benchedToolPhysicalId:candidate.bench[0].tools[0]?.id,
      searchedItemStillInHand:candidate.hand.cards.includes(shake),
      searchedToolStillInHand:candidate.hand.cards.includes(stone),
      searchedEvolutionStillInDeck:candidate.deck.cards.includes(garb),
      supporterQuotaObserved:candidate.supporterTurn
    },
    adminPrompts:{afterArven:afterArvenAdmin,afterBoostShakeSearch:
      afterSearchAdmin,afterEvolution:afterEvolutionAdmin},
    qualification:'Staged native Store mechanics canary only; no competitive games'};
}

/** @returns {object} */
function run(){
  const rows=[0,1].map(probeArvenShake);
  assert.equal(rows.length,2);
  return {schema:'agent38-arven-shake-staged-native-mechanics-v1',
    rows,claim:'opt-in staged Store card-mechanics probe; no opponent game win'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probeArvenShake,run};
