# Canonical two-seat Plumeria after-Pass: native paired source-first evidence

**Agent 38 | 30 October 2026 | developmental policy intervention, not a win-rate result**

## Question

Can the shared canonical actor-only policy recognize a genuinely held and playable original `Plumeria BUS` after its terminal root chooser has selected Pass, execute the printed two-hand-card discard plus opposing Energy discard through authentic pinned Twinleaf prompts, and change the next player response on a physically matched Aichi source-first game?

This is the rank6 original Iron Thorns ex list with four printed `Plumeria BUS`, tested against both frozen candidates, plus a rank11 original-source first control. It investigates **decision-policy competence** within an earlier incomplete game environment. It neither optimizes nor nominates a final 60.

## Mechanical explanation

The independent outer experiment `withOwnerPlumeriaAfterPass(() => runDevelopment({actorOnlyComposition:true}))` could not intercept canonical Passes. The inner canonical root constructed a fresh Pass without delegating. The new default-off `ownerPlumeriaAfterPass` installs the original Agent4 adapter **after** the terminal root and prompt handlers, before the native executor, so it can see the actual Pass and subsequent three prompts. The `actorPlumeriaAfterPass` runner flag and `AGENT38_CANONICAL_PLUMERIA_AFTERPASS_DEV=true` select this integration. Without the opt-in, canonical behavior is unchanged.

The pinned upstream implementation `ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/plumeria.ts` constructs the last `ChooseCardsPrompt` using the physical chosen `PokemonCardList`. The original Agent4 check `slot===pending.cards` is therefore valid. No upstream engine code was changed.

## Reproducible first compiled experiment

