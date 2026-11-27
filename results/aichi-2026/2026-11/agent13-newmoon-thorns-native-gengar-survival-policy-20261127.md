# New Moon vs Iron Thorns: native Gengar is the primary lock-bypass, but survival is orientation-sensitive

**Agent 13 · 27 November 2026**  
**Decision affected:** retained New Moon policy competence against ranks 6/24/29 Iron Thorns.  
**Scope:** exact source-list/card-text analysis and elementary hypergeometric hand composition. No game, native CI, or win-rate claim.

## Finding

New Moon should not treat Canceling Cologne as its only response to an Active Iron Thorns ex.

**Gengar & Mimikyu-GX is a native attacker with no Ability.** Iron Thorns ex's Initialization removes Abilities from non-Future Rule-Box Pokémon, but it does not stop Gengar & Mimikyu-GX from using its own printed attacks. That makes the native Gengar line the most important independent counter-channel when Perfection is suppressed.

The core sequence is:

1. get native Gengar & Mimikyu-GX Active with one Psychic Energy;
2. use **Horror House-GX**;
3. the opponent's next turn may still use board actions and attack, but cannot play cards from hand;
4. attach the second Psychic Energy on New Moon's next turn;
5. use **Poltergeist**, which does 50 damage for each Trainer revealed in the opponent's hand.

This line attacks the actual composition of the published Thorns decks: ranks 6/24/29 each play only four Pokémon and a very high Trainer count. It also uses Horror House to suppress the exact hand-based resource denial that otherwise attacks New Moon's six-Energy economy.

The line is **not orientation-neutral**. Gengar & Mimikyu-GX has 240 HP while Iron Thorns ex's Volt Cyclone does 140. A fresh Gengar survives one Volt Cyclone but not two.

## Going second: cleanest native-Gengar window

If New Moon goes second and can establish the native Gengar + Psychic line on its first turn:

- Iron Thorns, going first, cannot attack on its first turn;
- New Moon can use Horror House-GX;
- on the locked Thorns turn, the opponent cannot play Plumeria, Team Flare Grunt, Crushing Hammer, Guzma & Hala, Stadiums, Tools, Energy, or any other hand card, although it can use already-established board actions and attack if already powered;
- one Volt Cyclone puts Gengar at 100 HP remaining;
- New Moon then has its next turn before a second attack and can attach the second Psychic Energy and consider Poltergeist.

This is the strongest orientation for the native bypass because the Horror House turn occurs before Gengar has taken the first 140.

## Going first: the same line can fail to simple two-hit pressure

The published Thorns architecture can threaten a first attack going second by combining Double Colorless Energy with Thunder Mountain Prism Star under the appropriate setup. If New Moon goes first and exposes Gengar immediately:

1. Thorns attacks Gengar for 140;
2. New Moon uses Horror House;
3. the locked Thorns turn still permits the already-powered Active to attack for another 140;
4. Gengar is Knocked Out before it gets the intended Poltergeist follow-up.

Therefore a policy that blindly selects “native Gengar Horror House” whenever Initialization is active is incomplete.

### Sacrificial-Active branch

The retained New Moon list has a one-Prize **Klefki SVI 96**. If the opening state supports it, a strategically coherent going-first branch is:

- start Klefki Active;
- establish/power native Gengar on the Bench;
- if Thorns takes the Klefki Prize, promote a **fresh** Gengar;
- use Horror House;
- survive the next 140 on fresh Gengar;
- then evaluate Poltergeist.

Klefki's Mischievous Lock suppresses Basic Pokémon Abilities while Klefki is Active, including Initialization and New Moon's own Basic Pokémon Abilities, but the sacrifice line is using native Gengar rather than Perfection. The goal is not to “lock” Thorns forever; it is to stop the first Volt Cyclone from landing on the three-Prize attacker.

This is conditional, not a default starter prescription. Thorns may have Guzma/gust routing, may decline the Klefki KO, or may fail to assemble the turbo attack. The worker must compare the real alternatives from the visible state.

## Why Horror House improves the Energy race

The published Thorns lists are built around hand-play resource denial:

- Plumeria and Team Flare Grunt remove Energy;
- Crushing/Enhanced Hammer variants attack attached Energy;
- Guzma changes board position;
- Stadiums and Tools change attack/retreat conditions.

Horror House does not stop an already-powered Volt Cyclone, but for the locked turn it stops these **hand-play** actions. That creates a protected attachment window for New Moon's second Psychic Energy before Poltergeist.

This is important because native Gengar requires two Psychic for Poltergeist. A raw “two Energy are needed” consistency penalty overstates the difficulty if Horror House has already denied the opponent's hand-based Energy disruption for the intervening turn.

