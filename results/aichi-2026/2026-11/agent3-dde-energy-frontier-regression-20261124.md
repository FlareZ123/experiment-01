# Double Dragon Energy native action-frontier regression

**Status:** the initial DDE frontier fix is on mainline-based branch `agent3/dde-energy-frontier-mainline-20261124` in [PR #65](https://github.com/FlareZ123/experiment-01/pull/65). Its first exact-print error catch was too broad and is superseded by [follow-on PR #66](https://github.com/FlareZ123/experiment-01/pull/66), which replaces the catch with a cloned-Store dynamic-type preflight. PR #66's exact head `ee9df3f010eb8b5471cb38ef0ac04078868dd5fb` passed focused pinned-Twinleaf run [45325495328](https://github.com/FlareZ123/experiment-01/actions/runs/45325495328); independent review is pending. Do not merge PR #65 until #66 is integrated and the focused selector passes on the resulting exact head. This is adapter-correctness evidence, not competitive-game evidence.

## Question

The research-owned uncapped action enumerator proposes an Energy attachment to every occupied Pokémon. Does the native Store's rejection of Double Dragon Energy (DDE) on a non-Dragon recipient incorrectly abort construction of the complete native action frontier, and can that rejection be handled without suppressing unrelated Energy errors?

## Pinned rule evidence

The experiment uses the repository's pinned Twinleaf gitlink, `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

In the pinned upstream source, `ptcg-server/src/sets/07-x-and-y/set-roaring-skies/double-dragon-energy.ts`, the DDE reducer handles its own `AttachEnergyEffect`, checks the recipient through `CheckPokemonTypeEffect`, and throws `GameError(GameMessage.CANNOT_PLAY_THIS_CARD)` when the recipient is not a Dragon Pokémon. The error is therefore the native rules rejection for an incompatible DDE recipient, not a generic indication that arbitrary Energy actions are safe to discard.

The adapter's prior expected-rejection table did not classify `CANNOT_PLAY_THIS_CARD` for Energy actions. As a result, one invalid DDE-to-non-Dragon proposal could abort the frontier even when a legal DDE-to-Dragon proposal was also available.

## Initial correction (superseded by PR #66)

**Important:** The exact-print catch below describes the first PR #65 implementation only. Agent10's review correctly found that it could downgrade an unrelated error during a legal DDE-to-Dragon dispatch. This implementation is not the one to merge; the current dynamic-type preflight is documented in the later **Follow-on correction** section.

`simulation/evaluation/2026-11/agent36-native-action-frontier.cjs` now treats `CANNOT_PLAY_THIS_CARD` as an expected rejection only when all of the following hold:

- the rejected action is a PlayCardAction in the Energy family;
- the native error is `CANNOT_PLAY_THIS_CARD`;
- the card in the actor's hand is exactly `Double Dragon Energy ROS`, set `ROS`, card number `97`.

This is intentionally narrower than adding the error to the Energy-family allowlist. Other Energy printings that raise the same error remain fatal. Twinleaf upstream source and the frozen Stage-A fixture/registration were not modified.

## Native regression

`tests/2026-11/agent3-dde-energy-frontier-native.test.cjs` uses the compiled pinned Store and runs both physical seats. The fixture has Regidrago V SIT Active, Dedenne-GX UNB and Tapu Lele-GX GRI on the Bench, and DDE in hand.

For each physical seat, the test confirms:

1. the native Store accepts DDE attached to Regidrago;
2. the native Store rejects DDE attached to Dedenne and Tapu Lele with `GameError: CANNOT_PLAY_THIS_CARD`;
3. the production frontier retains the legal Regidrago action and rejects only the two incompatible recipient actions;
4. the frontier reports three enumerated, one validated and two rejected actions, with zero preflight rejections, zero unsupported actions, and no truncation/omission;
5. the original live Store graph is unchanged.

A second native control injects `CANNOT_PLAY_THIS_CARD` from a non-DDE Energy reducer and verifies that the error remains fatal. This protects against accidentally broadening the Energy-family allowlist.

## CI evidence and limitations

- Workflow: `.github/workflows/twinleaf-smoke.yml`, existing manually dispatched smoke workflow; the existing Energy-frontier step now includes this regression and explicitly supplies the pinned engine SHA to the runner's attestation.
- Run: [45301037199](https://github.com/FlareZ123/experiment-01/actions/runs/45301037199), head `fad2839e8281d261ad7f12199dfb1f3b8eada7a6`.
- The targeted `smoke_check_14` passed, including the two DDE tests and the existing Energy-frontier tests.
- The overall smoke job remains failed because unrelated `smoke_check_39` fails its frozen candidate-manifest assertion: expected Git blob `0656ee1a940cf74c884af95dada5196081a6c0e9`, observed `fc0da5f65d014f7323266cf11a2d6b712f457df4` for `scripts/aichi-new-moon-candidate.cjs`. The DDE step is green; the workflow as a whole is not green.
- The earlier run [45298709181](https://github.com/FlareZ123/experiment-01/actions/runs/45298709181) failed the DDE step because that step omitted `AGENT36_TWINLEAF_COMMIT_SHA`; the pinned value was added to the existing step and the rerun above passed. The first failure was harness configuration, not a rules result.
- The benchmark census currently reports DDE in 10 of the 29 available Aichi lists (ranks 10, 12, 13, 14, 18, 19, 20, 21, 27 and 32). This makes the adapter bug materially relevant to field coverage, but the test does not run a competitive game.
- The Aichi lists at ranks 23, 25 and 28 remain unavailable. No matchup result, paper-qualified game, fixed final 60, or 99.5% claim follows from this regression.
- The native fixture is a constructed Store state with placeholder deck/prize zones, not a legal 60-card paper deck or a completed game. It validates one adapter/rules-rejection boundary only; it does not estimate draw probabilities or competitive performance.

## Next action

Resolve the independent exact-head review requested from Agent10, Agent16, and repository owner FlareZ123 for PR #66. If clear, merge #66 into PR #65's branch (not main), then run the existing `twinleaf-smoke.yml` selector with `agent3_dde_energy_frontier_only=true` on the resulting exact PR #65 head. Only then consider PR #65 for mainline integration. Keep the separate DDE host-type-change/discard rule as a distinct follow-up, and keep Stage-A dispatch and frozen fixture inputs under Agent6's existing ownership.


## Mainline integration and focused-selector verification

- Clean mainline-based integration is proposed in [PR #65](https://github.com/FlareZ123/experiment-01/pull/65), rather than merging the original research branch that had accumulated unrelated divergence.
- The existing `.github/workflows/twinleaf-smoke.yml` now has an opt-in `agent3_dde_energy_frontier_only` selector and a dedicated job. It verifies that the checked-out `vendor/twinleaf` gitlink and actual submodule revision both equal `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, installs the pinned Node 20.19.0 dependencies, compiles the upstream server, and runs only the two Agent10 Energy frontier tests plus this DDE regression. The default 39-check smoke job is skipped when this selector is enabled.
- `.gitmodules` declares the submodule path `vendor/twinleaf` and remote `https://github.com/twinleafgg/twinleafgg.git`; the main-branch gitlink pins `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The focused workflow verifies the gitlink and checked-out revision agree. No upstream source was modified.
- Focused selector run [45311433776](https://github.com/FlareZ123/experiment-01/actions/runs/45311433776), exact PR head `7dc5a6c6c7b4c2f9a343a89d33a0d934b591d736`, completed **success**. The dedicated `agent3-dde-energy-frontier` job and every step passed; the omnibus `smoke`, Aichi bridge, and Agent45 jobs were skipped.
- This confirms the focused workflow path and the adapter regression on the mainline-based PR branch. It does not qualify any game or matchup. Independent Agent4 review and PR merge remain pending; full-field validation remains open.


## Aichi field exposure: mixed-type recipients are present in every DDE list

A count of `results/aichi-2026/full-decklists.json` finds 10 DDE-bearing source lists (ranks 10, 12, 13, 14, 18, 19, 20, 21, 27 and 32), with 38 DDE copies total. **All 10/10 lists contain both Dedenne-GX and Tapu Lele-GX**, so the regression's two non-Dragon recipients are not artificial additions to the DDE archetype. Agent10 independently checked the printing fields: all 10 lists use the same exact DDE printing, ROS #97, totaling 38 copies; the PR's exact-print predicate therefore covers every currently available benchmark DDE copy.

| Rank | DDE copies | Dedenne-GX | Tapu Lele-GX |
|---:|---:|---:|---:|
| 10 | 4 | 1 | 1 |
| 12 | 4 | 1 | 1 |
| 13 | 3 | 1 | 1 |
| 14 | 4 | 1 | 1 |
| 18 | 4 | 2 | 2 |
| 19 | 4 | 2 | 1 |
| 20 | 4 | 2 | 1 |
| 21 | 3 | 1 | 1 |
| 27 | 4 | 1 | 1 |
| 32 | 4 | 1 | 1 |
| **Total** | **38** | **13** | **11** |

The repository card pool independently confirms the restrictions and types: `resources/cards/en/xy6.json` identifies Double Dragon Energy XY6 #97, marks it Expanded-legal, and says it can only attach to Dragon Pokémon; `resources/cards/en/sm10.json` identifies Expanded-legal Dedenne-GX #57 as Lightning; `resources/cards/en/sm2.json` identifies Expanded-legal Tapu Lele-GX #60 as Psychic.

Thus every currently available DDE-bearing benchmark list contains both non-Dragon recipients. Whenever DDE is in hand while either Pokémon is in play, the uncapped enumerator's Energy × occupied-Pokémon proposal loop can generate an invalid attachment candidate. This is a decklist exposure result, not a claim about the frequency of those game states or competitive matchup performance.


## Scope scan of the Aichi Energy pool

The 29 available lists use 21 distinct Energy names: Capture, Counter, Darkness, Double Colorless, Double Dragon, Fighting, Fire, Grass, Jet, Lightning, Memory, Powerful Colorless, Prism, Psychic, Recycle, Reversal, Speed Lightning, Spiky, Telepathic Psychic, Unit Energy LPM, and Water Energy.

A card-text scan of these Energy entries found **Double Dragon Energy as the only one with an explicit restriction on which Pokémon may receive the attachment**. The other Special Energy conditions in this field alter the Energy provided or trigger a bonus based on the recipient/board state (for example, Prism, Counter, Reversal, Speed Lightning, Telepathic Psychic, Powerful Colorless, and Unit Energy); they do not prohibit attaching the card to a different Pokémon. This supports keeping the rejection exception exact-print scoped rather than globally suppressing `CANNOT_PLAY_THIS_CARD` for the Energy family.

This is a card-text scope scan of the currently available field, not an exhaustive proof against every effect-based attachment prohibition. The adapter must continue treating unrelated native Energy errors as fatal.


### No-silent-skip guard verification

The native test is intentionally skippable in a developer checkout when the compiled Twinleaf action enumerator is absent. To ensure CI cannot report a green result with that test silently skipped, the existing smoke step and focused job now require the exact compiled output path with `test -f vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator.js` before invoking the test files.

The updated focused selector passed in [run 45313978366](https://github.com/FlareZ123/experiment-01/actions/runs/45313978366), exact workflow/code head `adb7407f25b20b992b5499202a5761eed53de808`. The new guard and the focused job succeeded. Because the test's only skip condition is the same compiled-file existence check, the guard ensures the DDE regression ran rather than being silently skipped. The run used only the focused DDE/Energy selector; no 39-check, Aichi bridge, or Agent45 job ran.


### Current-main compatibility check

At 2026-11-24 02:44Z, the PR branch was compared against current `main` for the native test's runtime dependencies. The V3 runner, native fixture driver, cap-free action enumerator, and both Agent10 Energy frontier test files were byte-identical on the two refs. The only code dependency differing was `agent36-native-action-frontier.cjs`, where the PR branch adds the DDE-specific rejection guard; no intervening mainline changes to the test harness were missing. The workflow's focused selector was independently dispatched on the PR branch and passed as recorded above.


## Independent review finding — correction required before merge

Agent10's adversarial review accepted the exact-print scope, both-seat Store regression, Store immutability assertion, non-DDE fatal control, and focused workflow, but identified a blocking correctness issue: `isExpectedActionRejection()` sees only that the exact DDE printing was being dispatched and the complete cloned-Store dispatch threw `CANNOT_PLAY_THIS_CARD`. It does not prove that the thrown error came from DDE's non-Dragon recipient check; another reducer or triggered effect could throw the same message during an otherwise legal DDE→Dragon action. Agent10 clarified that the frontier does not admit the invalid action: a classified rejection increments `rejectedCount` and omits it. The actual risk is silently downgrading an unrelated fatal cloned-Store error into an ordinary rejection, hiding the failure and potentially omitting an otherwise legal DDE→Dragon action.

**Required correction:** suppress this error only when the actual action target is non-Dragon under the pinned state/type representation. Add a regression that forces the same native `CANNOT_PLAY_THIS_CARD` during an otherwise legal DDE→Regidrago dispatch and proves it remains fatal. Retain the real DDE→Dedenne/Tapu Lele rejection and non-DDE fatal control.

Agent3 agrees with the finding and has asked Agent4 to confirm the pinned target/type predicate and whether `CheckPokemonTypeEffect` accounts for type-changing effects. PR #65 is not merge-ready until the narrower guard and fatal control are tested. No Stage-A branch or fixture was changed.


## Follow-on correction: dynamic recipient-type preflight (2026-11-24)

The earlier broad exact-print catch described above is **superseded by follow-on PR #66**, which is open against this PR's branch (not main) and has not yet been merged. The corrected implementation removes the DDE-specific `CANNOT_PLAY_THIS_CARD` catch entirely. For exact ROS #97 DDE PlayCardActions, it resolves the target against the isolated validation Store, requires an occupied Active/Bench Pokémon owned by the acting player, and runs the pinned `CheckPokemonTypeEffect` through `Store.reduceEffect`. It preflight-rejects only a dynamically non-Dragon target. Missing primitives, unresolved/opponent-owned targets, failed type checks, and non-array/empty type results fail closed; the implementation relies on the pinned CheckPokemonTypeEffect contract for valid CardType enum entries, and Agent16 has been asked to confirm whether an additional runtime membership assertion is warranted. Dragon-target dispatch errors remain fatal.

The follow-on regression in `tests/2026-11/agent3-dde-energy-frontier-native.test.cjs` adds both-seat Kecleon PLF #94 Color Change controls (Dragon opponent Active = legal DDE recipient; non-Dragon opponent Active = illegal), opponent-owned target rejection, same-message `CANNOT_PLAY_THIS_CARD` fatal propagation on a legal DDE→Regidrago action, and retains the non-DDE fatal control and live-state immutability checks. Agent16's pinned-source review establishes why printed `cardType` is insufficient; Agent10's review motivated the target-side guard and same-message fatal control.

- PR #66: https://github.com/FlareZ123/experiment-01/pull/66
- Exact PR #66 head: `ee9df3f010eb8b5471cb38ef0ac04078868dd5fb`
- Focused pinned-Twinleaf workflow run [45325495328](https://github.com/FlareZ123/experiment-01/actions/runs/45325495328) completed successfully on that exact SHA.
- Independent exact-head review has been requested from Agent10, Agent16, and repository owner FlareZ123. No review disposition had arrived at the time of this update; do not merge #66 or #65 to main until the review gate is resolved.
- PR #65's branch also contains the default-smoke guard correction in commit `f555880858d3296190096e873ff4937ff4ad2f77`: the compiled-output guard is inside `smoke_check_14`'s `continue-on-error` step, preserving later independent checks 15–39. The focused DDE-only job keeps its separate fail-fast guard.

This remains adapter-correctness evidence only, not a legal-deck game, matchup, policy-competence result, or win-rate estimate. The separate continuous rule requiring an attached DDE to be discarded if its host later ceases to be Dragon is not tested here; keep it as a distinct follow-up before full-field simulation.
