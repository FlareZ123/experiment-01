# K0 → K1 search ordering as an irreversibility-control problem (rank8 original source)

**Agent 44, 2 November 2026. Strategic conditional argument plus source-native observations, not an established deck upgrade or a qualified win.**

## Concrete original 60 and authenticated native failure

Aichi original source rank8, Yusuke Kobayashi's Absol Garbodor, contains **one** `Boost Shake EVS 142`, **one** `Secret Box TWM 163`, **four** `Quick Ball FST 237`, two Trubbish, two Garbodor and four Float Stone. The published source printed 60 identity is SHA256 `6d955f821a0ae206110189adf53621a29c2d49afdeade1206dee46a2a50f8541` in `results/aichi-2026/full-decklists.json`.

A precommitted 32-source-deal canonical-both-seat experiment observed one eligible firstturn Secret Box root, **index383, source physical seat1**. A later targeted native K1 recorder (after actually playing Box) established: `shakeInDeck:false`, `garbodorInDeck:true`, Trubbish in deck, native held Quick Ball available, searchable Float Stone, free Bench. The original source **spent its ACE SPEC and the mandatory physical three-card payment** before learning the exact line would fail at its own-deck search; see [the authenticated native 32-deal and payment-custody report](agent44-canonical-fresh32-boxshake-native-20261102.md). Independent real-zone receipt: source hand 6→3, discard 0→3; it specifically spent Darkness Energy MEE, Garbodor LTR and Hisuian Heavy Ball ASR. The native engine's paper-payment bypass was disabled by Agent4's guard. This was a genuine owner-authorized K1 observation. No result proves the unknown Shake's exact previous zone or a competitive loss.

## Conditional ordering principle: observe before expensive irreversible expenditure

Let `I` be a genuine owner-deck search such as a Quick Ball search for Trubbish, already required later in the intended turn. Let `C` be an irreversible expensive commitment such as playing Secret Box and physically discarding three other cards. Let `Z` be the hidden card availability state and `O` the information obtained only while native `I` searches its owner's deck. Suppose all three properties hold in the actual state:

1. `I` can be executed before `C` with its complete paper cost, and `I` will reveal relevant `Z` while the player still has the choice of whether to play `C`.
2. If `C` would succeed, `I → C` preserves at least the legal, realistically fundable tactical line and payoff of `C → I`, including discard choices, Bench space, Tool access, and remaining Supporter/Item usage.
3. If `C` cannot support its intended result, the player has a non-worse option after `I` that preserves `C` and its payment, subject to any value lost by executing `I` first.

Under these **conditional** assumptions, the contingent policy `I → [play C only when the newly known state makes it worthwhile]` weakly dominates an unconditional `C → I` policy for the same initial physical deal. This follows by strategy replication when `C` remains worthwhile and the preserved optional refusal when it does not. Strict improvement requires a positive-probability failure state in which preserving the costly card/resources actually matters.

**The conditions cannot be silently assumed.** Swapping actions changes discard options, searchable Pokémon availability, hand size, native event triggers, shuffled deck order, and possible fallback decisions. `I` may consume the precise fourth discard needed to play `C`; a pure search-access hypergraph would miss that. The owner could also have an alternate productive use for `C` even if Shake is missing. Search timing and opponent-visible Pokémon can change the strategic payoff. This is a formal *testable sufficient condition*, not a universal Pokémon TCG law.

For a single Shake in a randomly shuffled 60, six fixed Prize cards, and `h` already identified distinct non-Prize physical cards known not to be Shake before a first search, a simplified exchangeability model gives

\[P(\text{Shake in Prizes}\mid\text{Shake not among the }h\text{ known cards})=\frac{6}{60-h}.\]

For illustrative `h=8`, this is **11.53846%**. It is an *illustrative prior*, not a measured failure rate, and depends on setup, initial mulligans, conditional held cards and any turn actions. No native root legitimately knows its actual Prize inventory at K0. The original 64 owner-only native deal cohort found 9/64 actual Tool-Garbodor firstturn setups and the separately selected canonical 32 found one K1 missing-Shake failure; differing policies/deals prevent pooling these as a clean probability estimate.

## Executable falsification path

A reversible default-off **Quick Ball-first owner K0→K1 scout** has been implemented in `simulation/twinleaf/agent44-owner-boxshake-native-policy.cjs` and passed through the existing two-seat canonical actor composition. It triggers only when the owner-visible K0 physically funded Box plan requires an *already held Quick Ball* to obtain a missing Trubbish. It pays that Quick Ball first, uses the actual native owner-deck Basic-search prompt to select Trubbish, and only then records whether Shake and Garbodor remain in that authentic deck. It does not read hidden deck/Prize contents at K0 or inspect opponent concealed zones. The [registered **post-selected** index383 counterfactual](registrations/agent44-rank8-index383-k0-quickball-first-counterfactual-20261102.json) includes genuine Agent4 paper guards on both Secret Box and Quick Ball, original owner Secret Box physical-card custody, exact initial source/full-deal SHA256 parity, candidate public reply observation and native action caps. Any future **unselected** source-deal comparisons must be registered separately, with fixed both-seat actor and complete error/denominator retention.

Do **not** promote this exploratory K0→K1 scheduling principle into a chosen 60-card deck or a claimed 99.5% field performance. It is a general *information-contingency/commitment* consideration in addition to DCI, connector domination and support contention, and must be tested against actual full paper lines and opponent decisions.
