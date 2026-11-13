'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {
  STORE_DECKLIST_BINDING_SCHEMA,
  assertRegisteredFlittleDecklist,
  decklistCardsSha256
}=require('../../twinleaf/2026-11/agent36-flittle-mcts-root-provider.cjs');
const {
  snapshotFullGameState,
  DIAGNOSTIC_SCHEMA,
  PRIVATE_VISIBILITY
}=require('../../twinleaf/2026-11/agent43-full-state-diagnostic.cjs');

function zoneCards(zone) {
  if(Array.isArray(zone))return zone;
  if(Array.isArray(zone?.cards))return zone.cards;
  return [];
}

function canonicalJson(value) {
  if(value===null)return 'null';
  if(typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
  if(typeof value==='number') {
    assert.ok(Number.isFinite(value),'Store snapshot contains a non-finite number');
    return JSON.stringify(value);
  }
  assert.ok(value&&typeof value==='object','Store snapshot contains an unsupported value');
  if(Array.isArray(value))return '['+value.map(canonicalJson).join(',')+']';
  const keys=Object.keys(value).sort();
  return '{'+keys.map(key=>JSON.stringify(key)+':'+canonicalJson(value[key])).join(',')+'}';
}

function countPrintings(cards,label) {
  const counts=new Map();
  for(const card of cards) {
    assert.ok(card&&typeof card==='object',label+' contains a non-card value');
    assert.ok(typeof card.fullName==='string'&&card.fullName.length>0,
      label+' contains a card without a canonical fullName');
    counts.set(card.fullName,(counts.get(card.fullName)??0)+1);
  }
  return [...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0]))
    .map(([printing,copies])=>({printing,copies}));
}

function collectPlayerPhysicalCards(player,seat,seenReferences) {
  assert.ok(player&&typeof player==='object');
  assert.ok(Array.isArray(player.bench),'Player '+seat+' is missing its native Bench slots');
  assert.ok(Array.isArray(player.prizes),'Player '+seat+' is missing its native Prize slots');

  const zones={
    deck:zoneCards(player.deck),
    hand:zoneCards(player.hand),
    prizes:player.prizes.flatMap(slot=>zoneCards(slot)),
    discard:zoneCards(player.discard),
    lostZone:zoneCards(player.lostzone),
    stadium:zoneCards(player.stadium),
    resolvingSupporter:zoneCards(player.supporter),
    active:zoneCards(player.active),
    activeTools:zoneCards(player.active?.tools),
    bench:player.bench.flatMap(slot=>zoneCards(slot)),
    benchTools:player.bench.flatMap(slot=>zoneCards(slot?.tools))
  };

  for(const slot of [player.active,...player.bench]) {
    if(!slot)continue;
    const slotCards=zoneCards(slot);
    for(const attachedEnergy of zoneCards(slot.energies)) {
      assert.ok(slotCards.includes(attachedEnergy),
        'Attached Energy is absent from its owning PokemonCardList.cards');
    }
  }

  const all=[];
  const zoneCounts={};
  for(const [zone,cards] of Object.entries(zones)) {
    zoneCounts[zone]=cards.length;
    for(const card of cards) {
      assert.ok(card&&typeof card==='object',
        'Player '+seat+' '+zone+' contains a non-card value');
      assert.equal(seenReferences.has(card),false,
        'One physical card object appears in more than one native zone');
      seenReferences.add(card);
      all.push(card);
    }
  }
  assert.equal(all.length,60,
    'Player '+seat+' native zones must conserve exactly 60 physical cards');
  return {cards:all,zoneCounts};
}

/**
 * Trusted, offline Store-boundary preflight. It reads both complete physical
 * seat compositions before any policy callback is invoked, verifies them
 * against the registered printed sixties, then emits only digests and counts.
 * No hidden card identities or full-state snapshot leave this function.
 */
