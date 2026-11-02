'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {sourceEvidence,sourceDealStatus}=
  require('./agent14-rank9-farewell-native-replay.cjs');

const VERSION='agent14-rank17-original-farewell-v1';
const registrationPath=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent14-rank17-original-source-20261102.json');

/** @returns {object[]} Exact preregistered original source rank17 trials. */
function originalRank17Arms(){
  const registration=JSON.parse(fs.readFileSync(registrationPath,'utf8'));
  assert.equal(registration.schema,'agent14-new-original-source-rank17-v1');
  assert.equal(registration.registeredBeforeNative,true);
  assert.equal(registration.sourceRank,17);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.deepEqual(registration.groups.map(g=>g.candidateSlot),['A','B']);
  assert.deepEqual(registration.groups.map(g=>g.seed),[2494066265,2674729000]);
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const deck=roster.decks.find(d=>d.rank===17);
  assert.equal(deck?.cards.reduce((n,c)=>n+c.count,0),60);
  assert.ok(deck.cards.some(card=>card.name==='Unown'&&
    card.printing?.set==='AOR'&&card.printing?.number==='30'&&card.count===4));
  const rows=registration.groups.flatMap(g=>
    registration.candidateIds.map(candidateId=>({...g,candidateId,
      id:[g.rank,g.repeat,g.candidateSlot,candidateId].join(':')})));
  assert.equal(rows.length,4);
  return rows;
}

/**
 * Run only the two preregistered source rank17 physical deals and frozen
 * unchanged candidate sixties under a symmetric Farewell Letter opt-in.
 * @param {{runner?:Function,pinNative?:boolean}} [options]
 * @returns {object}
 */
function runRank17({runner=null,pinNative=true}={}){
  const arms=originalRank17Arms();
  const run=runner??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  if(pinNative)require('./agent41-frozen-bilateral-development-v1.cjs')
    .assertPinnedNativeStore(path.resolve(__dirname,'../..'),profile);
  const pairs=[];
  for(let index=0;index<arms.length;index+=2){
    const group=arms.slice(index,index+2);
    const outcomes={};
    for(const [mode,enabled] of [['baseline',false],['farewell-enabled',true]]){
      try{
        const result=run({...profile.policyOptions,
          allowAdditionalOriginalSourceRanks:true,
          actorFarewellLetterRoot:enabled,
          registeredTrials:group,
          registeredFrameName:VERSION+'-'+mode});
        assert.equal(result.attempted,2);
        assert.deepEqual(result.rows.map(row=>row.trial.id),
          group.map(row=>row.id));
        outcomes[mode]=result.rows.map(row=>({
          trial:row.trial,evidence:sourceEvidence(row),rawDevelopmentRow:row
        }));
      }catch(error){
        outcomes[mode]=group.map(trial=>({
          trial,rawDevelopmentRow:null,
          evidence:sourceEvidence({trial,status:'source-driver-abort',
            error:String(error?.message??error)}),
          abortedBeforeTwoNativeReturns:true
        }));
      }
    }
    for(let i=0;i<group.length;i++){
      const baseline=outcomes.baseline[i],farewellEnabled=outcomes['farewell-enabled'][i];
      pairs.push({trial:group[i],sameSource:
        sourceDealStatus(baseline.evidence,farewellEnabled.evidence),
        baseline,farewellEnabled});
    }
  }
  return {version:VERSION,sourceRank:17,
    sourceRoster:'results/aichi-2026/full-decklists.json',
    registeredSource:'results/aichi-2026/registrations/agent14-rank17-original-source-20261102.json',
    sourceVendorPin:profile.pinnedVendorRevision,
    plannedNativeArms:8,pairs,
    deliberatePolicyToggle:'symmetric actorFarewellLetterRoot only',
    sampling:'preregistered two independent random physical source seeds',
    competitiveQualifiedGames:0,winRateCertified:false};
}

if(require.main===module){
  const r=process.argv.includes('--inspect-only')?
    {version:VERSION,arms:originalRank17Arms(),
      competitiveQualifiedGames:0}:runRank17();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
}

module.exports={VERSION,originalRank17Arms,runRank17};
