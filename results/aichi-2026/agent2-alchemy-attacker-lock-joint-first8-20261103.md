# Agent 2: Regidrago V continuity changes the Muk/Budew early-lock slot decision

**3 November 2026 | exact opening-seven / first-draw / six-Prize combinatorics | no game claims.** Follow-up to [the exact two-axis resource census](agent2-alchemy-two-axis-joint-opportunities-20261103.md). This report compares the two already registered *fixed 60s*, with all counts and card printing identities unchanged except 3 Boost Shake/3 Quick Ball in [Apex Alchemy v0](agent43-apex-alchemy-paper-expanded-v0.json) versus 4 Shake/2 Quick in [Apex Alchemy v1](agent2-apex-alchemy-shake4-quick2-v1.json). Neither deck is selected as the field best.

## New decision-changing opening screen

The original two-axis proxy counted early **Alolan Muk via Boost Shake** and **Budew Item-lock attack access** separately. But the deck's principal attacker is **Regidrago V**, which must itself reach the board and cannot always use the same Trainer card needed to search for the lock. The new screen therefore requires **Regidrago V access in the *same first-eight resource configuration***, with distinct search Items whenever both Pokémon need searching.

| Conditional early resource opportunity | v0: 3 Shake / 3 Quick | v1: 4 Shake / 2 Quick | v1 minus v0 |
| --- | ---: | ---: | ---: |
| Regidrago V in first eight, or searchable after Prizes | 83.92029120% | 81.07510153% | **-2.84518967 pp** |
| Muk/Shake route with Regidrago V accessible and distinct search connector(s) | 14.52693232% | 16.66686778% | **+2.13993545 pp** |
| Budew route with Regidrago V accessible and distinct search connector(s) | 32.03296343% | 25.38615783% | **-6.64680561 pp** |
| **Either lock route together with Regidrago V** | **39.61163033%** | **35.51466202%** | **-4.09696832 pp** |
| Both alternatives individually compatible with Regidrago V | 6.94826542% | 6.53836358% | -0.40990184 pp |
| Either lock + Regidrago individually available but blocked by sharing insufficient search Items | 7.74359066% | 7.15361529% | -0.58997537 pp |

These probabilities are conditional on a Basic in the **actual initial seven**, exactly **80.93533073%** for either fixed 60. A “both alternatives” entry means the player could choose *either* lock with Regidrago, under separate mutually exclusive lines, without claiming that both locks can be activated in one turn.

### Turn-order interpretation

Budew's **Itchy Pollen** is an attack, so the player going first cannot use it on their first turn under the ordinary first-turn attack rule. **Boost Shake** is playable to evolve on that first turn and ends the turn. With those mechanics in view, a deliberately coarse, equal-weight opportunity screen is:

| First-turn access criterion | v0 | v1 | v1 minus v0 |
| --- | ---: | ---: | ---: |
| Going **first**: Muk/Shake and Regidrago V continuity | 14.52693232% | 16.66686778% | **+2.13993545 pp** |
| Going **second**: either lock route and Regidrago V continuity | 39.61163033% | 35.51466202% | **-4.09696832 pp** |
| Illustrative 50:50 first/second mixture | 27.06928133% | 26.09076490% | **-0.97851643 pp** |

The purely arithmetic break-even first-seat fraction is **65.68913786%**, *if and only if* a Muk opportunity going first and an either-lock opportunity going second are assigned the same unit of value and the samples are weighted in this artificial way. Actual seat selection, lock payoff, attack-funding timeline and opponent matchup invalidate using this as a win-rate estimator. Do not infer an optimal choice of going first from it.

## Exact method and reproduction

The exact card categories are **2 Grimer, 2 Muk, 3/4 Shake, 4 Mysterious Treasure, 3/2 Quick Ball, 1 Budew, 4 Regidrago V, 5 other Basic Pokémon and 36 other cards**. The independent first-eight category enumeration identifies which card was the eighth draw, enforcing at least one actual initial-seven Basic and the stricter non-Grimer initial starter for the specified *Benched Muk* geometry. Six unseen Prize cards are enumerated jointly across Grimer, Muk, Budew and Regidrago, using exact integer multivariate-hypergeometric weights. Every case has denominator `8*C(60,8)*C(52,6)=416717869162795200` before conditioning; the Basic-valid numerator is `337271985613442880`.

- **Muk + Regidrago:** Shake held, Muk available in deck after Prizes, a non-Grimer starter actually in opening seven, and Grimer and Regidrago V held or each searchable. If **both Grimer and Regidrago are absent** from the first eight, two distinct held Mysterious Treasure/Quick Ball connectors are required.
- **Budew + Regidrago:** Budew held or individually searchable with Quick Ball; Regidrago V held or individually searchable with Treasure/Quick Ball; if **both are absent**, require a Quick Ball for Budew and another Quick Ball/Treasure for Regidrago.
- **Connector collision:** independently reachable targets are omitted from the joint success count if they require one same held connector. The reported 7.74% / 7.15% are collisions where *at least one* hypothetical lock and Regidrago are individually available but neither lock route can retain Regidrago without competing for a single insufficient search connector.
- **Code:** [exact BigInt enumeration](../../simulation/evaluation/agent2-alchemy-attacker-lock-joint-first8.cjs), [static regression and partition checks](../../tests/agent2-alchemy-attacker-lock-joint-first8.test.cjs). An independently written Python `math.comb` implementation exactly reproduced all outcome rates; locally executed Node tests passed.

## Strict limitations and next falsification

This is an exact **incidence census under an idealized, geometry-specific definition**, rather than a universal upper bound on all legal Muk setups. It excludes starting an Active Grimer and evolving it with Shake if no non-Grimer Basic began in the first seven. Search Item **discard payments** are omitted. It assumes search connectors, targets and board slots are available for the modeled purpose, and it does not verify Energy acceleration, Regidrago VSTAR access/evolution, promotion, attack costs, turn order beyond the named first-turn exception, opponent's decision policy, lock counterplay or an official timed paper match.

Its defensible conclusion is **narrow**: the 4 Shake / 2 Quick swap increases the Muk+Regidrago opening-access channel but reduces the broader option to establish *either* lock with an attacker. It does not establish that v0 wins more games. A meaningful next experiment would preregister both unchanged 60s on original Aichi physical opponent deals with payment-aware choices for Muk, Budew and Regidrago, then measure naturally selected attacks, legal lock enforcement and competent opponent replies. The research program still has **29/32 authenticated Aichi originals (ranks 23/25/28 missing), zero paper-competitively qualified games, no selected best fixed 60, and no demonstrated 99.5% field win rate**.