function createStoreDecklistBindingReceipt({
  store,state=store?.state,deckA,deckB,candidateSeat,
  candidateDecklist,opponentDecklist,enginePin,
  playerIds=[101,202]
}) {
  assert.ok(store&&typeof store==='object'&&store.state===state,
    'Preflight must inspect the actual live Store.state object');
  assert.ok(state&&Array.isArray(state.players)&&state.players.length===2);
  assert.ok(Array.isArray(state.prompts),'Native Store prompt ledger is required');
  assert.ok(candidateSeat===0||candidateSeat===1);
  assert.ok(Array.isArray(playerIds)&&playerIds.length===2);
  assert.match(enginePin??'',/^[0-9a-f]{40}$/i,
    'Preflight requires the exact pinned Twinleaf commit');
  const candidate=assertRegisteredFlittleDecklist(
    candidateDecklist,'Candidate registered decklist');
  const opponent=assertRegisteredFlittleDecklist(
    opponentDecklist,'Opponent registered decklist');
  assert.notEqual(candidate.id,opponent.id,
    'Candidate and opponent registrations require distinct stable IDs');
  assert.ok(Array.isArray(deckA)&&Array.isArray(deckB),
    'The exact AddPlayerAction deck arrays must be supplied');

  const decklistBySeat=candidateSeat===0?
    [candidate,opponent]:[opponent,candidate];
  const sortNames=cards=>cards.slice().sort((a,b)=>a.localeCompare(b));
  assert.deepEqual(sortNames(deckA),sortNames(decklistBySeat[0].cards),
    'Seat 0 AddPlayerAction input differs from its registered decklist');
  assert.deepEqual(sortNames(deckB),sortNames(decklistBySeat[1].cards),
    'Seat 1 AddPlayerAction input differs from its registered decklist');

  const seenReferences=new WeakSet();
  const zoneCountsBySeat=[];
  const seatBindings=[];
  for(const seat of [0,1]) {
    const player=state.players[seat];
    assert.equal(player.id,playerIds[seat],
      'Physical Store player order differs from the registered seat map');
    const collected=collectPlayerPhysicalCards(player,seat,seenReferences);
    const actualCounts=countPrintings(collected.cards,'Player '+seat+' physical zones');
    const expectedSha=decklistCardsSha256(decklistBySeat[seat].cards);
    const actualSha=decklistCardsSha256(collected.cards.map(card=>card.fullName));
    assert.equal(actualSha,expectedSha,
      'Player '+seat+' complete native zones differ from its registered printed 60');
    zoneCountsBySeat.push({
      seat,playerId:player.id,totalCards:collected.cards.length,
      zoneCounts:collected.zoneCounts
    });
    seatBindings.push({
      seat,role:seat===candidateSeat?'candidate':'opponent',
      playerId:player.id,decklistId:decklistBySeat[seat].id,
      decklistSha256:expectedSha,physicalCardCount:actualCounts.reduce(
        (sum,row)=>sum+row.copies,0)
    });
  }

  const fullState=snapshotFullGameState(state,{
    stage:'flittle-store-decklist-binding-preflight',
    candidateSeat,
    enginePin
  });
  assert.equal(fullState.schema,DIAGNOSTIC_SCHEMA);
  assert.equal(fullState.visibility,PRIVATE_VISIBILITY);
  const fullStateSnapshotSha256=createHash('sha256')
    .update(canonicalJson(fullState),'utf8').digest('hex');
  const candidateDecklistSha256=decklistCardsSha256(candidate.cards);
  const opponentDecklistSha256=decklistCardsSha256(opponent.cards);
  const bindingProjection={
    schema:STORE_DECKLIST_BINDING_SCHEMA,
    enginePin,
    candidateSeat,
    candidateDecklistId:candidate.id,
    opponentDecklistId:opponent.id,
    candidateDecklistSha256,
    opponentDecklistSha256,
    seatBindings,
    fullStateSnapshotSha256
  };
  const storeStateSha256=createHash('sha256')
    .update(canonicalJson(bindingProjection),'utf8').digest('hex');

  return Object.freeze({
    schema:STORE_DECKLIST_BINDING_SCHEMA,
    verified:true,
    source:'trusted-native-store-preflight',
    enginePin,
    candidateSeat,
    opponentSeat:1-candidateSeat,
    candidateDecklistId:candidate.id,
    opponentDecklistId:opponent.id,
    candidateDecklistSha256,
    opponentDecklistSha256,
    checkedPhysicalSeats:Object.freeze([0,1]),
    zoneCountsBySeat:Object.freeze(zoneCountsBySeat.map(row=>Object.freeze({
      ...row,zoneCounts:Object.freeze({...row.zoneCounts})
    }))),
    seatBindings:Object.freeze(seatBindings.map(row=>Object.freeze({...row}))),
    fullStateSnapshotSha256,
    storeStateSha256
  });
}

module.exports={
  zoneCards,
  canonicalJson,
  collectPlayerPhysicalCards,
  createStoreDecklistBindingReceipt
};
