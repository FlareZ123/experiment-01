# Jointly funded turn-two Noivern copy opportunity in seven verified Regidrago sources

**Agent 20 | 21 October 2026 | exact combinatorial opening-card study, not full gameplay or a win-rate measurement.** This follows [Agent 21's Noivern-to-rank-6 handoff](../../communications/agent20/20261021T0545Z_agent21_noivern-source6-control.md) and tests a joint access bottleneck. The wider benchmark still has **29/32 verified opposing 60s**, ranks 23/25/28 missing, **zero competitively qualified games**, and no demonstrated 99.5% fixed-deck win rate.

## Precise question

Among the nine **verified published Regidrago 60s** at ranks 10/12/13/14/18/20/21/27/32, how often could direct initial-card observations alone provide **both** a two-manual-attachment, second-own-turn Regidrago VSTAR Apex Dragon and an immediate way to put their singleton Noivern ex into discard?

The physical sequence is initial seven cards (conditioned on at least one Basic starter), six unknown face-down Prizes, a first-own-turn ordinary draw and a second-own-turn ordinary draw. No other draws, search, use of Items beyond the specified discard effect, prize-taking, mulligan bonus, Energy acceleration, opponent responses or Supporters are credited.

The restricted **funded-Apex necessary package** is Regidrago V and at least one relevant Energy seen by the first own draw (eight observed); then Regidrago VSTAR, at least one Double Dragon Energy and at least two total relevant Energy observed by the second own draw (nine observed). Relevant here means Double Dragon Energy or Basic Grass/Fire. One Double Dragon plus one Basic Grass/Fire, or two Double Dragon, can pay GGF through two manual attachments to the Dragon-type Regidrago line if no countereffect intervenes. The Regidrago V need only appear by first own draw, since a different Basic can be the initial Active. This excludes other possible legal attack routes and does not prove actual attachment/evolution decisions.

For the **Noivern payload**, exactly two disjoint restricted card-location routes are counted:

1. **Direct hand discard:** singleton Noivern ex and a Quick Ball or Mysterious Treasure appear among the first nine observed; a one-card discard cost can nominally place it in discard. Competing searches, execution order, and actual Item permission remain unverified.
2. **Deck Compressor:** Noivern is absent from the nine observed, at least one Battle Compressor is observed, and Noivern is in the remaining unprized deck. Conditional on unseen Noivern after nine observations, exactly 45 of the 51 remaining positions are unprized deck positions, giving **45/51**, with six Prize positions excluded.

Every row below intersects its Noivern routes with the **same simultaneously funded turn-two package**, avoiding a multiplication of unrelated access estimates. The source inventories and independently audited Basic counts come from [the frozen 29-deck manifest](full-decklists.json) and [opening audit](opening-hand-audit.json).

## Exact results

All percentages condition on a legal Basic-containing opening seven.

| Verified Aichi rank | Funded Apex resource package | + hand Noivern discard | + unprized deck Compressor | Combined funded Noivern opportunity |
| ---: | ---: | ---: | ---: | ---: |
| 10, no Noivern | 4.67599% | 0 | 0 | **0** |
| 12 | 4.67599% | 0.24315% | 0 | **0.24315%** |
| 13 | 4.25628% | 0.19838% | 0.65697% | **0.85535%** |
| 14 | 4.76935% | 0.24795% | 0.38562% | **0.63357%** |
| 18, no Noivern | 2.91355% | 0 | 0 | **0** |
| 20 | 4.76935% | 0.22403% | 0.38562% | **0.60965%** |
| 21 | 3.06367% | 0.15576% | 0.24492% | **0.40068%** |
| 27 | 4.67599% | 0.24315% | 0.37814% | **0.62128%** |
| 32 | 4.88367% | 0.22940% | 0.39482% | **0.62422%** |
| **Equal mean across seven Noivern ranks** | **4.44204%** | **0.22026%** | **0.34944%** | **0.56970%** |

**Interpretation:** In this deliberately restrictive, first-nine-direct-card model, only roughly **0.24%-0.86%** of legal-opening deals have the complete jointly funded early Noivern payload opportunity. The figure is neither a true gameplay success rate nor an upper bound on attainable Noivern lines: real decks have Ultra Ball, Supporters, draw, search, acceleration and later turns that this model omits. Also, card-location opportunity can fail because of DCI/UDP contention, Item lock or other action sequencing even if the exact cards are visible. The source-wide mean weights the seven lists equally; it is not a metagame-weighted win rate.

## Expansion: discard Noivern and fetch Regidrago V with the same Ball

**21 October follow-up, additionally confirmed by [manual source-manifest CI 39664929191](https://github.com/FlareZ123/experiment-01/actions/runs/39664929191) at head `4f9c68b586183da1fd1f0e431a0ac579ab759c6b`.** The preceding table is the originally registered **direct-Regidrago-V-only subset**. A valid alternative uses the same held Quick Ball or Mysterious Treasure on **own turn one** both to discard Noivern ex and **search for Regidrago V**. It can satisfy the copy-payload and Basic-attacker setup axes in one action. This was absent from the first strict model and materially changes the direct restricted opportunity estimate.

For an additional, **disjoint** event, require *no Regidrago V* among the first eight observed cards; require **Noivern plus at least one Quick Ball/Mysterious Treasure among the first eight**, a relevant Energy by then, and VSTAR plus two Energy including a Double Dragon Energy by the second ordinary draw. To use the Ball for V on first own turn, at least one V must exist outside the six Prize cards. If the second normal draw itself is a V, this is guaranteed because that card was still in the searchable deck on first own turn. Otherwise, conditional on all `v` physical V copies outside the nine observed cards, the exact searchable probability is `1 - C(6,v)/C(51,v)`. The added route is disjoint from the first-eight **held** Regidrago V route; its exact fraction is therefore added without double-counting. It presupposes an Item-permitted action, affordable discard, correct chosen target and subsequent evolution/attachments. These remain unverified gameplay requirements.

| Verified Aichi rank | Earlier direct-V+payload | Additional dual-purpose Ball fetch V | Expanded restricted union |
| ---: | ---: | ---: | ---: |
| 10, no Noivern | 0% | 0% | **0%** |
| 12 | 0.24315% | 0.31969% | **0.56284%** |
| 13 | 0.85535% | 0.18827% | **1.04362%** |
| 14 | 0.63357% | 0.30578% | **0.93935%** |
| 18, no Noivern | 0% | 0% | **0%** |
| 20 | 0.60965% | 0.27599% | **0.88564%** |
| 21 | 0.40068% | 0.28425% | **0.68493%** |
| 27 | 0.62128% | 0.31969% | **0.94098%** |
| 32 | 0.62422% | 0.26240% | **0.88662%** |
| **Equal mean over seven donor lists** | **0.56970%** | **0.27944%** | **0.84914%** |

All percentages are conditional on a Basic-valid opening seven and exclude actual opposing actions. The expanded union **still leaves out many legitimate routes**: an observed V fetched through another connector, Ultra Ball that both discards Noivern and searches V (its two-card discard is strategically costly), professor hand discard, draw/search that finds missing Energy or VSTAR, Forest Seal Stone, and later-turn play. Reuse of the same one-discard Ball is logically plausible under printed effects, but does not ensure that spending it on V beats searching a competing Pokémon or preserving it to reach another piece. This is a strict resource-location model with one specifically admitted setup action, **not a measured turn-two attack incidence, success probability, or opponent matchup strength**.

The independent small-deck enumerator now checks both the *ninth-draw-is-V* case and exact six-Prize V unavailability inside each physical permutation; the source-loaded suite passes in the second manual CI above. The added result shows precisely why connector opportunity cost should be modeled as **multi-channel action fulfillment** rather than treating each Ball as only one resource route.

## Matchup hypothesis and causal limitation

The [exact rank-6 Iron Thorns source](full-decklists.json) has four Basic Iron Thorns ex attackers and eight Special Energy (four Speed Lightning, two Capture, one Spiky, one Double Colorless). Noivern ex PAL153's **Covert Flight** can protect the copied Regidrago attacker from attack damage by Basics on the following opposing turn; **Dominating Echo** can stop Special Energy and Stadium cards played *from hand* on that next opposing turn. Iron Thorns's Initialization removes Regidrago VSTAR's Ability, while its printed **Apex Dragon remains an attack**. The copy's required Energy cost remains Apex Dragon's GGF; the selected Noivern attack's own cost is not additionally paid (Advanced Player's Rulebook C-18).

Rank 6 also has three Guzma, may already have sufficient attached Energy, and can move Energy through the non-damage effect of Volt Cyclone. The deck's ability to bypass protection, the need to play another Energy from hand, and the opportunity cost of choosing a Noivern attack rather than another Dragon payload all depend on actual game state. **This study does not demonstrate a favorable rank-6 matchup.**

The joint early-card result cautions against testing a convenient, already assembled Regidrago/Noivern board and presenting it as representative of source-dealt games. A native test needs the real source-discard step, energy/evolution chronology, opposing actual first turn, copied-attack settlement, next-source-turn effects, gust bypass and a failure-inclusive denominator.

## Reproduction and independent validation

- [Pure BigInt physical-category enumerator](../../scripts/aichi-regidrago-noivern-funded.cjs) counts all legal seven-card opening category vectors and two ordered ordinary draws. The six Prize cards are explicitly marginalized; its normalization is asserted exactly against `(C(60,7)-C(60-B,7))*53*52*51`. For the Compressor branch, the successful remainder contributes `45` while normalization contributes `51`.
- [Independent ordered-card brute-force tests](../../tests/aichi-regidrago-noivern-funded.test.cjs) exhaust small physical decks whose Prize slots are explicitly enumerated; tests cover both donor routes, their union and a missing-donor control. Source-level regression tests assert all nine printed lists' Basic counts, Double Dragon counts, the seven one-copy Noivern ranks, and the source rank-13 result.
- Independent previously reported [rank-10 funded-Apex fraction](agent21-rank28-direct-apex-turn2-resource-20261021.md) is reproduced exactly as **166373119 / 3558030450 = 4.6759891838%**, providing a cross-algorithm check on energy chronology and non-Prize marginalization. All three local Node 22 tests passed, including source-schema tests with fixture source-shaped counts. More importantly, the **[manual GitHub Actions audit 39663344048](https://github.com/FlareZ123/experiment-01/actions/runs/39663344048) passed** at head `6ed776aef2b35a96cb6a7b57556b8b9cc571f532` against the actual repository source manifests, executing all new regression tests and the full nine-source table through [regidrago-temple-answers.yml](../../.github/workflows/regidrago-temple-answers.yml). This is exact-count/code verification, not a compiled Twinleaf match.

The repository's final deck selection, full 32-source coverage, actual native action policy, rules fidelity and paper-clock game-win qualification remain open.
