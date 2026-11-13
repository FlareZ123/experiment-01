'use strict';

const assert=require('node:assert/strict');
const {sampleHiddenPartition,sampleDecklistPrior}=require('./agent5-hidden-partition-sampler.cjs');

function collectPublicPrintings(view) {
  assert.ok(view && typeof view==='object');
  const result=[];
  for(const slot of [view.active,...(view.bench??[])]) {
    if(slot===null || slot===undefined) continue;
    assert.notEqual(slot.concealed,true,
      'Information-set search cannot start from a concealed setup board');
    assert.ok(Array.isArray(slot.evolutionPrintings),
      'Visible Pokémon is missing its card-stack projection');
    assert.ok(Array.isArray(slot.energies),
      'Visible Pokémon is missing its energy projection');
    assert.ok(Array.isArray(slot.tools),
      'Visible Pokémon is missing its Tool projection');
    // Twinleaf's PokemonCardList.cards already contains attached Energy cards;
    // slot.energies is a second view of those same physical cards. Do not count
    // it again. Tools live in a separate collection.
    result.push(...slot.evolutionPrintings,...slot.tools);
  }
  for(const zone of [view.stadium,view.discard,view.lostZone,view.resolvingSupporter]) {
    assert.ok(Array.isArray(zone),'Public player view is missing a visible zone');
    result.push(...zone);
  }
  return result;
}

function expandKnownPrizePrintings(rows) {
  assert.ok(Array.isArray(rows),'K1 Prize membership requires exact printing counts');
  const result=[];
  for(const row of rows) {
    assert.ok(typeof row?.printing==='string' && row.printing.length>0);
    assert.ok(Number.isSafeInteger(row.copies) && row.copies>0);
    for(let i=0;i<row.copies;i++)result.push(row.printing);
  }
  return result;
}

function normalizeKnowledge(knowledge, exactPrizeSnapshot, prizeCount) {
  assert.ok(knowledge&&knowledge.verified===true,
    'Each belief requires an authenticated information-state ledger');
  assert.ok(['K0','K1','PARTIAL'].includes(knowledge.mode),
    'Knowledge mode must be K0, K1 or PARTIAL');
  const knownTopDeck=knowledge.knownTopDeck??[];
  const knownBottomDeck=knowledge.knownBottomDeck??[];
  assert.ok(Array.isArray(knownTopDeck)&&Array.isArray(knownBottomDeck));
  const knownBottomDeckOrder=knowledge.knownBottomDeckOrder===true;
  if(knowledge.mode==='K0') {
    assert.equal(knownTopDeck.length,0,'K0 cannot retain a verified top-deck prefix');
    assert.equal(knownBottomDeck.length,0,'K0 cannot retain a known bottom-deck block');
    assert.equal((knowledge.knownPrizePrintings??[]).length,0,
      'K0 cannot claim exact Prize membership');
  }
  if(knowledge.mode==='K1') {
    assert.ok(exactPrizeSnapshot&&exactPrizeSnapshot.exactMembershipKnown===true,
      'K1 requires an exact Prize snapshot in this information perspective');
    assert.ok(Number.isSafeInteger(exactPrizeSnapshot.epoch)&&exactPrizeSnapshot.epoch>=0,
      'Exact Prize snapshot requires a nonnegative epoch');
    assert.ok(Array.isArray(exactPrizeSnapshot.knownPrintings),
      'Exact Prize snapshot must include printing counts');
    const knownPrizeCards=expandKnownPrizePrintings(knowledge.knownPrizePrintings);
    assert.equal(knownPrizeCards.length,prizeCount,'K1 ledger must account for every current Prize');
    assert.deepEqual(
      [...expandKnownPrizePrintings(exactPrizeSnapshot.knownPrintings)].sort(),
      [...knownPrizeCards].sort(),
      'Exact Prize snapshot and information ledger disagree about Prize membership'
    );
    return {exactPrizeMembership:true,knownPrizeCards,
      knownTopDeck,knownBottomDeck,knownBottomDeckOrder};
  }
  assert.ok(exactPrizeSnapshot===null||exactPrizeSnapshot===undefined||
    exactPrizeSnapshot.exactMembershipKnown===false,
    'K0/PARTIAL conflicts with an exact Prize snapshot');
  assert.equal((knowledge.knownPrizePrintings??[]).length,0,
    'K0/PARTIAL cannot silently discard a partial Prize membership list');
  return {exactPrizeMembership:false,knownPrizeCards:[],
    knownTopDeck,knownBottomDeck,knownBottomDeckOrder};
}

