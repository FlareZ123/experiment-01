'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {withNumericShuffleValidator} =
  require('./agent22-numeric-shuffle-validation-hook.cjs');

const base = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native = name => require(path.join(base,name));
const MANIFEST=path.resolve(__dirname,
  '../../results/aichi-2026/full-decklists.json');
const STRATEGIC_PRINTINGS=['VS Seeker PHF',
  'Counter Catcher PAR','Capture Energy RCL'];

/** @param {string[]} printings */
function fingerprint(printings) {
  return createHash('sha256').update(JSON.stringify(printings))
    .digest('hex');
}

/**
 * Stage a controlled physically conserved 60 from the authenticated rank7
 * printing list. The seven-card hand and six Prizes are deterministic
 * illustrative selections, not an actual random opening.
 *
 * @param {0|1} seat Acting physical owner seat.
 * @returns {object} Independent physical Store and exact starting zones.
 */
function stageSource(seat) {
  const manager=initializeCards();
  const manifest=resolveManifestFile(MANIFEST,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=manifest.decks.find(row=>row.rank===7);
  assert.ok(source?.playableUnderEngine,'Rank7 cannot resolve');
  assert.equal(source.cardIds.length,60);
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const {AddPlayerAction}=native('game/store/actions/add-player-action');

  const store=new Store({onStateChange(){}});
  store.state.gameSettings.format=Format.EXPANDED;
  store.dispatch(new AddPlayerAction(201,
    'original rank7 printed 60 controlled branch',source.cardIds));
  const state=store.state,owner=state.players[0];
  assert.equal(owner.deck.cards.length,60);
  const originalPrintings=owner.deck.cards.map(c=>c.fullName).sort();
  /** @param {(card:object)=>boolean} predicate @param {object} destination */
  function take(predicate,destination) {
    const selected=owner.deck.cards.find(predicate);
    assert.ok(selected,'Expected source printing not available');
    owner.deck.moveCardTo(selected,destination);
    return selected;
  }
  const active=take(c=>c.fullName==='Snorlax PGO',owner.active);
  const steven=take(c=>c.fullName==="Steven's Resolve CES",owner.hand);
  const palace=take(c=>c.fullName==='Palace Book SMP',owner.hand);
  const protectedPrintings=new Set(STRATEGIC_PRINTINGS);
  for(let i=0;i<5;i++)take(c=>
    !protectedPrintings.has(c.fullName),owner.hand);
  assert.equal(owner.hand.cards.length,7);
  assert.equal(owner.prizes.length,6);
  for(const prize of owner.prizes){
    take(c=>!protectedPrintings.has(c.fullName),prize);
  }

  const opponent=new Player();
  opponent.id=202;
  opponent.name='controlled opposing Active, no opponent policy';
  const opposition=manager.getCardByName('Shadow Rider Calyrex V CRE');
  assert.ok(opposition);
  opponent.active.cards.push(opposition);
  for(let i=0;i<6;i++){
    const prize=new CardList();
    const card=manager.getCardByName('Psychic Energy MEE');
    assert.ok(card);
    prize.cards.push(card);
    opponent.prizes.push(prize);
  }
  opponent.deck.cards.push(manager.getCardByName('Psychic Energy MEE'));
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=3;
  state.phase=GamePhase.PLAYER_TURN;

  const remainingPrintings=owner.deck.cards.map(c=>c.fullName);
  const handPrintings=owner.hand.cards.map(c=>c.fullName);
  const prizePrintings=owner.prizes.map(p=>p.cards.map(c=>c.fullName));
  assert.equal(remainingPrintings.length,46);
  const all=[...owner.deck.cards,...owner.hand.cards,
    ...owner.active.cards,...owner.prizes.flatMap(p=>p.cards)];
  assert.equal(all.length,60,'Original source deck must remain conserved');
  assert.equal(new Set(all).size,60,'Every physical source card unique');
  assert.deepEqual(all.map(c=>c.fullName).sort(),originalPrintings);
  return {
    store,state,owner,seat,steven,palace,
    initialSourceFingerprint:fingerprint(originalPrintings),
    initialPhysicalZonesFingerprint:fingerprint(
      [remainingPrintings,handPrintings,...prizePrintings,
       owner.active.getPokemonCard().fullName].flat()),
    deckBefore:remainingPrintings,
    handBefore:handPrintings,
    prizeBefore:prizePrintings
  };
}

/**
 * Execute a genuine printed Item or Supporter root on the same rank7
 * physical zones. Validated search replies use the owner's actual deck.
 *
 * @param {0|1} seat Original rank7 actor seat.
 * @param {'palace'|'steven'} action Chosen turn-ending action.
 * @param {string[]} [specificPrintings=[]] Owner search bundle, if Steven.
 * @returns {object} One action-level Store receipt, not competitive play.
 */
function branch(seat,action,specificPrintings=[]) {
  return withNumericShuffleValidator(()=>{
    const f=stageSource(seat);
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    const chosen=action==='palace'?f.palace:f.steven;
    const index=f.owner.hand.cards.indexOf(chosen);
    assert.ok(index>=0);
    const initialHand=new Set(f.owner.hand.cards);
    f.store.dispatch(new PlayCardAction(f.owner.id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const promptTrace=[];
    let actualSearch=[];
    for(let n=0;n<16;n++){
      const p=f.state.prompts.find(prompt=>prompt.result===undefined);
      if(!p)break;
      const family=p.constructor.name;
      let answer=null;
      if(family==='ChooseCardsPrompt'){
        assert.equal(action,'steven');
        assert.strictEqual(p.cards,f.owner.deck);
        assert.equal(p.sourceCard?.fullName,"Steven's Resolve CES");
        assert.equal(specificPrintings.length,3);
        const selected=[];
        for(const name of specificPrintings){
          const target=f.owner.deck.cards.find(card=>
            card.fullName===name&&!selected.includes(card));
          assert.ok(target,'Source search missing '+name);
          selected.push(target);
        }
        answer=selected;
        actualSearch=selected.map(c=>c.fullName);
      }else if(family==='ShuffleDeckPrompt'){
        answer=f.owner.deck.cards.map((_,i)=>i);
      }else{
        assert.equal(family,'WaitPrompt',
          'Unexpected turn-ending printed action prompt');
      }
      assert.equal(p.validate(answer,f.state),true,
        family+' failed native validation');
      promptTrace.push({family,ownerSeat:f.state.players.findIndex(x=>
        x.id===p.playerId),nativeValidated:true});
      f.store.dispatch(new ResolvePromptAction(p.id,answer));
    }
    const ownerNewCards=f.owner.hand.cards.filter(c=>
      !initialHand.has(c)).map(c=>c.fullName);
    const allOwnerCards=[
      ...f.owner.deck.cards,...f.owner.hand.cards,
      ...f.owner.active.cards,...f.owner.bench.flatMap(x=>x.cards),
      ...f.owner.prizes.flatMap(x=>x.cards),...f.owner.discard.cards,
      ...f.owner.supporter.cards,...f.owner.lostzone.cards
    ];
    assert.equal(allOwnerCards.length,60,'Printed source 60 conservation');
    assert.equal(new Set(allOwnerCards).size,60,
      'Physical source objects must never duplicate');
    return {
      action,seat,rank:7,
      original60SourceFingerprint:f.initialSourceFingerprint,
      initialPhysicalZonesFingerprint:f.initialPhysicalZonesFingerprint,
      initialDeck46:f.deckBefore.length,
      initialHand7:f.handBefore.length,
      printedSourceCard:chosen.fullName,
      beforeTopThree:f.deckBefore.slice(0,3),
      searchedPrintings:actualSearch,
      ownerReceivedPrintings:ownerNewCards,
      sourceCardsConserved:allOwnerCards.length,
      ownerDeckAfter:f.owner.deck.cards.length,
      movedCardInDiscard:f.owner.discard.cards.includes(chosen),
      movedCardInSupporterZone:f.owner.supporter.cards.includes(chosen),
      completeTurnHandoff:f.state.turn===4&&f.state.activePlayer===1-seat,
      pendingPromptTypes:f.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name),
      promptTrace
    };
  });
}

/** @returns {object} Controlled original60 same-zone paired alternatives. */
function run() {
  const rows=[];
  for(const seat of [0,1]){
    const palace=branch(seat,'palace');
    const matched=branch(seat,'steven',palace.ownerReceivedPrintings);
    const strategic=branch(seat,'steven',STRATEGIC_PRINTINGS);
    assert.equal(palace.initialPhysicalZonesFingerprint,
      matched.initialPhysicalZonesFingerprint);
    assert.equal(palace.initialPhysicalZonesFingerprint,
      strategic.initialPhysicalZonesFingerprint);
    assert.deepEqual(
      [...palace.ownerReceivedPrintings].sort(),
      [...matched.ownerReceivedPrintings].sort(),
      'Steven can select exactly the three printed cards Palace would draw'
    );
    rows.push({seat,palace,stevenSameDraw:matched,stevenIllustrative:strategic});
  }
  return {
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    schema:'agent20-rank7-source60-turn-end-paired-v1',
    scope:'Three controlled source-conserved action counterfactuals per seat, no natural deal or gameplay policy',
    searchShuffleNumericValidationCorrected:true,
    fullOriginalOpponentUsed:false,
    competitiveQualifiedGames:0,rows
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={stageSource,branch,run};
