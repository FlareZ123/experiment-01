# Agent39: source-stamped Volt Cyclone paper contract now requires physical settlement

**5 November 2026 | developmental, default-off observer/guard | no competitively qualified game.**

## Concrete measurement hazard

At pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `Store.reducePrompt` can return unchanged for a stale/missing prompt without throwing. Agent39 v3 previously incremented `paperVerifiedNativeAccepted` immediately after a nonthrowing `Store.dispatch(ResolvePromptAction)`. Its *independent pre-dispatch* printed geometry check was valid for the physically available Iron Thorns ex TWM Volt Cyclone Energy transfer, but did not establish that the proposed reply actually resolved or moved the Energy. This is a **potential false-positive measurement path**, not evidence that a prior archived genuine Volt source reply was a no-op.

## v4 correction

Source: [`simulation/twinleaf/agent39-paper-prompt-portfolio.cjs`](../../simulation/twinleaf/agent39-paper-prompt-portfolio.cjs), `VERSION=agent39-paper-prompt-portfolio-v4-physical-settlement`, research commit `fb43405`.

The same source-stamped, actual-live-Store-only contract now:
1. Captures the **exact pending unresolved prompt object** before native dispatch. The submitted result must appear on that same object after Store return. A disappearance without result, wrong/stale prompt ID, or unchanged prompt is **not settled**, even if Store did not throw.
2. When the printed preflight passes, checks this **same Energy card object** leaves the original owner's Active card/attached-Energy lists and arrives on the originally selected occupied own Bench card/attached-Energy lists. It rejects a preexisting destination reference masquerading as a transfer. A prompt result alone is insufficient for this effect.
3. Separates `nativeReturnedWithoutThrow`, `nativePromptSettled`, `physicalEffectVerified`, `nativeAccepted` and `paperVerifiedNativeAccepted`. New live counters isolate silent no-ops and settled-without-effect cases. `paperVerifiedNativeAccepted` increments **only after both result settlement and confirmed physical transfer**.
4. Retains v3's important real-versus-auxiliary Store distinction, source provenance, paper preflight veto, and default-off integration. Auxiliary speculative Stores are never paper-screened. For unverified families, a settled result does not assert an effect.
5. Remains noninterfering for valid native reply execution; after-the-fact unverified movement is recorded with a failure status rather than rewriting or assuming card-game custody.

The original immutable v2/v3 reports and receipts are *not* upgraded or reinterpreted. Native return-only counters are not complete game certificates. Other prompt families and all remaining paper legality rules are out of scope.

## Executed regression and pending pinned native fixture

[`tests/agent39-paper-prompt-portfolio.test.cjs`](../../tests/agent39-paper-prompt-portfolio.test.cjs), commit `f6b598f`, now has **15 synchronous injected tests**, all passed in a fresh V8 CommonJS-module stand-in execution against the exact committed source and tests. Eight new cases cover both physical seats: valid physical transfer, silent unchanged Store return, prompt removed without resolution, and prompt result assigned without moving the Energy. The previous seven cover paper-invalid preflight, unsupported prompt, live/auxiliary Store separation and missing live attribution. All three edited CJS sources compile with the V8 JavaScript parser. This is **not** a Node repository test run or compiled pinned Twinleaf CI claim.

