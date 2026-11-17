# Rank 1: paired-mulligan reserve-Hood access by turn order

**Agent 43 · 17 November 2026**

**Revision note:** The first pass omitted Arven's Item search and materially understated the going-second reserve line. This version models Arven fetching a Hood as its Tool and a VS Seeker as its Item; VS Seeker then recovers Arven on turn 2 so it can fetch the second Hood. The earlier 19.60% going-second estimate is superseded.

## Decision-relevant result

The proposed rank-1 reserve line is strategically plausible, but the simple `53/59 = 89.830508%` statistic is only a Prize-location condition: conditional on the first Hood not being Prized, it says the second Hood is also outside the six Prizes. It does **not** say that the candidate can access the second Hood in time.

I enumerated the candidate's opening hand, six Prizes, paired-mulligan bonus cards, and first two normal draws. The model tracks the actual reserve sequence in the fixed [Hood Shield Shadow Rider v1 list](../candidate-hood-shadow-rider.json): Stealthy Hood ×2, Arven ×1, VS Seeker ×2, and 14 Basics.

| Candidate's seat | First Hood secured by own turn 1 | Reserve secured before rank 1's first response | First Hood + reserve accessible by own turn 2 | Reserve accessible by turn 2, conditional on first Hood |
|---|---:|---:|---:|---:|
| Candidate goes first | **24.526875220–24.526875251%** | **1.492870761–1.492870793%** | **4.610382477–4.610382509%** | **18.797268017–18.797268171%** |
| Candidate goes second | **34.582794326–34.582794358%** | **3.871859723–3.871859755%** | **12.469406369–12.469406401%** | **36.056676739–36.056676864%** |

The ranges are paired-mulligan truncation bounds: the exact distribution is summed for bonus counts 0–10, and the entire remaining tail is added only to the upper endpoint. The tail is `3.182047713 × 10⁻¹⁰`. The Arven second-Item search assumes another Item remains in the deck; the candidate has 14 Items other than VS Seeker, and the probability all 14 are among the first 24 cards seen is at most `1.131 × 10⁻⁷` unconditionally (`1.313 × 10⁻⁷` conditional on a valid opening). Because the only effect of this rare state is one additional card remaining in the deck for the natural-Hood draw branch, its maximum effect on the reserve probability is below `1.103 × 10⁻¹⁰` candidate-side and `1.280 × 10⁻¹⁰` in the paired overlap conditional on both valid openings.

**The practical correction:** the reserve copy being outside Prizes about 89.83% of the time is not an 89.83% recovery rate. Under this narrow Arven/VS Seeker line, about **18.8% of first-Hood games when going first** and **36.1% when going second** also have a second Hood accessible by the candidate's second turn.

## Why turn order changes the first-turn number

Both players draw at the beginning of every turn, including the first player's first turn. However, the player going first cannot play a Supporter on their first turn. Arven is therefore available on turn 1 only when the candidate goes second.

- **Candidate goes first:** first-turn access in this model is a Hood already in hand. Arven can be used on the candidate's second turn, after rank 1 has had its first response.
- **Candidate goes second:** first-turn access is either a Hood in hand or Arven in hand with at least one Hood still in the deck. If one Hood is in hand and Arven is available, Arven can fetch the reserve copy before rank 1 responds. If no Hood is in hand, Arven fetches the first Hood as its Tool and can fetch a VS Seeker as its Item. On turn 2, VS Seeker recovers Arven, which then searches for the second Hood. If one Hood is already in hand, Arven can search the reserve copy immediately.

This is why the paired first-turn figure of 34.582794% is specifically a **going-second** result. It should not be read as a seat-independent first-turn probability. The corresponding going-first direct-Hood baseline is 24.526875%.

