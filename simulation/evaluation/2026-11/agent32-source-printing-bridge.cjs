'use strict';

const assert=require('node:assert/strict');

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
  return byNative;
}

const label=(value,map)=>typeof value==='string'&&map instanceof Map?
  map.get(value)??value:value;
const mapped=(list,map)=>Array.isArray(list)?list.map(x=>label(x,map)):list;
function mapPokemon(p,map){
  if(!p||p.concealed===true)return p;
  return {...p,
    printing:label(p.printing,map),
    evolutionPrintings:mapped(p.evolutionPrintings,map),
    energies:mapped(p.energies,map),tools:mapped(p.tools,map)};
}
function mapPlayer(p,map){
  if(!p)return p;
  return {...p,
    active:mapPokemon(p.active,map),
    bench:Array.isArray(p.bench)?p.bench.map(x=>mapPokemon(x,map)):p.bench,
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
function projectSourcePrintings(observation,frontier,sourceMapsBySeat){
  assert.ok(observation?.actorSeat===0||observation?.actorSeat===1);
  assert.ok(Array.isArray(sourceMapsBySeat)&&sourceMapsBySeat.length===2);
  assert.ok(sourceMapsBySeat.every(m=>m instanceof Map));
  const seat=observation.actorSeat;
  const mine=sourceMapsBySeat[seat],other=sourceMapsBySeat[1-seat];
  const view={...observation,
    ownHand:mapped(observation.ownHand,mine),
    ownPublic:mapPlayer(observation.ownPublic,mine),
    opponentPublic:mapPlayer(observation.opponentPublic,other)};
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
          sourceCardFullName:label(m.sourceCardFullName,mine),
          attackSource:m.attackSource?{...m.attackSource,
            sourceCardFullName:label(m.attackSource.sourceCardFullName,mine)}:m.attackSource
        }:item.publicMetadata};
    })};
  }
  return {observation:view,actionFrontier:mappedFrontier};
}

module.exports={buildSourcePrintingMap,projectSourcePrintings};
