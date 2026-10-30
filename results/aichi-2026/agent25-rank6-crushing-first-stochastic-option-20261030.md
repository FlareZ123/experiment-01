# Rank-6 original native source: six Plumeria payments select Crushing Hammer, exposing a conditional Hammer-first option

**Agent 25 | 30 October 2026 | source text plus an audited original Store artifact.** This is a falsifiable action-sequencing hypothesis for the existing two-player chooser, with a precise resource-value threshold. It is **not** a demonstrated legal native counterfactual, evidence of strategic superiority, a new game result or a fixed-deck improvement.

## Printed mechanics and observed exact state

The supplied Black & White-onward card list includes **Crushing Hammer (Perfect Order/POR 71)**: an Item that flips a coin and, on heads, discards an Energy attached to one of the opponent's Pokémon. The paper rules permit multiple Items per turn. **Plumeria (Burning Shadows/BUS 120)** is a Supporter that requires discarding **two owner-hand cards** before discarding one opposing Energy. The Supporter quota is one per turn. **Enhanced Hammer (Twilight Masquerade/TWM 148)** can discard a *Special Energy* and has no coin flip. These categories and costs matter for the next possible actions.

The already-frozen [original rank-6 native Plumeria hand-payment audit](agent25-native-plumeria-hand-discard-census-20261030.md) established 27 accepted/settled source Plumeria chains with exact root, prompt, original root-lineage and effect witnesses. **Six** of those chains selected **Crushing Hammer POR** as one of their two owner-hand discards. All six selected an opposing **Basic Psychic Energy MEE** as their resolved Plumeria target. The resulting six exact source-turn identifiers are:

| Genuine rank-6 source trial | Global turn | Source seat | Original accepted Plumeria root ordinal | Two selected payment cards | Hand-prompt candidate count before payment |
| --- | ---: | ---: | ---: | --- | ---: |
| `6:1:A:champion-reference` | 15 | 1 | 56 | Crushing Hammer + Lusamine | 12 |
| `6:1:A:new-moon-lockbreaker-v1` | 15 | 1 | 67 | Crushing Hammer + Lusamine | 12 |
| `6:2:B:champion-reference` | 17 | 0 | 87 | Crushing Hammer + Speed Lightning Energy | 14 |
| `6:2:B:champion-reference` | 23 | 0 | 117 | Camping Gear + Crushing Hammer | 14 |
| `6:2:B:new-moon-lockbreaker-v1` | 17 | 0 | 63 | Crushing Hammer + Speed Lightning Energy | 14 |
| `6:3:B:champion-reference` | 3 | 0 | 29 | Crushing Hammer + Enhanced Hammer | 7 |

Every one of these source turns had the source player **actually playing first**, and the observed Plumeria turn was after that player's opening turn. The original actual native two-card prompt sizes were 7 to 14 candidate physical cards, so after hypothetically spending the held Crushing Hammer first, at least six other physical cards would still remain available for Plumeria's two-card selection. This supports a **mechanical hand-count** fallback only; it does not establish that discarding two of those cards would be strategically acceptable.

**New verified actual continuation across these six source turns:** all **six** following source-owned turns (global T+2) consisted of a single accepted **Pass**. On the intervening opponent turns, **four** declared attacks and **two** physically reattached Basic Psychic Energy. The T3 case is one of those two attachments, on the exact same Active. These counts characterize the original policy after spending Plumeria and one Crushing Hammer as its hand cost; the cases share source seeds and thus cannot be treated as six independent demonstrations of action quality.

