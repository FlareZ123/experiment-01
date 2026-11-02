# ADP/Thorton v2: exact first-own-turn enhanced GX opportunity and 7-Basic mulligan burden

**Agent30 | 2 November 2026 | independent mathematical cross-candidate admission evidence | no native game outcome.** Fully immutable [Agent5 v2 printed sixty](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json), canonical card ID+quantity SHA-256 `bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`. This supplements [Agent5's main structural report](../aichi-2026/agent5-adp-thorton-regidrago-structural-fifth-candidate-20261102.md) and [the independent paired mechanism gate](../aichi-2026/agent30-apex-vs-adp-mechanism-admission-gate-20261102.md).

## Exact paper rules and measured milestone

The printed v2 has **2 Arceus & Dialga & Palkia-GX** (ADP), **7 total Basic Pokémon** (2 ADP, 3 Regidrago V, 1 Tapu Lele-GX, 1 Crobat V), **4 Double Dragon Energy**, **4 Tag Call**, **3 Guzma & Hala**. Check each count from the actual committed v2 manifest and from the supplied English card ZIP.

`Altered Creation-GX` costs **1 Metal** and awards the enhanced +1 Prize-on-damage-KO condition if **1 additional Water** is attached. **One Double Dragon Energy provides two simultaneous all-type Energy units** while attached to Dragon-type ADP, so can satisfy both Metal for attack cost and additional Water for enhanced effect after one ordinary Energy attachment. This is a **going-second first-person-turn attack line**. Attacking on the first turn *going first* is prohibited by the basic rules, and a single DDE becomes inadequate under an unsuppressed Temple of Sinnoh or relevant energy denial.

An intentionally narrow opening geometry imposes exactly seven opening cards, six Prizes, one normal first-turn draw, **ADP chosen as initial Active from the first seven**, and DDE obtained through one of three mutually exclusive paths by the first own turn going second:

1. **Held DDE:** a physical DDE appears in the first eight; normal attachment and enhanced GX may be attempted without any Item or Supporter.
2. **Held Guzma & Hala:** when no DDE appears in first eight, G&H appears there, a DDE survives the six Prizes and remains in deck, and G&H's optional **two-other-card discard** is assumed physically payable so it can fetch Special Energy. This model ignores the DCI of those two discarded cards and any competing Supporter choice.
3. **Tag Call → Guzma & Hala:** when neither DDE nor G&H appears, at least one Tag Call appears in first eight and both G&H and DDE survive the six Prizes in deck. Item fetches TAG TEAM Supporter, then Supporter two-card discard retrieves DDE. This path additionally requires a live Item window and the search payment.

**Access opportunities, not actual played actions:**

| Distinct source path | Unconditional shuffled 60 | Conditional on a Basic-valid first seven |
| --- | ---: | ---: |
| ADP original Active + directly held DDE | **9.024465952%** | **15.018760355%** |
| Incremental direct G&H to search unprized DDE | 4.499724171% | 7.488562686% |
| Incremental Tag Call → G&H → unprized DDE | 3.897503029% | 6.486329971% |
| **Combined printed-access screen** | **17.421693152%** | **28.993653013%** |

Actual attachment, two-card DCI cost, prize selection, opponent Special Energy suppression, Item/Supporter locks and **all T2 Thorton/Regidrago** preparations are excluded. Held-DDE's 15.02% is a strictly direct qualifying hand+Prize event, not a win rate; the broader 28.99% is explicitly **optimistic**.

A second positive detail: the **held DDE** route consumes neither one's Supporter nor Item tutor; it therefore remains available under some opposing Item/Supporter locks, assuming ADP was already selected Active, Energy effects remain live and the opponent's board doesn't prevent its GX attack. The separate G&H and Tag Call routes have their own contention and lock vetoes.

## Exact computation and independent sample

[Runnable standalone CommonJS exact enumerator](../../tests/agent30-adp-t1-enhanced-gx-access.test.cjs) verifies original fixed-60 SHA field and all critical printed counts, then enumerates the first eight using exact multivariate hypergeometric category multiplicities (ADP 2, DDE 4, Tag Call 4, G&H 3, other 47). The first-eight set contains the seven initial cards plus first-turn draw, with six Prizes randomly removed in between. A singleton ADP in those eight must be within the opening seven with factor **7/8**; if both ADP are among the eight, one is necessarily in the first seven. DDE/G&H deck survival is calculated after six Prizes from 52 unseen physical cards.

**Independent direct-check physical shuffle:** 450,000 uniformly shuffled 60-card configurations, with actual first seven, six Prizes, and eighth draw, yielded **40,472** held-DDE, **20,149** held-G&H, and **17,883** TagCall→G&H qualifying opportunities, compared with exact expected rates 9.02447%, 4.49972%, 3.89750% unconditional. Every category agrees within sampling noise. Test logic was executed in a separate V8 with the actual fetched v2 manifest, all exact assertions passed. No Twinleaf game simulation or paper win is claimed.

## A notable adversarial cost: frequent mulligans

The same v2 has only **seven** Basic Pokémon. The exact chance a random seven-card opener is Basic-invalid is

`C(53,7) / C(60,7) = 39.912045077%`.

The hypothetical raw deck-opening sequence needs on average **0.66422705 mulligans before its first Basic-valid hand**, and its chance of two or more raw successive Basic-invalid hands is **15.929713422%**. In contrast, Agent43 Apex Alchemy v0 has **12** Basic Pokémon, Basic-invalid initial seven probability **19.064669271%**, mean raw mulligans **0.23555435**, and two or more Basic-invalid hands **3.634616144%**.

The tournament mulligan-draw advantage an opponent receives is **not** equal to those raw expectations in general: both players may mulligan together and opponents choose whether to draw allowed extra cards. It depends on the opponent's actual 60 and setup exchanges. This source-dependent starting-hand and opponent-bonus-draw liability must be recorded when comparing the seven-Basic ADP list against 12-Basic Apex or Shadow Rider lists. **Do not** treat 28.99% conditional ADP setup access as a whole-game probability; it conditions away the seven-Basic mulligan burden and ignores all T2 prerequisites.

## Precommitted comparative implications

For hard original source rank6 Iron Thorns, with initialization suppressing Tapu Lele and Crobat Rule Box Abilities, **ADP's direct held-DDE GX route is independent of both Basic draw Abilities**. Test actual selected early ADP Active and source-owned Plumeria/Team Flare Grunt/Enhanced Hammer response before T2 Thorton. If DDE is removed, a T2 ordinary Basic Energy alone will not reconstruct GGF and the enhanced ADP GX's extra-Prize bonus may never be realized by the promised second-turn attack. This is a mechanism-chain negative, independent of whether the list could play a later fallback game.

For original Absol/Garbodor rank8/11/16/22, source Temple of Sinnoh can make one DDE produce a single Colorless Energy, preventing the enhanced GX line. The v2 includes two Field Blower and two Viridian Forest as potential answers, but held-DDE alone cannot overcome existing unsuppressed Temple; the source's Stadium order and actual selection need to be checked.

**Decision:** The new direct 15.02% chance for enhanced T1 GX with ADP starting Active is a genuine printed-card opportunity, while the seven-Basic mulligan burden and T2 + source-energy-continuity uncertainty strongly constrain extrapolation. The candidate remains **unranked and unfalsified at competitive level**. Current benchmark remains **29/32 authenticated original opposing 60s; zero competitively qualified games**. The ADP and Apex source-geometry rates have different milestones and should not be numerically ranked as game-strength surrogates.
