'use strict';

const assert=require('node:assert/strict');
const {installDeclaredCopyHistoryHook}=
  require('../copycat-declared-history-hook.cjs');
const {installMimikyuNonGxCopycatHook}=
  require('../copycat-compat.cjs');

const VERSION='agent6-scoped-mimikyu-apex-paper-compatibility-v1';

/**
 * Keep the old engine source untouched while enabling its already validated
 * exact-print Mimikyu GRI Copycat -> Regidrago VSTAR Apex Dragon exception
 * and source declaration retention. Installed strictly inside an explicit
 * Aichi owner-policy experiment. Both patch restorers run even after errors.
 *
 * @template T
 * @param {()=>T} execute The synchronous headless experiment.
 * @returns {T} The untouched experiment result.
 */
function withMimikyuApexPaperCompatibility(execute){
  assert.equal(typeof execute,'function');
  const restoreHistory=installDeclaredCopyHistoryHook({
    mimikyu:true,regidrago:true
  });
  let restoreCopycat=null;
  try{
    restoreCopycat=installMimikyuNonGxCopycatHook();
    return execute();
  }finally{
    if(restoreCopycat)restoreCopycat();
    restoreHistory();
  }
}

module.exports={VERSION,withMimikyuApexPaperCompatibility};
