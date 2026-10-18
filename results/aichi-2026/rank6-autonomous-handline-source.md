# Agent 32: authentic rank-6 hand-policy attack and response

**18 October 2026.** Compiled positive-control source-dealt decision and real attack. **Not a qualified competitive game or win-rate estimate.**

## Question and source control

Can a versioned, hand-visible, seed-independent Iron Thorns policy autonomously execute the previously scripted `Guzma & Hala → Double Colorless Energy → Thunder Mountain → Volt Cyclone` line in the original fixed rank-1 Shadow Rider versus rank-6 Iron Thorns source deal?

- Frozen published source 60s: [Aichi lists](full-decklists.json), ranks 1 and 6; no substitutions beyond the explicit existing Japanese-promo/Basic-Energy import mapping.
- Engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`.
- Research policy: [source-hand selector](../../simulation/twinleaf/rank6-autonomous-thorns-line.cjs), [pure regression](../../tests/rank6-autonomous-thorns-line.test.cjs), [actual-source paired runner](../../simulation/twinleaf/rank6-autonomous-thorns-source.cjs).
- Manual-only [CI 39103205979](https://github.com/FlareZ123/experiment-01/actions/runs/39103205979) passed at research head `f75c0ca03bd36cc3fa84a6dd4c8567dabe6aa5df`; artifact **12126819714**, ZIP SHA-256 `fc54e745662a59fb3ee7c5880bc123db5052bead0fa31dc9095edda0defcc53e`, named `rank6-autonomous-thorns-source`.
- Matching physical positive-control seed **20367160**. Four predetermined follow-up seeds: 20367161–20367164. As adjacent xorshift-derived seed settings, the five games do **not** constitute independent random statistical observations. The positive-control seed was previously known to contain the line.
- Existing engine flags remained fixed: strict prompts, first-turn Seal correction, DDE and Supporter policy corrections, independent speculative RNG, named Ability-entry corrections and real decision trace.

## What the policy actually observes and does

The only activation gate is source opponent seat B's genuine first turn, Active Iron Thorns ex and **own visible hand** containing Thunder Mountain, Guzma & Hala, no DCE and two cards in the conservative discard whitelist. This whitelist orders Tropical Beach, Trainers' Mail, Palace Belt, Camping Gear. The policy pays two distinct physical cards, preserves other Supporters and intended attack access, and declines entirely when the payment is unsupported.

After choosing the legal Guzma & Hala discard/search mode, it inspects the own deck **only during the actual prompted search**, selects a single DCE, acknowledges the engine prompt, plays held Thunder Mountain, attaches searched DCE and announces Volt Cyclone. DCE unavailable due to Prizes/deck state causes an explicit abort. It never uses hidden Prize identities or seeds to choose actions, and the research adapter restores the original bot method when the match ends. The live Store decides whether proposed actions work.

The stage machine is deliberately narrow: it has no Tag Call search, competing Supporter analysis, alternative Energy route or later-turn replanning. It is an **autonomous action diagnostic** with a rudimentary resource heuristic, not a strong full-game Iron Thorns bot.

## Compiled empirical result

The positive-control intervention **passed** the full manual CI. The genuine Store accepted this chronology on turn 2:

1. Play held Guzma & Hala; select discard/search mode.
2. Discard actual Tropical Beach and Trainers' Mail cards.
3. Search the actual own deck for exactly one Double Colorless Energy, validated by the real prompted selector.
4. Play the held Thunder Mountain Prism Star and attach searched DCE.
5. Announce **Volt Cyclone**, dealing **140** to the actual defending Shadow Rider Calyrex V.

The trial selected **all** planned actions without an abort. Control and treatment retained the same source-dealt seven-card decision hand, all six physical Prizes, DCE location and source-inventory hashes. Both correctly recorded physical slot A as first player.

| Condition | Unmodified generic policy | Autonomous Iron Thorns policy |
| --- | ---: | ---: |
| Real Iron Thorns attack count at action cap | 1 | 4 |
| Real Shadow Rider attack count at cap | 0 | 0 |
| Actions recorded | 125 | 125 |
| Game complete | No | No |
| Third global-turn champion response observed | Yes | Yes |

On the intervention branch, the real champion bot responded on global turn 3 by evolving Shadow Rider Calyrex VMAX, attaching Psychic Energy, playing Acerola, Benching another Shadow Rider V and passing. In the unmodified control it evolved, attached and passed. Thus one consequential opponent action differed, but its strategic quality is unverified.

**All four additional predetermined seeds missed the narrow activation gate.** Their trials each stopped at 95 actions and are retained as non-exposures, not successes or failures in a win-rate denominator. No additional candidate outcomes were classified as competitive games.

## How rare is this hand-only condition?

With rank-6's exact relevant source counts (4 only-Basic Iron Thorns, 1 Thunder Mountain, 2 Guzma & Hala, 1 DCE, 7 whitelist cards and 45 others), a uniform opening seven conditioned to contain a Basic, six random Prizes, and one ordinary first-turn draw gives:

- Probability of the **visible-hand trigger**: exactly `17537/6637455 ≈ 0.2642127141%`.
- Probability of the hand trigger **and DCE outside all six Prizes and the drawn hand**: exactly `1349/577170 ≈ 0.2337266317%`.

Derivation enumerates the joint eight-card hypergeometric categories; a single Basic in those eight gets weight 7/8 because it must occur in the original seven. The unprized-DCE multiplier under the no-DCE-in-eight event is 46/52. Conditioning uses `1 − C(56,7)/C(60,7)`. Independent 400,000-draw Monte Carlo, 159,504 legal seven-card hands, found 370 successful opportunity cases, or about **0.2319691%**, consistent with the exact fraction. No opponent mulligan bonus is modeled.

This estimate describes a **highly restricted resource event**, and assumes actions can be sequenced as printed without opponent interference. A more powerful policy needs Tag Call, fetched Thunder Mountain, direct held DCE, other search, carefully valued discards and tactical turn-order choices. These opportunities are absent here, so the estimate is **not an attack-rate upper bound**. It also demonstrates that success on the archived positive-control seed is not representative of most openings.

## Qualification decision and next test

**Promote the local result only to:** source-dealt, selected real actions; resolved real 140-damage attack; observed actual following turn. **Do not promote it to:** qualified human-level opponent, complete-game engine win, measured field strength, or attainment of the 99.5% target.

Next useful test: widen the autonomous opening policy to reachable `Tag Call → Guzma & Hala` and in-hand direct DCE variants with actual discard/payment budgets, then evaluate fresh preselected physical seeds, both true starting orders, and an independently competent challenger reply. The four held-out non-exposures are part of the current evidence and must remain visible.
