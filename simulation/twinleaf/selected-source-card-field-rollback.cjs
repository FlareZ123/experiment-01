'use strict';

const path = require('node:path');
const {snapshotLiveCardPrimitives} =
  require('./simulator-general-card-leak-observer.cjs');

/**
 * Snapshot exact own descriptors of selected source Card fields. Descriptors
 * are retained so restoring an originally absent field deletes it instead of
 * creating a new own `undefined` property.
 * @param {object} state
 * @param {Function} Card
 * @param {string[]} fieldNames
 * @returns {Map<object,Map<string,PropertyDescriptor|undefined>>}
 */
function selectedFieldSnapshots(state, Card, fieldNames) {
  const cards = snapshotLiveCardPrimitives(state, Card);
  return new Map([...cards.keys()].map(card => [card,new Map(
    fieldNames.map(field => [field,
      Object.getOwnPropertyDescriptor(card,field)])
  )]));
}

/**
 * Compare own data values and descriptor shape without reading getters.
 * @param {PropertyDescriptor|undefined} a
 * @param {PropertyDescriptor|undefined} b
 * @returns {boolean}
 */
function matchingDescriptor(a,b) {
  if (!a || !b) return a === b;
  if ('value' in a !== ('value' in b)) return false;
  if (a.configurable !== b.configurable ||
      a.enumerable !== b.enumerable) return false;
  if ('value' in a) {
    return Object.is(a.value,b.value) && a.writable === b.writable;
  }
  return a.get === b.get && a.set === b.set;
}

/**
 * Undo only specified post-decision source Card changes, never earlier Store
 * actions. Underlying `decodeNextAction` is still used unchanged.
 *
 * @param {Function} BotClass
 * @param {Function} Card
 * @param {string[]} fieldNames
 * @param {{restoreFields?:boolean}} options
 * @returns {{report:object,restore:()=>void}}
 */
function observeSelectedCardFields(BotClass,Card,fieldNames,
  {restoreFields=false}={}) {
  if (!Array.isArray(fieldNames) || fieldNames.length===0 ||
      new Set(fieldNames).size!==fieldNames.length ||
      fieldNames.some(f=>typeof f!=='string'||!f)) {
    throw new TypeError('Expected distinct nonempty Card field names');
  }
  const proto=BotClass.prototype;
  const previous=Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
  const original=proto.decodeNextAction;
  if(typeof original!=='function')throw new TypeError('Expected bot policy method');

  const report={
    protocol:restoreFields?'source-card-selected-field-rollback-v1':
      'source-card-selected-field-observation-v1',
    selectedFields:[...fieldNames],
    decisions:0,changedDecisions:0,changedProperties:0,
    changesByField:{},firstChangedDecision:null,
    samples:[],decisionActions:[]
  };
  function monitored(state) {
    const before=selectedFieldSnapshots(state,Card,fieldNames);
    let action;
    try {
      action=original.call(this,state);
      return action;
    } finally {
      const index=++report.decisions;
      const actorSeat=state.activePlayer;
      const hand=state.players[actorSeat]?.hand?.cards || [];
      report.decisionActions.push({
        ordinal:index,turn:state.turn,actorSeat,
        action:action?.constructor?.name||'<threw>',
        name:action?.name||null,
        handIndex:Number.isInteger(action?.handIndex)?action.handIndex:null,
        handPrinting:Number.isInteger(action?.handIndex)?
          hand[action.handIndex]?.fullName??null:null
      });
      let changed=false;
      for(const [card,fields] of before) {
        for(const [field,descriptor] of fields) {
          const current=Object.getOwnPropertyDescriptor(card,field);
          if(matchingDescriptor(descriptor,current))continue;
          changed=true;
          report.changedProperties++;
          report.changesByField[field]=(report.changesByField[field]||0)+1;
          if(report.firstChangedDecision===null)report.firstChangedDecision=index;
          if(report.samples.length<24)report.samples.push({
            ordinal:index,turn:state.turn,
            card:card.fullName||card.name||'?',
            field,before:descriptor&&'value' in descriptor?descriptor.value:
              descriptor?'<accessor>':'<absent>',
            after:current&&'value' in current?current.value:
              current?'<accessor>':'<absent>'
          });
          if(restoreFields) {
            if(descriptor) Object.defineProperty(card,field,descriptor);
            else delete card[field];
          }
        }
      }
      if(changed)report.changedDecisions++;
    }
  }
  Object.defineProperty(proto,'decodeNextAction',{
    value:monitored,configurable:true,writable:true
  });
  return {
    report,
    restore() {
      if(proto.decodeNextAction!==monitored) {
        throw new Error('Selected-field observer lost ownership');
      }
      if(previous)Object.defineProperty(proto,'decodeNextAction',previous);
      else delete proto.decodeNextAction;
    }
  };
}

/** @param {string[]} fields @param {{restoreFields?:boolean}} options */
function installSelectedCardFieldRollback(fields,options={}) {
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const {Card}=require(path.join(output,'game/store/card/card'));
  return observeSelectedCardFields(SimpleTacticsAi,Card,fields,options);
}
module.exports={
  selectedFieldSnapshots,matchingDescriptor,
  observeSelectedCardFields,installSelectedCardFieldRollback
};
