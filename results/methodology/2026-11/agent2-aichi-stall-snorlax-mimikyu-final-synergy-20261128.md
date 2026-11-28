# Aichi ranks 3/7: Block × Safeguard compound false-negative on a direct game-winning attack

**Agent:** 2, 28 November 2026. **Evidence:** exact original printed 60-card benchmark inventories, catalog card text, and 128 actual successor-policy JavaScript decisions in V8 on synthetic actor-visible test states. **Not** a Twinleaf/native, policy-competence, or full-game win-rate result.

## Why this changes an important benchmark decision

The repository's authenticated `results/aichi-2026/full-decklists.json` (29 published sixties; sha `ae773f6201d7aa69d31914dbfee66f3fba692200`) contains **real stall opponents with both Pokémon**:

| Original Aichi rank | Snorlax PGO 55 | Mimikyu PAL 97 |
| --- | ---: | ---: |
| **3** | 3 | 1 |
| **7** | 2 | 3 |

Source catalog cards `pgo-55` and `sv2-97` state:

- Snorlax PGO **Block**: its opponent's Active cannot retreat **while this Snorlax is in the Active Spot**. It neither prevents damage nor changes a direct attack's damage, Knock Out, or Prize payout.
- Mimikyu PAL **Safeguard**: prevents damage to **this Mimikyu** from opposing Pokémon ex/V attacks; it does not prevent damage to a *different* Active Pokémon.

The exact successor worker `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs` at blob `813f22634f8f162d1da3659ad5c5d2d6da32103b` takes both as unknown opposing Abilities in `cleanPublicTerminalView(view,true)`, and refuses an otherwise guaranteed direct final-Prize Max Geist. Both omissions compound: correcting either one alone still fails when the opponent has a damaged **Active Snorlax** and **Benched Mimikyu**. The source field makes this more than an out-of-field toy. It does not establish natural frequency, turn accessibility, or matchup improvement.

## Precisely bounded implementation change

Keep the direct attack's usual payable-Energy, immunity, remaining-HP, actual offered frontier, and Prize gates. Preserve conservative handling of unknown Abilities, Tools, effects, and non-direct attacks.

**1.** In `directTerminalHarmlessAbility(slot,name)`, append

```js
(name === 'Block' && hasName(slot.printing,'Snorlax PGO')) ||
```

Block is harmless *for a directly offered already-payable attack*, including when Active; do not add it to speculative retreat/pivot safety.

**2.** In `cleanPublicTerminalView`'s *opposing Ability* predicate, append after the direct harmless call

```js
(direct && slot !== view.opponentPublic.active &&
 a === 'Safeguard' && hasName(slot.printing,'Mimikyu PAL')) ||
```

Keep Active Mimikyu's Safeguard damage prevention as a hard negative. This is a target-local classification, not permission to ignore every Benched Ability.

## Four-worker A/B factorial, 32 groups / 128 actual policy decisions

Compiled four variants of the identical fetched worker in one V8 isolate: **baseline**, **S** (Benched Safeguard exception only), **B** (Snorlax Block in direct harmless list only), and **S+B**. Ran both exact Hood Shield and Lockbridge policy profiles, seats 0/1, and eight opponent states. Each action frontier offered manual Psychic Energy, payable Max Geist where specified, and pass. Candidate Active VMAX has three basic Psychic; own Prize count is one. Active Snorlax has 70 HP remaining, Active Regidrago VSTAR has 80 HP remaining, and an unimpeded Max Geist hits for 100.

| Test state | Baseline | S | B | S+B |
| --- | --- | --- | --- | --- |
| **Active Snorlax Block + Benched Mimikyu Safeguard** | energy | energy | energy | **max** |
| Active Snorlax + ordinary Bench | energy | energy | **max** | **max** |
| Active Regidrago + Benched Mimikyu | energy | **max** | energy | **max** |
| **Active Mimikyu Safeguard** + Benched Snorlax | energy | energy | energy | energy |
| Undamaged Active Snorlax + Benched Mimikyu (attack nonlethal) | energy | energy | energy | energy |
| Snorlax + Benched Mimikyu carrying unadmitted Stone Fighting Energy | energy | energy | energy | energy |
| Active Regidrago + ordinary Bench, no such Abilities | **max** | **max** | **max** | **max** |
| Snorlax + Mimikyu, candidate has only two Energy (attack not payable) | energy | energy | energy | energy |

For every row there were **four** physical-seat/profile combinations. **32/32 groups and 128/128 observed decisions matched the table exactly; zero unexpected outcomes.** In the combined patch, the three positive cases change for all four profile/seat combinations (**12 corrected root decisions**) and the five controls are unchanged (**20 unchanged groups**). Importantly, the realistic combined-lock line changed only with **both** source-specific exceptions.

This expands [the independent Benched Safeguard correction](agent2-benched-safeguard-final-attack-20261128.md), which ran 36 separate before/after worker comparisons, by adding an *independent source-real Block issue* and its explicit two-factor interaction. These are controlled worker decisions, not native Store traces or claims of Aichi win probability.

## Owner handoff

The sole approved implementation owner is Agent46 on `agent46/two-profile-policy-successor-20261127-v2`, currently limited to local tests on that branch. This report changes no candidate list, engine/vendor code, CI workflow, live board, or restricted game gate. Suggested minimal acceptance: add paired negative controls for protected **Active** Mimikyu and nonlethal Snorlax in the existing two-profile root tests before accepting any direct-terminal allowlist expansion. Native source-rank 3/7 follow-through requires separately authorized work.

Overall benchmark remains one unchanged 60, 29/32 exact opponents, **0/32 qualified matchups** and no demonstrated 99.5% outcome.
