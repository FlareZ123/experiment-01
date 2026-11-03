# ADP Regidrago donor payload counterexample: Rolling Iron changes 330-versus-360 damage into a Prize breakpoint

**Agent 12 | 3 November 2026 | exact printed-card/rules derivation, source-29 roster proof, new passed reproducible CI test. Not an observed native-game outcome.**

## Finding

The previous [unmodified-HP original-29 envelope](agent12-adp-dragon-payload-330-360-original29-hp-gap-20261103.md) correctly found **zero printed Pokémon names with full HP in (330,360]**, and would alone make the extra 30 damage from a copied `Ryuno Glide` look redundant beside the current fixed ADP/Thorton/Regidrago v2 `Wild Blaze` attack. This new **conditional original-source mirror** resolves an important excluded board effect:

An **opponent's Regidrago VSTAR (SIT 136, 280 HP)** used Apex Dragon on its preceding turn to copy its discarded **Hisuian Goodra VSTAR (LOR 136) Rolling Iron**. Its attack puts an effect on the actual attacking Regidrago: it takes **80 less damage from attacks during the opponent's next turn, after Weakness/Resistance**. Assume that Regidrago stays Active at full HP with the effect intact through our next turn, and our unchanged ADP setup has previously activated **enhanced Altered Creation-GX** (+30 damage and one additional Prize when a damage attack KOs the Active).

| Our Regidrago Apex Dragon copied donor attack | Base | ADP damage boost | Opponent's Rolling Iron shield | Net to full-HP 280 Regidrago VSTAR | Immediate damage KO and bonus Prize? |
| --- | ---: | ---: | ---: | ---: | --- |
| **M Charizard-EX XY2 69, Wild Blaze** (in current v2) | 300 | +30 | −80 | **250** | **No**: target survives with 30 HP |
| **Mega Dragonite ex ASC 152, Ryuno Glide** (hypothetical one-payload alternative) | 330 | +30 | −80 | **280** | **Yes**: 2 VSTAR Prizes +1 enhanced-GX Prize = **3 Prizes** |

This is a rigorous **existence proof of a major tactical payoff under the exact stipulated board state**. A smooth "no source HP between 331 and 360" argument silently misses a common **conditional damage-reduction threshold**. It still does not prove the Dragonite donor is an optimal swap: legal real hands must discard the donor and establish ADP/Regidrago, the opponent must actually choose the copied Rolling Iron and survive/setup, other damage attackers and gust may be available, and Ryuno Glide discards **two attached Energy** whereas Wild Blaze mills the top five of the attacker's deck. Costs affect subsequent attacks, and one extra immediate Prize can matter despite a future Energy deficit.

## This interaction is present in five authenticated exact original-source 60s

The 29 authenticated original Aichi source decks include **exactly five** 60-card inventories containing **both** Regidrago VSTAR SIT 136 ×3 and Hisuian Goodra VSTAR LOR 136 ×1:

| Original Aichi rank | Original Regidrago VSTAR | Goodra Rolling Iron attack donor | Double Dragon Energy |
| ---: | ---: | ---: | ---: |
| 10 | 3 | 1 | 4 |
| 14 | 3 | 1 | 4 |
| 18 | 3 | 1 | 4 |
| 21 | 3 | 1 | 3 |
| 32 | 3 | 1 | 4 |

Each original sixty is source-attested in the repo's `full-decklists.json`. The presence of the donor and the relevant Regidrago in a list does **not** prove an actual live opponent discarded Goodra, powered the attacker, copied Rolling Iron or chose the defensive attack. Nor is it evidence for any of missing original ranks 23,25,28. The printed combination shows a credible opponent **opportunity set**, while how frequently that board appears is open.

The known fixed ADP v2 already includes Haxorus `Bring Down the Axe` which can effect-KO an opposing Active with a Special Energy, so the 250-damage failure of Wild Blaze need not force an impossible victory. A Haxorus effect KO, however, does **not** qualify for enhanced Altered Creation's extra Prize because the printed ADP rule specifies a Knock Out **by damage from attacks**; if opposing Regidrago bears Double Dragon Energy, Bring Down the Axe could take the usual 2 VSTAR Prizes, while Ryuno's 280 **damage** KO could take **3**. Conversely if no Special Energy is attached, that Haxorus route cannot Knock Out by its printed condition. The comparison is conditional on all printed restrictions; it is no declaration of a generally best attacking action.

## Rules and exact-print evidence

- Regidrago VSTAR SIT 136 prints 280 HP, a two-Prize VSTAR rule and `Apex Dragon`, which may use an attack from any Dragon Pokémon in your discard pile.
- Hisuian Goodra VSTAR LOR 136 is Dragon type; `Rolling Iron` prints 200 damage and the 80 reduction during the opponent's next turn.
- M Charizard-EX XY2 69 is Dragon type and `Wild Blaze` prints 300 damage; Mega Dragonite ex ASC 152 is Dragon type and `Ryuno Glide` prints 330 damage.
- ADP SM12 156's `Altered Creation-GX` prints the +30 and extra-Prize-on-damage-KO provisions after the additional Water Energy condition.
- Supplied Advanced Player's Rulebook **C-18** confirms copying an attack means carrying out its attack effects and damage. **B-05** places incoming damage reduction on the receiving Pokémon after Weakness and Resistance. The following-turn effect operates on the original Regidrago user of Apex, not on Goodra sitting in the discard pile. The attacker remains Dragon and the proposed sources do not gain any different Weakness without another board effect.

[Single runnable CJS test](../../tests/agent12-adp-goodra-rollingiron-ryuno-damage-threshold.sft.cjs) verifies all the exact printings, conditionals and 29×60 roster source counts, plus the 250-versus-280 arithmetic. Its new opt-in isolated card-audit job **passed** with the other ADP scripts in [GitHub Actions 41579286949](https://github.com/FlareZ123/experiment-01/actions/runs/41579286949) at workflow revision `926c99d00af0d92af2ecdd29d739c48a0623aedc` or later compatible main checkout; the job's exact head SHA is preserved in the Actions run. No vendor compile, native opponent game or additional competitive-qualification evidence was used.

## Priority of further work

For deciding whether Dragonite deserves a fixed-v2 replacement or a distinct new candidate: first characterize **actual original opponent Rolling Iron selection and persistence** in genuine source-dealt games, with both opponents under the same physical source and proper paper action. Then compare conditional payoff and **Energy-discard resource consequences** against the available Wild Blaze/Haxorus/Dragapult attacks, preserving Supporter/Item payment and played deck structure. Existing original ranks10/14/18/21/32 are pre-specified positive source candidates. Retain all five source decks and source attempt denominators, including cases where Rolling Iron cannot be copied or would be tactically inferior.

**Benchmark gate:** this conditional breakthrough changes the tactical meaning of a 30-damage payload gain, but leaves 29/32 original 60s, zero competitively qualified complete games and no established 99.5% fixed-deck win rate.
