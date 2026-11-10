# Sentinel–Alchemy three-lock Vileplume: one fixed 60-card challenger

**Agent50 | 10 November 2026 | developing hypothesis, not nominated best and not competitively qualified**

## Actual fixed-list artifact

`results/aichi-2026/candidates/agent50-sentinel-alchemy-triplelock-60-v1.json` is a fully specified **one-list 60**, based on the exact authenticated original **rank-2 Takahiro Ando Vileplume Control** source. No other original source deck is silently replaced.

| Removed from the original rank-2 60 | Added to fixed candidate 60 |
| --- | --- |
| 1 Mr. Mime PLF #47 | 1 Alolan Grimer SUM #57 |
| 1 Counter Gain SSP #169 | 1 Alolan Muk SUM #58 |

Everything else remains the exact original rank-2 printing and count, including 2 Vileplume AOR, 1 Stoutland BCR, the Pidgeot ex line, 4 Tag Call, 4 Guzma & Hala, 3 Stealthy Hood, 2 TM: Evolution, and Grand Tree SCR. This is one fixed build to play against *every* opponent, not a matchup-specific card substitution.

## Genuine structural hypothesis

The intended board is **Active Stoutland BCR** (Sentinel: opposing Supporter lock), **Benched Vileplume AOR** (Irritating Pollen: both-player Item lock), **Benched Alolan Muk SUM** (Power of Alchemy: Basic Pokémon in both players' play, hand and discard have no Abilities). These act on different resources and coexist on distinct Pokémon slots. The controlled deck's own Stage 1 and Stage 2 Abilities, notably Pidgeot ex's access and Vileplume's lock, should remain available under Power of Alchemy. The third lock specifically targets ubiquitous Basic support Pokémon and abilities, including Genesect V, while the existing Active and Bench locks target the attacker's Supporters and Items.

The two added Alolan cards use a shared Stage 1 line. Ordinary evolution on the first turn is prohibited, so TM: Evolution, Grand Tree and normal later-turn evolution sequencing matter. The line is intentionally **not claimed to appear on turn one** or every opening. Early game sequencing and access contention are likely the decisive question.

The deletion of Mr. Mime has some structural justification: under Power of Alchemy, this Basic Pokémon would lose its Bench Barrier Ability anyway. The Counter Gain cut is a real loss of a Pokémon Tool and potential attack-cost flexibility; its value against particular opponents needs testing.

## Primary failure modes

1. **Prize risk:** For two different singleton cards in a 60-card deck and six Prize cards, probability that at least one Grimer or Muk is Prized is `1 - C(58,6)/C(60,6) = 19.15254237%`; both are Prized with probability `0.84745763%`. The original Gladion and Peonia can sometimes recover a piece, consuming scarce Supporter turns and search connectors. These probabilities do not directly measure failure or win rate.
2. **Bench and attack tempo:** Vileplume, Alolan Muk, Pidgeot ex and Bunnelby leave little spare Bench capacity while Stoutland must occupy the Active Spot. Muk costs an extra evolution and can compete for TM: Evolution or Grand Tree access. A 140-HP Stoutland can be knocked out, immediately removing its Active-only lock.
3. **Anti-lock and asymmetry:** Garbodor Garbotoxin can suppress the lock Abilities, while opposing Tools/Tool locks alter Stealthy Hood's response. Underworld Door on Stage 1 Shadow Rider Calyrex VMAX is *not* shut off by Alolan Muk, and an established attacker can still use normal attacks under all three restrictions. Opposing evolution support Abilities are similarly untouched. The deck's own Basic setup Abilities are also suppressed once Muk comes online.
4. **Coverage and legality:** The source field is 29/32; original ranks 23, 25 and 28 lack authenticated 60s. Paper legality of the *entire* build, regional Japanese Extra rules, all engine card implementations, manual decision quality, clock continuity and endgame outcomes remain separate review tasks.

## Executable native evidence

The new native Store contract `tests/2026-11/agent50-sentinel-alchemy-triplelock.native.test.cjs` verifies source-printed construction of exactly 60 under `planAichi` and stages the genuine three simultaneous native cards on opposite seats. It executes actual `UseAbilityAction` for an opponent's Genesect V, `PlayCardAction` for Item Switch, and `PlayCardAction` for Supporter Lillie's Determination, each with and without the relevant lock. The ordinary source Grade is 29 native-ready opponents with the resolver's explicitly opted-in same-set Basic Grass Energy numbering equivalence. A successful construction does not establish paper success.

A separate strictly bounded development-only match experiment `tests/2026-11/agent50-sentinel-alchemy-bounded-original-field.native.test.cjs` registers the original rank-2 60 and this 60 without changes across rank 5 Mew Genesect, rank 6 Iron Thorns, and rank 10 Regidrago, both seats with one predetermined seed per pairing: **12 native attempts**. The script records every native error and action-bound game rather than treating censored attempts as losses or wins. Opponent decks remain their exact authenticated sixties and one common native SimpleTacticsAi policy is used. It explicitly reports zero qualified games and never uses apparent native winners as a competitive win-rate estimate. Reproduction lives in the existing manually dispatched `.github/workflows/agent50-electrode-crashburn-native.yml` CI with a pinned Twinleaf revision.

**Interpretation:** This candidate is a high-impact ALS interaction proposal, whose important success condition is establishing the three-lock board at an acceptable cost *before* the opposing deck stabilizes. It is not yet proven stronger than the original rank-2 60 or the leading Shadow Rider development hypotheses. Actual published success must first be backed by prospective original-source games with complete paper, owner-visible, physical-zone, clock and independent policy review.
