'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {actorObservation} = require('./actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent} =
  require('./agent34-actor-only-root-policy.cjs');
const {actorToolPrintingCatalog,enumerateActorToolCandidates}=
  require('./agent18-actor-tool-candidate-frontier.cjs');
const {collectAndChooseOwnerRoot,VERSION:SAME_ROOT_VERSION}=
  require('./agent41-same-root-proposal-choice.cjs');
const {buildNativeOwnerToolCandidateAction}=
  require('./agent18-native-tool-play-action.cjs');
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
  const {TrainerCard}=native('game/store/card/trainer-card');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const nativeActionTypes={PlayCardAction,PlayerType,SlotType};
  const types=native('game/store/card/card-types');
  const {PowerType}=native('game/store/card/pokemon-types');
  const catalog=buildActorCardCatalog(CardManager.getInstance().getAllCards(),{
    ...types,PokemonCard,EnergyCard,TrainerCard,PowerType
  });
  const toolCatalog=actorToolPrintingCatalog(
    CardManager.getInstance().getAllCards(),{
      TrainerCard,TrainerType:types.TrainerType
    });
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const oldDecode=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof oldDispatch?.value,'function');
  assert.equal(typeof oldDecode?.value,'function');
  let live=null;
  const seen=new Set(),rows=[],pendingFirstRoots=new WeakMap();
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&live===null)live=this;
    const receipt=this===live&&action&&typeof action==='object'?
      pendingFirstRoots.get(action):null;
    const beforeOwner=receipt?this.state.players[receipt.seat]:null;
    const beforeToolView=receipt?actorObservation(this.state,receipt.seat):null;
    const beforeHandCard=receipt&&
      Number.isInteger(receipt.nativeBotProposedHandIndex)?
      beforeOwner.hand.cards[receipt.nativeBotProposedHandIndex]:null;
    const beforeBoard=receipt?{
      ownerHandCount:beforeOwner.hand.cards.length,
      ownerBenchCount:beforeOwner.bench.filter(slot=>slot.cards.length>0).length,
      opponentHandCount:this.state.players[1-receipt.seat].hand.cards.length
    }:null;
    try{
      const result=oldDispatch.value.apply(this,[action,...args]);
      if(receipt){
        const afterOwner=this.state.players[receipt.seat];
        receipt.nativeStoreFirstActionDispatched=true;
        receipt.nativeStoreFirstActionAccepted=true;
        receipt.nativeStoreFirstActionCardLeftHand=beforeHandCard?
          !afterOwner.hand.cards.includes(beforeHandCard):null;
        const targets=[{slot:'active',index:0,pokemon:afterOwner.active},
          ...afterOwner.bench.map((pokemon,index)=>({
            slot:'bench',index,pokemon
          }))];
        const attached=beforeHandCard?targets.find(target=>
          target.pokemon.tools.includes(beforeHandCard)):null;
        receipt.nativeStoreFirstActionAttachedToolTarget=attached?{
          slot:attached.slot,index:attached.index,
          printing:beforeHandCard.fullName
        }:null;
        receipt.nativeStoreToolActionEncodingEquivalent=null;
        if(attached&&receipt.ownerToolCandidates){
          const matching=receipt.ownerToolCandidates.filter(candidate=>
            candidate.printing===attached.printing&&
            candidate.handIndex===receipt.nativeBotProposedHandIndex&&
            candidate.slot===attached.slot&&candidate.index===attached.index);
          assert.equal(matching.length,1,
            'Exactly one actor-owned Tool offer must match the actual native Tool action');
          const independent=buildNativeOwnerToolCandidateAction(
            beforeToolView,catalog,matching[0],beforeOwner.id,nativeActionTypes);
          assert.deepStrictEqual(independent,action,
            'A freshly encoded owner-only Tool candidate must equal the original native bot Action');
          receipt.nativeStoreToolActionEncodingEquivalent=true;
          receipt.nativeStoreToolActionEncodingTarget={
            slot:matching[0].slot,index:matching[0].index,
            printing:matching[0].printing,
            handIndex:matching[0].handIndex
          };
        }
        receipt.nativeStoreFirstActionPublicBefore=beforeBoard;
        receipt.nativeStoreFirstActionPublicAfter={
          ownerHandCount:afterOwner.hand.cards.length,
          ownerBenchCount:afterOwner.bench
            .filter(slot=>slot.cards.length>0).length,
          opponentHandCount:this.state.players[1-receipt.seat].hand.cards.length
        };
        if(beforeHandCard&&receipt.nativeBotProposedHandPrinting!==null)
          assert.equal(beforeHandCard.fullName,
            receipt.nativeBotProposedHandPrinting,
            'Source first native action hand printing changed before Store dispatch');
      }
      return result;
    }catch(error){
      if(receipt){
        receipt.nativeStoreFirstActionDispatched=true;
        receipt.nativeStoreFirstActionAccepted=false;
        receipt.nativeStoreFirstActionError=String(error?.message??error);
      }
      throw error;
    }
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
        const sameRootOptions={sameRootProbeAll:true};
        const sameRoot=collectAndChooseOwnerRoot(
          before,catalog,choice,sameRootOptions);
        let altered,alteredChoice,alteredSameRoot;
        owner.deck.cards[0]=prized;
        prize.cards[0]=first;
        try{
          altered=actorObservation(state,seat);
          alteredChoice=chooseActorRootIntent(altered,catalog,{
            publicContextSpecialEnergy:true
          });
          alteredSameRoot=collectAndChooseOwnerRoot(
            altered,catalog,alteredChoice,sameRootOptions);
        }finally{
          owner.deck.cards[0]=first;
          prize.cards[0]=prized;
        }
        assert.strictEqual(owner.deck.cards[0],first);
        assert.strictEqual(prize.cards[0],prized);
        assert.deepStrictEqual(altered,before);
        assert.deepStrictEqual(alteredChoice,choice);
        assert.deepStrictEqual(alteredSameRoot,sameRoot,
          'Independent same-root offers changed under owner-invisible K0 swap');
        assert.deepStrictEqual(sameRoot.intent,choice,
          'All-proposer K0 audit must never substitute a native action');
        assert.equal(sameRoot.receipt.independentAllProposers,true);
        assert.equal(sameRoot.receipt.changed,false);
        row.status='K0-native-source-owner-invariant';
        row.sameRootCollectorVersion=SAME_ROOT_VERSION;
        row.sameRootAllProposersK0Invariant=true;
        row.sameRootReceipt=sameRoot.receipt;
        row.originalDeckTop=first.fullName;
        row.originalPrizePrinting=prized.fullName;
        row.chosenOwnerOnlyIntent=choice;
        row.ownerToolCandidates=enumerateActorToolCandidates(before,toolCatalog);
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
    if(annotatedRow){
      annotatedRow.nativeBotProposedActionClass=
        nativeBotAction?.constructor?.name??null;
      const index=Number.isInteger(nativeBotAction?.handIndex)?
        nativeBotAction.handIndex:null;
      annotatedRow.nativeBotProposedHandIndex=index;
      annotatedRow.nativeBotProposedHandPrinting=index===null?
        null:(annotatedRow.ownerKnownHand?.[index]??null);
      annotatedRow.nativeStoreFirstActionDispatched=false;
      annotatedRow.nativeStoreFirstActionAccepted=false;
      if(nativeBotAction&&typeof nativeBotAction==='object')
        pendingFirstRoots.set(nativeBotAction,annotatedRow);
    }
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
      r.physicalObjectsRestored===true&&
      r.nativeStoreFirstActionDispatched===true&&
      r.nativeStoreFirstActionAccepted===true),
      'First genuine original Store actions must be dispatched and accepted');
    arms.push({rankA:first,rankB:second,seed:SEED,
      sourceNativeRoots:observed.rows,
      sameOutcomeWithObserver:true,outcome:outcome(unobserved)});
  }
  return {schema:'agent18-aichi-source-K0-native-root-v7-typed-tool-native-parity',
    sameRootCollectorVersion:SAME_ROOT_VERSION,
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    arms,originalFullSixties:true,competitiveQualifiedGames:0,
    caveat:'First owner roots in real 60-card source games, temporary hidden permutation restored before original bot decision; no opponent policy qualification or win-rate evidence.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={observeSourceK0,sourceDecks,run};
