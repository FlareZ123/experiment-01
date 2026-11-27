# New Moon Guzma/Sky v2 — contradiction audit

**Agent 13 · 27 November 2026**

**Question:** does the preferred fixed v2 or its actor-visible policy contract contain an internal requirement that is impossible, mutually inconsistent, or inherited accidentally from v1?

## Result

No direct contradiction was found in the current fixed v2.

The audit did find one missing state-dependent resource rule, now added to the contract: if K1 establishes that both Dusclops are Prized against rank 15 while the dual-Vileplume line remains reachable, **Guzma becomes hard-protected for the selected lock-escape continuation**. That is a DCI/UDP state, not a permanent property of Guzma.

Current contract: **65 actor-visible cases**.

## Conflict checks

### Guzma vs Supporter lock

- Rank 2 Stoutland Sentinel makes Supporters unplayable while Stoutland is Active.
- The v2 contract does **not** use Guzma after Sentinel is active.
- Its Guzma case is explicitly the disappearing pre-Sentinel window: Bunnelby Active, Stoutland Benched, Supporter still legal.
- Once Sentinel is Active, the contract uses the Full Moon Rondo attacker economy instead.

**Disposition:** consistent.

### Guzma vs AOR Item lock

- Rank 15 AOR Vileplume blocks Items, not Supporters.
- The both-Dusclops-Prized repair uses Guzma specifically because Escape Rope and Counter Catcher are Items and are unavailable.
- Silent Lab can block Tapu Lele-GX Wonder Tag access to Guzma, but it does not make a Guzma already in hand unplayable.

**Disposition:** consistent; access and playability are separated.

### Counter Catcher + Ace Trainer

- The rejected Counter Catcher→Guzma experiment lost a same-turn multi-axis catch-up line after Cursed Blast.
- Preferred v2 keeps Counter Catcher and both Ace Trainer unchanged.
- The contract explicitly requires comparing Ace Trainer + Counter Catcher against Guzma rather than collapsing all gust effects into one role.

**Disposition:** repaired.

### Sky Field count

- v2 has exactly one Sky Field and two Path to the Peak.
- No v2 case assumes a second Sky Field.
- The contract includes a list-fidelity case requiring the actual one-Sky count.
- Full Moon Rondo's six-total-Bench breakpoint at rank 2 does not require Sky Field; ordinary Bench capacity across both players can reach it.

**Disposition:** consistent, with a real redundancy cost already quantified.

### Bench widening vs narrowing

- Rank 26 immediate survival can require aggressive Bench construction.
- Regidrago, Snorlax, Raichu, opposing Full Moon Rondo and Sudowoodo/Parallel City can make extra Bench bodies liabilities.
- The policy hierarchy resolves the apparent contradiction lexicographically: immediate game survival outranks later spread/gust/bench-pressure risk; otherwise target count is state-dependent.

**Disposition:** conditional, not contradictory.

### Klefki across families

- Klefki can suppress Basic Iron Thorns ex or rank-26 Basic Ability engines.
- Klefki does not suppress Evolution Shadow Rider VMAX and can self-disable Basic Mewtwo & Mew-GX Perfection.
- Active Klefki can temporarily suppress opposing Basic Sudowoodo Roadblock; leaving Active can reactivate Roadblock and force Bench reduction.

**Disposition:** contract conditions on opposing Ability source stage/type and transition state; no universal Klefki rule remains.

### Path / New Moon / Silent Lab / Temple

- Path can become asymmetric when Lunatone OBF + Solrock are active.
- Silent Lab removes Basic Lunatone's Ability itself, so the pair cannot bootstrap through Silent Lab.
- Temple of Sinnoh still permits TPE's attachment-time search but suppresses its attached Special-Energy provision while Temple applies.

**Disposition:** three distinct Stadium semantics are preserved; no universal 'New Moon beats Stadiums' rule remains.

### Hidden information

- Contract cases use public source lists, public board/discard/revealed information, own K1 Prize inference, and actor-visible state.
- Cases that mention a possible hidden out explicitly forbid assuming that out is actually in the opponent's hand.
- The rank-15 Guzma protection case uses **own** K1 information only.

**Disposition:** no deliberate opponent hidden-hand or hidden-Prize leak found.

## New DCI rule added by this audit

When K1 shows both Dusclops Prized against rank 15 and the BUS+AOR line remains live:

- preserve Guzma if it is the selected independent escape;
- do not pay it as a Secret Box/discretionary discard merely because it is a singleton Supporter;
- allow its DCI to rise again if the lock is removed, BUS is no longer a threat, another independent escape is secured, or the game horizon changes.

This is exactly the state-dependent behavior the human-developed DCI/UDP concepts were intended to capture.

## Remaining uncertainty

The audit is policy/logical, not competitive evidence. The largest unresolved v2 tradeoff remains empirical: whether losing the second Sky Field hurts real Stadium-replacement/Bench sequences more than Guzma helps the multi-family switch/gust states. That requires a competent actor-visible implementation and later owner-authorized native games, neither of which was dispatched here.

No qualified matchup or 99.5% claim is created.