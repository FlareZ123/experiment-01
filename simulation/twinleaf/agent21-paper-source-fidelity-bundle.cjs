'use strict';

/*
 * Source-exact paper Expanded compatibility seam. Opt-in and research-only.
 * Pinned Twinleaf revision a9905a76. NOT part of owner-frozen V3, Stage A,
 * any qualified game data, or any publicly endorsed 60.
 *
 * Four independent reversible card hooks nest over a SINGLE synchronous
 * Store operation. A caller must use this wrapper for EVERY native root and
 * prompt-continuation operation in a multi-action game. It must NOT wrap a
 * Promise spanning multiple asynchronous event-loop turns.
 *
 * See results/methodology/2026-11/agent21-paper-source-fidelity-bundle.md
 * for exact source printings, independent evidence gates, and limitations.
 */

const assert=require('node:assert/strict');
const rank15=require('./agent21-rank15-spiky-hopper-paper-hook.cjs');
const dialga=require('./agent21-regidrago-dialga-shred-paper-hook.cjs');
const kyurem=require('./agent21-kyurem-trifrost-target-prompt-paper-hook.cjs');
const girafarig=require('./agent21-girafarig-get-lost-compulsory-selection-paper-hook.cjs');

const VERSION='agent21-paper-expanded-source-fidelity-bundle-v1';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

const FEATURES=Object.freeze([
  Object.freeze({key:'spikyHopper',appliesTo:'Rank15 Mega Lopunny ex PFL84',
    version:rank15.VERSION,
    tested:'isolated 9/9; native Store smoke unrun'}),
  Object.freeze({key:'dialgaShred',appliesTo:'Regidrago copies Dialga-GX UPR100',
    version:dialga.VERSION,
    tested:'isolated 8/8; native Store smoke unrun'}),
  Object.freeze({key:'kyuremTrifrost',appliesTo:'Regidrago copies Kyurem SFA47',
    version:kyurem.VERSION,
    tested:'isolated 10/10; native Store smoke unrun'}),
  Object.freeze({key:'girafarigGetLost',appliesTo:'Hood SRC Girafarig LOT94',
    version:girafarig.VERSION,
    tested:'isolated 10/10; native Store smoke unrun'})
]);

for(const part of [rank15,dialga,kyurem,girafarig]){
  assert.equal(part.ENGINE_PIN,ENGINE_PIN,
    'Every hook must use the exact same pinned Twinleaf revision');
}
Object.freeze(FEATURES);

/**
 * Wrap exactly one native synchronous root/continuation Store operation.
 *
 * All four patches are installed simultaneously during work(), then
 * unconditionally restored in reverse order, even if work throws. The two
 * prompt-specific hooks retain only instance-level native prompt validators
 * created during the wrapped operation; these remain valid when the Store
 * subsequently resolves its pending prompt.
 *
 * `injected` optionally supplies dependency fakes for isolated tests:
 *   {spikyHopper:{...},dialgaShred:{...},
 *    kyuremTrifrost:{...},girafarigGetLost:{...}}
 * Production use should omit all dependency injection and use the exact
 * pinned compiled vendor output.
 */
function withPaperSourceFidelity(work,injected={}){
  assert.equal(typeof work,'function');
  assert.ok(injected&&typeof injected==='object');
  return rank15.withPaperRank15SpikyHopper(
    ()=>dialga.withPaperRegidragoDialgaShred(
      ()=>kyurem.withPaperKyuremTrifrostTargets(
        ()=>girafarig.withPaperGirafarigGetLost(
          work,injected.girafarigGetLost),
        injected.kyuremTrifrost),
      injected.dialgaShred),
    injected.spikyHopper);
}

module.exports={VERSION,ENGINE_PIN,FEATURES,withPaperSourceFidelity};
