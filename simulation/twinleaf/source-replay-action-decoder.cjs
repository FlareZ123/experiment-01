'use strict';
const {restoreAction}=require('./source-action-value-codec.cjs');
const {restorePromptAction}=require('./source-prompt-action-codec.cjs');

const ACTION_CLASSES=Object.freeze({
  AddPlayerAction:'game/store/actions/add-player-action',
  ResolvePromptAction:'game/store/actions/resolve-prompt-action',
  PlayCardAction:'game/store/actions/play-card-action',
  AttackAction:'game/store/actions/game-actions',
  UseAbilityAction:'game/store/actions/game-actions',
  UseTrainerAbilityAction:'game/store/actions/game-actions',
  UseEnergyAbilityAction:'game/store/actions/game-actions',
  UseStadiumAction:'game/store/actions/game-actions',
  RetreatAction:'game/store/actions/game-actions',
  RetreatStartAction:'game/store/actions/game-actions',
  PassTurnAction:'game/store/actions/game-actions'
});

/**
 * Build a fixed, audited action-constructor whitelist. No arbitrary
 * constructors may enter source-action replay.
 * @param {(relativePath:string)=>object} engine Pinned compiled module loader
 */
function approvedActionClasses(engine) {
  const classes=Object.create(null);
  for(const [name,filepath] of Object.entries(ACTION_CLASSES)) {
    const klass=engine(filepath)[name];
    if(typeof klass!=='function' || klass.name!==name) {
      throw new TypeError('Pinned action class is absent or renamed: '+name);
    }
    classes[name]=klass;
  }
  return classes;
}

/**
 * Recover a single recorded Store action from a new live Store's prompt. The
 * original input archive must contain either an exact object/value envelope
 * or an identity checked prompt reference. The first missing input fails.
 * This is *input decoding only*, not source-game replay qualification.
 * @param {object} event Archived source dispatch event
 * @param {object|null} pending Current Store unresolved prompt
 * @param {object} state Current Store state
 * @param {Record<string,function>} classes Reviewed constructor registry
 */
function decodeRecordedAction(event,pending,state,classes) {
  if(!event || typeof event.action!=='string' ||
      !Number.isSafeInteger(event.step)) throw new TypeError('Invalid source event');
  const reference=event.pendingPrompt;
  if(reference) {
    if(!pending || reference.kind!==pending.constructor.name ||
        reference.id!==(pending.id??null) ||
        reference.playerId!==(pending.playerId??null)) {
      throw new Error('Replay pending prompt identity differs at step '+event.step);
    }
  } else if(pending) {
    throw new Error('Replay has unexpected pending prompt at step '+event.step);
  }
  let action;
  if(event.typedAction) {
    action=restoreAction(event.typedAction,classes);
  } else if(event.promptReplayAction) {
    action=restorePromptAction(pending,state,event.promptReplayAction,
      classes.ResolvePromptAction);
  } else {
    throw new Error('Nonportable source action input at step '+event.step+
      ': '+event.action+' ('+(event.typedActionError||event.promptReplayUnsupported||'unknown')+')');
  }
  if(action.constructor.name!==event.action) {
    throw new Error('Decoded source action type mismatch at step '+event.step);
  }
  return action;
}

module.exports={ACTION_CLASSES,approvedActionClasses,decodeRecordedAction};