The genuine pinned Store both-seat staged source [`simulation/twinleaf/agent39-volt-cyclone-paper-native.cjs`](../../simulation/twinleaf/agent39-volt-cyclone-paper-native.cjs), commit `6b3de87`, now dispatches a **stale physical prompt ID** before paper-invalid empty and genuine paid transfers. It checks no energy movement/no settled answer on stale dispatch, then expects one native silent-no-op receipt and one physically settled genuine transfer on each seat. This new pinned fixture extension has **not yet been executed in a compiled native runtime**. Historical v3 native four-pair noninterference [run 41687562652](https://github.com/FlareZ123/experiment-01/actions/runs/41687562652) predates v4 and is unchanged.

## Release integration

This correction is a reusable Issue #25 acceptance negative control, not an independently released complete bilateral policy. The current whole-policy gate remains FAIL/UNRESOLVED pending one frozen selected owner-safe two-seat profile, noninterfering native positive and negative tests, exact registered source physical deals, honest abort/cap retention, printed source payment, meaningful opponent replies, and official time handling. The public field remains 29 of 32 authenticated original name/count sixty-card inventories, missing ranks 23, 25, 28; **zero competitively qualified games**, no selected fixed 60 and no demonstrated 99.5% win rate.

## 14:16 UTC hardening addendum: attached Energy subzone and nested hook order

Current guard is **`agent39-paper-prompt-portfolio-v4a-attached-energy-settlement`** at commit `b8bd282`. The first v4 cut is preserved as `fb43405`. In native card stacks, membership in `owner.active.cards` alone is weaker than physical attachment. When `owner.active.energies.cards` is present, the paper preflight now also requires that exact source Energy in the attached-Energy subzone. The full post-Store transfer certificate continues to require its departure from both source lists and arrival in both destination lists when represented. This change closes a synthetic case in which a typed Energy appears in the source card stack while being absent from its attached-Energy sublist.

The regression mock now models both attachment sublists, and an adversarial wrong-zone case was added at commit `e6f05fc`. Four nested reversible dispatch-hook order controls were also added at `1c78a25`, both seats and both wrapper orderings, validating exact one-time custody and restoration of the initial Store dispatch descriptor.

**Executed:** 20/20 exact committed CommonJS tests passed under a fresh injected V8 module harness, source blob `f2c3481effc56b0f35ee32cb6866fb7d283cd87e`, test blob `1b784f951056a7f0a16822540ec4b5678e01f7ec`. This is still a synthetic stand-in execution; **a pinned native-engine v4a fixture execution and a genuine selected-release integration run remain unobserved**. The native fixture retains its new two-seat stale-prompt negative and genuine transfer positive assertions. No historical native game classifications are changed.

## Shared manual native CI route wired, outcome pending

At commit [`b1d255f`](https://github.com/FlareZ123/experiment-01/commit/b1d255f09083a2b49d6b107e9b06d293c2b37197), the pre-existing manually dispatched [`.github/workflows/twinleaf-completion.yml`](../../.github/workflows/twinleaf-completion.yml) **abort-custody** job includes the Agent39 20-case pure test file in its existing precompile prompt-regression step, and invokes the genuine two-seat staged Volt native fixture immediately after the pinned Twinleaf compile step. This adds **no workflow definition or automatic per-commit trigger**. The new job steps await dispatch/execution: a workflow configuration commit is not evidence of successful native tests. The upcoming native fixture is strict about stale prompt no-op and exact physical Energy custody; on any error the job must report failure rather than silently relabel the case as a paper-certified prompt.

## 14:27 UTC pinned-source verification of the physical contract

Further inspected the *exact pinned upstream* source at revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex.ts`: Volt Cyclone text explicitly moves **an Energy from this Pokémon to one of your Benched Pokémon**; `AfterAttackEffect` creates a mandatory one-result `AttachEnergyPrompt` with source `player.active`, destination category own Bench and native `MOVE_CARDS` on callback. This corroborates the independent preflight geometry rather than any assumption that all prompt families behave identically.
- `ptcg-server/src/game/store/store.ts`: `reducePrompt` returns unchanged when either prompt identity or its recorded callback is absent. When present it assigns `prompt.result` and runs the callback if all responses have become defined. A nonthrowing return is therefore insufficient to certify the move. This is the actual source basis of the adversarial stale-prompt regression.
- `ptcg-server/src/game/store/state/pokemon-card-list.ts`: a board slot has separate `cards` and `energies.cards`, and `getPokemonCard()` tests whether it has a real Pokémon. Its `moveCardsTo` updates both lists. Accordingly, the current **v4b** code ([commit `2ae8564`](https://github.com/FlareZ123/experiment-01/commit/2ae8564cdb9fe442d8949ff3a70cd66aefcaf46c)) requires a live Pokémon at the destination. A stray Energy-only Bench stack no longer passes the printed target check.
- [New physical-target mock](../../tests/agent39-paper-prompt-portfolio.test.cjs) commit `6deb1f6` exercises this case. **21/21** exact-source synthetic tests pass (source Git blob `76e210b489e1cc7a4ccc88148832b7696d6d2a0b`; test blob `65cadf66d9c2d53abfc8c23d8b9aecf7db16e961`). The manual compiled native job remains unobserved; no full-game paper qualification follows.
