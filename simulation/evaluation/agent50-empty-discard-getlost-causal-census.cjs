'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const SCHEMA='agent50-original-native-zero-target-getlost-root-adjacency-v1';

/**
 * Reconstruct typed actual-Store action-cause adjacency. A prompt's ordinal
 * is the ensuing ResolvePromptAction, and its prior physical Store action is
 * the card's AttackAction. The opponent's discard pile is public information.
 *
 * @param {object[]} rows Archived original native Scout rows, including caps.
 * @returns {object} Read-only provenance of empty-discard Get Lost attacks.
 */
function audit(rows){
  assert.ok(Array.isArray(rows)&&rows.length>0);
  let empty=0,nonEmpty=0,selected=0;
  const affected=[];
  for(const row of rows){
    const native=row.nativePromptChoices?.events??[];
    const roots=row.rootActionLedger??[];
    const source=row.sourceSeat,candidate=row.candidateSeat;
    assert.ok((source===0||source===1)&&candidate===1-source);
    let count=0,zero=0;
    for(const e of native){
      if(e.kind!=='ChooseCardsPrompt'||e.turn<=0||
        e.actorSeat!==candidate||e.sourcePlayerSlot!==source||
        e.sourceZone!=='discard')continue;
      assert.ok(Number.isSafeInteger(e.ordinal)&&e.ordinal>=1);
      const prior=roots[e.ordinal-1];
      assert.equal(prior?.action,'AttackAction',
        'Opponent-discard prompt must immediately follow attacking root');
      assert.equal(prior?.playerSlot,candidate,
        'Prompt must follow same owner attack');
      assert.equal(prior?.attack,'Get Lost',
        'This original-frame opponent-discard prompt has a new cause');
      count++;
      if(e.sourceZoneCardCountBefore===0){
        zero++;
        assert.ok(e.selectedCards===null||
          (Array.isArray(e.selectedCards)&&e.selectedCards.length===0),
          'Zero-card native prompt selected a card');
        empty++;
      }else{
        assert.ok(Number.isSafeInteger(e.sourceZoneCardCountBefore)&&
          e.sourceZoneCardCountBefore>0);
        nonEmpty++;
      }
      if(Array.isArray(e.selectedCards)&&e.selectedCards.length>0)
        selected++;
    }
    const declared=roots.filter(root=>root.playerSlot===candidate&&
      root.action==='AttackAction'&&root.attack==='Get Lost').length;
    assert.equal(count,declared,
      'This original scout must expose every Get Lost native selection');
    if(count>0)affected.push({trialId:row.trial.id,rank:row.trial.rank,
      candidateId:row.trial.candidateId,sourceSeat:source,
      candidateSeat:candidate,attackDeclarations:declared,
      opponentDiscardChoosePrompts:count,zeroTargets:zero,
      engineFinished:row.finished===true,
      actionCap:row.finished!==true&&row.status===undefined});
  }
  return {schema:SCHEMA,originalArms:rows.length,
    affectedArms:affected.length,allGetLost:empty+nonEmpty,
    emptyOpponentDiscardPrompts:empty,nonemptyOpponentDiscardPrompts:nonEmpty,
    opponentDiscardPromptsSelectingCards:selected,affected,
    competitiveQualifiedGames:0,
    caution:'Exact native root-prompt adjacency and empty public target only; policy effects and win rates not evaluated.'};
}
if(require.main===module){
  assert.ok(process.argv[2],'Supply original archived 32-arm full JSON path');
  const body=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  assert.equal(body.schema,'agent41-preregistered-32-arm-canonical-scout-v1');
  const result=audit(body.developmentResult.rows);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={SCHEMA,audit};
