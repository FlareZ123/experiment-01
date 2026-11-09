'use strict';

const assert=require('node:assert/strict');
const {twoUnitPayment}=
  require('../agent42-public-two-unit-paid-retreat-proposal.cjs');
const {publicEnergyContext,publicSpecialAttackPayable}=
  require('../agent17-public-context-special-energy.cjs');
const {observedOpponentActiveForbidsRetreat}=
  require('../agent35-opponent-active-retreat-lock.cjs');
const {wouldLoseActivePositionAbility}=
  require('../agent47-active-position-retreat-veto.cjs');

const VERSION='agent6-funded-mimikyu-post-apex-paid-promotion-v1';
const MIMIKYU='Mimikyu GRI';
const DIALGA='Dialga-GX UPR';
const REGIDRAGO='Regidrago VSTAR SIT';
const FLOAT_STONE='Float Stone BKT';

/**
 * The tracker-certified latest, non-GX Regidrago Apex declaration. The
 * internal copycatAttack flag is true for printed Apex and does not disqualify
 * the physical Mimikyu's printed Copycat attack under the paper ruling.
 * @param {object} view Owner's detached turn-stamped public history.
 * @returns {{row:object,index:number}|null}
 */
function currentOpponentApex(view){
  const receipt=view?.publicEventReceipt;
  if(receipt?.actorSeat!==view.actorSeat||
      receipt.turn!==view.globalTurn||
      !Number.isSafeInteger(receipt.opponentLastTurnTurn)||
      receipt.opponentLastTurnTurn>=view.globalTurn||
      !Array.isArray(receipt.opponentCopycatChoices)||
      receipt.opponentCopycatChoices.length!==1)return null;
  const row=receipt.opponentCopycatChoices[0];
  if(row.turn!==receipt.opponentLastTurnTurn||
      row.sourcePrinting!==REGIDRAGO||
      row.attackName!=='Apex Dragon'||row.gxAttack!==false)
    return null;
  return {row,index:0};
}

/**
 * The active, exactly funded Mimikyu needs a dedicated attack choice:
 * otherwise the generic payable-first chooser tends to select Filch.
 * @param {object} view The actor-only, immutable owner observation.
 * @param {object} catalog Public printed Energy and attack mapping.
 * @returns {object|null} Native-neutral Copycat action.
 */
function chooseFundedMimikyuApexCopycat(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const active=view.ownPublic?.active;
  const apex=currentOpponentApex(view);
  if(!apex||active?.printing!==MIMIKYU||
      view.ownPublic.publicTurnRestrictions?.gxUsed===true||
      view.ownPublic.publicTurnRestrictions?.cannotUseGXAttacks===true||
      view.ownPublic.publicTurnRestrictions?.attackLockTurnsRemaining>0||
      !view.ownPublic.discard?.includes(DIALGA)||
      active.publicRestrictions?.cannotAttackNextTurn===true||
      active.publicRestrictions?.blockedAttackNameNextTurn==='Copycat'||
      active.publicRestrictions?.blockedAttackNameUntilLeavesActive==='Copycat'||
      active.publicRestrictions?.cannotUseAttacksNextTurn?.includes('Copycat')||
      (active.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
       active.publicRestrictions.onlyAllowedAttackNameNextTurn!=='Copycat')||
      (active.specialConditions??[]).some(c=>
        c===catalog.specialConditions?.ASLEEP||
        c===catalog.specialConditions?.PARALYZED))
    return null;
  const attack=active.attacks?.find(a=>a.name==='Copycat'&&
    a.gxAttack===false);
  if(!attack||!publicSpecialAttackPayable(view,catalog,active,attack))
    return null;
  return {
    kind:'attack',attackName:'Copycat',source:VERSION,
    previousOpponentTurn:apex.row.turn,
    previousOpponentSource:REGIDRAGO,
    previousOpponentAttack:'Apex Dragon',
    previousChoiceIndex:apex.index,
    targetOwnerDiscardDonor:DIALGA,
    nativeCopycatAndPayloadUnverified:true,
    competitiveGameQualified:false
  };
}

/**
 * Propose one actor-owned, actual-Store-subject Retreat into an already
 * completely funded Mimikyu when the previous public opponent turn exposed
 * non-GX Apex Dragon, the owner's GX allowance is unused, and the physical
 * Dialga-GX Timeless-GX donor is already in the own public discard.
 *
 * The line is deliberately conditional: no deck/prize identities, no
 * opponent hidden state, no forecast of future attacks or Ability uses.
 * The pinned Store still determines Retreat legality, payments, promotion,
 * ChooseAttackPrompt targets and eventual damage/effects.
 *
 * @param {object} view Detached actorObservation with publicEventReceipt.
 * @param {object} catalog Public pinned card and Energy printing catalog.
 * @returns {object|null} Native-neutral Retreat intent.
 */
