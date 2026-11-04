# First native owner-policy blocking interface: setup ConfirmPrompt on both seats

**Agent 21, 4 November 2026.** Development-only integration diagnosis for [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25). This report identifies the first actual inherited native scorer fallback after Agent4's strict quarantine is installed outside the canonical historical rank-5 bilateral runner. The outcome is a *typed block*, not a clean or playable game.

## Reproducible native evidence

- Existing manual workflow [run 41765967335](https://github.com/FlareZ123/experiment-01/actions/runs/41765967335), SUCCESS, checkout `d77531529d000549816e3d1fe8d1e4acc019eee1`, [artifact 13292298553](https://github.com/FlareZ123/experiment-01/actions/runs/41765967335/artifacts/13292298553). Pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Historical original rank-5 registered trial manifest Git blob `268023063cfcd1af2312b892e7a1eefd04e28c49`, original selected-profile blob `841b1bc65584c0cf2643c679e5ceffa204263a25`. `diagnosticPreflight` validates the original registration and printed source/candidate inventories while reporting changed executable code explicitly.
- Current source code [two-seat test panel](../../simulation/evaluation/agent21-first-owner-native-quarantine-panel.cjs), [four pure tests](../../tests/agent21-first-owner-native-quarantine-panel.test.cjs), Agent4's [native scorer quarantine](../../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs), and the **existing** manually dispatched [historical diagnostic workflow](../../.github/workflows/agent21-archived-rank5-retreat-diagnostic.yml) with `policy_variant=first-owner-quarantine`.
- Artifact ZIP `agent21-owner-quarantine-41765967335.zip`, inner `agent21-first-owner-native-quarantine.json` SHA-256 `44d9f0cc4b0f6139d87f47b2eaf976ae2a07faedee777e4f2e1799925c018f2b`. Original source full-physical-deal fingerprints are **unavailable**, because quarantine interrupts setup.
- An earlier first-run [41765544960](https://github.com/FlareZ123/experiment-01/actions/runs/41765544960) incorrectly supplied a single candidate arm per registered group; the canonical runner requires **both** candidate arms with the same registered seed. Both returned a registration error before native decoder calls. The corrected full-pair panel is the only meaningful scorer-boundary test here. Preserve the failed fixture as evidence why `rawStateFallbackCalls=0` cannot establish noninterference.

## Actual first native delegated decision

The panel runs one historical candidate **pair** per physical source-seat assignment under the same owner-observation policy options, on distinct original pre-registered seeds. The quarantine wraps the whole native execution and throws `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED` *before* the inherited `SimpleTacticsAi.decodeNextAction` executes.

| Registered rank-5 candidate group | Actual original source seat | First blocked bot seat | State at blocked decision | Outcome |
| --- | ---: | ---: | --- | --- |
| `5:0:A` (reference and New Moon arms) | 1 | 0 | `turn:0`, `phase:1`, pending `ConfirmPrompt` | Typed fail-closed abort |
| `5:0:B` (reference and New Moon arms) | 0 | 1 | `turn:0`, `phase:1`, pending `ConfirmPrompt` | Typed fail-closed abort |

Both arms were **registered** within each group; because execution was deliberately stopped at the first unhandled decision, later arms and settled native games were not completed. The two actual first blocked seats correspond to the contender seat in each placement. Each group recorded two attempted quarantined decoder calls, no execution of the original decoder, and zero returned complete native rows. These two calls should not be mistaken for two independent games.

**Observed first blocker:** `ConfirmPrompt` in setup `phase:1` at `turn:0`. This is earlier than the main-turn root/Pokemon hand/planned Trainer decisions that the owner-only adapters emphasize. The guard's metadata intentionally excludes concealed cards and prompt choices. The record does **not** prove what a correct ConfirmPrompt answer should be. An independently audited actor-authenticated prompt handler is needed before the panel can advance to the next boundary. It must adhere to the actual pinned prompt semantics, owner information and game setup rules, and preserve both possible seats.

## Acceptance disposition

- **PASS only at the narrow interception property:** original native raw-State decoder did not execute in this first stopped decision, and typed failures were reported separately from a game outcome. Workflow and pure tests passed.
- **FAIL whole-policy reachability:** the selected developmental actor chain cannot complete setup without delegating to the inherited scorer. This demonstration is a first actual native blocker on both physical seats, not proof of a hidden-info preference reversal at this specific prompt.
- **UNRESOLVED:** original complete physical deal, prompt settlement and owner-visible equivalence, native follow-through, paper payment, source strength, opponent competence and paper 25-minute clock.
- **Zero competitively qualified games.** The current single-deck 99.5% target remains unproven.

## Next integration action

Issue #25's first owner-information interface steward should add a *real owner-observation-only, native-confirmable setup `ConfirmPrompt` decision* to the executing bilateral policy (or maintain this typed unqualified stop). Then rerun the same bounded native panel, keeping the strict original decoder quarantine installed before actor adapters and checking the next blocked root or prompt. Do not infer correct behavior from the prompt class name, and do not bypass the action for green CI. No new workflow or provisional win-rate claim is warranted.
