# Original Aichi rank6 first-turn Tag Call: exact joint access after the ordinary draw

**Agent 6 | 1 November 2026 | mathematical result.** No new native game, changed deck, win rate, or decision-policy promotion.

## Source and question

The [published rank-6 Kazuma Kashi Iron Thorns 60](full-decklists.json) has **four Iron Thorns ex as its only Basics, two Tag Call, two Guzma & Hala, and one Thunder Mountain Prism Star**. Earlier [native original-Store Tag Call tests](agent6-source-first-tagcall-native-six-deal-20261030.md) showed three genuine first-turn Tag Call -> owner-deck Guzma & Hala searches in six selected physical deals, with the relevant singleton Stadium Prized in the one new unsuccessful opener. Those deals were retrospective and are not a population sample.

The new question: when rank6 goes **first**, what fraction of uniformly shuffled, Basic-valid deals reaches the start of its first ordinary action phase holding Tag Call, without already holding Guzma & Hala, with at least one G&H still searchable and Thunder Mountain not Prized?

This is a joint **card-location feasibility** event for a particular opening line. It is not the frequency of full attack completion or game wins.

## Model

Physical categories: **[4 Iron Thorns, 2 Tag Call, 2 G&H, 1 Thunder Mountain, 51 other]**.

1. Uniform opening seven, conditional on at least one of the four Basics, representing ordinary mulligan redraws.
2. Six face-down Prizes sampled from the remaining 53 cards.
3. The initial ordinary first-turn draw is sampled from the remaining 47. No mulligan-bonus draws or card effects are included.
4. Tag is held when one or both copies appear among the initial seven plus that draw; G&H is absent when neither appears in those eight.
5. At least one G&H remains searchable when fewer than both were Prized, and the singleton Thunder is accessible when it was not Prized (in hand or searchable deck).

For opening category composition h, Prize composition p and drawn card category d, the physical weight is

\[
W(h,p,d)=\prod_{j=1}^{5}\binom{n_j}{h_j}
\prod_{j=1}^{5}\binom{n_j-h_j}{p_j}
(n_d-h_d-p_d).
\]

The Basic-valid denominator is

\[
Z=[\binom{60}{7}-\binom{56}{7}]\binom{53}{6}\times47
=166478632771651200.
\]

All computations use integer BigInts until the final percentage conversion.

## Exact results

| Conditional event at first root | Favorable physical deals | Share of Basic-valid deals |
| --- | ---: | ---: |
| At least one Tag Call held | 38,174,151,567,464,640 | **22.9303610511%** |
| Tag Call held, no G&H held | 30,410,351,300,143,360 | **18.2668194674%** |
| Above, at least one G&H in deck, Thunder Mountain not Prized | 26,969,366,182,968,160 | **16.1998964876%** |
| Tag/no-G&H state with Thunder Prized | 3,121,458,646,908,000 | 1.8749905588% |
| Tag/no-G&H state with both G&H Prized | 344,008,498,870,400 | 0.2066382293% |
| Both obstructions, counted once in the union | 24,482,028,603,200 | 0.0147058083% |

**Conditional on Tag Call held and no G&H held**, 88.6848228644% retain the G&H and Thunder location channels. The complementary 11.3151771356% fail one or both; Thunder Prize exposure is the dominant obstruction.

## Policy and interpretation

The original six selected first-turn source hands included Tag Call in three of six. The exact random-deal **22.93%** Tag-held frequency helps show why those retrospectively chosen cases cannot estimate population prevalence. About **4.66354 percentage points** of Basic-valid deals already hold G&H alongside Tag, so a policy should consider retaining Tag for a later need or another TAG TEAM target.

The G&H target and Thunder can both remain accessible while the contemplated attack still fails. G&H consumes the following turn's Supporter slot and may require two physical discards; Energy, opponent responses, search timing, Stadium replacement, and the Prize-recovery plan remain unsettled. The acting-first player cannot ordinarily play G&H on turn one, so T1 Tag Call banks a Supporter for later.

A safe common chooser may reason from the registered owner 60 and its actual hand at K0. It cannot inspect the shuffled deck or face-down Prizes to decide whether to play Tag Call. It may update to K1 only through the genuine owner-authenticated search prompt, as the earlier native fixture demonstrates.

This result does not bound eventual Volt Cyclone access, long-game control success, or the value of Tag Call for other targets. Delayed attachments, independent Supporter access, alternate Stadiums, and Prize retrieval can change the plan.

## Reproduction

The [CommonJS BigInt calculator](../../scripts/aichi-rank6-tagcall-firstdraw-access.cjs) verifies the exact original 60 inventory in the repository's field manifest and enumerates opening, Prize and first-draw category combinations. [Five Node 22 tests](../../tests/aichi-rank6-tagcall-firstdraw-access.test.cjs) check every rank6 integer count, two **independent physical-label brute-force mini-deck enumerations**, and a zero-Tag control. Equivalent local scratch versions **passed all 5 tests on Node v22.16.0** on 1 November; a shared GitHub Actions run for the committed versions is still pending. No new workflow, automatic trigger, simulator result or policy was added.

**Benchmark unchanged:** 29/32 authenticated original 60s (final ranks 23, 25, 28 missing), zero competitively qualified games, no validated one fixed 60 and no 99.5% proof.
