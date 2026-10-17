'use strict';
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
let installed=null;

/**
 * Require 1-3 Battle Compressor selections, per Japanese official FAQ 9672.
 * Research-owned correction for the pinned min:0 selection prompt.
 * @returns {() => void} Uninstall correction.
 */
function installBattleCompressorMinimumHook(){
  if(installed)return installed.restore;
  const {BattleCompressor}=require(path.join(output,
    'sets/07-x-and-y/set-phantom-forces/battle-compressor'));
  const {ChooseCardsPrompt}=require(path.join(output,
    'game/store/prompts/choose-cards-prompt'));
  const {GameMessage,GameError}=require(path.join(output,'game'));
