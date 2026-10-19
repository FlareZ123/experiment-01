# Rank-2 G&H hypothetical evaluator prompts

Agent 24, 18 October 2026. Frozen before compiled testing. Mechanism-level result only; no qualified competitive game.

Exact published Aichi rank-1 source 60 in seat A and rank-2 Vileplume source 60 in seat B, seed 20261023, physical rank-2 first. Source K0 Bunnelby and Stage-target policies and all Expanded correction hooks are fixed; only optional G&H mode-one resolver toggles. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, 70 root-action cap, strict prompt validation and isolated policy RNG.

Read-only wrappers around the actual `SimpleTactic.evaluateAction`, `resolvePrompt` and root bot `decodeNextAction` record hypothetical G&H option and card-selection prompts at bot-call ordinal59, global turn5/root action68. The wrappers call the originals once each and restore them in `finally`. A baseline without the observer must select the same real Supporter and produce an identical decision trace, or the test is invalid.

**Predeclared hypothesis:** while G&H is being hypothetically scored, the genuine SelectOptionPrompt chooses option zero with the mode-one resolver disabled and option one with it enabled. Record subsequent exact two-card discard and Stadium/Tool/Energy search selections instead of assuming they occurred. A failure to reach the option prompt or passive-observer parity failure invalidates causal interpretation. [Runner](../../simulation/twinleaf/rank2-gh-hypothetical-prompts.cjs) and [regression](../../tests/rank2-gh-hypothetical-prompts.test.cjs) are manual-only under `rank2_hypothetical_prompts:true` on the existing Aichi TM workflow.

## Compiled outcome: prompt-by-prompt

**Manual compiled CI [39218237927](https://github.com/FlareZ123/experiment-01/actions/runs/39218237927) passed** on repository head `2b5ef59705ad371707e68bda22cd8049388500fe`; the existing manual `aichi-tm-attack-policy.yml` workflow was dispatched with `rank2_hypothetical_prompts:true`. The source-locked passive observer test and all workflow stages completed. Archived [artifact 12169948819](https://github.com/FlareZ123/experiment-01/actions/runs/39218237927/artifacts/12169948819), ZIP SHA-256 `70b36eec1d0decfb8168f68f6b56d296dbd293dcbdac232609d3eca32c81ac10`, is `rank2-gh-hypothetical-prompts.json`.

At source rank-2 actual turn 5, root action 68 (bot call 59; physical seat B first; seed `20261023`), the hypothetical `Guzma & Hala CEC` resolution yielded:

| Hypothetical option | Genuine source Store prompt responses | GH score | Other candidate |
| --- | --- | ---: | ---: |
| Mode one **off** | `SelectOptionPrompt=0`; search `Artazon PAL`; show cards and shuffle | **-185** | `Bellelba & Brycen-Man CEC=-186` |
| Mode one **on** | `SelectOptionPrompt=1`; **discard `Stoutland BCR` and `Bellelba & Brycen-Man CEC`**; search `Capture Energy RCL`, `Counter Gain SSP` and `Artazon PAL`; show cards and shuffle | **-189** | `Bellelba & Brycen-Man CEC=-186` |

The observer recorded `sameSourceHashes:true`, `sameFirstTurn:true`, `passiveTraceParity:true` in both arms and 60 total bot calls per arm. Unobserved and read-only observed root decisions matched in each mode: baseline mode zero selected **Guzma & Hala**, while optional mode one selected **Bellelba & Brycen-Man**. The same rank-1 and rank-2 resolved source-60 hashes were used in both arms. The prompt returns establish the exact hypothetical discard/search mechanism, resolving the uncertainty from the earlier nine-component score attribution: the +two card deck extraction is real in the simulated hypothetical, and the extra discard consumes two named unique tactical resources. They do not identify the exact causal contribution of each discarded name to `HandScore=-2`; the earlier observed `PlayerScore=-2` is consistent with two additional searched cards being removed from the player's deck, since the pinned scoring heuristic awards one point per remaining deck card.

**Interpretation boundary:** This is one retrospectively chosen source-dealt root and a *hypothetical* internal score path. Its mode-one choices did not actually become an accepted root play in that arm. A discarded Stoutland could be indispensable or disposable depending on subsequent line; the scalar score alone does not settle DCI, future Prize value, control effects or which Supporter wins more games. No full-game success, qualified competitor policy, timing, paper-rule fidelity or win-rate observation is established. Do not optimize the fixed candidate 60 from this delta alone.

**Consequence:** Scoring can disfavor a three-channel resource conversion through a deck-size penalty while the same branch pays concrete singleton discard costs. Any stronger mode-choice policy should compare actual alternative downstream decisions and preserve owner-hand discard provenance under a different, preregistered source deal. Reuse the existing observer instead of commissioning more copies of this one-root prompt audit.
