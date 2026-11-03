'use strict';

const assert=require('node:assert/strict');

const VERSION='agent5-generic-owner-trainer-opportunity-v1';

/**
 * Build an exact-print metadata index from public registered native cards.
 * No game State, private zone, deck construction or opponent hand is read.
 * @param {object[]} all Public card-manager catalog.
 * @param {{TrainerCard:Function,TrainerType:object}} nativeTypes
 * @returns {Map<string,{name:string,type:string}>}
 */
function trainerPrintCatalog(all,nativeTypes){
  assert.ok(Array.isArray(all));
  const {TrainerCard,TrainerType}=nativeTypes;
  assert.equal(typeof TrainerCard,'function');
  const labels=new Map([
    [TrainerType.ITEM,'Item'],[TrainerType.SUPPORTER,'Supporter'],
    [TrainerType.STADIUM,'Stadium'],[TrainerType.TOOL,'Tool']
  ]);
  const index=new Map();
  for(const card of all){
    if(!(card instanceof TrainerCard))continue;
    const type=labels.get(card.trainerType);
    if(!type)continue;
    const prev=index.get(card.fullName);
    if(prev){
      assert.deepEqual(prev,{name:card.name,type},
        'Native catalog contains conflicting trainer print metadata');
    }else{
      index.set(card.fullName,{name:card.name,type});
    }
  }
  return index;
}

/**
 * A conservative owner-hand Trainer opportunity frontier.
 *
 * This intentionally does not infer card-specific payment or target legality:
 * "unresolved" only means that a generic turn/lock gate has not vetoed the
 * candidate. Native canPlay and enumerator presence are advisory and cannot
 * certify the paper rules. Every held physical copy remains a separate row.
 * @param {object} view Frozen actorObservation for a genuine owner root.
 * @param {Map<string,{name:string,type:string}>} catalog Public metadata.
 * @param {Set<number>} [enumerated] Indices offered by a native action
 *   enumerator, if inspected independently; absence need not be illegality.
 * @returns {object}
 */
function ownerTrainerOpportunity(view,catalog,enumerated=new Set()){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(catalog instanceof Map);
  assert.ok(enumerated instanceof Set);
  const owner=view.ownPublic,resources=view.ownTurnResources;
  const visibleStadiums=[...(owner.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  const sameNameInPlay=name=>visibleStadiums.some(print=>
    catalog.get(print)?.name===name);
  const openToolSlots=[owner.active,...owner.bench]
    .filter(slot=>slot!==null&&slot.tools.length===0).length;
  const rows=[];
  for(let handIndex=0;handIndex<view.ownHand.length;handIndex++){
    const printing=view.ownHand[handIndex];
    const meta=catalog.get(printing);
    if(!meta)continue;
    const {type,name}=meta;
    let blocker=null;
    if(type==='Item'&&resources.itemPlayLocked===true)
      blocker='public-item-lock';
    if(type==='Tool'){
      if(resources.toolPlayLocked===true)blocker='public-tool-lock';
      else if(openToolSlots===0)blocker='no-public-open-tool-slot';
    }
    if(type==='Supporter'){
      if(resources.supporterPlayLocked===true)
        blocker='public-supporter-lock';
      else if(resources.supporterPlayedTurn>0)
        blocker='supporter-already-consumed';
      else if(view.globalTurn===1)
        blocker='first-player-opening-supporter-rule';
    }
    if(type==='Stadium'){
      if(resources.stadiumPlayLocked===true)
        blocker='public-stadium-lock';
      else if(resources.stadiumPlayedTurn===view.globalTurn)
        blocker='stadium-already-played';
      else if(sameNameInPlay(name))
        blocker='same-named-stadium-in-play';
    }
    rows.push({
      handIndex,printing,name,type,
      sharedActionChannel:type==='Supporter'?'one-supporter':
        type==='Stadium'?'one-stadium':
        type==='Tool'?'tool-recipient-slot':'item-and-effect-resource',
      publicBlocker:blocker,
      paperEligibility:blocker?'blocked-known':'unresolved-card-specific',
      nativeEnumeratorOffered:enumerated.has(handIndex),
      nativeCanPlay:'not-evaluated',
      paperPayment:'not-verified',
      consequentialEffect:'not-observed'
    });
  }
  const channels={};
  for(const row of rows){
    const lane=row.sharedActionChannel;
    channels[lane]??={held:0,unblocked:0};
    channels[lane].held++;
    if(!row.publicBlocker)channels[lane].unblocked++;
  }
  return {
    version:VERSION,actorSeat:view.actorSeat,
    globalTurn:view.globalTurn,
    handTrainerCopies:rows.length,
    unblockedGenericTrainerCopies:rows.filter(row=>!row.publicBlocker).length,
    channels,rows,
    qualification:{
      cardSpecificConditionsResolved:false,
      discardPaymentProven:false,
      legalTargetProven:false,
      paperLegalPlayableSet:false,
      nativeEnumeratorIsCompletenessProof:false,
      opponentHiddenDataUsed:false,
      competitiveGameQualified:false
    }
  };
}

module.exports={VERSION,trainerPrintCatalog,ownerTrainerOpportunity};
