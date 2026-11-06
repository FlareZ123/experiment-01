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

**Information boundary:** Fan Rotom's actual Prize status is an analysis stratification, not information available to the actor at K0. An owner-safe Artazon policy may prefer to search Bunnelby regardless of Fan's unseen location; once the Artazon search is opened, the player may lawfully inspect their own remaining deck and discover whether Bunnelby is there. The modeled gain does not authorize looking at unsearched face-down Prize identities or reading the opponent's private deck.

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


## Reproducibility source

- [Committed exact BigInt allocation DP and seeded Monte Carlo](../../scripts/agent28-sentinel-artazon-direct-opening.cjs), Git blob `f4244bdbfeb5ffb090d0f6bea6c7c1bb51f97f53`.
- [Targeted deterministic regressions](../../tests/agent28-sentinel-artazon-direct-opening.test.cjs), Git blob `7a185a667faa0b16e1e3bd4d04106f52ba1f26e0`: Fan-prized positive, redundant-Fan positive, no-Art negative, Capture-energy alternative, opening-mulligan negative, Vileplume-prized negative, exact allocation integer, paired reproducibility and Fan-Prize necessity.
- Local Node.js 22.16.0 executed the equivalent source and tests successfully. Seeded Monte Carlo ran **4,000,000** deals under `seed=27042026`. No GitHub Actions job was commissioned for this standalone numerical screen. For independent rerun, execute the committed CJS with these sample-count and seed arguments, and run the committed test file with Node 22.

## Actual compiled pinned-Store mechanic witness (6 November)

**Post-report experimental update, directly compiled.** Reused manually dispatched [Aichi Dusclops workflow run 42138626427](https://github.com/FlareZ123/experiment-01/actions/runs/42138626427), full **SUCCESS** at research checkout `d452ab0398813b0a552b3bb4a252fa95f0ff6bb4`, with pinned upstream gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The existing manual workflow added exactly one opt-in `sentinel_artazon_direct_probe`; no new workflow was created. The [exact 60-card native test](../../tests/agent28-sentinel-direct-artazon-native.test.cjs) and [exact-statistics tests](../../tests/agent28-sentinel-artazon-direct-opening.test.cjs) both completed successfully.

The **same physical 60 Sentinel v1** was allocated once for each owner seat (0 and 1), with source opening seven containing Active Oddish, held G&H/Guzma/Karen/Lillie's Determination/Buneary/Stealthy Hood and Pidgey as the turn draw. The six source Prizes include Fan Rotom. Both source Bunnelby copies start in the remaining deck; all 60 source printing IDs occupy exactly one physical zone, and **no registered contender cards were substituted**. This is a deliberately **conditioned fixture**, rather than a random game opening.

Both seat 0 and seat 1 produced the exact same accepted Store sequence:

1. **Guzma & Hala** physically discarded real held `Guzma BUS` and `Karen XYP`, searching `Artazon PAL`, `Technical Machine: Evolution PAR` and `Jet Energy PAL`; both discarded cards appeared in the real discard pile.
2. **Artazon** entered the Stadium zone and used its actual native `ChooseCardsPrompt` to move **Bunnelby PRC** from owner deck to Bench, leaving exactly one other Bunnelby in deck. Fan Rotom remained Prized.
3. Actual `PlayCardAction` put TM: Evolution on the newly Benched Bunnelby; actual `PlayCardAction` attached Jet Energy to it, moved Bunnelby into Active, preserved its Tool and Energy, and moved Oddish onto the Bench.
4. Bunnelby declared **Evolution**. Native prompts were `ChoosePokemonPrompt → ChooseCardsPrompt → ShuffleDeckPrompt → WaitPrompt → ConfirmPrompt → ChooseAttackPrompt → ChoosePokemonPrompt → ChooseCardsPrompt → ShuffleDeckPrompt` plus mandatory Waits. The consent and second attack were real, and the single Benched Oddish became **Vileplume AOR** through Gloom. The opponent's turn began with Vileplume in play.
5. Against the source-registered original rank1 Shadow Rider opponent's real **Fog Crystal CRE** physical card, a native Store attempt to play that Item was rejected with `CANNOT_PLAY_THIS_CARD`, leaving it in the opponent hand. This is an actual defensive lock consequence, without a selected strategically consequential opponent turn.

The `AGENT28_DIRECT_ARTAZON_NATIVE` log lines for **both seats** identify actual Energy recipient Bunnelby, two attack declarations, Vileplume on Bench and rejected opponent Item. The companion exact/seeded numerical test emitted `PASS Sentinel direct-Artazon exact/matched-deal tests`. No simulator game completed and no winning comparison was made.

**Evidence boundary:** Conditioned initial source hand/Prizes and deterministic within-deck choice make this an existence proof of one printed, native-payable sequence. The tests do not measure how often autonomous source and opponent policies choose it, whether its individual discards have low DCI, the full opponent's actual best response, full paper-fidelity acceptance or any game win. Source rank1's subsequent attempted Item under lock is a negative-control probe; it does not establish an actual decision from a competent opponent bot. Thus benchmark remains 29/32 known 60s, **zero competitively qualified games**.

## Acceptance status and next falsification

**The result corrects an opening-access graph and avoids an unnecessarily fragile Fan Rotom dependency. It is not an admission of Sentinel v1 as a final contender.** Real first-turn success additionally requires actually acceptable discard cards, every source-owned Tool/attack prompt, 2× Technical Machine Evolution settlement, protected Benched Vileplume under applicable Ability/Tool locks, and a meaningful opponent response. The earlier shorthand-lookup error for PFL Buneary was corrected: all 60 printings resolved under exact set/collector lookup in compiled CI 41529176038, while the proposed staged mechanical attack and the new Artazon sequence still lack completed native payoff evidence. The selected bilateral v4 release has no competitively qualified games.

The conditioned pinned Store native fixture has now confirmed actual **Artazon → Bunnelby** search, Jet payment, both Evolution attacks and a blocked opponent Item. The next prospective milestone is **autonomously selected owner-safe play with a real opponent decision and reply** under a selected shared two-seat policy, retaining all failed, capped and error arms. Check that the game state contains no alternate access to Bunnelby that was omitted from the restricted model. Preserve failed trials, caps and exact printed source IDs.

**Field qualification remains unchanged:** 29/32 historical original 60s authenticated, ranks 23/25/28 missing, zero competitively qualified games, no best fixed 60 and no demonstrated 99.5% win rate.
