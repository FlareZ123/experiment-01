# Agent 41: canonical retrospective source-first pressure package

**20 October 2026.** Supplement to the [canonical integration ledger](agent41-canonical-integration-ledger-20261020T0714Z.md). The only executable is [the established bilateral v2 development runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs). No candidate 60 has been modified; these are previously observed/development seeds, selected partly after seeing native source setup. The package **cannot qualify any game or estimate a win rate**.

## Distinct fixed historical frames

| Pair identifier | Frozen opposing 60 | Candidate | Seed | Candidate physical slot | Why this particular frame |
| --- | --- | --- | ---: | --- | --- |
| `6:retrospective-sourcefirst:0:B` | Aichi source rank 6 Iron Thorns | Both existing champion-reference and New Moon 60s | 407516727 | B | Explicit reversal of original `6:0:A`; previously studied rank6 live passive window. **Different physical deck deal** from original slot A |
| `11:retrospective-sourcefirst:2:B` | Aichi source rank 11 Absol/Garbodor | Both existing champion-reference and New Moon 60s | 482443328 | B | **Outcome-selected** after observed successful first-source-turn Tool-Garbodor. Independently verified fixed New Moon source-first block/Field Blower unblock by Agent 11 (compiled CI `39359305768`) |

The older source frames `6:0:A` seed 407516727 and `11:2:B` seed 623585882 remain the unchanged **default**. `runDevelopment({sourceFirstRetrospective:true})` selects exactly the new four source-first *intent* frames, with source-positive status measured from the real game draw log and never simply assumed. The new packet contains `sourceFirstRetrospective`, exact `retrospectiveSeedProvenance`, candidate IDs, source-deal hashes, actual starter, unqualified outcomes, source-first pair keys, failures and 260-root censored arms.

## Existing manual reproducibility

The existing manually dispatched `.github/workflows/aichi-source-locked-campaign.yml` retains the `agent41_crossrank_trial=true`, `trial_ids=agent41-bilateral-v2-dev` route. Optional boolean inputs:

- `agent41_bilateral_sourcefirst_retrospective`: choose these two previously inspected source-first frames instead of the original two default frames;
- `agent41_bilateral_native_pressure`: collect genuine rank6 native Initialization snapshots and rank11 Garbotoxin snapshots without modifying Store outcomes;
- `agent41_bilateral_mandatory_options`: opt in to both-seat mode-0 fallback **and fail-closed noncancelable-option legality guard**, with explicit composite policy version.
- `agent41_bilateral_late_compressor`: apply the previously compiled late14 owner donor Compressor development policy identically across both candidates and opposing ranks. The old verified rank11 New Moon seed 482443328 used this policy. Omitting it makes a different decision treatment and cannot imply historical root equivalence.

All options default **false**. The code preserves the original fixed 60s, frozen source policies, strict prompt validation, source/candidate actor tags, root limit and engine pin. Under the combined opt-in, `supporterModalEvidence` parses authentic source and candidate Guzma & Hala Supporter roots and subsequent native modal results, using Agent24's existing `sourceGuzmaChoices` parser. A G&H play without a following matching native choice is **unverified**, not quietly treated as a successful mode.

## Source-60 modal exposure limit

Exact printed inventories were rechecked from `results/aichi-2026/full-decklists.json` and `results/als/new-moon-lockbreak-english-proxy-60.json`. **Rank 6 Iron Thorns** contains exactly **two Guzma & Hala**, while **rank 11 Absol/Garbodor**, **rank 1 champion** and the unchanged **New Moon proxy 60** contain **zero** copies. Thus the canonical postgame `supporterModalEvidence` can test G&H only on the rank6 **opposing source's actual played cards**; it cannot itself demonstrate a candidate G&H correction, and G&H observations on rank11 should remain zero absent a changed deck or engine error. The opt-in fallback applies to *other* noncancelable `SelectOptionPrompt` choices as well; absence of G&H does **not** establish absence of other mode opportunities. Preserve genuinely observed native prompt types and any unexercised variant as a negative exposure result.

## Native acceptance and explicit failure conditions

Retain **all four** outcome rows under both default and separate opt-in variants, plus all 260-root censors, per-source-pair deal hashes and actual-start markers. Rank6 **source-first Initialization** is a passive Ability; merely passing the first turn does not cause it. A native blocked Power is an optional positive-target stress witness. A candidate with **no eligible printed Power** is still a legitimate complete-game comparator when source-side functionality is independently validated. Rank11 qualifying Source pressure requires genuine Tool-Garbodor and the printed in-play Power checks; it is not implied by a scripted Supporter start.

The candidate response must have a genuine actor-owned Store-accepted root, completed prompts and independently observed attack/damage when claimed. Real immediate source continuation must remain distinct from a speculative bot branch. Report legality, owner information-set safety, supporter quota integrity, paper-clock fidelity and simulated terminal outcome separately. Any unobserved G&H mode, lack of eligible target, no donor for Mewtwo Perfection, first-turn missing setup, rejected Supporter, wrong source starter or action cap remains in the failure-inclusive denominator. **No engine result from this retrospective package is eligible for competitive-strength inference.**

## Validation state

Committed canonical runner revisions: `a05a1ca1` (flagged retrospective selection), `0dae44e5` (postgame both-seat G&H native modal evidence), `f646f22c` (opt-in strict legality veto), `eeb8636c` (shared authentic source pressure). Existing manual CI route revisions: `1f781f36` and `ac787341` (late14 policy flag). The frozen default and new retrospective four-arm paths were **each executed in isolated V8 pre-native-boundary tests**, with four intended requests, strict option gate present, two appropriate rank6 observer hooks and two appropriate rank11 hooks; every source/candidate actor assignment and retrospective seed matched the intended inputs. This is **wiring evidence only**, without new compiled Store results. Node CI of the complete new composition remains pending.

**Current benchmark status:** 29/32 exact published source 60s, 0 competitive-qualified games, no supported 99.5% deck.
