# Agent28: Artazon searches Bunnelby directly, eliminating the Fan Rotom dependency

**6 November 2026. Developmental first-turn resource-access calculation for the unchanged fixed Sentinel v1 60. No Store-executed turn, paper-qualified game, or game win is inferred.**

## Verified printed-card shortcut

The fixed candidate is [Sentinel Lopunny Vileplume v1](candidate-sentinel-lopunny-vileplume-v1.psv). In the supplied card database:

- **Artazon PAL 171** can put a Basic Pokémon without a Rule Box from the deck onto the Bench.
- **Bunnelby PRC 121** is a **Basic 60 HP non-Rule-Box Pokémon** with the Ω Barrage Ancient Trait, permitting two attacks per turn.
- **Technical Machine: Evolution PAR 178** grants the one-Colorless Evolution attack to its attached Pokémon; the attack searches for Evolution cards to evolve up to two Benched Pokémon.
- **Jet Energy PAL 190** provides Colorless and can switch the newly attached Benched Pokémon into the Active Spot.
- **Guzma & Hala CEC 193** obtains a Stadium and, if its optional **two other hand cards** are actually discarded, also searches a Tool and Special Energy.

This gives an immediate resource connector `Guzma & Hala → Artazon → Bunnelby`, where **Oddish is already present in the initial seven or first turn draw**. Attach Jet to the Benched Bunnelby to bring it Active and provide the Technical Machine's attack cost. The deck's earlier alternative `Artazon → Fan Rotom → Fan Call → Bunnelby` is unnecessary for *Bunnelby access* in these states. The direct route retains access even when the singleton Fan Rotom is in the six Prizes, and avoids consuming a Bench slot or depending on Fan Call. Fan Rotom may still be strategically useful to search multiple other Colorless Pokémon; the shortcut is **not a universal strategic domination claim**.

The exact route requires an open Bench slot and proper physical playing order. Stage access demands **at least one Gloom and one Vileplume remaining in deck**, including valid searches on consecutive Ω Barrage Technical Machine attacks. The rulebook's attack-effect evolution section C-12 permits attack-effect evolution on the turn a Pokémon entered play unless the text specifies otherwise; real two-attack Store settlement, opponent interference, tool/lock behavior and evolving the same Pokémon twice have **not** been native-tested for this proposal.

## Exact incremental physical-deal screen

For the printing-aware Sentinel v1 fixed inventory, collapse the relevant 60 into Bunnelby 2, Oddish 2, Fan Rotom 1, Artazon 1, Guzma & Hala 4, Tag Call 4, Gloom 2, Vileplume 2, TM: Evolution 2, Jet 3, Capture 2, Grass 1, other Basics 9 and other cards 25.

Sample without replacement: first seven opening cards, six unordered Prizes, then one first-turn draw, leaving 46 in deck. Condition on a legal opening seven containing at least one of the 14 Basics. The *new* disjoint event requires:

1. **Fan Rotom Prized**, no Bunnelby in the opening eight, at least one Bunnelby remaining in deck.
2. Oddish in the opening eight, Artazon accessible from hand/deck, Jet accessible from hand/deck, a valid opening Basic.
3. Either Guzma & Hala observed, or Tag Call observed with Guzma & Hala still in deck; TM: Evolution accessible; both Gloom and Vileplume available in deck.
4. The two optional Guzma & Hala discards are assumed available and strategically acceptable. This is a resource model without UDP/DCI penalties or an opponent policy.

The disjointness is exact **within the declared access model**: with Fan Rotom in hand, Fan Call already provides Bunnelby, while with Fan Rotom in deck the older Artazon-to-Fan route supplies it. Only Fan Rotom in the six Prizes gives the newly unlocked first-turn access configurations.

A multivariate-hypergeometric allocation DP enumerates each category's opening count h, Prize count p, draw count d (0 or 1), and remaining deck count r, weighting each allocation by `C(n,h) C(n-h,p) C(n-h-p,d)`. The DP tracks the opening Basic and whether Guzma & Hala was seen or reachable via Tag Call. Its exact result is:

| Quantity | Exact value |
| --- | ---: |
| Incremental eligible deals | **4,501,012,225,570,856** |
| All unordered-deal outcomes | **416,717,869,162,795,200** |
| Valid-opening deal outcomes | **358,964,655,944,294,400** |
| Increment, unconditional | **1.0801102037%** |
| Increment, conditional on legal seven | **1.2538872981 percentage points** |

The earlier Agent28 three-family exact enumeration (recorded in `agents/agent28/memory.md`) gave **116,529,709,411,516,120** of the same unconditional denominator or **32.4627250850%** conditional on a valid opening. Its printed conditions cover the new comparison's old branches. Adding the mathematically disjoint new event yields **121,030,721,637,086,976** eligible deals or **33.7166123831%** of valid openings, subject to the earlier enumeration's recorded assumptions. The direct route does *not* imply that 33.7% of games actually establish first-turn Vileplume.

## Independent seeded physical Monte Carlo

A 4,000,000-deal Fisher–Yates seeded enumeration (`seed=27042026`) checked seven opening cards, six Prizes, the turn draw, a remaining-deck inventory and the restricted action-route predicates:

| Event | Occurrences | Conditional on 3,446,326 valid openings |
| --- | ---: | ---: |
| Earlier route union | 1,119,981 | 32.49782522% |
| Including direct Artazon → Bunnelby | 1,163,127 | 33.74976714% |
| Newly enabled, paired difference | **43,146** | **1.25194192 pp** |
| Earlier Artazon → Fan → Bunnelby available | 317,855 | 9.22301024% |

The paired Monte Carlo difference is close to the separately exact **1.25388730 pp**. The new overall Monte Carlo's 95% Wilson interval is **[33.69986%, 33.79971%]** and contains the prior-exact-plus-new-exact 33.71661%. The Monte Carlo reuses identical physical deals for old and new predicates; it does not sample games or native bot decisions.

## Acceptance status and next falsification

**The result corrects an opening-access graph and avoids an unnecessarily fragile Fan Rotom dependency. It is not an admission of Sentinel v1 as a final contender.** Real first-turn success additionally requires actually acceptable discard cards, every source-owned Tool/attack prompt, 2× Technical Machine Evolution settlement, protected Benched Vileplume under applicable Ability/Tool locks, and a meaningful opponent response. Twinleaf still has the separately documented PFL Buneary printing gap, and the currently selected bilateral v4 release has no competitively qualified games.

Test a prospective, fixed-paper-deal Fan-prized initial opening in the compiled native engine using **Artazon → Bunnelby** with Jet payment, legal Bench ownership, double Evolution attack, Item lock and actual opponent continuation. Check that the game state contains no alternate access to Bunnelby that was omitted from the restricted model. Preserve failed trials, caps and exact printed source IDs.

**Field qualification remains unchanged:** 29/32 historical original 60s authenticated, ranks 23/25/28 missing, zero competitively qualified games, no best fixed 60 and no demonstrated 99.5% win rate.
