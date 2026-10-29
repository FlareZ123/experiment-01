'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runWithResearchProfile,EXPANDED_SOURCE_PROFILE}=
  require('./policy-profiles.cjs');
const {withActorOnlyRootPolicy}=
  require('./agent34-actor-only-root-policy.cjs');

const SEEDS=Object.freeze(Array.from({length:12},
  (_,i)=>2026102921+i));
const MAX_ACTIONS=120;
assert.ok(SEEDS.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=0xffffffff),
  'Pinned engine accepts unsigned 32-bit random seeds');

/**
 * Original rank1 versus original rank22 both contain physical VS Seeker
 * and Lillie's Determination, but neither is assumed reachable from
 * its own public discard under a weak actor policy.
 * @param {{deckA:string[],deckB:string[],seed:number}} setting
 * @param {boolean} enable
 * @returns {object}
 */
function arm(setting,enable){
  let game=null,audit=null,error=null;
  try{
    const result=withActorOnlyRootPolicy(()=>runWithResearchProfile({
      deckA:setting.deckA,deckB:setting.deckB,
      seed:setting.seed,maxActions:MAX_ACTIONS,
      strictPromptValidation:true,grandTreeFirstTurnCorrection:true,
      captureDecisionTrace:true,
      label:'Unqualified source actor-only lowhand VS Seeker Lillie chain'
    },EXPANDED_SOURCE_PROFILE),{
      seekerLillieRoot:enable
    });
    game=result.result;
    audit=result.audit;
  }catch(failure){
    error={name:failure?.name??null,
      message:String(failure?.message??failure)};
  }
  return {
    optIn:enable,error,
    actorAudit:audit===null?null:{
      version:audit.version,
      proposals:audit.selectedRootDecisions,
      accepted:audit.acceptedActorRoots,
      rejected:audit.rejectedActorRoots,
      seekerRootCount:audit.typedIntentCounts?.['play-seeker-get-lillie']??0,
      recoveredLillieRootCount:
        audit.typedIntentCounts?.['play-seeker-recovered-lillie']??0,
      itemNativeConfirmed:
        audit.nativePhysicalConfirmedByIntent?.['play-seeker-get-lillie']??0,
      supporterNativeConfirmed:
        audit.nativePhysicalConfirmedByIntent?.['play-seeker-recovered-lillie']??0,
      seekerPromptsProposed:audit.seekerLilliePromptsProposed??0,
      seekerPromptsAccepted:audit.seekerLilliePromptsAccepted??0,
      unsupportedPromptFallbacks:audit.unsupportedPromptFallbacks,
      nonLiveSpeculativeFallbacks:audit.nonLiveSpeculativeFallbacks
    },
    game:game===null?null:{
      firstTurnSlot:game.firstTurnSlot,
      deckHashes:game.deckHashes,
      verifiedByDrawLog:game.verifiedByDrawLog,
      actions:game.actions,
      finished:game.finished
    }
  };
}

function runAudit(){
  const corpus=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const a=corpus.decks.find(x=>x.rank===1);
  const b=corpus.decks.find(x=>x.rank===22);
  assert.ok(a?.playableUnderEngine&&b?.playableUnderEngine);
  assert.equal(a.cardIds.length,60);
  assert.equal(b.cardIds.length,60);
  const trials=[];
  for(const seed of SEEDS){
    const setting={deckA:a.cardIds,deckB:b.cardIds,seed};
    const baseline=arm(setting,false);
    const optIn=arm(setting,true);
    if(baseline.game&&optIn.game){
      assert.deepEqual(baseline.game.deckHashes,optIn.game.deckHashes);
      assert.equal(baseline.game.firstTurnSlot,optIn.game.firstTurnSlot);
      assert.equal(baseline.game.verifiedByDrawLog,true);
      assert.equal(optIn.game.verifiedByDrawLog,true);
    }
    trials.push({seed,baseline,optIn});
  }
  const sum=field=>trials.reduce((n,t)=>
    n+(t.optIn.actorAudit?.[field]??0),0);
  return {
    schema:'agent48-source-12seed-owner-seeker-lillie-actor-census-v1',
    originalRanks:[1,22],seeds:[...SEEDS],maxActions:MAX_ACTIONS,
    pairs:trials.length,
    seekerProposed:sum('seekerRootCount'),
    seekerNativeConfirmed:sum('itemNativeConfirmed'),
    seekerPromptsAccepted:sum('seekerPromptsAccepted'),
    recoveredLillieNativeConfirmed:sum('supporterNativeConfirmed'),
    rejectedActorRoots:sum('rejected'),
    failedArms:trials.reduce((n,t)=>n+
      Number(Boolean(t.baseline.error))+
      Number(Boolean(t.optIn.error)),0),
    competitiveGameQualified:false,
    trials,
    limitation:'Only 12 predeclared original-source native deals, bounded 120 roots each, simple autonomous baseline cannot generally discard Lillie. A zero Seeker proposal is an exposure failure under this exact policy, not proof the card is weak.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');
module.exports={SEEDS,MAX_ACTIONS,arm,runAudit};
