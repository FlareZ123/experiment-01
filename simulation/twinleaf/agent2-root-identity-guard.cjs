'use strict';

const assert=require('node:assert/strict');

const VERSION='agent2-actual-store-and-bot-identity-guard-v1';

/**
 * Fail-closed, opt-in root identity boundary for a single synchronous
 * headless match. Native headless invokes onRootStoreCreated with the actual
 * Store, and onRootAgentsCreated with its registered player bot instances.
 * The bot wrapper must compare both references at the root decision.
 *
 * Never inspect either player's hand, deck contents or Prize identities.
 * @returns {{
 *  attach:(request:object)=>object,
 *  isActualRoot:(bot:object,state:object,seat:number)=>boolean,
 *  audit:object
 * }}
 */
function createActualRootIdentityGuard(){
  let store=null,agents=null;
  const audit={version:VERSION,rootStoreRegistrations:0,
    rootAgentRegistrations:0,acceptedChecks:0,rejectedChecks:0};

  function attach(request){
    assert.ok(request&&typeof request==='object');
    const oldStore=request.onRootStoreCreated;
    const oldAgents=request.onRootAgentsCreated;
    if(oldStore!==undefined)assert.equal(typeof oldStore,'function');
    if(oldAgents!==undefined)assert.equal(typeof oldAgents,'function');
    return {
      ...request,
      onRootStoreCreated(rootStore){
        oldStore?.(rootStore);
        assert.ok(rootStore&&typeof rootStore==='object'&&
          rootStore.state&&typeof rootStore.state==='object');
        store=rootStore;
        agents=null;
        audit.rootStoreRegistrations++;
      },
      onRootAgentsCreated(rootAgents){
        oldAgents?.(rootAgents);
        assert.ok(store,'actual root Store must be registered first');
        assert.ok(Array.isArray(rootAgents)&&rootAgents.length===2&&
          rootAgents[0]&&rootAgents[1]&&
          rootAgents[0]!==rootAgents[1],
          'two distinct real player bots required');
        agents=rootAgents.slice();
        audit.rootAgentRegistrations++;
      }
    };
  }

  function isActualRoot(bot,state,seat){
    const valid=store!==null&&agents!==null&&
      (seat===0||seat===1)&&store.state===state&&
      agents[seat]===bot;
    if(valid)audit.acceptedChecks++;
    else audit.rejectedChecks++;
    return valid;
  }

  return {attach,isActualRoot,audit};
}

module.exports={VERSION,createActualRootIdentityGuard};
