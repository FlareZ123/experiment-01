'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {probeSidney,probeTeamSkull}=
  require('../simulation/twinleaf/agent12-sidney-opponent-hand-native.cjs');
const {withPaperOpponentHandDiscards}=
  require('../simulation/twinleaf/agent12-opponent-hand-discard-paper-guard.cjs');

test('source-stamped Sidney and Team Skull optional and mandatory target guards work in both actual native seats',()=>{
  for(const [printing,probe] of [
    ['Sidney FST 241',probeSidney],
    ['Team Skull Grunt SUM',probeTeamSkull]
  ])for(const seat of [0,1])
    for(const mode of ['legal-two','illegal-pokemon-and-basic-energy',
      'mixed-illegal','no-target']){
      const {result,audit}=withPaperOpponentHandDiscards(
        ()=>probe(seat,mode));
      console.log('AGENT12_HAND_TARGET_GUARDED_NATIVE '+JSON.stringify({
        printing,seat,mode,audit,result
      }));
      assert.equal(result.printing,printing);
      assert.equal(audit.inspected,1);
      assert.equal(audit.qualifiedCompetitiveGames,0);
      const paperLegal=mode==='legal-two'||
        (printing==='Sidney FST 241'&&mode==='no-target');
      assert.equal(audit.accepted,paperLegal?1:0);
      assert.equal(audit.vetoed,paperLegal?0:1);
      if(paperLegal){
        assert.equal(result.error,null,JSON.stringify(result));
        assert.equal(result.pending.length,0);
        assert.equal(result.after.opponentHand,mode==='no-target'?6:4);
      }else{
        assert.match(result.error,/PAPER_OPPONENT_HAND_TARGET_INVALID/);
        assert.equal(result.after.opponentHand,6);
        assert.equal(result.after.opponentDiscard,0);
        assert.ok(result.pending.includes('ChooseCardsPrompt'));
      }
    }
});