function chooseFundedMimikyuApexPromotion(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic;
  const active=own?.active;
  const r=view.ownTurnResources;
  if(view.globalTurn<=1||!active||active.printing===MIMIKYU||
      !r||!Number.isSafeInteger(r.retreatedTurn)||
      r.retreatedTurn===view.globalTurn||
      own.publicTurnRestrictions?.gxUsed===true||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
      !own.discard?.includes(DIALGA)||
      currentOpponentApex(view)===null)
    return null;

  if(observedOpponentActiveForbidsRetreat(view)||
      active.publicRestrictions?.cannotRetreatWhileActive===true||
      active.publicRestrictions?.cannotRetreatNextTurn===true||
      (active.specialConditions??[]).some(c=>
        c===catalog.specialConditions?.ASLEEP||
        c===catalog.specialConditions?.PARALYZED))
    return null;

  // Do not displace an already payable Active attack without comparing
  // its tactical value; this conditional slice resolves only a stranded
  // Active whose current attack is unavailable.
  if((active.attacks??[]).some(a=>
    publicSpecialAttackPayable(view,catalog,active,a)))return null;

  const psychic=catalog.basicEnergyTypes?.Psychic;
  const colorless=catalog.colorlessEnergyType;
  if(!Number.isSafeInteger(psychic)||!Number.isSafeInteger(colorless))
    return null;

  const benchIndex=own.bench?.findIndex(p=>{
    if(p?.printing!==MIMIKYU||p.energies?.length!==2||
        !p.energies.every(e=>
          catalog.basicEnergies?.has(e)===true&&
          e.startsWith('Psychic Energy '))||
        p.publicRestrictions?.cannotAttackNextTurn===true)return false;
    const copycat=p.attacks?.find(a=>a.name==='Copycat');
    return copycat?.gxAttack===false&&
      Array.isArray(copycat.cost)&&copycat.cost.length===2&&
      copycat.cost[0]===psychic&&copycat.cost[1]===colorless;
  })??-1;
  if(benchIndex<0||
      wouldLoseActivePositionAbility(view,benchIndex))return null;

  const stadiums=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  const jamming=stadiums.some(s=>s.startsWith('Jamming Tower '))||
    view.opponentPublic?.active?.tools?.some(s=>
      s.startsWith('Tool Jammer '))===true;
  const cost=active.printed?.retreatCost;
  if(!Array.isArray(cost)||!Array.isArray(active.energies))return null;

  let payment=null,mode=null;
  if(active.tools?.includes(FLOAT_STONE)&&!jamming&&
      cost.length<=2){
    mode='float-stone-free';
    payment={indices:[],printings:[]};
  }else if(cost.length===0){
    mode='printed-zero';
    payment={indices:[],printings:[]};
  }else if(cost.length===2&&cost.every(c=>c===colorless)&&
      active.tools?.length===0&&stadiums.length===0&&
      active.energies.every(e=>catalog.basicEnergies?.has(e)===true)){
    payment=twoUnitPayment(active.energies,
      publicEnergyContext(view,active,catalog));
    if(payment)mode='two-unit-basic-paid';
  }
  if(!payment)return null;

  return {
    kind:'paid-retreat',source:VERSION,
    benchIndex,printing:MIMIKYU,
    previousOpponentAttack:'Apex Dragon',
    previousOpponentSource:REGIDRAGO,
    ownerDiscardDonor:DIALGA,
    paymentMode:mode,
    predictedPaymentIndices:payment.indices,
    predictedPaymentPrintings:payment.printings,
    exactOwnerVisibleCondition:true,
    nativeRetreatAndCopycatUnverified:true,
    competitiveGameQualified:false
  };
}

/**
 * Choose an actual owner-discarded Dragon attack at the native prompt reached
 * only through a public opponent Apex and an Active Mimikyu Copycat. The
 * Attack object is returned by physical identity from the genuine prompt,
 * rather than manufactured from a printing name.
 *
 * @param {object} state The current native Store State.
 * @param {0|1} seat Current prompted physical seat.
 * @param {object} prompt The native pending ChooseAttackPrompt.
 * @param {object|null} tracker Per-Store completed public attack-history tracker.
 * @returns {object|null} Exact validated native Timeless-GX attack.
 */
function chooseNativeMimikyuTimelessPrompt(state,seat,prompt,tracker){
  if((seat!==0&&seat!==1)||
      state?.activePlayer!==seat||
      !Array.isArray(state.players)||state.players.length!==2||
      prompt?.constructor?.name!=='ChooseAttackPrompt'|| 
      !Array.isArray(prompt.cards)||typeof prompt.validate!=='function')
    return null;
  const owner=state.players[seat];
  const opponent=state.players[1-seat];
  if(prompt.playerId!==owner.id||
      owner.active.getPokemonCard()?.fullName!==MIMIKYU||
      owner.usedGX===true)return null;
  const choices=tracker?.getCopycatChoices(opponent.id);
  const history=tracker?.getPreviousTurnSnapshot(opponent.id);
  if(!Array.isArray(choices)||choices.length!==1||
      !history||!Number.isSafeInteger(history.turn)||
      history.turn>=state.turn||
      choices[0].turn!==history.turn||
      choices[0].sourceCardFullName!==REGIDRAGO||
      choices[0].attackName!=='Apex Dragon'||
      choices[0].gxAttack!==false)return null;
  const donor=owner.discard.cards.find(card=>
    card.fullName===DIALGA&&prompt.cards.includes(card));
  if(!donor)return null;
  const attack=donor.attacks?.find(a=>
    a.name==='Timeless-GX'&&a.gxAttack===true);
  return attack&&prompt.validate(attack)===true?attack:null;
}

module.exports={VERSION,currentOpponentApex,chooseFundedMimikyuApexCopycat,chooseFundedMimikyuApexPromotion,chooseNativeMimikyuTimelessPrompt};
