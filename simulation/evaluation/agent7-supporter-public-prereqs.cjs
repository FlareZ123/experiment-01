'use strict';
const assert=require('node:assert/strict');

const VERSION='agent7-owner-visible-supporter-public-preconditions-v1';
const CARD_NAMES=[
  'Plumeria BUS','Guzma BUS','Ace Trainer AOR',
  "Lillie's Determination M1L",'Carmine TWM'
];

/**
 * Count only owner-public necessary conditions for a useful printed Supporter
 * line at an authenticated native-accepted Pass. One held name is counted
 * once per Pass. All selected lines additionally require the existing
 * quota/first-turn/lock structural screen and native canPlay(null) positive.
 *
 * These screens do not certify actual printed-paper legality, target choices,
 * low-discard-cost cards, effect settlement or tactical desirability.
 *
 * @param {object} report Archived original Store canonical runner report.
 * @returns {object}
 */
function auditSupporterPublicPrerequisites(report){
  assert.ok(Array.isArray(report?.rows));
  const summaries={};
  const count=(category,printing,feature)=>{
    const key=category+':'+printing;
    summaries[key]??={category,printing,offerPasses:0,
      publicOpportunity:0,subfeature1:0,subfeature2:0};
    summaries[key][feature]++;
  };
  let acceptedPassSamples=0,positivePassSamples=0;
  for(const row of report.rows){
    const audit=row.actorOnlyDecisionCoverage?.ownerSupporterOpportunityAudit;
    assert.ok(audit?.actualStoreSeen&&audit.nativeNullTargetProbeOptIn===true);
    assert.ok(Array.isArray(audit.passSamples));
    for(const sample of audit.passSamples){
      if(sample.nativePassReceipt?.accepted!==true)continue;
      acceptedPassSamples++;
      const g=sample.publicGeometry;
      assert.ok(g&&Number.isSafeInteger(g.ownerHandCount)&&
        Number.isSafeInteger(g.opponentAttachedEnergyCards)&&
        Number.isSafeInteger(g.ownerPrizeCount)&&
        Number.isSafeInteger(g.opponentPrizeCount));
      const positive=new Set(sample.held.filter(card=>
        card.structurallyOpen&&card.nativeNullTargetCanPlay===true&&
        CARD_NAMES.includes(card.printing)).map(card=>card.printing));
      if(positive.size)positivePassSamples++;
      const category=(row.sourceActuallyFirst?'source-first':'candidate-first')+
        ':'+(sample.seat===row.sourceSeat?'source':'candidate');
      for(const printing of positive){
        count(category,printing,'offerPasses');
        if(printing==='Plumeria BUS'){
          if(g.ownerHandCount>=3)count(category,printing,'subfeature1');
          if(g.opponentAttachedEnergyCards>0)
            count(category,printing,'subfeature2');
          if(g.ownerHandCount>=3&&g.opponentAttachedEnergyCards>0)
            count(category,printing,'publicOpportunity');
        }else if(printing==='Guzma BUS'){
          if(g.opponentBenchCount>0)count(category,printing,'subfeature1');
          if(g.ownerBenchCount>0)count(category,printing,'subfeature2');
          if(g.opponentBenchCount>0&&g.ownerBenchCount>0)
            count(category,printing,'publicOpportunity');
        }else if(printing==='Ace Trainer AOR'){
          if(g.ownerPrizeCount>g.opponentPrizeCount)
            count(category,printing,'publicOpportunity');
        }else if(printing==="Lillie's Determination M1L"){
          // Printed 8-card draw mode at exactly six Prize cards; no claim
          // of having enough valuable disposable hand or a free Supporter.
          if(g.ownerPrizeCount===6)
            count(category,printing,'publicOpportunity');
        }else if(printing==='Carmine TWM'){
          if(sample.firstPlayerFirstTurn)
            count(category,printing,'publicOpportunity');
        }
      }
    }
  }
  return {
    version:VERSION,observedArms:report.rows.length,
    acceptedPassSamples,positivePassSamples,
    cardScreens: Object.values(summaries).sort((a,b)=>
      a.category.localeCompare(b.category)||a.printing.localeCompare(b.printing)),
    meanings:{
      plumeria:'Discardable physical cards >=2 by count and opponent attached Energy card >=1: opportunity to pay and target, not DCI or rule certification.',
      guzma:'Opponent Bench >=1 and own Bench >=1 permits both printed switches in principle. Opponent Bench only permits potential first gust.',
      aceTrainer:'Owner Prize cards remaining strictly greater than opponent: exact printed play condition only.',
      lilliesDetermination:'Six owner Prize cards remaining allows printed draw-eight mode in principle; other cards draw-six.',
      carmine:'First-player first-turn printed exception; still requires real discard/draw and a choice.',
      qualification:'All screens postgame and owner-public; missing card text, engine prompt and effect qualifications remain.'
    },
    competitiveQualifiedGames:0
  };
}
module.exports={VERSION,auditSupporterPublicPrerequisites};
