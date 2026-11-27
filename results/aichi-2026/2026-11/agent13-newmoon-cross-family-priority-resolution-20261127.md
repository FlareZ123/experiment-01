# New Moon fixed-60 policy: cross-family conflict resolution

**Agent 13 · 27 November 2026**  
**Purpose:** turn the family-specific acceptance states into one implementable decision hierarchy without adding more one-off tactics.  
**Status:** policy architecture only; no native implementation, workflow, game, or win-rate claim.

## Core rule

The unchanged New Moon 60 cannot use permanent card-name heuristics such as:

- “always bench both New Moon partners”;
- “always take two TPE targets”;
- “Klefki is an Ability-lock Pokémon”;
- “Field Blower should be used as soon as Garbotoxin appears”;
- “Horror House is always the best first GX”;
- “Secret Box is good whenever three cards are present.”

Every one of those rules has a source-supported counterexample.

The policy should instead resolve decisions **lexicographically**:

1. **Immediate game result**
   - take a legal final Prize / immediate win;
   - prevent an immediate loss when a legal survival action exists.
2. **Mechanical legality / accessibility**
   - reject actions blocked by Item lock, attack cost, Ability lock, Bench cap, GX use, Tool occupancy, etc.
3. **Disappearing action window**
   - spend resources before a known lock removes the action if waiting makes the line impossible.
4. **Opponent's strongest immediate reply**
   - include promotion after a KO, re-tooling, gust/Block, spread, Stadium removal, or already-powered attack.
5. **Reserve the selected continuation**
   - keep its attacker, donor, Energy, switch, counter and necessary Bench/evolution pieces before paying discard/search costs.
6. **Discrete tactical value / Prize map**
   - compare hand lock, promotion control, one-Prize buffers, Stadium asymmetry and other conditional effects before raw damage.
7. **Ordinary efficiency**
   - only after the above, maximize draw, Bench development, damage, card access or generic consistency.

The 32-case acceptance JSON is the executable-spec companion to this hierarchy.

## State-dependent pivot table

### 1. Telepathic Psychic Energy

**Widen the board when:**
- rank 26 can otherwise donk a lone Active;
- the second target is required now for a concrete attack/evolution/lock line.

**Narrow the board when:**
- Regidrago's Phantom Dive can convert a 60-HP target into a Prize;
- Snorlax Stall can gust the support body into Block;
- Parallel City / Sudowoodo source pressure makes Bench capacity itself scarce;
- the second target is only generic future value.

**Temple distinction:**
- Temple of Sinnoh does not erase the TPE attachment-time search;
- while Temple remains active, the attached TPE is treated as Colorless, so setup success is not attack-cost success.

Implementation consequence: TPE needs a target resolver that can return **0, 1, or 2** targets and a separate live-Energy-provision check.

### 2. Klefki

**High value when:**
- rank 26 needs Meloetta's Debut Performance / Exeggcute Propagation;
- Iron Thorns is Basic and a one-Prize buffer preserves a fresh native Gengar line.

**Low or negative value when:**
- evolved Shadow Rider VMAX is the Ability engine: Klefki does not stop Underworld Door but does stop Basic Mewtwo Perfection;
- Joust's Tool target is on a Benched Pokémon, not the opponent's Active.

Implementation consequence: never score “Ability lock” without checking the opposing Ability source's **Stage / Basic status** and the candidate's own affected Basics.

### 3. Solrock + Lunatone OBF

**High value when:**
- Path to the Peak is the intended asymmetric lock: candidate Pokémon ignore the Stadium while opponent Rule-Box Abilities remain suppressed;
- another Stadium effect is genuinely done to candidate Pokémon and New Moon remains active.

**Low / no value when:**
- Silent Lab is active: the Basic Lunatone itself has no Ability, so the pair cannot bootstrap through the lock;
- Snorlax/Regidrago board pressure makes two support Bench slots more costly than the Stadium immunity;
- the live Stadium effect is on an attached Energy card rather than the Pokémon, as with Temple of Sinnoh's Special-Energy suppression.

Implementation consequence: bench reservation for the pair must be **goal- and Stadium-specific**, not a global invariant.

### 4. Horror House-GX

**High value when:**
- rank 15 would otherwise turn a Bunnelby KO into immediate BUS Vileplume promotion;
- Field Blower has just disabled all Garbotoxin sources and the opponent could re-tool from hand;
- native Gengar under Iron Thorns needs a protected second Energy attachment;
- Path is suppressing an Ability engine and hand-played Stadium/Field Blower/Marshadow is the ordinary escape;
- New Moon goes second and can deny an opponent's hand-play evolution/setup turn.

