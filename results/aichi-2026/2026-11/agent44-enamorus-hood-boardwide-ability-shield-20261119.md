# Enamorus V + Stealthy Hood: board-wide Ability shield hypothesis

**Agent 44 · 19 November 2026 · paper-card-text analysis and candidate construction; no gameplay test**

## Decision

A new, concrete challenger is worth preserving: [Hooded Guardian Shadow Rider v1](../candidate-hooded-guardian-shadow-rider.md), a legal 60-card variant of Hood Shield Shadow Rider v1. It adds one Enamorus V (SWSH11 82) and removes one Quick Ball (FST 237), leaving the other 59 cards unchanged. It is **not** nominated, tested, or claimed to be stronger. The key hypothesis is that a Hooded Enamorus V can protect the rest of the Psychic-powered board from opponent Pokémon Ability effects, replacing a two-target Tool shield with a board-wide conditional shield.

## Exact paper text and the protection chain

The repository's primary card data in `resources/cards/en/swsh11.json` records Enamorus V SWSH11 82 as Expanded-legal and prints Guardian of Love as: “Prevent all effects of your opponent's Pokémon's Abilities done to each of your Pokémon that has any Psychic Energy attached, except any Enamorus V.” The official Pokémon card page gives the same Psychic-Energy condition: [Enamorus V official card text](https://asia.pokemon-card.com/ph/card-search/detail/2679/). Use **Psychic Energy**, not secondary database variants that omit the type qualifier.

The repository's `resources/cards/en/sm10.json` records Stealthy Hood UNB 186 as Expanded-legal. Its printed effect prevents all effects of an opponent's Abilities done to the attached Pokémon and removes such existing effects. The chain is therefore:

1. Attach Stealthy Hood to Enamorus V.
2. Hood prevents opposing Pokémon Ability effects done to that Enamorus V, including effects that would otherwise suppress its own Ability.
3. Guardian of Love then prevents opposing Pokémon Ability effects done to each of your other Pokémon that has Psychic Energy attached.
4. The protected set can include Rule-Box Pokémon such as Shadow Rider Calyrex VMAX and Basic Pokémon such as Mimikyu, provided each has Psychic Energy attached. Enamorus V itself remains the explicit exception and relies on Hood.

This is a printed-text derivation, not yet a native Twinleaf result or an official Enamorus-plus-Hood-specific ruling.

## Official ruling support

The official Pokémon Asia Q&A for Enamorus V directly confirms the scope of Guardian of Love:

- An opponent may use Hatterene VMAX's Witch's Domain and choose a Psychic-Energy-attached Pokémon, but the effect on that protected Pokémon is prevented; only the source-side removal of damage counters occurs.
- An opponent's Radiant Charjabug does not place its damage counters when the Psychic Energy attachment would trigger it against a protected Pokémon.

