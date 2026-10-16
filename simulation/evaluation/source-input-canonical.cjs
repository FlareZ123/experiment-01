'use strict';
const {actionTraceSha256}=require('./canonical-action-trace.cjs');

/**
 * Hash typed or identity-resolved source action inputs and both-players'
 * ordered zone/card-history digests at each live Store dispatch.
 * @param {object[]} events
 */
function sourceInputTraceSha256(events) {
  if(!Array.isArray(events)||events.length===0) {
    throw new TypeError('Empty source trace');
  }
  const rows=events.map((event,index)=>{
    if(!event||event.step!==index||typeof event.action!=='string') {
      throw new TypeError('Invalid source step');
    }
    const payload=event.typedAction||event.promptReplayAction;
    if(!payload) throw new TypeError('Nonportable source action at step '+index);
    const keys=['zoneDigestBefore','zoneDigestAfter',
      'continuityDigestBefore','continuityDigestAfter'];
    for(const key of keys) {
      if(typeof event[key]!=='string'|| !/^[0-9a-f]{64}$/.test(event[key])) {
        throw new TypeError('Missing source digest '+key+' at '+index);
      }
    }
    return {
      step:index,action:event.action,pendingPrompt:event.pendingPrompt||null,
      transport:event.typedAction?'typed':'prompt-reference',payload,
      zoneDigestBefore:event.zoneDigestBefore,
      zoneDigestAfter:event.zoneDigestAfter,
      continuityDigestBefore:event.continuityDigestBefore,
      continuityDigestAfter:event.continuityDigestAfter
    };
  });
  return actionTraceSha256(rows);
}
module.exports={sourceInputTraceSha256};
