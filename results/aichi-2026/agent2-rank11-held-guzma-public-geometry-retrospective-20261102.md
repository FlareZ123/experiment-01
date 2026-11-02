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

## 2 November follow-up: absolutely no invested Benched attackers in the reachable positions

**A second, matched, genuine pinned Store replay is completed and independently source-checkable.** [Compiled manual CI 41370546414](https://github.com/FlareZ123/experiment-01/actions/runs/41370546414), head `338eecef1736ef368c8b6306e405fce04da2fc78`, **passed** the extended pure tests and all 16 native exact original-source arms. [Complete JSON artifact 13109410317](https://github.com/FlareZ123/experiment-01/actions/runs/41370546414/artifacts/13109410317), archive SHA-256 `101efadc6079eee5d2a3e49cd55c2da3e6d68296b66948dce386f52d810513c6`, inner JSON SHA-256 `1a22600fda79221d2757862cda1aaf165458770fb6361c35846504be971c0773`. Root-action/deal/outcome digest **exactly** `4c2981a904eb939ba32301038514ef269d7c8a07d883b5c90bae903dfbc82216` again. No treatment or change of decision happened; 10 original engine terminals, six capped games and zero competitive-qualified games remain.

The same read-only Store observer now counts face-up physical **Energy cards** attached to acting owner's Active and occupied Benched Pokémon. Every genuine held-Guzma first-root or Pass receipt was classified with no ambiguity. These are *card counts*, **not typed Energy units or attack-payability certification**.

| Held-Guzma, owner actual root position | First owner root | Accepted Pass |
| --- | ---: | ---: |
| Either Bench absent | 67 | 24 |
| Both Benches occupied, **zero Energy cards attached to owner's Bench** | **255** | **122** |
| Both occupied, at least one Benched Energy card | **0** | **0** |
| Unobserved Energy or geometry | 0 | 0 |
| **Total** | **322** | **146** |

This is the major omitted explanatory variable behind the original 255/122 physical-geometry counts. **All 255/255** and **122/122** instances with both Benches populated had no Benched Energy investment. Thus the previously proposed interpretation that the bot routinely missed immediate, already-charged *own-Bench* Guzma pivot attackers in these particular games is unsupported. That does **not** establish that playing Guzma was always bad: gusting may trap/KO with an indirect line, a zero-cost Benched attack may be usable, an attached Energy may be moved or accelerated, a free-retreat pivot may exist, or discarding and setup may enable an attack afterward. All of those require actual root→prompt→payment→effect continuation. If the Active is invested, a Guzma forced own-switch can easily sacrifice immediate attack pressure.

In the **190** original-source first roots with both Benches populated, active-attached Energy count was `0:28, 1:40, 2:63, 3:30, 4:16, 5:12, 6:1`, while own Benched Energy was **zero throughout**. Therefore **162/190** source held-Guzma first roots (correlated observations) would move an at-least-one-Energy Active off the field while promoting an Energy-less Bench Pokémon if both switch effects fully resolve. The candidate-side 65 first roots similarly all had Benched Energy zero, with 54/65 showing an invested Active. This is a concrete board-state opportunity-cost screen, never an assertion of tactical dominance or later attack payability.

**Distinctive actual source Pass details:** The existing exact owner-only native `sourceOwnerPostPassMobility` records match the same retained source-owner turns. At the 100 held-Guzma original-source Passes with both Benches, source Active was Mega Absol ex **60** times, Latias ex **31** times, Oranguru V **4**, Trubbish **2**, Crobat V **2**, Tapu Lele-GX **1**. Mega Absol's 60 Passes split **18 without Active Energy / 42 with one attached**. The 31 Latias with 3–7 attached cards belong to **only two correlated printed-deck trajectories**, the same rank11 seed group against distinct candidates, and must not count as 31 independent games. The original printed rank11 60 has **8 Basic Darkness, zero Psychic and zero Special Energy**; Latias ex's Psychic-cost Eon Blade is not paid by ordinary attached Darkness alone. This supports investigating earlier Energy recipient and deck-specific move-payability decisions, while leaving unknown modifying card effects and successful alternative lines open.

### Decision-policy bottleneck and forward test

The shared canonical root policy `simulation/twinleaf/agent34-actor-only-root-policy.cjs` has a default Basic Energy action: if no explicit `energyRecipientFrontier` option is set, it returns `attach-basic-energy` with no Bench target, and native conversion routes the default to the Active. The frozen v2 campaign did **not** enable that frontier. Existing `simulation/twinleaf/agent44-actor-energy-recipient.cjs` can instead consider visible eligible Bench and Active attacks, attached Basic/Special Energy and public reductions; it is a **default-off development heuristic**, currently not certified to improve legal paper decisions or matches. Its own approximations may favor a nominal but strategically poor move, so further instrumentation and full counterfactual Store settlement are required.

These native findings require shifting the next experiment to **two-seat Basic Energy recipient selection and its interaction with switching and Supporter contention**. Compare unchanged original full-60 rank11 games on identical preregistered physical deals, first with current canonical target and then with a symmetric, actor-only, bounded Energy-recipient frontier. Preserve same initial deal, both seats, action/prompt traces, actual physical targets, 260-action caps, exceptions, subsequent opponent pressure, source attack funding and every whole-game paper-fidelity veto. Do not infer win-rate superiority from engine terminals. Parallel work by Agent32 on **different authentic original rank11 trajectories** observed 33 repeated payable three-Darkness `Claw of Darkness` alternatives to dead `Terminal Period` attacks, so it would be incorrect to generalize our unpowered-Bench result into *all rank11 turns or all valid attacks*.

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
