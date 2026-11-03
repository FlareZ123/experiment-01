'use strict';

const assert=require('node:assert/strict');

/**
 * Only precise original-paper printings with an effect on a Tool attached
 * to an opposing Benched Garbodor. The inventory census does not test
 * hand access, Item/Supporter lock, canPlay, Prize state or action choice.
 */
const DIRECT_TOOL_ANSWERS=Object.freeze([
  Object.freeze({name:'Field Blower',set:'GRI',number:'125',
    type:'item-discard'}),
  Object.freeze({name:'Lost Vacuum',set:'LOR',number:'162',
    type:'item-lost-zone-payment'}),
  Object.freeze({name:'Megaton Blower',set:'SSP',number:'182',
    type:'ace-spec-item-discard'}),
  Object.freeze({name:'Faba',set:'LOT',number:'173',
    type:'supporter-lost-zone'})
]);

/**
 * Tool Jammer affects only a Tool attached to an opposing Active Pokémon.
 * It has no such effect when the Tool-equipped Garbodor is on the Bench.
 */
const ACTIVE_ONLY_TOOL_JAMMER=Object.freeze({
  name:'Tool Jammer',set:'BST',number:'136',
  type:'opponent-active-tool-nullification'
});

/** @param {object} card @param {object} identity */
function printingMatches(card, identity){
  return card?.name===identity.name&&
    card.printing?.set===identity.set&&
    String(card.printing?.number)===identity.number;
}

/**
 * @param {object} field Aichi original field manifest.
 * @returns {object} Source inventory flags and group counts, no gameplay.
 */
function toolCounterFieldCensus(field){
  assert.ok(field&&Array.isArray(field.decks)&&field.decks.length>0);
  const rows=[];
  for(const deck of field.decks){
    assert.ok(Number.isSafeInteger(deck.rank)&&deck.rank>=1&&deck.rank<=32);
    assert.ok(Array.isArray(deck.cards)&&deck.cards.every(
      card=>Number.isSafeInteger(card.count)&&card.count>=1));
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    const answers=DIRECT_TOOL_ANSWERS.map(identity=>({
      type:identity.type,printing:identity.name+' '+
        identity.set+' '+identity.number,
      count:deck.cards.filter(card=>printingMatches(card,identity))
        .reduce((sum,card)=>sum+card.count,0)
    })).filter(answer=>answer.count>0);
    const jammer=deck.cards.filter(card=>printingMatches(
      card,ACTIVE_ONLY_TOOL_JAMMER)).reduce((sum,c)=>sum+c.count,0);
    rows.push({
      rank:deck.rank,archetype:deck.archetype,player:deck.player,
      directCounterCopies:answers.reduce((sum,a)=>sum+a.count,0),
      directCounterPrintings:answers,
      containsDirectBenchedToolCounter:answers.length>0,
      activeOnlyToolJammerCopies:jammer,
      activeOnlyToolJammer:jammer>0
    });
  }
  assert.equal(new Set(rows.map(x=>x.rank)).size,rows.length);
  const reportCount=(predicate)=>rows.filter(predicate).length;
  const copyTotal=identity=>rows.reduce((total,row)=>total+
    (row.directCounterPrintings.find(x=>
      x.printing===identity.name+' '+identity.set+' '+identity.number)?.count||0),0);
  return {
    source:'exact-original-printed-60-inventory-only',
    knownSourceDecks:rows.length,
    directBenchedToolCounterRanks:reportCount(row=>
      row.containsDirectBenchedToolCounter),
    noListedDirectBenchedToolCounterRanks:rows.filter(row=>
      !row.containsDirectBenchedToolCounter).map(row=>row.rank),
    activeOnlyToolJammerRanks:rows.filter(row=>row.activeOnlyToolJammer)
      .map(row=>row.rank),
    directToolAnswerCopies:Object.fromEntries(
      DIRECT_TOOL_ANSWERS.map(answer=>[
        answer.name+' '+answer.set+' '+answer.number,copyTotal(answer)])),
    rows,
    interpretation:'Printed-card presence is a potential response, not proof '+
      'the counter is unprized, held, searchable, legally playable, selected, '+
      'unlocked, or strategically good. This is not a win-rate estimate.'
  };
}

module.exports={DIRECT_TOOL_ANSWERS,ACTIVE_ONLY_TOOL_JAMMER,
  printingMatches,toolCounterFieldCensus};