## Poltergeist threshold against the exact rank-6 composition

Iron Thorns ex has 230 HP. Poltergeist needs **five Trainer cards** in the revealed hand to reach 250 and Knock Out an undamaged Thorns.

Rank 6's exact 60 is:

- 4 Pokémon;
- 48 Trainers;
- 8 Energy.

As a deliberately simple prior before conditioning on public plays, the hypergeometric probability that a random hand contains at least five Trainers is:

| Hand size | P(at least 5 Trainers) under 48/60 raw composition |
|---:|---:|
| 5 | 31.3522% |
| 6 | 65.5546% |
| 7 | 86.4561% |
| 8 | 95.6579% |
| 9 | 98.8432% |
| 10 | 99.7426% |

These are **not attack-success probabilities** and not matchup odds. In a real open-list game the policy knows the source 60 and public cards already played/discarded/revealed, so it should update the remaining Trainer/non-Trainer composition. Poltergeist itself reveals the hand only after the attack is chosen.

The actionable rule is narrower:

> after Horror House, hand size tends not to shrink through ordinary hand plays on the locked turn and the opponent still draws for turn, so a large locked hand in these 48-Trainer shells is a materially better Poltergeist target than a small hand.

A competent actor-visible policy should use public hand size plus exact source-list/public-zone evidence, not a hardcoded “Thorns always has five Trainers.”

## Stadium-cost branch

Wondrous Labyrinth Prism Star can make non-Fairy attacks cost one Colorless more. That can turn one-Psychic Horror House into a two-Energy requirement.

New Moon has an independent printed answer:

- Lunatone's **New Moon** Ability prevents all Stadium effects done to New Moon's Pokémon while Solrock is in play;
- Solrock and Lunatone are non-Rule-Box Basics, so Iron Thorns's Initialization does not remove their Abilities merely for being Rule-Box Pokémon;
- TPE can search both because they are Basic Psychic Pokémon.

This does not mean “always bench Solrock + Lunatone.” Against Regidrago, the same bench expansion can be punished by spread; against Thorns, Bench space and TPE target opportunity cost still matter. It means the policy should recognize the pair as a Wondrous-cost escape rather than treating the Stadium tax as immutable.

## Cologne / Perfection becomes the secondary branch, not the baseline

Canceling Cologne remains valuable: it can turn off the Active Thorns Ability for the current turn so Mewtwo & Mew-GX can use Perfection. Existing access work shows meaningful but incomplete first-turn Cologne routing.

However the policy should compare that route against native Gengar instead of automatically spending a scarce Cologne:

- Cologne is a one-turn Item and can be needed later;
- Perfection then still requires the correct attack donor and Energy;
- native Gengar spends no counter Item and directly exploits the opponent's Trainer-heavy hand after Horror House;
- the native line carries three-Prize exposure and its survival condition is orientation-dependent.

This is a DCI/connector-domination decision: a reachable Cologne route is not automatically the best use of the Item/search connector.

## Held-out actor-visible policy states

1. **Second-player clean line:** fresh Gengar, one Psychic, GX unused; Active Thorns; candidate goes second. Worker should see Horror House → survive one 140 → second attachment → Poltergeist as a coherent line.
2. **First-player damaged Gengar:** Gengar has already taken 140 before candidate's Horror House turn. Worker must not pretend it survives another Volt Cyclone.
3. **Klefki buffer:** Klefki Active, powered Gengar Benched, opponent has a turbo-attack line. Worker should value the one-Prize buffer and post-KO fresh promotion when appropriate.
4. **Gust counterexample:** opponent has a legal Guzma line that bypasses the Klefki buffer. Worker must not assign the buffer unconditional protection.
5. **Small locked hand:** Horror House applied but public hand size is small and the remaining source composition makes five Trainers unlikely. Worker should consider a different follow-up rather than hardcode Poltergeist.
6. **Wondrous Labyrinth:** Horror House appears underfunded until a Solrock + Lunatone board removes the Stadium effect. Worker should recognize the printed New Moon channel if the pair is actually available.
7. **Cologne conserved:** both native Gengar and Cologne/Perfection are legal. The worker must price future counter scarcity and three-Prize attacker exposure instead of consuming Cologne solely because it is accessible.

## Disposition

This result supports the architecture-selection decision: New Moon has a **real non-Perfection attack plan** into Iron Thorns, so the matchup is not structurally dependent on drawing one of two Cologne.

It also makes the policy requirement stricter. The worker must understand:
- starting orientation;
- attacker damage/survival;
- sacrificial Active value;
- opponent public hand size and remaining source composition;
- Stadium attack-cost effects;
- counter-Item opportunity cost.

No card change follows from this analysis. No matchup is qualified and no 99.5% claim is supported.
