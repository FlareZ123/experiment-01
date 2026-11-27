# Rank 22 Absol/Garbodor source delta: Koko → Vikavolt Item lock before Garbotoxin

Agent17 · 2026-11-27. **Decision affected:** rank22 development-policy implementation. This is exact source/card-text sequencing analysis, not a native game or competence result.

## Exact source axis

Rank22 uniquely adds, relative to the implemented rank11 Absol/Garbodor lineage:

- Vikavolt V DAA 60 ×2 — **Paralyzing Bolt** costs Lightning + Colorless, does 50, and prevents the opponent from playing Item cards from hand during their next turn.
- Tapu Koko ◇ TEU 51 ×1 — **Dance of the Ancients** from the Bench attaches Lightning Energy from discard to two Benched Pokémon, then sends Koko and attached cards to the Lost Zone.
- Lightning Energy ×3 plus Battle Compressor ×2.
- Garbodor BKP 57 — **Garbotoxin** makes every Pokémon in play/hand/discard have no Abilities except Garbotoxin while Garbodor has a Tool.
- Wally ROS 94 ×1 — can evolve a non-EX Pokémon even on the first turn / turn it entered play.
- Float Stone ×4.

This creates a source-specific lock line that rank11 cannot inherit blindly.

## Sequencing invariant

When the actor-visible board/hand makes the line legal, **Dance of the Ancients must resolve before Garbotoxin becomes active**.

A bounded going-second positive can be staged as:

1. put Lightning Energy into the discard with Battle Compressor;
2. Bench Vikavolt V, Tapu Koko ◇ and a second useful Koko recipient;
3. use **Dance of the Ancients**, attaching Lightning to Benched Vikavolt and the other recipient;
4. use the manual attachment to give Vikavolt its second attack unit;
5. only after Dance has resolved, evolve Trubbish with Wally and/or attach a Tool to Garbodor so **Garbotoxin** becomes live;
6. switch/promote Vikavolt if a legal mobility line exists;
7. attack with **Paralyzing Bolt**.

If all prerequisites are present, the resulting turn can end with Item lock from Paralyzing Bolt plus Ability lock from Garbotoxin.

The important policy property is not “always do this combo”; it is **do not activate Garbotoxin before consuming Koko's Ability when Koko acceleration is the connector that makes Paralyzing Bolt payable**.

## Required negatives

1. **Premature Garbotoxin:** if a Tool-bearing Garbodor is already live and no effect has suppressed/removed Garbotoxin, Dance is not available. Do not plan the Koko acceleration anyway.
2. **Active Wobbuffet:** Bide Barricade suppresses non-Psychic Pokémon Abilities in play/hand/discard. Tapu Koko is Lightning, so a live opposing Active Wobbuffet also disables Dance. Do not model the Koko line until Wobbuffet is actually suppressed or leaves Active.
3. **Vikavolt Active:** Dance only attaches to Benched Pokémon. If Vikavolt is already Active, do not count Dance as supplying its Lightning unless a legal switch-out/switch-back route is explicitly available.
4. **Insufficient mobility:** a powered Benched Vikavolt is not an Item lock until it can legally become Active before the attack.
5. **Supporter contention:** Wally consumes the turn's Supporter. If Guzma is required to move an opposing Wobbuffet or solve mobility, the same turn cannot also assume Wally.

## Implementation target

Agent31's rank22 successor should encode the sequence as a bounded plan over actor-visible prerequisites, not as independent bonuses for Koko, Wally/Garbodor, and Vikavolt. The inherited rank11 policy should specifically have a negative regression showing that “attach Tool to Garbodor now” is dominated when doing so destroys the only current Dance → Paralyzing Bolt line.

No native Store/IPC or matchup claim is implied. The exact source 60 remains unchanged.
