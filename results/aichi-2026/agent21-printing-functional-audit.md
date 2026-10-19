# Agent 21: printed-card identity and the eight same-name mechanical splits in Aichi

**19 October 2026.** Source-data and card-text audit. This is a reproducible **inventory/printed-text observation**, not an Expanded legality determination, engine-fidelity certification or game-win estimate.

## Source scope and exact count

The immutable [29 published Aichi Top-32 decks](full-decklists.json), Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`, contain **1,740 total physical slots**, **989 card rows**, **238 distinct card names** and **248 distinct (name, set, number, language) identities**. **Eight** names appear in more than one printed version across these source lists, accounting for ten additional printing identities compared with names. Six other missing? No: ranks 23, 25 and 28 have no published source inventory and are excluded.

These eight names matter because **each cross-print family has a source-card gameplay-text difference** in the provided complete English card archive, `card-list.zip`, SHA-256 `c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a`. This comparison uses printed attacks and Abilities rather than treating a print change as cosmetic by default. The archive is a convenient card-text database; current Japanese paper legality and errata still require independent checks.

## The complete observed printing split

| Name | Source printing(s) and rank(s) | Card-text distinction relevant to simulator policy |
| --- | --- | --- |
| **Mimikyu** | GRI 58: ranks 1, 30; PAL 97: ranks 3, 7 | GRI **Copycat** copies an opponent's previous eligible attack; PAL **Safeguard** prevents damage from certain Rule-Box attackers, and **Ghost Eye** places counters |
| **Pidgey** | MEW 16: rank 2; FLF 75: rank 15 | MEW uses **Call for Family**; FLF uses **Peck Off** to discard an opposing Active's Pokémon Tools before damage |
| **Pidgeotto** | TEU 123: ranks 2, 15; MEW 17: rank 15 | TEU **Air Mail** Ability offers top-two selection; MEW version has a different HP/attack profile and no Ability |
| **Vileplume** | AOR 3: ranks 2, 15; BUS 6: rank 15 | AOR **Irritating Pollen** restricts Item plays; BUS **Disgusting Pollen** blocks attacks from opposing Basic Pokémon while Active |
| **Pikachu** | LOR 52: rank 4; XY 42: rank 17 | LOR **Pika Dash** eliminates retreat cost while Energized; XY has **Nuzzle** coin-based Paralysis and no Ability |
| **Trubbish** | PAR 116: rank 8; FST 168: ranks 11, 22; CRI 56: rank 16; NVI 48: rank 22 | FST **Call for Family** searches a Basic to Bench; NVI **Garbage Collection** returns a discard card to deck top; PAR and CRI have different offensive effects |
| **Garbodor** | LTR 68: ranks 8, 16; BKP 57: ranks 11, 16, 22 | Both printed Abilities are named **Garbotoxin** and express the same Tool-dependent suppression in the archive. Their attacks differ: LTR **Sludge Toss**, BKP **Offensive Bomb** with additional Special Conditions |
| **Dusknoir** | PRE 37 and BCR 63, both at rank 31 | PRE **Cursed Blast** places counters with its own knockout cost; BCR **Sinister Hand** moves damage counters already in play |

The table reports card text, not an assertion that the printed attack is normally affordable, strategically optimal, or correctly implemented in pinned Twinleaf. Texts may change through errata or local edition. Rank 16 deliberately carries both Garbodor prints; rank 15 carries multiple Vileplume and Pidgeotto variants; rank 31 carries both Dusknoir prints. Any importer that groups a deck into one entry per **name** must preserve distinct printed identities before constructing game cards.

## Why it affects research validity

- In the initial [printed list-diversity analysis](agent21-field-diversity-coverage.md), ranks **8 versus 22** Absol/Garbodor differ by **7** slots at name level and **11** at print level. Their Trubbish and Garbodor variants are an authentic mechanically distinct printed-input contrast. The Garbotoxin Ability is common to both Garbodor prints, so those differences must not be misdescribed as a different underlying Tool-lock Ability.
- Rank 4 versus 17 Raichu/Electrode differs by **20** name slots and **21** printed slots; its Pikachu print changes potential retreat/Paralysis decisions.
- Rank 15's two Vileplume abilities are distinct lock channels sharing a name and evolution line. A printed-card collapsing simulator could erase an entire opponent route even if its 60-card **name count** still looked valid.
- Rank 1's Mimikyu Copycat is a different tactical role from the Snorlax Safeguard Mimikyu. A name-only effect resolver could mistakenly grant Copycat in a Snorlax match or omit it in the Shadow Rider/Regidrago response case.
- Rank 31's two Dusknoir variants split burst damage-counter placement from subsequent movement. Their mechanics should be checked independently before qualifying a policy.

**Suggested verification invariant:** every deployed source deck must conserve both a canonical printed-identity multiset and its full underlying card text/version. Reprint equivalence may be considered later for search-space compression only after **effect text** and game-relevant stats are compared. No equivalence should be inferred solely from name or shared Ability label.

## Reproduction and limitations

The eight print groups, ranks and counts were enumerated directly from the source manifest (no inferred unknown lists). The referenced English card-text entries were read from `card-list.zip` using its set metadata to resolve PTCGO set codes. The [read-only source inventory analyzer](../../scripts/aichi-field-list-coverage.cjs) validates 60-card totals and sums repeated same-name rows in both identity modes; [tests](../../tests/aichi-field-list-coverage.test.cjs) explicitly check rank16 mixed Garbodor, rank22 split Trubbish, rank8/22 print distance and rank4/17 Pikachu variation. Cross-print text was inspected but has not yet received an automated cross-archive semantic-equivalence test. No native Node CI was run for the new analyzer; a V8 harness executed the committed analysis and assertions against the 29-source JSON successfully.

**Outcome:** printed identity is not dispensable when normalizing the full Aichi field, even for decks that are otherwise similar at name/count level. This is a direct source-fidelity guard for eventual cross-rank bilateral policy evaluation.
