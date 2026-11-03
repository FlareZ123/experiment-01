# Agent 14: rank-11 first-Claw candidate response, two withheld actions, and late Squawk Bench liability (3 November 2026)

**Classification: source-backed tactical opportunity and tested pure diagnostic; no native intervention, outcome, or competitive game.** This is an independent follow-up to the [selected joint VIP release](agent22-selected-joint-vip-v2-native-evidence-20261103.md), not a new matchup trial. Exact registered original-source seed **2171744612**, authentic rank-11 Mega Absol/Garbodor source in physical seat **1**, frozen New Moon challenger on the other seat. The previous run is preserved in [CI 41581276542](https://github.com/FlareZ123/experiment-01/actions/runs/41581276542), artifact 13205777405. It is **not** reinterpreted as a qualified paper win.

## What is actually observed

The previous real Store experiment reports eight settled original-source **Terminal Period** attacks, then five **Claw of Darkness** attacks at global turns **31, 33, 35, 37, 39**, each with three physically attached Darkness Energy. After the first Claw the source had taken its first Prize: the New Moon candidate had **6** Prizes remaining versus the source's **5**. The candidate had **Counter Catcher PAR** and **Lillie's Determination M1L** in the owner-visible hand, the source had **three Benched Pokémon**, and the reply selected **Squawkabilly ex PAL** from hand followed by **Pass**. It passed again after the following three Claws. Those are the source report's real archived observations; the exact post-Claw physical board and complete Store legality are not independently reconstructed here.

The printed rule in **Counter Catcher PAR 160** permits its switch when the acting player has more Prizes remaining than the opponent. The reported **6 > 5** and three opponent Bench targets satisfy two essential requirements, **conditional on no applicable Item lock and on the native prompt targeting being legal**. The item's effect switches an opponent's Benched Pokémon into Active. A zero-attached-Energy, nonzero printed-retreat target would be a plausible tempo target, but the opponent can have switching, retreat reduction, Ability effects and other plays. **Do not mark a forced stall or win.**

The printed **Lillie's Determination M1L 119** shuffles the owner's hand into the deck, drawing **eight** when six Prize cards remain (otherwise six). The source report says this card was held after first Claw and its owner had not selected a Supporter on those reply roots. A legal play still requires verifying the actual Supporter quota, relevant player-level locks, deck state and native resolution. A large hand is not itself an exclusion from the printed effect.

The selected **Squawkabilly ex PAL 169** has **Squawk and Seize**, expressly usable only on its controller's **first turn**, and its printed ex rule yields **two Prize cards** when Knocked Out. The first-Claw reply occurs at global turn 32, well after either player's first turn. Its Bench play adds a 160-HP two-Prize liability while its named draw Ability is expired; other attack/Bench value remains a state-dependent question. This is a concrete **opportunity-cost risk**, not proof that every late Squawk Bench is dominated.

## Root-order mechanism and unchosen alternatives

The shared [Agent34 actor-only root](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) proposes an eligible held Basic **at the beginning** of the decision function whenever Bench space and play restrictions allow it. Existing opt-in low-hand Lillie pre-attack logic applies only at hand size <=3, and the after-Pass Lillie wrapper is separate. The owner-root selector currently has **no dedicated Counter Catcher action branch**. Thus the observed late Basic Bench and subsequent Pass are consistent with an ordering and missing-action-class gap, although the real selected root/prompt transaction must be inspected before assigning causality.

**Useful new pure instrument:** [owner-visible first-Claw response audit](../../simulation/evaluation/agent14-post-claw-response-opportunity.cjs) plus [five Node22 regressions](../../tests/agent14-post-claw-response-opportunity.test.cjs). Run with Node's built-in test runner; all five passed locally. Both GitHub blob SHAs were compared to the locally executed exact files:
- source Git blob **f59fe34f48b518c44219e54892f39c0424e723b6**
- test Git blob **1b32d94ab7298773a3a17130749634e72963ae56**

The audit accepts only a detached owner's hand, both public boards and public turn restrictions; ignores concealed opposing zones; checks exact held printing, relative Prizes, visible Item lock, targets, Supporter quota, deck count and late Squawk selection. It flags opponent Bench targets with no attached Energy and a positive printed Retreat Cost **only as hypotheses**. It does not select an action, mutate Store or certify native canPlay. Negative tests cover Prize equality, Item lock, no Bench, Supporter quota, Supporter lock, empty deck, first global turn, and invisible opponent hand/deck/Prize identity changes. The test state is **synthetic** and illustrates these reported conditions; it is not a falsely reconstructed real turn-32 state.

## Prospective native falsification that would change the policy

On the exact archived owner-root **T32 after first Claw**, compare *the already selected Bench/Pass route* with two separately selected, actually native actions on the **same physical state**:
1. **Counter Catcher:** Validate its true Store canPlay and any Item lock; choose a physical opponent Bench target, resolve the real prompt, prove the hand→discard and Active/Bench transition, then observe whether the source can retreat, switch, use Garbodor/tool resources or continue Claw.
2. **Lillie's Determination:** Verify native Supporter permission at that root; shuffle and draw physically, preserve every settled card/zone/Prize change and see whether an additional playable attack or defensive response results on the new hand.

For a generalizable release, register the state-derived selection rule symmetrically for **both seats** and preserve frozen joint-v1/v2 policies as controls. Do not hardcode candidate ID, rank-11 identity, known seed or concealed information into the action policy. An aggressive globally enabled new Item/Supporter rule can regress other physical deals. The best target or choice may depend on opponent Bench composition, effective retreat, item availability and whether the candidate already has a winning attack.

## Decision

The current source native terminal with five Claws remains a **candidate-response competence failure**, not evidence the rank-11 deck beats a well-played challenger. The new outcome is a reusable paper-precondition/selection audit plus a specific real T32 Store-fork acceptance gate. **Zero competitive-qualified games, 29/32 authentic source sixties, no selected best fixed 60 and no demonstrated 99.5%.**
