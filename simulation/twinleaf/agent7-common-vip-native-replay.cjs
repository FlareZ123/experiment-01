'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {withMailScout}=require('./rank26-mail-recovery.cjs');
const {runWithResearchProfile,RANK26_PROPAGATION_PROFILE}=
  require('./policy-profiles.cjs');
const {withCommonVipPassBridge}=
  require('./agent7-common-vip-pass-bridge.cjs');
const {SEEDS}=require('./rank26-vip-after-pass-source-pair.cjs');

const PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const hash=value=>crypto.createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Authentic pinned Store match on one previously published source-held-VIP
 * opening. Historical diagnostic only, never a prospective win trial.
 * @param {object} item A published frozen source deal.
 * @param {string[]} source Full exact rank26 source list.
 * @param {string[]} enemy Full exact rank6 opponent list.
 * @param {boolean} enabled Whether to install the generic shared bridge.
 * @returns {object}
 */
function play(item,source,enemy,enabled) {
  const seat=item.seatLetter==='A'?0:1;
  const request={deckA:seat===0?source:enemy,deckB:seat===1?source:enemy,
    rank26SourceSeat:seat,seed:item.seed,maxActions:120,
    strictPromptValidation:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,forestSealSearchCorrection:true,
    leleEntryAbilityLockCorrection:true,entryDrawLockCorrection:true,
    label:'agent7-common-vip-'+item.seed+':'+enabled};
  const exec=()=>withMailScout(seat,
    ()=>runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE),
    {starterAgnostic:true});
  const result=enabled?withCommonVipPassBridge(seat,exec):
    {result:exec(),audit:null};
  const game=result.result.result;
  assert.equal(game.engine,PIN);
  assert.equal(game.seed,item.seed);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.firstTurnSlot,seat);
  assert.equal(game.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
  const ownerRoots=game.decisionTrace.filter(e=>
    e.playerSlot===seat && e.turnBefore===1);
  const plays=ownerRoots.filter(e=>
    e.action==='PlayCardAction'&&e.card==='Battle VIP Pass');
  const firstPass=ownerRoots.find(e=>e.action==='PassTurnAction');
  return {
    seat,sourceActuallyFirst:game.firstTurnSlot===seat,
    candidateChoiceAudit:result.audit,
    originalSourcePolicy:result.result.policyAudit,
    nativeVipPlayCount:plays.length,
    nativeVipRoots:plays.map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,card:row.card,
      selected:row.cardSelection?.selectedCards??null
    })),
    originalPassPresent:Boolean(firstPass),
    firstTurnRoots:ownerRoots.map(row=>({
      ordinal:row.actionOrdinal,action:row.action,
      card:row.card??null,selected:row.cardSelection?.selectedCards??null
    })),
    firstTurnLedgerHash:hash(game.rootActionLedger.filter(row=>
      row.turnBefore===1)),
    firstTurnActionCount:ownerRoots.length,
    observedFinalPrizes:game.prizesRemaining,
    gameFinished:game.finished,
    competitiveGameQualified:false
  };
}

/** @returns {object} Frozen 2-seat firstturn held-VIP root comparison. */
function run() {
  const plan=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const source=plan.candidate.cards;
  const opponent=plan.opponents.find(item=>item.rank===6);
  assert.equal(source.length,60);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const cases=[];
  for(const entry of SEEDS.slice(0,2)) {
    const control=play(entry,source,opponent.cards,false);
    const variant=play(entry,source,opponent.cards,true);
    const restored=play(entry,source,opponent.cards,false);
    assert.equal(control.nativeVipPlayCount,0,
      'Published source baseline VIP omission was not reproduced');
    assert.equal(control.firstTurnLedgerHash,restored.firstTurnLedgerHash,
      'Reversible adapter changed subsequent original-source first turn');
    const offered=variant.candidateChoiceAudit.events.find(event=>
      event.kind==='first-turn-pass-vip-offer');
    assert.equal(offered?.nativeValid,true,
      'No native-valid VIP after baseline source Pass');
    assert.ok(variant.nativeVipPlayCount>=1,
      'Native Store did not accept offered VIP root');
    assert.ok(variant.candidateChoiceAudit.events.some(event=>
      event.kind==='native-owner-vip-search'&&event.validated===true),
    'No validated physical owner-deck search resulted');
    cases.push({seed:entry.seed,seatLetter:entry.seatLetter,
      sourceActuallyFirst:control.sourceActuallyFirst,
      control,variant,restoredFirstTurnHash:restored.firstTurnLedgerHash,
      competitiveGameQualified:false});
  }
  return {schema:'agent7-common-vip-two-seat-native-diagnostic-v1',
    source:'rank26-vip-after-pass-source-pair.cjs registered deals 63A and 63B',
    sourceRank:26,opponentRank:6,engine:PIN,
    sourceCards:source.length,opponentCards:opponent.cards.length,
    policy:'common-firstturn-vip-pass-v1 plus frozen rank26 mail/profile',
    retrospective:true,competitiveQualifiedGames:0,
    cases,summary:{bothPhysicalSeats:cases.map(item=>item.seatLetter),
      controlsPlayingVip:cases.reduce((v,c)=>v+c.control.nativeVipPlayCount,0),
      variantsPlayingVip:cases.reduce((v,c)=>v+c.variant.nativeVipPlayCount,0),
      nativeSearchValidated:cases.every(c=>c.variant.candidateChoiceAudit.events
        .some(e=>e.kind==='native-owner-vip-search'))}};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={play,run};