**Insufficient when:**
- the opponent's necessary counter is already in play (Benched Marshadow can still Resetting Hole);
- the opponent can attack from an already-powered board;
- the candidate attacker will die to that board attack before the intended follow-up;
- rank 26's first attack happens before New Moon gets an attacking turn.

Implementation consequence: Horror House value is **what hand actions it removes**, not “skip opponent turn.”

### 5. Field Blower

**High value when:**
- it removes every live Garbotoxin-enabling Tool and opens a meaningful Perfection/Horror House continuation;
- it clears a Stadium/Tool that is the actual prerequisite for the selected line.

**Low / inaccessible when:**
- Item lock is active;
- three Tool-enabled Garbodor mean one Blower cannot release all Ability lock;
- using one of two Blower targets on a Stadium leaves another Garbotoxin Tool active;
- Secret Box can reach Blower only by discarding the attack donor/Energy needed after the removal.

Implementation consequence: Field Blower should be scored as **line-enabling state transition**, not generic removal value.

### 6. Escape Rope

**High value when:**
- Snorlax Block has trapped a nonfunctional support Active;
- Covert Flight protects Regidrago and forcing a different Active creates a real Prize/attack target.

**Preserve when:**
- Snorlax still has repeated gust capacity and the current position is not actually trapped.

**Spend now when:**
- a disappearing attack/control window cannot be reached without the switch.

Implementation consequence: singleton Rope has discrete future-option value; do not assign it a smooth generic mobility score.

### 7. Secret Box

**High value only after:**
- the intended continuation is chosen;
- its mandatory cards are protected;
- three other cards are genuinely acceptable discards in the current state;
- the fetched Item/Tool/Supporter/Stadium bundle is better than competing uses of the same connectors.

**Reject when:**
- payment destroys the searched-for line;
- the relevant Item is locked;
- a simpler route already solves the current state with lower resource cost.

Implementation consequence: Secret Box eligibility needs a **line-first DCI gate**, not a raw hand-size check.

## Conflict examples the policy must pass

### Rank 26 vs Regidrago: opposite TPE target pressure

- Rank 26 lone-Active danger: TPE should aggressively create a Bench.
- Regidrago spread pressure: TPE should often decline an unnecessary second 60-HP target.

Resolution: layer 1 immediate survival outranks layer 4 future spread risk. If no immediate donk exists, spread risk can dominate generic board growth.

### Iron Thorns vs Shadow Rider: opposite Klefki value

- Iron Thorns: Basic Ability source; Klefki can suppress it and buffer a fresh Gengar.
- Shadow Rider VMAX: Evolution Ability source; Klefki fails to suppress it and self-locks Perfection.

Resolution: legality/effect targeting precedes “lock value.” Card identity alone never determines the score.

### Path vs Silent Lab: opposite New Moon-pair result

- Path leaves Lunatone's non-Rule-Box Ability intact, enabling asymmetric Stadium protection.
- Silent Lab erases Lunatone because it is Basic.

Resolution: evaluate the actual Stadium text before crediting the pair.

### Rank 15 immediate Prize vs lock promotion

- ordinary damage heuristic prefers KOing 60-HP Bunnelby;
- opponent-reply layer sees BUS Vileplume promotion and can make Horror House better;
- final-Prize exception returns to layer 1 and takes the KO if it wins immediately.

Resolution: immediate game result > opponent reply > raw Prize tempo.

## Minimal trace required from a future implementation

Every materially nontrivial decision should record:

- source family / visible board state;
- candidate starting orientation and Prize counts;
- legal root actions considered;
- selected continuation;
- strongest opponent reply being priced;
- resources protected for the continuation;
- any DCI discard decision;
- any Bench-cap / TPE target-count decision;
- reason the selected action beats the strongest competing action.

This is enough to audit policy competence without exposing hidden opponent information or requiring full tree search.

## Falsification rule

The retained New Moon architecture should be **reconsidered** if an authenticated source state is found where:

1. the opponent has a legal, source-consistent line;
2. the fixed New Moon 60 has no coherent legal response or survival branch even under this state-aware policy;
3. the failure is structural enough that a small policy correction cannot fix it; and
4. repairing it would require a material list change that damages other covered families.

Until such a state is found, implementation should target the fixed 60 rather than restart one-card deck churn.

No qualified matchup or 99.5% claim is created.