function collectPublicEvidence(view) {
  assert.ok(view&&typeof view==='object');
  const result=collectPublicPrintings(view);
  if(view.publicHand!==null&&view.publicHand!==undefined) {
    assert.ok(Array.isArray(view.publicHand));
    result.push(...view.publicHand);
  }
  assert.ok(Array.isArray(view.prizeSlots),
    'Actor observation is missing public Prize-slot evidence');
  for(const slot of view.prizeSlots) {
    if(slot.printing!==undefined&&slot.printing!==null)result.push(slot.printing);
  }
  return result;
}

/**
 * Build one seat's sampler input from an actor-only Twinleaf observation.
 * Hidden identities are never read: only concealed hand/deck/prize counts
 * are used, except when a hand or Prize slot is explicitly public.
 */
function buildTwinleafBeliefInput({
  actorSeat,seat,observation,registered60,beliefKnowledgeBySeat
}) {
  assert.ok((actorSeat===0||actorSeat===1)&&(seat===0||seat===1));
  assert.ok(observation&&observation.actorSeat===actorSeat);
  const view=seat===actorSeat?observation.ownPublic:observation.opponentPublic;
  assert.ok(view&&typeof view==='object');
  assert.ok(Number.isSafeInteger(view.handCount)&&view.handCount>=0);
  assert.ok(Number.isSafeInteger(view.deckCount)&&view.deckCount>=0);
  assert.ok(Number.isSafeInteger(view.prizeCount)&&view.prizeCount>=0);
  assert.ok(Array.isArray(view.prizeSlots),
    'Actor observation is missing occupied Prize-slot geometry');
  assert.equal(view.prizeSlots.length,view.prizeCount,
    'Public Prize-slot geometry differs from the public Prize count');

  let knownHand;
  if(seat===actorSeat)knownHand=observation.ownHand.slice();
  else if(Array.isArray(view.publicHand))knownHand=view.publicHand.slice();
  else {
    assert.ok(view.publicHand===null||view.publicHand===undefined,
      'Public hand must be an array or null');
    knownHand=null;
  }
  const hiddenHandCount=view.handCount-(knownHand?.length??0);
  assert.ok(hiddenHandCount>=0,'Visible hand exceeds public hand count');

  const prizeSlots=view.prizeSlots.map(slot=>{
    assert.ok(Number.isSafeInteger(slot?.index)&&slot.index>=0);
    if(slot.printing===undefined||slot.printing===null)return {index:slot.index};
    assert.ok(typeof slot.printing==='string'&&slot.printing.length>0);
    return {index:slot.index,printing:slot.printing};
  });
  assert.equal(new Set(prizeSlots.map(slot=>slot.index)).size,prizeSlots.length,
    'Public Prize-slot indexes must be unique');

  const knowledge=beliefKnowledgeBySeat?.[seat];
  const exactPrizeSnapshot=seat===actorSeat?
    observation.ownerK1:(knowledge?.exactPrizeSnapshot??null);
  const normalized=normalizeKnowledge(knowledge,exactPrizeSnapshot,view.prizeCount);
  return {
    registered60:registered60.slice(),
    knownPublic:collectPublicPrintings(view),
    knownHand,hiddenHandCount,
    canonicalHandOrder:seat!==actorSeat,
    deckCount:view.deckCount,
    prizeSlots,
    ...normalized
  };
}

/**
 * Apply sampled hidden partitions to a detached Twinleaf State. Card IDs are
 * retained as opaque handles while every concealed card face is replaced.
 * The caller must first detach the State with Twinleaf-compatible deepClone.
 */
