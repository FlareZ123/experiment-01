'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const frame=require('../../results/aichi-2026/registrations/agent32-rank11-six-k0-star-vip-native-20261030.json');
const {sha256,verifyFrame}=require('./agent32-rank11-six-star-vip-k1-native.cjs');

const VERSION='agent1-rank11-six-unaltered-bot-source-reply-v1';

/** Public source-board state visible to both players, without hidden deck or Prize identities.
 * @param {object} source Real native source Player.
 * @param {number} turn Actual global turn number.
 * @returns {object}
 */
function sourceBoard(source,turn){
  const equipped=source.bench.filter(slot=>
    slot.getPokemonCard()?.name==='Garbodor'&&
    slot.tools.some(c=>c.name==='Float Stone'));
  return {turn,active:source.active.getPokemonCard()?.fullName??null,
    equippedGarbodorCount:equipped.length,
    usedVSTAR:source.usedVSTAR===true,
    remainingPrizes:source.prizes.reduce((n,p)=>n+p.cards.length,0)};
}

/**
 * Six authentic original rank11 K0 physical deals, fixed before any search.
 * No scripted source actions or opponent policy modifications. Bound each
 * trial to the next actual source decision after a real opponent turn.
 * @returns {object}
 */
function run(){
  verifyFrame();
  const {resolvedPrintedDecks}=
    require('../evaluation/rank11-conditional-k0-screen-run.cjs');
  const decks=resolvedPrintedDecks();
  assert.equal(decks.engineRevision,frame.engineRevision);
  const {runMatch}=require('./headless.cjs');
  const {actorObservation}=require('./actor-observation-contract.cjs');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const {GamePhase}=require(path.join(output,'game/store/state/state'));
  const rows=[];
  for(const selected of frame.selectedExactK0){
    const original=SimpleTacticsAi.prototype.decodeNextAction;
    const STOP=Symbol('bounded-original-source-opponent-reply');
    const row={index:selected.index,seed:selected.seed,
      status:'not-yet-observed',originalK0Replayed:false,
      opponentFirstRoot:false,sourceReturnRoot:false,
      opponentRootProposals:[]};
    function hooked(state){
      const actor=state.players.find(p=>p.id===this.client?.id);
      const source=state.players[0],opp=state.players[1];
      const pending=state.prompts.find(p=>p.result===undefined);
      if(state.phase===GamePhase.PLAYER_TURN&&!pending){
        if(actor===source&&state.activePlayer===0&&
            state.turn===1&&!row.originalK0Replayed){
          const view=actorObservation(state,0);
          assert.equal(sha256(view.ownHand),
            selected.sourceFirstOwnerHandSha256,
            'Native unmodified source K0 hand differs from frozen source');
          assert.deepEqual(view.ownPublic.bench.map(s=>s?.printing??null),
            selected.sourceBenchAtK0,
            'Native unmodified source Bench differs from frozen source');
          assert.equal(view.ownPublic.active?.name,'Oranguru V');
          row.originalK0Replayed=true;
        }
        if(actor===opp&&state.activePlayer===1&&
            state.turn>=2&&!row.opponentFirstRoot){
          row.opponentFirstRoot=true;
          row.atOpponentFirstRoot=sourceBoard(source,state.turn);
        }
        if(actor===source&&state.activePlayer===0&&
            state.turn>=3&&row.opponentFirstRoot){
          row.sourceReturnRoot=true;
          row.afterOpponentPublic=sourceBoard(source,state.turn);
          row.status='native-unmodified-opponent-turn-returned-source-root';
          throw STOP;
        }
      }
      const action=original.call(this,state);
      if(actor===opp&&!pending&&state.activePlayer===1&&
          state.turn>=2&&row.opponentRootProposals.length<80){
        row.opponentRootProposals.push({turn:state.turn,
          kind:action?.constructor?.name??null,
          caveat:'Proposed action; native acceptance needs separate Store witness'});
      }
      return action;
    }
    SimpleTacticsAi.prototype.decodeNextAction=hooked;
    try{
      try{
        const game=runMatch({...decks,seed:selected.seed,
          label:'rank11-conditional-K0-screen-v1:'+selected.index,
          maxActions:200,strictPromptValidation:true,
          forestSealSearchCorrection:true,
          battleCompressorPositiveSelectionCorrection:true,
          isolatePolicyRandomness:true});
        if(row.status==='not-yet-observed'){
          row.status=game.finished===true?'engine-terminal-before-source-return':
            'censored-before-source-return';
          row.finished=game.finished===true;
          row.winner=game.finished===true?game.winner:null;
        }
      }catch(error){
        if(error!==STOP){
          row.status='blocked-native-exception';
          row.error=String(error?.stack??error).slice(0,1600);
        }
      }
    }finally{
      assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,hooked);
      SimpleTacticsAi.prototype.decodeNextAction=original;
    }
    row.qualifiedCompetitiveGame=false;
    rows.push(row);
  }
  return {version:VERSION,frameSha256:frame.frameSha256,
    originalRank11SourceSeat:0,originalRank1CandidateSeat:1,
    engineRevision:frame.engineRevision,scheduled:6,
    attempted:rows.length,
    originalK0Replayed:rows.filter(r=>r.originalK0Replayed).length,
    opponentFirstRoots:rows.filter(r=>r.opponentFirstRoot).length,
    sourceReturnRoots:rows.filter(r=>r.sourceReturnRoot).length,
    blocked:rows.filter(r=>r.status==='blocked-native-exception').length,
    rows,competitiveQualifiedGames:0,
    limitations:'Unmodified pinned simple bots; original retrospectively K0-selected six physical seeds; owner hand visible only to owner first-root verifier. Not game wins, competitive source policy, or paper-equivalence certification.'};
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.blocked>0)process.exitCode=1;
}
module.exports={VERSION,sourceBoard,run};
