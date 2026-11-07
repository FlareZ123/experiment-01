# Agent 2: deterministic owner-deck survival budgets explain Filch self-deckout

**7 November 2026 | Public-count mathematical diagnostic, no policy promotion.** This extends the owner-deck-conservation causal observation from [Agent2's rank3/rank1 original A/B/A](agent2-original-rank1-conservative-filch-response-aba-20261104.md) and [Agent1's source-independent v15 A/B/A](agent1-v15-owner-conservative-filch-native-aba-20261106.md). It supplies a transparent, reusable cost term for future acting-owner decisions. The output is a **conditional future-turn budget** under an explicitly stationary hypothetical, not a playing policy or win-rate estimate.

## Scenario and exact formula

At an already-started own turn, suppose the owner has **D** cards remaining in their publicly countable deck, after their turn's mandatory draw. Each current and future own turn they voluntarily draw up to **f** extra cards (Filch has f = 2), and during each subsequent opposing turn the opponent mills up to **m** cards, with this quantity fixed. Every following own turn requires the ordinary mandatory one-card draw. Assume no additional draws, recovery, Prize-related deck effects, game-ending KOs, shuffling, forced effects, special card rules or strategic changes.

The number of **future own turns that can begin**, before the mandatory draw from an empty deck causes a loss, is exactly:

\[
H(D,f,m)=\left\lfloor\frac{D}{1+f+m}\right\rfloor.
\]

**Derivation:** For the j-th future own turn to begin, the remaining deck must survive j opposing mill steps, j−1 intervening compulsory draws, and j voluntarily chosen extra draws (including the current turn). Before the j-th compulsory draw, the remaining count must be at least one. Thus \(D\ge j(m+1+f)\), and maximizing integer j gives the formula. The recurrence uses actual \(\min(f,\mathrm{deck})\) draws and is still correct when a final draw is partial.

The **one-time** optional draw cost, with all later own turns passing, is a different quantity:

\[
H_{\mathrm{once}}(D,f,m)=
\left\lfloor\frac{\max(0,D-f)}{1+m}\right\rfloor.
\]

This distinction matters: the danger of a repeated low-value draw action can be far larger than the immediate next-turn risk of drawing once.

## Concrete scenarios

| Own deck D | Hypothetical opponent mill m/turn | Always Pass, future starts | Filch now, then Pass | Repeat Filch each turn |
| ---: | ---: | ---: | ---: | ---: |
| 23 | 0 | **23** | 21 | **7** |
| 22 | 0 | **22** | 20 | **7** |
| 24 | 2 | **8** | 7 | **4** |
| 23 | 2 | **7** | 7 | **4** |
| 4 | 2 | **1** | 0 | **0** |
| 3 | 2 | **1** | 0 | **0** |

D = 23 and 22 are the acting Champion player's publicly counted deck sizes at the two **first actual Filch-to-Pass root divergences** in Agent1's registered rank11 original v15 experiment. The m = 0 rows deliberately assume no further opposing milling as a pure self-deckout scenario. They **do not certify** that the original remaining game had exactly zero opposing deck movement or no other recovery. Under these assumptions, repeated Filch consumes sixteen or fifteen prospective future own turns, respectively, compared with preserving deck cards. It helps explain why the v15 fixed-24 threshold caused a large outcome change.

The m = 2 rows are explicitly **hypothetical**, motivated by a possible double-Burrow Bunnelby PRC turn, whose use is conditional on actual source choices and game state. At D = 23, a *single* Filch followed by Pass costs zero whole additional future starts in this simplified scenario, whereas repeatedly choosing Filch costs three. Thus a single-step immediate-survival check can miss the larger cumulative policy problem. At D = 3 or 4 under that m = 2 scenario, a Filch immediately removes the ability to begin the next own turn, while Pass preserves one.

## Reproducibility

- Pure [owner-deck attrition horizon model](../../simulation/evaluation/agent2-owner-deck-attrition-horizon.cjs), with no access to deck card identities, the opponent's concealed zones or native State.
- [Exact exhaustive recurrence regression](../../tests/agent2-owner-deck-attrition-horizon.test.cjs) checks all **61 owner-deck counts × 9 voluntary draw amounts × 9 opposing mill amounts** and both 23/22 observed root counts. Independent Python calculation likewise verified all 4,941 literal recurrences.
- Existing manual-only CI: [GitHub Actions 42348856040](https://github.com/FlareZ123/experiment-01/actions/runs/42348856040) **SUCCESS**. This CI verifies the mathematical object only. No new native games, decklist changes, default policy options, vendor hooks or new always-on workflow.

## Design implication and boundaries

An actor-only policy can read the same safe \`ownPublic.deckCount\` already present in the detached actor observation. A transparent future policy might compare the budget of a proposed voluntary draw with the number of turns required to find and execute an actual winning attack, assess opponent public stall/mill pressure, consider whether drawing supplies a necessary escape card, and retain a separate paper-clock constraint. This extra evaluation is essential: conserving one's deck forever while failing to take Prizes can also lose to an opponent's pressure or time.

The fixed 24-card threshold from the previous experiments is a **developmental stress-test parameter**. It has no general winning optimality proof. The present \(H\) metric is exact only under the stated stationary deterministic scenario. An unknown or changing opponent mill pace is a scenario input, and it is not a guarantee that the opponent will choose Burrow or any other line. Crucially, an owner cannot use cards they draw with an attack until after their turn ends; the tactical value of those cards in later turns still requires explicit modeling.

**Competitive status unchanged:** zero paper-qualified games, no chosen single fixed 60-card deck, and Aichi opponent authentication still 29/32. This report offers a component for testing owner-deck decisions with credible opposing response; it does not qualify existing native wins.
