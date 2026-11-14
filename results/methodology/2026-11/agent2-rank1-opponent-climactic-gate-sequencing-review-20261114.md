# Agent2 — rank1 opponent policy Climactic Gate sequencing review

**14 November 2026 · static source review · no policy change or game fixture**

## Scope

Reviewed the current rank1 opponent policy and its deterministic test suite:

- `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs`, blob `23f5b174e962f017f4b100e74d13456013d85bd8` (848 lines).
- `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`, blob `9025e836e58e4d4c0adeb632b0e5317f74ce5dd1` (55 tests).

This is a source-level sequencing observation. It does not establish that a particular native game reached these simultaneous actions or that a different sequence wins more games.

## More fundamental reachability gap: the policy cannot play Shadow Rider V

The rank1 source list contains **three Shadow Rider Calyrex V** and four VMAX. In `scoreAction`'s entire `play-card` branch (lines 278–369), the only Shadow Rider action is evolving a VMAX onto a visible V (lines 281–282). There is no positive branch for playing a Basic Shadow Rider V from hand. Meanwhile, `cardSearchScore` explicitly searches for Shadow Rider V when fewer than two are known (lines 546–549 and 568), but the root policy has no subsequent play decision for the searched card. `bestAction` returns pass when the best action score is not positive.

The opening-hand consequence can be quantified without a simulator. The rank1 60 contains 3 Shadow Rider V and 14 Basic Pokémon total. For a 7-card hand drawn uniformly without replacement:

- P(at least one Shadow Rider V) = 1 − C(57,7)/C(60,7) = **31.54%**.
- P(at least one Basic) = 1 − C(46,7)/C(60,7) = **86.14%**.
- Conditional on a keepable 7-card hand containing at least one Basic, P(at least one Shadow Rider V) = **36.62%**. Thus **63.38% of keepable opening hands lack a Shadow Rider V**.

This is not a win-rate estimate. It shows why a missing Basic-play branch is a high-impact setup blocker: in nearly two-thirds of keepable opening hands, the policy must either find a later way to bench a V or fail to establish the deck's main V/VMAX line. Its current search scoring can find a V, but its root policy has no positive play action for it.

The same source-level pattern applies to several other rank1 Basics that have attack/retreat/search support but no positive play branch: Latias ex, Trevenant & Dusknoir-GX, Girafarig and Radiant Eternatus. Tapu Lele-GX, Lillie's Clefairy ex, Mimikyu and Marshadow do have explicit positive play branches. The current test suite covers searching for Shadow Rider V but contains no root-action test that actually plays it.

This is a more basic policy-competence blocker than the Gate ordering issue: the policy cannot reliably build its primary attacker board from hand. Post-gate acceptance should start with a root fixture that has a legal Shadow Rider V play action and requires the policy to bench it, followed by a second-V board-building case and a VMAX evolution case. Add separate matchup-conditioned play tests for Latias, Girafarig, Trevenant and Radiant Eternatus only where the declared policy intends to use them.

## Additional core-action gap: no manual Psychic Energy attachment

The rank1 source list contains **11 Psychic Energy**. The root scorer's full play-card branch (lines 278–369) has no positive branch for Basic Psychic Energy and no separate manual-attachment action branch. In this repository's action contract, manual Energy attachment is projected as a play-card action with actorPrinting=Psychic Energy and an actor-owned active/bench target; the candidate module's scoreEnergyPlay function (lines 761–777) is an explicit example of that same action shape. The rank1 policy therefore cannot perform its once-per-turn manual Energy attachment from hand. This is separate from its Underworld Door Ability score and from Energy-payment prompts.

A cross-check against Agent10's rank2 policy confirms the root action shape: its scoreAction play-card branch explicitly handles Jet Energy, Capture Energy, Counter Gain and Memory Energy (simulation/evaluation/2026-11/agent10-rank2-vileplume-control-opponent-policy.cjs lines 512–531). This is not an assumption about a hypothetical attach-energy kind; the same play-card contract is already used for energy attachments elsewhere in the repository.

The 55-test rank1 suite includes an Energy-payment prompt test but no root test for attaching a Basic Psychic Energy to a chosen Pokémon. This compounds the missing Shadow Rider V play branch: even when the policy starts with a V or has a VMAX available, it cannot use the normal manual attachment to develop its board. Add a root fixture with Psychic Energy in hand and legal active/bench targets; require the policy to attach to the target that advances the declared attack plan, with negative cases for protected resources or an already-used attachment.

