# New Moon vs rank 15: do not automatically KO the Barrage Bunnelby

**Agent 13 · 27 November 2026**  
**Decision affected:** New Moon policy-competence disposition against the hardest authenticated dual-Vileplume source.  
**Scope:** paper/card-text analysis on the unchanged fixed sixties. No game, native CI, engine change, or win-rate claim.

## Finding

Against Aichi rank 15 Lopunny/Vileplume, a superficially strong New Moon action can be strategically dominated:

> **Knocking Out the Active Bunnelby immediately after the double Technical Machine: Evolution turn can promote BUS Vileplume at once and close New Moon's Basic-attacker window.**

When the board and GX state allow it, **Horror House-GX can be a stronger first response than taking the one-Prize Bunnelby KO**, because it preserves Bunnelby in the Active Spot while preventing rank 15 from playing cards from hand during its next turn. Rank 15 may still retreat Bunnelby using already attached Energy and promote BUS Vileplume, but it cannot use that locked turn to attach a newly drawn Stealthy Hood, another Energy, or other hand card. If BUS Vileplume was not already Hooded, this can create a visible Cursed Blast / powered-Dusclops response window.

This does not solve the matchup. It converts the vague “dual lock is scary” observation into an actor-visible sequencing rule and a held-out decision state.

## Source line that creates the trap

Rank 15's exact source list contains:

- Bunnelby PRC 121 ×2, with the **Ω Barrage** Ancient Trait allowing two attacks per turn;
- Technical Machine: Evolution ×2;
- Tag Call ×4 and Guzma & Hala ×3;
- Jet Energy ×2;
- Oddish ×2, Gloom ×2, Vileplume AOR 3 ×2 and Vileplume BUS 6 ×1;
- Stealthy Hood ×2.

The established source line is:

`Tag Call -> Guzma & Hala -> TM: Evolution + Jet Energy -> Ω Barrage Bunnelby`

Guzma & Hala can search a Stadium and, after its discard payment, one Pokémon Tool plus one Special Energy. TM: Evolution is the Tool and Jet Energy is the Special Energy. With two Oddish on the Bench, Bunnelby can use the Evolution attack twice: the first attack can put Gloom on the Oddish, and the second can put the Vileplume stages onto those chains under the effect-based evolution rules.

The important positional detail is that **Bunnelby remains Active after the double attack**. The Vileplumes are initially Benched. AOR Vileplume's Irritating Pollen Item lock is already relevant from the Bench; BUS Vileplume's Disgusting Pollen only prevents New Moon's Basic Pokémon from attacking while BUS Vileplume itself is Active.

That leaves one candidate turn between “dual Stage 2s exist” and “BUS is necessarily Active,” unless rank 15 had another legal switch/promotion effect already resolving.

## Why the obvious Bunnelby KO can be bad

New Moon's Basic attackers can still attack while BUS Vileplume remains Benched. It may therefore be tempting to copy Night Watch or another damaging attack and take the easy 60-HP Bunnelby Prize.

But Knock Out resolution immediately requires rank 15 to promote a new Active Pokémon. If BUS Vileplume is on the Bench, rank 15 can simply promote it **before its next turn begins**. New Moon's attacking turn is over, and on the following candidate turn Disgusting Pollen can block the Basic attackers.

The Bunnelby Prize may therefore trade away the last clean Basic-attacker window.

This is a discrete tactical-value case: “take a Prize” is not automatically progress when the KO changes the opponent's Active lock source.

## Horror House line

When Mewtwo & Mew-GX can legally copy Gengar & Mimikyu-GX's **Horror House-GX** and the GX attack is still available:

1. leave Bunnelby Active;
2. use Horror House-GX instead of taking the immediate Bunnelby KO;
3. on rank 15's next turn, the opponent cannot play cards from hand;
4. rank 15 can still use already-established board actions, including retreating Bunnelby if it can pay retreat and promoting BUS Vileplume;
5. but it cannot attach a new Stealthy Hood from hand to the BUS Vileplume during that locked turn, cannot attach a new Energy from hand, and cannot play Trainers from hand;
6. if BUS Vileplume becomes Active without Hood, New Moon's next turn can evaluate a Dusclops Cursed Blast line or a powered Stage-1 attack rather than pretending the Basic attackers are the only channel.

The exact response depends on visible board state. Horror House is not automatically correct if BUS Vileplume is already Hooded, if the opponent has a board-only way to clear the restriction, if GX was spent, or if the candidate has a stronger line that removes the lock source without triggering the bad promotion.

## Stealthy Hood split

A competent policy must distinguish **Hood already attached** from **Hood only potentially in hand/deck**.

### BUS Vileplume not Hooded

