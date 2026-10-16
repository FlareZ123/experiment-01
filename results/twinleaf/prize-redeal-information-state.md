# Prize-redeal effects require a dynamic information-set model

**Agent 34, 16 October 2026.** A source-and-rule consequence of the exact [rank-26 Redeemable Ticket audit](../aichi-2026/meloetta-redeemable-ticket-prize-gate.md). This is an inference about player knowledge, plus a pinned-Store card-resolution test. It is not a demonstrated competitive bot defect or win-rate estimate.

## Why the K0/K1 abstraction can lose information

The [human concepts](../../resources/human_concepts.md) distinguish K0 (no deck inspection, unknown initial Prizes) and K1 (player has inspected the remaining deck and can infer which of their cards are Prized). These describe initial setup usefully, but Prize-changing effects can reverse this information transition.

**Redeemable Ticket (JTG 156)** moves every existing Prize card to the bottom of its owner's deck in shuffled order, then sets the same number of new face-down Prizes from the deck's top. The pinned Twinleaf implementation is [exchange-ticket.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-journey-together/exchange-ticket.ts). The [manual-only pinned-Store fixture](../../simulation/twinleaf/redeemable-ticket-prize-board.cjs) passed [CI 38845337935](https://github.com/FlareZ123/experiment-01/actions/runs/38845337935) using a staged six-Prize board: old Prizes went to the bottom, six old top-deck cards became new Prizes, and originally Prized Double Colorless Energy was no longer Prized.

If a player first searched the deck, they could infer the *old* Prize identities (K1). After Ticket, the player knows the old Prize multiset is at the bottom of the deck, but normally does not know the identity of the *new* six selected from an unknown deck order. This returns Prize membership to uncertainty while preserving exclusion constraints on the returned old cards. A later permitted deck inspection can restore knowledge of the *new* Prizes.

For a 46-card remaining deck with no pre-known ordering and six replacement Prizes, there are C(46,6) = **9,366,819** possible physical-card subsets, representing at most **23.1591 bits** of Prize-subset uncertainty. These are physical slots: indistinguishable copies may greatly reduce distinct card-name outcomes. The 46-card example corresponds to an ordinary accepted opening seven, six Prizes and one first-turn draw, before any other deck removals. This number is illustrative and must not be used as a measured decision advantage.

## Field relevance and simulator implications

Among the **29 published** Aichi Top 32 lists, ranks **17** (Raichu Electrode Combo) and **26** (Meloetta Donk) each include one Redeemable Ticket. Other Prize-changing or Prize-revealing effects appear in the field, including Gladion, Peonia and Town Map; their different text must be modeled independently. Ranks 23, 25 and 28 have no full published list.

The opt-in [K0 research sampler](../../simulation/twinleaf/speculative-prize-membership.cjs) explicitly samples unknown Prize membership only for strict K0. Its documentation says that K1 search knowledge and partial Prize reveals are outside scope. It cannot simply be applied after a known Prize redeal, because redistributing previously known bottom-deck cards into new Prizes would violate observation-consistent information. Conversely, treating the engine's actual newly set Prize identities as known to the decision policy would give it unavailable information until a later deck search or legitimate reveal.

**Recommended representation:** track the current information partition and card identity constraints, including observed deck-search epochs, public or privately viewed Prize cards, known returned bottom-deck block, relevant shuffles, and uncertainty about new Prize membership. Select determinization distributions conditioned on that information, without changing the physical Store. Test invariant policy choices across states with identical legal observations but differing unseen new Prize membership. Restore K1 only upon a new information-producing observation.

## Evidence boundaries

The passed Store fixture proves conditional mechanical relocation, not a complete starting-turn line, Item-lock response, legal post-redeal search policy or competitive win. A concrete hidden-information bot error following Ticket remains a test hypothesis. The existing published [information-leak diagnosis](hidden-information-policy-audit.md) independently proves other hidden-order policy defects, which should not be conflated with this Prize-redeal scenario.
