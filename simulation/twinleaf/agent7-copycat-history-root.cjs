'use strict';

const assert=require('node:assert/strict');
const {publicEventReceipt}=require('./agent8-public-event-receipt.cjs');

const VERSION='agent7-mimikyu-copycat-history-root-v3-copycat-compatibility';

/**
 * Add the latest completed opponent-turn snapshot and tracker-certified
 * Copycat choices to an already detached actor observation. The full history
 * remains available for audit; the separate choice list preserves the exact
 * native eligibility policy and any verified Ω Barrage pair.
 *
 * @param {object} view Detached actor observation.
 * @param {object} state Authenticated current Store state.
 * @param {0|1} seat Physical acting seat.
 * @param {{getPreviousTurnSnapshot:(playerId:number)=>{turn:number,attacks:object[]}|null,getCopycatChoices?:(playerId:number)=>object[]}|null} tracker
 * @returns {Readonly<object>}
 */
function attachPreviousOpponentTurnReceipt(view,state,seat,tracker){
  assert.ok((seat===0||seat===1)&&state?.players?.length===2);
  assert.equal(view.actorSeat,seat);
  assert.equal(view.globalTurn,state.turn);
  assert.equal(view.publicEventReceipt,undefined);
  const opponentId=state.players[1-seat].id;
  const snapshot=tracker?.getPreviousTurnSnapshot(opponentId)??null;
  if(snapshot!==null){
    assert.ok(Number.isSafeInteger(snapshot.turn)&&snapshot.turn>=0);
    assert.ok(Array.isArray(snapshot.attacks));
  }
  const receipt=publicEventReceipt(state,seat,
    snapshot===null?null:snapshot.attacks,
    snapshot===null?null:snapshot.turn);
  let opponentCopycatChoices=null;
  if(snapshot!==null&&typeof tracker?.getCopycatChoices==='function'){
    const nativeChoices=tracker.getCopycatChoices(opponentId);
    assert.ok(Array.isArray(nativeChoices));
    assert.ok(nativeChoices.length<=2,
      'Copycat tracker must return one last attack or one verified Barrage pair');
    const history=receipt.opponentLastTurnAttacks;
    if(nativeChoices.length===0){
      opponentCopycatChoices=[];
    }else if(nativeChoices.length===2&&
        nativeChoices.every(row=>typeof row.barragePairId==='string')){
      const pairIndices=history
        .filter(row=>row.barragePairIndex!==undefined)
        .map(row=>row.barragePairIndex);
      assert.ok(pairIndices.length>=2);
      const latestPairIndex=Math.max(...pairIndices);
      const pairRows=history.filter(row=>row.barragePairIndex===latestPairIndex);
      assert.equal(pairRows.length,2);
      assert.deepEqual(pairRows.map(row=>row.barragePairRole),['first','second']);
      for(let i=0;i<2;i++){
        assert.equal(pairRows[i].turn,nativeChoices[i].turn);
        assert.equal(pairRows[i].sourcePrinting,nativeChoices[i].sourceCardFullName);
        assert.equal(pairRows[i].attackName,nativeChoices[i].attackName);
        assert.equal(pairRows[i].gxAttack,nativeChoices[i].gxAttack);
        assert.equal(pairRows[i].copycatAttack,nativeChoices[i].copycatAttack);
        assert.equal(pairRows[i].barragePairRole,nativeChoices[i].barragePairRole);
      }
      opponentCopycatChoices=pairRows;
    }else if(nativeChoices.length===1&&
        nativeChoices[0].barragePairId===undefined){
      const choice=nativeChoices[0];
      const selected=[...history].reverse().find(row=>
        row.barragePairIndex===undefined&&
        row.turn===choice.turn&&
        row.sourcePrinting===choice.sourceCardFullName&&
        row.attackName===choice.attackName&&
        row.gxAttack===choice.gxAttack&&
        row.copycatAttack===choice.copycatAttack);
      assert.ok(selected,'Single Copycat choice must map to the latest unpaired public attack');
      opponentCopycatChoices=[selected];
    }else{
      // An incomplete or malformed pair is not a certified choice set.
      opponentCopycatChoices=[];
    }
    Object.freeze(opponentCopycatChoices);
  }
  const active=view.ownPublic?.active;
  const activeHasCopycat=active?.name==='Mimikyu'&&
    active.attacks?.some(attack=>attack.name==='Copycat')===true;
  const mimikyuCopycatCompatible=snapshot===null||
      typeof tracker?.getCopycatChoices!=='function'?
    null:activeHasCopycat&&opponentCopycatChoices.length>0;
  const publicReceipt=Object.freeze({
    ...receipt,opponentCopycatChoices,mimikyuCopycatCompatible
  });
  return Object.freeze({...view,publicEventReceipt:publicReceipt});
}

/**
 * Narrow Mimikyu GRI root for a tracker-certified Bunnelby PRC Burrow.
 * A single choice is the latest eligible attack. A two-choice set is accepted
 * only when the receipt proves one ordered, same-source, different-attack
 * Ω Barrage pair. The returned index maps back to the exact native tracker row.
 *
 * @param {object} view Detached actor observation with public event receipt.
 * @returns {object|null} Native-neutral Copycat attack intent.
 */
function chooseMimikyuBurrowCopycat(view){
  const active=view?.ownPublic?.active;
  if(active?.printing!=='Mimikyu GRI')return null;
  const receipt=view.publicEventReceipt;
  if(receipt?.actorSeat!==view.actorSeat||receipt.turn!==view.globalTurn)return null;
  const snapshotTurn=receipt.opponentLastTurnTurn;
  if(!Number.isSafeInteger(snapshotTurn)||snapshotTurn>=view.globalTurn)return null;
  const history=receipt.opponentLastTurnAttacks;
  const choices=receipt.opponentCopycatChoices;
  if(!Array.isArray(history)||!Array.isArray(choices)||
      choices.length===0||choices.length>2)return null;
  let selected=null;
  let selectedIndex=-1;
  if(choices.length===1){
    const row=choices[0];
    if(row.barragePairIndex!==undefined||row.barragePairRole!==undefined)return null;
    selected=row;
    selectedIndex=0;
  }else{
    const [first,second]=choices;
    if(!Number.isSafeInteger(first.barragePairIndex)||
        first.barragePairIndex!==second.barragePairIndex||
        first.barragePairRole!=='first'||second.barragePairRole!=='second'||
        first.sourcePrinting!==second.sourcePrinting||
        first.attackName===second.attackName)return null;
    selectedIndex=choices.findIndex(row=>
      row.sourcePrinting.startsWith('Bunnelby PRC')&&row.attackName==='Burrow');
    if(selectedIndex<0)return null;
    selected=choices[selectedIndex];
  }
  if(selected.turn!==snapshotTurn||selected.gxAttack!==false||
      selected.copycatAttack!==false)return null;
  if(!selected.sourcePrinting.startsWith('Bunnelby PRC')||
      selected.attackName!=='Burrow')return null;
  if(!history.includes(selected))return null;
  if(!active.attacks?.some(attack=>attack.name==='Copycat'))return null;
  return Object.freeze({
    kind:'attack',attackName:'Copycat',source:VERSION,
    previousTurn:snapshotTurn,previousSource:selected.sourcePrinting,
    previousAttack:selected.attackName,previousChoiceIndex:selectedIndex,
    previousBarragePairIndex:selected.barragePairIndex??null,
    previousBarragePairRole:selected.barragePairRole??null
  });
}

module.exports={VERSION,attachPreviousOpponentTurnReceipt,chooseMimikyuBurrowCopycat};
