'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const VERSION='agent15-rank11-source-pass11-quickball-v1';
const ROOT=Object.freeze({
  id:'11:103:B:champion-reference',seat:0,turn:2,firstPlayer:1,
  passOrdinal:11,hand:['VS Seeker PHF','Quick Ball FST',
    'Dark Patch ASR','Garbodor BKP'],
  handSha256:'e5ff17ac1ba229710697a221a9db46aaf182468a9845ed5dc6407475d974f910',
  physicalSourceSha256:'2f33b58ccbb4985dfd07617f43198ff0ba336899fa88af9f36ca8a0f017b3fa0',
  fullPhysicalDealSha256:'c6438223d1df290c826264dc1c11652b00cdfedc50dcac92bcf4bcd43b6e2f04',
  prefixRootSha256:'4e231f5e2d51107546d684d11fab3071625845221262ea7c48d8722c1725536c',
  boardPokemon:['Mega Absol ex','Tapu Lele-GX','Squawkabilly ex'],
  attachedEnergy:['Darkness Energy'],
  priorOwnerNonPrompt:[{ordinal:10,action:'PlayCardAction',
    card:'Darkness Energy'}],
  priorOpponentNonPrompt:[{ordinal:7,action:'PassTurnAction'}]
});
/**
 * Probability all physical copies of a named group occupy the unknown Prize
 * slots, conditional on an otherwise uniform K0 deck/Prize permutation.
 * @param {number} unseenCards Count of cards in deck plus uninspected Prizes.
 * @param {number} prizeSlots Concealed Prize slots.
 * @param {number} copies Number of copies of the group in the unseen pool.
 * @returns {number} Exact finite-population conditional probability.
 */
function allInPrizes(unseenCards,prizeSlots,copies){
  assert.ok(Number.isSafeInteger(unseenCards)&&unseenCards>0);
  assert.ok(Number.isSafeInteger(prizeSlots)&&prizeSlots>=0&&
    prizeSlots<=unseenCards);
  assert.ok(Number.isSafeInteger(copies)&&copies>=0&&
    copies<=unseenCards);
  if(copies>prizeSlots)return 0;
  let prob=1;
  for(let i=0;i<copies;i++)prob*=(prizeSlots-i)/(unseenCards-i);
  return prob;
}

/**
 * Conditional exact-print source-opportunity certificate. Native prompt
 * resolution and absence of hidden prohibitions require separate audit.
 * @param {object} source Frozen original rank11 60.
 * @param {object[]} fst Fusion Strike JSON card printings.
 * @param {object[]} asr Astral Radiance JSON card printings.
 * @returns {object} Paper prerequisite counts, never a competitive win.
 */
