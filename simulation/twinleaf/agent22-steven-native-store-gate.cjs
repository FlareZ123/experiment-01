'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {actorSingleSearchInput} = require('./agent41-actor-owner-single-search.cjs');
const {sparseObservedOwnerSearch,withSparseActorOwnerSearch} =
  require('./agent22-sparse-owner-search-adapter.cjs');

const base = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native = file => require(path.join(base,file));
const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Reproducible native Store/printed-card integration fixture. The opening and
 * exact opponent board are deliberately staged; no real-deal frequency or
 * game-strength inference is permitted. Both actors use rank-7 source 60.
 * @returns {object}
 */
function run() {
  const manager = initializeCards();
  const manifest = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const source = manifest.decks.find(deck=>deck.rank===7);
  assert.ok(source && source.playableUnderEngine && source.cardIds.length===60,
    'Published rank-7 60 must resolve to genuine pinned native cards');
  const {Store} = native('game/store/store');
  const {Player} = native('game/store/state/player');
  const {CardList} = native('game/store/state/card-list');
  const {GamePhase} = native('game/store/state/state');
  const {Format} = native('game/store/card/card-types');
  const {AddPlayerAction} = native('game/store/actions/add-player-action');
  const {PlayCardAction,PlayerType,SlotType} =
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    native('game/store/actions/resolve-prompt-action');
  const {SimpleTacticsAi} = native('simple-bot/simple-tactics-ai');

  const records=[];
  const originalBot=SimpleTacticsAi.prototype.decodeNextAction;
  const originalDispatch=Store.prototype.dispatch;
  const wrapped=withSparseActorOwnerSearch(()=>{
    for(const seat of [0,1]) {
      const store=new Store({onStateChange(){}});
      store.state.gameSettings.format=Format.EXPANDED;
      const ownerId=101+seat;
      store.dispatch(new AddPlayerAction(ownerId,
        'Rank7 printed source in staged position',source.cardIds));
      const state=store.state,owner=state.players[0];
      assert.equal(owner.id,ownerId);
      assert.equal(owner.deck.cards.length,60);
      const take=(predicate,destination)=>{
        const card=owner.deck.cards.find(predicate);
        assert.ok(card,'Source deck lacks staged card');
        owner.deck.moveCardTo(card,destination);
        return card;
      };
      const steven=take(c=>c.fullName==="Steven's Resolve CES",owner.hand);
      const starter=take(c=>c.fullName==='Wobbuffet PHF',owner.hand);
      for(let i=0;i<5;i++)take(()=>true,owner.hand);
      assert.equal(owner.hand.cards.length,7);
      for(let i=0;i<6;i++)take(()=>true,owner.prizes[i]);
      take(()=>true,owner.hand); // the mandatory first-turn draw
      owner.hand.moveCardTo(starter,owner.active);
      assert.equal(owner.deck.cards.length,46);
      assert.equal(owner.active.getPokemonCard(),starter);
      const opponent=new Player();
      opponent.id=201+seat;
      opponent.name='staged live Store opponent';
      const opposition=manager.getCardByName('Pidgey MEW');
      assert.ok(opposition);
      opponent.active.cards.push(opposition);
      for(let i=0;i<6;i++){
        const prize=new CardList();
        prize.cards.push(manager.getCardByName('Psychic Energy SVE'));
        opponent.prizes.push(prize);
      }
      opponent.deck.cards.push(manager.getCardByName('Psychic Energy SVE'));
      state.players=seat===0?[owner,opponent]:[opponent,owner];
      state.activePlayer=seat;
      state.turn=2;
      state.phase=GamePhase.PLAYER_TURN;
      const index=owner.hand.cards.indexOf(steven);
      assert.ok(index>=0);
      store.dispatch(new PlayCardAction(owner.id,index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
      const pending=state.prompts.find(p=>p.result===undefined&&
        p.constructor.name==='ChooseCardsPrompt'&&p.playerId===owner.id);
      assert.ok(pending,'Printed Steven must create native live ChooseCardsPrompt');
      assert.strictEqual(pending.cards,owner.deck);
      assert.equal(pending.options.max,3);
      assert.equal(owner.deck.cards.length,46);
      const standard=actorSingleSearchInput(state,seat);
      assert.equal(standard,null,'Original >30 complete-menu limit expected');
      const sparse=sparseObservedOwnerSearch(state,seat);
      assert.equal(sparse.prompt.bundles[0].printings.length,3);
      assert.ok(!JSON.stringify(sparse).includes('staged live Store opponent'));
      const bot=new SimpleTacticsAi({id:owner.id},
        {tactics:[],promptResolvers:[]},null);
      const chosen=bot.decodeNextAction(state);
      assert.ok(chosen instanceof ResolvePromptAction);
      assert.equal(chosen.result.length,3);
      assert.ok(pending.validate(chosen.result));
      const printings=chosen.result.map(card=>card.fullName);
      store.dispatch(chosen);
      assert.ok(printings.every(name=>owner.hand.cards.some(c=>c.fullName===name)),
        'Native settled three-card Steven selection must enter owner hand');
      assert.equal(owner.deck.cards.length,43);
      records.push({seat,sourceRank:7,initialDeckCards:46,
        originalProjection:'unavailable-above-30',nativeValid:true,
        nativeSearchSettled:true,chosenPrintings:printings,
        remainingDeck:owner.deck.cards.length,
        resultingTurn:state.turn,ownHandCount:owner.hand.cards.length});
    }
    return records;
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,originalBot);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
  assert.equal(wrapped.audit.accepted,2);
  assert.equal(wrapped.audit.nativePromptPostconditionsConfirmed,2);
  assert.equal(records.length,2);
  assert.deepEqual(records[0].chosenPrintings,records[1].chosenPrintings);
  return {schema:'agent22-steven-authentic-card-staged-native-store-v1',
    pin:PIN,printedSourceRank:7,staged:true,actorObservationOriginal:true,
    ownerPhysicalSeats:[0,1],records,audit:wrapped.audit,
    competitiveQualifiedGames:0};
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
