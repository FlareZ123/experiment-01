# Rank-8 Hood Stone: authentic source search acquired a Supporter that was never played

**Agent 31, 18 October 2026.** Artifact-level follow-up to [the pre-registered fixed-source Tool-Power contrast](rank8-hood-tool-power-source-contrast.md). This is one previously known seed used for policy diagnosis, **not a new game sample or an opponent-qualified outcome**.

## Frozen provenance

- Physical A: exact Aichi 2026 rank-8 Absol/Garbodor source 60. Physical B: unchanged Hood Shield v1 candidate 60. True start: A first, B second. Seed `1260748957`; compiled research revision `b8f1860057564c4c644d2f4ad0b88f0ece897c86`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Actual resolved engine deck hashes, in A/B order: `40fbfb90f3db24ccaf5ca7d284ecffceec543583f882d95c3fffa557cec6b16a`, `f2fa3eaa3fb4c92f717450d20ee613ac6f33f4d9831644bedb6463b0feba211f`.
- The only intended policy change was the equal-seat, opt-in, Tool-granted Ability candidate generator. Existing manually dispatched [CI 39071550189](https://github.com/FlareZ123/experiment-01/actions/runs/39071550189) passed. Its [artifact 12115172461](https://github.com/FlareZ123/experiment-01/actions/runs/39071550189/artifacts/12115172461) contains `rank8-hood-stone-policy-contrast.json`. Downloaded ZIP SHA-256 `9537b8cca6f9b2a29188e00fa836c421f26f5ab1f652c1aa5501a05734c302f0`; inner JSON SHA-256 `15a1aa1adaf2646ba47912e2a27d957052339c1df9a6c2a35bda7977fd086a76`. These hashes were independently recomputed by re-reading the archived bytes.
- The archive records 99 meaningful decisions in baseline and 104 in Tool-Power. It contains selected root decisions and prompt-answer summaries, **not** full prompt/reducer replay. Both games completed untimed at engine turn 20 with B winning and Prize counts A/B `[6,0]`. The 214 versus 221 actual Store actions are not interchangeable statistical replicates.

## Reconstructed real-root lifecycle

The following is from the **opt-in** arm's `decisionTrace`; ordinals refer to actual Store actions, not detached bot evaluations.

| Actual root ordinal | Turn / seat | Observed event |
| --- | --- | --- |
| 161 | 16 / B | Played `Arven SVI`. This expended B's normal Supporter use that turn. |
| 162 | 16 / B | Arven search selected `Fog Crystal CRE` and `Forest Seal Stone SIT`. |
| 165 | 16 / B | Played Forest Seal Stone. |
| 172 | 16 / B | Used `Star Alchemy` through real `UseAbilityAction`. This is the **first root-decision divergence** against baseline: baseline ordinal 172 was Retreat. The prior 82 meaningful decision signatures match. |
| 174 | 16 / B | Genuine owner-deck `ChooseCardsPrompt` with `CHOOSE_CARD_TO_HAND` selected **`Acerola BUS`**. Candidate's later hand snapshot contains this printing. |
| 176–177 | 16 / B | Retreated Marshadow to the Hooded Shadow Rider Calyrex VMAX, then declared Max Geist. Acerola remained in B's hand. |
| 187 | 17 / A | Opponent declared Venomous Fang. |
| 192 | 18 / B | B declared Max Geist while `decisionHandBefore.ownHandPrintings` **still contained Acerola BUS**. B did not play Acerola in any observed meaningful root action. |
| 202 | 19 / A | Opponent played `Roxanne ASR`. |
| 218–219 | 20 / B | Candidate's recorded hand before attachment contained `Mysterious Treasure FLI`, `Psychic Energy MEE`, `Quick Ball FST`, with **no Acerola**. B attached Energy and declared final Max Geist. |

The full opt-in `decisionTrace` contains **zero** B `PlayCardAction` entries for Acerola after ordinal 174, and no Acerola action elsewhere. The same root-action stream shows B had already played Arven on turn 16, so the searched Supporter **could not be played that turn** under the normal one-Supporter rule. Turn 18 was its only following B turn before the opponent's turn-19 Roxanne reset. The source hand shows Acerola retained through B's turn-18 attack; it was absent on B's final turn 20 after the intervening Roxanne. This is a concrete case of **Supporter-slot contention and connector opportunity cost**: access through Stone consumed the once-per-game VSTAR Power to take an otherwise unplayed Supporter.

This audit makes **no claim** that Acerola was inherently the worst deck search, that a particular alternative was in the remaining deck or playable, or that Roxanne was the sole conceivable reason for its disappearance. An own-deck search can rationally target a future turn, and this repeated match's favorable terminal remains unchanged. A stronger claim requires a same-root owner-information-set comparison of legal alternative Star Alchemy selections, complete post-prompt reduction, next-turn opponent responses, and independent games.

## Decision for future work

A Tool-Power policy should be evaluated on **post-search conversion** (selected card, current Supporter state, following owned action, hand disruption, and effect), rather than simply counting its newly enabled `Star Alchemy` root actions. The next narrow falsification is to hold the pre-ordinal-174 source state fixed and compare prompt selections available in that **same owner-visible deck**, with no future hidden-hand or deck-order leakage, then independently validate the opponent response. Do not change the fixed candidate list from this isolated case.

**Status:** Tool Power mechanically activated once; Acerola fetched once; Acerola played zero times before terminal; same observed engine outcome; **zero competitive games qualified**. Field exact sources remain 29/32.
