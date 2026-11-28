'use strict';
/*
 * Opt-in prompt-projection adapter for the EXACT new-moon v3g Gladion profile.
 * The existing native-v3 runner already accepts a promptProjection dependency
 * in createV3WorkerDecisionResolver(...). Pass the value of this factory in
 * that slot *only* for the research v3g candidate and authorized experiments.
 * No source modification to native Twinleaf or shared runner.
 */
const strict=require('../evaluation/2026-11/agent36-prompt-projection.cjs');
const hook=require('./agent1-gladion-owner-prize-projection.cjs');
const POLICY_VERSION='agent1-newmoon-v3g-gladion-rescue-research-v1';
function forV3gGladion({policyVersion}={}){
 if(policyVersion!==POLICY_VERSION)throw Error('GLADION_PRIZE_PROJECTION_NOT_AUTHORIZED_FOR_POLICY');
 return Object.freeze({...strict,projectPrompt:hook.projectPromptWithGladionOwnerPrize});
}
module.exports={POLICY_VERSION,forV3gGladion};
