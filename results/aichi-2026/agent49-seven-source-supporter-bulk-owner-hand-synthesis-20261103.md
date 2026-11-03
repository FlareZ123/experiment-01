# Seven original-field entire-hand Supporter effects: resources, public draw conditions and native owner-root census

**Agent 49 | 3 November 2026.** This supersedes the narrower [four-printing initial report](agent49-owner-bulk-hand-original-field-20261103.md) while preserving its independent first green CI receipt. Only resource-accounting and read-only owner-observation methods changed. No deck or normal decision policy was changed.

## Seven exact paper source effects

| Original English printing | Physical copies in 29 original 60s | Original deck-printing rows | Owner's remaining hand after playing this Supporter | Owner draw request |
| --- | ---: | ---: | --- | --- |
| Carmine TWM | 15 | 12 | Discard | 5 |
| Professor's Research JTG | 11 | 5 | Discard | 7 |
| Professor Sycamore BKP | 7 | 4 | Discard | 7 |
| Lillie's Determination MEG | 19 | 16 | Shuffle back into deck | 8 if exactly six owner Prizes remain, else 6 |
| N FCO | 8 | 7 | Shuffle back into deck | Owner's remaining Prize count |
| Marnie SSH | 16 | 13 | Shuffle group onto bottom of deck | 5, provided either player moved any hand cards |
| Iono PAL | 11 | 10 | Shuffle group onto bottom of deck | Owner's remaining Prize count, provided either player moved any hand cards |
| **Total** | **87** | **67 rows** | | |

These are **67 deck-printing occurrences**, potentially multiple printings in the same one of 29 opposing decks. Counts and source names come from [the authenticated original-field roster](full-decklists.json); print effects and source IDs are checked against the English card database in the bundled paper card pool. Source IDs in the [exact print catalog](../../simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs): Carmine `sv6-145`, Research `sv9-155`, Sycamore `xy9-107`, Lillie `me1-119`, N `xy10-105`, Marnie `swsh1-169`, Iono `sv2-185`.

The full original field has 1,035 physical Trainer copies. The preexisting **259-copy fixed-cardinality payment atlas** and these **87 different entire-hand-effect copies** cover **346/1,035 (33.43%)** with a print-specific hand-resource model of one kind or another. This fraction is solely *hand-resource-model coverage*. It must never be interpreted as 346 paper-legal plays, available native actions, or a gameplay win rate.

## Owner-visible independent resource semantics

The exact selected physical Supporter leaves the owner hand before resolving its effect. All *other* physically held owner copies move together to the appropriate zone. Protected strategic cards are counted separately; this reflects resource displacement regardless of discardability preferences. The module returns the original held card indices and their new intended zones, never simulated draws or inferred redraws.

For Marnie and Iono, a draw requires actual hand-card movement. An owner with another card physically in hand proves their own movement. If the owner holds only the Supporter and the opponent publicly holds zero cards, no cards move and the conditional draw is false. **A positive opponent hand count does not prove movement:** Milotic's Dew Guard or another protection may prevent the opposing hand being moved. That case is UNKNOWN without further public protection and resolution evidence. No opponent hand identities are read. The original pure model's positive-count inference was corrected in commit `a7ef05d`; the [prior Agent 2 Milotic/Dew Guard ruling and native investigation](../twinleaf/agent2-pinned-marnie-iono-solecard-emptydeck-gate-20261030.md) motivated the correction. N, Marnie and Iono have opponent-hand effects outside this owner-only movement projection.

The resulting `drawnCardCountRequested` is the source-printed request under known public information. The number actually drawn and the identities of new cards require genuine game-state resolution. The owner public remaining Prize count for N/Iono and Lillie is never derived from hidden Prize identities.

## Reproducible evidence

- [Original exact-print hand transition module](../../simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs), updated with all seven prints, print-specific destination and conditional draw triggers.
- [Owner-only generic payment observer](../../simulation/twinleaf/agent27-owner-trainer-payment-observer.cjs) records bulk hand alternatives separately from mandatory/optional fixed discard costs; it never selects a Trainer.
- [Ten pure tests](../../tests/agent49-owner-bulk-hand-transitions.test.cjs) verify all 29 source sixties, zone distinction, public Prize and conditional hand draws, protected cards, player information boundaries and read-only integration.
- **[Manual-only Node 22 CI 41712532572](https://github.com/FlareZ123/experiment-01/actions/runs/41712532572) SUCCESS**, head `79a15654f20f73d2cd72d05a39bdf9132c851a4b`. A first seven-print CI at 41712293368 failed an opponent-hand-count invariance test; the correction restricts consulting the opponent's public count to printings whose draw trigger actually requires it. No opposing hidden identities are read.
- **[Corrected seven-print, owner-public-protection conservative CI 41714280958](https://github.com/FlareZ123/experiment-01/actions/runs/41714280958) SUCCESS**, source pin `64aa3a78872486d6c2fcafaa951e60fe556e5e36`, bulk version `agent49-owner-bulk-hand-transform-v2-sevenprint-dewguard-unknown` and observer version `agent27-native-owner-hand-payment-summary-v3-bulk-sevenprint`. This supersedes the earlier count-positive assumption and preserves the exact source roster test. A positive opposing public hand count alone yields an unknown conditional draw; no original paper legality is certified.
- **[Native original rank 5 versus original rank 11 A/B/A CI 41711552049](https://github.com/FlareZ123/experiment-01/actions/runs/41711552049) SUCCESS**, pinned exact original Engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and native research head `098c9d6256eeb99c4735924af8102bb9f8ac89dc`. This run predates admission of N/Marnie/Iono and observes the four original bulk printings only, so do not mislabel it as a seven-print runtime validation.

## Genuine native 5/11 owner-root witness

On the unchanged preregistered two source-seat physical deals, baseline, observed and repeated-baseline game traces and initial physical-deal fingerprints matched exactly in both seats. The read-only payment observer saw **50 authenticated owner-root decision frames** (24 in one physical arrangement and 26 in the other), all retained in the [native audit artifact](https://github.com/FlareZ123/experiment-01/actions/runs/41711552049). In the physical arrangement placing original rank-11 on seat 0, **nine repeated source owner roots** physically held a modeled full-hand Supporter option, consistent with rank 11's three Carmine TWM cards. The other observed seat arrangements recorded zero bulk options. These nine observations are repeated frames in one development game, not nine independent games, not nine selected Carmine uses, and not verified payment or damage.

The original 5/11 Store game and selected root actions remained unchanged by this read-only observation. No characteristic opponent response, paper time control, targetability or zone custody is certified. An earlier native attempt [41711171187](https://github.com/FlareZ123/experiment-01/actions/runs/41711171187) failed two legacy assertions retaining pre-existing 231-copy source payment coverage; the corrected expectations of 259 copies and 29 covered source ranks passed in the complete [41711552049](https://github.com/FlareZ123/experiment-01/actions/runs/41711552049) rerun.

## Next competitive gate

Integrate a genuinely owner-information-safe, publicly paper-screened policy that chooses among physically payable Trainer alternatives, funded attackers, and Pass. For the bulk cards, verify the exact required hand custody under native Store after selected action and prompts, then observe strategic followthrough and a consequential competent opposing reply. Avoid treating raw offered action counts, requested draws or action caps as wins.

**Overall benchmark remains:** 29 of 32 authenticated printed opposing sixties, ranks **23/25/28** unavailable, zero competitively qualified games, no chosen fixed optimal 60, and no demonstrated 99.5% game win rate.
