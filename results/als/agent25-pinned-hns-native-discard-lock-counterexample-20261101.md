# Agent 25: pinned original-Store Hide 'n' Sneak discard-Ability lock counterexamples

**1 November 2026 | native 24-arm synthetic action matrix; simulator-fidelity finding, zero competitive games.**

## Result and provenance

The previously prepared [reversible research-side hook](../../simulation/twinleaf/agent25-hns-discard-ability-lock-paper-hook.cjs) and [actual Store action driver](../../simulation/twinleaf/agent25-hns-discard-native-counterexample.cjs) completed successfully in [manual native GitHub Actions run 41165143191](https://github.com/FlareZ123/experiment-01/actions/runs/41165143191). The run completed **2026-10-31 03:39:03 UTC**, at research commit `5be68599c6e77b95ad50a39f7134a0709516d3c1`, pinned upstream `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, with the official original Store compiled. The native attack step and archive-upload step both passed. Its 1,114-byte compressed artifact `agent25-hns-pinned-discard-lock-native` has artifact ID **13028622689** and GitHub-reported archive SHA-256 `2684058eb83bd1fcdb04998f58a6aa49e8b7aee185bb8e47ab0638f919c966e6`. The archive contains the 24-arm JSON emitted by the driver; its individual JSON entries have **not been independently downloaded and audited in this invocation**. The successful driver itself performs the assertions below on actual native `AttackAction` effects before exiting.

The driver builds **6 conditions × 2 true owner-seat indices × unmodified/corrected helper = 24 actual Store attacks**. Its Dhelmise is the genuine M5 printing, with one attached Psychic Energy; four HNS Pokémon are physically in its discard, and the opponent has a genuine printed lock source or no relevant lock. All games are **artificial midgame fixtures**, not naturally dealt matches with full original 60-card lists. It tests the exact engine branch and rule semantics, not the larger deck or decision policy.

## Native pass criteria met

| Fixture condition | Original pinned Store | Corrected hook | Conclusion |
| --- | --- | --- | --- |
| No lock; four Banette in discard | 170 Active damage | 170 | Noninterference reference |
| Active Wobbuffet PHF with 2 Psychic Banette + 2 Grass Sinistcha | Wobbuffet knocked out; 1 Prize | Wobbuffet survives; 0 Prizes | Original incorrectly counts Grass discarded Abilities |
| Active Wobbuffet with four Psychic Banette | Wobbuffet knocked out | Wobbuffet knocked out | Corrected helper retains Psychic exception |
| Silent Lab PRC with 2 Stage1 Banette + 2 Basic Shuppet | 170 Active damage | 30 | Original incorrectly counts Basic discarded Abilities |
| Silent Lab with four Stage1 Banette | 170 Active damage | 170 | Stage1 exception unaffected |
| Tool-equipped Garbodor BKP / Garbotoxin with four Banette | 170 Active damage | 30 | Original incorrectly counts all suppressed discarded Abilities |

**These are the driver's exact assertions under each of the two attacking seat indices; the native CI step passed every one.** For the Wobbuffet mixed case the actual KO/Prize consequence changes, making this an engine game-outcome risk, not merely a displayed numerical-damage discrepancy. The other cases validate damage values or KO behavior, not entire-match winners.

The rule is source-supported: Wobbuffet's *Bide Barricade* explicitly removes non-Psychic Pokémon Abilities in the discard; *Silent Lab* removes Basic Pokémon Abilities in the discard; Garbodor's *Garbotoxin* removes Pokémon Abilities from discard while an attached Tool activates the lock. The source card pool and the preceding [print-sensitive donor-screen report](agent25-dhelmise-post-aichi-lock-hardened-screen-20261031.md) preserve these exact conditions. The pinned `hide-n-sneak` helper otherwise counts printed named Abilities regardless of those ongoing locks.

The correction is **explicitly opt-in and reversible**, changes no vendor files, wraps Dhelmise, Sinistcha and Spiritomb attack reducers only during synchronous Store execution, and computes live discard donor eligibility using pinned `IS_ABILITY_BLOCKED`. The native matrix asserts helper/prototype restoration for every corrected arm. [Five pure hook regressions](../../tests/agent25-hns-discard-ability-lock-hook.test.cjs) independently test threshold effects, non-HNS actions and throw-path cleanup; all passed the same manual workflow. This is not certification of all combinations of multiple locks or every printed card state.

## Impact on deck search

The [fixed exploratory Dhelmise v2](agent25-dhelmise-mixed-lock-answers-v2.json) has six donors that remain Ability-bearing under Wobbuffet, six under Silent Lab, and none under active Garbotoxin. A simulator that overcounts donors can falsely score ordinary 170-damage attacks as legal threshold achievements and even register an incorrect Prize; future head-to-head experiments using the three HNS attackers must explicitly install or verify this paper-rule correction before reporting provisional terminals. The fix does **not** establish a playable first-turn ALS, beat the source lock decks, or qualify the post-Aichi deck as the fixed-60 winner.

**Benchmark status stays 29/32 authenticated original Aichi Top32 opponent 60s, missing final ranks 23/25/28; zero competitively qualified games; no evidenced 99.5% fixed deck.**

**Next falsification targets:** direct side-by-side native HNS interaction with two simultaneous lock effects, clearing a Garbotoxin Tool mid-turn with authentic Field Blower/Faba and then making a changed attack, and a complete original-60 source game with conserved physical card identities and actual opponent responses. Preserve pre/post-hook same-game random and player-policy equivalence checks. This report is based on a passing archived native assertion suite; raw artifact field-by-field independent audit remains open.
