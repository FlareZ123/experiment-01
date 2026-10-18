'use strict';

const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {withExpandedActionOptions}=require('./policy-profiles.cjs');
const {installPinnedTacticEvaluationObserver}=
  require('./decision-tactic-evaluation-observer.cjs');
const {SEED}=require('./rank2-turn5-source-fork-observer.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
const names=new Set(['Guzma & Hala CEC','Bellelba & Brycen-Man CEC']);
