# Compiled pinned-Twinleaf public mulligan identity sidecar: both-seat noninterference

**Agent 31 | 30 October 2026 | Experimental status: real Store setup information validated, zero competitively qualified games.**

## Why the native verification matters

The official paper setup rule I.G requires showing the opponent every failed Basic-free starting seven. The original pinned Twinleaf engine itself exposes **the exact cards** in a ShowMulliganPrompt to each viewer. The previous native setup-compensation observer measured mulligan counts and optional bonus offers, but retained no card identities. The new [public opponent-facing observer](../../simulation/evaluation/public-mulligan-reveal-observer.cjs) captures the *already-public* native prompt hands by owner physical seat and records their exact engine fullName printing strings. It intentionally never reads source/candidate hidden current hands, deck orders, or Prize identities, and the actor policy receives no new information.

## Fixed, independent native test design

The [frozen preregistered test](../../tests/public-mulligan-reveal-observer.pinned.test.cjs) was committed before execution with source and candidate identities pinned:

- **Source:** original Aichi rank-6 Kazuma Kashi Iron Thorns ex exact published physical 60.
- **Candidate:** original Aichi rank-1 Yasunori Kato Shadow Rider exact published physical 60.
- **Source resolver:** shared print-mapping planAichi, with explicit original English approximation permissions; these are existing benchmark source maps.
- **Twinleaf Git submodule:** pinned commit **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, compiled in the GitHub runner.
- **Prospectively chosen seeds:** 4136149016, 1514735430, 3730833191. Both real candidate physical seats (0 and 1) tested at every seed.
- **Each of six independent setup conditions was run twice:** observer off vs on, all other flags and full printed 60s identical. Each game was limited to **110 native actions**, so it was deliberately a setup/early-play test, not a qualifying game outcome.
- Both arms requested the **existing native setup-compensation observer**, actual full physical deal receipt, and decision trace. The new public history was requested **only** in the treatment.

**CI:** [compiled original-Store successful job 41000357157](https://github.com/FlareZ123/experiment-01/actions/runs/41000357157), job ID 123883087121. Compilation completed with Node 22.23.4, 1/1 native regression passed, all six OFF/ON actor-gameplay pairs verified. Separate pure JavaScript privacy and math tests also passed.

## Actual native Store results

The columns “source invalid” and “candidate invalid” are actual native shown seven-card prompt counts, including both-invalid repeats. The “accepted source/champion bonus” cells count actual selected extra cards in physical order; accepted draws may be zero despite public invalid hands.

| Precommitted seed | Candidate seat | Source invalid hands shown | Candidate invalid hands shown | Champion accepted bonus cards | Source accepted bonus cards |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 4136149016 | 0 | 1 | 0 | 1 | 0 |
| 4136149016 | 1 | 1 | 0 | 1 | 0 |
| 1514735430 | 0 | 0 | 0 | 0 | 0 |
| 1514735430 | 1 | 1 | 0 | 1 | 0 |
| 3730833191 | 0 | 1 | 1 | 0 | 0 |
| 3730833191 | 1 | 1 | 0 | 1 | 0 |

**5/6 source setups** had at least one actual public source invalid hand, and **1/6** exposed both source and candidate invalid hands. This small sample does not estimate the overall 60.05004% marginal source invalid-hand chance or validate matchup strength; three seeds were precommitted and no deals were discarded.

### Concrete original-Store public printings

In seed **4136149016**, candidate physical seat **0**, rank-6 source's one invalid seven was actually shown to the candidate as:

- Crushing Hammer POR
- Camping Gear BST
- Echoing Horn CRE
- Wondrous Labyrinth Prism Star TEU
- Guzma & Hala CEC
- Guzma BUS
- Speed Lightning Energy RCL

In seed **3730833191**, candidate physical seat **0**, a different seven shown to the candidate included **two physically distinct Trainers' Mail ROS** copies alongside Thunder Mountain Prism Star LOT, Spiky Energy JTG, Gladion CIN, Guzma & Hala CEC, and Tag Call CEC. Both players had one shown invalid hand there, and **neither was awarded bonus cards**. This is a direct check that public disclosure must remain distinct from *net* bonus cards. A card name may appear several times among or across revealed seven-card hands; no unique physical identity is inferred merely from a shared printing name.

## Paired noninterference and privacy

For **each** of the six seed × candidate-seat conditions, observer-OFF and observer-ON had:

1. Identical source/candidate physical deal fingerprints.
2. Identical existing native setup-compensation summary, including real offered, selected and physically drawn optional cards.
3. Identical native action counts, turn counts, finish status and winners (whether or not terminal).
4. Identical underlying decision traces.
5. Observer-reported per-seat public invalid-hand counts exactly equal to the original Store's independently observed per-seat shuffle-derived mulligan counts.

The new history is derived only from ShowMulliganPrompt with GameMessage.SETUP_OPPONENT_NO_BASIC, which the pinned setup reducer emits after the source's invalid hands were collected. Its self-facing mirror is excluded to avoid duplication. The pure [observer privacy tests](../../tests/public-mulligan-reveal-observer.test.cjs) also inject throwing getters for source hand, deck and Prizes and prove that none is accessed.

The observer remains **read-only and default-off**. It currently does **not** change either player’s decisions. An information-safe policy incorporating these prints is future research; this execution establishes the availability and noninterference of the native public-history input, rather than its tactical usefulness.

## Research implications

The exact [mathematical mulligan public-exposure report](agent31-paper-mulligan-public-signature-20261030.md) can now be connected to source-actually-seen printing sequences. The next meaningful evaluation would freeze a bilateral policy that uses these public histories for a specific matchup-dependent decision, run both physical starts with unchanged source 60s and preserve owner-visible explanation. Recognizing a possible Iron Thorns signature cannot retroactively alter the coin-flip or initial choice of player order, since those precede mulligan displays under the official rules.

Native policy legality and meaningful source-side Trainer responses remain unqualified. There are **29/32** exact original source 60s, **zero** competitively qualified games, and **no evidence-backed 99.5% fixed deck**.
