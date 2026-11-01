# Agent 32: original rank-11 dead Call for Family now has a bounded shared-bot choice correction

**1 November 2026 | default-off policy improvement, research-side only | zero competitively qualified games.**

## Reproducible source and rule premise

The original ranked 11 Wataru Yano complete 60 in [the original field manifest](full-decklists.json) has **two Trubbish Fusion Strike 168**, printed as `Trubbish FST` in the pinned actor observation. The supplied independent `card-list.zip` `cards/en/swsh8.json` record `swsh8-168` has:

- **Call for Family:** one Darkness; searches the deck for one Basic Pokémon to put directly on the Bench.
- **Super Poison Breath:** one Darkness plus one Colorless; **20 damage**, then Poisons the opponent's Active Pokémon.

The supplied Advanced Player's Rulebook, **C-11** (page 31), says that when an attack would put Basic Pokémon directly onto an already-full Bench, it ends before searching. The source's paper rule is therefore a clear reason to avoid selecting Call for Family when no Bench slot exists, assuming a payable damaging alternative and no special overriding tactics.

[Agent 45's independent archived frozen-v2 original-source census](agent45-rank11-frozen-call-family-dead-attack-loop-20261101.md) found **34 settled original-rank11 full-Bench Call for Family attacks** whose source had enough printed Darkness Energy for Super Poison Breath and whose native Call for Family caused neither Bench change nor opponent damage. These are repeated events from only **two original physical game contexts** (17 each), not 34 independent matchup samples. Native Super Poison Breath legality and Poison settlement in those exact states remain unverified.

## Shared actor implementation

Changed the existing optional `chooseKnownDeadLeadingAttack` in [agent1-actor-dead-first-attack-frontier.cjs](../../simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs), preserving Agent1's Mega Absol Terminal Period and Girafarig Get Lost preferences. The new **source-printing-constrained** branch requires all of:

1. authenticated owner-root detached observation with exact Active printing `Trubbish FST`;
2. already-constructed payable attacks have **Call for Family** first and **Super Poison Breath with printed damage 20** available;
3. at least five publicly indexed Bench slots, with **every slot occupied** (also handles a full expanded eight-slot Bench);
4. opponent Active exists (the shared helper's original prerequisite).

It returns `Super Poison Breath` as an owner-visible choice. The common policy already uses this helper **only** under the separately controlled `knownDeadAttackRoot:true` option. **The frozen v1 and v2 bilateral profiles did not enable it and are unchanged.** The native Store still determines live attack legality and effects; this helper does not manufacture damage or skip prompts. If any predicate is unverified, the original attack ordering remains.

## Tests and provenance

- Change commits: helper **ec872b593b4c2418dad29cb7ccf3db81de854ce8**, inherited helper version-assertion **565bad777ae7bbe475364e8c3f8cdae72a0ece4c**, new focused test **636723d3b9b7746f4458471c83ab084b7a5a4b29**, shared-root integration test **953ff9203b34c99a96ddbf61d230a4c8f396f592**.
- [Six focused regressions](../../tests/agent32-trubbish-full-bench-choice.test.cjs) test the source roster print, full five-slot choice, full eight-slot choice, open-Bench veto, unpayable/wrong-print/changed-damage veto, opponent hidden-hand invariance and the **actual common `chooseActorRootIntent` default-off/on preference**.
- **6/6 tests passed** in an independently evaluated GitHub-fetched-source JavaScript module harness on 1 November. The harness replaced imported third-party Node modules with narrowly scoped doubles (the core source and test bodies were read back from GitHub), so this is **pure selector validation only**, not Node22 CI or pinned native Store validation.
- Updated the **existing manual-only** `.github/workflows/aichi-benchmark-stats.yml` to run both the original Agent1 selector tests and the new six tests. Attempted manual dispatch twice, by workflow name and numeric ID, but the Actions interface returned `Workflow does not have 'workflow_dispatch' trigger` even though the current checked-in YAML declares one. **Resolved:** an ensuing manual dispatch with an explicit `rank11_source_census=false` input succeeded. [GitHub Actions run 41332569686](https://github.com/FlareZ123/experiment-01/actions/runs/41332569686) at tested head `18ed2ed6520407356a4cb1271f5068d46cb9abae` finished **SUCCESS**, with the explicit `Regress original rank11 fully occupied Bench dead attack response (default-off)` job step **SUCCESS** (the original Agent1 and six new Agent32 Node tests). This is actual compiled Node22 CI for the shared pure root; **a genuine native Store attack fork remains unexecuted**.

## Qualification and specific next mechanical experiment

The most valuable next control uses an **unchanged original source physical deal** from [Agent41 frozen v2](agent41-frozen-bilateral-v2-32-original-source-energy-20261101.md), retaining the real rank11 Trubbish, two Darkness Energy, full Bench and opposing state. Run the **same immutable pre-attack physical Store** under the original Call for Family and the default-off/on owner actor preference. Preserve the actual `AttackAction`, optional native prompts, poison status, health/Bench changes, subsequent opponent root, and any native rejection. The two source games containing the 34 old opportunities are **retrospectively selected development witnesses** and may demonstrate effect and competence, but cannot enter a fresh competitive win-rate denominator. Ensure the paper-prompt portfolio independently validates all resolved prompt replies before an outcome is promoted.

The user objective remains **one fixed legal 60 across 32 originals**. Known opponent exact 60s: **29/32** (missing ranks 23/25/28). Qualifying finished competitive games: **0**. No demonstrated **99.5%** deck.
