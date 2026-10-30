'use strict';
const assert=require('node:assert/strict');
const {countBasics,EVOLUTIONS}=
  require('./aichi-field-mulligan-census.cjs');
const {openingProbabilities}=require('./aichi-opening-basics.cjs');
const {logFailedHandMass}=
  require('./agent26-public-mulligan-fullhistory.cjs');

const VERSION='agent26-native-printing-public-mulligan-posterior-v1';

/**
 * Exact source-inventory posterior from the fullName identities that the
 * actual opponent-facing native Store revealed in Basic-free seven(s).
 * Every recovered source 60 and all card definitions are PUBLIC hypotheses.
 * No actual concealed hand/deck/Prize state enters the likelihood.
 *
 * The native resolver may substitute equivalent printed Basic Energy cards.
 * Therefore this is explicitly a *native-resolved* source-identity model,
 * not a paper-original-printing attestation or gameplay policy.
 *
 * @param {object} manifest Exact published 29-source deck manifest.
 * @param {object} plan Already resolved public 29-source native deck plan.
 * @param {Map<string,string>} nameIndex Public fullName to source name map.
 * @param {string[][]} opponentPublicFullNameFailedHands
 * @returns {object}
 */
function nativePrintingPublicPosterior(manifest,plan,nameIndex,
  opponentPublicFullNameFailedHands){
  assert.equal(manifest.decks.length,29);
  assert.ok(Array.isArray(opponentPublicFullNameFailedHands));
  assert.ok(nameIndex instanceof Map);
  const rows=manifest.decks.map(deck=>{
    const resolved=deck.rank===plan.candidateRank?
      plan.candidate:plan.opponents.find(x=>x.rank===deck.rank);
    assert.ok(Array.isArray(resolved?.cards)&&resolved.cards.length===60,
      'Source native resolved sixty missing');
    const basicNames=new Set(deck.cards.filter(card=>
      card.category==='Pokémon'&&!EVOLUTIONS.has(
        card.printing.set+'-'+card.printing.number)).map(card=>card.name));
    const originalBasics=countBasics(deck);
    const counts=new Map();
    let nativeBasics=0;
    for(const fullName of resolved.cards){
      const name=nameIndex.get(fullName);
      assert.ok(name,'Unrecognized public source printing '+fullName);
      if(basicNames.has(name)){
        nativeBasics++;
      }else{
        counts.set(fullName,(counts.get(fullName)??0)+1);
      }
    }
    assert.equal(nativeBasics,originalBasics,
      'Native Basic names differ from source printing-stage inventory');
    const valid=1-openingProbabilities(originalBasics)
      .initialMulliganProbability;
    let logLikelihood=Math.log(valid);
    for(const hand of opponentPublicFullNameFailedHands){
      const mass=logFailedHandMass({counts},hand);
      if(mass===-Infinity){logLikelihood=-Infinity;break;}
      logLikelihood+=mass;
    }
    return {rank:deck.rank,archetype:deck.archetype,
      nativeBasicCount:nativeBasics,logLikelihood};
  }).sort((a,b)=>a.rank-b.rank);
  const finite=rows.map(x=>x.logLikelihood).filter(Number.isFinite);
  assert.ok(finite.length>0,
    'Native public opening impossible for every recovered printed source');
  const max=Math.max(...finite);
  const weights=rows.map(x=>x.logLikelihood===-Infinity?0:
    Math.exp(x.logLikelihood-max));
  const sum=weights.reduce((n,x)=>n+x,0);
  return {version:VERSION,prior:'uniform over 29 native-resolved originals',
    publicFailedSevenCount:opponentPublicFullNameFailedHands.length,
    models:rows.map((x,i)=>({...x,posterior:weights[i]/sum})),
    possibleSourceRanks:rows.filter((x,i)=>weights[i]>0).map(x=>x.rank),
    allSourcePrintingsNativeResolved:true,
    usesOnlyOpponentPublicFullNameReveals:true,
    underlyingPaperOriginalPrintsMayHaveLegalEquivalentSubstitutions:true,
    sourceRankKnownToActor:false,
    fullGames:0,competitiveQualifiedGames:0};
}

module.exports={VERSION,nativePrintingPublicPosterior};
