'use strict';

const fs=require('node:fs');
const assert=require('node:assert/strict');

const file=process.env.AGENT6_PATH_ARCHIVE_INPUT||
  'analysis-input/agent6-path-counter-original14.json';
const packet=JSON.parse(fs.readFileSync(file,'utf8'));
assert.equal(packet.schema,
  'agent6-path-underworld-stadium-counter-original14-native-ab-v1');

function slice(runner,arm){
  return runner.rows.map(row=>{
    const root=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
    const trace=row.decisionTrace??[];
    const pathRoot=root.filter(x=>x.action==='PlayCardAction'&&
      JSON.stringify(x).includes('Path to the Peak'));
    const pathAny=root.filter(x=>
      JSON.stringify(x).includes('Path to the Peak'));
    const stadiumRoot=root.filter(x=>x.action==='PlayCardAction'&&
      /Sky Field|Dimension Valley|Path to the Peak/.test(JSON.stringify(x)));
    const PathDecision=trace.filter(x=>
      JSON.stringify(x.publicBoardBefore??x.publicBoardAfter??{})
        .includes('Path to the Peak'));
    const handsWithPath=trace.filter(x=>
      JSON.stringify(x.decisionHandBefore??{})
        .includes('Path to the Peak'));
    const rootAudit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    return {
      id:row.trial.id,rank:row.trial.rank,arm,
      actionCount:root.length,decisionTraceCount:trace.length,
      pathPlayRoots:pathRoot.length,
      pathMentionsInRoots:pathAny.length,
      stadiumPlayRoots:stadiumRoot.length,
      pathVisibleDecisionRoots:PathDecision.length,
      pathHeldDecisionRoots:handsWithPath.length,
      playerRootSelections:rootAudit?.selectedRootDecisions??null,
      sourceCounterSelected:rootAudit?.pathUnderworldStadiumCounterSelected??null,
      pathRootSample:pathRoot.slice(0,2).map(x=>({
        action:x.action,detail:x.detail,
        publicBoardBefore:x.publicBoardBefore,
        keys:Object.keys(x)
      })),
      pathDecisionSample:PathDecision.slice(0,1).map(x=>({
        playerSlot:x.playerSlot,turn:x.turn,
        action:x.action,keys:Object.keys(x),
        publicBoardBefore:x.publicBoardBefore
      }))
    };
  });
}
const a=slice(packet.controlFullNative,'A');
const b=slice(packet.treatmentFullNative,'B');
const pair=a.map((x,i)=>({...x,treatment:b[i]}));
const counts={
  rootLedgerPathsControl:a.reduce((s,x)=>s+x.pathPlayRoots,0),
  rootLedgerPathsTreatment:b.reduce((s,x)=>s+x.pathPlayRoots,0),
  pathVisibleDecisionsControl:a.reduce((s,x)=>s+x.pathVisibleDecisionRoots,0),
  pathVisibleDecisionsTreatment:b.reduce((s,x)=>s+x.pathVisibleDecisionRoots,0),
  pathHeldDecisionsControl:a.reduce((s,x)=>s+x.pathHeldDecisionRoots,0),
  pathHeldDecisionsTreatment:b.reduce((s,x)=>s+x.pathHeldDecisionRoots,0),
  pathCounterSelectionTreatment:b.reduce((s,x)=>
    s+(x.sourceCounterSelected??0),0),
  gamesWithLivePathInDecisionTrace:b.filter(x=>
    x.pathVisibleDecisionRoots>0).length,
  gamesWithPathPlayRoot:b.filter(x=>x.pathPlayRoots>0).length
};
const first=packet.controlFullNative.rows[0];
const shape={
  rowKeys:Object.keys(first),
  firstRootKeys:Object.keys(first.rootActionLedger?.[0]??{}),
  firstRootSample:first.rootActionLedger?.slice(0,2)??null,
  firstTraceKeys:Object.keys(first.decisionTrace?.[0]??{}),
  firstTraceSample:first.decisionTrace?.slice(0,1)??null,
  auditKeys:Object.keys(
    first.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??{})
};
process.stdout.write('AGENT6_ARCHIVED_PATH_CENSUS '+JSON.stringify({
  counts,
  perRank:pair.map(p=>({
    id:p.id,rank:p.rank,
    aPathPlays:p.pathPlayRoots,bPathPlays:p.treatment.pathPlayRoots,
    aPathVisibleRoots:p.pathVisibleDecisionRoots,
    bPathVisibleRoots:p.treatment.pathVisibleDecisionRoots,
    aHeldRoots:p.pathHeldDecisionRoots,
    bHeldRoots:p.treatment.pathHeldDecisionRoots,
    bCounterSelected:p.treatment.sourceCounterSelected
  })),
  sample:shape
})+'\n');
