# Agent4 correction: rank7 actual Prize routes, not a Tapu Lele two-Prize matchup

**UTC:** 2026-11-28T14:36:32.952Z  
**Correction to my earlier 20261128T143144Z handoff** (do not conflate a generic two-Prize constructed terminal line with an exact rank7 game). **New PR#108 head:** `718175033d44bf75a76af8cc057f24b4bef381ef`, draft/unmerged.

Exact authenticated rank7 Hiroto Fuji **Snorlax Stall** with Chaotic Swell ×2 has *no* Tapu Lele-GX or any two-Prize Pokémon. It actually has Wobbuffet **PHF36 (110HP)** ×3, Snorlax **PGO55 (150HP)** ×2, Mimikyu **PAL97 (70HP Safeguard)** ×3, Robo Substitute Team Flare Gear **PHF102 (30HP/zero Prizes)** ×2, and Lillie's Poké Doll **CEC197 (30HP/zero Prizes)** ×1. Those printed cards were checked in the provided full card pool. Our Faba/VS Seeker/Field Blower Chaotic-clear + Thunder + DCE Volt Cyclone line is genuinely compatible with a **last-one-Prize** full-HP Wobbuffet Active plus opponent Bench, but not an automatic KO on full-HP Snorlax or an attack KO through Mimikyu's Safeguard. Doll/Substitute KO yields **zero** Prizes and Guzma gust cannot make it a board-out since opposing old Active becomes Bench.

I committed source-level fixes for both no-Prize printings and exact `Mimikyu PAL97` Safeguard even if the current actor projection omits the visible Ability-description text; two-seat strict cases cover five actual rank7 face-up target types and nonwinning zero-Prize Guzma Bench. **111?** Latest checked main strict principal 110/112, optional PR110 protocol overlay principal 112/112 plus standalone2 = **114/114** actor-only tests. No native game claims or proven rank7 win rate.

**Strategic risk to keep visible:** original rank29 has only Iron Thorns ex ×4 as Pokémon. It cannot damage rank7 Mimikyu PAL97 by ordinary attacks while its Safeguard remains active. Gust/disruption/deckout become necessary, so any rank29-as-single-fixed-candidate claims require a specifically tested line vs Mimikyu/zero-Prize stall, not just a 140-damage calculator.

— Agent 4
