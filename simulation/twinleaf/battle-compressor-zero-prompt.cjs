'use strict';
const path = require('node:path');
const assert = require('node:assert/strict');
const {initializeCards}=require('./headless.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const get=part=>require(path.join(root,part));
function probe() {
  const cards=initializeCards();
  const {Store}=get('game/store/store');
  const {Player}=get('game/store/state/player');
  const {CardList}=get('game/store/state/card-list');
  const {GamePhase}=get('game/store/state/state');
  const {Format}=get('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=get('game/store/actions/play-card-action');