function applySampledPartitionsToTwinleafState(state,partitionsBySeat,createCard) {
  assert.ok(state?.players?.length===2);
  assert.ok(Array.isArray(partitionsBySeat)&&partitionsBySeat.length===2);
  assert.equal(typeof createCard,'function');
  const usedIds=new Set();
  const usedCardObjects=new Set();
  function reservePublicIds(cards) {
    for(const card of cards??[]) {
      assert.ok(Number.isSafeInteger(card.id),'Public card has no stable opaque ID');
      assert.equal(usedIds.has(card.id),false,'Twinleaf public card IDs are not unique');
      usedIds.add(card.id);
    }
  }
  for(const player of state.players) {
    for(const pokemon of [player.active,...(player.bench??[])]) {
      if(!pokemon)continue;
      reservePublicIds(pokemon.cards);
      reservePublicIds(pokemon.tools);
    }
    for(const zone of [player.stadium,player.discard,player.lostzone,player.supporter])
      reservePublicIds(zone?.cards);
  }
  for(let seat=0;seat<2;seat++) {
    const player=state.players[seat];
    const partition=partitionsBySeat[seat];
    assert.ok(partition&&Array.isArray(partition.hand)&&Array.isArray(partition.deck)&&
      Array.isArray(partition.prizes));
    assert.equal(partition.hand.length,player.hand.cards.length,
      'Sampled hand size differs from native hand size');
    assert.equal(partition.deck.length,player.deck.cards.length,
      'Sampled deck size differs from native deck size');
    const prizeByIndex=new Map(partition.prizes.map(item=>[item.index,item.printing]));
    const physicalPrizeCount=player.prizes.reduce((sum,slot)=>sum+slot.cards.length,0);
    assert.equal(prizeByIndex.size,physicalPrizeCount,
      'Sampled Prize partition differs from native physical Prize count');

    function replaceCards(oldCards,printings,label) {
      assert.equal(oldCards.length,printings.length,label+' card count changed');
      const ids=oldCards.map(card=>card.id);
      for(const id of ids) {
        assert.ok(Number.isSafeInteger(id),label+' card has no stable opaque ID');
        assert.equal(usedIds.has(id),false,'Twinleaf card IDs are not globally unique');
        usedIds.add(id);
      }
      return printings.map((printing,index)=>{
        const card=createCard(printing);
        assert.ok(card&&typeof card==='object','Card factory returned no Card');
        assert.equal(usedCardObjects.has(card),false,
          'Card factory reused a Card instance across sampled physical cards');
        usedCardObjects.add(card);
        card.id=ids[index];
        return card;
      });
    }

    player.hand.cards=replaceCards(player.hand.cards,partition.hand,'Hand');
    player.deck.cards=replaceCards(player.deck.cards,partition.deck,'Deck');
    for(let index=0;index<player.prizes.length;index++) {
      const slot=player.prizes[index];
      if(slot.cards.length===0)continue;
      assert.equal(slot.cards.length,1,'Prize slot contains multiple physical cards');
      assert.equal(prizeByIndex.has(index),true,'Sample omitted a physical Prize slot');
      slot.cards=replaceCards(slot.cards,[prizeByIndex.get(index)],'Prize');
    }
    assert.equal([...prizeByIndex.keys()].every(index=>
      player.prizes[index]?.cards.length===1),true,
      'Sample references a nonexistent or empty Prize slot');
  }
  return state;
}

/**
 * The prior receives only a detached actor observation, never native State or
 * concealed Player zones.
 */
function createPublicDecklistPriorProvider({ownDecklist,opponentPrior,ignorePublicCard=()=>false}) {
  assert.ok(ownDecklist&&typeof ownDecklist.id==='string'&&Array.isArray(ownDecklist.cards));
  assert.ok(Array.isArray(opponentPrior)&&opponentPrior.length>0);
  assert.equal(typeof ignorePublicCard,'function');
  return function decklistForSeat(observation,actorSeat,seat,random) {
    assert.ok(observation&&observation.actorSeat===actorSeat);
    assert.ok((actorSeat===0||actorSeat===1)&&(seat===0||seat===1));
    if(seat===actorSeat)return {id:ownDecklist.id,cards:ownDecklist.cards.slice()};
    const evidence=collectPublicEvidence(observation.opponentPublic)
      .filter(printing=>!ignorePublicCard(printing));
    return sampleDecklistPrior(opponentPrior,evidence,random);
  };
}

function cloneJson(value) { return JSON.parse(JSON.stringify(value)); }

function countPrintings(cards) {
  const counts=new Map();
  for(const card of cards)counts.set(card,(counts.get(card)||0)+1);
  return counts;
}