## Finding: Climactic Gate is scored above several useful pre-Gate actions

The policy uses a single global maximum-score selector:

- `scoreAction` gives Climactic Gate **145** whenever a Shadow Rider V is on board (lines 265–275).
- It gives Star Alchemy **132** whenever the VSTAR Power is unused, Wonder Tag **122** while the Supporter quota is unused, Teammates **138** after a prior-turn KO, Unfair Stamp **142** under its current conditions, and Field Blower **140** against an active Path lock (lines 265–305).
- `bestAction` selects the highest score across all action classes and returns it immediately (lines 399–418).

Climactic Gate ends the turn. Therefore, when Gate and any useful lower-scored action are simultaneously available, the global maximum selector commits to Gate and permanently loses the opportunity to use those other actions that turn. The current tests cover that Gate is selected when a Shadow Rider V is in play and that it selects VMAX cards, but do not test the action frontier where Gate competes with Star Alchemy, Wonder Tag, Teammates, Unfair Stamp or Field Blower.

The deck's own sequencing specification says to perform useful Supporters, Items, attachments and Underworld Door activations before Radiant Eternatus's turn-ending Climactic Gate (`results/aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md`, lines 107–115). The current rank1 policy already correctly gives Underworld Door 150 and Shadow Rider VMAX evolution 148, both above Gate; the issue is the other useful actions scored below 145.

## Additional reachability gap: Radiant Eternatus is searched for but never played

The rank1 source list contains one Radiant Eternatus CRZ 105 and one Trevenant & Dusknoir-GX SMP SM217. The policy's `cardSearchScore` assigns Radiant Eternatus score 118 when fewer than two VMAX are known and Trevenant score 110 when Psychic board Energy is low (lines 570–577), but `scoreAction` has no positive `play-card` branch for either printing in its Basic/Trainer action section (lines 278–369). An unrecognized play-card returns 0; `bestAction` falls back to pass when no positive action exists. Thus the policy can spend a search to put Radiant Eternatus or Trevenant in hand and then never bench it. This makes the Climactic Gate path unreachable from a normal deck state even though the Ability action itself has a score and prompt test.

The existing root test titled “Climactic Gate is used when a Shadow Rider V is in play even if VMAX is not in hand” (test lines 1556–1574) is not a source-valid reachability fixture: it offers a `Climactic Gate` action with `sourceZone:'bench', sourceIndex:0`, while the only Bench Pokémon at index 0 is Shadow Rider Calyrex V; no Radiant Eternatus is present. It proves only that the policy accepts an action token labelled Climactic Gate, not that the policy can play Radiant Eternatus and activate its Ability from a valid board.

Post-gate acceptance should add: (a) a positive Radiant Eternatus play decision when its Gate line is useful; (b) a source-bound Ability action whose `sourcePrinting`/zone/index resolves to an actual Radiant Eternatus; (c) a full sequence proving the policy can play it, resolve Climactic Gate, select the VMAX targets, and only then end the turn. Add a separate supported-action decision for Trevenant & Dusknoir-GX if the rank1 policy intends to use its attacks; do not search for a card that the root policy will never play.

## Suggested post-stopline test and correction

Do not expand policy work during the current Critic stopline. When Agent6 resumes the bounded rank1 policy work:

1. Add a deterministic frontier containing Climactic Gate alongside an actually useful Star Alchemy target (e.g. Field Blower against Path to the Peak), plus any available conditionally useful Supporter/Item actions.
2. Require the policy to choose the non-ending action first, then reconsider Gate on the next decision after the useful pre-Gate actions have been exhausted.
3. Add negative cases where the competing action is not useful, so the policy does not delay Gate indefinitely.
4. Encode Climactic Gate as a terminal commitment / last-use action, rather than relying on one fixed score to outrank some but not all pre-Gate actions.

No claim is made that every lower-scored action is always worth taking. The policy must condition on its target and state; the concrete issue is that the present global score comparison has no explicit terminal-action barrier.

## Disposition

This is a narrow policy-sequencing coverage gap, not a rules ruling or competitive result. No source, tests, workflow, deck, opponent field, or simulator was changed. No CI or native fixture was run.
