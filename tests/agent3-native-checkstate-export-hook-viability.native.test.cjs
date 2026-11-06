'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {runDevelopment}=require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {runIssue25V8WithTelepathAndDefaultConfirmFalse}=require(
  '../simulation/evaluation/agent32-issue25-v8-telepath-confirm-default-false.cjs');

test('pinned CommonJS native Store invokes dynamically exported checkState',()=>{
  const vendor=path.resolve(__dirname,'../vendor/twinleaf');
  const sha=execFileSync('git',['rev-parse','HEAD'],{
    cwd:vendor,encoding:'utf8'
  }).trim();
  assert.equal(sha,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const checkModule=require(path.join(vendor,
    'ptcg-server/output/game/store/effect-reducers/check-effect'));
  const original=checkModule.checkState;
  assert.equal(typeof original,'function');
  const root={current:null,trialIds:[]};
  const observed={
    calls:0,realRootCalls:0,realByTrial:{},
    nonRootCalls:0,hiddenPrizeFacesRead:false
  };
  checkModule.checkState=function(...args){
    observed.calls++;
    if(args[0]===root.current){
      observed.realRootCalls++;
      const trial=root.trialIds.at(-1);
      observed.realByTrial[trial]=(observed.realByTrial[trial]??0)+1;
    }else observed.nonRootCalls++;
    return original.apply(this,args);
  };
  let run;
  try {
    run=runIssue25V8WithTelepathAndDefaultConfirmFalse({
      v8Deps:{runner:opts=>runDevelopment({
        ...opts,
        onRootStoreCreated:(store,id)=>{
          root.current=store;
          root.trialIds.push(id);
        }
      })}
    });
  } finally {
    checkModule.checkState=original;
  }
  assert.strictEqual(checkModule.checkState,original);
  assert.equal(root.trialIds.length,8);
  assert.ok(observed.realRootCalls>0,
    'Store must call live exported checkState for exact generator-token wrapping');
  const terminal=run.diagnostic.actualAttemptRows.find(row=>
    row.id==='1:212:B:champion-reference');
  assert.equal(terminal.status,'native-terminal-unqualified');
  assert.equal(terminal.acceptedNativeRootCount,110);
  assert.equal(terminal.terminalWinnerMatchesCandidate,true);
  console.log('AGENT3_CHECKSTATE_ORIGIN_HOOK_VIABILITY',JSON.stringify({
    ...observed,registeredNativeStores:root.trialIds.length,
    nativeTerminalRoot:terminal.acceptedNativeRootCount,
    officialPaperGamesQualified:0
  }));
});
