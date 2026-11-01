# Agent 29: Whismur Bawl as a non-GX first-turn Trainer denial option

**1 November 2026.** This proposes a distinct, pre-attack first-turn mechanism for a *hypothetical* one-card change to the 60-card New Moon Lockbreaker. It proves exact **unimpeded opening-card access** under named assumptions, not a winning deck, legal executed attack, matchup result or candidate promotion. No registered 60 was changed.

## Printed interaction and why it matters

[Whismur CES 116](https://limitlesstcg.com/cards/CES/116), original Japanese Sky-Splitting Charisma 071/096, is a Basic Colorless 60-HP Pokémon with **Bawl**, one Colorless Energy: on the player's first turn **going second only**, their opponent cannot play any **Trainer cards** from their hand on their following turn. Both the English and Japanese prints are identified as Expanded-legal by the source. Trainer includes Item, Supporter, Stadium and Pokémon Tool. The supplied rulebook's §C-19 treats these effects as acting on the **player**. The effect therefore has a fundamentally broader affected-card set than Budew's Item-only Itchy Pollen, but only a narrow first-turn use window.

[Latias ex SSP 76](https://www.limitlesstcg.com/cards/en/SSP/76) has Skyliner: the owner's Basic Pokémon in play have no Retreat Cost. [Battle VIP Pass FST 225](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh8/225) is a first-turn Item that can Bench up to two Basic Pokémon from deck. Together, these enable a simple unimpeded line:

`valid starter -> Battle VIP Pass for Whismur + Latias ex -> free retreat to Whismur -> attach one Energy -> Bawl`.

Latias can already be in the hand, and Whismur can start Active or be drawn on the first normal draw. If Whismur is in the starting seven, it may be chosen Active without using VIP or Latias. This is mechanically plausible from printed text, **not** proof that Twinleaf implements the full chain or that a strong policy selects it.

## Exact original-60 starting counts and hypothetical substitution

The existing [frozen 60-card New Moon English mechanics proxy](../als/new-moon-lockbreak-english-proxy-60.json) contains 17 Basic Pokémon, including one Latias ex, two Stage-1 Dusclops, four Battle VIP Pass, and six Energy. Three Energy are Basic Psychic and three are Telepathic Psychic Energy. The hypothetical variant removes **one as-yet-unspecified non-Pokémon/non-Energy card** and adds exactly one Whismur CES 116, leaving 60 total, 18 Basic Pokémon, four VIP and six Energy. Choosing the removed card and its strategic opportunity cost remains an unsolved deck-optimization decision.

All six Energy provide at least one Energy usable for Whismur's Colorless attack cost. However, [Telepathic Psychic Energy POR 88](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/me03/88) only triggers its *search up to two Psychic Basics* when attached from hand to a **Psychic Pokémon**. Attaching it to Colorless Whismur sacrifices that extra search. We therefore evaluate both an all-six physical-Energy case and a strict three-Basic-only sensitivity.

## Exact probability, no simulation assumptions

Condition on an initial seven containing at least one Basic Pokémon. Set six Prize cards randomly, then allow exactly one ordinary first-turn draw. Assume the owner goes second, there are no opponent restrictions on VIP or Latias, and the regular attachment is unused. The three disjoint routes are:

1. **Direct initial Whismur:** Whismur appeared in the initial seven, so may start Active; Energy appears in those seven or the first draw.
2. **Drawn Whismur with initial Latias:** Latias is in the initial seven; Whismur arrives in the first draw, can be Benched and reached by Skyliner.
3. **VIP/Latias-assisted:** A Battle VIP Pass appears by the first draw, along with usable Energy; Whismur and Latias are available in hand/draw/deck and neither required unobserved singleton is Prized. VIP can fetch the needed Basics and Latias permits free retreat.

The [exact BigInt combination implementation](../../simulation/evaluation/agent29-whismur-bawl-frontier.cjs) enumerates all initial-seven categorical combinations and the first draw, then integrates six Prize cards with `C(52-k,6)/C(52,6)` when `k` required unobserved singletons remain. No Monte Carlo or opponent/gameplay assumptions enter the probability arithmetic.

| Conditional on Basic-valid opening seven | All six physical Energy attachable | Only three Basic Psychic attachments |
| --- | ---: | ---: |
| Whismur in opening seven | 6.875553% | 4.016071% |
| Whismur first draw, initial Latias | 0.105661% | 0.060327% |
| Additional VIP + Latias path | 16.766272% | 9.767320% |
| **Disjoint union** | **23.747486%** | **13.843718%** |

Exact union fractions: **83,267,482,991 / 350,637,041,508** for six usable Energy; **68,528,755,801 / 495,016,999,776** for Basic-only. Under a further artificial fair 50/50 first-turn allocation and identical setup distributions, these access opportunities would occupy only ~**11.873743%** and **6.921859%** of valid-opening games, respectively. This latter multiplication is a sampling scenario, not a real Aichi matchup statistic.

## Strategic vetoes and strongest next mechanical test

**Latias suppression changes the result dramatically.** An opponent's original Active Iron Thorns ex Initialization or an equipped Garbodor Ability lock can switch off Skyliner. Under such a board the **16.77 percentage-point VIP/Latias contribution is not certified**, even if Whismur and Latias remain physically accessible. A separate Switch, retreat-funded starting Basic, or another engine-verified transition might still permit the attack. The surviving simple direct-initial-Whismur opportunity is 6.875553% for all six Energy, not an upper bound on alternative lines.

The same issue occurs under an opponent Stadium or effect removing Latias's Ability, an opponent's active Item lock preventing VIP, or a full Bench. The Bench can normally be left deliberately unfilled at setup; the model assumes that choice is made. Special Energy cost also matters: using Telepathic Psychic on Whismur denies its on-Psychic search and reduces the development value of that attachment. A 60-HP one-Prize Whismur is a likely vulnerable post-attack Active; its late-game copies would be much less useful. The New Moon list already includes Gengar & Mimikyu-GX's one-use Horror House-GX route, creating a distinct GX-use/Supporter/attachment competition. None of those tradeoffs appears in the exact access probability.

**Next evidence gate:** reproduce Bawl with the pinned original Store against one genuinely source-dealt opponent-first active board, with separate branches for Latias enabled and genuine Iron Thorns active. Confirm native card availability/printings, first-turn restriction, actual VIP+free-retreat+Energy+attack dispatch, opponent's next-turn Trainer-play veto, and the subsequent response. Record the otherwise-foregone alternative use of the one changed deck slot and Telepathic attachment. Only then consider a prospective unchanged-60 comparison across all field ranks. Avoid comparing this 23.7% *opportunity* to measured winning percentages.

## Evidence classification

- **Direct card-text facts:** Whismur Bawl, Latias Skyliner, VIP search, Telepathic trigger, Rulebook §C-19.
- **Exact derived probabilities:** combinatorial opening and Prize location model under explicitly simplified availability rules.
- **Hypothesis:** Whismur may offer a valuable GX-preserving Trainer lock in certain going-second states.
- **Unresolved:** optimal card removal, K1 search resource conflicts, dynamic play realism, printed Japanese equivalence under event date, native engine support, opponent counters, clock, and complete-game outcome.

**Release state:** no new fixed 60, no actual native Whismur attack, zero competitively qualified games, target 99.5% unverified.

## Critical overlap correction: the actual New Moon sixty already has Horror House-GX

This document's standalone Bawl rate is a useful *absolute opportunity gate*, but it would seriously overstate incremental value if treated as added trainer-denial access. The same frozen 60 already contains **one Gengar & Mimikyu-GX TEU 53**. Its **Horror House-GX** costs one Psychic Energy and prevents the opponent from **playing any cards from their hand** on their next turn, covering Bawl's Trainer prohibition and additionally preventing hand-played Pokémon and Energy. This is a powerful, competing first-turn lock line. It consumes the once-per-game GX attack, and a Knocked Out Gengar & Mimikyu-GX gives up three Prizes, whereas Whismur is a one-Prize non-Rule-Box Basic. Those distinctions could matter in specific states, but they are unmeasured strategic tradeoffs.

[Exact disjoint original-versus-addition calculation](../../simulation/evaluation/agent29-early-hand-lock-overlap.cjs), [tests](../../tests/agent29-early-hand-lock-overlap.test.cjs), use the same initial-seven, one-normal-draw, random-six-Prizes, four Battle VIP Pass, one Latias, no opposing interference, and going-second assumptions above. The original has **one** eligible attacker Gengar, plus Latias and fifteen other Basic Pokémon, total **17** Basics. The hypothetical has **two** eligible attacking Basics, Gengar or Whismur, plus Latias and the same fifteen other Basics, total **18**. One unspecified non-Basic Trainer is still removed to preserve sixty cards. Both attacks require one Energy providing Psychic or Colorless respectively. All six original printed Energy can fulfill either attack cost, and the three Basic-Psychic-only sensitivity treats Telepathic attachments as strategically unavailable for this first-turn lock.

| First-turn *either-lock* access, conditional on Basic-valid initial seven and going second | Six usable Energy | Three Basic Psychic Energy only |
| --- | ---: | ---: |
| **Original New Moon 60**, Horror House-GX | **23.722646%** | **13.822074%** |
| **Hypothetical +1 Whismur 60**, either attack | **29.930961%** | **17.482406%** |
| **Incremental access from Whismur** | **+6.208315 percentage points** | **+3.660332 percentage points** |

Exact six-Energy original fraction `103535631241/436442169124`; two-attacker fraction `2098980746107/7012740830160`. Exact three-Basic-only original fraction `33711231247/243894153334`; two-attacker fraction `5956255105/34069995936`. The overlap accounts for multiple-attacker visibility without double-counting hands that expose Gengar and Whismur together, and for the chance both would be Prized when they are absent from hand/draw. These mathematical percentages are **not gameplay, attack execution, or measured outcome improvements**.

**New decision:** the 23.75% standalone Whismur opportunity must **never** be used as the incremental justification for replacing a card in New Moon. The correct restricted incremental availability is only **6.21 percentage points**, and even that must be discounted for GX-use choice, Bench/Active switching, 1-Prize vs 3-Prize liability, the existing Gengar's stronger lock, strategic value of the removed Trainer, and the locked opponent's response. Whismur might preserve Horror House-GX for a later turn while achieving a one-Prize early Trainer prohibition; this is an explicit, untested *option-value hypothesis*. In some states Gengar is plainly a superior attacker because it prevents the opponent from playing *all* cards from hand. The native and strategic release gates above therefore become more stringent: measure incremental valid owner decisions versus the existing Gengar route before opening a new 60-card competition branch.

References: [original frozen candidate](../als/new-moon-lockbreak-english-proxy-60.json); [Gengar & Mimikyu-GX TEU 53](https://limitlesstcg.com/cards/TEU/53); [Whismur CES 116](https://limitlesstcg.com/cards/CES/116).
