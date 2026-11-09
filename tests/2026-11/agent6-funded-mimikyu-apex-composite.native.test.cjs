'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {runSeat}=
  require('../../simulation/twinleaf/agent46-mimikyu-apex-consecutive-native.cjs');
const {installDeclaredCopyHistoryHook}=
  require('../../simulation/twinleaf/copycat-declared-history-hook.cjs');
const {installMimikyuNonGxCopycatHook}=
  require('../../simulation/twinleaf/copycat-compat.cjs');
const {installCopycatMultiAttackHistory}=
  require('../../simulation/twinleaf/copycat-multiattack-history.cjs');
const {attachPreviousOpponentTurnReceipt}=
  require('../../simulation/twinleaf/agent7-copycat-history-root.cjs');
const {actorObservation}=
  require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {initializeCards}=
  require('../../simulation/twinleaf/headless.cjs');

const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const fromNative=p=>require(path.join(OUT,p));
const {RetreatAction}=fromNative('game/store/actions/game-actions');
const {ResolvePromptAction}=
  fromNative('game/store/actions/resolve-prompt-action');
const VERSION=require(
  '../../simulation/twinleaf/2026-11/agent6-funded-mimikyu-apex-promotion.cjs'
).VERSION;

/**
 * One real native Regidrago Apex/Overclock source turn followed by the funded
 * Mimikyu paid promotion and actual Apex/Timeless-GX copy. Direct stage setup
 * precedes the source attack, so this is a mechanical integration test and
 * contributes no independent paper game or natural-deal frequency.
 * @param {0|1} seat The Mimikyu owner physical seat.
 * @param {{dimensionValleyOnePsychic?:boolean}} [options] Optional real Stadium cost test.
 * @returns {object} Native physics and public-history witnesses.
 */