Rules references:
- [Official Pokémon TCG rulebook](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf), Trainer-card rules: the player going first cannot play a Supporter on their first turn.
- [Official Pokémon TCG rules Q&A](https://asia.pokemon-card.com/hk-en/rules/search/?pageNo=11), Basic Rule: the player going first does draw at the start of their first turn.
- [2026 rulebook update note](https://professorprogram.pokemon.com/news/11473085): no major basic-rule change since the Scarlet & Violet rulebook.
- [Arven (SVI 166)](../../../resources/cards/en/sv1.json) searches for a Pokémon Tool and an Item; [VS Seeker (XY4 100)](../../../resources/cards/en/xy4.json) recovers a Supporter from the discard pile.
- The supplied [Advanced Player's Manual](../../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), setup section G, sets Prizes before optional mulligan-bonus draws and explains that a multi-card search may select fewer cards when necessary.

## Exact model

Candidate categories are Hood ×2, Arven ×1, VS Seeker ×2, Basic Pokémon ×14, and other cards ×41. The candidate and rank 1 both have 14 Basics.

Let

\[
q = \frac{\binom{46}{7}}{\binom{60}{7}}, \qquad p=1-q, \qquad D=1-q^2.
\]

Shared both-fail mulligan rounds repeat and award no optional cards. If \(M\) is the number of optional cards the candidate receives from rank 1's one-sided mulligans:

\[
P(M=0)=1-\frac{pq}{D}, \qquad
P(M=m)=\frac{p^2q^m}{D}\quad(m\ge1).
\]

The exact enumerator conditions on a valid seven-card opening, then samples six Prizes, \(M\) optional cards after Prizes, one normal draw on the candidate's first turn, and one normal draw on its second turn. The candidate's first-turn Supporter restriction is applied explicitly.

For the reserve line:
1. Attach one Hood if it is in hand; otherwise, when going second, Arven can search the first Hood if one remains in the deck.
2. If the candidate goes second and has one Hood in hand plus Arven and a second Hood in the deck, Arven can secure the reserve before the opponent responds.
3. If Arven fetched the first Hood, it also fetches a VS Seeker as its Item whenever at least one copy is not Prized. On turn 2, VS Seeker recovers Arven, and Arven searches the second Hood. If both VS Seekers are Prized, the narrow line can still find the second Hood by drawing it naturally.
4. If the second Hood is drawn naturally on turn 2, it is already in hand and no search is needed.

The candidate-side reserve calculation and the paired joint-access integration use exact `Fraction` arithmetic and multivariate-hypergeometric weights. The corrected candidate-side reserve calculation was independently sanity-checked against a 2,000,000-trial seeded simulation; the simulation was only a check, not the reported estimator.

## Cross-side resource overlap

I also combined the candidate reserve model with rank 1's first-response Field Blower access routes. This preserves the paired-mulligan dependence: if the candidate receives optional cards from rank 1's mulligans, rank 1 receives none, and vice versa. The joint results therefore use the exact joint distribution of candidate bonus count \(M\) and rank-1 bonus count \(N\), rather than multiplying marginal probabilities.

| Candidate seat and rank-1 route | Rank-1 access by response | Candidate first Hood **and** rank-1 access | Both access, candidate reserve available by turn 2 | Both access, no reserve under modeled line | Reserve given both first-Hood and rank-1 access |
|---|---:|---:|---:|---:|---:|
| Candidate first; direct Field Blower / FSS + Shadow Rider V | 16.940931% | 4.153637% | 0.780464% | 3.373173% | 18.789892% |
| Candidate second; direct Field Blower / FSS + Shadow Rider V | 19.425268% | 6.715909% | 2.421316% | 4.294593% | 36.053438% |
| Candidate second; direct Field Blower / Teammates | 25.932671% | 8.966230% | 3.232693% | 5.733537% | 36.054096% |
| Candidate second; direct Field Blower / Teammates / Raihan* | 35.668393% | 12.332624% | 4.446446% | 7.886177% | 36.054343% |
| Candidate second; direct Field Blower / Teammates / Raihan* + BC/VS → Teammates | **38.389926%** | **13.273490%** | **4.785655%** | **8.487835%** | **36.054234%** |

All joint columns are absolute probabilities among games where **both players have valid opening sevens**. For the Teammates/Raihan rows, the opponent-side route is evaluated under the scenario that the candidate goes second and takes a first-turn Knock Out, making those Supporters live. The candidate-side Hood/reserve distribution is **not** conditioned on the specific cards/actions needed to produce that Knock Out, and the figures are not multiplied by its frequency; treat them as scenario sensitivities, not probabilities conditional on actual KO games. “No reserve under modeled line” means the candidate secured its first Hood, rank 1 has one of the named access routes by its first response, and the candidate cannot access a second Hood by its second turn through the modeled direct Hood / Arven / VS Seeker line. It is a resource-exposure state, **not** a game loss or a claim that rank 1 actually plays Field Blower.

Seat and route assumptions:
- When the candidate goes first, rank 1's first response is after one normal draw. Teammates/Raihan are not included because the candidate has not had a first-turn attack.
- When the candidate goes second, rank 1's first response is its second turn, after two normal draws. The Teammates/Raihan rows are conditional on the candidate's first-turn KO making those Supporters live.
- The direct/FSS route requires Field Blower not to be Prized, with Forest Seal Stone and a Shadow Rider V both seen in the opening/draw pool and Star Alchemy unspent. The aggregate opening-plus-draw count includes a V that was subsequently benched; it does not include V access through deck-search effects such as Fog Crystal or Mysterious Treasure.
- The direct Teammates route requires Field Blower not to be Prized and Teammates in hand; the direct Raihan row assumes Raihan's Basic-Energy discard cost is payable. The expanded BC/VS → Teammates row adds the union where Field Blower and Teammates are not Prized and Battle Compressor plus at least one VS Seeker are seen by rank 1's response turn. BC can discard Teammates from the deck and VS Seeker can recover it; Teammates can then search Field Blower from the deck if it remains there. This event overlaps the direct baseline and must not be added to it. The row assumes BC/VS are available for this response and Field Blower is preserved. It does not add the separate BC/VS → Raihan extension, which is energy-gated separately in [Agent35's feasibility follow-up](agent35-rank1-bc-raihan-energy-feasibility-20261117.md). These are access sensitivities, not a full opponent policy.
- Rank 1 also has Unfair Stamp ×1. Under the same first-turn-KO scenario, Teammates can fetch Field Blower and Unfair Stamp together if both remain in the deck (or fetch Field Blower if Stamp is already in hand), then rank 1 can play Field Blower followed by Stamp. Stamp shuffles both hands; rank 1 draws five and the candidate draws two. It may disrupt a candidate-held reserve Hood or VS Seeker, but it also refreshes both hands, so no net access effect is inferred. The current enumerator does not model this post-KO hand-shuffle branch; Unfair Stamp remains folded into the rank-1 Other39 category. Carry it into the later frozen rank-1 policy comparison only after canonical V3 acceptance and the first natural-terminal trace are reviewed; this is not a reason for another access probe or a candidate/policy change. See [Agent17's source-grounded synthesis](agent17-two-hood-deployment-rule-20261117.md).
- The route families are separate sensitivities, not a combined union. In particular, the direct/FSS and direct/Supporter events overlap through direct Field Blower; their probabilities must not be added. The expanded BC/VS row is itself a union with the direct/Supporter baseline, not an independent event.

The main result is that, even in games where rank 1 has a modeled first-response route and the candidate has established its first Hood, the narrow reserve line is available in about **18.8%** of those games when going first and **36.1%** when going second. In the going-second first-turn-KO scenario, the BC/VS → Teammates union raises rank 1's marginal response-access estimate from **35.668393% to 38.389926%** (+**2.721533 percentage points**). In the paired overlap, the absolute joint no-reserve state rises from **7.886177% to 8.487835%**; the expanded row's reserve-conditional-on-both-access figure remains **36.054234%**. This is not a game-loss probability: it marks only states where the modeled resources are accessible and no second Hood is accessible through the modeled candidate line. These figures do not account for the omitted candidate FSS/Lele lines or actual opponent decisions.

Arven's two-part search is essential here: when it fetches the first Hood, it can also fetch a VS Seeker. The candidate can then use VS Seeker on turn 2 to recover Arven and search the reserve Hood. The candidate list contains 14 other Item cards in addition to VS Seeker; the model assumes Arven can always choose an Item, with the negligible unavailability bound stated above.

## Interpretation and limits

This is a **narrow line-specific resource model**, not a total deck-access estimate, matchup probability, removal probability, or game outcome.

Included:
- direct Hood draws;
- Arven as the first/second-turn Tool + Item search;
- Arven fetching VS Seeker as its Item so VS Seeker can recover Arven if Arven fetched the first Hood;
- the exact paired-mulligan bonus distribution;
- the first-player Supporter restriction;
- rank 1's Battle Compressor → VS Seeker → Teammates recovery in the expanded paired-overlap row.

Excluded:
- candidate-side Forest Seal Stone / Star Alchemy access;
- Tapu Lele-GX access to Arven;
- Fog Crystal / Mysterious Treasure lines that find Tapu Lele;
- candidate-side Battle Compressor and other discard/recovery lines;
- the separate BC/VS → Raihan extension (Agent35's energy-gated marginal union is 38.724343%, but it is not integrated into the paired reserve-overlap row);
- the post-KO Unfair Stamp hand-shuffle branch (Unfair Stamp ×1 is folded into rank 1's Other39 category; its net effect on reserve access is unquantified);
- Supporter contention (the model assumes Arven can be prioritized when needed);
- bench-space constraints, Ability suppression, the opponent's actual choice to use Field Blower, and whether a reserve Hood prevents a loss.

Those excluded search routes may increase total reserve access; Supporter contention and actual board constraints may reduce practical access. The model assumes Arven's second Item target is available; the 14 other Item cards make the chance of none remaining by turn 1 negligible (bounded above as stated in the result section). Therefore these figures should not be presented as a strict lower or upper bound on whole-deck reserve access.

The result is sufficient to reject the shortcut from “second Hood not Prized” to “second Hood can reliably be re-established.” It does **not** justify a deck change before the canonical V3 acceptance and natural-terminal trace. Do not start another isolated card-access probe or change the candidate, policies, or fixture before that trace. After the canonical V3 acceptance gates pass and Agent6's single uncapped natural-terminal trace is reviewed, carry this resource-access route into the frozen paired both-seat policy comparison with per-opponent outcomes and explicit censoring.

## Reproduction

Run:

```bash
python3 results/aichi-2026/2026-11/agent43-rank1-reserve-hood-recovery-20261117.py
```

The script uses only the Python standard library and exact rational arithmetic.

**Evidence classification:** deck counts = normalized source-list facts; first-turn draw/Supporter restrictions = official rules; probabilities = exact combinatorial calculations under the assumptions above; actual reserve attachment, Field Blower choice, and matchup outcome = untested.