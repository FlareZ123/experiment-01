'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const {executeArm,scheduledArms,assertManifest}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {planAichi}=require('./aichi-pilot.cjs');

/** @param {string} name @returns {any} */
const engine=name=>require(path.join(root,
  'vendor/twinleaf/ptcg-server/output',name));

/**
 * One historical deal and one owner-visible response to a printed attack lock.
 * Used as an adversarial policy regression only. Source and candidate decks,
 * game RNG, policy RNG and original independent-deal registration stay fixed.
 * @returns {object}
 */
function run() {
  assertManifest();
  const trial=scheduledArms().find(x=>x.id==='6:2:A:champion-reference');
  assert.ok(trial);
  assert.equal(trial.seed,2394734225);
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {PassTurnAction}=engine('game/store/actions/game-actions');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const inventory=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=inventory.decks.find(x=>x.rank===1);
  assert.ok(champion);
  const prepared=new Map([['champion-reference',{
    plan:planAichi({label:'champion-reference',cards:champion.cards},{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })
  }]]);
  const choices=[];
  let supporterSelected=false,blockedFollowupDeclined=false;
  const installedReply=function stateLimitedReply(state) {
    const proposed=original.call(this,state);
    const owner=state.players[1];
    if(this.client?.id!==owner.id || state.activePlayer!==1 ||
        state.turn!==3 || state.prompts.some(x=>x.result===undefined) ||
        proposed?.constructor.name!=='PlayCardAction') return proposed;
    const card=owner.hand.cards[proposed.handIndex];
    const publicAttack=state.logs.filter(x=>
      x.message==='LOG_PLAYER_USES_ATTACK').at(-1);
    if(publicAttack?.params?.name!=='research-A' ||
       publicAttack.params.attack!=='Shadow Mist' ||
       !['Thunder Mountain Prism Star','Double Colorless Energy']
         .includes(card?.name)) return proposed;
    if(!supporterSelected &&
       owner.supporterTurn!==state.turn &&
       owner.hand.cards.some(x=>x.name==="Lillie's Determination")) {
      const index=owner.hand.cards.findIndex(
        x=>x.name==="Lillie's Determination");
      supporterSelected=true;
      choices.push({turn:state.turn,sourceSeat:1,ordinary:card.name,
        replacement:"Lillie's Determination",
        ownerHandBefore:owner.hand.cards.map(x=>x.fullName),
        priorPublicAttack:publicAttack.params.attack});
      return new PlayCardAction(owner.id,index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
    }
    blockedFollowupDeclined=true;
    choices.push({turn:state.turn,sourceSeat:1,ordinary:card.name,
      replacement:'PassTurnAction',priorPublicAttack:publicAttack.params.attack});
    return new PassTurnAction(owner.id);
  };
  SimpleTacticsAi.prototype.decodeNextAction=installedReply;
  let result=null,error=null;
  try {
    result=executeArm(trial,prepared,{captureRejectedActionEvidence:true});
  } catch(thrown) {
    error=String(thrown?.stack||thrown);
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,installedReply);
    // The rank-6 wrapper restores its own temporary patch. The original
    // prototype owner must be retained after the one-deal branch.
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
  assert.equal(supporterSelected,true,
    'Owner-visible Shadow Mist legal alternate must occur at the same root');
  return {
    schema:'rank6-shadow-mist-one-source-supporter-counterfactual-v1',
    frozenTrialId:trial.id,seed:trial.seed,
    archivedSourceRun:39193837824,
    historicalSelectedFailure:true,
    candidateId:trial.candidateId,sourceRank:trial.rank,
    sourceSupporterReplacementSelected:supporterSelected,
    blockedFollowupDeclined,
    decisions:choices,error,result,
    competitiveQualifiedGames:0,
    caveat:'Single historical seed, one source legal-decision test, no performance inference. Owner-visible public Shadow Mist and held supporter trigger, no future deck information.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
