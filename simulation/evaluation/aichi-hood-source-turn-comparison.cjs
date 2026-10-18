'use strict';

const {createHash}=require('node:crypto');
const path=require('node:path');
const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {prepareCandidateInputOrder}=require('./aichi-candidate-input-order.cjs');
const {captureSourceSetup}=require('./aichi-setup-zone-capture.cjs');
const {openingInventoriesMatch}=require('../twinleaf/opening-setup-zones.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {Store}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));

/** @param {unknown} value */
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Two predeclared physical rank-6 Aichi source deals, one candidate-first and
 * one candidate-second. Original champion and unchanged Hood Shield source60
 * are each evaluated against the identical opponent deck and v3 slot seed.
 * Both candidate input-order protocols are kept separate and identified.
 * All bots are the existing generic, unqualified policy. No wins are scored.
 *
 * @returns {object}
 */
function runHoodSourceTurnComparison(){
  const inputs=loadCampaignInputs();
  const sourceReference=inputs.candidates.find(c=>c.id==='champion-reference');
  const hood=inputs.candidates.find(c=>c.id==='hood-shield-v1');
  const opponentSource=inputs.source.decks.find(d=>d.rank===6);
  if(!sourceReference||!hood||!opponentSource){
    throw Error('Frozen champion, Hood and published rank6 sources required');
  }
  const resolved=new Map([sourceReference,hood].map(candidate=>[
    candidate.id,planAichi({label:candidate.id,cards:candidate.cards},{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })
  ]));
  const opponent=resolved.get(sourceReference.id).opponents
    .find(row=>row.rank===6);
  if(opponent?.status!=='ready'||opponent.cards?.length!==60){
    throw Error('Rank6 opponent source 60 could not be resolved');
  }
  const registered=[
    {candidateSlot:'A',candidateSeat:0,repeat:0,
      expectedCandidateActuallyFirst:true},
    {candidateSlot:'B',candidateSeat:1,repeat:0,
      expectedCandidateActuallyFirst:false}
  ];
  const rows=[];
  for(const deal of registered){
    const seed=deriveSlotSeeds(20261016,'pilot',6,deal.repeat)[deal.candidateSlot];
    for(const candidate of [sourceReference,hood]){
      const protocols=candidate.referenceOnly ?
        ['source-row-order-v1'] :
        ['source-row-order-v1','reference-aligned-v1'];
      for(const protocol of protocols){
        const order=prepareCandidateInputOrder(
          sourceReference.cards,candidate.cards,
          resolved.get(candidate.id).candidate.cards,protocol);
        const request={
          deckA:deal.candidateSeat===0?order.engineIds:opponent.cards,
          deckB:deal.candidateSeat===1?order.engineIds:opponent.cards,
          seed,maxActions:320,
          strictPromptValidation:true,isolatePolicyRandomness:true,
          captureDecisionTrace:true,
          label:'source-rank6-hood-turn-'+deal.candidateSlot+'-'+
            candidate.id+'-'+protocol
        };
        const {game,setupZones}=captureSourceSetup(Store,()=>runMatch(request));
        if(!openingInventoriesMatch(setupZones?.seats,[request.deckA,request.deckB])){
          throw Error('Opening source-copy conservation failed: '+request.label);
        }
        const actualFirst=game.verifiedByDrawLog===true &&
          game.firstTurnSlot===deal.candidateSeat;
        if(game.verifiedByDrawLog!==true ||
           actualFirst!==deal.expectedCandidateActuallyFirst){
          throw Error('Observed source turn order violates predeclared stratum: '+
            request.label);
        }
        const own=setupZones.seats[deal.candidateSeat];
        const opponentSetup=setupZones.seats[1-deal.candidateSeat];
        const actions=game.decisionTrace||[];
        const ownDecisions=actions.filter(row=>
          row.playerSlot===deal.candidateSeat);
        const oppDecisions=actions.filter(row=>
          row.playerSlot===1-deal.candidateSeat);
        const ownRelevant=ownDecisions.filter(row=>
          row.action==='AttackAction'||row.action==='PassTurnAction'||
          row.action==='RetreatAction'||
          /arven|stealthy hood|shadow rider calyrex|forest seal/i.test(
            row.card||'')||/underworld door/i.test(row.ability||''));
        const opponentRelevant=oppDecisions.filter(row=>
          row.action==='AttackAction'||row.action==='PassTurnAction'||
          /iron thorns|guzma|faba|megaton blower/i.test(row.card||''));
        rows.push({
          schema:'source-locked-hood-generic-policy-turn-v1',
          opponentRank:6,sourceCandidate: candidate.id,
          seed,physicalCandidateSlot:deal.candidateSlot,
          actualCandidateFirst:actualFirst,
          inputOrderProtocol:protocol,
          originalInputHash:order.sourceInputHash,
          executedInputHash:order.executedInputHash,
          sourceCopyOverlap:order.sharedCopies,
          printedMatchingPositions:order.matchingPositionsAfter,
          observedCandidateTurn1:{
            hand:own.hand,active:own.active,bench:own.bench,
            arvenInHand:own.hand.includes('Arven SVI'),
            hoodInHand:own.hand.includes('Stealthy Hood UNB'),
            arvenPrized:null
          },
          observedOpponentPublic:{
            active:opponentSetup.active,bench:opponentSetup.bench
          },
          opponentPostSetupFullZoneDigest:
            digest(opponentSetup),
          observedSourceDeckIdentity:true,
          actualGameFinished:game.finished,
          observedEngineWinner:game.winner,
          actions:game.actions,turns:game.turns,
          actualCandidateActions:game.actionsBySeat[deal.candidateSeat],
          candidateCardsPlayed:game.cardsPlayedBySeat[deal.candidateSeat],
          candidateAttacks:game.attackTrace.filter(x=>
            x.seat===deal.candidateSeat),
          opponentAttacks:game.attackTrace.filter(x=>
            x.seat===1-deal.candidateSeat),
          ownRelevantDecisionTrace:ownRelevant,
          opponentRelevantDecisionTrace:opponentRelevant,
          rawDecisionTraceDigest:digest(actions),
          rawGameDigest:digest(game),
          researchStrengthQualified:false
        });
      }
    }
  }
  return {
    schema:'aichi-hood-source-turn-policy-audit-v1',
    researchRevision:process.env.GITHUB_SHA||null,
    rank:6, registeredDeals:registered,
    seedProtocol:'decorrelated-slots-v3',
    printedSourceDecksUnchanged:true,
    candidatePolicy:'pinned-SimpleTacticsAi-generic-unqualified',
    purpose:'detect actual owner-hand Arven/Hood evolution action and first opponent response under both live starting turns',
    limitation:'two purposively selected deterministic source deals, with raw and aligned input protocols as distinct arms. No skilled-play strength or win-rate inference.',
    competitiveGamesQualified:0,rows
  };
}
if(require.main===module){
  const archive=runHoodSourceTurnComparison();
  process.stdout.write(JSON.stringify(archive,null,2)+'\n');
  process.stderr.write(JSON.stringify({
    schema:archive.schema,
    rows:archive.rows.map(row=>({
      slot:row.physicalCandidateSlot,arm:row.sourceCandidate,
      inputOrder:row.inputOrderProtocol,
      candidateFirst:row.actualCandidateFirst,
      arvenHeld:row.observedCandidateTurn1.arvenInHand,
      hoodHeld:row.observedCandidateTurn1.hoodInHand,
      arvenPlayed:Object.entries(row.candidateCardsPlayed)
        .filter(([name])=>/arven/i.test(name)),
      hoodPlayed:Object.entries(row.candidateCardsPlayed)
        .filter(([name])=>/stealthy hood/i.test(name)),
      attacks:row.candidateAttacks.length,
      opponentAttacks:row.opponentAttacks.length,
      firstOwnRelevant:row.ownRelevantDecisionTrace.slice(0,6)
        .map(x=>({turn:x.turnBefore,action:x.action,card:x.card,ability:x.ability})),
      status:row.actualGameFinished?'finished':'capped'
    }))
  })+'\n');
}
module.exports={runHoodSourceTurnComparison};
