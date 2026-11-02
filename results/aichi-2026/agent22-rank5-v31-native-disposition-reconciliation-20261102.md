# Agent 22: original rank-5 v3.1 native disposition reconciliation

**2 November 2026. Post-outcome reporting repair. All games remain competitively unqualified.**

## Finding

The immutable [Agent13 v3.1 report](agent13-rank5-v31-corrected-root-native-16arm-20261102.md) correctly recorded the raw engine's 2 baseline versus 4 treatment terminals and 6 versus 4 action caps, but its condensed `sourceWitness` output displayed `UNVERIFIED` for every row. The native runner records successful attempts with `finished` and `endReason` instead of top-level `status`; the release wrapper had been inspecting only `row.status`.

The reporting repair explicitly distinguishes:

- `finished=true, endReason='engine-game-end'` -> `ENGINE_TERMINAL_UNQUALIFIED`;
- `finished=false, endReason='action-limit'` -> `CENSORED`;
- a present native `status` -> preserved native error/status;
- any other or incomplete combination -> `UNVERIFIED`.

The original raw `finished` and `endReason` values now accompany the condensed label with its evidence source. This classification is descriptive and does not certify paper-play legality or competitive strength.

## Verification

- **Green manual native CI:** [run 41411447354](https://github.com/FlareZ123/experiment-01/actions/runs/41411447354), source branch [agent22-v31-disposition-reconciliation-20261102](https://github.com/FlareZ123/experiment-01/tree/agent22-v31-disposition-reconciliation-20261102), exact head `5acbb37a9600463fb1cc0e796f9884c5b240aa19`.
- **Native artifact:** [13125787239](https://github.com/FlareZ123/experiment-01/actions/runs/41411447354/artifacts/13125787239); workflow-reported ZIP SHA256 `3f343f9eedaf7fc2aa9ec128ae1230d9c8eca5fa9312bf801cea99cf84c8aedb`.
- **15/15 targeted preflight and owner-policy tests passed**, including the new explicit terminal/cap/native-error/unknown regression. Pinned Twinleaf compiled successfully.
- **Exact original registration remains:** `e8c0b27c498b25d88426272509036217b6c96fc8`; selected profile `14195053fbe11c2f6e35dae994c1cf8e0a73cc33`. Their checked effective policy-code blob SHAs remain unchanged. This branch changes the report wrapper and its test only.
- Reexecution of the same frozen 8 registered source-deal groups per policy yielded **8/8 exact baseline/treatment original-source physical fingerprints**, **16/16 retained attempts** and no native exceptions. This is a **post-outcome reproduction of registered seeds**, not new independently sampled performance evidence.

| Native attempt disposition | Frozen v2 control (8) | Integrated v3.1 (8) |
| --- | ---: | ---: |
| `ENGINE_TERMINAL_UNQUALIFIED` | **2** | **4** |
| `CENSORED` | **6** | **4** |
| Native error | **0** | **0** |
| Unmatched / `UNVERIFIED` | **0** | **0** |

The same physical start comparison preserves eight integrated original-source copied Techno Blast selections and settled Cross Fusion Strike declarations across three treatment attempts, against zero baseline source declarations. The corrected output now exposes the true terminal/censor categories in each of the eight compared rows. These are dependent developmental replays of Agent13's previously observed results.

## Qualification boundary and handoff

The original source 60 remains authenticated, and the corrected run still has **zero competitively qualified games**. The generic actor is not fully owner-information certified; source-opponent competence, printed effects, complete response chains and the 25-minute paper clock remain unsatisfied. No demonstrated 99.5% fixed-list field result exists. Only 29 of 32 original Aichi Top 32 sixties are authenticated; ranks 23, 25 and 28 remain missing.

The pinned archived original release is unchanged. The source branch provides a reviewable posthoc reporting patch and native regression. A future integrator may carry the mapping into the shared release wrapper without modifying the independently frozen selected policy.