function certify(source,fst,asr){
  assert.equal(source.rank,11);
  assert.equal(source.cards.reduce((s,c)=>s+c.count,0),60);
  const card=(n,set,id,count)=>{
    const c=source.cards.find(x=>x.name===n&&
      x.printing.set===set&&x.printing.number===id);
    assert.equal(c?.count,count);
  };
  card('Quick Ball','FST','237',4);
  card('Dark Patch','ASR','139',3);
  const quick=fst.find(c=>c.id==='swsh8-237');
  const patch=asr.find(c=>c.id==='swsh10-139');
  assert.ok(quick?.rules.some(t=>/discard another card/i.test(t)));
  assert.ok(quick?.rules.some(t=>/Basic Pokémon/i.test(t)));
  assert.ok(patch?.rules.some(t=>/basic Darkness Energy/i.test(t)));
  assert.ok(patch?.rules.some(t=>/discard pile/i.test(t)));
  assert.equal(ROOT.turn,2);
  assert.equal(ROOT.firstPlayer,1);
  assert.equal(ROOT.priorOwnerNonPrompt.length,1);
  assert.equal(ROOT.priorOwnerNonPrompt[0].card,'Darkness Energy');
  assert.equal(createHash('sha256').update(JSON.stringify(ROOT.hand))
    .digest('hex'),ROOT.handSha256);
  assert.deepEqual(ROOT.hand,['VS Seeker PHF','Quick Ball FST',
    'Dark Patch ASR','Garbodor BKP']);
  assert.deepEqual(ROOT.boardPokemon,
    ['Mega Absol ex','Tapu Lele-GX','Squawkabilly ex']);
  assert.deepEqual(ROOT.attachedEnergy,['Darkness Energy']);
  const pokemon=source.cards.filter(c=>c.category==='Pokémon');
  const basics=pokemon.filter(c=>c.name!=='Garbodor')
    .reduce((n,c)=>n+c.count,0);
  assert.equal(basics,11);
  assert.equal(pokemon.find(c=>c.name==='Garbodor')?.count,2);
  const energy=source.cards.filter(c=>c.category==='Energy')
    .reduce((n,c)=>n+c.count,0);
  assert.equal(energy,8);
  const deck=60-ROOT.hand.length-6-ROOT.boardPokemon.length-
    ROOT.attachedEnergy.length;
  const deckBasics=basics-ROOT.boardPokemon.length-6;
  assert.equal(deck,46);
  assert.equal(deckBasics,2);
  const secondMega=source.cards.find(c=>c.name==='Mega Absol ex').count-1;
  const trubbish=source.cards.find(c=>c.name==='Trubbish').count;
  assert.equal(secondMega,2);
  assert.equal(trubbish,2);
  const unseen=deck+6;
  const toolNames=new Set(['Float Stone','Forest Seal Stone','Muscle Band']);
  const printedTools=source.cards.filter(c=>toolNames.has(c.name))
    .reduce((n,c)=>n+c.count,0);
  assert.equal(printedTools,6);
  // After choosing one Trubbish from 46 cards, the shuffled deck has 45.
  // Conditioning on >=1 Trubbish in deck slightly changes the expected
  // number of Tools left there relative to unconditional Prize averaging.
  const trubbishAvailable=1-allInPrizes(unseen,6,trubbish);
  const toolAndTrubbishAvailable=(unseen-6)/unseen-
    allInPrizes(unseen,6,trubbish)*(unseen-6)/(unseen-trubbish);
  const nextDrawToolGivenTrubbish=printedTools*
    toolAndTrubbishAvailable/trubbishAvailable/(deck-1);
  const eitherTargetNotPrized=1-allInPrizes(unseen,6,
    secondMega+trubbish);
  const bothTargetsNotFullyPrized=1-
    allInPrizes(unseen,6,secondMega)-
    allInPrizes(unseen,6,trubbish)+
    allInPrizes(unseen,6,secondMega+trubbish);
  return {
    version:VERSION,sourceRegistration:ROOT.id,
    sourceSeat:0,sourceGlobalTurn:2,sourcePassOrdinal:11,
    originalSourceDealSha256:ROOT.physicalSourceSha256,
    exactHandSha256:ROOT.handSha256,
    totalBasicPokemonInOriginal60:basics,
    guaranteedBasicPokemonInDeckGivenCompletePrefix:deckBasics,
    totalDeckCardsGivenCompletePrefix:deck,
    k0UnseenPoolOfDeckAndPrizes:unseen,
    k0ProbabilitySecondMegaAbsolAvailable:
      1-allInPrizes(unseen,6,secondMega),
    k0ProbabilityTrubbishAvailable:
      1-allInPrizes(unseen,6,trubbish),
    k0ProbabilityMegaOrTrubbishAvailable:eitherTargetNotPrized,
    k0ProbabilityMegaAndTrubbishBothAvailable:bothTargetsNotFullyPrized,
    printedGarbotoxinToolEnablers:printedTools,
    nextOwnerNaturalDrawToolChanceAfterSearchForTrubbish:
      nextDrawToolGivenTrubbish,
    unconditionalTrubbishSearchAndNextNaturalToolDraw:
      trubbishAvailable*nextDrawToolGivenTrubbish,
    k0DistributionAssumption:
      'Uninspected random 6 Prize slots among 52 unseen original owner cards, conditioned on exact own hand and board',
    spareBenchSlots:3,handDiscardPayment:'Dark Patch ASR',
    darkPatchHasNoImmediateEnergyInDiscard:true,
    itemPlayObserved:false,searchPromptSettled:false,
    qualifiedCompetitiveGames:0,
    limitations:'Conditional on complete unchanged native prefix with no source discard, Lost Zone or Item lock. Native Store payment, physical search, Bench placement and opponent response untested.'
  };
}
module.exports={VERSION,ROOT,allInPrizes,certify};
