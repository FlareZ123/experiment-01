'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
/**
 * Retrospectively count ordinary source attack snapshots with two DCE-fueled
 * Mew VMAX and identify the first subsequent material source root action.
 * Reads only referee-recorded public boards, never uses hidden zones in play.
 * @param {object} archive Frozen original rank5 v3.1 native archive.
 */
function census(archive){
  assert.equal(archive.schema,'agent13-integrated-rank5-v31-corrected-root-release-v1');
  const rows=archive.modes?.integratedV3?.attempts;
  assert.equal(rows?.length,8);
  return rows.map(item=>{
    const row=item.rawNativeRow,source=row.sourceSeat;
    assert.ok(source===0||source===1);
    const ledger=row.rootActionLedger;
    assert.ok(Array.isArray(ledger));
    const charged=[];
    for(const attack of row.sourceAttackSettlement?.attacks??[]){
      const board=attack.publicBoardBefore?.[source];
      assert.ok(board,'Expected source public-board snapshot');
      const mons=[board.active,...(board.bench??[])].filter(Boolean);
      const chargedMew=mons.filter(mon=>mon.name==='Mew VMAX'&&
        (mon.energyCards??[]).includes('Double Colorless Energy'));
      if(chargedMew.length<2||board.active?.name!=='Mew VMAX')continue;
      const nextMaterial=ledger.find(action=>
        action.actionOrdinal>attack.actionOrdinal&&
        action.playerSlot===source&&
        action.turnBefore>attack.turnBefore&&
        action.action!=='ResolvePromptAction');
      charged.push({attackTurn:attack.turnBefore,
        attackRootOrdinal:attack.actionOrdinal,chargedMewCount:chargedMew.length,
        benchSize:board.bench.length,
        nextOwnTurn:nextMaterial?.turnBefore??null,
        nextOwnAction:nextMaterial?.action??null,
        nextOwnOrdinal:nextMaterial?.actionOrdinal??null,
        sourcePassedNextOwnTurn:nextMaterial?.action==='PassTurnAction'});
    }
    return {trial:item.trial.id,sourceSeat:source,
      nativeEnd:row.endReason,sourceAttackCount:
        row.sourceAttackSettlement?.attacks?.length??0,charged};
  });
}
if(require.main===module){
  const input=process.argv[2];
  assert.ok(input,'Provide original archived JSON path');
  const bytes=fs.readFileSync(input);
  const rows=census(JSON.parse(bytes.toString('utf8')));
  console.log(JSON.stringify({archiveSha256:crypto.createHash('sha256').update(bytes).digest('hex'),
    rows,observedDualChargeTrials:rows.filter(row=>row.charged.length).length,
    passesAfterDualCharge:rows.flatMap(row=>row.charged)
      .filter(x=>x.sourcePassedNextOwnTurn).length,
    competitiveQualifiedGames:0},null,2));
}
module.exports={census};
