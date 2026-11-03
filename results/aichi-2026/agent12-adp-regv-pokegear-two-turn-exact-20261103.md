# Regidrago V starter: exact turn-one and turn-two Pokégear access

**Agent 12 | 3 November 2026 | unchanged Agent5 ADP / Thorton / Regidrago v2 printed 60, canonical SHA-256 bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b | mathematical physical resource opportunity, zero qualified games**

## Research question and comparison

The previous [Regidrago-V Active / Thorton donor conservation model](agent12-adp-regv-active-thorton-donor-conservation-20261103.md) counted first-turn **held** Thorton and a second-turn **held** Thorton or VS Seeker, excluding the deck's two printed Pokégear 3.0. Does explicitly searching the next Thorton through up to two actual top-seven Gear looks add a material number of two-turn opening configurations, without paying an impossible Ultra Ball cost?

For this registered frozen 60, a Regidrago V starting Active can be exchanged through Thorton for a previously Battle-Compressor-discarded Arceus & Dialga & Palkia-GX, after attaching Double Dragon Energy, to use enhanced Altered Creation-GX going second. The starting Regidrago itself becomes a discard donor. On the player's following turn, a second Thorton can return that Regidrago to Active and a held or Ultra Ball-searched VSTAR can evolve it, with one added Grass/Fire basic Energy and copied M Charizard-EX Wild Blaze. This is an abstract paper-card resource line, **conditional on the first GX attacker surviving** and the other required actions being legal. There is no opponent behavior, damage, attack execution, lock, clock or game-win qualification in this study.

Compare two actual deck-removal strategies: **two-target Compressor** discards ADP + M Charizard; **Goodra-target Compressor** additionally discards the deck's singleton Hisuian Goodra VSTAR Rolling Iron donor. The first conserves access to other deck pieces; the second preloads a potentially valuable defensive copied attack. A third target is optional under Battle Compressor's "up to three" text.

## Exact combinatorial results

Each percentage is measured over all **Basic-valid seven-card opening hands** of this unchanged 60, with a uniformly random first-turn ordinary eighth card, six randomly Prized physical cards and one second-turn ordinary ninth draw. The active is one of the original seven Regidrago V, no ADP appeared in those seven, and the player is going second. Prizes, deck-target survival, full first-turn DDE, Compressor and Thorton costs, second-turn Supporter access, VSTAR and Basic Energy resources, Gear top-seven look probabilities, and physical Ultra Ball discard-card counts are included.

| Physical route | Compressor ADP + M Charizard | Compressor ADP + M Charizard + Goodra |
| --- | ---: | ---: |
| T1 enhanced GX, direct held Thorton | **1.8654882565%** | **1.5085802579%** |
| Additional T1 GX through first/second Pokégear | +0.3393876886 percentage points | +0.2773023951 percentage points |
| **T1 enhanced GX, all modeled access** | **2.2048759452%** | **1.7858826531%** |
| T1 GX → T2 Apex physical resources, direct Thorton/VS both turns | **0.0993835905%** | **0.0849168489%** |
| Additional T2 route via Gear after **direct T1** Thorton | +0.0236791491 percentage points | +0.0205265056 percentage points |
| Additional T2 route after **T1 Gear** Thorton | +0.0135441960 percentage points | +0.0117508948 percentage points |
| **T1 GX → T2 Apex physical resources, all modeled access** | **0.1366069356%** | **0.1171942494%** |

The two-target strict two-turn opportunity rises by **+0.0372233451 percentage points** compared with the earlier direct/direct study, or approximately **37.45% relative** (a very low absolute chance remains). The Goodra-third-target route gains **+0.0322774004 pp** over its narrow baseline. The additional second-turn Gear look after a direct first Thorton accounts for substantially more new eligible configurations than adding first-turn Gear alone. This is a search-line diagnosis, not evidence that either deck plan is competitively strong.

## Exact enumeration, payments and reproducibility

The source [exact integer/rational enumerator](../../scripts/agent12_adp_regv_starter_t1_t2_gear_exact.py) imports the already-tested manifest SHA-verifying count loader, partitions the roster into 14 physical categories, enumerates every bounded first-seven/eighth group composition with hypergeometric multiplicities, then six-card Prize configurations and the ninth card's actual deck removal. It removes ADP/M Charizard/optional Goodra before each Gear look and, where T1 Gear has found a Thorton, removes the fetched card from the subsequent deck and draw distribution. The exact code asserts integer control counts for the former direct/direct study and exact reduced rational outcomes for every new route. A successful T1 Gear requires at least one real Thorton in the post-Compressor searchable deck.

