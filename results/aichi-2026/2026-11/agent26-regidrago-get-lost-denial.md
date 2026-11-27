# Girafarig's two-card denial bandwidth versus the nine authenticated Regidrago lists

**Conditional tactical finding, not a game, policy release, or matchup estimate.** Extends Agent26's [rank13 extra-turn planner](agent26-rank13-extra-turn-prize-planner.md) to the actual Koraidon ex, Hisuian Goodra VSTAR and Mega Dragonite ex attacks found in the original source field. Uses nine authenticated Regidrago inventories (10,12,13,14,18,20,21,27,32) from exact field blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. Ranks 23 and 28 are labeled Regidrago but have no exact source 60; they are not simulated or inferred. Every authenticated Regidrago list has Dialga-GX, Kyurem and Dragapult ex, and at least one Muscle Band; ranks 12/27 contain two Dialga copies. 
   
## Constructed counterplay question

Candidate has just used Girafarig LOT 94's Get Lost. The source needs **3 Prizes**, has a paid 280-HP Apex attacker, Band live, unused GX, real access to **one** Guzma plus a proven own-switch return to paid Apex in either turn, and no other modifiers. Its currently visible payloads are all relevant physical copies except one Regidrago V reserved beneath the Active VSTAR. Candidate's post-attack board is Girafarig 90 Active, Mimikyu 70, Marshadow 80, full Shadow Rider VMAX 320, Latias ex 210. This is a deliberately adverse, legal-inventory board, not a measured frequency. Consider a trimmed version with Marshadow never benched. In Lockbridge, replace Marshadow with the 110-HP Wobbuffet; its Trifrost vulnerability is identical at this threshold. Get Lost chooses exactly two physical cards from visible opponent discard (or all available if fewer); two Dialga copies are distinct cards even if the printing is identical.

The solver enumerates distinct physical-printing pairs, then computes the maximum single-attack or adverse-promotion two-turn Prize conversion from remaining visible payloads. Separately it grants all surviving source payloads as a pessimistic redeployment envelope (excluding known Lost and reserved copies), not a claim they can all actually be recovered in one turn. In the main matrix all eligible payloads are already visible, so the two agree.

| Original rank | Distinct two-card removals | Prevent a 3-Prize finish with three smalls | Prevent it after omitting Marshadow |
|---:|---:|---:|---:|
| 10 | 16 | 1 | 5 |
| 12 | 17 | 0 | 1 |
| 13 | 16 | 0 | 1 |
| 14 | 22 | 0 | 1 |
| 18 | 16 | 1 | 5 |
| 20 | 16 | 0 | 1 |
| 21 | 22 | 1 | 6 |
| 27 | 17 | 0 | 1 |
| 32 | 22 | 0 | 1 |

**Six of nine exact lists have no two-card answer on the overbenched geometry. All nine have a safe pair on the trimmed geometry.** This is not a percentage win rate: the same constructed conditional board is used across all ranks. The failure is a cut-set problem, not a failure to recognize individual cards.

- For ranks 13/14/20/32, Kyurem can take three small one-Prizers in one attack; Salamence's Dragon Impact with Muscle Band (320) or Mega Dragonite's Ryuno Glide (330 even without Band) can take the full VMAX with gust; Dialga can take Girafarig and get an extra turn, where a remaining 200+ damage payload plus Band can KO Latias. Two-card removal cannot hit all independent payoff routes. On the trimmed board, **Dialga + Salamence** (rank13) or **Dialga + Mega Dragonite** (ranks14/20/32) is a safe pair in this model.
- Ranks 12/27 have two physical Dialga copies, consuming both Get Lost targets if permanent Timeless denial is needed. With three smalls, this leaves Kyurem. Removing Kyurem plus one Dialga leaves the second Timeless and other attacks. With only two smalls, removing both Dialga prevents the modeled immediate three-Prize finish. In a separate partial-discard test, removing visible Dialga+Kyurem is currently safe, but the surviving second Dialga reopens the route under the full-payload envelope. Do not interpret current discard access as permanent denial.
- Ranks 10/18/21 have no modeled full-HP VMAX one-hit attack with Band on the stated full-HP Regidrago, so Dialga+Kyurem can prevent the immediate three-Prize finish even on three smalls.
- No real gust, Band removed (rank13 exact 320 threshold), or Dialga already Lost are material control states. The solver confirms these change the set of safe pairs; they are not universally interchangeable.

## Actual candidate decision family

When Girafarig is a planned response, evaluate the **post-attack board**, not just the value of two discarded Dragons. If a paid Apex and the source's surviving payloads threaten terminal Prize conversion, avoid unnecessary third 110-or-less one-Prize bodies. For Lockbridge, Wobbuffet is a useful lock option, not a free Bench occupant; if it is actually blocking the required pivot/attachment, the externally established mobility/payment conditions should change. No blanket veto on Wobbuffet, Marshadow or Girafarig follows. The candidate should compare bench economy, removal options and the actual turn cost of Get Lost against other available lines. This also gives a specific opponent-policy challenge: find the surviving finish after any legal two-card denial.

The result supports conditional **bench allocation and paired Lost Zone selection**, not a deck change. Neither Hood nor Lockbridge is nominated. Share with candidate-policy owners; no competing worker integration, new CI, native game, frozen registration, or owner-gate change.

## Reproduction and limits

`node results/aichi-2026/2026-11/agent26-regidrago-get-lost-denial.test.cjs`. This invocation executed 39 new direct checks plus 29 previous model assertions in isolated V8 (not actual Node CLI/native). [Model](agent26-regidrago-get-lost-denial.cjs), [tests](agent26-regidrago-get-lost-denial.test.cjs), [machine-readable matrix and examples](agent26-regidrago-get-lost-denial.json). Source attack extensions use the supplied card DB: Kaiser Tackle 280 and 60 self damage, Retribution Strike 20 plus attacker damage, Rolling Iron 200 and future defense, Ryuno Glide 330 and discard 2 Energy. The model requires known attacker damage ≤210 when Koraidon is available to exclude self-KO/simultaneous-win ambiguity. It ignores nonterminal lock/defense/energy-loss value, draw or newly acquired cards, opponent turns, additional abilities, unknown card access, and unmodeled modifiers. It is conditional on the source actually being able to pay and attack twice and to execute the stated Guzma geometry. Trifrost and other targeting options are paper calculations, not native prompt receipts. Phantom Dive's complete prompt remains unsupported in the current rank13 worker. 
   
Benchmark status unchanged: 29/32 exact originals, missing 23/25/28, zero competitive matchups, no selected fixed 60.
