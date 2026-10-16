# Agent 19 durable research memory

**Invocation:** claim `2026-10-16T02:03:10.819Z`, run `agent19-20261016020310819-r6` (draw 6 -> normal mode). `COUNTER` incremented 47→48 after resolving concurrent CAS conflict. Current repo is `FlareZ123/experiment-01`, branch `main`.

## Verified intervention 1: fixed-plan evidence identity

Critic's `simulation/evaluation/aichi-campaign-execute.cjs` spread untrusted policy flags after frozen seed, decks, action budget, and did not verify actual engine-reported seed/deck hashes or Expanded format. Closed this with policy-option allowlist, ordered deck hashes and game seed/rules validation, explicit invalid-record statuses. Four extra synthetic adversarial tests. [Manual CI passed 38838767329](https://github.com/FlareZ123/experiment-01/actions/runs/38838767329). Report: `results/aichi-2026/agent19-fixed-plan-identity-gate.md`. Indexed and broadcast. Does not validate engine rule semantics or playing strength.

## Verified intervention 2: source-locked Snorlax opening risk

Compared exact published ranks 3 and 7 Stall source lists to champion, Hood v1, Temple v1 60-card lists. Solo Active Snorlax PGO 55 can be selected when drawn, and own Bench may be left empty, preventing Guzma's required opponent-Bench target while Block stops normal retreat. Tool Jammer on opposing Active potentially counteracts Stealthy Hood on trapped Active. Both stall lists have Tool Jammer; rank3 3 Snorlax among 11 Basics, rank7 2 among 12. Exact P(Snorlax in valid opening seven) **40.56560564876% / 27.36368957278%**. Only Hood v1 contains two Hoods; P(Hood opening in valid 7) **21.13990815981%** and P(both Hoods six-Prized | valid seven) **0.85841899681%**. These are resource events, not forced locks or win rates. Implemented source-backed exact model `scripts/aichi-snorlax-solo-block.cjs` and regressions `tests/aichi-snorlax-solo-block.test.cjs`; passed [manual CI 38839592103](https://github.com/FlareZ123/experiment-01/actions/runs/38839592103). Report `results/aichi-2026/snorlax-solo-block-counterplay.md`, indexed and broadcast.

## Next actions

1. Build actual pinned Twinleaf Store action-fixture for normal retreat of a trapped Basic under Snorlax Block with/without Hood and opponent Active Tool Jammer. Observe action legality and board transition, not only `CheckRetreatCostEffect`. Use research-owned `simulation/twinleaf/` fixture, no changes to vendor submodule, manual CI.
2. Audit whether a solo Block lead is compatible with the opponent's stronger turn-one plans and whether card/search lines enable Hood reliably. Preserve deterministic action traces. Ensure candidate and opponent policies can actually use conditional counterline; no win-rate claims.
3. Keep central `results/README.md` synthesis updated. Compare with other agents' work before duplicating.
4. The published 29-list Aichi field and pinned engine both have severe policy/semantics shortcomings, so the 99.5% target remains unsubstantiated.

## Conventions

Repository README forbids per-commit workflows. All CI manually dispatched. Normal agent lease expires only after 70 minutes from original claim, never refresh. At release, checkpoint memory/results/communications, push all; delete lease as **last** commit. Review broadcasts each checkpoint.

## Verified intervention 3: pinned Snorlax Block dual retreat semantics

Pinned source `Snorlax PGO` implements Block only on `RetreatEffect`. The pinned `RetreatStartAction`/ChoosePokemonPrompt path uses `RetreatStartEffect` and direct `retreatPokemon()`, skipping Snorlax's Block check. In real Store-dispatched test (Shadow Rider V Active + Latias ex SSP Bench with free retreat, solo Snorlax PGO opposite), no-Hood direct `RetreatAction` throws `BLOCKED_BY_EFFECT`, while unpatched interactive start **illegally retreats**. Hood-only direct/start both work; Hood + opposing Active Tool Jammer direct blocks but start bypasses. [Original 8-case manual CI 38840267279](https://github.com/FlareZ123/experiment-01/actions/runs/38840267279).

Reversible research-owned `simulation/twinleaf/snorlax-retreat-start-hook.cjs` temporarily reuses Snorlax's original `RetreatEffect` permission probe for `RetreatStartEffect`. [Corrected 16-case manual CI 38840589023](https://github.com/FlareZ123/experiment-01/actions/runs/38840589023) passed. `headless.runMatch({snorlaxRetreatStartCorrection:true})` adds `SnorlaxBlockStartGate-v1` provenance; three regression cases including headless default restoration passed [manual CI 38840797499](https://github.com/FlareZ123/experiment-01/actions/runs/38840797499). Fixed diagnostic runner accepts that explicit boolean through allowlist; benchmark stats [manual CI 38841215878](https://github.com/FlareZ123/experiment-01/actions/runs/38841215878) passed. Report `results/twinleaf/snorlax-retreat-start-bypass.md`; indexed, two broadcasts.

**Critical impact qualification** discovered after first alarm: pinned `ptcg-server/src/simple-bot/simple-tactics/retreat-tactic.ts` constructs direct `RetreatAction` only, so the interactive bug does **not by itself** contaminate default SimpleTacticsAi headless results. Pinned socket interface also exposes `RetreatStartAction`, and future policies using it need fix. I immediately corrected report/index and broadcast clarification. No win-rate inference from action tests.

## Additional next actions

1. Consider a broader survey of pinned cards that intercept `RetreatEffect` only and future bot policies using `RetreatStartAction`, but prioritize source-field relevant failure paths.
2. Do not overstate the Snorlax interactive bug's impact on existing default-bot diagnostics; their lack of qualification largely reflects bot competence.
3. Verify actual source-locked candidate matchup behavior with a policy-specific line that can perform the no-Bench Snorlax plan and defend against tool removal. Fixed-candidate statistics remain unproven.
