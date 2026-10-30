# Agent 8: physical target parity and rank-6 denial contention boundary

**30 October 2026 | normal research mode | source-backed, qualification-limited maintenance and policy diagnostics.** This report is about the trustworthiness of existing native decision evidence and diagnostic coverage. It adds no opponent list, native game-win sample, or new competitive candidate.

## 1. What the physical target comparator can actually claim

The existing `simulation/twinleaf/native-accepted-target-sidecar.cjs` had two overstatements in its `firstPhysicalTargetDifference` comparator:

1. **Empty sidecars were vacuously classed as matched** (`same-observed-targets`, `observed:0`). Equal empty traces cannot prove the physical actions of two games match. Now two empty sidecars produce `target-unobserved: no-target-bearing-root-events`, including when the observer authenticated the zero-event root ledger.
2. **Different private owner hand indices were treated as physically different root choices**, even when the same exact printing was played to the same target and had identical publicly observed consequences. A hand index is an ephemeral location in an owner's concealed hand. It remains preserved in each full archival sidecar event and SHA but is excluded from the comparison's physical projection. The projection still compares exact `ownerHandPrinting`, `target`, root ordinal when authenticated, turn, seat, Store acceptance, public board changes, and Retreat recipient.

The existing record schema remains `actual-store-declared-target-sidecar-v1`. Historical raw sidecar SHA calculation and archived receipts are unmodified. No unseen deck/Prize/opponent hand identity is introduced into actor decisions. New unit tests cover empty authenticated/non-authenticated evidence, same-printing alternate hand indices, and a genuinely different card printing.

**Limit:** an accepted target and immediate public board delta are narrower than complete paper-rule resolution, hidden prompt-target resolution, or a game-strength finding. Even when the comparator reports `same-observed-targets`, it explicitly means *observed target-bearing PlayCard/Retreat roots only*. Different hand indices can also accompany different hand compositions or hidden future resources; the comparator deliberately does not certify those.

Code commits: [source comparator correction](https://github.com/FlareZ123/experiment-01/commit/c8ab7f0b0fe8ffc5758c58fddf409ad0d0d90b7f), [two new regressions](https://github.com/FlareZ123/experiment-01/commit/b60678272632bb29d27e2130c025e440b42495a7). Existing manual compiled/native workflow: [run 40989476035](https://github.com/FlareZ123/experiment-01/actions/runs/40989476035), **PASS** for the dedicated target-sidecar pure test step, engine compile, native Energy prompt receipt, canonical v2 both-seat replay and accepted-root hash comparison; **overall workflow FAIL** on a later, unrelated rank-11 source-only Supporter script's frozen source SHA guard. Its `simulation/evaluation/agent41-bilateral-v2-development.cjs` hash was `4d1487532bcb8b4e1a36fb3c481c87ec7b47d28d`, versus expected `64ad19f6b33be8c760a6ea526e6cfd3bd43f56c0`. The broader job is therefore **not** green and its last experiment should not be reused as a result.

## 2. Denial was missing from the decision-contention *vocabulary*

The shared `agent34-actor-only-root-policy.cjs` already contains an opt-in, owner-visible `teamFlareGruntDenialRoot` branch that can select `play-team-flare-grunt-denial` late in its first-return ordering. The `agent16-owner-priority-contention.cjs` diagnostic previously did **not** enumerate that late alternative. Thus an earlier payable attack or Supporter could conceal this **potential** rank-6 opponent Energy-denial option from the diagnostic record.

Updated the diagnostic's frozen priority map and probe table to include the existing `chooseTeamFlareGruntDenial` selector at order 19, with Pass moved to 20. Added the selected-kind to its Supporter-quota category. Bumped the audit version to `agent16-owner-priority-contention-census-v2-team-flare-grunt` so comparable cohorts cannot accidentally mix old and new diagnostic vocabularies.

A new pure regression verifies that a synthetic owner-visible rank-6 Iron Thorns hand holding printed `Team Flare Grunt XY`, while the opponent's Active has an attached Energy, produces a **candidate opportunity** behind an attack with reason `turn-ending-selection`, or behind a different Supporter with reason `same-turn-supporter-quota`. Removing the opposing Active Energy removes the opportunity. Mutating injected opponent-private information leaves the proposed diagnostic unchanged.

**These are conditional static-selector witnesses, not proof of an actual original-field hand exposure, native printed legality, a resolved discard, or an opponent response.** The code explicitly labels offers `nativePlayability:unverified`; the core first-return policy is unchanged. The test does not assert that Team Flare Grunt should outrank an available winning attack.

Code commits: [denial diagnostic](https://github.com/FlareZ123/experiment-01/commit/604d43639c71df40a60b3e215b45eee2b29f8a35), [synthetic owner-only regression](https://github.com/FlareZ123/experiment-01/commit/0822b75166f2fbb56c89c196660b8d2abb94ec2d), [version bump](https://github.com/FlareZ123/experiment-01/commit/93adde90f6b8e356e71cf0e213bc727aed78dc43). Existing manually dispatched compiled/native test workflow: [run 40989893604](https://github.com/FlareZ123/experiment-01/actions/runs/40989893604), **overall PASS** (existing actor policy and pinned/native tests), including the newly added contention regression.

## 3. Route into the one canonical two-player policy

The canonical integration owner is Agent 41; this work does **not** fork `simulation/evaluation/agent41-bilateral-v2-development.cjs`, introduce new workflows, or change policy defaults. Its concrete acceptance dependency is an **actual source-owned rank-6 first-return contention** with the opportunity receipt at the same owner root, native selected `PlayCardAction`, printed Energy discard, an opponent continuation, and later source turn. The chooser must retain the attack/Supporter hold alternative and both original printed 60s. A separate hidden-state invariance check is necessary before any general policy or competitive qualification.

A second acceptance dependency is comparator honesty: an archive lacking target-bearing Store roots must be recorded as **unobserved** even if both root-label ledgers or empty sidecars match; when there are target-bearing roots, match physical card printings and targets independently of an owner's transient hand position, while separately checking physical deal provenance.

**Field status stays 29/32 exact original printed 60s, missing ranks 23/25/28; zero competitively qualified games, no demonstrated fixed 60, and no demonstrated 99.5% win rate.**
