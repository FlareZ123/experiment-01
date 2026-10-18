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