function runIntegrated(seat,options={}){
  const restoreHistory=installDeclaredCopyHistoryHook({
    mimikyu:true,regidrago:true
  });
  const restoreCopycat=installMimikyuNonGxCopycatHook();
  let tracker=null,receipt=null,actualStore=null,catalogForNext=null;
  try{
    const result=runSeat(seat,{
      chooseMimikyuTimeless:false,
      beforeApex({x}){
        tracker=installCopycatMultiAttackHistory(x.store);
      },
      beforeMimikyu({x}){
        const manager=initializeCards();
        let nextId=998000+seat*100;
        const card=name=>{
          const c=manager.getCardByName(name);
          assert.ok(c,'Pinned printing unavailable: '+name);
          c.id=nextId++;
          return c;
        };

        // Mimikyu was already physically funded with two Psychic; transfer
        // its entire PokémonCardList unchanged to Bench 0 and place a
        // separate, stranded two-Psychic VMAX into Active for the paid switch.
        const mimikyuSlot=x.owner.active;
        const stranded=x.owner.bench[0];
        assert.equal(mimikyuSlot.getPokemonCard()?.fullName,'Mimikyu GRI');
        assert.equal(mimikyuSlot.energies.cards.length,2);
        assert.equal(stranded.cards.length,0);
        if(options.dimensionValleyOnePsychic===true){
          const removed=mimikyuSlot.energies.cards.pop();
          const index=mimikyuSlot.cards.indexOf(removed);
          assert.ok(index>=0);
          mimikyuSlot.cards.splice(index,1);
          x.owner.discard.cards.push(removed);
          x.owner.stadium.cards.push(card('Dimension Valley PHF'));
        }
        x.owner.active=stranded;
        x.owner.bench[0]=mimikyuSlot;
        stranded.cards.push(card('Shadow Rider Calyrex V CRE'));
        stranded.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
        const fee=options.dimensionValleyOnePsychic===true?[]:
          [card('Psychic Energy SVE'),card('Psychic Energy SVE')];
        stranded.cards.push(...fee);
        stranded.energies.cards.push(...fee);
        if(options.dimensionValleyOnePsychic===true){
          // Real native Tool play produces the original champion's free
          // Float Stone Retreat, leaving Max Geist genuinely unpayable.
          const {PlayCardAction,PlayerType,SlotType}=fromNative(
            'game/store/actions/play-card-action');
          x.owner.hand.cards.push(card('Float Stone BKT'));
          const heldIndex=x.owner.hand.cards.length-1;
          x.store.dispatch(new PlayCardAction(x.owner.id,heldIndex,{
            player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
          }));
          assert.ok(stranded.tools.some(t=>t.fullName==='Float Stone BKT'));
        }

        const t={
          PokemonCard:fromNative('game/store/card/pokemon-card').PokemonCard,
          EnergyCard:fromNative('game/store/card/energy-card').EnergyCard,
          ...fromNative('game/store/card/card-types'),
          PowerType:fromNative('game/store/card/pokemon-types').PowerType
        };
        const catalog=buildActorCardCatalog(manager.getAllCards(),t);
        actualStore=x;
        catalogForNext=catalog;
        const view=attachPreviousOpponentTurnReceipt(
          actorObservation(x.state,seat),x.state,seat,tracker);
        assert.equal(view.publicEventReceipt.opponentLastTurnTurn,2);
        const choices=view.publicEventReceipt.opponentCopycatChoices;
        assert.equal(choices?.length,1);
        assert.equal(choices[0].sourcePrinting,'Regidrago VSTAR SIT');
        assert.equal(choices[0].attackName,'Apex Dragon');
        assert.equal(choices[0].copycatAttack,true);

        const intent=chooseActorRootIntent(view,catalog,{
          mimikyuApexFundedPromotion:true
        });
        const recipient=view.ownPublic.bench[0];
        const printedCopycat=recipient?.attacks?.find(a=>a.name==='Copycat');
        const publicEnergy=require(
          '../../simulation/twinleaf/agent17-public-context-special-energy.cjs'
        );
        assert.equal(intent?.source,VERSION,JSON.stringify({
          intent,ownerStadium:view.ownPublic.stadium,
          opponentStadium:view.opponentPublic.stadium,
          targetPrinting:recipient?.printing,
          targetEnergies:recipient?.energies,
          targetPrinted:recipient?.printed,
          targetAttacks:recipient?.attacks,
          effectiveCopycat:publicEnergy.effectiveNativeAttackCost(
            view,catalog,recipient,printedCopycat),
          copycatPayable:publicEnergy.publicSpecialAttackPayable(
            view,catalog,recipient,printedCopycat),
          sourceEnergies:view.ownPublic.active?.energies,
          retreatCost:view.ownPublic.active?.printed?.retreatCost
        }));
        assert.equal(intent?.benchIndex,0);
        assert.equal(intent?.paymentMode,
          options.dimensionValleyOnePsychic===true?
            'float-stone-free':'two-unit-basic-paid');
        const savedEnergy=[...mimikyuSlot.energies.cards];
        const beforeDiscard=[...x.owner.discard.cards];
        x.store.dispatch(new RetreatAction(x.owner.id,intent.benchIndex));
        let n=0;
        for(;n<12;n++){
          const pending=x.state.prompts.find(p=>p.result===undefined);
          if(!pending)break;
          assert.equal(pending.playerId,x.owner.id);
          if(pending.constructor.name==='WaitPrompt'){
            x.store.dispatch(new ResolvePromptAction(pending.id,null));
          }else{
            assert.equal(pending.constructor.name,'ChooseCardsPrompt');
            assert.strictEqual(pending.cards,stranded.energies);
            assert.equal(pending.validate(fee),true);
            x.store.dispatch(new ResolvePromptAction(pending.id,fee));
          }
        }
        assert.ok(n<12,'Native retreat prompts must settle');
        assert.strictEqual(x.owner.active,mimikyuSlot);
        assert.strictEqual(x.owner.bench[0],stranded);
        assert.equal(x.owner.retreatedTurn,x.state.turn);
        assert.deepEqual(mimikyuSlot.energies.cards,savedEnergy);
        assert.equal(stranded.energies.cards.length,0);
        assert.equal(fee.every(c=>x.owner.discard.cards.includes(c)),true);
        assert.equal(fee.every(c=>!beforeDiscard.includes(c)),true);
        const fundedView=attachPreviousOpponentTurnReceipt(
          actorObservation(x.state,seat),x.state,seat,tracker);
        const copyIntent=chooseActorRootIntent(fundedView,catalog,{
          mimikyuApexFundedPromotion:true
        });
        assert.equal(copyIntent?.kind,'attack');
        assert.equal(copyIntent?.attackName,'Copycat');
        assert.equal(copyIntent?.source,VERSION);
        receipt={
          seat,fullPublicHistoryFromGenuineSourceTurn:true,
          sourceAttack:choices[0].attackName,
          nativeSelectedRoot:intent.source,
          physicalFeeCopies:fee.length,
          paidCardsInOwnerDiscard:true,
          promotedActive:x.owner.active.getPokemonCard().fullName,
          recipientEnergyCount:x.owner.active.energies.cards.length,
          dimensionValleyOnePsychic:
            options.dimensionValleyOnePsychic===true,
          nativePromptsSettled:true
        };
      }
    });
    assert.equal(result.error,null);
    assert.equal(result.originalSourceLastAttackAfterResolvedApex.attack,
      'Apex Dragon');
    assert.equal(result.mimikyuActive,'Mimikyu GRI');
    assert.deepEqual(result.nativePending,['ChooseAttackPrompt']);
    const pending=actualStore.state.prompts.find(p=>
      p.result===undefined);
    const attack=require(
      '../../simulation/twinleaf/2026-11/agent6-funded-mimikyu-apex-promotion.cjs'
    ).chooseNativeMimikyuTimelessPrompt(
      actualStore.state,seat,pending,tracker);
    assert.equal(attack?.name,'Timeless-GX');
    actualStore.store.dispatch(new ResolvePromptAction(pending.id,attack));
    for(let i=0;i<16;i++){
      const next=actualStore.state.prompts.find(p=>p.result===undefined);
      if(!next)break;
      assert.equal(next.constructor.name,'WaitPrompt');
      actualStore.store.dispatch(new ResolvePromptAction(next.id,null));
    }
    assert.equal(actualStore.owner.usedGX,true);
    assert.equal(actualStore.owner.usedTurnSkip,true);
    assert.ok(actualStore.opponent.active.damage>=150);
    assert.deepEqual(actualStore.state.prompts
      .filter(p=>p.result===undefined),[]);
    assert.ok(receipt&&catalogForNext);
    return {...receipt,copiedTimelessDamage:actualStore.opponent.active.damage,
      actualNativeBonusTurn:true,ownerPayloadSelectedFromRealPrompt:true,
      fullOriginal60CompetitiveGame:false};
  }finally{
    tracker?.restore();
    restoreCopycat();
    restoreHistory();
  }
}

for(const seat of [0,1]){
  test('real previous Apex to two-Psychic Mimikyu promotion to Timeless-GX seat '+seat,()=>{
    const record=runIntegrated(seat);
    assert.equal(record.physicalFeeCopies,2);
    assert.equal(record.promotedActive,'Mimikyu GRI');
    assert.equal(record.recipientEnergyCount,2);
  });
}

module.exports={runIntegrated};

for(const seat of [0,1]){
  test('real Dimension Valley reduces paid-promoted Mimikyu Copycat to one Psychic seat '+seat,()=>{
    const record=runIntegrated(seat,{dimensionValleyOnePsychic:true});
    assert.equal(record.dimensionValleyOnePsychic,true);
    assert.equal(record.recipientEnergyCount,1);
    assert.equal(record.actualNativeBonusTurn,true);
  });
}
