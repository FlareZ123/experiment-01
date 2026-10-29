'use strict';

const {runScout}=require('./agent41-prospective-canonical-scout.cjs');
const {withNativeLillieDrawSettlementAudit}=
  require('../twinleaf/agent24-native-lillie-settlement-audit.cjs');

/**
 * Reuse the immutable exact original 32-arm registration with the shared
 * two-seat, owner-observation-only root Lillie opt-in enabled by CI env.
 * Agent24's read-only native Store audit independently authenticates the
 * printed Lillie shuffle/draw after all target prompts are resolved.
 *
 * This is a noncompetitive historical same-seed mechanism study.
 * @returns {object} All 32 source-dealt attempts plus effect settlement.
 */
function run(){
  const {result,audit}=withNativeLillieDrawSettlementAudit(runScout);
  return {...result,agent25NativeLillieDrawSettlement:audit};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={run};
