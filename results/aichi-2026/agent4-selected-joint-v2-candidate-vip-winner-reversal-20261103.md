# Selected symmetric joint-v2: same-deal candidate VIP converts one native candidate win into a loss

**Agent 4 | 3 November 2026 | retrospective read of a previously registered native cohort.** This independent trace audit reads [Agent23's complete 52-attempt compiled archive](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876/artifacts/13206810193), [reported original experiment](agent23-selected-joint-v2-symmetric-vip-52-native-20261103.md), and the frozen [selected policy manifest](../../simulation/evaluation/agent23-selected-joint-v2-manifest.json). No new random sample, paper-qualified game, or fresh native run was produced. Source revision `9182f48c12c26d1fa966c8a504541b6faef83f9a`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, archive ZIP SHA256 `9f4b1d249a7d46d5f3f352e651b7400d83fcb3711cfe37af6d9cd3337fe84b73`, inner JSON size 70,653,701 bytes.

## Unchanged physical deal and first divergence

The exact registered context is `5:300:A:new-moon-lockbreaker-v1`, source original Aichi rank 5 (Mew/Genesect) **physical seat 1**, candidate frozen New Moon Lockbreaker 60 **physical seat 0**, seed `1399343237`. The two modes have the **same original-source fingerprint** `aa516b0864934cd1a33c9bf2a1b381a15b2416d9961f52b6c5d29aaaa39eb725`, **same entire physical-deal fingerprint** `ad377e2ed3ff1cde6b2ab1ca497f1860877f236ab5742881740d06bdac06bd8c`, matching source/candidate deck digests, and the same **actual first-player seat 1**.

The initial mainline actions match through **root ordinals 0–10**. At root ordinal **11**, global turn **2**, the **candidate** acts:

| Frozen joint-v1 baseline | Selected joint-v2 |
| --- | --- |
| `PassTurnAction` from candidate seat 0 | `PlayCardAction Battle VIP Pass` from candidate seat 0 |
| No Bench search at that root | Real owner-deck `ChooseCardsPrompt` selected **Duskull VIV** and **Galarian Articuno V CRE**, recorded at native prompt ordinal 12 |

The selected profile toggled the **same** owner-only VIP-after-otherwise-Pass addition for both actors; no candidate-specific advantage was intentionally built into the policy. The original rank-5 **source itself played zero VIP in either mode in this context**. Thus the candidate's first-turn search is the first observed treatment-caused decision difference. Subsequent paths reflect the simulator and the coupled decisions of both players; this is a single deterministic same-deal contrast, rather than an isolated measured card-level treatment effect.

## Opposing outcome and the changed attack line

| Native observation | Frozen v1 | Selected v2 |
| --- | ---: | ---: |
| Candidate native attacks settled | 8 | 6 |
| Source native `Cross Fusion Strike` attacks settled | 5 | 7 |
| Source copied Genesect `Techno Blast` choices confirmed | 2 | 4 |
| Candidate attack on global turn 22 | `Psyray` via Active **Galarian Articuno V** | `Future Sight` via Active **Duskull** |
| Candidate attack on global turn 26 | `Psyray` via Active **Galarian Articuno V** | `Joust` via Active **Klefki** |
| Final native remaining Prizes, `[candidate seat0, source seat1]` | `[0, 2]` | `[6, 0]` |
| Native engine terminal winner | **Candidate seat 0** | **Original source seat 1** |
| Terminal native action count | 140 | 139 |

In the baseline, candidate `Psyray` at global turns **22, 24, 26, 28, 30** includes observed native Prize decreases at turns **22, 26 and 30**, ending with all six candidate Prizes taken. In selected v2, the candidate's later sequence is **two Future Sight** (turns 22 and 24) and **two Joust** (turns 26 and 28); its remaining Prize count stays **6**, and source `Cross Fusion Strike` settlements eventually exhaust the original source's six Prizes at global turn **29**. This supplies an actual trace-level candidate-offense failure, although the complete reason the bot never deployed its already-Benched Articuno as an attacker in that treatment trajectory remains a question for a targeted decision-root audit.

**Decision implication:** an unconditionally selected first-turn VIP-after-Pass action can be *nonmonotone* for the very candidate it helps set up. The observed improvement in source attack counts in this selected mode is insufficient to infer increased candidate strength, because the symmetric intervention also changes the candidate's Bench and subsequent attacker allocation. Treat this candidate-native-winner reversal as a **release-level adversarial regression** demanding actor-root/prompt/attack/KO follow-through, rather than declaring VIP broadly beneficial based on 12 source uses and more copied attacks.

## Additional all-52 denominator audit and an existing report correction

Reading `modes[*].native.rows[*].endReason` directly from the original untouched 70.65 MB artifact yields:

| Disposition | Frozen joint-v1 control | Selected joint-v2 |
| --- | ---: | ---: |
| `engine-game-end` | **11** | **16** |
| `action-limit` | **14** | **9** |
| `engine-error` with no final end reason | **1** | **1** |
| Attempted total | **26** | **26** |

The original Agent23 report's sentence saying *baseline 11 action caps, 14 engine terminals* has these **baseline counts transposed**. Its selected counts and main trace findings remain supported. All **25 contexts with both native receipts** match their full original source physical-deal/starter fingerprints; the additional rank6 champion context aborts identically in both arms with `UNKNOWN_POWER` at action 43, leaving physical-deal equality **uncaptured**, not proven false. Of the 25 evaluable paired contexts, **13** have a changed full root action ledger and all 13 first divergences replace a baseline `PassTurnAction` with selected `Battle VIP Pass` on the corresponding real actor seat. A separate original rank11/New Moon case `11:300:B:new-moon-lockbreaker-v1` has one **candidate-owned** first-turn VIP, source settled attacks **19 → 10**, source original **Claw of Darkness 4 → 0**, both action-capped; this independent counterexample was already discussed in Agent23's report and is retained here for context.

**Secret Box audit boundary:** neither mode's 26 original native root ledgers contains a `PlayCardAction` with source printing `Secret Box`. The separately verified Twinleaf error accepting paper-forbidden two-Item Secret Box searches is a **live future release gate**, but there is **no actual observed Secret Box root in this 52-attempt archive** to blame for this VIP winner reversal. See [the separate exact printed-category bug report](agent4-secretbox-paid-two-items-native-paper-invalid-20261103.md).

## Reproduction and qualification

The raw archive member is `agent23-selected-joint-v2-native-52arm.json`. Read `modes[0].native.rows` and `modes[1].native.rows` in registered row order, locate `trial.id === '5:300:A:new-moon-lockbreaker-v1'`, compare `fullPhysicalDealFingerprint`, `sourceDealFingerprint`, `actualStarterSeat`, `rootActionLedger`, `nativePromptChoices.events`, `candidateAttackSettlement.attacks`, `sourceAttackSettlement.attacks`, `winner`, `finalPrizes` and `endReason`. Count dispositions using the native rows' `endReason`, preserving the exception as a separate `status:'engine-error'` record. This is sufficient to independently reconstruct every numerical claim above from the immutable original artifact.

These are **native simulated observations**. The bot's long-turn behavior, Paper Expanded hidden-zone correctness, all paper attack and prompt mechanics, the official 25-minute match clock, opponent competence, and entire-field coverage remain unqualified. The original 2026 Top32 benchmark has **29/32** exact printed source 60s and missing original ranks **23,25,28**. There are **zero competitively qualified games** and no demonstrated 99.5% win rate.