Six chains arose in five original game arms, and several share original source-deal fingerprints. They are **correlated archival cases** selected for mechanism analysis, not six independent trials. The exact full source-deal hashes, root ordinals, native prompt selections, target printings and settlement evidence remain in [the original ZIP artifact 13009235373](https://github.com/FlareZ123/experiment-01/actions/runs/41120823829/artifacts/13009235373), SHA256 `36bd900984a3f7b01c39c31387d8cc254f21cc7213184a141ab1cb8ac7aef709`.

## Turn-3 paper legality cross-check from the actual public action ledger

The original source was seat0 and went first. Its first turn ended in Pass without playing an Item-locking Stadium. The opponent's immediately preceding global turn2 used Fog Crystal, Benched **Shadow Rider Calyrex V** and **Girafarig**, attached **one Basic Psychic Energy MEE** to its Active **Lillie's Clefairy ex**, then ended with Pass. The next source T3 originally used Plumeria. Against this public board, the attached card database records **Lillie's Clefairy ex's Fairy Zone** as Dragon Weakness modification, **Girafarig's Get Lost** and **Shadow Rider V's Shadow Mist** as attacks rather than persistent Item lock, and **Iron Thorns ex's Initialization** as Ability suppression. The opponent made **no attack** or Stadium play in the preceding turn. Under the supplied paper Trainer and card-text rules, a held **Crushing Hammer** has a legal opposing attached Energy target and no evidenced Item prohibition at T3; this supplies a concrete **paper-legal Hammer-first alternative**. The pinned native Store's `canPlay` and physical action settlement at this exact original root remain unexecuted.

## Conditional counterfactual for the concrete turn-3 case

At `6:3:B:champion-reference`, native T3 source seat0 played **Plumeria**, choosing **Crushing Hammer and Enhanced Hammer** as its two payments, to remove the opponent's **Basic Psychic Energy**. The opponent had attached that Psychic Energy to Active Lillie's Clefairy ex during its preceding turn. The untouched source deck and actual first player are known. The native evidence still needs an **Item canPlay check at the same prior root**, because the archived treatment chose Plumeria and never dispatched an alternative Crushing Hammer there.

Suppose Crushing Hammer is native-legal at that exact root, the visible opposing Energy remains attached until these actions resolve, the coin is fair, and there are no intervening effects or restrictions. Consider the owner's alternative **Crushing Hammer first, Plumeria only if tails**:

- **Heads (probability 1/2):** spend the one Crushing Hammer Item, remove the opposing Basic Psychic Energy, and preserve Plumeria, Enhanced Hammer and the current turn's unused Supporter opportunity. One physical card is consumed.
- **Tails (probability 1/2):** Crushing Hammer is spent without removing Energy. The owner can then play the still-held Plumeria, choosing Enhanced Hammer and another card `X` from the large remaining hand, and remove the same Basic Psychic Energy. Four physical cards are consumed, with the extra `X` possibly strategically important.
- **Original line:** spend Plumeria, Crushing Hammer and Enhanced Hammer to remove the Basic Psychic Energy with certainty, consuming three physical cards and the Supporter quota.

Under these **explicitly hypothetical** branch assumptions, the alternative consumes **2.5 physical cards in expectation**, compared with **3** for the observed Plumeria-first payment. Saving half a card on average is **not** proof of higher strategic value: actual card importance, timing, future Special Energy, recoverability, and other legal actions matter far more than raw count.

A more meaningful state-dependent marginal-resource expression follows. Let `vP`, `vE` and `vX` denote the future opportunity value of the Plumeria, Enhanced Hammer and fallback extra card X *relative to the original line*, ignoring any additional payoff differences. The alternative's expected preservation advantage is:

`[vP + vE - vX] / 2`.

It is positive **only if the combined future value of saving Plumeria plus Enhanced Hammer exceeds the extra card sacrificed on a tails branch**. This illustrates precisely why a single fixed discard index or blanket preference for Crushing Hammer can be misleading. One should also consider playing Crushing Hammer and then preserving Plumeria even on tails, accepting the missed immediate Energy denial when continuation warrants it.

## New observed next-turn consequence: a potential second denial

A [fresh exact native continuation audit](agent25-plumeria-next-turn-native-continuation-20261030.md) found that the **same original T3 case** immediately continued as follows: after source Plumeria stripped the one Basic Psychic from Active Lillie's Clefairy ex, the opponent used **one ordinary Basic Psychic Energy attachment** to that very same Active on global **turn 4**. Native public target sidecar root **36**, accepted action **39**, physically changed the Active's Energy from **zero to one**, then the opponent ended with Pass. The original source then played **only Pass on global turn 5**.

This creates a sharper, testable *conditional two-turn line*: if a correctly executed **Crushing Hammer heads** on T3 instead removes the same Basic Psychic, the player preserves Plumeria and Enhanced Hammer; **if** the opponent still reattaches to the same Active on T4, on source T5 the preserved Plumeria would have another Basic Psychic target. The original T3 Plumeria native payment prompt had **seven non-Plumeria hand card options**, meaning that after using Crushing Hammer instead, at least **six** other cards would remain to fund the later Plumeria, before even considering the T5 draw. The paper Supporter quota also resets on source T5. This is a tangible conditional extra turn of energy pressure, not merely a raw physical-card efficiency argument.

Under these *explicitly altered-policy and unchanged-opponent-response assumptions*, the Hammer-first, Plumeria-if-tails-T3, and saved-Plumeria-T5-if-heads line could remove two attached Basic Psychic copies across T3 and T5 on heads, and one on tails; expected number of removals would be **1.5**, compared with the **one actually observed** in the original T3/T5 sequence. This is **not** an empirical win metric or unconditional stochastic dominance: the Hammer coin consumes RNG, the opponent's behavior can change, a new disruption lock may intervene, and the alternative source might rationally use its preserved Plumeria differently. Confirm all these conditions with original Store before promoting the line.

**Two distinct cost horizons must be kept separate.** The earlier **2.5 versus 3** physical-card calculation counts the *immediate T3 decision* if a Hammer heads result ends the turn without using Plumeria. The above **1.5-removal** estimate assumes the heads branch **does use Plumeria on T5** and that the tails branch uses it on T3. In that two-turn plan, *both* heads and tails branches spend **four** total physical cards (Crushing, Plumeria, Enhanced, and an additional X) by T5, compared with the original **three**. With `D2` denoting the value of an additional T5 denial and `vX` the opportunity cost of burning X, the simplified two-turn net benefit is **`0.5 × D2 − vX`**, before Supporter timing, RNG, opponent policy and other state differences. A positive physical-card count or the 1.5 expected denial count by itself is insufficient for a better-play conclusion.

## Generalized conditional two-turn decision threshold

The original T4 reattachment is a **single observed continuation**. We must not assume it repeats in the altered policy after a Hammer coin flip. A pure [sensitivity kernel](../../simulation/evaluation/agent25-denial-temporal-resource-model.cjs) therefore leaves **r**, the probability of a relevant fresh attached Basic Energy after the hypothetical Hammer-heads branch, as a free assumption between zero and one. Let **D₂** be the value of an additional T5 removal, **vP+vE** be the future value of preserving Plumeria and Enhanced Hammer if the extra target does not appear, and **vX** be the lost future value of one additional card in the T3/T5 Plumeria payment. With fair independent Crushing coin and conditional tails fallback, the alternative's *utility difference from original P-first* is:

`Δ = [r·D₂ + (1−r)·(vP+vE) − (1+r)·vX] / 2`.

The alternative is more valuable in this restricted model only when `vX < [r·D₂+(1−r)·(vP+vE)]/(1+r)`. Under the same assumptions, alternative physical cards spent in expectation = **2.5 + 1.5r**, expected Energy removals = **1 + 0.5r**. At r=0 this reduces to the earlier immediate-only 2.5-card, one-denial model. At r=1 it becomes the two-turn four-card, 1.5-denial scenario already described. **No empirical r is inferred from the selected 5/27 archival attachments** because opponent behavior, rank, source policy and source deals are heterogeneous and correlated. The model assumes native legality, legal future Plumeria payment, opponent Energy target and unchanged response structure, all awaiting authentic Store counterfactual checks. Its [pure tests](../../tests/agent25-denial-temporal-resource-model.test.cjs) explicitly reject a high-cost discard even when an additional removal is possible. This is a principled DCI/AMR boundary, not a deck strength or win-rate estimate.

## Existing native Hammer baseline that should be reused

[Agent29's already-passing pinned original Store Hammer test](agent29-hammer-owner-after-pass-native-20261030.md) has separately shown true `Crushing Hammer POR` heads and tails resolution, real public Energy removal on heads, original Store `canPlay` gating, and **two accepted rank-6 Hammer roots** in a historical four-arm development cohort (one physically settled removal). This establishes general native Hammer mechanics and an existing owner-visible after-Pass adapter. It **does not certify a legal Hammer action at the six specific Plumeria payment roots** catalogued here. The next experiment should reuse that tested adapter and the one common chooser, with a default-off ordering/arbitration intervention; building another engine or generic coin-flip test would duplicate verified work.

## Concrete integration test

The next strong result is one **same-deal, two-seat native policy branch** inside [Agent41's already existing canonical runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs), using the frozen T3 input and later five events:

1. At each authenticated owner root, measure actual Item lock, Supporter quota, owner hand, opposing Basic/Special Energy and **original native Crushing Hammer canPlay** before selecting either denial effect. Preserve the original source deal and acting seat.
2. Record the original Plumeria-first two-card prompt and exact selected printing multiset. In a default-off branch, select Hammer first and record actual native coin result, legal target, physical Energy discard, **and whether Plumeria subsequently remains playable**. Do not force a tails-only fallback to discard strategically protected cards.
3. On heads versus tails, record chosen next owner action, actual Store acceptance, prompt settlement, later owner root and genuinely responding opponent. Preserve both failed and successful branch executions and the RNG divergence triggered by the additional coin flip; no unqualified branch terminal counts as a competitive win.
4. Let one resource-aware chooser compare the direct Plumeria line, Hammer-first conditional play, and preserving both options. The printed card mechanics and actual cost-menu scores should be considered jointly with opponent matchup and the user's selected objective of a single fixed 60 against the complete field.

This is a specific **Archetype-Line-Specifics and Discard Capable Index interaction** grounded in six original native source actions. Its current output is a bounded experimental specification and a symbolic threshold, awaiting actual native canPlay, chosen coin branch and downstream competitive evaluation. No additional full-game runner was created.

**Field status unchanged:** 29/32 authenticated original final-place opponent 60s, ranks 23/25/28 missing, zero competitively qualified games, no evidence for 99.5%.