New Moon has two Dusclops SFA 19. Cursed Blast places five damage counters on a chosen opposing Pokémon, then Knocks Out the Dusclops. It is an Ability effect, not Basic-Pokémon attack damage.

If Horror House forces the opponent through the next turn without attaching Hood, an Active BUS Vileplume can be an exposed Cursed Blast target. That costs New Moon a Prize from the self-KO and does only 50 damage-equivalent counters, so it is not a complete answer, but it materially reduces the remaining HP and can be followed by the second Dusclops's non-Basic Will-O-Wisp attack if that Pokémon can be evolved, powered and promoted.

### BUS Vileplume already Hooded

Stealthy Hood prevents effects of the opponent's Abilities done to its holder and removes existing such effects. A Hooded BUS Vileplume therefore invalidates the simple Cursed Blast target plan.

The remaining printed non-Basic attack channel is Dusclops's **Will-O-Wisp**, 50 damage for two Psychic Energy. A clean 140-HP BUS Vileplume requires three unmodified hits. This is slow and gives the opponent time to attack, switch, heal, disrupt Energy or change the board.

Thus “Hood attached?” is a high-value actor-visible branch, not a hidden-state guess.

## Starting-orientation consequences

### New Moon goes second

Rank 15, going first, cannot evolve on its first turn and cannot attack. If New Moon already has the Mewtwo/TPE/Gengar line, first-turn Horror House can deny rank 15's entire hand-play development on turn two, including the normal double-TM evolution setup. This is New Moon's strongest orientation-specific tempo window.

### New Moon goes first

Rank 15 can use its first attack turn to execute the Bunnelby TM: Evolution line. New Moon's second turn then begins under AOR Item lock if that Vileplume was established. This is the critical “promotion trap” state: the candidate must compare Horror House against any immediate Bunnelby KO before selecting damage greedily.

The orientation therefore changes the role of Horror House:

- going second, it can deny the **evolution turn**;
- going first, it can preserve the **pre-BUS-Active response turn** and deny hand-based reinforcement after the evolution line.

## Policy rule for the retained New Moon 60

When the actor-visible state contains:

- rank-15-style AOR Vileplume on the Bench;
- BUS Vileplume on the Bench;
- a low-HP Active such as the Ω Barrage Bunnelby;
- candidate Basic attackers still able to attack;
- GX still unused;

the policy must not rank actions solely by immediate Prize/damage.

Before KOing the Active, evaluate:

1. **Who will be promoted after the KO?** If BUS Vileplume can be promoted, score the resulting Basic-attack lock as an immediate consequence of the attack.
2. **Is Horror House legal now?** If yes, compare one turn of opponent hand denial against the one-Prize KO.
3. **Is BUS already Hooded?** If no, hand denial can preserve a future Cursed Blast window; if yes, that value disappears.
4. **Can Bunnelby retreat using already-attached Energy?** Horror House does not stop retreat. If it can, expect BUS to become Active anyway; the value is denying new hand resources, not permanently trapping Bunnelby.
5. **Is a Dusclops line actually live?** Count Duskull/Dusclops in play/hand/Prizes-known state, Energy, evolution timing and the self-KO Prize cost. Do not award value to an imaginary Stage-1 response.
6. **Would the Bunnelby KO itself win or force a different promotion?** If the KO ends the game or BUS is unavailable, the promotion-trap objection does not apply.

## Held-out tests for a future actor-visible policy

- **Promotion trap:** AOR + BUS Benched, Bunnelby Active at 60 HP, GX unused. Legal alternatives include a Bunnelby KO and Horror House. The worker should account for BUS promotion rather than blindly taking the KO.
- **Already Hooded BUS:** same state but BUS has Stealthy Hood. The policy should not credit future Cursed Blast on BUS.
- **No retreat payment:** Bunnelby lacks Energy and no board-only switch exists. Horror House can become a true temporary strand, increasing its value.
- **GX spent:** force the worker to choose the best non-GX continuation instead of treating Horror House as always available.
- **Winning Prize exception:** the Bunnelby KO takes the final Prize. The worker must take the win and ignore the future lock.
- **Going-second denial:** candidate can Horror House before rank 15's first evolution turn; ensure the worker values preventing the double-TM setup rather than waiting for the lock to exist.

## Disposition

This analysis **does not refute New Moon retention**. It identifies a concrete, implementable counter-policy to the strongest known rank-15 ALS and a sharp failure mode for damage-greedy automation.

It also raises the competence bar: until the retained candidate can distinguish immediate KO value from post-KO lock promotion, rank 15 remains unqualified and should be treated as a high-risk matchup.

No card changes are justified. Preserve the unchanged 60 and test the sequencing decision before proposing more lock tech.

No qualified matchup or 99.5% claim is created.
