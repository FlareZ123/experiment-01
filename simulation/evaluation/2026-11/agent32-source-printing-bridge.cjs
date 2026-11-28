'use strict';

const assert=require('node:assert/strict');
const certifiedMaps=new WeakMap();
function certifiedMapUnchanged(map){
  if(!(map instanceof Map))return false;
  if(map.size===0)return true;
  const snap=certifiedMaps.get(map);
  return snap instanceof Map&&snap.size===map.size&&[...snap].every(
    ([nativePrinting,sourcePrinting])=>map.get(nativePrinting)===sourcePrinting);
}

/**
 * Use a precommitted source-60/native-60 pairing, not a guessed alias:
 * the existing resolver has already selected every native card ID.
 * A native ID that represents two different source printings is ambiguous.
 */
function buildSourcePrintingMap(sourceDeck,nativeOrdered60){
  assert.ok(Array.isArray(sourceDeck?.cards),'source deck cards required');
  assert.ok(Array.isArray(nativeOrdered60),'ordered native deck required');
  const count=sourceDeck.cards.reduce((n,row)=>n+row.count,0);
  assert.equal(count,60,'source deck must contain exactly 60 physical cards');
  assert.equal(nativeOrdered60.length,60,'native deck must resolve exactly 60 cards');
  const byNative=new Map();
  let index=0;
  for(const row of sourceDeck.cards){
    assert.ok(Number.isSafeInteger(row.count)&&row.count>0);
    const name=row.name,set=row.printing?.set,number=row.printing?.number;
    assert.ok([name,set,number].every(x=>typeof x==='string'&&x.length>0),
      'source card name, set and number required');
    const sourcePrinting=`${name} ${set} ${number}`;
    const resolved=nativeOrdered60.slice(index,index+row.count);
    assert.equal(resolved.length,row.count);
    assert.ok(resolved.every(id=>typeof id==='string'&&id.length>0&&id===resolved[0]),
      'one source printing must map to one resolved native ID');
    const nativePrinting=resolved[0];
    if(byNative.has(nativePrinting)){
      assert.equal(byNative.get(nativePrinting),sourcePrinting,
        `ambiguous source printings for native ID ${nativePrinting}`);
    }else byNative.set(nativePrinting,sourcePrinting);
    index+=row.count;
  }
  assert.equal(index,60);
  certifiedMaps.set(byNative,new Map(byNative));
  return byNative;
}

const label=(value,map)=>typeof value==='string'&&map instanceof Map?
  map.get(value)??value:value;
const mapped=(list,map)=>Array.isArray(list)?list.map(x=>label(x,map)):list;
function mapPokemon(p,map,opponentMap){
  if(!p||p.concealed===true)return p;
  return {...p,
    printing:label(p.printing,map),
    evolutionPrintings:mapped(p.evolutionPrintings,map),
    energies:mapped(p.energies,map),tools:mapped(p.tools,map),
    abilitySuppressions:Array.isArray(p.abilitySuppressions)?
      p.abilitySuppressions.map(a=>({...a,
        sourcePrinting:uniqueVisibleLabel(a.sourcePrinting,
          map,opponentMap??new Map())})):p.abilitySuppressions};
}
function mapPlayer(p,map,opponentMap){
  if(!p)return p;
  return {...p,
    active:mapPokemon(p.active,map,opponentMap),
    bench:Array.isArray(p.bench)?p.bench.map(x=>mapPokemon(x,map,opponentMap)):p.bench,
    stadium:mapped(p.stadium,map),discard:mapped(p.discard,map),
    lostZone:mapped(p.lostZone,map),
    resolvingSupporter:mapped(p.resolvingSupporter,map),
    publicHand:mapped(p.publicHand,map),
    prizeSlots:Array.isArray(p.prizeSlots)?p.prizeSlots.map(x=>
      typeof x.printing==='string'?{...x,printing:label(x.printing,map)}:x):p.prizeSlots};
}
/**
 * Relabel only actor-visible fields. This never accesses a raw Store.
 * Concealed deck/hand/Prize cards remain concealed. Certified owner K1
 * retains separate custody and epoch rules.
 */

