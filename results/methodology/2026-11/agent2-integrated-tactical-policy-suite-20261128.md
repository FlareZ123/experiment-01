# Combined policy-source proposal: five bounded fixes pass one coherent 248-case differential suite

**Agent 2 · 28 November 2026.** This is a **single in-memory source-policy integration**, not a deployed successor, registered deck change, approved native run, or measured win rate. It proves the proposed changes' root/prompt decisions are *mutually compatible on all constructed controls currently supplied*, not that they are complete or competitively effective.

## Inputs and composition

- Exact unchanged implementation input: `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs` on `agent46/two-profile-policy-successor-20261127-v2`, Git blob **`813f22634f8f162d1da3659ad5c5d2d6da32103b`**, **244,791 bytes**.
- One executable, reviewable source-only integration script: [**agent2-integrated-tactical-policy-reproduce.cjs**](agent2-integrated-tactical-policy-reproduce.cjs). It composes four existing source-specific `patchWorker` implementations plus the one-expression Tropical Beach threshold. The original policy and the integrated proposed policy are both compiled in memory; the approved owner branch is never modified. The resulting hypothetical source is **248,819 bytes** and exports the same `POLICY_VERSION` and `createPolicy` interface.
- Patch order: [source-qualified causal Ability scope](agent2-direct-terminal-causal-scope-reproduce.cjs), [stacked Spiky retaliation](agent2-spiky-energy-direct-final-reproduce.cjs), [Guzma free-return pivot](agent2-guzma-free-pivot-final-reproduce.cjs), [Battle Compressor two-payload Raihan line](agent2-compressor-double-payload-raihan-reproduce.cjs), then `Tropical Beach` safe six-hand fallback.
- The integration refuses ambiguous/missing exact source anchors. It deliberately runs the existing four complete differential scripts **with their expected baseline comparisons but the same combined proposed source**, then runs an additional full Beach 10-case root matrix on that combined source. It does **not** bypass or reinterpret their negative controls.

## Executed on the actual source policy

| Independent test family | Baseline↔combined scenario pairs | Intended corrected choices | Controls unchanged | Staged follow-on decisions |
| --- | ---: | ---: | ---: | ---: |
| Ability causal scope | 44 | 24 | 20 | — |
| Conditional stacking Spiky Energy | 56 | 24 | 32 | — |
| Guzma → Latias → free retreat → Max Geist | 44 | 12 | 32 | 16 |
| Compressor → 2-card Raihan/Psychic dump → VS Seeker → Max Geist | 64 | 12 | 52 | 24 |
| Six-hand Tropical Beach final fallback | 40 | 12 | 28 | — |
| **Combined execution** | **248** | **84** | **164** | **40** |

**Observed:** **248/248 matched baseline-vs-combined scenario expectations**, **496 actual source-worker decision calls**, **84 intentionally corrected choices**, **164 unchanged controls**, and **40/40 staged follow-on policy decisions** across both source-bound candidate profiles and physical seats. **Zero unexpected decisions.**

This result is stronger than five isolated unit demonstrations because each scenario executes **all four worker patches together**, so incompatible changes to direct-final admission, root priorities, prompt selection and paid-retreat resources could have surfaced as changed controls or missed corrected choices.

The checked controls still include active Mimikyu Safeguard, unknown defensive Abilities/Special Energy, nonlethal hits, Spiky retaliation at exact HP thresholds and 2-copy stacking, already-consumed retreat, disabled Skyliner/Float Stone, absent prompt payloads, no prior-turn KO for Raihan, insufficient final Prizes, used normal attachment, Stadium not live or unavailable, seven-card Beach hand, small deck reserve, and a payable ordinary attack taking precedence over Beach.

## Reproduce

From a checkout containing the exact worker source at the sibling candidate-policy branch revision (or a trusted local copy):

```bash
node results/methodology/2026-11/agent2-integrated-tactical-policy-reproduce.cjs \
  simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs
```

The script uses only Node built-ins and the four sibling source test modules, does not access the network, does not write to the repository, and throws on any mismatch. It can also be invoked programmatically as `run(workerSource, explicitModuleSourceTextMap)`, which was used to fetch and execute the exact code and worker via the GitHub connector in the research invocation.

## Decisions and limits

This integration presents **one coherent candidate for Agent46's local tests** rather than five conflicting instructions. The [cross-problem tactical synthesis](agent2-executable-tactical-policy-synthesis-20261128.md) identifies the four failure mechanisms: effect-scope collapse, one-step search horizon, single-payload connector optimization, and six-card safe-draw threshold. The four source patchers all retain their own hard negative controls. A human reviewer should evaluate them as a package or select individually based on current authority.

**None of 496 decisions are shuffled natural games.** Many test states are synthetic by design; the count is not a frequency of in-game opportunities, a game win count, or a rate bound. Even a perfect test suite cannot substitute for native Store/legal-prompt execution, source-correct full opponent policies, and full 32-matchup evaluation. No fixed 60, PR, CI workflow, vendor code or scheduled native fixture was changed by Agent2.

The single-deck benchmark remains unachieved and unverified: **29/32** original opponent 60s currently authenticated, **0/32** qualified matchups; the 99.5% target is aspirational only.
