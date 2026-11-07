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
const FOG_OUT_FILE=path.join(ROOT,'artifacts/agent44-root93-fog-energy-attack-retro.json');
const LILLIE_OUT_FILE=path.join(ROOT,'artifacts/agent44-root93-lillie-draw-retro.json');
const PROMOTION_OUT_FILE=path.join(ROOT,'artifacts/agent44-root93-postko-promotion-retro.json');
const LILLIE_SEEDED_OUT=path.join(ROOT,'artifacts/agent44-root93-lillie-seeded-v1.json');
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Replay a fixed DEVELOPMENT seed to its first candidate Pass, then use real
 * Store dispatch for a single owner-hand Secret Box action and its mandatory
 * payment/search prompts. The original optimizer's Pass is never counted as
 * a native win/loss; this is an explicit retrospective intervention.
 *
 * @param {{followup?:boolean}} [options]
 * @returns {object} Real physical owner card custody and prefix identity.
 */
function run(options={}){
  const requireFogFollowup=options.followup===true;
  const targetLine=options.line??'secret-box';
  const promoteOpponentIndex=options.promoteOpponentIndex??null;
  const lillieShuffleSeed=options.lillieShuffleSeed??null;
  assert.ok(lillieShuffleSeed===null||
    (targetLine==='lillie'&&Number.isSafeInteger(lillieShuffleSeed)
      &&lillieShuffleSeed>=0));
  assert.ok(promoteOpponentIndex===null||
    (Number.isSafeInteger(promoteOpponentIndex)&&promoteOpponentIndex>=0&&
    promoteOpponentIndex<=4&&requireFogFollowup&&targetLine==='secret-box'));
  assert.ok(['secret-box','lillie'].includes(targetLine));
  assert.ok(!(targetLine==='lillie'&&requireFogFollowup));
  const {Store}=native('game/store/store');
  const {PassTurnAction,AttackAction}=native('game/store/actions/game-actions');
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
        if(targetLine==='lillie'){
          // Independent real owner-held Supporter alternative to the SAME
          // archived original Pass. At 6 Prizes it shuffles/draws eight.
          const priorSupporterQuota=owner.supporterTurn;
          assert.equal(priorSupporterQuota,0,
            'Only test a native Supporter alternative if quota unused');
          const lillie=supporters[0];
          const lillieIndex=owner.hand.cards.indexOf(lillie);
          assert.ok(lillieIndex>=0);
          const draw={selected:'Lillie\'s Determination M1L',
            shuffleProtocol:lillieShuffleSeed===null?
              'identity-nonpaper-negative-control':
              'SHA256-per-index-key-sorted-reproducible-pseudorandom-permutation',
            shuffleSeed:lillieShuffleSeed,
            priorSupporterQuota,
            priorOwnerHandCount:owner.hand.cards.length,
            expectedCardsDrawn:8,
            prompts:[],accepted:false,
            handAfter:[],cardInDiscard:false};
          result.lillieNative=draw;
          callOriginal(this,new PlayCardAction(owner.id,lillieIndex,{
            player:PlayerType.ANY,slot:SlotType.BOARD,index:0
          }),args);
          for(let i=0;i<16;i++){
            const p=pending();
            if(!p)break;
            let answer;
            if(p.constructor.name==='WaitPrompt')answer=null;
            else if(p.constructor.name==='ShuffleDeckPrompt'){
              const deck=owner.deck.cards;
              // Forensic aggregate only, never input to the owner policy.
              draw.deckBeforeShuffleCount=deck.length;
              draw.deckBeforeShuffleEnergyPrintings=deck.filter(card=>
                card.superType===native('game/store/card/card-types')
                  .SuperType.ENERGY).map(card=>card.fullName);
              if(lillieShuffleSeed===null){
                answer=deck.map((_,index)=>index);
              }else{
                const keyed=deck.map((_,index)=>({index,
                  key:createHash('sha256').update(
                    'agent44-root93-lillie-v1:'+lillieShuffleSeed+':'+index)
                    .digest('hex')}));
                keyed.sort((a,b)=>a.key.localeCompare(b.key));
                answer=keyed.map(row=>row.index);
              }
              draw.shuffleOrderSha256=sha(answer);
            }
            else if(p.constructor.name==='ShowCardsPrompt')answer=true;
            else break;
            draw.prompts.push({type:p.constructor.name,
              owner:p.playerId===owner.id});
            callOriginal(this,new ResolvePromptAction(p.id,answer),args);
          }
          draw.accepted=pending()===undefined;
          draw.handAfter=owner.hand.cards.map(c=>c.fullName);
          draw.ownerHandAfter=owner.hand.cards.length;
          draw.cardInDiscard=owner.discard.cards.includes(lillie);
          draw.supporterQuotaAfter=owner.supporterTurn;
          draw.cardsAfter=owner.hand.cards.map(c=>({name:c.name,
            superType:c.superType,printing:c.fullName}));
          draw.nativeEnergyCardsFound=owner.hand.cards.filter(c=>
            c.superType===native('game/store/card/card-types').SuperType.ENERGY)
            .map(c=>c.fullName);
          assert.equal(draw.accepted,true);
          assert.equal(draw.ownerHandAfter,8);
          assert.equal(draw.cardInDiscard,true);
        }else{
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
        if(requireFogFollowup){
          const follow={requested:true,originalOwnerTurn:state.turn,
            psychicFromFogAvailable:false,fogSearchSettled:false,
            energyAttachmentAccepted:false,hiddenPowerAccepted:false,
            sourceTrubbishKO:false,sourcePrizeTaken:false,
            pendingAfter:[],error:null};
          result.fogFollowup=follow;
          const fogIndex=owner.hand.cards.findIndex(c=>
            c.fullName==='Fog Crystal CRE');
          assert.ok(fogIndex>=0,'Original Secret Box selected Fog Crystal');
          const originalSourceActive=opponent.active.getPokemonCard();
          assert.equal(originalSourceActive?.fullName,'Trubbish FST');
          const originalSourcePrizeCount=opponent.prizes
            .reduce((n,p)=>n+p.cards.length,0);
          const originalCandidatePrizeCount=owner.prizes
            .reduce((n,p)=>n+p.cards.length,0);
          follow.sourceTrubbishDamageBefore=opponent.active.damage;
          follow.sourceTrubbishHP=originalSourceActive.hp;
          follow.attachQuotaBefore=owner.energyPlayedTurn;
          follow.prizesBefore={
            candidate:originalCandidatePrizeCount,
            source:originalSourcePrizeCount};
          callOriginal(this,new PlayCardAction(owner.id,fogIndex,{
            player:PlayerType.ANY,slot:SlotType.BOARD,index:0
          }),args);
          let choice=pending();
          assert.equal(choice?.constructor.name,'ChooseCardsPrompt');
          assert.equal(choice.playerId,owner.id);
          const {EnergyType}=native('game/store/card/card-types');
          const psychic=choice.cards.cards.find(c=>
            c.name==='Psychic Energy'&&c.energyType===EnergyType.BASIC);
          follow.psychicFromFogAvailable=!!psychic;
          follow.fogSearchOffered=choice.cards.cards.length;
          follow.energyPrinting=psychic?.fullName??null;
          const proposed=psychic?[psychic]:[];
          assert.equal(choice.validate(proposed,this.state),true);
          callOriginal(this,new ResolvePromptAction(choice.id,proposed),args);
          for(let i=0;i<8;i++){
            const p=pending();
            if(!p)break;
            let answer;
            if(p.constructor.name==='ShowCardsPrompt')answer=true;
            else if(p.constructor.name==='ShuffleDeckPrompt')
              answer=owner.deck.cards.map((_,index)=>index);
            else if(p.constructor.name==='WaitPrompt')answer=null;
            else break;
            follow.fogPromptTail=(follow.fogPromptTail??[]).concat(
              p.constructor.name);
            callOriginal(this,new ResolvePromptAction(p.id,answer),args);
          }
          follow.fogSearchSettled=pending()===undefined;
          if(psychic){
            assert.ok(owner.hand.cards.includes(psychic),
              'Searched Basic Psychic must be in owner hand');
            follow.energyAttachmentAttempted=true;
            const handIndex=owner.hand.cards.indexOf(psychic);
            assert.ok(handIndex>=0);
            callOriginal(this,new PlayCardAction(owner.id,handIndex,{
              player:PlayerType.BOTTOM_PLAYER,
              slot:SlotType.ACTIVE,index:0
            }),args);
            follow.energyAttachmentAccepted=owner.active.energies.cards
              .includes(psychic);
            follow.energyPlayedTurnAfter=owner.energyPlayedTurn;
            assert.equal(follow.energyAttachmentAccepted,true);
            const printed=owner.active.getPokemonCard();
            assert.equal(printed?.fullName,'Unown AOR');
            callOriginal(this,new AttackAction(owner.id,'Hidden Power'),args);
            follow.hiddenPowerAccepted=true;
            for(let i=0;i<18;i++){
              const p=pending();
              if(!p)break;
              const kind=p.constructor.name;
              let answer;
              if(kind==='WaitPrompt')answer=null;
              else if(kind==='ChoosePrizePrompt'&&p.playerId===owner.id){
                const firstFaceDownPrize=owner.prizes.find(x=>x.cards.length>0);
                assert.ok(firstFaceDownPrize,
                  'Take an actual physical face-down owner Prize slot');
                assert.equal(p.validate([firstFaceDownPrize],this.state),true);
                answer=[firstFaceDownPrize]; // Store accepts CardList objects
              }
              else if(kind==='ShowCardsPrompt')answer=true;
              else if(kind==='ChoosePokemonPrompt'&&
                  p.playerId===opponent.id&&promoteOpponentIndex!==null){
                const target=opponent.bench[promoteOpponentIndex];
                assert.ok(target?.getPokemonCard(),
                  'Scripted response must name an occupied original Bench');
                assert.equal(p.validate([target],this.state),true);
                answer=[target]; // pinned Store passes physical CardList directly
                follow.opponentPromotionScript={
                  physicalSeat:state.players.indexOf(opponent),
                  benchIndex:promoteOpponentIndex,
                  printing:target.getPokemonCard()?.fullName,
                  premise:'scripted source promotion for KO settlement only'
                };
              }
              else break; // do not invent further opponent policy
              follow.attackPromptTail=(follow.attackPromptTail??[]).concat(kind);
              callOriginal(this,new ResolvePromptAction(p.id,answer),args);
            }
            follow.sourceTrubbishKO=opponent.discard.cards
              .includes(originalSourceActive);
            follow.candidatePrizesAfter=owner.prizes
              .reduce((n,p)=>n+p.cards.length,0);
            follow.sourcePrizeTaken=follow.candidatePrizesAfter<
              originalCandidatePrizeCount;
          }
          follow.pendingAfter=this.state.prompts
            .filter(p=>p.result===undefined).map(p=>p.constructor.name);
          follow.ownerHandAfter=owner.hand.cards.map(c=>c.fullName);
          follow.ownerEnergyAfter=owner.active.energies.cards
            .map(c=>c.fullName);
          follow.sourceDiscardAfter=opponent.discard.cards
            .map(c=>c.fullName);
        }
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
        result.error={
          kind:error?.constructor?.name??typeof error,
          message:error?.message??null,
          plainText:String(error),
          ownKeys:Object.getOwnPropertyNames(error??{}),
          detail:Object.fromEntries(Object.getOwnPropertyNames(error??{})
            .map(k=>[k,String(error[k]).slice(0,600)])),
          stack:String(error?.stack??'').slice(0,2500)
        };
        result.postErrorState={
          phase:this.state.phase,turn:this.state.turn,
          activePlayer:this.state.activePlayer,
          currentOwnerActive:owner.active.getPokemonCard()?.fullName??null,
          sourceActive:opponent.active.getPokemonCard()?.fullName??null,
          sourceBench:opponent.bench.map(s=>s.getPokemonCard()?.fullName??null),
          sourceDiscard:opponent.discard.cards.map(c=>c.fullName),
          ownerPrizes:owner.prizes.reduce((n,p)=>n+p.cards.length,0),
          prompts:this.state.prompts.filter(p=>p.result===undefined)
            .map(p=>({kind:p.constructor.name,
              owner:p.playerId,index:p.id,message:p.message??null}))
        };
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
  const outputFile=options.outputPath??(targetLine==='lillie'?LILLIE_OUT_FILE:
    promoteOpponentIndex!==null?PROMOTION_OUT_FILE:
    requireFogFollowup?FOG_OUT_FILE:OUT_FILE);
  writeJsonAtomic(outputFile,result);
  console.log('AGENT44_ROOT93_SECRETBOX_PAID_STORE '+JSON.stringify({
    artifact:outputFile,hitTarget:result.hitTarget,
    priorAcceptedOrdinalMax:receipt?.priorAcceptedOrdinalMax??null,
    box:receipt?.acceptedBoxRoot??false,
    paid:receipt?.acceptedPayment??false,
    fog:result.nativeStoreFogSearchVerified,
    originalRoot:receipt?.actionOriginallyOffered??null,
    pending:receipt?.remainingPromptTypes??null,
    custody:receipt?.boxCustody??null,
    error:receipt?.error??null,
    exitReason,followup:receipt?.fogFollowup??null,
    lillie:receipt?.lillieNative??null
  }));
  assert.ok(receipt,'Current common-policy replay did not reach the exact archived first Pass');
  assert.equal(receipt.priorAcceptedOrdinalMax,92,
    'Exact 93-root native prefix identity must be retained');
  assert.equal(receipt.error,null,'Native replacement must settle');
  if(targetLine==='lillie'){
    assert.equal(receipt.lillieNative?.accepted,true);
    assert.equal(receipt.lillieNative.ownerHandAfter,8);
    return result;
  }
  assert.equal(result.nativeStorePaymentVerified,true);
  assert.equal(result.nativeStoreFogSearchVerified,true,
    'Archived later Fog Crystal print must be searchable at this exact root');
  if(requireFogFollowup)assert.equal(receipt.fogFollowup?.requested,true,
    'Selected opt-in branch must actually run Fog Crystal and attack test');
  if(requireFogFollowup&&receipt.fogFollowup?.psychicFromFogAvailable){
    assert.equal(receipt.fogFollowup.energyAttachmentAccepted,true);
    assert.equal(receipt.fogFollowup.hiddenPowerAccepted,true);
    assert.equal(receipt.fogFollowup.sourceTrubbishKO,true,
      'The printed Unown Hidden Power must KO 60-damaged 70-HP Trubbish');
    if(promoteOpponentIndex!==null){
      assert.equal(receipt.fogFollowup.opponentPromotionScript?.benchIndex,
        promoteOpponentIndex);
      assert.equal(receipt.fogFollowup.sourcePrizeTaken,true,
        'Native prize must be taken after explicitly scripted source promotion');
    }
  }
  return result;
}

if(require.main===module){
  if(process.env.AGENT44_LILLIE_SEED_BUNDLE==='true'){
    const seeds=[101,202,303,404,101];
    const rows=seeds.map((seed,index)=>{
      const result=run({line:'lillie',lillieShuffleSeed:seed,
        outputPath:path.join(ROOT,'artifacts/agent44-root93-lillie-seed-'+
          index+'.json')});
      const draw=result.capture.lillieNative;
      return {seed,index,ownerHandSha256:result.capture.handDigest,
        priorAcceptedOrdinalMax:result.capture.priorAcceptedOrdinalMax,
        originalRoot:result.capture.actionOriginallyOffered,
        shuffledDeckCount:draw.deckBeforeShuffleCount,
        shuffledDeckEnergy:draw.deckBeforeShuffleEnergyPrintings,
        shuffleOrderSha256:draw.shuffleOrderSha256,
        shuffleProtocol:draw.shuffleProtocol,
        handAfter:draw.handAfter,
        nativeEnergyFound:draw.nativeEnergyCardsFound,
        accepted:draw.accepted,error:result.capture.error};
    });
    assert.deepEqual(rows[0].handAfter,rows[4].handAfter,
      'Repeated deterministic shuffle seed must replay same physical draw');
    assert.deepEqual(rows[0].shuffleOrderSha256,rows[4].shuffleOrderSha256);
    assert.ok(rows.every(r=>r.accepted&&r.error===null&&
      r.ownerHandSha256===EXPECTED_HAND&&
      r.priorAcceptedOrdinalMax===92));
    const summary={schema:'agent44-root93-lillie-seeded-shuffle-v1',
      originalSourceDealWasPreviouslyExposed:true,
      registeredOriginalTrial:TARGET_TRIAL,
      deterministicReplayedPriorRoot:true,
      seeds,separateShuffles:4,duplicateSeedReplay:true,
      allCompetitiveQualifiedGames:0,
      rows};
    writeJsonAtomic(LILLIE_SEEDED_OUT,summary);
    console.log('AGENT44_LILLIE_SEEDED_SUMMARY '+JSON.stringify(summary));
  }else run({
    followup:process.env.AGENT44_FOG_KO_NATIVE==='true',
    line:process.env.AGENT44_ROOT93_LILLIE_NATIVE==='true'?'lillie':'secret-box',
    promoteOpponentIndex:process.env.AGENT44_PROMOTE_OPPONENT_INDEX===undefined?
      null:Number(process.env.AGENT44_PROMOTE_OPPONENT_INDEX)
  });
}
module.exports={run,EXPECTED_HAND,TARGET_TRIAL};