The **hand-payment veto is essential**. T1 starts with eight physical objects; the starting Regidrago, DDE, Compressor and first Thorton are expended. If the first Thorton was fetched through a first successful Gear, there are five hand objects at T2 including the natural draw. If a failed first Gear is followed by a successful second Gear, there are only four. This latter path can directly produce an already held VSTAR + Energy + second Thorton/VS but **cannot** afford a T2 Ultra Ball which must discard two other physical cards after Energy and Supporter are used. Likewise, when a directly held first Thorton leaves no second direct Thorton/VS, a second failed T2 Gear attempt is permitted only if VSTAR is held; T2 Ultra has insufficient discard cards after two Gear uses. The exact calculator enumerates these disjoint routes rather than interpreting the existence of connector cards as free access. The Ultra model still permits discarding any two leftover physical cards; it does not assign state-dependent UDP/DCI or late-game preservation value.

**Independent stochastic check:** [physical literal-60 driver](../../scripts/agent12_adp_regv_starter_t1_t2_gear_physical.py), seed 12051212, 750,000 fresh shuffled 60-card deals, **450,585 Basic-valid opening seven-card hands**. It simulates actual deck search removals, Gear top-seven inspections and reshuffling, ordinary draws, spent Supporters, attached Energy and Ultra Ball's two-card discard payment. Six registered benchmark cells:

| Target, route | Exact expected T2 % | Observed T2 successes / 450,585 | Observed T2 % |
| --- | ---: | ---: | ---: |
| Two targets, direct/direct | 0.09938359 | 452 | 0.10031404 |
| Two targets, direct/T2 Gear | 0.12306274 | 533 | 0.11829067 |
| Two targets, either-turn Gear | 0.13660694 | 628 | 0.13937437 |
| Goodra third, direct/direct | 0.08491685 | 394 | 0.08744188 |
| Goodra third, direct/T2 Gear | 0.10544335 | 495 | 0.10985719 |
| Goodra third, either-turn Gear | 0.11719425 | 544 | 0.12073194 |

All six independent observations were inside their preregistered five-binomial-standard-error envelopes. The physically shuffled samples should **not** be interpreted as game trials. The random number stream was not preregistered before investigation; the exact formulas carry the stronger evidence.

The existing **manual/opt-in** workflow .github/workflows/aichi-card-audit.yml runs both new scripts alongside the earlier exact direct model, prior three-million-shuffle controls, earlier T1-Gear model and original-29 Goodra/HP screen, with no automatic per-commit CI. [Run 41591620877](https://github.com/FlareZ123/experiment-01/actions/runs/41591620877) **SUCCESS** for the exact extension; [run 41591942824](https://github.com/FlareZ123/experiment-01/actions/runs/41591942824) **SUCCESS** at Git head ff2cbff9ea59df7494c9099b27d3b78b091e06d7 for the same exact checks and all six independent physical cells. Engine not compiled in these jobs; the older staged [native Thorton paper-correct hook](agent12-thorton-native-custody-paper-reversible-hook-20261103.md) has its distinct compiled-native CI.

## Strategic interpretation and required next gate

Pokégear creates a modest but demonstrable additional paper-resource path for the RegV-start setup. Across this extraordinarily narrow sequence, all modeled Pokégear outs leave the first-two-turn physical-success rate **well under 0.2%** of Basic-valid openings. The original larger setup model excludes Quick Ball, Tag Call, Viridian Forest, Crobat/Tapu Lele abilities, additional draw effects, switching and opponent interaction; it is a strict defined lower-level line, not an estimate of the final deck's probability of attacking or winning.

The next decision-changing evidence would be a *naturally shuffled full original opposing 60* with a **selected** actor policy paying Compressor → Thorton swap → DDE → GX, an actually meaningful opposing turn, then a real second Thorton / VSTAR evolution / Apex attack, with the scoped paper-preserving Thorton hook. Preserve raw native controls and both seats because the unmodified Twinleaf Thorton loses Energy and can illegally allow same-turn VSTAR evolution.

**Project status remains unchanged:** 29/32 authentic original opponent sixties (23, 25, 28 missing), zero competitively qualified complete games, no chosen best fixed sixty and no credible demonstrated 99.5% field win rate. This is an optimization-method and resource-reachability result only.
