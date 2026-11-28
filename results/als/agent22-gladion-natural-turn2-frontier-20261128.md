# Early Gladion rescue: physical +9.08 pp is not a turn-2-access rate

**Agent 22 — 28 November 2026.** Decision changed: keep New Moon **v3g Gladion** behind the existing v3/v8 test priorities until a *rank-15 turn-clock / search / actual opponent-response* comparison demonstrates that its extra physical rescue opportunities are usable. This is exact combinatorial resource analysis, **not** gameplay or a match-win estimate.

## Actual fixed-list roles and exact experiment

The separate [v3g fixed 60](new-moon-dusknoir-gladion-prize-rescue-v3g-60.json) exchanges one Ace Trainer for one Gladion. Agent1's [full Prize-resource census](../strategy/2026-11/agent1-newmoon-v3g-gladion-prize-recovery-20261128.md) correctly finds **+9.081806579 percentage points** of legal-start physical Duskull+Dusclops+rescuable-Dusknoir configurations. It explicitly does *not* claim those cards are in hand or executable.

I computed the much narrower **unassisted natural-draw window** by exact disjoint opening-seven / six-Prize / first-k-turn-draw enumeration. A counted event requires a legal seven with at least one of the 17 Basics, singleton Dusknoir in the six Prizes, singleton Gladion not Prized, and at least one physical Duskull and Dusclops outside Prizes. Among those cases, Gladion must be in opening seven or first k natural turn-start draws. The 60 are partitioned as Dusknoir 1, Gladion 1, Duskull Basics 2, Dusclops 2, other Basics 15, other cards 39. All allocations are weighted by exact multivariate combinations; no independent-card approximation.

| Time of natural visibility | % of all legal openings with physical rescue + Gladion observed | Share of the +9.0818 pp physical cases |
| --- | ---: | ---: |
| Starting seven, before any turn draw | **1.136869454%** | 12.518098% |
| Beginning own turn 1 (8 observed) | **1.305910670%** | 14.379415% |
| Beginning own turn 2 (9 observed) | **1.474951885%** | 16.240732% |
| Beginning own turn 3 (10 observed) | **1.643993101%** | 18.102049% |
| Beginning own turn 4 (11 observed) | **1.813034316%** | 19.963366% |

Reproduce with [exact, deterministic standard-library script](../../scripts/2026-11/agent22-gladion-early-natural-access.py): `python3 scripts/2026-11/agent22-gladion-early-natural-access.py`. It asserts exact agreement with the earlier physical-only +9.081806579 pp surface. The legal-seven conditioning is explicit; no mulligan bonus draw, ability search, Supporter search or added draw is credited. The result is **not** an upper bound on actual play access: a live tutor or card-draw engine can increase it. It is also not a lower bound on successful rescue: drawing Gladion does not ensure a legal Supporter turn, known target Prize identity, or mature Duskull line.

## Concrete rank-15 decision fork

- If **Sentinel Stoutland is Active** on the turn Gladion must be played, the Supporter is unavailable. The v3g Prize-rescue axis cannot start that turn. An already rescued Dusknoir remains potentially usable, subject to evolution, Energy and board constraints.
- If **BUS Vileplume** is Active while **AOR Vileplume** is Benched, those two locks affect Basic attacks and Items respectively, not Supporters. A properly offered Gladion could be used during an available Supporter turn, but the rescued Stage2 still needs a mature Dusclops, correct Energy funding and a paid Stage2 promotion/attack. The 90-HP Dusclops can be vulnerable when Active; Mega Lopunny's Gale Thrust is **Active-target damage**, not automatic Bench damage.
- The earliest ordinary Duskull→Dusclops→Dusknoir three-turn development is a tempo constraint unless another explicit evolution exception applies. Going-first turn-1 Supporter restrictions further distinguish turn-1 visibility from turn-1 playability. The exact starter/response window has *not* been measured against rank 15.

**Actionable research gate:** using one registered v3/v3g source-dealt comparison, record (i) when K1 proves Dusknoir Prized; (ii) whether the singleton Gladion is actually accessible **before** Sentinel; (iii) actual offered Supporter and Prize-selection prompt; (iv) whether a funded Stage2 Shadow Bind can be used before the opponent's KO or lock response; and (v) the cost of losing the second Ace Trainer. If v3g produces no rescue-to-attack conversions, reject the tempting +9 pp physical access rationale and prioritize the broader fixed-60 challenger rather than a further Gladion access proxy.

**Evidence classification:** exact mathematics over initial card placements; 0 native Store games, 0 qualified Aichi matchups, no candidate promotion and no 99.5% claim.