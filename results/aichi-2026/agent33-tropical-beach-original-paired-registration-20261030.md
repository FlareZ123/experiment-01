# Agent 33: predeclared Tropical Beach same-physical-deal development panel

30 October 2026. Original **source ranks 3, 6 and 29** are the three
published Aichi Top32 opponents with Tropical Beach. This study asks whether
the newly integrated optional last-chance Beach owner root produces genuine
additional native `UseStadiumAction` acceptance without changing the frozen
original source or candidate printing inventories.

## Frozen before actual native execution

Registration:
`results/aichi-2026/registrations/agent33-tropical-beach-original-three-rank-20261030.json`, with **full original rank1 candidate and ranks3/6/29 source
paper printed card arrays** copied exactly from the project authenticated
`full-decklists.json`. No inferred replacement of ranks23/25/28.
This commit registers six non-cherry-picked independent 32-bit seeds from
Python `secrets.randbits(32)`, one each rank / candidate physical seat
(3 ranks × A/B). Each seed is run as **the same physical 60s in control and
treatment**, making 12 prospective native games. The sole treatment toggle
is `tropicalBeachLastChance:true`. Both seats have the same owner-visible
canonical policy in either arm, with Agent41's existing native Supporter,
target and Energy prompt observers. Action cap 260.

The runner `simulation/evaluation/agent33-tropical-beach-original-paired.cjs`
records pre-shuffled full physical-deal SHA, source-deal SHA, both printed
native deck identities, engine pin, actual first-turn seat, native Store
action ledger, Beach use proposals and native physical confirmations, actor
fallbacks, terminal/capped status, and every failed attempt. Paired comparisons
require two real status receipts plus nonnull matching SHA and first-seat
fields. All outcomes are explicitly unqualified development evidence.

The unit suite `tests/agent33-tropical-beach-original-paired.test.cjs`
checks the admissibility/error logic synthetically. The independent
manual-only pin/compilation CI option `agent33_tropical_beach_paired`
runs all registered cells and archives raw JSON. No native games have
yet been run in this invocation: **do not report wins** or infer that
Beach was drawn in any particular game.

**Interpretation:** Even a positive count of settled native Beach effects
does not imply stronger human play, a particular competitive win rate,
paper-exactness for the 126 nonexact source printing copies, or tournament
clock legality. It establishes only that this one omitted line reaches native
Store under specified original printed sources and transparent policy flags.

## Action-ledger naming precision

The headless native Store root ledger records `playedCard` as the card's
**name**, not its printing. The runner counts only entries where
`action==='PlayCardAction' && card==='Tropical Beach'` as actual Beach
placement; other ordinary cards played must never be mislabeled as Stadiums.
Every native `UseStadiumAction` is reported generically as a Stadium use,
while Beach-specific native owner verification comes from the separately
typed `nativePhysicalConfirmedByIntent['use-tropical-beach']` receipts.
A synthetic negative regression covers the distinction. None is
competitively qualified.

## Separate native Store draw/end-turn witness

`simulation/twinleaf/agent33-beach-store-effect-witness.cjs` wraps the
pinned live Store's `UseStadiumAction` dispatch without changing gameplay
or exposing hidden hand identities to bot decisions. It captures **public
card counts only** before and after: Tropical Beach in play, acting player,
hand/deck size, Stadium-use turn quota, and actual end-turn transition.
An accepted dispatch counts as a *settled Beach effect* only when the
acting hand becomes seven, deck decreases by the expected number,
the use-turn marker advances, and an end-of-turn phase/player/turn
transition is visible. A Store rejection or a no-op remains an
unsettled event. Root ledger Stadium-action count must agree with
accepted Store Stadium uses on a completed trial. Native Store
dispatch receipt events are hashed and archived for reproducibility,
still independent of full paper correctness or tournament win rate.
A synthetically injected Store with both physical seats tests the
proof predicate and restoration; actual pinned engine acceptance
awaits manual CI and **no native successes are claimed here**.
