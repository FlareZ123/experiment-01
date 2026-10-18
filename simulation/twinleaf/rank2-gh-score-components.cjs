'use strict';

const path=require('node:path');
const {sourceGame}=require('./rank2-gh-root-score-probe.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));
const PARTS=[
  ['hand','hand-score','HandScore'],
  ['opponent','opponent-score','OpponentScore'],
  ['player','player-score','PlayerScore'],
  ['conditions','special-conditions-score','SpecialConditionsScore'],
  ['active','active-score','ActiveScore'],
  ['bench','bench-score','BenchScore'],
  ['energy','energy-score','EnergyScore'],
  ['damage','damage-score','DamageScore'],
  ['tools','tools-score','ToolsScore']
];

/**
 * Read the existing scorer calls for the actual rank-2 root Supporter decision.
 * @template T
 * @param {()=>T} play
 * @param {number} [targetOrdinal]
 */
function observeGhScoreComponents(play,targetOrdinal=59) {
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {SimpleTactic}=engine('simple-bot/simple-tactics/simple-tactics');
  const {StateScore}=engine('simple-bot/state-score/state-score');
  const restore=[];
  const components=[];
  let ordinal=0,focus=false,candidate=null,frame=null;
