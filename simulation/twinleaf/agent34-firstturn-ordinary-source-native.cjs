'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {withPaperSupporterQuotaGuard,PaperFirstTurnSupporterError}=
  require('./paper-supporter-quota-guard.cjs');
const {scenario,SEEDS,visibleFirstRoot}=
  require('./agent48-firstturn-carmine-native-probe.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));

/**
 * Temporarily propose an ordinary printed Supporter on the real first owner's
 * first turn when naturally held in their unchanged source physical hand.
 * Store dispatch is observed independently. This is intentionally an
 * adversarial paper-legality test, never a competitive action policy.
 *
 * @template T
 * @param {()=>T} run A synchronous real headless source match.
 * @returns {{result:T,offer:object|null,settlement:object|null}}
 */
function withOrdinaryFirstTurnProposal(run){
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {Store}=native('game/store/store');
  const {TrainerType}=native('game/store/card/card-types');
  const {GamePhase}=native('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const bot=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const store=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof bot?.value,'function');
  assert.equal(typeof store?.value,'function');
  let offer=null,forcedAction=null,settlement=null;

  function choose(state){
    const owner=state?.players?.[state.activePlayer];
    if(!offer&&state.turn===1&&state.phase===GamePhase.PLAYER_TURN&&
        !state.prompts.some(p=>p.result===undefined)&&
        owner&&this.client?.id===owner.id){
      const index=owner.hand.cards.findIndex(card=>
        card.trainerType===TrainerType.SUPPORTER&&
        card.fullName!=='Carmine TWM');
      if(index>=0){
        const card=owner.hand.cards[index];
        offer={turn:state.turn,seat:state.activePlayer,
          ownerId:owner.id,handIndex:index,printing:card.fullName,
          nativeCardCanPlay:card.canPlay(null,state,owner)===true,
          ownerView:visibleFirstRoot(state)};
        forcedAction=new PlayCardAction(owner.id,index,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0
        });
        return forcedAction;
      }
    }
    return bot.value.call(this,state);
  }

  function inspect(action,...args){
    if(action!==forcedAction)return store.value.apply(this,[action,...args]);
    assert.ok(offer);
    assert.equal(settlement,null);
    const owner=this.state.players[offer.seat];
    const card=owner.hand.cards[action.handIndex];
    assert.equal(card?.fullName,offer.printing);
    const before={turn:this.state.turn,ownerSupporterCount:owner.supporterTurn,
      ownerHand:owner.hand.cards.map(c=>c.fullName)};
    try{
      const result=store.value.apply(this,[action,...args]);
      settlement={status:'returned-from-native-dispatch',
        before,after:{ownerSupporterCount:owner.supporterTurn,
          ownerHand:owner.hand.cards.map(c=>c.fullName)},
        physicalCardLeftHand:!owner.hand.cards.includes(card)};
      return result;
    }catch(error){
      settlement={status:'rejected-before-dispatch-return',
        errorName:error?.name??null,
        errorMessage:String(error?.message??error),
        before,after:{ownerSupporterCount:owner.supporterTurn,
          ownerHand:owner.hand.cards.map(c=>c.fullName)},
        physicalCardLeftHand:!owner.hand.cards.includes(card)};
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...bot,value:choose});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...store,value:inspect});
  try{return {result:run(),offer,settlement};}
  finally{
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',bot);
    Object.defineProperty(Store.prototype,'dispatch',store);
  }
}

/**
 * Original source-dealt first-turn ordinary-Supporter paper veto with no
 * fabricated hand: all 24 archived Carmine-panel source seeds are retained.
 * This is deliberately failure-inclusive and records what native Store does
 * when bypassing the ordinary tactics, rather than assuming a rules defect.
 *
 * @returns {object}
 */
function runAudit(){
  const {Store}=native('game/store/store');
  const {TrainerType}=native('game/store/card/card-types');
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const one=manifest.decks.find(x=>x.rank===1);
  const eleven=manifest.decks.find(x=>x.rank===11);
  assert.ok(one?.playableUnderEngine&&eleven?.playableUnderEngine);
  const originalStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const trials=[];
  for(const seed of SEEDS){
    const setup={seed,deckA:one.cardIds,deckB:eleven.cardIds};
    const natural=scenario(setup,false);
    const adversarial=withOrdinaryFirstTurnProposal(
      ()=>scenario(setup,false));
    const initialOwnerSame=JSON.stringify(natural.firstOwner?.ownerHand)===
      JSON.stringify(adversarial.result.firstOwner?.ownerHand)&&
      natural.firstOwner?.ownerSeat===adversarial.result.firstOwner?.ownerSeat;
    if(natural.firstOwner&&adversarial.result.firstOwner)
      assert.ok(initialOwnerSame,
        'Pre-choice source first-owner physical hand must match');
    let guarded=null;
    if(adversarial.offer){
      const guardVetoes=[];
      const test=withPaperSupporterQuotaGuard(Store,TrainerType.SUPPORTER,
        ()=>withOrdinaryFirstTurnProposal(()=>scenario(setup,false)),{
          enforceFirstPlayerSupporter:true,
          onViolation:x=>guardVetoes.push(x)
        });
      guarded={...test.result,guardVetoes,
        legalSupporterRoots:test.legalSupporterRoots};
      assert.deepEqual(guarded.offer,adversarial.offer);
      assert.ok(guarded.result?.error,
        'Headless must report a censored first-turn violation');
      assert.equal(guardVetoes.length,1,
        'Pre-dispatch callback must certify the exact ordinary Supporter veto');
      assert.equal(guarded.settlement?.status,
        'rejected-before-dispatch-return');
      assert.equal(guarded.settlement?.physicalCardLeftHand,false);
      assert.equal(guarded.settlement?.after.ownerSupporterCount,0);
      assert.equal(guardVetoes.length,1);
      assert.equal(guardVetoes[0].card,adversarial.offer.printing);
      assert.equal(guardVetoes[0].rejectedBeforeNativeDispatch,true);
      assert.equal(test.legalSupporterRoots.length,0);
    }
    assert.strictEqual(
      Object.getOwnPropertyDescriptor(Store.prototype,'dispatch').value,
      originalStore.value,'Native Store dispatch must restore per source seed');
    trials.push({seed,originalSourceRanks:[1,11],
      initialOwnerSame,actualOwner:adversarial.result.firstOwner?.ownerSeat,
      naturalError:natural.error,forcedOrdinary:adversarial,
      paperGuarded:guarded});
  }
  const exposures=trials.filter(x=>x.forcedOrdinary.offer);
  return {
    schema:'agent34-firstturn-ordinary-supporter-original-source-native-v1',
    sourceRanks:[1,11],seeds:[...SEEDS],trials:trials.length,
    ownerHeldOrdinarySupporterFirstRoot:exposures.length,
    nativeDirectPlayCardReturns:exposures.filter(x=>
      x.forcedOrdinary.settlement?.status===
      'returned-from-native-dispatch').length,
    nativeDirectPlayCardRejects:exposures.filter(x=>
      x.forcedOrdinary.settlement?.status===
      'rejected-before-dispatch-return').length,
    researchGuardPreDispatchVetoes:exposures.filter(x=>
      x.paperGuarded?.guardVetoes?.length===1).length,
    qualifiedCompetitiveGames:0,
    caveat:'Intentional illegal-card proposal at genuine first-owner source hand, not a legal strategy. Native accepted dispatch is not proof of full resolved Supporter effect; all game outcomes are unqualified.',
    trials
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');

module.exports={withOrdinaryFirstTurnProposal,runAudit};
