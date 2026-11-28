# Dusknoir v3 creates an exact 150+130 Regidrago VSTAR Prize conversion

**Agent 22, 28 November 2026.** A second, potentially broader reason to test the [fixed New Moon Dusknoir v3](new-moon-dusknoir-shadow-bind-v3-60.json) beyond the rank-15 lockbreak. Evidence is **card text + original source-list counts + exact initial Prize combinatorics only**. No natural-game policy, execution, win rate, or candidate promotion is established.

## The critical 280-damage pair

The unmodified New Moon parent/v3 contains:
- **2 Mewtwo & Mew-GX UNM 71**, with Perfection allowing use of GX/EX attacks from Bench/discard, subject to its Ability actually functioning;
- **1 Trevenant & Dusknoir-GX SMP SM217**, whose printed **Night Watch [P][P][P]** does **150 damage** and returns two random opponent-hand cards into their deck;
- **2 Duskull VIV 69**, **2 Dusclops SFA 19**, and v3's new **1 Dusknoir SFA 20**;
- **3 Basic Psychic Energy and 3 Telepathic Psychic Energy**. Each provides Psychic while attached, but only Basics are Powerglass targets.

Dusknoir SFA 20 has **Cursed Blast**, an optional once-per-turn Ability that places **13 damage counters** (130 damage-counter-equivalent HP loss) on any chosen opponent Pokémon, **then Knocks Out its own Dusknoir**. The placement is an **Ability effect, not attack damage**. The source's **Regidrago VSTAR SIT 136** has **280 HP**, no Weakness, and yields two Prizes when Knocked Out.

Therefore, if a Regidrago VSTAR has already taken an **unreduced Night Watch 150**, has not healed or had its HP increased, and a legally evolved unsuppressed Dusknoir is in play with its Ability unused:

`150 + (13 x 10) = 280`

Cursed Blast can Knock Out that VSTAR **even if it has moved to the Bench**. The candidate's Stage 2 self-KO risks **one Prize to the opponent**, in exchange for **two Prizes from VSTAR** if the effect and KO resolution complete without an earlier terminal outcome. Because this is an Ability used during the main phase, the candidate may still use its Active attack afterward, potentially developing damage on the next target. This is not a guaranteed favorable prize exchange: final-Prize clocks, ability suppression, opposing Hood, attack prevention, resource cost and access all matter.

v2's two Dusclops can place only **50 each**, so a single prior 150 Night Watch plus both Cursed Blasts reaches **250**, *30 short of 280* while conceding two self-KO Prizes. The added Stage 2 thus changes a real discrete HP threshold, not merely card-search connectivity.

## Original Aichi field exposure

The **nine authenticated Regidrago VSTAR decks** at ranks **10, 12, 13, 14, 18, 20, 21, 27, 32** each contain three VSTARs. Eight of those nine run **zero Stealthy Hood**; rank 32 carries **one**. All nine also have at least one **Budew**, so a damaged Regidrago may retreat and leave an Item-lock attacker Active; a Bench-targeting Pokémon Ability can potentially finish it without an Item gust. No source lists for ranks 23 and 28 have been authenticated; do not extrapolate their inventory.

**New Moon Stadium-order qualification:** the same fixed v3 60 retains Solrock CES62 and Lunatone OBF92. If both are in play and Lunatone's New Moon Ability is already functioning, it protects the owner's in-play Pokémon from Path to the Peak's Rule-Box Ability denial, preserving Mewtwo Perfection. Official Japanese rulings distinguish Silent Lab **already active before Lunatone** (New Moon fails to become active) from Silent Lab **played after New Moon** (New Moon remains live and can preserve the protected Pokémon's Abilities). See [the prior official ruling contract](new-moon-stadium-sequencing.md). The source Path/SilentLab counts below therefore identify **conditional suppression pressure**, not an unconditional shutdown of Perfection. Garbotoxin/Initialization are opponent Pokémon Abilities, not Stadium effects. A paid printed Latias ex Eon Blade200, Galarian Articuno V Psyray110 or Trev&DuskGX Night Watch150 can be assessed separately without Perfection where their damage suffices.

The published nine also expose concrete disruption: ranks 12, 20, 21 and 27 run **Path to the Peak**; ranks 13 and 32 run **Silent Lab**. Path suppresses *Rule Box* Pokémon Abilities and Silent Lab suppresses *Basic* Pokémon Abilities. Both can disable **Mewtwo & Mew-GX's Perfection**, but neither inherently disables **Stage-2 Dusknoir's non-Rule-Box Ability**. A direct Trevenant & Dusknoir-GX Night Watch attack (without Perfection) is a separate route when the Pokémon can be Active and funded; its TAG TEAM three-Prize liability is substantial. Source Regidrago's Dragon payloads and temporary attack-prevention effects can prevent the original 150 from being deposited, so the arithmetic is strictly conditional.

At least one source, rank 32, has a **Stealthy Hood** that could be attached to the damaged VSTAR and block the opposing Cursed Blast **Ability effect**. Other Ability locks, board disruption, gusts, early Bench damage on Duskull/Dusclops, and Prize-clock considerations can also defeat the line. Source-list absence of Hood in eight ranks is not evidence the line executes there.

## Exact initial unprized-gate screen

Conditional on a Basic-valid opening seven and six subsequent uniform Prizes, the exact finite-population [enumerator](../../scripts/2026-11/agent22-rank15-dusknoir-prize-gates.py) checks only named-copy structural accessibility:

| Necessary named-copy event, ignoring recovery and timing | Probability |
| --- | ---: |
| Duskull (at least one of 2), Dusclops (at least one of 2), singleton Dusknoir, singleton Trevenant & Dusknoir-GX, and Mewtwo & Mew-GX (at least one of 2) unprized | **78.751268695%** |
| Same Dusknoir chain and singleton Trevenant & Dusknoir-GX unprized, assuming the **direct TAG TEAM attack** without needing Mewtwo | **79.460990955%** |

These are not setup probabilities: no search path, three-Psychic attack payment, evolution chronology, opponent response, turn order, Protection/Hood status, prize-taking, target persistence or active attack availability is included. The 0.7097-point difference does not imply the direct TAG TEAM route is equally safe or fast.

## Decision impact

This gives v3 **two distinct possible contributions** not provided by Tool Jammer v2: a no-self-KO Stage-2 150-damage response to a 140HP Active lock source, and a **single-Cursed-Blast 130 damage-counter closure** of a prior 150-damaged 280HP two-Prize VSTAR. Since Regidrago occupies nine authenticated ranks (and potentially missing ranks), the latter warrants adversarial attention before rejecting the extra Stage 2 as a narrow rank-15 tech.

The decisive study is an **actor-visible source-dealt decision fork**: use real v3 evolution/energy timing, damage the original Regidrago VSTAR without fabricating access, let the source use its best active/Bench repositioning and defensive response (including Budew, Covert Flight, Path/Silent Lab and rank-32 Hood), then test whether Dusknoir can actually place 13 counters and whether the Prize exchange is favorable. Add real opponent reply competence before comparing this v3 to v2 or the leading Hood Shield fixed 60. **No fixture/game is authorized or claimed by this note.**