/** Different source decks may bind the same engine ID to different printings. */
function uniqueVisibleLabel(value,mine,other){
  if(typeof value!=='string')return value;
  const a=mine.get(value),b=other.get(value);
  return a&&b&&a!==b?value:a??b??value;
}
function mapAttackReceipt(row,map){
  return row?{...row,sourcePrinting:label(row.sourcePrinting,map)}:row;
}
function mapPublicEventReceipt(receipt,mine,other){
  if(!receipt)return receipt;
  const eventPokemon=p=>p?{...p,printing:label(p.printing,mine)}:p;
  const attackRows=rows=>Array.isArray(rows)?rows.map(x=>mapAttackReceipt(x,other)):rows;
  return {...receipt,
    ownerActive:eventPokemon(receipt.ownerActive),
    ownerBench:Array.isArray(receipt.ownerBench)?
      receipt.ownerBench.map(eventPokemon):receipt.ownerBench,
    opponentLastTurnAttacks:attackRows(receipt.opponentLastTurnAttacks),
    ...(Object.hasOwn(receipt,'opponentCopycatChoices')?{
      opponentCopycatChoices:attackRows(receipt.opponentCopycatChoices)}:{})};
}
function mapPrompt(prompt,mine,other){
  if(!prompt)return prompt;
  const origin=prompt.source??{};
  // Night Watch must be handled by the physical host. Relabeling its
  // source must never bypass the strict worker's literal host-only guard.
  if(origin.effectName==='Night Watch'&&
      [origin.sourcePrinting,origin.copiedSourcePrinting].some(value=>
        typeof value==='string'&&
        /^Trevenant & Dusknoir-GX SMP(?:\s|$)/i.test(value))){
    throw new Error('HOST_ONLY_PHYSICAL_PROMPT');
  }
  const source={...origin,
    sourcePrinting:uniqueVisibleLabel(origin.sourcePrinting,mine,other),
    ...(Object.hasOwn(origin,'copiedSourcePrinting')?{
      copiedSourcePrinting:uniqueVisibleLabel(
        origin.copiedSourcePrinting,mine,other)}:{})};
  const choices=Array.isArray(prompt.choices)?prompt.choices.map(choice=>{
    const seat=choice.publicMetadata?.ownerSeat??prompt.publicMetadata?.ownerSeat;
    const m=seat==='actor'?mine:seat==='opponent'?other:null;
    const meta=choice.publicMetadata;
    return {...choice,
      printing:label(choice.printing,m),
      publicMetadata:meta?{...meta,
        ...(Object.hasOwn(meta,'sourcePrinting')?{
          sourcePrinting:uniqueVisibleLabel(meta.sourcePrinting,mine,other)}:{})}:meta};
  }):prompt.choices;
  return {...prompt,source,choices,
    publicMetadata:prompt.publicMetadata?{...prompt.publicMetadata,
      ...(Object.hasOwn(prompt.publicMetadata,'sourcePrinting')?{
        sourcePrinting:uniqueVisibleLabel(
          prompt.publicMetadata.sourcePrinting,mine,other)}:{})}:prompt.publicMetadata};
}
function mapOwnerK1(snapshot,map){
  if(!snapshot)return snapshot;
  return {...snapshot,knownPrintings:Array.isArray(snapshot.knownPrintings)?
    snapshot.knownPrintings.map(row=>({
      ...row,printing:label(row.printing,map)})):snapshot.knownPrintings};
}

function projectSourcePrintings(observation,frontier,sourceMapsBySeat,options={}){
  assert.ok(observation?.actorSeat===0||observation?.actorSeat===1);
  assert.ok(Array.isArray(sourceMapsBySeat)&&sourceMapsBySeat.length===2);
  assert.ok(sourceMapsBySeat.every(m=>certifiedMapUnchanged(m)),
    'nonempty source-printing map must be created from a complete resolved 60');
  const seat=observation.actorSeat;
  const mine=sourceMapsBySeat[seat],other=sourceMapsBySeat[1-seat];
  const view={...observation,
    ownHand:mapped(observation.ownHand,mine),
    ownPublic:mapPlayer(observation.ownPublic,mine,other),
    opponentPublic:mapPlayer(observation.opponentPublic,other,mine),
    ownerK1:mapOwnerK1(observation.ownerK1,mine)};
  let mappedFrontier=frontier;
  if(frontier){
    assert.ok(Array.isArray(frontier.items));
    mappedFrontier={...frontier,items:frontier.items.map(item=>{
      const m=item.publicMetadata??{};
      const targetMap=m.targetSeat==='actor'?mine:
        m.targetSeat==='opponent'?other:null;
      return {...item,
        actorPrinting:label(item.actorPrinting,mine),
        targetPrinting:label(item.targetPrinting,targetMap),
        publicMetadata:item.publicMetadata?{...m,
          ...(typeof m.priorSourcePrinting==='string'?{
            priorSourcePrinting:label(m.priorSourcePrinting,other)}:{}),
          ...(typeof m.stadiumPrinting==='string'?{
            stadiumPrinting:uniqueVisibleLabel(m.stadiumPrinting,mine,other)}:{}),
          ...(m.attackSource?{attackSource:{...m.attackSource,
            sourceCardFullName:label(m.attackSource.sourceCardFullName,mine)}}:{})
        }:item.publicMetadata};
    })};
  }
  return {observation:view,actionFrontier:mappedFrontier,
    prompt:mapPrompt(options.prompt??null,mine,other),
    publicEventReceipt:mapPublicEventReceipt(
      options.publicEventReceipt??null,mine,other)};
}

module.exports={buildSourcePrintingMap,projectSourcePrintings};
