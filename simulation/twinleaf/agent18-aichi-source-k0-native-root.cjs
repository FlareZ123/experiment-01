'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {actorObservation} = require('./actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent} =
  require('./agent34-actor-only-root-policy.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(root,p));
const SEED=4246551499;
const MAX_ACTIONS=75;

/** @param {()=>unknown} execute Actual native headless match only. */
function observeSourceK0(execute){
  assert.equal(typeof execute,'function');
  initializeCards();
  const {Store}=native('game/store/store');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {GamePhase}=native('game/store/state/state');
  const {CardManager}=native('game/cards/card-manager');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const types=native('game/store/card/card-types');
  const {PowerType}=native('game/store/card/pokemon-types');
  const catalog=buildActorCardCatalog(CardManager.getInstance().getAllCards(),{
    ...types,PokemonCard,EnergyCard,PowerType
  });
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const oldDecode=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof oldDispatch?.value,'function');
  assert.equal(typeof oldDecode?.value,'function');
  let live=null;
  const seen=new Set(),rows=[];
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&live===null)live=this;
    return oldDispatch.value.apply(this,[action,...args]);
  }
  function decode(state){
    let annotatedRow=null;
    const seat=state?.players?.findIndex(p=>p.id===this.client?.id)??-1;
    if(state===live?.state&&state.phase===GamePhase.PLAYER_TURN&&
       seat>=0&&seat<2&&state.activePlayer===seat&&
       !state.prompts?.some(p=>p.result===undefined)&&!seen.has(seat)){
      seen.add(seat);
      const owner=state.players[seat],first=owner.deck.cards[0];
      const prize=owner.prizes.find(slot=>slot.isSecret&&
        slot.cards.length===1&&slot.cards[0].fullName!==first?.fullName);
      const row={seat,turn:state.turn,rootFromOriginalStore:true,
        K0ByFirstActualOwnerRoot:true,sourceDeckCards:owner.deck.cards.length,
        faceDownPrizeCount:owner.prizes.filter(p=>p.isSecret).length};
      if(!first||!prize)row.status='no-distinct-unseen-deck-prize-pair';
      else {
        const prized=prize.cards[0];
        const before=actorObservation(state,seat);
        const choice=chooseActorRootIntent(before,catalog,{
          publicContextSpecialEnergy:true
        });
        let altered,alteredChoice;
        owner.deck.cards[0]=prized;
        prize.cards[0]=first;
        try{
          altered=actorObservation(state,seat);
          alteredChoice=chooseActorRootIntent(altered,catalog,{
            publicContextSpecialEnergy:true
          });
        }finally{
          owner.deck.cards[0]=first;
          prize.cards[0]=prized;
        }
        assert.strictEqual(owner.deck.cards[0],first);
        assert.strictEqual(prize.cards[0],prized);
        assert.deepStrictEqual(altered,before);
        assert.deepStrictEqual(alteredChoice,choice);
        row.status='K0-native-source-owner-invariant';
        row.originalDeckTop=first.fullName;
        row.originalPrizePrinting=prized.fullName;
        row.chosenOwnerOnlyIntent=choice;
        row.ownerKnownHand=[...before.ownHand];
        row.ownActivePublicPrinting=before.ownPublic.active?.printing??null;
        row.ownBenchPublicPrintings=before.ownPublic.bench
          .map(slot=>slot?.printing).filter(Boolean);
        row.opponentActivePublicPrinting=
          before.opponentPublic.active?.printing??null;
        row.physicalObjectsRestored=true;
      }
      rows.push(row);
      annotatedRow=row;
    }
    const nativeBotAction=oldDecode.value.call(this,state);
    if(annotatedRow)annotatedRow.nativeBotProposedActionClass=
      nativeBotAction?.constructor?.name??null;
    return nativeBotAction;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...oldDispatch,value:dispatch});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...oldDecode,value:decode});
  try{return {result:execute(),rows};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',oldDecode);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
  }
}

/** @returns {object} Fixed, complete original Aichi 60s, without deck edits. */
function sourceDecks(){
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(field.decks.map(d=>[d.rank,d]));
  for(const rank of [1,11]){
    assert.equal(byRank.get(rank)?.playableUnderEngine,true);
    assert.equal(byRank.get(rank).cardIds.length,60);
  }
  return byRank;
}

/** @returns {object} Two source orientations with failure-inclusive receipts. */
function run(){
  const decks=sourceDecks(),arms=[];
  for(const first of [1,11]){
    const second=first===1?11:1;
    const request={deckA:decks.get(first).cardIds,
      deckB:decks.get(second).cardIds,
      seed:SEED,maxActions:MAX_ACTIONS,
      label:'agent18-source-K0-rank'+first+'-versus-'+second,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      postSuperAliasRepairIsolation:true,
      supporterDecisionCorrection:true};
    const unobserved=runMatch(request);
    const observed=observeSourceK0(()=>runMatch(request));
    const outcome=result=>({
      deckHashes:result.deckHashes,
      winner:result.winner,actions:result.actions,
      turns:result.turns,endReason:result.endReason,
      prizesRemaining:result.prizesRemaining
    });
    assert.deepStrictEqual(outcome(unobserved),outcome(observed.result),
      'Read-only K0 observer changed the original source Store outcome');
    assert.equal(observed.rows.length,2,
      'Both original printed 60-card seats need an actual owner root');
    assert.ok(observed.rows.every(r=>
      r.status==='K0-native-source-owner-invariant'&&
      r.physicalObjectsRestored===true));
    arms.push({rankA:first,rankB:second,seed:SEED,
      sourceNativeRoots:observed.rows,
      sameOutcomeWithObserver:true,outcome:outcome(unobserved)});
  }
  return {schema:'agent18-aichi-source-K0-native-root-v2',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    arms,originalFullSixties:true,competitiveQualifiedGames:0,
    caveat:'First owner roots in real 60-card source games, temporary hidden permutation restored before original bot decision; no opponent policy qualification or win-rate evidence.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={observeSourceK0,sourceDecks,run};
