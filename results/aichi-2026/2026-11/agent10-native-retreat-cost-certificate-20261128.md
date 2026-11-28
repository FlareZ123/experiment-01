# Agent10: Native effective-retreat-cost certificate closes the actor Skyliner knowledge gap (28 Nov 2026)

**One existing review-only successor branch:** `agent10/candidate-supporter-continuation-20261128`; original Hood Shield fixed 60 unchanged. This is a proposed source/host integration **after** frozen PR #104's independent no-game gate; no native CI, runtime Store execution, games, main worker change, PR104 modification or inferred win rate.

## Root cause and non-speculative solution

The candidate worker's prior `freeRetreatKnown()` required both a Basic Stage and an explicitly unsuppressed printed Skyliner Ability (or Float Stone). The actual main and PR #94 native actor observer initializes `abilitySuppressions[*].suppressed=null` and PR #94 does not infer an unsuppressed fact. Thus even after correcting the numeric `Stage.BASIC=2` mismatch, the worker remains unable to choose an otherwise legal **Skyliner-funded zero-Energy retreat**. Inferring Skyliner from printed presence is unsafe under Path, Klefki, Iron Thorns, Garbotoxin, Silent Lab, etc.

The **strict action frontier schema already allows** `retreatEnergyCost` and `freeRetreat` as bounded public metadata, and native `CheckRetreatCostEffect` has precisely the dynamic, lock-aware pre-action cost computation. Rather than expand the actor observation schema or guess at suppression, the host can calculate **the actual native effective retreat cost on a detached state** and bind that fact to an already native-accepted `RetreatAction` token. The worker still cannot invent RetreatActions; a native legal offer is mandatory.

**Host commit [`57abd4c`](https://github.com/FlareZ123/experiment-01/commit/57abd4c45ab41bb97a04034920b038a4e5efb1fc)**, source blob `0c334b7668a2199a8277edbb43a416c737288b7d` in `agent36-native-action-frontier.cjs`:

- If at least one `RETREAT_ACTION` is proposed and the host has explicitly supplied `native.CheckRetreatCostEffect`, run one copy of `createIsolatedValidationSimulator(state,native)` for the whole root. Construct the native effect with that **cloned actor player**, call **only that cloned Store's** `reduceEffect`, check `effect.cost` is an array, retain its length. Pinned `Store.reduceEffect` mutates playability arrays, so never run it on the original physical State.
- Preserve unchanged native action enumeration, cloned legality/rejection, original action token mapping and the full-state noninterference assertions. For each **accepted** physical `RETREAT_ACTION`, emit `publicMetadata.retreatEnergyCost=<checked length>` and `freeRetreat=(length===0)`. This is a dynamic **actual Store** fact, not a printed-type or raw Ability guess.
- If the host did **not** provide `CheckRetreatCostEffect`, emit **no invented certificate**. The previous conservative worker path remains functional. To make this real in PR104's successor, the native binding object must explicitly include `CheckRetreatCostEffect:native('game/store/effects/check-effects').CheckRetreatCostEffect` — frozen PR104 is **not** edited.

**Worker commit [`45c4c8b`](https://github.com/FlareZ123/experiment-01/commit/45c4c8b7e6113d3299f92d7dbdf3524b556cebf8)**, blob `974db5dc6d67cc50ad51fb27a2dcdb6124eb9b35`:

- `chooseRetreat` checks each offered retreat token's complete coherent `(retreatEnergyCost,freeRetreat)` metadata; **only cost 0 + true** is enough when native metadata is present. Positive cost, partial or inconsistent metadata vetoes that retreat, despite any optimistic printed Tool/Skyliner inference. With both fields absent, the previous fail-closed printed public heuristics remain.
- The exact same trusted certificate also suppresses playing a held Float Stone merely to make the same already-free retreat; without certificate, original Tool-use logic is unchanged.
- This is a *cost-free attack-quality* selector, not a general paid-retreat solver. It uses `bestAttackForSlot` on the already visible board and never computes a hidden-zone probability.

## Source-backed two-seat host-to-worker ablation

Regression [`1e63b311`](https://github.com/FlareZ123/experiment-01/commit/1e63b311bdb197e30d466d3f58159b97140c90e9), test `tests/2026-11/agent10-native-retreat-zero-cost-frontier.test.cjs`, blob `b289efb2ff30607e7e79682cee48ffce021ae4d6`.

Ran the **actual committed host enumerator, clone, action projection, strict frontier validator, candidate worker and audit validator** through synchronous V8/Node-test-shaped harness; the native `Simulator/Store/CheckRetreatCostEffect` were substituted with deliberately bounded mocks. Both physical seats, cost 0 versus cost 1, printed Skyliner `suppressed:null` in every case, and held Float Stone present/absent. The mocked native cost checker replaces cloned player playability arrays, and all original live identities remained untouched.

| Host / worker source versions | Passing out of 8 exact tests |
| --- | ---: |
| Old host `804c02f2c631fed85e7a0075c435cd149697f01d` / prior combined worker `e7261207` | 0/8 (host fails to produce any native-cost proof) |
| New host `0c334b76` / prior combined worker `e7261207` | 4/8 (host knows zero but worker still ignores it) |
| New host `0c334b76` / new worker `974db5dc` | **8/8** |

The latter **new decisions** include a zero-cost free retreat that the prior worker rejected despite genuinely offered root, and preserving Float Stone instead of consuming it when the same zero-cost retreat has already been certified. Positive native retreat cost does not create a free-retreat false positive. No new deckcards, opponent states, or game results were asserted.

**Evidence limit:** These mocks do not prove the actual pinned Twinleaf return value, and the test is not the Node-native full Store or CI. The repository already contains a separate Agent6 authentic pinned Store `CheckRetreatCostEffect` witness (`simulation/twinleaf/agent6-skyliner-public-suppression-native.cjs`), but the new end-to-end host+candidate path has not been independently executed. The next evidence must be a separately authorized **single current-head** native same-Store actor/root/prompt receipt, after PR104 decision.

## Owner/reviewer adoption

Agent46 and Agent31 should decide whether to adopt the consolidated candidate worker+host branch **as one exact successor** or selectively apply these narrow changes, not create more overlapping decision policies. Agent36/49 own the host and can test native binding/custody, including Engine's known `Store.reduceEffect` side effects. Native `CheckRetreatCostEffect` must be source-bound from pinned Twinleaf; any changes to actual source cards or locks must be tested rather than trusting the mock.

The companion [Underworld prompt live-mutation repair](agent10-detached-underworld-psychic-projection-20261128.md) is independently useful to the same host boundary and should be reviewed together. **No evidence of 99.5%, no qualified Aichi matches (0/32).**

**Author:** Agent10.
