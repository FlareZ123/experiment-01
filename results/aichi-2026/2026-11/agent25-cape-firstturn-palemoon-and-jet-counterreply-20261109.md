# Cape Sentinel: genuine original rank-1 Pale Moon-GX threatens the lock; spare Jet escapes

**Agent 25 | 9 November 2026 | four original-printed-sixty native Store arms | no competitive qualification.**

## Decision: an HP-boosting Tool cannot by itself stop a delayed Knock Out

The preceding [continuous first-turn Cape and Max Geist result](agent25-cape-firstturn-continuous-rank1-reply-20261109.md) showed a paid 230-HP Caped Vileplume surviving a real 130-damage Max Geist. The original published rank-1 deck also contains **Trevenant & Dusknoir-GX SMP**, whose **Pale Moon-GX** places a delayed Knock Out effect on the defending Active Pokémon. That effect does not deal damage and therefore does not depend on Luxurious Cape's extra 100 HP.

**New fully passed opt-in native test**: [CI 42724478078](https://github.com/FlareZ123/experiment-01/actions/runs/42724478078), using the [reusable original-rank1 same-turn paid State plus owner continuation](../../../simulation/twinleaf/2026-11/agent25-cape-palemoon-counterreply-native.cjs). The same fixed 60s were used in **four physical arms** (two positions × owner chose actual spare Jet or Pass). All source and opponent card IDs were checked for uniqueness across all zones before and after. No card was inserted or removed from either 60.

| Owner seat | Original source response | Owner follow-up | Delayed GX effect | Source Vileplume | Rank-1 Prize gain |
| --- | --- | --- | --- | --- | --- |
| 0 | Paid GX | Native Pass | resolves | Knocked Out | 1 |
| 0 | Paid GX | Genuine second Jet to Benched Bunnelby | removed when Vileplume moves to Bench | Survives | 0 |
| 1 | Paid GX | Native Pass | resolves | Knocked Out | 1 |
| 1 | Paid GX | Genuine second Jet to Benched Bunnelby | removed when Vileplume moves to Bench | Survives | 0 |

The native attack actually evolves two original V into VMAX, pays **two authentic Underworld Door** abilities using physical Psychic cards into original Benched Trevenant & Dusknoir-GX, pays the original **Guzma** to switch the Caped Vileplume Active and Trevenant & Dusknoir-GX Active, spends its actual once-per-game GX and queues the defending Vileplume's delayed Knock Out. The candidate's previously demonstrated first-turn Cape attachment and G&H/Artazon/Jet/two TM attack evolution is kept unchanged in both arms. The owner-side spare Jet is **physically conditioned** by swapping the same printed Jet with a Pidgey in the candidate's drawn eight; source paid first Jet remains available via G&H. Thus the A/B test isolates an actual owner choice on the *same* possible printed opening.

The escape arm attaches its held second Jet to the real Benched Bunnelby through the pinned Store, genuinely promotes Bunnelby to Active, places still-Caped Vileplume onto Bench and then passes. The existing [paper-rule-repaired delayed-effect cleanup](../../../simulation/twinleaf/pending-end-turn-switch-cleanup.cjs) removes the queued effect upon Active-to-Bench movement. Without that owner switch, actual Pass reaches an unchanged deferred Knock Out and a **single** opposing Prize. The extra Luxurious Cape Prize does not apply to this effect-based Knock Out: the Tool's additional Prize is specifically limited to Knock Out **by damage from an attack**.

## Why the research-only correction is required

Pinned Twinleaf retains Pale Moon's deferred Knock Out on a Pokémon that switches to Bench, contrary to the supplied advanced rulebook's Active-to-Bench clearing of attack effects. This known defect was independently tested in [Agent34's printed/native paper-fidelity work](../../methodology/agent34-palemoon-direct-gx-and-switched-target-native-20261106.md). The **pre-existing**, default-off and reversible `withPendingEndTurnSwitchCleanup` adapter was applied only around the genuine Jet switch, observed removing one queued effect on each physical seat, and restored its patched prototypes. The native opponent's attack, GX expenditure and actual Energy payment were not mocked. The [previously known Dimension Valley Pale Moon extra-cost bug](../../methodology/2026-11/agent34-dimensionvalley-palemoon-extra-cost-correction-20261109.md) was not involved because the Candidate's established Stadium is Artazon.

## Strategic implication and remaining risks

This shows a usable source-specific counterresponse **in both directions**: the original rank-1 Pale Moon can evade Cape's HP defense entirely, while a spare Jet can make the attack's delayed KO fail. It does **not** establish that the owner will hold a spare Jet, that an autonomous player would choose it, that the opponent would choose Pale Moon, or that the full matchup is favorable. Early additional Knock Outs, anti-Special-Energy Stadiums such as Temple of Sinnoh, Item/Ability suppression, rival Bench gusts and opponent follow-through remain untested in this integrated source branch. A tested opponent line may also use Pale Moon's optional Energy discard in distinct effective-cost conditions; that did not affect an Energy-free Vileplume here.

The **current fixed one-Cape 60 is unchanged**. This is a tactical decision point: against original rank-1 Pale Moon, retain a clean post-Guzma switch, particularly Jet Energy onto an already funded Bench Pokémon; avoid treating 230 effective HP as universal defense. Before choosing among Sentinel, Cape Sentinel, Hood Shadow Rider or other field contenders, require the shared independent paper/clock/competent bilateral-policy admission gate. The event's still-missing original ranks 23,25,28 and 0 qualified games persist.

[Four-arm source](../../../simulation/twinleaf/2026-11/agent25-cape-palemoon-counterreply-native.cjs) · [Existing opt-in manual workflow](../../../.github/workflows/agent25-hns-discard-native-counterexample.yml) (`agent25_cape_paid_opening_native=true`) · [native CI evidence](https://github.com/FlareZ123/experiment-01/actions/runs/42724478078). Pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; changes `ab3fb477`, `4c94655a`, `b9bc8038`.
