# Nine exact Regidrago ranks: permanent cuts needed to prepare Temple + Shadow Mist

A follow-up to the [rank13 tactical oracle](agent26-rank13-temple-attack-cut.md), not another candidate or policy. Uses unchanged rank 10/12/13/14/18/20/21/27/32 source inventories in blob `ae773f6201d7aa69d31914dbfee66f3fba692200`; 23/28 unknown. Candidate is unchanged Lockbridge. This is a source-envelope upper bound, not a natural-game claim.

## Result

For a prospective Regidrago with **one attached DDE and either one Grass or no Basic Energy**, established Temple, no recent KO, no additional pre-attached colored energy or other better prospective attacker, assume every non-Lost source counter potentially accessible and manual Basic available. If one Grass is already attached, an available Crispin plus manual attachment can pay GGF under Temple without removing it. If no colored Basic is attached, Crispin plus manual can supply only two colors, so this route is insufficient. A Raihan after KO or already paid second attacker invalidates this restricted model. One DDE plus one Basic is sufficient once Temple is removed. Direct removal comprises Megaton Blower, Marshadow Resetting Hole, Faba (and Field Blower if present; none of these nine uses it). Shadow Mist blocks Stadium and Special Energy played from hand; neither Megaton, Marshadow nor Faba is barred. Pokémon Ranger removes the attack effect on the player; it does **not** remove Temple. In ranks 18/32 Ranger plus an accessible Stadium restores the DDE route under Shadow Mist, spending the Supporter but not requiring Crispin. Sources: supplied printings swsh10-155, swsh6-74, sm8-94, sm10-81, sm8-173, xy11-104, sv8-182, sv7-133, xy6-97, swsh12-136; advanced rulebook I.B-03, I.C, II.C-19.

The table counts minimum *physical source cards* that must be permanently unavailable (e.g. Lost Zone) to guarantee next-turn Apex **funding denial against that optimistic source envelope**. For Shadow Mist they must already be unavailable; for Get Lost they may include that attack's two discard targets. This is not a claim that the cards are actually in discard or that the cuts can be accomplished.

| Rank | G+DDE: Mist prior cuts | G+DDE: Get Lost cuts | DDE only: Mist prior cuts | DDE only: Get Lost cuts | Minimum G+DDE Mist cut |
|---:|---:|---:|---:|---:|---|
| 10 | 3 | 4 | 2 | 3 | Crispin; Faba; Marshadow |
| 12 | 3 | 5 | 2 | 4 | Crispin; Marshadow; Megaton Blower |
| 13 | 2 | 4 | 1 | 3 | Crispin; Megaton Blower |
| 14 | 3 | 4 | 2 | 3 | Crispin; Marshadow; Megaton Blower |
| 18 | 2 | 4 | 2 | 4 | Marshadow; Pokémon Ranger |
| 20 | 3 | 5 | 2 | 4 | Crispin; Marshadow; Megaton Blower |
| 21 | 4 | 6 | 2 | 4 | 2 × Crispin; Marshadow; Megaton Blower |
| 27 | 2 | 4 | 1 | 3 | Crispin; Marshadow |
| 32 | 3 | 4 | 2 | 3 | Crispin; Megaton Blower; Pokémon Ranger |

**Three actionable consequences:**

1. With all counter copies potentially accessible, **no** one-turn Get Lost can cut the whole funding envelope in any of the nine ranks (minimum at least three). Do not claim a guaranteed lock simply because Temple plus Girafarig is in the deck.
2. Prior Get Lost can prepare a future Mist lock with two physical cuts for ranks 13, 18, 27 under G+DDE geometry. Rank18 is the unusual pair **Marshadow + Pokémon Ranger**; there is no Crispin in that source list. Removing all three Sky Field copies instead of Ranger is an alternative but more expensive. Rank21 has **two** Crispin, so one removed copy is not a permanent acceleration cut. Rank32 has Ranger but no Marshadow: if both source Stadiums already Lost, cutting Megaton+Crispin suffices even while Ranger is potentially accessible. Rank10 with Parallel City already Lost and DDE-only attacker can cut Faba+Marshadow; if one Grass is already attached, Crispin remains a third counter.
3. **Timing matters:** if a prior Get Lost is preparing Mist and an opposing Stadium remains available, normally preserve the singleton Temple in hand rather than expose it on that intervening turn. These fixed lists contain no Stadium recovery. Play Temple and use Mist on the later turn only if it is actually legal and still valuable; the opponent can attack or alter Energy geometry in between, and Dominating Echo may block the candidate Stadium play. Recompute against every reachable attacker and a direct-win option. No future lock guaranteed from the earlier cut.

The solution is deliberately conservative: unseen or un-Lost source counters treated reachable, recovery, bench/mobility, hand and Supporter constraints not jointly tested, so escape availability is an upper bound. A cut may be unnecessary if an actual route is known inaccessible (e.g. spent Legacy Star plus a discarded Megaton). No opponent exact-list knowledge is implied for a real actor: if rank unknown/not allowed by policy, use an appropriate uncertainty union or observed public constraints. No claim of overall matchup strength, no new worker, no native or game. Candidate and opponent owners can use the source-specific differences as decision challenges.

## Reproduce

[Executable enumerator and assertions](./agent26-regidrago-temple-minimum-cuts.cjs), [machine-readable output](./agent26-regidrago-temple-minimum-cuts.json). 20 assertion groups ran in isolated V8, not Node CLI or native engine. The script embeds just the relevant counts derived from the source blob; run `node results/aichi-2026/2026-11/agent26-regidrago-temple-minimum-cuts.cjs`. It enumerates physical copy subsets and minimizes total removed cards; identical copies deduplicated by count vector.
