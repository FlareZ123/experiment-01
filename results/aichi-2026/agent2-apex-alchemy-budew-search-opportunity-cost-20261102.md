# Concrete fourth Boost Shake trade: early Muk access improves while first-eight Budew access loses 7.49 percentage points

**Agent 2 | 2 November 2026 | independently enumerated exact first-eight/Prize screen, static CI verified, zero games.**

## Key counterexample to a single-axis optimizer

Our registered [Apex Alchemy Shake4/Quick2 v1](agent2-apex-alchemy-shake4-quick2-falsification-20261102.md) trades one **Quick Ball FST237** (three to two) for a **fourth Boost Shake EVS142**. Its favorable first-eight Alolan Muk access increase is a real exact mathematical result, yet it is incomplete as a recommendation because the deck's **single Budew ASC16** is a Grass Basic with a potentially decisive early **Itchy Pollen Item lock**.

The exact supplied printing metadata show:
- Budew `me2pt5-16` is a Grass Basic.
- Mysterious Treasure `sm6-113` searches **Psychic or Dragon Pokémon** and therefore cannot search Budew.
- Quick Ball `swsh8-237` searches **any Basic Pokémon**, conditionally on discarding a different card.
- Boost Shake `swsh7-142` evolves a Pokémon and **ends the player's turn**. It cannot establish Muk and also permit a same-turn Budew Item-lock attack.

Consequently, spending the third Quick Ball has a measurable opportunity cost on a **separate tactical axis** that a Muk-only selection model misses. This is especially consequential in matchups where an early Budew attack can deny the opponent's hand Items before evolving into Muk is worth the turn loss. No numerical substitution between a Muk access opportunity and Budew access opportunity is justified by these probabilities alone.

## Exact two-axis comparison of the **same two immutable full 60s**

The exact source manifests are original v0 SHA-256 `21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769` and SHA-256 `5cd6b0fc7781e1a5a3b29f5a23654750295af89bdc63621f235fbd0c56701fd0` for the one-slot challenger. Both contain 12 Basic Pokémon, one Budew, two Grimer, two Muk, four Mysterious Treasure and otherwise the same printed card pool.

| Necessary first-eight resource opportunity, conditional on a Basic-valid initial seven | Original v0 (3 Shake / 3 Quick) | Exact challenger v1 (4 Shake / 2 Quick) | v1 minus original |
| --- | ---: | ---: | ---: |
| **Muk**: Grimer direct or idealized Item-search, Boost Shake held, Muk survives six Prizes, plus a non-Grimer opening Basic | **20.12400842%** | **23.76699105%** | **+3.64298263 pp** |
| **Budew**: directly in first eight | 16.02961584% | 16.02961584% | 0 pp |
| **Budew**: instead Quick Ball held, Budew remains in searchable post-Prize deck | 25.47435977% | 17.98426598% | **-7.49009379 pp** |
| **Budew**: direct OR idealized Quick Ball search | **41.50397560%** | **34.01388181%** | **-7.49009379 pp** |

These are **potential resource access, not successful attacks or locks**. The numbers are conditional on a legal starting Basic in the original seven, with probability **80.93533073%** under either fixed 60. They include the ordinary eighth-card first-turn draw and a full six-card Prize complement. A singleton Budew absent the first eight is Prized with conditional probability `6/52`, so a Quick Ball in the first eight only resolves to Budew with probability `46/52` in the simplified model. Once Budew appears directly in the first eight, no search card is required.

The [independently written exact enumeration](../../simulation/evaluation/agent2-alchemy-quickbudew-first8.cjs) partitions eight seen cards by Budew (1), Quick Balls (3 or 2), other Basics (11), and all remaining cards, using multivariate hypergeometric weights. If exactly one Basic falls among the first eight, the weight that it was in the initial seven is `7/8`; if at least two are present, the legal-initial-seven weight is 1. The singleton unseen Budew's Prize survival is then analytically integrated. All values were separately reproduced by a Python exact enumerator and [printed-card-and-probability Node regression](../../tests/agent2-alchemy-quickbudew-first8.test.cjs), which **passed manual [CI 41539275390](https://github.com/FlareZ123/experiment-01/actions/runs/41539275390)** at head `0a2ee3924ebc628fc1ff282d71a2af9073a6a72f`.

## Why this must change candidate ranking

The opposing effects are on distinct channels with **different marginal game value and different execution costs**:
1. The Muk opportunity assumes a useful Ability-lock turn, legal Boost Shake, Grimer board slot and adequate time, but Boost Shake ends that turn. Opposing Vileplume Item lock can disable Shake entirely.
2. The Budew opportunity assumes legal Quick Ball and a disposable card, plus a credible way to promote Budew and attack going second; an inaccessible Active position can make every held Budew strategically inert. Existing Wobbuffet, Garbodor, Vileplume and Thorns matchups have different pressures, and a successful Itchy Pollen is an effect on the opponent rather than a guaranteed win.
3. The same held Quick Ball can search **only one** Basic Pokémon; the Budew opportunity competes with Regidrago V, Alolan Grimer, Tapu Lele-GX and Latias ex access. These other search channels have varying alternate coverage through Mysterious Treasure.
4. The two "early lock" options consume the turn differently. Treating their probabilities as additive or directly scoring +3.64 against -7.49 would assume an unjustified equal strategic value. It would also ignore the information state, opponent's attack timeline and conditions for protected hand discards.

**Recommended decision:** keep the actual Shake4/Quick2 60 available as a falsification challenger but **do not promote it over Agent43's original** based solely on Muk-first-eight access. Test natural original-source openings where it is meaningful to deploy Budew and compare both genuine lines: first-turn Budew attack, or first-turn Grimer → Muk via Boost Shake. Source rank6/24/29 Thorns, rank7 Wobbuffet Stall, rank26 Meloetta and rank2 Vileplume supply different veto mechanisms. A stronger opponent-dependent policy may dominate either hardcoded choice. Any new replacement card requires a full 60, fixed policy, owner-visible payment and original-source matched games; zero competitively qualified games currently exist.

**Evidence class:** exact printed-card identity and mathematical first-eight/Prize incidence, CI-confirmed; **not gameplay and not a 99.5% claim**.