function canonicalKnowledge(knowledge) {
  const snapshot=knowledge.ownerK1Snapshot??null;
  return {
    verified:knowledge.verified===true,mode:knowledge.mode,
    knownTopDeck:(knowledge.knownTopDeck??[]).slice(),
    knownBottomDeck:knowledge.knownBottomDeckOrder===true?
      (knowledge.knownBottomDeck??[]).slice():(knowledge.knownBottomDeck??[]).slice().sort(),
    knownBottomDeckOrder:knowledge.knownBottomDeckOrder===true,
    knownPrizePrintings:(knowledge.knownPrizePrintings??[])
      .map(row=>({printing:row.printing,copies:row.copies}))
      .sort((a,b)=>a.printing.localeCompare(b.printing)),
    ownerK1Snapshot:snapshot===null?null:{
      epoch:snapshot.epoch,exactMembershipKnown:snapshot.exactMembershipKnown,
      knownPrintings:snapshot.knownPrintings===null?null:
        snapshot.knownPrintings.map(row=>({printing:row.printing,copies:row.copies}))
          .sort((a,b)=>a.printing.localeCompare(b.printing)),
      invalidationReason:snapshot.invalidationReason??null
    }
  };
}

/** Read only the selected simulated seat's private zones for validation. */
function ownPrivateZones(state,seat) {
  assert.ok(state?.players?.length===2&&(seat===0||seat===1));
  const player=state.players[seat];
  return {
    hand:player.hand.cards.map(card=>card.fullName),
    deck:player.deck.cards.map(card=>card.fullName),
    prizes:player.prizes.map((slot,index)=>({
      index,faceUpPrize:slot.faceUpPrize===true,
      cards:slot.cards.map(card=>card.fullName)
    }))
  };
}

function validateSeatKnowledge(zones,knowledge) {
  const prizeCards=zones.prizes.flatMap(slot=>slot.cards);
  const normalized=normalizeKnowledge(
    knowledge,knowledge.ownerK1Snapshot??null,prizeCards.length
  );
  if(normalized.exactPrizeMembership)
    assert.deepEqual([...normalized.knownPrizeCards].sort(),[...prizeCards].sort(),
      'Sampled seat K1 ledger does not match its own determinized Prizes');
  assert.deepEqual(zones.deck.slice(0,normalized.knownTopDeck.length),
    normalized.knownTopDeck,
    'Sampled seat known top-deck prefix does not match its determinized deck');
  const bottom=normalized.knownBottomDeck;
  if(bottom.length>0) {
    const actual=zones.deck.slice(-bottom.length);
    if(normalized.knownBottomDeckOrder)assert.deepEqual(actual,bottom,
      'Sampled seat known bottom-deck order does not match its determinized deck');
    else {
      const a=[...countPrintings(actual)].sort((x,y)=>x[0].localeCompare(y[0]));
      const b=[...countPrintings(bottom)].sort((x,y)=>x[0].localeCompare(y[0]));
      assert.deepEqual(a,b,
        'Sampled seat known bottom-deck multiset does not match its determinized deck');
    }
  }
  return cloneJson(knowledge);
}

/**
 * Root belief is built from public actor evidence and a public-prior list.
 * Simulated seat-private ledgers are derived after sampling and refreshed
 * after every simulated transition. The opponent's actual private ledger is
 * never used to constrain root sampling.
 */
