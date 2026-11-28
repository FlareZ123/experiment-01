'use strict';

// Deterministic opening-hand policy comparison on the EXACT fixed original
// rank15 source 60. Quantifies opening choice and Bench preservation, NOT
// game or matchup strength. Reproducible independent of native Store.
const {SOURCE_COUNTS}=require('./agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const {planRank15StartingBasics}=require(
  '../../twinleaf/2026-11/agent20-rank15-owner-setup-priority.cjs');

const BASIC_NAMES=new Set([
  'Oddish','Buneary','Pidgey','Bunnelby','Fan Rotom','Budew','Tatsugiri','Eldegoss V'
]);
const ENERGY_NAMES=new Set([
  'Grass Energy','Jet Energy','Capture Energy',
  'Powerful Colorless Energy','Double Colorless Energy'
]);
function extractName(printing) {
  return printing.replace(/\s+[A-Z][A-Z0-9-]{1,8}\s+[A-Z0-9]+$/,'');
}
function exactOriginalSourceCards() {
  const cards=SOURCE_COUNTS.flatMap(([printing,count])=>{
    const name=extractName(printing);
    return Array.from({length:count},()=>({
      printing,name,superType:BASIC_NAMES.has(name)?'POKEMON':
        ENERGY_NAMES.has(name)?'ENERGY':'TRAINER',
      stage:BASIC_NAMES.has(name)?'BASIC':null,tags:[]
    }));
  });
  if(cards.length!==60)throw Error('ORIGINAL_60_COUNT_MISMATCH');
  return cards;
}
function choose(n,k) {
  if(k<0||k>n)return 0;
  let result=1;
  for(let i=1;i<=k;i++)result=result*(n-k+i)/i;
  return result;
}
function exactTMEnergyLeadFraction() {
  // Inclusion/exclusion across disjoint 2 Bunnelby / 2 TM / 7 Energy.
  const atLeast=(n)=>choose(n,7)/choose(60,7);
  return 1-atLeast(58)-atLeast(58)-atLeast(53)+
    atLeast(56)+2*atLeast(51)-atLeast(49);
}
function xorshift32(seed) {
  let value=seed>>>0;
  if(value===0)throw Error('ZERO_RNG_SEED');
  return ()=>{
    value^=value<<13;value^=value>>>17;value^=value<<5;
    return value>>>0;
  };
}
function simulate({hands=300000,seed=0x20C0FFEE}={}) {
  if(!Number.isSafeInteger(hands)||hands<1||hands>5000000)
    throw Error('BAD_HAND_COUNT');
  const deck=exactOriginalSourceCards(),rand=xorshift32(seed);
  const stats={
    samples:hands,mulliganInitial:0,playableInitial:0,activeChanged:0,
    bunnelbyTmEnergyOpen:0,bunnelbyTmEnergyActiveCorrected:0,
    eldegossInInitial:0,eldegossRetainedInsteadOfBaselineSetup:0,
    eldegossBenchedOnlySurvivalBackup:0,baselineFiveBench:0,
    noSupporterAccessTatsugiriLeadImproved:0,
    baselineActiveNames:{},proposedActiveNames:{}
  };
  const inds=Array.from({length:60},(_,i)=>i);
  for(let t=0;t<hands;t++){
    for(let i=0;i<7;i++){
      const j=i+(rand()%(60-i));
      [inds[i],inds[j]]=[inds[j],inds[i]];
    }
    const hand=inds.slice(0,7).map(i=>deck[i]);
    const basics=hand.filter(c=>BASIC_NAMES.has(c.name));
    if(!basics.length){stats.mulliganInitial++;continue}
    stats.playableInitial++;
    const baseline=basics.slice(0,6);
    const proposed=planRank15StartingBasics(hand,basics,{maxSelections:6});
    if(!proposed||!proposed.length)throw Error('SOURCE_SETUP_PLAN_FAILED');
    const oldLead=baseline[0].name,newLead=proposed[0].name;
    stats.baselineActiveNames[oldLead]=(stats.baselineActiveNames[oldLead]??0)+1;
    stats.proposedActiveNames[newLead]=(stats.proposedActiveNames[newLead]??0)+1;
    if(oldLead!==newLead)stats.activeChanged++;
    const tmLine=hand.some(c=>c.name==='Bunnelby')&&
      hand.some(c=>c.name==='Technical Machine: Evolution')&&
      hand.some(c=>ENERGY_NAMES.has(c.name));
    if(tmLine){
      stats.bunnelbyTmEnergyOpen++;
      if(oldLead!=='Bunnelby'&&newLead==='Bunnelby')
        stats.bunnelbyTmEnergyActiveCorrected++;
    }
    const eldegoss=basics.find(c=>c.name==='Eldegoss V');
    if(eldegoss){
      stats.eldegossInInitial++;
      if(baseline.includes(eldegoss)&&!proposed.includes(eldegoss))
        stats.eldegossRetainedInsteadOfBaselineSetup++;
      if(proposed[0]!==eldegoss&&proposed.includes(eldegoss))
        stats.eldegossBenchedOnlySurvivalBackup++;
    }
    if(baseline.length===6)stats.baselineFiveBench++;
    const supporterAccess=hand.some(c=>
      ['Tag Call','Guzma & Hala','Guzma','N','Karen'].includes(c.name));
    if(!supporterAccess&&basics.some(c=>c.name==='Tatsugiri')&&
      oldLead!=='Tatsugiri'&&newLead==='Tatsugiri')
      stats.noSupporterAccessTatsugiriLeadImproved++;
  }
  const withPercent=(n,den=hands)=>den?100*n/den:0;
  return {
    kind:'original-rank15-opening-hand-policy-proxy',
    seed:seed>>>0,
    exactSourceCopies:deck.length,
    exactOpeningBunnelbyTmEnergyPercent:100*exactTMEnergyLeadFraction(),
    observed:stats,
    percentages:{
      initialMulligan:withPercent(stats.mulliganInitial),
      activeChoiceChangesInPlayableHands:withPercent(stats.activeChanged,stats.playableInitial),
      bunnelbyTmEnergyOpeningInAllHands:withPercent(stats.bunnelbyTmEnergyOpen),
      fixedBunnelbyTmEnergyLeadInAllHands:withPercent(stats.bunnelbyTmEnergyActiveCorrected),
      eldegossInAllHands:withPercent(stats.eldegossInInitial),
      eldegossSavedForLaterHappyMatchInAllHands:
        withPercent(stats.eldegossRetainedInsteadOfBaselineSetup),
      eldegossAsOnlySurvivalBackupInAllHands:
        withPercent(stats.eldegossBenchedOnlySurvivalBackup),
      priorFiveBenchInAllHands:withPercent(stats.baselineFiveBench),
      newTatsugiriSupporterSearchLeadInAllHands:
        withPercent(stats.noSupporterAccessTatsugiriLeadImproved)
    },
    limits:'Uniform initial 7 only; no mulligan-redraw conditioning, opponent, prizes, subsequent draws or game wins. Heuristic source setup policy not native Store validated.'
  };
}
module.exports={exactOriginalSourceCards,choose,exactTMEnergyLeadFraction,xorshift32,simulate};
if(require.main===module){
  const n=Number(process.argv[2]||300000);
  process.stdout.write(JSON.stringify(simulate({hands:n}),null,2)+'\n');
}
