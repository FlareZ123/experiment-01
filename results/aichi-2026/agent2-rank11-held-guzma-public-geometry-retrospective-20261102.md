# Agent 2: exact rank-11 held-Guzma native public recipient geometry

**2 November 2026 | retrospective 16-arm originally registered physical deals | no competitive qualification.**

## Decision question

The 1 November rank-11 held-Supporter forensic audit observed 322 authentic
first owner roots with Guzma and 146 accepted Pass roots with Guzma, yet
**zero accepted Supporter roots of any printing**. The probe
`Guzma.canPlay(null)` reported true with unused Supporter quota at those
owner roots, but null-target playability is not proof that a legal and
worthwhile two-prompt Guzma line exists. How often was either Bench missing?

## Exact controlled method and reproducibility

Extend the existing, default-off, read-only
[`agent2-native-owner-supporter-opportunity.cjs`](../../simulation/twinleaf/agent2-native-owner-supporter-opportunity.cjs)
at genuine, predispatch, owner-acting Store roots. Read only the acting
owner's hand plus **both face-up public Active/Bench positions**. Record
occupied PokemonCardList slots from `getPokemonCard()`; do not read the
opponent's concealed hand, deck identities or Prize faces. Retain the
existing first-root and accepted-Pass semantics. No intervention is fed
to either bot, and no root policy, frozen deck or original seed is changed.

The [existing Agent43 exact 16-arm retrospective runner](../../simulation/evaluation/agent43-guzma-held-root-retrospective.cjs)
now classifies each Guzma receipt into mutually exclusive public cases:
opponent Bench empty, opponent Bench occupied but own Bench empty, both
Benches occupied, or invalid/unobserved geometry. An occupied Bench is
only a *necessary physical targeting condition*, and does not establish
native/paper target validity, attack payability, tactical gain or actual
Supporter usage. `geometryOnlyNoPaperTargetCertification` is explicit.

**Pinned native reproduction:** existing manual-only
[GitHub Actions run 41369054234](https://github.com/FlareZ123/experiment-01/actions/runs/41369054234)
**PASSED** at repository head `32311936b6bbe3de5dfc02ead3f0e5af942d5047`,
pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
The workflow ran the extended owner-only pure test and new classification
test and then the same original-source native replay. Download
[complete JSON artifact 13108123891](https://github.com/FlareZ123/experiment-01/actions/runs/41369054234/artifacts/13108123891).
ZIP digest reported by GitHub Actions:
`sha256:e16fc8e752573469332b88812f22de151e53e1536cef6d8887cc40246b94e088`.
The extracted JSON SHA-256 is
`60d8da9032beaf876d0d36f7f3cf9412b06d62eb253b8a55d243c8687cb95298`.

**Exact integrity result:** the 16/16 complete source/full physical-deal,
start-seat, root-action-ledger and outcome fingerprint vector remains
`4c2981a904eb939ba32301038514ef269d7c8a07d883b5c90bae903dfbc82216`,
identical to the already published historical baseline. There are
**zero sample truncations**, **zero accepted Supporter roots**, and still
**10 engine terminals plus six 260-root censored games**. These are the
**same eight originally sampled seed groups across two fixed candidates**.
This is a retrospective observation, not fresh prospective performance evidence.

## Measured public-position classes

| Board geometry when owner actually held Guzma | First owner roots | Accepted Pass roots |
|---|---:|---:|
| Opponent Bench empty | 21 | 8 |
| Opponent Bench occupied, own Bench empty | 46 | 16 |
| **Both Benches occupied** | **255** | **122** |
| Geometry unobserved | 0 | 0 |
| **Total** | **322** | **146** |

Of these, **255/322 = 79.19255%** of held-Guzma first-root observations
and **122/146 = 83.56164%** of held-Guzma Pass observations had both
Benches populated. These are within-match correlated turn observations,
**not independent game samples or estimates of action quality**.
Accepted Passes also overlap with the same games' first-root observations.

Actor-stratified receipts:

| Actor | First-root: empty opposing Bench | First-root: opposing present / own empty | First-root: both occupied | Pass: empty opposing | Pass: opposing present / own empty | Pass: both occupied |
|---|---:|---:|---:|---:|---:|---:|
| Original rank-11 source | 0 | 46 | **190** | 0 | 16 | **100** |
| Fixed candidate | 21 | 0 | **65** | 8 | 0 | **22** |
| Total | 21 | 46 | **255** | 8 | 16 | **122** |

All **322/322** original first-root receipts holding Guzma also had
native null-target `canPlay` true, unused Supporter quota, and no coarse
Supporter-play lock. The *physical Bench-geometry explanation alone*
therefore cannot account for the 255 both-populated first roots or
122 both-populated Pass roots. This is a stronger structural bottleneck
diagnosis than simply counting held Supporters, while still leaving
paper conditions, competing tactics and native prompt outcomes open.

## Paper and policy interpretation

The provided 2025 Advanced Player's Rulebook says cards that cannot
apply part of their instructions may apply those parts that are possible,
subject to conditional clauses; the printed
[Guzma BUS 115](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/sm3/115)
first gust instruction precedes a conditional own switch. The existing
[`guzma-no-target-hook.cjs`](../../simulation/twinleaf/guzma-no-target-hook.cjs)
already explicitly notes that an empty *own* Bench is not by itself an
invalidation when the opponent has a target. Therefore the 46 source
first-root cases with an empty own Bench **must not automatically be
classified as paper-invalid Guzma**, even though the conservative
[`chooseHeldGuzmaMobility`](../../simulation/twinleaf/agent2-held-guzma-mobility-frontier.cjs)
requires both Benches for its particular emergency-switch proposal.
The 21 candidate first roots with no opposing Bench cannot execute the
first ordinary gust target, but special prevention/indirect card effects
and full paper root legality remain separately auditable.

The source already holds Guzma across numerous successive owner turns;
repetition can inflate percentages without demonstrating that a human
would spend the one-per-turn Supporter to switch targets. Nothing in
this study determines whether a nominal KO is available, whether
the present Active already takes Prizes, whether the other Supporter
would be superior, or whether the actual Guzma two-prompt selection would
settle as expected. The [Agent31 obstacle audit](../../simulation/twinleaf/agent31-guzma-public-obstacle-audit.cjs)
contains richer public attack-funding/nominal-KO predicates. Combine its
conjunctions with this **same physically frozen rank-11 cohort** rather
than counting additional isolated held-Guzma root totals.

## Next falsification and release gate

Run one actor-only, original-native-root conjunction census distinguishing
(a) both Benches occupied, (b) a payable damaging attack, (c) an
undamaged/low-HP opponent Bench target in range, (d) unused Supporter
quota, (e) a superior alternative attack/Supporter, and (f) a complete
native paid two-prompt root plus follow-up attack. Keep actor-first
and source-first, both fixed candidate lists, and all censored/error arms.
No win-rate inference until full paper-action, decision-policy,
physical-card and tournament-clock gates pass.

**Aichi original inventories: 29/32. Competitive-qualified games: 0.
No demonstrated fixed-60 99.5% result.**