See the [official Enamorus Q&A](https://asia.pokemon-card.com/ph/rules/search/?keyword=Enamorus) (also captured in the current official search result). These answers establish that Guardian of Love prevents actual Ability effects on qualifying Pokémon, not merely a subset of Ability suppression effects.

A separate official Q&A says Mega Clefable ex's self-protection Ability remains active under an opponent's Active Iron Thorns ex, and that Dusknoir's Cursed Bomb can select a protected Mega Clefable ex but its damage-counter effect is prevented while Dusknoir is still Knocked Out. This is analogous support for the protection/effect-prevention model, not a direct Enamorus ruling: [official Pokémon Asia Q&A search](https://asia.pokemon-card.com/id/rules/search/?pageNo=120).

Agent44's existing [rank31 Dusknoir / Hood audit](agent44-rank31-dusknoir-field-prompt-and-hood-counterline-20261115.md) separately records the pinned Dusknoir PRE Cursed Blast implementation and its self-KO even when counters are prevented. The proposed Enamorus coverage of Cursed Blast is a text-based extension: a Psychic-Energy-attached target should be protected by Guardian of Love, while Enamorus V itself is excluded and remains vulnerable if its Hood is removed. Do not report this as an Enamorus/Dusknoir native test.

## Why the current candidate is a natural host

Hood Shield Shadow Rider v1 has 11 Basic Psychic Energy, four Shadow Rider Calyrex V, four Shadow Rider Calyrex VMAX, and four Fog Crystal plus four Mysterious Treasure. Enamorus V is Basic Psychic and is searchable by either search family. The deck's Underworld Door can attach Psychic Energy from hand to a Benched Psychic Pokémon, which naturally extends Guardian of Love's protected set.

There is one important bootstrap condition under an already-active Ability lock: a Shadow Rider VMAX with no Psychic Energy attached is not yet covered by Guardian of Love, so Iron Thorns/Garbotoxin can suppress Underworld Door. Manually attach the first Psychic Energy to one Shadow Rider VMAX; once that VMAX is a protected target, its Underworld Door can attach Psychic Energy to other Benched Psychic Pokémon and draw two cards. This is a plausible sequential unlock, not a guarantee of opening access or a tested line. Underworld Door cannot attach to non-Psychic Pokémon; any non-Psychic Pokémon whose Ability matters needs a manual Psychic attachment.

### Exact 60-card challenger

The candidate list changes exactly two card identities: +1 Enamorus V SWSH11 82, −1 Quick Ball FST 237. All 19 Pokémon in the variant are Psychic- or Dragon-type; four Mysterious Treasure search either type, while four Fog Crystal search Basic Psychic Pokémon. Quick Ball therefore adds another Basic-search out but no unique Pokémon target. Cutting it lowers the total search count from nine to eight, so the change is a deliberate trade of one redundant-target search out for a new defensive Pokémon, not a free consistency gain. The full list and machine-readable inventory are linked above.

The Pokémon count rises from 18 to 19; Trainer count falls from 31 to 30; Basic Energy remains 11. Basic Pokémon rise from 14 to 15. The exact opening-seven no-Basic probability falls from **13.8591%** to **11.7501%** (hypergeometric, without replacement). This is only a structural side effect, not a strength metric. Enamorus adds a 210-HP two-Prize liability and consumes a Bench slot; these costs must be evaluated alongside the protection benefit.

## Aichi field implications

| Aichi ranks / source effect | Enamorus + Hood hypothesis | Boundary / counterplay |
|---|---|---|
| 6, 24, 29 — Iron Thorns ex Initialization | Hood protects Enamorus from the opposing Ability; Guardian of Love can protect Psychic-Energy-attached Rule-Box Pokémon such as Shadow Rider VMAX. | Requires Hood to remain effective and Psychic Energy on each target. Path/Silent Lab and Tool removal remain separate problems. First VMAX needs a manual Energy bootstrap if the lock is already active. |
| 8, 11, 16, 22 — Garbodor Garbotoxin | Hooded Enamorus can retain Guardian of Love; Psychic-Energy-attached Pokémon should keep their Abilities despite Garbotoxin's global suppression. | Garbotoxin still applies to unenergized Pokémon. Removing/blanking Hood exposes Enamorus and can collapse the shield. |
| 3, 7 — Snorlax PGO 55 Block | A Psychic-Energy-attached Active Pokémon should be protected from Block's Ability effect and able to retreat. | The Active needs Psychic Energy. Enamorus itself is excluded from Guardian of Love and relies on Hood. Tool Jammer can blank Hood if Enamorus is Active; keep the anchor Benched. |
| 15 — Vileplume BUS6 Disgusting Pollen | Guardian of Love should prevent the Basic-attack restriction on a Psychic-Energy-attached Basic such as Mimikyu. | Does not bypass Vileplume AOR3 Item lock; that effect is on the player. Hood/Tools remain separately playable under Item-only lock per the existing manual analysis. |
| 31 — Dusknoir PRE Cursed Blast, Dusknoir BCR Sinister Hand, Radiant Alakazam Painful Spoons | Guardian of Love should prevent Ability effects on Psychic-Energy-attached targets, including damage-counter placement on a protected target. This could preserve the core even after Field Blower removes attached Hoods, because Cursed Blast itself does not suppress Enamorus's Ability. | Enamorus V itself is excluded; after Hood removal it can be targeted. Cursed Blast still self-KOs Dusknoir even when its effect is prevented. MoveDamage source-side behavior needs a native test. |
| 9, 13, 15, 32 — Silent Lab; any Path to the Peak line | No protection. | These are Stadium effects, not Pokémon Abilities; Hood/Guardian do not stop them. Use the candidate's Stadium replacement / Field Blower / Marshadow routes. |
| Rank2/15 Stoutland Sentinel and Vileplume AOR3; Budew Itchy Pollen | No direct bypass. | Supporter lock and Item lock affect the player; Budew's restriction is attack-origin. Guardian of Love only protects Pokémon from opponent Pokémon Abilities. |

The field lock inventory is already synthesized in [Agent35's Aichi lock-architecture report](agent35-lock-architecture-field-synthesis-20261117.md). The rank31 details are in the linked Agent44 report. The proposed shield is therefore aimed at a specific set of Ability-effect axes; it is not a universal lock answer.

## Failure modes and access risk

- **Enamorus is the anchor and the exception.** Guardian of Love does not protect any Enamorus V. Hood is essential for protecting the anchor itself from Iron Thorns, Garbotoxin, Snorlax Block, Cursed Blast, and other opposing Pokémon Ability effects.
- **Tool removal remains a real counter.** Field Blower discards up to two Tools/Stadiums; Megaton Blower discards all opponent Pokémon Tools and Special Energy; Faba can put one attached Tool in the Lost Zone. The current Aichi source audit finds at least one named hard Tool answer in 20/29 available lists. The variant retains both Hoods: one can protect Enamorus and the second can protect another key Pokémon or serve as a reserve. A Field Blower can still remove both at once; Megaton Blower can remove all. If the Hood is removed but no Ability suppression is active, Guardian of Love can still protect the rest of the Psychic-powered board; if Iron Thorns/Garbotoxin is active, removing Hood can suppress Enamorus and collapse the shield.
- **Enamorus is a 210-HP, two-Prize liability.** It can be attacked or gusted; it occupies a Bench slot and should normally remain Benched to avoid Tool Jammer blanking its Hood. If its Hood is removed, Enamorus itself is a legal Ability-effect target because it is excluded from its own Ability. Against rank31, a damaged Enamorus may be threatened by Cursed Blast; Acerola can be considered proactively, but consumes the Supporter for the turn and is not a guaranteed answer.
- **Stadiums are outside the shield.** Path to the Peak and Silent Lab can suppress Enamorus's own Ability. The candidate has Sky Field, Dimension Valley, Field Blower and Marshadow Resetting Hole, but access and sequencing are not guaranteed.
- **Energy distribution is part of the lock.** Every Pokémon intended to keep an Ability or avoid an Ability effect needs Psychic Energy attached. Underworld Door only accelerates to Benched Psychic Pokémon. Dialga-GX and Radiant Eternatus are Dragon-type; if their Abilties are relevant, a manual Psychic attachment is needed. The list has 11 Basic Psychic Energy, so the shield is not literally automatic across every board state.
- **Prize risk:** with two Hoods, the chance both copies are among six Prizes is 0.8475%. For a one-of Enamorus plus the one-of Hisuian Heavy Ball recovery card, the chance both are Prized is also 0.8475%. The union of those two hard Prize-failure events is **1.6918%**, before access, Item-lock, or Heavy Ball reuse constraints. Heavy Ball can recover a Prized Basic Pokémon only if it is available and playable; it cannot recover both if multiple targets are Prized. These are Prize-zone calculations, not package-access or win probabilities.

The 2022 Pokémon TCG Live temporary-ban notice for Enamorus V and Stealthy Hood concerns a client issue, not a paper Expanded ban: [official Pokémon forum notice](https://community.pokemon.com/en-us/discussion/699/pokemon-tcg-live-temporary-card-bans). Do not use TCG Live's implementation/ban history as a paper legality ruling. The repository card data marks both Enamorus V and Stealthy Hood Expanded-legal.

## Deferred native test matrix

No fixture or CI was dispatched for this result. After the current canonical V3 acceptance and first-trace stopline clears, validate the following in the research-owned Twinleaf adapter, not upstream:

1. Hooded Enamorus vs Active Iron Thorns: Enamorus retains Guardian of Love; one manually attached Psychic Energy makes a Shadow Rider VMAX a protected target and restores Underworld Door; an unenergized VMAX remains suppressed.
2. Hooded Enamorus vs Tool-equipped Garbodor: protected targets retain Abilities; unenergized targets do not. Remove Hood with Field Blower/Faba and verify the expected failure boundary.
3. Dusknoir PRE Cursed Blast against (a) Psychic-Energy-attached Shadow Rider VMAX, (b) Enamorus itself, and (c) an unenergized Pokémon. Verify target eligibility, prevention, and Dusknoir self-KO.
4. Dusknoir BCR Sinister Hand and Radiant Alakazam Painful Spoons: test protected Pokémon as source and destination separately; determine whether source-side counter removal is prevented as well as destination placement.
5. Snorlax Block against an Active Pokémon with Psychic Energy versus without it; verify retreat legality. Keep Enamorus Benched and separately test Tool Jammer against an Active Enamorus.
6. Vileplume BUS6 against Psychic-Energy-attached Basic Mimikyu versus unenergized Mimikyu; separately confirm AOR3 Item lock and Budew attack restriction are not bypassed.
7. Path to the Peak and Silent Lab with Hooded Enamorus; confirm Stadium suppression still works, then test replacement Stadium/Field Blower.
8. Field Blower, Megaton Blower, Faba, and Jamming Tower against the Hooded Enamorus package.

Do not change the registered first-trace candidate, seed, or policy to test this hypothesis. Treat the variant as a post-gate challenger; compare it against the unchanged Hood v1 under matched conditions and competent opponent policies only after the acceptance/trace sequence allows competitive evaluation.

## Evidence classification

- **Repository card-text facts:** Enamorus V SWSH11 82 and Stealthy Hood UNB 186 are marked Expanded-legal; their exact printed effects are in `resources/cards/en/swsh11.json` and `resources/cards/en/sm10.json`.
- **Official paper Q&A:** Enamorus's protection prevents actual opponent Ability effects on qualifying Psychic-Energy-attached Pokémon; cited official examples include Hatterene VMAX and Radiant Charjabug. A separate official FAQ gives an analogous Dusknoir Cursed Bomb / Mega Clefable prevention result.
- **Rules-derived hypothesis:** Hood on Enamorus should preserve Guardian of Love under opposing Pokémon Ability suppression, which should then protect the rest of the Psychic-Energy-attached board. No direct Enamorus-plus-Hood/Garbotoxin ruling was found.
- **Mathematical derivation:** opening-seven Basic probability and Prize-only hard-failure calculations are exact hypergeometric calculations under random Prize selection.
- **Unvalidated proposal:** the 60-card challenger is not a demonstrated deck improvement; no games, matchups, or win rates are claimed.
- **Not established:** full-field performance, 99.5%, Enamorus access frequency under locks, exact native Enamorus/Hood behavior, or rank-specific matchup advantage.
