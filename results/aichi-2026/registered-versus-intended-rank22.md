# Rank 22: registered Wally versus intended Hisuian Heavy Ball

**Agent 3, 16 October 2026.** Source-provenance correction and adversarial benchmark hygiene. This is not a discovered deck or a win-rate estimate.

## Source comparison

The [published CL Aichi Open League list](https://limitlesstcg.com/tournaments/566/decklists) for **rank 22, Haruya Mori, Absol Garbodor** explicitly contains **1 Wally**, **0 Hisuian Heavy Ball**, and **2 Vikavolt V** in a 60-card deck. The source-printing-aware archive at [full-decklists.json](full-decklists.json) agrees: Wally `ROS 94` and no Hisuian Heavy Ball.

The [Japanese Top-32 tournament compilation](https://pokekameshi.com/cl2026aichidec-extra/2/) attributes a **Mega Absol / Vikavolt** entrant to the handle `@FcDqc22454` (`airbird`). The quoted player post explicitly says: `デッキ登録ミスってヒスイのヘビーボールがミツルになっちゃってます` (a deck-registration mistake turned Hisuian Heavy Ball into Wally). The compilation links the original post, but we do not infer a new tweet identifier. The compilation and rank-22 Vikavolt inventory provide a strong deck-level match, although the public handle was not independently authenticated against the romanized official-name record.

This establishes a meaningful difference between the **published registered list** and the player's **self-reported intended card choice**. The latter is an unverified one-card counterfactual, never a second sourced tournament registration.

## Benchmark contract

1. **Actual field opponent:** Keep rank 22's published Wally unchanged. A benchmark claiming to play the 2026 registered Top 32 should use the exact archived rank-22 60.
2. **Exploratory sensitivity only:** A hypothetical `-1 Wally, +1 Hisuian Heavy Ball` variant may be evaluated with its own distinct deck hash, explicit `hypothetical_intended` identity, and clear reporting separate from the published field.
3. **Do not silently correct registration errors.** Wally consumes the Supporter action and concerns evolution access; Hisuian Heavy Ball concerns Prize recovery. The trade-off is strategically state-dependent, and this source note does not prove the intended swap increases strength.
4. **Name collision control:** Rank 8 also has **1 Wally**, but it *also* has **1 Hisuian Heavy Ball**. The rank-22 discrepancy must not be applied to rank 8 merely because both decks use Absol/Garbodor.

The repository's current full field still contains only 29 published exact lists, with ranks 23, 25 and 28 unresolved. This correction changes neither coverage nor current nomination.

## Verification

The source-lock regression `tests/aichi-registration-fidelity.test.cjs` validates rank-22 and rank-8 source entries and all 29 published 60-card totals. It is added to the existing manually dispatched `aichi-deck-ingest.yml` workflow to avoid commit-triggered CI expenditure. Test success establishes snapshot integrity, not the player's unobservable physical registration process or matchup outcomes.
