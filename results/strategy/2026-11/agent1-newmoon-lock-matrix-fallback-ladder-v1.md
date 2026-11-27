# New Moon Lock-Matrix Fallback Ladder v1

**Agent 1 · 27 November 2026**
**Purpose:** choose a legal winning axis after a lock removes one action class. Do not treat 'lock' as a binary deck-off state.

## Native attack inventory when Perfection is unavailable

| Pokémon | Printed attack / cost | Tactical role under Ability suppression |
|---|---|---|
| Gengar & Mimikyu-GX | Horror House-GX [P] | hand-play denial without Perfection |
| Gengar & Mimikyu-GX | Poltergeist [PP] | direct damage based on revealed Trainer count |
| Trevenant & Dusknoir-GX | Night Watch [PPP] 150 | direct damage + two random hand cards shuffled |
| Trevenant & Dusknoir-GX | Pale Moon-GX [PC] | delayed KO pressure; extra Psychic can discard Active Energy |
| Mewtwo & Mew-GX | **Miraculous Duo-GX [PPC] 200** | printed attack remains usable even if Perfection is off; extra Energy heals all candidate damage |
| Lillie's Clefairy ex | Full Moon Rondo [PC] | two-Energy direct attacker with discrete Bench breakpoints |
| Latias ex | Eon Blade [PPC] 200 | direct 200; cannot attack next turn unless effect cleared |
| Galarian Articuno V | Psyray [PCC] 110 | damage + Confusion |
| Lunatone | Moon Press [PCC] 100 | one-Prize direct attacker |
| Dusclops | Will-O-Wisp [PP] 50 | Stage-1 attack plus Cursed Blast Ability |
| Klefki | Joust [C] 10 | can discard Tools from opponent Active before damage |
| Unown | Hidden Power [C] 10 | emergency low-damage attack |
| Duskull | Future Sight [C] | board-control setup, no damage |

Perfection suppression therefore changes the attack set; it does not reduce the set to zero.

## Lock class A — Basic Ability suppression

Examples: Active Klefki, Silent Lab.

Lost or impaired: Perfection, Lunatone New Moon, Unown draw and other Basic Abilities.

Still available: every printed attack above, subject to Energy/GX state. Stage-1 Dusclops Ability also remains under Basic-only suppression.

Priority:

1. if legal, remove/replace the suppressor when that restores a decisive Perfection line;
2. otherwise use native Gengar/Trevenant/Dusknoir, Clefairy, Mewtwo printed GX or another direct attacker;
3. do not spend Cologne/search resources merely to restore Perfection when a native line dominates.

## Lock class B — Rule-Box Ability suppression

Example: Iron Thorns Initialization.

Lunatone New Moon is non-Rule-Box and remains live. With Solrock+Lunatone, Path can suppress opposing Thorns while candidate ignores the Stadium, restoring Perfection.

Native attacks remain the fallback if the pair/Path line is unavailable.

## Lock class C — Active-only Ability suppression

Examples: Flutter Mane (opponent Active's Ability), Empoleon V (opponent Basic non-Rule-Box Abilities).

Repositioning can change the Ability map. Before spending a lockbreak card, check whether:

- moving the candidate Active restores its Ability;
- the suppressor can be gusted/disabled;
- a Benched support Ability remains live;
- a direct printed attack avoids the contested Ability entirely.

## Lock class D — global non-Rule-Box Ability suppression

Example: Garbotoxin while Tool-enabled.

Path does not solve a non-Rule-Box Garbodor Ability. Field Blower / Tool interaction is the primary lockbreak. Until then, direct attacks remain legal.

## Lock class E — Basic **attack** suppression

Example: Active Vileplume BUS 6 Disgusting Pollen.

This is materially different from Ability lock.

Every Basic Pokémon in New Moon is prohibited from attacking, including:

- Mewtwo & Mew-GX;
- Gengar & Mimikyu-GX;
- Trevenant & Dusknoir-GX;
- Clefairy ex;
- Latias ex;
- Articuno V;
- Lunatone;
- Klefki / Unown / Duskull.

**Dusclops is Stage 1**, so it remains the native in-deck attack/effect channel:

- Cursed Blast can place 5 damage counters and self-KO;
- Will-O-Wisp [PP] can attack for 50.

Other recovery channels are Cologne if Item play is legal, gust/switching the BUS Vileplume out of Active, or pre-lock Horror House/setup. Do not select a Basic attacker while Disgusting Pollen remains active.

## Lock class F — Item lock

Example: Vileplume AOR 3.

Disabled: Items such as Fog Crystal, Battle Compressor, Secret Box, Field Blower, Cologne, Counter Catcher and Escape Rope.

Still available unless separately locked: Supporters, Pokémon Tools, Stadiums, Energy, Pokémon plays/Abilities, attacks.

Current-rule correction: Pokémon Tools are a separate Trainer type from Items, so Powerglass remains playable under AOR Vileplume unless another Tool restriction exists.

## Lock class G — Supporter lock

Example: Active Stoutland BCR 122.

Disabled: Supporter play.

Still available: Items, Tools, Stadiums, Energy, Abilities and attacks. Against rank 2, Clefairy Rondo at six total Bench bodies cleanly KOs 140-HP Stoutland for two Energy.

## Lock class H — Item + Supporter lock

Example: rank-2 AOR Vileplume + Active Stoutland.

Policy must transition to the in-lock attacker economy:

- TPE / ordinary Energy;
- Powerglass;
- Stadium replacement;
- direct attacks (especially Clefairy / Latias / native TAG TEAMs);
- in-play Abilities not otherwise suppressed.

Do not search for an Item/Supporter escape that the current state forbids.

## Lock class I — hand-play lock

Example: Horror House-GX.

Use the separate Horror House Action-Boundary Policy: attacks, in-play Abilities, retreat, existing Stadium effects and automatic attached-card effects remain candidates.

## Decision algorithm

1. Identify exact lock source and scope: Ability vs attack vs card type vs player hand; Basic vs Rule Box vs Active only vs global.
2. Delete only the action classes actually prohibited.
3. Recompute the native attack inventory from the current board/Energy/GX state.
4. Compare lockbreak cost against the best surviving direct line.
5. Only call the state 'locked out' if every legal winning/continuation axis is actually removed.

## Acceptance additions

- LOCK-PERFECTION-OFF-MEW2-PRINTED-GX: Perfection suppressed, Mewtwo has PPC and GX unused. Miraculous Duo-GX remains a legal 200-damage printed attack.
- LOCK-BUS-BASIC-ATTACK: BUS Vileplume Active. Reject all Basic attacks even if their Abilities are live; preserve Stage-1 Dusclops attack/effect and legal lockbreaks.
- LOCK-AOR-TOOLS: AOR Vileplume Item lock active. Keep Pokémon Tools such as Powerglass playable under current rules.

No deck change or competitive result follows.