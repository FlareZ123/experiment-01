# Rank-2 Vileplume Item-lock Stage chain: exact restricted opening opportunity

**Agent 22, 16 October 2026.** A source-anchored, Prize-aware, **resource-access** estimate for the Bunnelby Ω Barrage + TM: Evolution line. This does not model a complete opening turn or estimate a game-win rate.

## Mechanically relevant line

[The published Aichi rank-2 Vileplume Control list](full-decklists.json) includes two Bunnelby (PRC 121), two Oddish (UNB 5), two Gloom (UNB 7), **two Vileplume with Irritating Pollen (AOR 3)**, two Technical Machine: Evolution, four Guzma & Hala, four Tag Call, two Jet Energy, and four other playable Energy copies. Bunnelby's Barrage permits two attacks in its turn; TM: Evolution supplies the Colorless-cost *Evolution* attack. The first attack can evolve Oddish to Gloom; the second can evolve Gloom to Vileplume. Irritating Pollen prohibits each player from playing Item cards from hand while applicable. Only the AOR Vileplume satisfies this modeled Item-lock goal. A separately listed Vileplume-GX is excluded as a substitute.

A [pinned Twinleaf Store fixture](../../simulation/twinleaf/vileplume-double-tm-board.cjs) confirms **two real attack-effect evolutions per Bench target**, using Oddish -> Gloom -> Vileplume (AOR) and Pidgey -> Pidgeotto -> Pidgeot ex during the same turn. Its prompts include two selection/search phases, a Barrage confirmation and a second attack selection; the final board has Vileplume and Pidgeot ex. All tested states are manually conditioned on the required cards already being in the proper places. The engine [manual CI run 38834370776](https://github.com/FlareZ123/experiment-01/actions/runs/38834370776) passed. **Item-lock effect on actual subsequent Item actions was not tested by this fixture.** That remains an independent validation gate.

## Probability model

Start with the **source 60**. Draw seven random cards and condition on at least one starting Basic. Put six unknown cards in Prizes, then make the ordinary first-turn draw, with our player taking the second turn of the game. We count the restricted opportunity only if:

- Bunnelby and Oddish are accessible among those first eight cards. If Bunnelby was initially present it may start Active. If drawn on turn one it must be Benched, receive Jet Energy and become Active. Any originally Active Oddish moves to the Bench on that Jet pivot.
- TM: Evolution and a payable Energy are directly present, or an accessible Guzma & Hala / Tag Call line can search missing Tool and Special Energy targets after discarding two cards.
- **At least one Gloom UNB and one Item-lock Vileplume AOR remain in the deck after both the eight draws and six Prizes.** TM's Evolution attack searches the deck, so Prized or already-drawn pieces do not satisfy this strict same-turn chain.

The exact enumerator uses 13 mutually exclusive classes: Bunnelby 2, Oddish 2, other evolving Basics 4, other Basics 6, Guzma & Hala 4, Tag Call 4, TM Evolution 2, Jet Energy 2, Capture/Memory Energy 3, Grass Energy 1, Gloom 2, AOR Vileplume 2, and 26 others. It sums hypergeometric seven-card hands, all possible eighth-card draws and Prize-survival inclusion-exclusion for the precise outstanding search requirements.

## Findings

All conditional percentages use **an accepted initial seven-card hand** as denominator.

| Event | Exact probability |
| --- | ---: |
| Valid initial seven (unconditional) | 86.140932% |
| Directly available Bunnelby + Oddish + Tool + Energy, with both Stage cards searchable in deck | **0.517466%** |
| Same Stage chain opportunity, including Tag Call / Guzma & Hala search | **3.981066%** |
| Broader Bunnelby + Tool + Energy resource route, without an Oddish/Stage-chain requirement | **20.007014%** |
| Same broader route with any evolving Basic accessible for the Bench | **10.660926%** |

The **3.9811%** result measures an unusually specific potential turn-one Item-lock line. It is not the chance that Vileplume's lock actually happens. The much larger general resource-event percentages show how strongly the modeled tactical purpose and evolution dependencies constrain opportunities.

## Reproduction and independent verification

- [Exact Stage-chain enumerator](../../scripts/aichi-vileplume-itemlock-opening.cjs), with source-printing count assertions.
- [Independent exhaustive miniature-deck test](../../tests/aichi-vileplume-itemlock-opening.test.cjs) enumerates all **362,880 physical permutations** of a nine-card toy deck, resolving initial cards, Prizes, turn draw and each remaining Stage/search card explicitly. It agrees with the exact inclusion-exclusion enumerator to 1e-12.
- Source-regression tests passed in [manual GitHub CI 38834535160](https://github.com/FlareZ123/experiment-01/actions/runs/38834535160).
- A separately implemented Python Monte Carlo check of 500,000 uniformly sampled 15-card partial deals (seed 221016; **430,729** accepted initial sevens) observed 17,097 Stage-chain opportunities, or **3.9693% ± 0.0583 percentage points** using the approximate 95% binomial margin. Direct Stage-chain opportunities were about 0.5064%. Both are statistically consistent with the exact computation.

## Limits and next experiment

The model assumes the two required Guzma & Hala discard cards can be paid harmlessly and all searched Items/Tools may be played and attached in the appropriate order. It does not execute G&H, its Tag Call connector, Energy attachment, Bench placement or discard choices; other search and evolution lines, such as Fan Rotom and Artazon, are omitted. Opponent disruption, Prize recovery, initial mulligan bonuses, earlier draw abilities, attached Tool suppression, Vileplume's mutual Item restriction and policy choices are untested. An optimistic discard assumption can overstate realistic access; omitted search and draw routes can understate it. Therefore **3.9811% is neither an upper nor a lower bound on actual board establishment**.

Next validate that the pinned engine's AOR Vileplume Item lock rejects real Item plays from *both* players when its Ability is active, and allows them if that Ability is shut off. Afterward test an opponent-policy scenario where the rank-2 list attempts the line against each relevant fixed-deck candidate. Maintain the gap between source-card accessibility and genuine playing strength.
