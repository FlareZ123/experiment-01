# Original rank7 forced Active Wobbuffet plus Faba: exact Hood-removal resource window

**Agent40 | 6 November 2026 | Source original 60, exact conditional opening-hand mathematics. This is physical location evidence; no gameplay, selected-policy run, qualified match or win-rate claim.**

## Source-owned conditional anti-Hood move

The authentic [original rank7 Snorlax Stall 60](../aichi-2026/full-decklists.json) contains **three Wobbuffet PHF36** (Psychic, Basic, *Bide Barricade*) and **two Faba LOT173** (Supporter), alongside nine other Basic Pokémon. Against an already-established Sentinel v1 Benched Vileplume AOR with Stealthy Hood attached, one particularly short possible original-owner counter is:

1. If the original rank7 starts with Wobbuffet as its **only Basic Pokémon in its seven-card opening hand**, Wobbuffet is its forced opening Active Pokémon. That remains the opening Active choice even if later optional opponent mulligan compensation adds Benched Basics.
2. If Faba is actually held on the source response turn and its Supporter quota remains available, use Faba to choose the opposing Benched Vileplume's Stealthy Hood and move that Tool to its owner's Lost Zone.
3. The now-unprotected Grass Vileplume is subject to the already-Active Psychic Wobbuffet's Bide Barricade, losing *Irritating Pollen* while Wobbuffet stays Active and its Ability works. The Item lock ceases to apply, assuming no independent Item lock persists.

This is a narrower counter than the previously described [Faba → shared Artazon → Wobbuffet → Jet Energy](agent40-rank7-faba-artazon-jet-antihood-exact-20261106.md), because this one has **no Jet or Artazon access requirement**. If the original rank7 has both Wobbuffet and another Basic in the initial seven, it may *choose* Wobbuffet Active rather than being forced; that broader option has a separate numerator below.

The claimed paper effect is conditional. Faba must still exist, remain held, and be playable with a free Supporter use; Stealthy Hood must still be on a valid opposing target when Faba resolves; Wobbuffet must remain Active and have an effective Ability. Another source or candidate action, including gust, can change those conditions. The card-location numerator is **not** the probability of Faba being used, of overturning the lock, or of winning a game.

## Exact conditional physical-card allocations

Source partition: **3 Wobbuffet, 9 other Basics, 2 Faba, 46 residual = 60**. Let a uniformly shuffled hand have 7 cards, require at least one Basic, and allow two subsequent ordinary draws from the remaining 53. Six random Prize cards are assigned from the unseen remainder; for these specific opener/first-nine events the Prize allocation sums out and does not change any numerator.

Define \(\mathrm C(n,k)\) as the binomial coefficient. The exact **Basic-valid denominator**, including the possible two-draw selections, is

\[
D=[\mathrm C(60,7)-\mathrm C(48,7)]\mathrm C(53,2)
=430{,}732{,}274{,}544.
\]

A forced-Wobbuffet-only-Basic opener is one with no copies of the other nine Basics and at least one Wobbuffet:

\[
N_{\rm forced}
=[\mathrm C(51,7)-\mathrm C(48,7)]\mathrm C(53,2).
\]

Among those openings, the complement of *no Faba in the initial seven or next two natural draws* is

\[
N_{\rm forced,Faba9}
=N_{\rm forced}
-[\mathrm C(49,7)-\mathrm C(46,7)]\mathrm C(51,2).
\]

For the optional-Wobbuffet-Active envelope where at least one Wobbuffet occurs in the first seven, regardless of other Basics:

\[
N_{\rm available,Faba9}
=[\mathrm C(60,7)-\mathrm C(57,7)]\mathrm C(53,2)
-[\mathrm C(58,7)-\mathrm C(55,7)]\mathrm C(51,2).
\]

| Source physical resource event | Exact numerator | % of Basic-valid seven |
| --- | ---: | ---: |
| Wobbuffet is the only Basic type present in the initial seven (forced Active) | 58,077,226,584 | **13.4833700691%** |
| Forced Wobbuffet and Faba already in initial seven | 13,463,230,872 | **3.1256610353%** |
| Forced Wobbuffet and at least one Faba among first nine | **16,797,948,984** | **3.8998584450%** |
| Wobbuffet among initial seven, regardless of other Basics | 167,869,453,752 | **38.9730381662%** |
| Wobbuffet available in initial seven and Faba seen by first nine | **43,242,840,927** | **10.0393779344%** |
| Same as preceding, but another Basic initially available (optional Wobbuffet Active) | 26,444,891,943 | **6.1395194895%** |

The starting seven is source-Basic-valid in the denominator, and every figure is based on the **unchanged original rank7 card counts**. Conditional on a forced-Wobbuffet-only-Basic opener, the exact chance of naturally seeing Faba within those nine cards is **28.9234696146%**. A source policy may play Faba earlier, discard it, choose another Supporter, or lose access to it.

## Independent checks and reproducibility

- The full five-class hypergeometric calculation over source opening seven, six Prizes and two natural draws returned the same **16,797,948,984** and **43,242,840,927** numerators as the independent binomial inclusion-exclusion identities above.
- A separate seeded 350,000-deal physical-card shuffle (Python, deterministic seed **20261106**) found **283,245** Basic-valid openers, **38,407** forced-Wobbuffet openings, **11,054** with forced Wobbuffet and Faba by nine, and **28,617** with any opening Wobbuffet and Faba by nine. Corresponding conditional estimates **13.55964%, 3.90263%, and 10.10327%** are compatible with exact probabilities.
- The [source-locked CommonJS exact evaluator](../../simulation/evaluation/agent40-rank7-forced-wobb-faba-window.cjs) and its [independent exhaustive six-card toy test](../../tests/agent40-rank7-forced-wobb-faba.test.cjs) have been committed. Its exact formulas were independently executed in a JavaScript tool runtime and matched all seven published integer quantities. The six-card toy enumerates each ordered opener/draw *set* combination and matches all seven outputs; **no GitHub Actions or standalone Node test claim is made**.

## Matchup decision impact

A candidate's three Stealthy Hood copies should not automatically be valued as a universal answer to rank7's Wobbuffet. Even a protected Bench Vileplume can face an original Active Wobbuffet plus Faba path that never pays the otherwise scarce Artazon/Jet resource costs. The availability event is sufficiently state-dependent that a serious source opponent policy needs to decide whether to preserve/use Faba and whether Wobbuffet should remain Active, rather than simply passing through a lock.

The corrected staged native [Wobbuffet/Hood Nest Ball diagnostic](../methodology/agent40-rank7-wobbuffet-hood-nestball-staged-bench-rollback-correction-20261106.md) has not yet executed this Faba removal. A decisive next native test must physically play the original source Faba, settle its Tool-target and Lost-Zone prompts, verify Ability lock after Hood removal, and execute an otherwise Item-locked source action under genuine Bench capacity. More importantly, the development policy must choose the line through owner-only observations and have a competent opponent response.

**Benchmark unchanged:** 29/32 original Top32 source name/count sixties authenticated; original ranks23, 25 and 28 absent; zero competitively qualified games; no selected universal fixed 60; no credible 99.5% outcome evidence.
