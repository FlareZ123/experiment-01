# Agent 9: rank-24 three-abort Thunder Mountain Prize audit

19 October 2026 UTC. Follow-up to [the fixed 24-deal prospective archive](rank24-prospective-policy-archive-audit.md). This is a **source-opening mechanical and policy-failure audit**, not a matchup win-rate estimate.

## Reproduction and noninterference

- Earlier manual [CI 39226832244](https://github.com/FlareZ123/experiment-01/actions/runs/39226832244), code head `d8391c85a5a41de8f27aa89b78e637665a29291a`, artifact ID `12175565379`, ZIP SHA-256 `8ec7672fc354e6ae07255e9bf6b4e4e8e904a3c16b8e622197a5bda1ead0ef1c`, JSON SHA-256 `1c8e3c787f4c14a7ca04020ae2ab9d313019f289b9db3b7be99042da391f89fd`.
- Replayed **the exact same 24 precommitted seeds** with analyst-only Thunder Mountain zones in manual [CI 39293274950](https://github.com/FlareZ123/experiment-01/actions/runs/39293274950), code head `7089e4338826f6174aa165530185cfac29e16ffe`, artifact ID `12207201333`, ZIP SHA-256 `4adbf3d04a6eeff9fa827df9aba66d83dd4d534206fed8415939c2717876605f`, JSON SHA-256 `e43bb726e5e936829fe765515ce10d7755af2e49a084ad3a2ae697594c0ada9a`. Engine pin in both: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Independently loaded both original JSONs from Actions ZIPs with Python. Deep equality held for every field of all **24 seed records / 72 arms** after removing the changed top-level `researchRevision` and only the three newly added `sourceVisibleOpening` booleans: `thunderMountainInitiallyPrized`, `thunderMountainInitiallyHeld`, `thunderMountainInStadium`. `summary` was exactly identical. This provides a concrete noninterference check, not a proof of engine correctness.
- The new booleans are obtained from the original source-opening observer after planning. They are **privileged analyst data** and cannot be inputs to a realistic K0 player policy. The native source player's actual search is the moment when its remaining deck can legitimately reveal missing targets. See `simulation/twinleaf/rank24-thorns-three-arm-prospective.cjs` and `rank6-broad-thorns-policy.cjs`.

## Exact findings

The source rank-24 60 contains **one** Thunder Mountain ♢ (LOT 191); this was checked in `results/aichi-2026/full-decklists.json`. The source played **second in 15 of 24 seeds**. In each of the protected25 and broad32 policies, the special early attack sequence began in **8/15** source-second deals. Both variants had **5 recorded turn-2 Volt Cyclone attack declarations** and **3 policy search aborts**. The profiles remained identical in every archived field.

All **three** aborting seeds are:

| Seed | Thunder Mountain in Prizes | DCE in deck at observed opening | G&H need | Result |
| --- | --- | --- | --- | --- |
| `1150814608` | yes | 3 | Stadium + DCE | Prompted search aborted |
| `2966203069` | yes | 2 (1 held) | Stadium only | Prompted search aborted |
| `3364644363` | yes | 3 | Stadium + DCE | Prompted search aborted |

The five executed attack seeds `2738504777`, `3392296998`, `1245565188`, `672333298`, and `2804067880` all had Thunder Mountain **outside** the initial Prizes and search succeeded. The seven other source-second deals did not trigger this protected/broad first-turn policy; two of those seven had Thunder Mountain Prized. See the complete [24-seed compact ledger](rank24-thunder-prize-abort-ledger.csv), which intentionally retains every dormant seed.

### Mechanism and interpretation

The policy's `phase==='search'` branch requires every planned `Thunder Mountain Prism Star` and `Double Colorless Energy` target to exist in `p.deck.cards`; when any target is absent it records `G&H prompted search could not retrieve planned targets` and delegates control to the generic bot. As the single Stadium was physically Prized in all three aborted states, its search target was absent. The two required-DCE aborted deals still had three DCE available in deck, and the third already held DCE. The **Stadium's Prize location therefore explains this precise three-abort pattern** without assuming that source DCE copies were inaccessible. This is a state-dependent failure of the special turn-2 plan, and a limitation of the policy's all-targets-required logic. It does **not** prove there was no alternative rational play after Guzma & Hala, nor that changing the starting deck or resolving Prize recovery later would be ineffective.

### K0-to-K1 transition: an avoidable second search in seed 2966203069

One of the three aborts has a **stronger decision-policy implication** than ordinary unknown Prize risk. The archived accepted `chosenSourceActions` on seed `2966203069` are `Play held Tag Call` → `Tag Call finds one Guzma & Hala` → `Tag Call wait` → `Play Guzma & Hala` → abort at the G&H Stadium search. As Tag Call performs a genuine **search of the owner's deck**, the player is permitted to inspect the remaining deck during that earlier native search (Advanced Player's Rulebook I-H, Deck). A player who remembers their registered singleton and recognizes its absence can infer the Prized Thunder Mountain *before* committing the Supporter. The source policy instead follows its stale K0 opening plan and consumes G&H despite K1 having become available. The original G&H line in this seed required **zero discard payment** (DCE was held), but it still consumed the one Supporter for the turn and failed to reach its targeted Stadium.

The two other aborted seeds, `1150814608` and `3364644363`, went directly from **held G&H** to its deck search, without a preceding Tag Call in the scripted sequence. There the missing Stadium is first discoverable within that G&H search, making pre-search uncertainty materially different. A correct common setup policy can update its persistent **owner-known card-location belief** after every legitimate deck search and re-evaluate remaining planned actions; it must not access the hidden Prize assignments before its first observation. The artifact proves stale-plan continuation on one specific seed; it does not prove that an alternate Supporter would have won the game.

These are diagnostic physical source deals using a limited source policy and a generic opponent. Since the information is initially hidden from the player, it cannot justify a deck-peeking pre-search decision; a proper policy must value missing-target risk in expectation, then respond to **its own legal search observation**. Widening the discard-payment whitelist from protected25 to broad32 did not overcome any of these single-Stadium Prize configurations.

**Qualification:** 29/32 opposing lists published, 0 independently competitive-qualified games, and no demonstrated 99.5% fixed-deck performance. Preserve this as a source-policy regression and feed it into the common owner-observation-safe setup decision layer before registering further outcome cohorts.