- [GitHub Actions run 41117919626](https://github.com/FlareZ123/experiment-01/actions/runs/41117919626), **passed** on code commit `fa3efd27f19172b1056d77fda97c4fa4c31c81c5`. Workflow `rank11-sametarget-source-replay.yml` with manual input `agent38_plumeria_probe=true`; pinned vendor Twinleaf compiled in CI; Node22 pure tests ran before compilation.
- [Complete ZIP artifact 13007346055](https://github.com/FlareZ123/experiment-01/actions/runs/41117919626/artifacts/13007346055), SHA256 `cd60e7261aba430a245c3d70ce70ea2d4c53ef190647c35bf39592f0c6dbfc03`. Contains full original `agent38-plumeria-off.json`, treated `agent38-plumeria-on.json`, and failure-inclusive `agent38-plumeria-census.json`.
- All **four** preselected source-first control and treatment comparisons matched their original source-deal fingerprints, **full initial physical-deal fingerprints**, actual first-player seat, trial ID, candidate physical slot, and seed. This panel was retrospectively selected and is **not** an independent confirmatory benchmark.
- All four native development arms returned without an engine exception. One rank6 New Moon case hit the pre-existing **260-action cap** in both branches, so it supplied no game winner.

| Source rank / candidate | Native Plumeria roots accepted | Settlements confirmed by v1 actor-owned handler | Original-root ledger changed | Engine terminal |
| --- | ---: | ---: | --- | --- |
| 6 / champion reference | 0 | 0 | No | Winner seat1 unchanged |
| 6 / New Moon v1 | 2 | 1 | **Yes** | 260-action cap, no winner |
| 11 / champion reference | 0 | 0 | No | Winner seat1 unchanged |
| 11 / New Moon v1 | 0 | 0 | No | Winner seat0 unchanged |

Both Plumeria roots were accepted from **physical seat 0**, the original rank6 source. Turn 17 was recorded as `PlayCardAction Plumeria` followed by three original `ResolvePromptAction`s. The source owner discarded `Camping Gear BST` and `Capture Energy RCL`; the effect discarded a physical `Psychic Energy MEE` from the opponent, with a complete native after-state receipt.

At the second root on **global turn 53**, the original owner's Plumeria was also legally played. Its two-card discard-selection source was **28 physical cards**, beyond the existing bounded actor-hand-discard selector's 18-card limit. All three following prompts were delegated to the engine's generic selector, which chose `Spiky Energy JTG` and `Speed Lightning Energy RCL` from hand and `Psychic Energy MEE` from the opponent. The first v1 receipt hook only tracked actor-created prompt actions; it reported one confirmed settlement even though the root and all three native prompts were accepted. The missing receipt is an **audit coverage limitation**, not proof of a failed native discard.

## Actual causal policy difference in the matched game

In rank6 versus New Moon, control root ordinal 83 at global turn 17 was `PassTurnAction`. Treatment root ordinal 83 was accepted `PlayCardAction Plumeria BUS`, followed by native card and Pokémon prompt actions. At the candidate's immediately following global turn 18, the **control** selected `AttackAction`; the **treatment** selected `PassTurnAction`. This is an observed same-start policy divergence consistent with removing the opponent's Energy, subject to all other downstream game-state effects.

The 260-action cap occurred in both runs, with **6 and 4 final Prize cards remaining**, respectively, and no winner. In this truncated branch, the candidate recorded 31 attack declarations in control and 29 in treatment. These are genuinely executed development traces and are **not a measured change in win rate**.

## Follow-up receipt coverage

Added a strict default-passive dispatched-action observer in `simulation/twinleaf/agent4-plumeria-after-pass.cjs`, version `agent38-plumeria-owner-after-pass-native-v2-delegated-receipts`. It recognizes native `ResolvePromptAction` selected by the delegated handler only for a live matching actor, original Plumeria chain stage and mandatory prompt ID, requires original native `pending.validate`, checks selected physical owner-hand cards or publicly attached opposing Energy, and records physical after-state receipts. It **does not change the delegated action**. Separate counters preserve the distinction between actor-selected prompts and generic selections. The full experiment is repeated through the same existing manual workflow with a positive native receipt gate, preserving failures.

Pure synthetic regressions include a 28-card generic fallback chain, a mixed actor/generic prompt chain, and a return-without-discard negative case. The all-four paired census continues to include engine errors, missing audits, physical mismatches and action-cap cases.

## Limits and next decisions

The original rank6 source never declared an attack in this New Moon experiment. Plumeria's successful tactical denial is insufficient evidence of source policy competence across the field. Even correctly accepted Supporter plays consume a once-per-turn Supporter, two hand discards, and an opportunity to execute a different tactical line; a held printed card must be evaluated against alternatives. The large-hand generic fallback discards strategically important Special Energy printings; improved owner-aware discard selection is a separate policy experiment.

Current verified opponent field is 29 of 32 exact Aichi 60s, with original ranks23/25/28 absent. No source policy/paper-clock-qualified competitive games exist. The 99.5% target remains aspirational. **Keep both CI runs and their original raw evidence; do not merge retrospective game winners into the benchmark.**

## Files

- `simulation/evaluation/agent7-canonical-actor-composition.cjs`, `simulation/evaluation/agent41-bilateral-v2-development.cjs`
- `simulation/twinleaf/agent4-plumeria-after-pass.cjs`
- `tests/agent7-canonical-actor-composition.test.cjs`, `tests/agent4-plumeria-after-pass.test.cjs`
- `scripts/agent38-plumeria-paired-census.cjs`, `tests/agent38-plumeria-paired-census.test.cjs`
- `.github/workflows/rank11-sametarget-source-replay.yml`, gated manual `agent38_plumeria_probe`.


## Repeated native receipt verification and bounded counterexample

**Final default-policy receipt replay passed:** [Actions run 41119563237](https://github.com/FlareZ123/experiment-01/actions/runs/41119563237), source revision `040ffcf036008f54857581e5fc3585bae6299218`, [artifact 13008765093](https://github.com/FlareZ123/experiment-01/actions/runs/41119563237/artifacts/13008765093), ZIP SHA256 `5943150a6129b70068da762af26d1b1553fb4300d051d33313f94e67bf5166ac`. Exact four control/treatment source and full-physical opening fingerprints matched, two legitimate Plumeria native roots accepted, and **two separate physical original opposing Energy cards settled**. Both confirmed cases occurred at source physical seat 0. Root and prompt-choice SHA256s were unchanged from the initial v1 run; the new counts correct only the observational receipt coverage.

At turn 53, **exactly one** 28-card hand prompt was delegated to generic because of the 18-card actor menu ceiling; the actor-specific handler then successfully resolved the remaining Pokémon-target and attached-Energy prompts. The receipt trace reports `genericPromptFallbacks=1`, `delegatedPromptDispatches=1`, `acceptedPrompts=5`, `settledEnergyDiscards=2`, `delegatedSettledEnergyDiscards=0`, and `unresolvedChains=0`. The three-stage synthetic generic fallback test independently confirms the observer tracks cases where all three are actually delegated.

The first v2 compiled replay [Actions 41119143641](https://github.com/FlareZ123/experiment-01/actions/runs/41119143641) intentionally remains preserved with [artifact 13008430555](https://github.com/FlareZ123/experiment-01/actions/runs/41119143641/artifacts/13008430555). Its strong CI assertion incorrectly required three generic prompt fallbacks. The native simulator had in fact completed both physical discards with one generic and two actor-resolved prompts; the assertion was corrected and the subsequently identical run passed. The CI failure therefore exposed an audit expectation error, and was not a gameplay failure.

## Separate optional large-hand policy candidate

A targeted owner-only experimental selector is now available inside `selectPlumeriaHandDiscards`, gated by `AGENT38_PLUMERIA_LARGE_HAND_DEV=true`, **disabled by default**. It enumerates exact legal two-card print multiset options for the actual own-hand `ChooseCardsPrompt` with 19 to 60 physically owned cards, reuses Agent47's actor-only duplicate-preservation policy, and resolves the chosen printings back to original physical cards through the native validator. It rejects foreign card identities, wrong prompt types and invalid selection quotas. The interface exposes no opponent concealed cards to the pure chooser.

The new `agent38_plumeria_largehand_probe` manual workflow input adds a **third** same-seed native branch, preserving control, after-Pass baseline, and extended discard selection as distinct policy variants. Its paired reporter `scripts/agent38-plumeria-large-hand-compare.cjs` requires exact full initial deal fingerprints and reports physical root divergence, printed cards discarded, generic fallback counts, attack declarations, errors and action caps. Until compiled evidence is reviewed, this is a hypothesis about improved discard quality, **not a demonstrated matchup advantage**.
