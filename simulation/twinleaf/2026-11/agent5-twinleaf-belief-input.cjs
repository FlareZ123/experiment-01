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

function normalizeKnowledge(knowledge, ownerK1Snapshot, prizeCount) {
  assert.ok(knowledge && knowledge.verified===true,
    'Each seat requires an authenticated information-state ledger');
  assert.ok(['K0','K1','PARTIAL'].includes(knowledge.mode),
    'Knowledge mode must be K0, K1 or PARTIAL');
  const knownTopDeck=knowledge.knownTopDeck??[];
  const knownBottomDeck=knowledge.knownBottomDeck??[];
  assert.ok(Array.isArray(knownTopDeck)&&Array.isArray(knownBottomDeck));
  const knownBottomDeckOrder=knowledge.knownBottomDeckOrder===true;
  if(knowledge.mode==='K0') {
    assert.equal(knownTopDeck.length,0,
      'K0 cannot retain a verified top-deck prefix');
    assert.equal(knownBottomDeck.length,0,
      'K0 cannot retain a known bottom-deck block');
    assert.equal((knowledge.knownPrizePrintings??[]).length,0,
      'K0 cannot claim exact Prize membership');
  }
  if(knowledge.mode==='K1') {
    assert.ok(ownerK1Snapshot===null || ownerK1Snapshot===undefined ||
      ownerK1Snapshot.exactMembershipKnown===true,
      'K1 conflicts with the actor observation knowledge snapshot');
    const knownPrizeCards=expandKnownPrizePrintings(knowledge.knownPrizePrintings);
    assert.equal(knownPrizeCards.length,prizeCount,
      'K1 ledger must account for every current Prize');
    if(ownerK1Snapshot?.knownPrintings) {
      assert.deepEqual(
        [...expandKnownPrizePrintings(ownerK1Snapshot.knownPrintings)].sort(),
        [...knownPrizeCards].sort(),
        'Actor observation and information ledger disagree about Prize membership'
      );
    }
    return {exactPrizeMembership:true,knownPrizeCards,
      knownTopDeck,knownBottomDeck,knownBottomDeckOrder};
  }
  assert.ok(ownerK1Snapshot===null || ownerK1Snapshot===undefined ||
    ownerK1Snapshot.exactMembershipKnown===false,
    'K0/PARTIAL conflicts with the actor observation K1 snapshot');
  assert.equal((knowledge.knownPrizePrintings??[]).length,0,
    'K0/PARTIAL cannot silently discard a partial Prize membership list');
  return {exactPrizeMembership:false,knownPrizeCards:[],
    knownTopDeck,knownBottomDeck,knownBottomDeckOrder};
}

/**
 * Build one seat's sampler input from an actor-only Twinleaf observation.
 * Hidden identities are never read: only concealed hand/deck/prize counts
 * are used, except when a hand or Prize slot is explicitly public.
 */
