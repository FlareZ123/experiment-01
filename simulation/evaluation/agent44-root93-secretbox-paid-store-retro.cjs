'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runStewardBilateralProbeV9,writeJsonAtomic}=
  require('./agent36-issue25-common-v9-bilateral-competence.cjs');

const ROOT=path.resolve(__dirname,'../..');
const output=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(output,p));
const EXPECTED_HAND='9ad521c3355b19e9c3cda272b2bd1942fb09200d01b377785b0839014505cca6';
const TARGET_TRIAL='11:1000:B:new-moon-lockbreaker-v1';
const SENTINEL='AGENT44_RETROSPECTIVE_ROOT93_STOP_AFTER_PAID_SECRET_BOX';
const OUT_FILE=path.join(ROOT,'artifacts/agent44-root93-secretbox-paid-store-retro.json');
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Replay a fixed DEVELOPMENT seed to its first candidate Pass, then use real
 * Store dispatch for a single owner-hand Secret Box action and its mandatory
 * payment/search prompts. The original optimizer's Pass is never counted as
 * a native win/loss; this is an explicit retrospective intervention.
 *
 * @returns {object} Real physical owner card custody and prefix identity.
 */
function run(){
  const {Store}=native('game/store/store');
  const {PassTurnAction}=native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const stateProof={trial:TARGET_TRIAL,
    referenceCI:'42332015390',
    referenceArtifact:'13558301530',
    referenceRootOrdinal:93,
    referenceOwnerHandSha256:EXPECTED_HAND,
    experimental:false,postExposureRetrospective:true,
    qualifiedCompetitiveGames:0};
  let liveStore=null,receipt=null,seenMax=-1,passesAt14=0;

  function installedRunner(options){
    const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
    assert.equal(typeof previous?.value,'function');
    const callOriginal=(store,action,args=[])=>
      previous.value.call(store,action,...args);

    /** @param {object} action @param {...any} args */
    function dispatch(action,...args){
      if(this!==liveStore||!(action instanceof PassTurnAction))
        return callOriginal(this,action,args);
      const state=this.state;
      if(state.turn!==14||state.activePlayer!==1||
          state.players[1]?.id!==action.clientId)
        return callOriginal(this,action,args);
      passesAt14++;
      const owner=state.players[1],opponent=state.players[0];
      const handBefore=owner.hand.cards.map(card=>card.fullName);
      const handDigest=sha(handBefore);
      if(handDigest!==EXPECTED_HAND)return callOriginal(this,action,args);
      assert.equal(receipt,null,'Root93 action must be intercepted once');
      const boxIndex=owner.hand.cards.findIndex(card=>
        card.fullName==='Secret Box TWM');
      assert.ok(boxIndex>=0);
      const box=owner.hand.cards[boxIndex];
      const items=owner.hand.cards.filter(card=>
        card.fullName==='Battle VIP Pass FST');
      const supporters=owner.hand.cards.filter(card=>
        card.fullName==="Lillie's Determination M1L");
      assert.equal(items.length,2);
      assert.equal(supporters.length,2);
      const cost=[items[0],items[1],supporters[1]];
      assert.equal(new Set(cost).size,3);
      const publicBoardBefore=state.players.map(p=>({
        active:p.active.getPokemonCard()?.fullName??null,
        bench:p.bench.map(s=>s.getPokemonCard()?.fullName??null),
        stadium:p.stadium.cards.map(c=>c.fullName),
        prizeCount:p.prizes.reduce((n,slot)=>n+slot.cards.length,0)
      }));
      const result={...stateProof,handDigest,handBefore,
        targetMatched:true,priorAcceptedOrdinalMax:seenMax,
        actionOriginallyOffered:'PassTurnAction',
        actualOwnerSeat:1,opponentSeat:0,
        publicBoardBefore,
        ownerHandIdSet:owner.hand.cards.map(c=>c.id),
        desiredDiscard:['Battle VIP Pass FST','Battle VIP Pass FST',
          "Lillie's Determination M1L"],
        acceptedBoxRoot:false,acceptedPayment:false,
        acceptedSearch:false,promptTrace:[],
        selectedSearchPrintings:[],
        error:null,fullGameSettled:false,qualifiedCompetitiveGames:0};
      receipt=result;
      const pending=()=>this.state.prompts.find(p=>p.result===undefined);
      try{
        // Truly dispatch the original owner-held ACE SPEC into the pinned
        // Store. Native card code handles the mandatory discard and search.
        callOriginal(this,new PlayCardAction(owner.id,boxIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0
        }),args);
        result.acceptedBoxRoot=true;
        let p=pending();
        assert.equal(p?.constructor.name,'ChooseCardsPrompt');
        assert.equal(p.sourceCard?.fullName,'Secret Box TWM');
        result.promptTrace.push({kind:p.constructor.name,
          message:p.message,owner:p.playerId===owner.id,
          min:p.options?.min,max:p.options?.max,
          offered:p.cards.cards.length});
        assert.equal(p.playerId,owner.id);
        assert.ok(cost.every(c=>p.cards.cards.includes(c)&&
          owner.hand.cards.includes(c)));
        assert.equal(p.validate(cost,this.state),true);
        callOriginal(this,new ResolvePromptAction(p.id,cost),args);
        result.acceptedPayment=cost.every(c=>owner.discard.cards.includes(c));
        assert.equal(result.acceptedPayment,true);
        p=pending();
        assert.equal(p?.constructor.name,'ChooseCardsPrompt');
        assert.equal(p.sourceCard?.fullName,'Secret Box TWM');
        const deckSearchCards=p.cards.cards;
        const fog=deckSearchCards.find(c=>c.fullName==='Fog Crystal CRE');
        const searchSelection=fog?[fog]:[];
        result.promptTrace.push({kind:p.constructor.name,
          message:p.message,owner:p.playerId===owner.id,
          min:p.options?.min,max:p.options?.max,
          offered:deckSearchCards.length,
          fogCrystalAvailable:!!fog});
        assert.equal(p.playerId,owner.id);
        assert.equal(p.validate(searchSelection,this.state),true);
        callOriginal(this,new ResolvePromptAction(p.id,searchSelection),args);
        result.selectedSearchPrintings=searchSelection.map(c=>c.fullName);
        result.acceptedSearch=searchSelection.every(c=>
          owner.hand.cards.includes(c));
        assert.equal(result.acceptedSearch,true);
        // Resolve only nondiscretionary prompt tail, without entering any
        // future turn or using the owner's concealed deck as a policy input.
        for(let i=0;i<8;i++){
          const next=pending();
          if(!next)break;
          const kind=next.constructor.name;
          let selection;
          if(kind==='ShowCardsPrompt')selection=true;
          else if(kind==='ShuffleDeckPrompt')
            selection=owner.deck.cards.map((_,index)=>index);
          else if(kind==='WaitPrompt')selection=null;
          else break;
          result.promptTrace.push({kind,owner:next.playerId===owner.id});
          callOriginal(this,new ResolvePromptAction(next.id,selection),args);
        }
        result.remainingPromptTypes=this.state.prompts
          .filter(p=>p.result===undefined).map(p=>p.constructor.name);
        result.handAfter=owner.hand.cards.map(c=>c.fullName);
        result.discardAfter=owner.discard.cards.map(c=>c.fullName);
        result.supporterZoneAfter=owner.supporter.cards.map(c=>c.fullName);
        result.boxCustody={hand:owner.hand.cards.includes(box),
          supporter:owner.supporter.cards.includes(box),
          discard:owner.discard.cards.includes(box)};
        result.opponentHandContentsObserved=false;
        result.ownerDeckContentsBeforeSearchObserved=false;
      }catch(error){
        result.error=String(error?.stack??error).slice(0,5000);
      }
      // The true Pass is never dispatched. Stop immediately after the native
      // fork to avoid a malformed game or accidental competitiveness claim.
      throw Error(SENTINEL);
    }
    Object.defineProperty(Store.prototype,'dispatch',{
      ...previous,value:dispatch});
    try{
      return runDevelopment({...options,
        onRootStoreCreated:store=>{
          liveStore=store;
          options.onRootStoreCreated?.(store);
        },
        onRootActionDispatched:(store,action,ordinal,seat,turnBefore)=>{
          if(store===liveStore&&Number.isSafeInteger(ordinal))
            seenMax=Math.max(seenMax,ordinal);
          options.onRootActionDispatched?.(
            store,action,ordinal,seat,turnBefore);
        }
      });
    }finally{
      assert.strictEqual(Store.prototype.dispatch,dispatch);
      Object.defineProperty(Store.prototype,'dispatch',previous);
    }
  }

  let exitReason=null;
  try{runStewardBilateralProbeV9({runner:installedRunner});}
  catch(e){exitReason=String(e?.message??e).slice(0,1000);}
  const result={...stateProof,
    capture:receipt,exitReason,passesAt14,
    hitTarget:receipt!==null,
    nativeStorePaymentVerified:receipt?.acceptedBoxRoot===true&&
      receipt?.acceptedPayment===true,
    nativeStoreFogSearchVerified:receipt?.acceptedSearch===true&&
      receipt?.selectedSearchPrintings.includes('Fog Crystal CRE')===true,
    competitionQualified:false};
  writeJsonAtomic(OUT_FILE,result);
  console.log('AGENT44_ROOT93_SECRETBOX_PAID_STORE '+JSON.stringify({
    artifact:OUT_FILE,hitTarget:result.hitTarget,
    priorAcceptedOrdinalMax:receipt?.priorAcceptedOrdinalMax??null,
    box:receipt?.acceptedBoxRoot??false,
    paid:receipt?.acceptedPayment??false,
    fog:result.nativeStoreFogSearchVerified,
    originalRoot:receipt?.actionOriginallyOffered??null,
    pending:receipt?.remainingPromptTypes??null,
    custody:receipt?.boxCustody??null,
    error:receipt?.error??null,
    exitReason
  }));
  assert.ok(receipt,'Current common-policy replay did not reach the exact archived first Pass');
  assert.equal(receipt.priorAcceptedOrdinalMax,92,
    'Exact 93-root native prefix identity must be retained');
  assert.equal(receipt.error,null,'Native replacement must settle');
  assert.equal(result.nativeStorePaymentVerified,true);
  assert.equal(result.nativeStoreFogSearchVerified,true,
    'Archived later Fog Crystal print must be searchable at this exact root');
  return result;
}

if(require.main===module)run();
module.exports={run,EXPECTED_HAND,TARGET_TRIAL};
