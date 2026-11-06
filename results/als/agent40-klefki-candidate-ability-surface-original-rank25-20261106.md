# Conditional rank25 Klefki threat: Sentinel Basic Abilities vs its Ancient Trait and evolution Abilities

**Agent40 | 6 November 2026 | Printed candidate source, public rank25 firsthand account, card data and rule-text review. No authenticated rank25 60 or native rank25 game.**

## Relevant source provenance and limitation

The rank25 entry is **Kazuki Kumegawa, Alolan Raichu/Electrode**, with its original printed 60 missing from [the Aichi Top32 source manifest](../aichi-2026/full-decklists.json). A first-person May14 [rank25 event account](https://note.com/kume_pokeca/n/n6cfd126f5774) by **kume**, who explicitly reports Swiss 25th, explains the author's reasoning: Klefki's Basic-Ability suppression was attractive against Regidrago lines relying on Latias ex and Tapu Lele-GX; Wobbuffet and Garbodor were also considered, with Klefki chosen as the attractive package. This supports **the intended early Klefki strategic role**, but the finished original rank25 counts, full printed identities and actual play sequences are unavailable. The construction detail is behind a purchase boundary; it must not be filled by cloning an unrelated finishers' list.

## Frozen Sentinel v1 target audit

The currently proposed [Sentinel Lopunny/Vileplume v1 60](../aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json) has the following exact printed **Basic Pokémon**:

| Candidate Basic printing | Copies | Has a printed Ability? | Relevant native/paper interaction if opposing Klefki SVI96 is Active |
| --- | ---: | --- | --- |
| Budew ASC16 | 1 | No | Attacks remain available if otherwise legal |
| Buneary PFL83 | 2 | No | Run Around remains an attack |
| Bunnelby PRC121 | 2 | No | Its **Ω Barrage is an Ancient Trait**, not an Ability; Basic Ability lock alone does not remove it |
| Fan Rotom SCR118 | 1 | **Fan Call** | **Suppressed** by Klefki unless a protection/independent effect changes the interaction |
| Girafarig LOT94 | 1 | No | Get Lost remains an attack |
| Lillipup CEC174 | 2 | No | Its Pokémon may evolve normally when turn conditions are satisfied |
| Oddish UNB5 | 2 | No | Vileplume evolution line unaffected by *Basic-only* Ability suppression after evolving |
| Pidgey MEW16 | 2 | No | The evolved Pidgeotto/Pidgeot ex Abilities are not Basic Abilities |
| Relicanth TEF84 | 1 | **Memory Dive** | **Suppressed** while it remains an unprotected Basic under opposing Active Klefki |

**Census: 14 actual Basic cards, of which exactly 2 print a normal Ability**. This was derived directly from candidate printings and the bundled card database `resources/cards/en` by checking each Basic's card record, distinct `abilities` and `ancientTrait` fields. The distinction is mechanical: Bunnelby PRC's Ω Barrage is documented as an Ancient Trait, which gives the option of attacking twice; it is not disabled merely by making Basic Pokémon have no Abilities.

The pinned Twinleaf [Klefki SVI96](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-scarlet-and-violet/klefki.ts) explicitly implements **Mischievous Lock** applying while Active to *Basic Pokémon in play*, with Mischievous Lock exempt. The native [Stealthy Hood UNB186 implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-unbroken-bonds/stealthy-hood.ts) protects its attached target from opposing Ability effects when effective. The candidate has **3 Stealthy Hood** copies, but Tool deployment is a contested resource because Hood may be required to protect a Benched Vileplume's *Irritating Pollen* against another lock.

## Consequences for the fixed candidate, explicitly conditional

The most immediate target is **Fan Rotom's Fan Call** on the candidate's first turn. It searches up to three Colorless Pokémon with at most 100 HP; an opposing Active Klefki can eliminate that specific Basic Ability access. **Artazon** is a separate Stadium search resource and **TM: Evolution** is a Tool-mediated attack line; Klefki's Basic Ability restriction does not intrinsically prevent Stadium activation or attacks. In the later game, Relicanth's **Memory Dive** can matter for access to previous Evolution attacks; Klefki suppresses that Basic Ability while its Active lock applies and the Relicanth is unprotected.

In contrast, opponent Klefki does **not** intrinsically suppress the candidate's already evolved **Vileplume AOR Irritating Pollen**, **Pidgeot ex Quick Search**, **Pidgeotto Air Mail**, or other non-Basic Ability text. Nor does Klefki make the candidate's **Bunnelby PRC Ω Barrage** disappear. More lock sources, Tool suppression, positioning, gust, and the opponent's genuine decision policy can change these boundaries. One should evaluate a full turn sequence with competing search paths rather than count a blanket 14/14 Basic lock.

A sensible native diagnostic would condition a source-owned Klefki SVI96 Active and the candidate's actual hand of Fan Rotom and Bunnelby, then compare Fan Call available and unavailable while independently testing Bunnelby's two-attack allowance and Artazon/Tool line. This would be a **proxy scenario**, never a faithful original rank25 matchup until its actual 60 can be authenticated. No native result for that diagnostic, no natural opponent starting distribution, and no candidate win percentage is asserted.

**Project limit remains 29/32 authenticated original printed 60s (ranks23/25/28 unavailable), no qualified games, no optimized selected fixed 60, and no demonstrated 99.5% target.**
