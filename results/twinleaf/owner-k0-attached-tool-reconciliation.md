# Owner K0 inventory: attached Pokémon Tools were missing from visible physical counts

**Agent 12, 20 October 2026. Evidence class: deterministic data-accounting defect and narrowly scoped source correction.** This repairs an actor-observable knowledge primitive used in planning, with no change to any live deck or bot action.

## Source-grounded defect

The existing [`observedOwnerZones`](../../simulation/twinleaf/owner-k0-observable-inventory.cjs) counted each owner's hand, discard, Lost Zone, Stadium, Supporter, Active `cards` and Bench `cards`. It omitted **attached Pokémon Tools**, stored by the pinned Twinleaf `PokemonCardList.tools` array. The independent repository [physical-card ownership ledger](../../simulation/twinleaf/physical-card-ledger.cjs) explicitly treats both `slot.cards` and `slot.tools` as canonical physical locations, while `slot.energies.cards` is a secondary index into `slot.cards`.

Consequently, a genuine known roster containing an attached Tool could leave one or more physical cards incorrectly in the computed unknown pool. With authentic remaining deck/Prize *counts*, `strictK0Belief` then fails its exact-card-count reconciliation. On an equipped board, a legitimate player cannot rely on this K0 builder to establish a complete unknown deck/Prize pool.

## Controlled before/after falsification

Synthetic physical-zone test fixture with **15 individually named registered cards**, nine cards in owner-visible standard zones, two attached Tools `N` and `O`, two opaque hidden deck cards, and two opaque hidden Prize cards. The attached Energy index refers to an existing Card `G` in `slot.cards`. Hidden cards are identity-blocking proxies in the regression, so touching a concealed `fullName` would throw.

- **Before correction:** `ownerK0ObservableInventory` throws `Unknown deck and Prize counts must reconcile`; the Tools remained wrongly in its unknown count.
- **After correction:** observed printings include `N,O`; `activeTools:1`, `bench0Tools:1`; Energy `G` occurs once; unknown pool is correctly `[J,K,L,M]` with deck count 2 and Prize count 2.
- **Concealed-state swap:** permuting the actual hidden deck and Prize identities leaves the actor's unknown pool and zone counts unchanged.
- **Malformed visible slot:** a non-array `tools` zone throws before a knowledge belief is produced.

The modified [owner K0 module](../../simulation/twinleaf/owner-k0-observable-inventory.cjs) adds only the separate active/Bench Tool zones to legitimate observations, retaining existing zoneCount keys for empty or absent Tool arrays. No `slot.energies` entries are added. The regression cases were appended to the [existing owner K0 tests](../../tests/owner-k0-observable-inventory.test.cjs) rather than spawning a new workflow.

**Validation:** the three new cases passed locally using a source-equivalent Node 22.16.0 copy. An explicit unpatched negative control failed and the corrected positive control passed. The complete upstream test suite, compiled Twinleaf and authentic source-dealt equipped-board integration are **not yet re-run**, so this is a bounded local code regression rather than a compiled-game certificate.

## Integration significance and remaining uncertainties

The source-first rank-11 Absol/Garbodor pressure case depends on an equipped Garbodor; a *player's own* tool-bearing board can analogously invalidate their K0 resource accounting if attached Tools are omitted. The patch respects exact card printings and physical ownership, and avoids reading an owner's hidden deck/Prize identities before the first genuine deck search. It is useful for Agent41's common owner-visible setup-policy work and Agent47's K0 discard frontier. It does not make the currently unqualified two-player bot information-safe, prove a functioning source lock, evaluate a card's strategic value or produce a gameplay win.

**Follow-up:** run the existing K0 pure test suite on a pinned-engine build, then capture one genuine actor-owned pre-search, equipped-board snapshot with physical zone counts to verify this corrected observed pool against the already-existing canonical Card ledger. Do not substitute physical deck/prize identities into policy inputs, even in source-locked research.

Research objective unchanged: exact published opponent lists **29/32**, **zero** competitively qualified matches and no demonstrated 99.5% fixed deck.

### CI readback, 20 October 2026

The existing manual [Aichi benchmark statistical workflow run 39359149162](https://github.com/FlareZ123/experiment-01/actions/runs/39359149162) completed **successfully** on commit `18905858758c430c3e79bae3fcb252450f6c78b2` after the K0 Tool regression and actor-blind category tests were added to its existing owner-K0 step. This workflow uses GitHub-hosted **Node 22** and checks the real checked-out repository sources. No new workflow was added. It does not compile or execute Twinleaf matches; game policy, source-first lock function and competitive qualification remain open.
