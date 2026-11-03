'use strict';

const assert=require('node:assert/strict');

const VERSION='agent26-owner-k0-unseen-basic-posterior-v1';

/**
 * Exact binomial coefficient for nonnegative integer inputs up to sixty.
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k)&&k>=0);
  if(k>n)return 0n;
  const m=Math.min(k,n-k);
  let out=1n;
  for(let j=1;j<=m;j++)out=out*BigInt(n-j+1)/BigInt(j);
  return out;
}

/**
 * Collect owner-owned face-up and owner-hand physical card printings from
 * the detached actor observation. Never reads opponent's concealed zones.
 * A call is valid at a settled genuine owner root, before any action prompt.
 * @param {object} view
 * @returns {string[]}
 */
function knownOwnerOutsideDeckAndPrizes(view){
  assert.equal(view?.decisionKind,'owner-root');
  const owner=view.ownPublic;
  const pokemon=[owner.active,...owner.bench].filter(Boolean);
  return [
    ...view.ownHand,
    ...owner.discard,
    ...owner.lostZone,
    ...owner.stadium,
    ...(owner.resolvingSupporter??[]),
    ...pokemon.flatMap(slot=>[
      ...slot.evolutionPrintings,
      ...slot.energies,
      ...slot.tools
    ])
  ];
}

/**
 * K0 conditional posterior over *unseen* Basic Pokémon in the owner's deck.
 *
 * The caller must affirm that its deck/Prize boundary is exchangeable:
 * its own exact registered sixty is known, all non-deck/non-Prize physical
 * copies are included in actorObservation, and no Prize peek, selected
 * hidden-card movement, earlier deck search, or private knowledge has
 * conditioned which unseen copy is in which hidden zone. This is a model,
 * not a proof that the caller actually knows its Prize/deck memberships.
 *
 * The distribution is hypergeometric:
 * P(deck Basics=k)=C(R,k)C(U-R,D-k)/C(U,D),
 * where U=D+P unseen cards, R unseen Basics, D deck cards, P Prizes.
 * @param {object} view Detached owner-root observation.
 * @param {string[]} ownRegisteredSixty Exact own physical printing names.
 * @param {Set<string>} basicPrintings Public exact Basic Pokémon print catalog.
 * @param {{unseenZonesExchangeable:boolean}} assumptions
 * @returns {object}
 */
function unseenOwnDeckBasicsPosterior(view,ownRegisteredSixty,basicPrintings,assumptions){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Array.isArray(ownRegisteredSixty));
  assert.equal(ownRegisteredSixty.length,60);
  assert.ok(basicPrintings instanceof Set);
  assert.equal(assumptions?.unseenZonesExchangeable,true,
    'Uniform unseen deck/Prize assignment must be explicitly certified');
  assert.ok(view.ownerK1?.exactMembershipKnown!==true,
    'K1 known-membership state requires a different model');

  const visible=knownOwnerOutsideDeckAndPrizes(view);
  const own=view.ownPublic;
  const D=own.deckCount,P=own.prizeCount;
  assert.ok(Number.isSafeInteger(D)&&D>=0);
  assert.ok(Number.isSafeInteger(P)&&P>=0&&P<=6);
  assert.equal(visible.length+D+P,60,
    'Owner zone inventory is incomplete or duplicated');

  const registered=new Map(),seen=new Map();
  for(const name of ownRegisteredSixty)
    registered.set(name,(registered.get(name)??0)+1);
  for(const name of visible)
    seen.set(name,(seen.get(name)??0)+1);
  for(const [name,count] of seen)
    assert.ok(count<=(registered.get(name)??0),
      'Known physical cards exceed exact registered printing copies: '+name);

  const basicRegistered=ownRegisteredSixty.reduce((n,name)=>
    n+Number(basicPrintings.has(name)),0);
  const basicSeen=visible.reduce((n,name)=>
    n+Number(basicPrintings.has(name)),0);
  const R=basicRegistered-basicSeen,U=D+P;
  assert.ok(R>=0&&R<=U);
  const denominator=choose(U,D);
  assert.ok(denominator>0n);

  const minimum=Math.max(0,R-P);
  const maximum=Math.min(R,D);
  const pmf=[];
  for(let k=minimum;k<=maximum;k++){
    const numerator=choose(R,k)*choose(U-R,D-k);
    pmf.push({basicsInDeck:k,probability:Number(numerator)/Number(denominator)});
  }
  const allInPrizes=R<=P?
    Number(choose(P,R))/Number(choose(U,R)):0;
  return {
    version:VERSION,
    status:'CONDITIONAL_K0_EXCHANGEABILITY_MODEL',
    deckCards:D,prizeCards:P,unseenCards:U,
    basicRegistered,basicVisibleOutsideHiddenZones:basicSeen,
    basicUnseen:R,
    guaranteedMinimumBasicsInDeck:minimum,
    possibleMaximumBasicsInDeck:maximum,
    distribution:pmf,
    probabilityAtLeastOneBasicInDeck:1-allInPrizes,
    probabilityNoBasicsInDeck:allInPrizes,
    expectedBasicsInDeck:U===0?0:D*R/U,
    assumptions:{
      unknownDeckAndPrizePartitionExchangeable:true,
      ownRegisteredSixtyExactlyKnown:true,
      ownVisibleZonesCopyConserved:true,
      noHiddenZoneMembershipInformationAsserted:true
    },
    paperLegalTrainerActionProven:false,
    gameplayPolicyCompetenceProven:false,
    competitiveGameQualified:false
  };
}

module.exports={
  VERSION,choose,knownOwnerOutsideDeckAndPrizes,
  unseenOwnDeckBasicsPosterior
};