function createTwinleafDeterminizationSampler(deps) {
  for(const name of ['actorObservation','cloneState','rootKnowledgeBySeat',
    'beliefKnowledgeBySeat','seatKnowledgeBySeat','decklistForSeat','createCard'])
    assert.equal(typeof deps[name],'function','Missing determinizer dependency: '+name);
  const metadataByState=deps.metadataByState??new WeakMap();

  function knowledgeBySeat(state,seat,context={}) {
    const metadata=metadataByState.get(state);
    if(metadata)return metadata.knowledgeBySeat[seat];
    assert.ok(context&&context.rootSeat===seat,
      'The undeterminized State may expose only the root actor private ledger');
    const observation=deps.actorObservation(state,seat,{ownerK1Snapshot:null});
    return deps.rootKnowledgeBySeat({rootSeat:seat,observation});
  }

  function sampleDeterminization(state,actorSeat,random) {
    assert.equal(typeof random,'function');
    assert.ok(state?.players?.length===2&&(actorSeat===0||actorSeat===1));
    const rootBaseObservation=deps.actorObservation(state,actorSeat,{ownerK1Snapshot:null});
    const rootKnowledge=deps.rootKnowledgeBySeat({
      rootSeat:actorSeat,observation:rootBaseObservation
    });
    const observation=deps.actorObservation(state,actorSeat,{
      ownerK1Snapshot:rootKnowledge.ownerK1Snapshot??null
    });
    const decklistInfoBySeat=[0,1].map(seat=>
      deps.decklistForSeat(observation,actorSeat,seat,random));
    for(const info of decklistInfoBySeat) {
      assert.ok(info&&typeof info.id==='string'&&Array.isArray(info.cards),
        'Decklist provider must return {id,cards} for each seat');
      assert.equal(info.cards.length,60,'Every sampled decklist must contain exactly 60 cards');
    }
    const rootBeliefBySeat=[0,1].map(seat=>{
      if(seat===actorSeat)return cloneJson(rootKnowledge);
      return deps.beliefKnowledgeBySeat({
        rootSeat:actorSeat,targetSeat:seat,observation,
        publicEvidence:collectPublicEvidence(observation.opponentPublic),
        decklistInfo:cloneJson(decklistInfoBySeat[seat])
      });
    });
    const partitions=[0,1].map(seat=>{
      const input=buildTwinleafBeliefInput({
        actorSeat,seat,observation,registered60:decklistInfoBySeat[seat].cards,
        beliefKnowledgeBySeat:rootBeliefBySeat
      });
      return sampleHiddenPartition({...input,random});
    });
    const detached=deps.cloneState(state);
    assert.ok(detached&&detached!==state,'Twinleaf clone adapter returned a live State');
    applySampledPartitionsToTwinleafState(detached,partitions,deps.createCard);
    const knowledgeSnapshots=[0,1].map(seat=>{
      const knowledge=deps.seatKnowledgeBySeat({
        state:detached,seat,rootSeat:actorSeat,
        previousLedger:seat===actorSeat?cloneJson(rootKnowledge):null,
        previousState:null,rootObservation:observation,
        decklistInfo:cloneJson(decklistInfoBySeat[seat])
      });
      return validateSeatKnowledge(ownPrivateZones(detached,seat),knowledge);
    });
    assert.deepEqual(canonicalKnowledge(knowledgeSnapshots[actorSeat]),
      canonicalKnowledge(rootKnowledge),
      'Determinization changed the root actor private ledger');
    metadataByState.set(detached,{
      rootSeat:actorSeat,decklistIds:decklistInfoBySeat.map(info=>info.id),
      decklistInfoBySeat:cloneJson(decklistInfoBySeat),
      rootBeliefBySeat:cloneJson(rootBeliefBySeat),
      knowledgeBySeat:cloneJson(knowledgeSnapshots),rootObservation:observation
    });
    return detached;
  }

  function refreshMetadata(fromState,toState) {
    const previous=metadataByState.get(fromState);
    if(!previous)return false;
    const knowledgeSnapshots=[0,1].map(seat=>{
      const knowledge=deps.seatKnowledgeBySeat({
        state:toState,seat,rootSeat:previous.rootSeat,
        previousLedger:cloneJson(previous.knowledgeBySeat[seat]),
        previousState:fromState,rootObservation:previous.rootObservation,
        decklistInfo:cloneJson(previous.decklistInfoBySeat[seat])
      });
      return validateSeatKnowledge(ownPrivateZones(toState,seat),knowledge);
    });
    metadataByState.set(toState,{...previous,knowledgeBySeat:cloneJson(knowledgeSnapshots)});
    return true;
  }

  sampleDeterminization.metadataByState=metadataByState;
  sampleDeterminization.knowledgeBySeat=knowledgeBySeat;
  sampleDeterminization.refreshMetadata=refreshMetadata;
  sampleDeterminization.rootKnowledgeBySeat=deps.rootKnowledgeBySeat;
  sampleDeterminization.beliefKnowledgeBySeat=deps.beliefKnowledgeBySeat;
  sampleDeterminization.seatKnowledgeBySeat=deps.seatKnowledgeBySeat;
  return sampleDeterminization;
}

module.exports={
  collectPublicPrintings,
  collectPublicEvidence,
  expandKnownPrizePrintings,
  normalizeKnowledge,
  buildTwinleafBeliefInput,
  applySampledPartitionsToTwinleafState,
  createPublicDecklistPriorProvider,
  createTwinleafDeterminizationSampler
};
