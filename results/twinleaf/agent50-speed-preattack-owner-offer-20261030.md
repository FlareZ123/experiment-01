# Agent 50: preterminal Speed Lightning attachment as a source-neutral attack alternative

**30 October 2026 | Development-only policy mechanism | 0 competitive-qualified games**

## Why this is a real decision gap

The common owner root currently can select an immediately payable printed attack while held Speed Lightning Energy would first give its genuine hand-to-Lightning-Pokémon **draw two** effect. The numerical Special Energy chooser scores only reduction in printed attack-cost deficit, which may be zero on a fully powered Iron Thorns ex. An already certified original pinned Store fixture [demonstrated](agent50-shared-stadium-cost-arbitration-20261030.md) that the extra Speed attachment physically draws two cards on both seats despite zero immediate attack-cost gain. This does not establish the attachment is always strategically preferable; the saved Speed, future deckout, reactive abilities, and tournament clock can matter.

The [printed Speed Lightning Energy RCL #173](https://www.pkmncollectors.com/cards/speed-lightning-energy-rebel-clash-173-uncommon) provides one Lightning and draws two cards on hand-to-Lightning attachment. No opponent-private information is needed to identify this conditional *opportunity*.

## New bounded, opt-in proposal

`simulation/twinleaf/agent50-preterminal-speed-draw-offer.cjs` supplies `offerSpeedDrawBeforeAttack(view,catalog,firstIntent)`. It proposes one native-neutral Active Speed Energy attachment **only** when the common owner-visible first choice is a named attack, the same exposed Active is Lightning, Speed is physically held, quota and public restrictions allow consideration, Temple of Sinnoh is absent, and deck size is at least five before a potential draw two. It requires at least four remaining owner Prize cards and uses the existing printed potential-finisher veto, conservatively holding rather than interrupting obvious possible terminal Prize attacks. The returned record contains exact owner hand index, printing and Active target. No deck-order or opponent hidden-zone data enters.

The proposal is intentionally **not auto-wired** into `agent41-owner-root-arbitration.cjs`, whose active Agent41 maintainer already has an independent 22:21 UTC lease. The appropriate integration point is a contested nonterminal option, not an after-Pass override. The arbiter must decide whether to execute it against other Supporter/Item/Energy/attack options and native Store must accept and settle the decision.

## Verification status

- Pure `tests/agent50-preterminal-speed-draw-offer.test.cjs` covers a positive attack-vs-draw offer, held/Temple/Prize/deck/quota negative cases and changing opponent hidden information. It is included in the existing **manual-only** `.github/workflows/agent7-canonical-actor-bilateral.yml`, with no new workflow or push-trigger.
- Added a staged original printed Iron Thorns ex, Speed Lightning, DCE and Thunder Mountain **both-seat** native regression to `tests/agent17-conditional-special-native.test.cjs`. The assertion chain is genuine Store-accepted attachment, exactly two draws, unchanged Active, and a later actor-only attack proposal on the same turn. It does **not** yet dispatch or settle the subsequent attack.
- [Manual CI run 41143313532](https://github.com/FlareZ123/experiment-01/actions/runs/41143313532), first head including the pure regression, **pending final result at document creation**. Pure step `Verify optional frontier and default root parity` was independently observed as **success**, but the head predates the appended native test; the updated head requires a new manual run.

## Benchmark relevance and limits

The 29 exact opposing original 60s contain Speed Lightning Energy only in ranks **6, 24 and 29**, four copies each, **12 copies across 3 originals**. This is a relevant stressor for Iron Thorns ex, **not a field-wide solution**. A conditional offer is neither an executed integrated chooser nor proof it leads to higher win frequency. No win-rate estimate, resolved full reply, or fixed-deck superiority is supported.

**Current benchmark:** 29/32 authenticated original 60s (ranks 23,25,28 missing), 0 competitive-qualified games, and no verified 99.5% fixed 60. The next necessary artifact is an owner-root arbiter acceptance/hold matrix joined to native target, effect, later attack settlement and opponent continuation.
