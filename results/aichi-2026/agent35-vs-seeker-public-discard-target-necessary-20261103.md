# Public-discard VS Seeker necessary-target certificate across the original Aichi field

**Agent 35 | 3 November 2026 | printed-source rule + reusable owner-only pure helper | no native game / no competitive qualification**

## Strategic problem and scope

The authenticated 29 Aichi source sixties contain **59 physical `VS Seeker PHF` copies across 23 original decks**. That is the single highest-frequency printing unrepresented in the prior four *exact-printing* Trainer negative-rule families ([census](agent35-original-field-trainer-negative-family-coverage-20261103.md)). Existing narrow [Lillie's Determination VS Seeker root](../../simulation/twinleaf/agent48-owner-vs-seeker-lillie.cjs) already checks for one specific discard Supporter; it does not cover the entire public discard-target condition for all Supporters.

The supplied English card database `cards/en/xy4.json`, ID **`xy4-109`**, prints the Phantom Forces VS Seeker effect: **"Put a Supporter card from your discard pile into your hand."** Advanced Player's Rulebook v3.4, section B-01 Items, states that an Item cannot be used if following its printed effect would make no change to the game state. If the physical player's public discard contains no Supporter, and every discarded printing has a known card type, VS Seeker cannot take a Supporter from there. This is a **negative necessary-condition certificate**.

## Reusable implementation

[`simulation/twinleaf/agent35-vs-seeker-discard-target-certificate.cjs`](../../simulation/twinleaf/agent35-vs-seeker-discard-target-certificate.cjs) exports:

- `publicSupporterPrintIndex(allCards,nativeTypes)`: classifies *public CardManager printed full names* as Supporter versus Other; rejects ambiguous identical full-name type collisions. Unknown printings remain unknown, so they cannot create an erroneous absence proof.
- `vsSeekerDiscardTargetCertificate(view,row,printTypes)`: reads only the actual owner's visible discard and physical VS Seeker hand index from the existing detached owner-root observation. It flags **proven no public Supporter target** exactly when none of the discarded cards is a Supporter and every discarded printing has known type (or the discard is empty). Returns unresolved when a target exists or a discarded printing is unknown.
- `withVsSeekerDiscardTargetEvidence(view,census,printTypes)`: opt-in immutable decoration of a prior owner-paper Trainer census. It preserves existing blockers and adds a new `printed-discard-target:vs-seeker-no-supporter` blocker where proven. It never selects, dispatches, pays, retrieves, or plays any Trainer.

This implementation does **not** label a VS Seeker playable if a Supporter is present. The Item could still be blocked by an Item lock or another condition; the retrieved Supporter may be unplayable due to first-player turn rules, Supporter quota, lock or its own printed conditions. The certificate separately records `supporterQuotaUnused` as **resource context**, with no legal-play conclusion. An already consumed Supporter quota does **not** block the legal use of VS Seeker to recover a Supporter for a later turn.

The classification accepts exact `VS Seeker PHF` only. It deliberately does not infer that distinct historical printings of the same named card share the same source text, native fullName, or paper format legality. The helper consumes no opponent hidden hand/deck/Prize information and does not read the owner's unknown deck or Prize identities.

## Executed regression evidence

[`tests/agent35-vs-seeker-discard-target-certificate.test.cjs`](../../tests/agent35-vs-seeker-discard-target-certificate.test.cjs) covers empty/known-non-Supporter public discard, recognized two-Supporter discard with the Supporter quota already spent, unknown discarded printing fail-closed behavior, missing discard snapshot, public catalogue type collisions, strict physical owner-hand slot correspondence, opponent-concealed getter denial, prior-blocker preservation, and pinned 59-copy/23-source-deck incidence.

Initial pure CI [41736030924](https://github.com/FlareZ123/experiment-01/actions/runs/41736030924) failed because a synthetic public catalogue test fixture accidentally omitted its expected Raihan entry. Fixed test fixture at commit `b6075ac2c8861e31045d41ad63216cbe1bfa0d84`. **Manual Node 22 CI [41736139250](https://github.com/FlareZ123/experiment-01/actions/runs/41736139250) passed all 10 tests**: seven new VS Seeker cases plus the three prior original-field source incidence cases. No Twinleaf compile/native gameplay was commissioned. Existing two-minute manual audit workflow remains default-off. Source census artifact `13278009604` retained with that CI run.

This new fifth family now supplies a potential printed-specific negative screen for **59 additional copies / one extra name+set printing** outside the earlier four maps, yielding **346 of 1,035 copies (33.43%)** with at least one of those five source-printing-specific negative-rule descriptions. This is **coverage by available rule descriptions**, with conditional in-game outcomes depending on the actual owner discard. It does not mean 346 cards are rendered illegal or that 346 actual opportunities were examined.

## Next experimental gates

1. Ask the shared two-seat policy steward to attach this read-only helper at a genuine *owner* decision root via the existing `agent5-native-owner-trainer-frontier-observer.cjs` metadata and `agent4-owner-paper-trainer-necessary-screen.cjs` paper census. Use the real public registered CardManager and validate actual native fullName alias classes on both seats.
2. Record, per physical root, whether VS Seeker is held, Item-unlocked, has a known public discard Supporter, is selected/Store accepted, retrieves a physically present own-discard Supporter, consumes the one Supporter channel when that Supporter is later played, and produces genuine game payoff.
3. In the policy, compare this recovered Supporter channel against direct held Supporters, held search, immediate attack and Energy alternatives from the *same root*. A recovery with a valid target is a possible connector and must be evaluated for relative opportunity cost.
4. Repeat new preregistered, representative, both-seat physical deals. Demand paper payment, custody, reply and actual official match-clock settlement before any claim of opponent competence.

**Field and objective status unchanged:** 29/32 exact original opponent sixties, ranks 23/25/28 missing, 0 competitively qualified games and no validated fixed-60 99.5% result.
