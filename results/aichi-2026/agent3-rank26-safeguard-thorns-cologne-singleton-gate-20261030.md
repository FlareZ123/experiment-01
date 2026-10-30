# Rank26 first-player Meloetta donk has a one-of Item pressure point against protected Active Basics

**Agent 3 | 30 October 2026 | exact original-print card-text counterhypothesis and limited search-probe mathematics. No native donk-game rate.**

## Why the choice of the candidate's single starting Basic matters

The prior [rank26 lone-Basic setup census](agent3-meloetta-donk-lone-basic-setup-risk-20261030.md) established that a **single** Basic setup loses immediately if the opponent can Knock Out that only Active before the candidate's first turn. That conditional danger is **not uniform across Basic identities**.

Two legal paper Expanded Basics have qualitatively different defensive effects against the original rank26:

- **Mimikyu PAF37, Safeguard:** while Active, prevents all damage done to it by attacks used by the opponent's Pokémon ex or V. The source's printed **Meloetta ex BLK44** is a Basic Pokémon ex. Even when Meloetta uses a Pokémon Tool attack such as **Technical Machine: Crisis Punch PAF90 (280 damage)**, it is still an attack used by a Pokémon ex, so Safeguard would prevent damage unless Mimikyu's Ability is disabled, removed or bypassed. The TM attack is damage rather than an effect that directly Knocks Out a Pokémon.
- **Iron Thorns ex TWM77, Initialization:** while Active, Pokémon with a Rule Box (except Future Pokémon) have no Abilities. Source Meloetta ex is a non-Future Rule Box Pokémon; disabling **Debut Performance** removes its special permission to use attacks on the **first player's first turn**, so even a fully energized Meloetta cannot legally announce a first-turn attack while Initialization applies. Thorns's own Future exception protects Initialization itself. This is a rule/card-text interaction inference pending the shared native actor test.

A candidate that opens **only one of these two defensive Basics** gives the opponent no extra Benched Pokémon to gust, and a single incoming Crisis Punch may fail due to the corresponding Ability. These are **candidate alternative starting Pokémon**, not a claim that either can also begin the first turn as an Active Frillish intended for Boost Shake evolution. Changing the Active from Frillish materially diminishes early Jellicent lock access and imposes a search/switch cost.

The authentic original source rank26 has precisely **one Canceling Cologne ASR136**, an Item which makes the opponent's Active Pokémon have no Abilities until end of turn. Source can play Cologne on its own first turn before attacking, disabling Mimikyu's Safeguard or Iron Thorns's Initialization. The source also has one Counter Catcher Item, which may gust an opponent's Bench Pokémon once the source is behind in Prizes, but with a **single** candidate Active and no Bench, that alternate gust has no legal target. When the candidate already has a Bench, forcing the protected Active to Bench by a successful Counter Catcher can disable its Active-only protection; that does **not** itself win the game from a single knockout because the other Pokémon remains in play.

Both defenses are **Abilities**, so they are not absolute. Other printed attackers and non-damage Knock Out effects could bypass Mimikyu; the exact source 60 and game state must be checked. A source-first rank26 also has 4 Trainers' Mail, 3 Order Pad, 4 Quick Ball, Basic draw Abilities, and other connectors, so Cologne can be accessible beyond direct hand presence.

## Exact constrained source-first Cologne opportunity

The [BigInt combination enumerator](../../scripts/agent3-rank26-cologne-pre-donk-access.cjs), [three pure tests](../../tests/agent3-rank26-cologne-pre-donk-access.test.cjs) and **independent Python Fraction/binomial enumeration** agree. Condition source's initial seven on having one of its **12 Basics**, draw one ordinary source first-turn card and set six uniformly random Prizes. Count a **single Cologne** in the initial eight, and if not held a surviving copy in deck found by initial-hand **four Trainers' Mail** and **three Order Pad**:

- Each initially held Trainers' Mail is allowed to inspect a new, independently shuffled top four of the remaining 46-card deck for Cologne, if Cologne survived Prizes.
- Each initially held Order Pad is allowed to flip one independent fair coin; on heads it searches for Cologne if still in the deck. If a source needs to spend Pad elsewhere, actual access to other pieces may be worse.
- There are **no Mail→Pad chains**, other search/draw, mulligan bonus from the candidate, ability-engine draws, or opponent reactions. As a result this is a restricted owner-card *search opportunity*, **not an upper bound on actual Cologne access with all source cards and optimal sequencing**.

| Source-first searchable channels | Cologne in source's first turn, conditioned Basic-valid first seven |
| --- | ---: |
| Direct first seven plus ordinary draw | **12.659263%** |
| Direct + initially held 4 Trainers' Mail probes | **16.072040%** |
| Direct + held 4 Mail and 3 Order Pad probes | **29.627342%** |

The source p(valid opening seven)=80.935331%. The 29.627342% includes actual **six-Prize loss** of the singleton, no assumed free redraw, independent Pad coin flips, and exact joint hypergeometric correlation among all initially seen resources. It is an opportunity to **reach** the sole Cologne; it does not establish that the Meloetta donor/self-KO, Lightning acceleration, TM attachment and Active promotion win line can also be paid. Connector domination and occupied Bench slots may make spending Order Pad on Cologne counterproductive in states that lack another necessary piece.

## Why rank26's combo still needs a real native witness

The exact source's **Tapu Koko ◇ TEU51** Dance of the Ancients attaches a Lightning Energy from discard to **each of two chosen Benched Pokémon**. It cannot simply attach both Lightning to the same Meloetta. To use Crisis Punch on the first player's first turn, Meloetta must be sufficiently energized and Active after the source's placements/switches, while Meloetta's Debut Performance is live. A plausible candidate line uses one Lightning accelerated to **Benched Meloetta** and a manually attached **Double Colorless Energy**, then promotes Meloetta via Float Stone retreat or Escape Rope. Other legal arrangements might exist. The user must not treat the first-turn donk as automatic.

The original source's **Risky Ruins** places two damage counters on newly Benched Basic non-Darkness Pokémon; **Damage Pump** can move up to two counters from one own Pokémon onto others; Exeggcute's **Propagation** may recover a discarded copy. These could let the source repeatedly self-KO Exeggcute to give the candidate Prize cards, enabling the Crisis Punch condition that the opponent has exactly one Prize remaining. But simultaneously satisfying the *five self-KO*, Energy, Tool, Bench, source Active, draw and switch requirements under the first-turn clock is untested.

**Native gate:** Stage two real source-first rank26 original hands against candidate lone Active Mimikyu and lone Active Iron Thorns. Confirm the genuine source can/cannot announce Meloetta's attack under each Ability, the accepted and resource-paid Cologne effect, and actual Crisis Punch's damage or prevention. Test physically available Order Pad/Trainers' Mail versus alternative resource searches, and source candidate no-Bench vs Benched Counter Catcher fallback. If native cards unsupported, preserve the first physical divergent root rather than promoting simulated outcomes.

**Strategic verdict:** the source's conditional first-turn KO can be sharply constrained by certain **starting Basic identities**, but the fixed Jellicent stage-one line cannot simultaneously assume it started Active Frillish. Any best-deck evaluation must optimize this cross-matchup starter selection as a policy and include opponent-owned Item search/payments. No fully playable optimal 60 or 99.5% rate follows. Benchmark remains **29/32 authenticated original Aichi sixties**, **zero competitively qualified games**.
