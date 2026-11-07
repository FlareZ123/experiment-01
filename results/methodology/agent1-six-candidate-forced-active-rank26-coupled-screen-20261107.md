# Agent 1: six-candidate forced-Active exposure and rank26 Meloetta coupled root

**7 November 2026, paper Expanded, development-only.** Exact opening combinatorics and a separately constrained source-resource intersection. The 99.5% objective remains unmeasured. This report adds structural evidence across the four historical fixed candidate references and two separately registered structural challengers, with **no candidate promotion**.

## Question

How often does each unchanged 60 produce an initially forced single Basic Pokémon, especially one with low printed HP or one knocked out by a theoretically settled unmodified Psychic **Crisis Punch 280** from original Aichi rank26? Which of those vulnerable starts overlap the independently published original rank26 source's exceptionally narrow *direct* Energy positioning condition?

This is a **starting-state screen**. It deliberately does not count a native terminal, perform a game, choose the opponent's attack, resolve any Prize, or claim an actual knockout occurred.

## Source and execution

- Archived exact original 60s: `results/aichi-2026/full-decklists.json`, **29/32** original placements, ranks **23/25/28** still unpublished. All 29 original **card-name/count inventory** lists are used unchanged. The English printed mechanical proxy fields are checked against the bundled `resources/sets/en.json` and `resources/cards/en/*.json`. This is **not** independent verification of historically played Japanese art or printings; earlier Agent17 audit found later release dates on many Basic Energy display IDs.
- Six fixed printed candidates: original champion rank1, Hood Shield v1, Temple Shadow Rider v1, New Moon Lockbreaker v1, Apex Alchemy v0, Sentinel Lopunny Vileplume v1. No copy count or card identity was changed.
- The author-played [original rank26 Meloetta Donk article](https://note.com/hibi2571/n/n9f4c7d7568b8), the bundled printed **Meloetta ex BLK44** (Debut Performance allows an attack going first on its own first turn), and the source's **TM: Crisis Punch PAF90** (280 Psychic damage, conditioned on the opponent having exactly one Prize left) establish a possible first-turn route. Its five self-KO, Risky Ruins/Exeggcute, Lightning, DCE, Tool, source ability and actual attack payments require separate realization. Agent3 and Agents47/50 have independently staged this conditional source line with real Store tests; their staged attacks are **not natural complete competitive games**.
- Reused the already independently checked [Agent3 two-player source-Energy-plus-lone-Basic coupling](../../scripts/agent3-rank26-coupled-lone-basic-root.cjs) without changing its source premise, optional bonus-draw policy, geometric tail or narrow direct-Energy limitation.
- Pinned **manual-only**, native-free 3-minute CI job `aichi-forced-active-screen` in the already existing `.github/workflows/agent1-issue25-baseline-sham-v9-native.yml`. [Final green run **42337386491**](https://github.com/FlareZ123/experiment-01/actions/runs/42337386491) checkout SHA `f4fa834e335b81cf52c5d59c4a46fc51c6e7c252` passed **five exact source and card-print tests**, exhaustive toy-deck independent enumeration, 29/29 original printed Basic identities, 6/6 candidate IDs, a legitimate non-Basic setup exception guard, and an independent rank18 300-HP survivor exception.

## Exact model

For a 60-card deck with B physically printed Basic Pokémon, of which L satisfy a specified property, consider the first *legal* seven-card opening hand, after any necessary own mulligan redraws. If the hand contains **exactly one** Basic from that subset, that Pokémon is forced into the Active Spot, because all six remaining cards are non-Basic. Count the legal and favorable unordered seven-card hands:

\[
P(\text{sole Basic with property}\mid\text{legal seven})
=\frac{L\binom{60-B}{6}}{\binom{60}{7}-\binom{60-B}{7}}.
\]

The initial failed-hand/mulligan probability is \(\binom{60-B}{7}/\binom{60}{7}\). This exact combinatoric formulation was independently enumerated for every seven-card subset of a twelve-card toy deck and checked against `BigInt` rational results. Six Prize cards are set **after** the starting hand; their random locations are already integrated into this unconditional original-60 uniform opening selection.

**Important boundary:** an opponent may grant optional bonus draws for its own mulligans, and those extra cards can supply Benched Pokémon after the Active is chosen. Consequently the sole Basic in the original seven is a **forced Active**, but does not automatically mean the player still has only one Pokémon in play when the opponent attacks. Likewise, a low-HP starting Active can have a relevant Ability, be switched, be supported by Bench placement, or survive a damage prevention effect. These exact probabilities are **not** game losses or donk wins.

### Six fixed candidate results

Percentages are conditional on a legal own seven and fixed original card counts, before the opponent's optional bonus cards.

| Frozen 60 | Basic copies B | At most 90 HP, L | Forced HP≤90 | Forced any sole Basic | Forced printed Psychic 280 KO¹ |
| --- | ---: | ---: | ---: | ---: | ---: |
| Champion original rank1 | 14 | 3 | **8.4466%** | **39.4176%** | **39.4176%** |
| Hood Shield v1 | 14 | 3 | **8.4466%** | **39.4176%** | **39.4176%** |
| Temple Shadow Rider v1 | 15 | 3 | **7.1694%** | **35.8469%** | **35.8469%** |
| Apex Alchemy v0 | 12 | 3 | **11.7777%** | **47.1109%** | **47.1109%** |
| Sentinel Lopunny v1 | 14 | **13** | **36.6021%** | **39.4176%** | **39.4176%** |
| New Moon Lockbreaker v1 | 17 | 8 | **13.7780%** | **29.2782%** | **29.2782%** |

¹ **Printed Psychic 280 KO** checks the *exact original Basic printing* of each physical copy, starting full HP, after only that printing's Psychic Weakness and Resistance. It omits Ability protections, opponent Item lock, Tools, prior damage, attack modifiers, alternate route and paper special conditions. In all six candidate 60s, each qualifying printed Basic is vulnerable to a plain 280 Psychic damage amount, so the rightmost column equals the sole-Basic column. It is not the chance of rank26 achieving the attack.

**Key comparison and correction to naive heuristics:** Sentinel has thirteen of fourteen eligible Basics at **90 HP or less**, nearly four and a half times the champion's *forced-low-HP* exposure, but their **printed-280 conditional sole-KO exposure is identical** because each list has fourteen Basic cards, and all are within that particular damage threshold. Claiming Sentinel suffers a higher **rank26 Meloetta** one-shot rate merely from the HP90 metric would be unwarranted. The threat's actual damage, allowed first-turn Ability, opponent setup, source access to Crisis Punch, and possible counter-Abilities determine the relevant test.

### Independent source original screening

All **29/29** original decks resolved through exact set code/collector number/name and valid Pokémon subtype. Six previously failed rows were the *same Unicode typography difference*: the source lists encoded the printed Prism Star symbol as `♢` (U+2662), while the supplied database encodes `◇` (U+25C7). The resolver permits this alias **only if** the actual matched Pokémon's subtype is *Prism Star*, with its set, collector number and remaining name still matched. Checked literal IDs `sm8-154` for Ditto Prism Star and `sm9-51` for Tapu Koko Prism Star. It does not freely normalize ordinary Pokémon names or invent missing printings.

The printed Psychic 280 screen independently recovers the known **rank18** exception: 16 source Basics, of which 15 are directly KOable and one has **300 HP** without enough Psychic susceptibility to be KO'd by unmodified 280. Its forced-sole-print-KO chance is **30.4369%**, versus **32.4660%** for any sole Basic. This agrees with the independent earlier [Agent3 source-HP and Weakness/Resistance audit](https://github.com/FlareZ123/experiment-01/commit/03688e54a32c05394558c7dce9f297cbf619c925). Other original decks have many different low-HP and forced-opener profiles. Printed HP does not certify the outcome after dynamic effects.

## Source rank26 direct Energy-root intersection

The preserved [Agent3 coupled mulligan and direct Energy root module](../../scripts/agent3-rank26-coupled-lone-basic-root.cjs) models a *restrictive physically favorable subset*: rank26 is assigned the going-first seat; both players are subject to actual Basic mulligan redraws, candidate is left with exactly one Basic after modeled optional bonus draws, and source has a restricted direct Energy placement (DCE available and Lightning remaining for Koko). We run the same source-independent function with each candidate's printed Basic count, and multiply by the uniform-identity Psychic280-eligible fraction (all six fractions are one).

| Frozen 60 | Restrictive source-root ∩ candidate lone-Basic physical setup |
| --- | ---: |
| Champion | **1.06436%** |
| Hood Shield | **1.06436%** |
| Temple Shadow Rider | **0.96049%** |
| Apex Alchemy | **1.29446%** |
| Sentinel Lopunny | **1.06436%** |
| New Moon Lockbreaker | **0.77358%** |

**These values are neither predicted Meloetta attacks nor global upper bounds.** Rank26 may obtain the needed cards through search/draw paths outside the restrictive direct-Energy root; even within the counted roots the five Exeggcute self-KO sequence, TM access, first-turn Ability, payment, prevention, source choices and knockout all remain unsettled. The numbers measure exactly the narrow source physical co-location modeled, with the existing module's geometric tail bound below \(4\times10^{-34}\) in every studied candidate. A larger source completion model and a competent opposing policy are necessary before estimating any matchup.

## Limitations, decisions and next falsification

- **No evidence of relative game wins.** The six candidates share at least one anti-donk problem: a single opener that can be knocked out by 280. All differ in actual counter-Abilities and counterplay. For example, an Active Klefki in New Moon or an Active Iron Thorns in the source field may suppress Meloetta's *Debut Performance*, whereas a true source Canceling Cologne line can alter that. Psychic damage prevention, switching, other Benched Pokémon and paper-clock availability matter. We did not simulate these interactions or count them as protection.
- The **rank26 original source** is an aggressive potential first-turn opponent. Source card line and historical usage are grounded by the first-person Aichi article, exact registered cards and earlier reproduced real Store staging. There is no newly demonstrated realistic source-line execution rate across the six candidates; do **not** extrapolate its tournament placement into a 99.5% target or assign candidate wins/losses.
- The standard formula assumes a valid starting Basic is a Pokémon with printed subtype `Basic`. There are legitimate **card-text exceptions** for certain non-Basics, including Cinderace MEG's *Explosiveness*. The new implementation explicitly quarantines decks containing a non-Basic printed setup exception from this Basic-only calculation, and has a real-card regression. None of the 29 original decks or six candidates triggered this gate.
- Recommended targeted next experiment: pre-register one source-first original rank26 selected-deal run for each fixed candidate, freeze physical opening and side, record every Exeggcute self-KO and all five Prizes, actual source Bench/Ability/Tool state, paid Energy and printed Crisis Punch attack, the opponent's full Bench after optional bonuses, all Ability/Tool prevention and legitimate counter-choices, plus official game clock. A single staged terminal alone cannot qualify an adversarial paper game.
- Preserve **29/32 original names/counts**, missing **ranks 23/25/28**, **zero competitively qualified games**, no final fixed 60, no observed 99.5% field win rate.

## Code and reproducibility

- `simulation/evaluation/aichi-forced-active-opener.cjs`: reusable exact BigInt formula, printed Pokémon ID/HP resolution, narrow Prism glyph alias, printed 280 Weakness/Resistance, setup exception fail-closed.
- `simulation/evaluation/agent1-rank26-six-candidate-root.cjs`: independent six candidate extension importing **existing** Agent3 rank26 source coupling.
- `tests/agent1-aichi-forced-active-opener.test.cjs`: complete source roster and fixed candidate enum, toy exact enumeration, negative printing controls, real Cinderace setup exception, rank18 original 300HP survival.
- `tests/agent1-rank26-six-candidate-root.test.cjs`: exact original rank26 printed Ability and TM evidence, six-candidate versus existing Agent3 `joint` equality, rank1 control/source equality, geometric tail and positive controls.
- Lightweight manually dispatched [CI 42337386491](https://github.com/FlareZ123/experiment-01/actions/runs/42337386491), exact source HEAD `f4fa834e335b81cf52c5d59c4a46fc51c6e7c252`, full PASS. No Twinleaf compile, no gameplay CPU and no intervention to shared bot/engine.
