# Verified Noivern ex Apex Dragon native copy and basic-attack defense, Aichi rank-6 source hypothesis

**Agent 20 | 21 October 2026.** The human-relevant question is whether PAL153 Noivern ex, present in seven verified Aichi Regidrago opponent 60s, provides a mechanically functioning copied attack against Iron Thorns ex, the only Basic attacker in the verified rank-6 source 60. The answer for **copied damage and Covert Flight's following-turn Basic damage prevention is yes on the pinned Twinleaf Store under a staged, otherwise funded board**. This is an engine behavior result, **not a source-dealt match, source-policy demonstration, new final deck nomination or competitively qualified win**.

## Printed source and tactical reason

- Official-derived [Aichi full source 60 inventory](full-decklists.json) has nine verified Regidrago lists at ranks 10, 12, 13, 14, 18, 20, 21, 27 and 32. Noivern ex is a **singleton at seven** (12/13/14/20/21/27/32), absent at 10/18. The precise initial access problem is independently evaluated in [the exact jointly-funded Noivern opportunity census](regidrago-noivern-funded-turn2-frontier.md). Its expanded, intentionally restricted first-nine mean is 0.84914% over the seven donor lists; that number is an early resource-location event, **not** actual ability to execute a copy.
- The exact published rank-6 60 has four Basic Iron Thorns ex and eight Special Energy: 4 Speed Lightning, 2 Capture, 1 Spiky, 1 Double Colorless. Its three Guzma provide an important potential way to target around protected Regidrago on Bench. Opposing attached Energy and attacks' nondamage effects are not removed by Covert Flight.
- Supplied card text: Regidrago VSTAR SIT's Apex Dragon is GGF and can copy one attack from a Dragon Pokémon in its discard, with only the Apex payment. Noivern ex PAL's Covert Flight is a 70-damage attack with next-opponent-turn Basic-attack damage prevention, while Dominating Echo is a 140-damage attack preventing Special Energy and Stadium **cards from hand** for the next opponent turn. Attack copying and hand-play prohibition wording are distinguished by the Advanced Player's Rulebook §II C-18/C-19.

## Executed pinned Store checks

The native fixture uses `simulation/twinleaf/apex-noivern-rank6-attack-contract.cjs` and `simulation/twinleaf/apex-noivern-rank6-reply-contract.cjs`, included in the **existing manual-only** `.github/workflows/apex-copy-regression.yml`. Pinned Twinleaf submodule SHA: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Initial Active Regidrago VSTAR and GGF Basic Energy are injected, with Noivern PAL physically inserted into the discard pile and an Iron Thorns TWM put Active. Six placeholder Prize cards prevent premature termination. An actual `AttackAction`, native `ChooseAttackPrompt`, and native `ResolvePromptAction` select and settle each attack.

**[Full CI 39665754394 passed](https://github.com/FlareZ123/experiment-01/actions/runs/39665754394)**, head `fa2a9a2033f69d9ef6689fab976eb60c2ac4e54f`:

| Chosen copied PAL attack | Source target | Native settled damage | Native printed attack identity retained |
| --- | --- | ---: | --- |
| Covert Flight | Iron Thorns ex TWM | **70** | Apex Dragon |
| Dominating Echo | Iron Thorns ex TWM | **140** | Apex Dragon |

The stronger next-action contrast sets the opponent's Active Iron Thorns with one Basic Lightning Energy and one Double Colorless Energy before the first copy. It then closes all legitimate pending `WaitPrompt` actions after that first attack. Inspection of the **actual** Store trace showed that this automatically advanced from turn 4, player 0, to **turn 5, player 1, phase PLAYER_TURN**. The test applies a native `AttackAction` with Iron Thorns's printed Volt Cyclone to Regidrago on that subsequent turn, with all opponent setup held fixed.

| Previous Regidrago Apex copy | Iron Thorns next native attack | Damage to Regidrago |
| --- | --- | ---: |
| Dratini OBF Tail Snap, nonprotective control | Volt Cyclone | **140** |
| Noivern ex PAL Covert Flight | Volt Cyclone | **0** |

**[Full CI 39666486093 passed](https://github.com/FlareZ123/experiment-01/actions/runs/39666486093)**, head `d5951953da968beecc8cd8637bafcdd7dd15de3c`. It confirms the paired damage differential under native Store attack resolution and Wait-driven next turn. A later source edit hardens the fixture so the Store's original next-player and turn values are mandatory before opponent attack; no manufactured extra phase transition is needed. This strengthened assertion is awaiting a passing rerun and should **not** inherit the earlier CI certification until completed.

## Unresolved Dominating Echo Special Energy hand-play check

An additional `simulation/twinleaf/apex-noivern-rank6-special-lock-contract.cjs` runs a control copied Tail Snap versus copied Dominating Echo and attempts to play a physically held Double Colorless Energy from the opponent's hand on the next actual Store turn. The initial test [CI 39666939237](https://github.com/FlareZ123/experiment-01/actions/runs/39666939237) failed for a **fixture hand-index assumption**, repaired by using the actual held card index. The next [CI 39667281797](https://github.com/FlareZ123/experiment-01/actions/runs/39667281797) still failed because the **unprotected control did not attach the DCE**. Until a proper control succeeds, an absent DCE attachment in the Echo branch says nothing about Echo's lock or the paper rule. Do not report a positive or negative lock result. An opt-in diagnostic now archives the action rejection, hand ownership, target slot and attached/discard zones so the failure can be localized. The probe is expressly marked unresolved.

## Important scope limits and decision implication

This is a **positive mechanical effect under an injected board**, an essential check before any source-dealt test. It does not demonstrate the actual setup sequence (Noivern discard, live Regidrago V/VSTAR, two timely manual attachments, search and connector contention, opponent turn, Prize locations), the duration of a strong lock across multiple turns, actual skillful rank-6 disruption, robustness to Guzma or an opponent with another attacker, or the overall suitability of any fixed 60. The executable decision policy and competing payload choice remain unqualified.

The next useful test should use **one of the seven verified Noivern-containing Regidrago printed lists** against the exact rank-6 Iron Thorns 60, pre-register both physical starting orders, record all failures, confirm Noivern really reached discard before a funded Apex copy, then require an actual next opposing turn and plausible gust/resource response. This native fixture is a regression reference, not a source game to add to a win-rate denominator.

Current field completeness **29/32 exact Aichi 60s**, **zero** competitively qualified games and **no** demonstrated 99.5% list.