function buildTwinleafBeliefInput({
  state,actorSeat,seat,observation,registered60,knowledgeBySeat
}) {
  assert.ok(state?.players?.length===2);
  assert.ok((actorSeat===0||actorSeat===1)&&(seat===0||seat===1));
  assert.ok(observation && observation.actorSeat===actorSeat);
  const player=state.players[seat];
  const view=seat===actorSeat?observation.ownPublic:observation.opponentPublic;
  assert.ok(view && typeof view==='object');
  assert.equal(view.handCount,player.hand.cards.length,
    'Observation hand count differs from native hidden-zone cardinality');
  assert.equal(view.deckCount,player.deck.cards.length,
    'Observation deck count differs from native hidden-zone cardinality');
  const physicalPrizeCount=player.prizes.reduce((sum,slot)=>sum+slot.cards.length,0);
  assert.equal(view.prizeCount,physicalPrizeCount,
    'Observation Prize count differs from native hidden-zone cardinality');

  let knownHand;
  if(seat===actorSeat) {
    knownHand=observation.ownHand.slice();
  } else if(player.hand.isPublic===true) {
    knownHand=player.hand.cards.map(card=>card.fullName);
  } else {
    knownHand=null;
  }
  const hiddenHandCount=view.handCount-(knownHand?.length??0);
  assert.ok(hiddenHandCount>=0,'Visible hand exceeds native hand count');

  const prizeSlots=player.prizes.flatMap((slot,index)=>{
    assert.ok(slot.cards.length===0||slot.cards.length===1,
      'Each physical Prize position must contain at most one card');
    if(slot.cards.length===0)return [];
    if(slot.faceUpPrize===true) {
      return [{index,printing:slot.cards[0].fullName}];
    }
    // Face-down Prize identities are deliberately not inspected.
    return [{index}];
  });
  const knowledge=knowledgeBySeat?.[seat];
  const normalized=normalizeKnowledge(knowledge,
    seat===actorSeat?observation.ownerK1:null,view.prizeCount);
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
 * Per-player public decklist prior: exact own list, opponent sampled only from
 * public evidence. It never reads a concealed opponent hand or deck.
 */
function createPublicDecklistPriorProvider({ownDecklist,opponentPrior,ignorePublicCard=()=>false}) {
  assert.ok(ownDecklist&&typeof ownDecklist.id==='string'&&
    Array.isArray(ownDecklist.cards));
  assert.ok(Array.isArray(opponentPrior)&&opponentPrior.length>0);
  assert.equal(typeof ignorePublicCard,'function');
  return function decklistForSeat(state,actorSeat,seat,observation,random) {
    if(seat===actorSeat)return {id:ownDecklist.id,cards:ownDecklist.cards.slice()};
    const view=observation.opponentPublic;
    const player=state.players[seat];
    const observed=collectPublicPrintings(view);
    if(player.hand.isPublic===true)
      observed.push(...player.hand.cards.map(card=>card.fullName));
    for(const prize of player.prizes) {
      if(prize.faceUpPrize===true) {
        assert.equal(prize.cards.length,1);
        observed.push(prize.cards[0].fullName);
      }
    }
    // The injectable filter receives only the already-collected public printing.
    // Never hand it the determinized State, Player, or concealed-zone objects.
    const deckEvidence=observed.filter(printing=>!ignorePublicCard(printing));
    return sampleDecklistPrior(opponentPrior,deckEvidence,random);
  };
}

/**
 * Factory for a complete two-seat hidden-world sampler. The decklistForSeat
 * callback must return the acting seat's registered 60 and a public-prior
 * sample for the opponent; it must not reveal the opponent's actual list.
 * knowledgeBySeat must provide a verified K0/K1/PARTIAL ledger for each seat.
 */
function createTwinleafDeterminizationSampler(deps) {
  for(const name of ['actorObservation','cloneState','knowledgeBySeat',
    'decklistForSeat','createCard']) {
    assert.equal(typeof deps[name],'function','Missing determinizer dependency: '+name);
  }
  const metadataByState=deps.metadataByState??new WeakMap();
  function sampleDeterminization(state,actorSeat,random) {
    assert.equal(typeof random,'function');
    const actorKnowledge=deps.knowledgeBySeat(state,actorSeat);
    const observation=deps.actorObservation(state,actorSeat,{
      ownerK1Snapshot:actorKnowledge.ownerK1Snapshot??null
    });
    const ledgers=[0,1].map(seat=>deps.knowledgeBySeat(state,seat));
    const decklistIds=[null,null];
    const partitions=[0,1].map(seat=>{
      const decklistInfo=deps.decklistForSeat(state,actorSeat,seat,observation,random);
      assert.ok(decklistInfo&&typeof decklistInfo.id==='string'&&
        Array.isArray(decklistInfo.cards),
        'Decklist provider must return {id,cards} for each seat');
      const registered60=decklistInfo.cards;
      decklistIds[seat]=decklistInfo.id;
      const input=buildTwinleafBeliefInput({
        state,actorSeat,seat,observation,registered60,
        knowledgeBySeat:ledgers
      });
      return sampleHiddenPartition({...input,random});
    });
    const detached=deps.cloneState(state);
    assert.ok(detached&&detached!==state,'Twinleaf clone adapter returned a live State');
    applySampledPartitionsToTwinleafState(detached,partitions,deps.createCard);
    metadataByState.set(detached,{decklistIds,knowledgeBySeat:ledgers});
    return detached;
  }
  // The exact ledger provider and per-sample snapshots are shared with the
  // MCTS observation adapter so its information-set key cannot omit belief data.
  sampleDeterminization.metadataByState=metadataByState;
  sampleDeterminization.knowledgeBySeat=deps.knowledgeBySeat;
  return sampleDeterminization;
}

module.exports={
  collectPublicPrintings,
  expandKnownPrizePrintings,
  normalizeKnowledge,
  buildTwinleafBeliefInput,
  applySampledPartitionsToTwinleafState,
  createPublicDecklistPriorProvider,
  createTwinleafDeterminizationSampler
};
