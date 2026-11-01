# Agent 41: one shared paper-prompt contract portfolio, historical frozen-v2 replay gate

**1 November 2026, 17:15 UTC | Agent 41 | normal research invocation (secure draw 2).** This is an independent, explicitly developmental Store-level paper-fidelity integration, not a deck-win experiment. **Zero competitive-qualified games** remain.

## Why one portfolio

The previously frozen original rank-6/rank-11 v2 two-seat benchmark is exactly [32 attempted native original-source games](agent41-frozen-bilateral-v2-32-original-source-energy-20261101.md), with **19 untimed engine terminals and 13 action caps**, all development-only. Its independently archived [prompt denominator](agent17-frozen-v2-prompt-denominator-20261101.md) contains **4,331 native ResolvePromptAction roots in 13 families**, including **271 ChooseCardsPrompt, 27 AttachEnergyPrompt, 69 ChoosePokemonPrompt** and 3,431 WaitPrompt. The original archive has no complete pre-dispatch independently printed-card paper verdict ledger.

Independently documented issues include native acceptance of forbidden zero-target damage, a source-stamped Camping Gear count violation, original Iron Thorns TWM's necessary Energy transfer, and [nine actually selected original rank-11 Night Watch prompts in two games](agent12-night-watch-random-selection-paper-gap-20261101.md) whose attacker-controlled concealed-hand choice violates the printed random-selection mechanism unless independently randomized. Candidate original rank-1 Astral Barrage and rank-31 Radiant Alakazam discrepancies remain outside this two-source-rank frozen field. These are different mechanisms, and staged reproduction should never be confused with naturally dealt original-source exposure.

## New unified executable, with exact scope

- [Research-owned unified pre-dispatch guard](../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs) intercepts **one** real Store.dispatch surface for both physical seats; it reinstalls the previous function descriptor after a run, including failures. No Twinleaf vendor file is changed. An Iron Thorns TWM reducer probe marks true Volt Cyclone AttachEnergyPrompt instances separately, and also restores the reducer.
- Native **Camping Gear BST**, positively source-stamped: verify mandatory one selected card, own deck and native validator. Native **Volt Cyclone**, positively reducer-attributed: verify exactly one attached Active Energy moved to an occupied own Bench Pokémon, with pinned native validator. Only these narrow positively covered predicates can emit `PAPER_PROMPT_VERIFIED`. They do **not** certify the full game or all attack costs and sequencing.
- **PutDamagePrompt**: reject only independently bounded negative predicates, including a declared zero-allowed target, a nonintegral damage packet, or invalid nonnegative integer damage. A passed positive branch remains `PAPER_PROMPT_UNVERIFIED`, since the generic validator/declared limits are insufficient to establish printing-specific legality.
- **Night Watch-like concealed-hand ChooseCardsPrompt**: report structural eligibility and `PAPER_PROMPT_UNVERIFIED` for printed attack provenance and uniform random sampling. Independent [uniform random-position prototype](../../simulation/twinleaf/agent12-nightwatch-paper-random-chooser.cjs) remains a distinct opt-in, and is not silently mixed into this frozen policy.
- **Everything else** (including 3,431 historical WaitPrompt and other prompt families): `PAPER_PROMPT_UNVERIFIED`. This preserves the denominator and avoids inferring that an unchecked prompt was valid.
- The guard emits aggregate by-family status counts, trial ID, bounded public-only examples, pre-dispatch veto count, accepted/rejected count, source-contract name and an explicit overall competitive release veto. It does not expose physical concealed hands or opponent card identities to a player chooser.

The [separate full-denominator wrapper](../../simulation/evaluation/agent41-frozen-v2-paper-contract-portfolio.cjs) records trial IDs from each true `headless.runMatch` label and binds accepted Store prompt actions back to their per-game original root ledger. A mismatch fails the whole release classification. It carries all original 32 raw rows, errors and caps in the native result, rather than dropping failed games.

## Verified pure regressions

The five new [Store/preflight regression tests](../../tests/agent41-paper-prompt-contract-portfolio.test.cjs) ran as part of **109/109 passing pure tests** in [manual existing-workflow CI 41329960274](https://github.com/FlareZ123/experiment-01/actions/runs/41329960274). They cover:

1. Invalid original Camping Gear count rejected **before any Store mutation**, while valid one-card own-deck selection settles and Store descriptor restores.
2. PutDamage zero-cap and partial damage packet both vetoed before mutation; a nonnegative passing branch remains explicitly unverified.
3. Exact native reducer-marked Volt Cyclone rejects a nonexistent Bench recipient, accepts occupied own Bench, and restores the reducer.
4. Night Watch-like hidden-hand prompt stays unverified and never serializes concealed card names in the audit.
5. The frozen wrapper records trial-level prompt counts, restores its headless export and fails to claim full 32-arm parity on an intentionally partial fixture.

These are **synthetic/pure regressions**, not a compiled native original-source release test.


### 17:16 UTC independent-validator correction and second pure validation

After the first 109-test pass, a code review found that the earlier shared damage helper returned `NATIVE_PROMPT_VALIDATE_FALSE` **before** checking an independently proven zero-cap target. Treating that native error as sufficient proof of paper invalidity would be too strong, while ignoring it would mask a genuine zero-cap violation. The unified boundary now evaluates its own explicit zero-target, integer-damage and whole-packet negative predicates **without consulting an untrusted native validator first**. A sixth pure test demonstrates both required properties: a zero-cap assignment is rejected before mutation even when `prompt.validate()` is false, and a passing zero-damage reply stays `PAPER_PROMPT_UNVERIFIED` despite the native validator returning false.

The revised **110/110 pure regression tests passed** in [manual CI 41330614593](https://github.com/FlareZ123/experiment-01/actions/runs/41330614593). Its subsequent frozen-v2 source inspection again failed correctly, because other current research commits changed the canonical runner blob to `9c226dc5778508d3aaaa84a8c7500ac4465844e6`. This second job did not request, execute or retry the safety-blocked full native portfolio. The latest unified code is now pure-tested, while its historical native overlay remains uncompiled and competitively unqualified.

## Frozen source mismatch and attempted native release path

The same [CI 41329960274](https://github.com/FlareZ123/experiment-01/actions/runs/41329960274) **failed after all pure tests passed**, at the deliberate frozen-v2 inspection gate:

```text
Source changed without a frozen-profile re-audit:
simulation/evaluation/agent41-bilateral-v2-development.cjs
actual Git blob:   fdf32842b9216ba9137cb06a9822c101c78ad429
frozen Git blob:   7d6e515eecbaed1fa638191462b45f0daa2bf60e
```

The original successful v2 run was pinned to research head `86e0410847a953a73fdef7f76865493e75ac1c7f` and vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Consequently, simply running a changed main checkout as an unchanged v2 would be invalid.

An isolated path was added **inside the existing manually dispatched workflow**, rather than a new workflow: it temporarily checks out that exact original baseline commit in the runner and overlays only six explicitly named research-owned prompt-audit files from the triggering commit. The original frozen v2 profile/inventory and both fixed 60s remain untouched in GitHub. The new audit is independently versioned, and cannot inherit the historical profile's source-closure certificate.

**Execution qualification remains blocked.** The attempt to dispatch the new full 32-arm portfolio workflow was explicitly denied by the host safety check. It was **not rerouted or retried** and produced **no native replay or 32-arm independent paper-verdict counts**. The overlay workflow code has not been compiled or executed; do not claim its restoration/parity assertions have passed in native Twinleaf. The original archived full 32 remain the only full-denominator evidence so far.

## 17:22 UTC live-Store denominator correction

Agent39's [actual original-store four-arm artifact correction](../../communications/agent41/20261101T171300Z_agent39_aux_store_prompt_denominator_correction.md) exposed a major false denominator: his original rank6 screen counted **10** verified Volt prompt dispatches from **five unique live source prompt roots**; its 729 counted Store prompt attempts vastly exceeded the 174 genuine live-root actions. The additional attempts arose from cloned/auxiliary Store executions and repeated observation, not independent physical games.

The unified boundary now uses the **first real AddPlayerAction Store per registered original trial** to mark a unique live Store, following the independently established native [accepted Energy prompt witness](../../simulation/twinleaf/accepted-energy-prompt-public-witness.cjs). Its version is now `agent41-unified-paper-prompt-contract-portfolio-v2-live-store-only`. Every auxiliary ResolvePromptAction is explicitly counted as an auxiliary attempt, excluded from the live native denominator and from paper verification, and left untouched by the guard. Positive Iron Thorns reducer marking also requires the matching actual live Store; each registered trial gets a separate identity rather than reusing the first game's Store.

The full 32-arm wrapper now requires **32 unique real AddPlayerAction Store identities**, zero pre-live prompt attempts, and accepted trial prompt counts equal to the native root-action ledger. All these conditions are independent release gates. The Store guard additionally preserves redacted **per-trial** event provenance to support later ordinal joins. A complete guaranteed ordinal-to-private-selected-target mapping has **not** been implemented.

Two additional pure regressions assert that a genuine two-trial live Store is isolated from an auxiliary Store and that both Store/reducer descriptors restore on an exception. The resulting **112/112 pure tests passed** in [CI 41331086222](https://github.com/FlareZ123/experiment-01/actions/runs/41331086222). The next frozen-v2 inspection again rejected an updated current runner SHA (`a1d73be6bc07853a28cd2f350f2433e0e2399d5f`) against the same preserved historical expected SHA. No full native replay occurred.

**Caution:** the actual live-Store provenance assumption is grounded in pinned witness source and synthetic dual-Store tests, but the new 32-arm overlay remains **uncompiled and unverified in native games** because the host denied its dispatch. Native credential, hidden-information and official clock gates remain separate. An attempted standalone root-ordinal join file creation was explicitly blocked by host checks and was not retried. The existing per-trial receipts and counts therefore cannot be represented as an independently certified full prompt source/selection join.

## Source-derived baseline by independent paper-prompt status

| Historically observed native prompt family | Historical resolutions | Independent full printed-paper prompt verdict in frozen archive | Newly implemented relevant guard |
| --- | ---: | --- | --- |
| WaitPrompt | 3,431 | 0 independently verified | Unverified |
| ChooseCardsPrompt | 271 | 0 independently verified | Camping Gear only if positively source-stamped; Nine Night Watch original roots currently unverified |
| AttachEnergyPrompt | 27 | 0 complete-effect certified; [27/27 matching public Volt Cyclone transfer *shape*](agent17-frozen-v2-prompt-denominator-20261101.md) | Positive native Volt Cyclone marking and recipient/energy preflight |
| ChoosePokemonPrompt | 69 | 0 independently verified | Unverified |
| Other 9 families combined | 533 | 0 independently verified | General explicit unverified |
| **Total** | **4,331** | **0 complete paper-prompt certificates** | **No native portfolio run yet** |

The historical archived status is a **gap inventory**, so the displayed zeros cannot establish that replies were illegal or paper-valid. When an opt-in full Store replay becomes permitted, compare the entire profile using the same frozen original physical deals and preserve the 32/32 attempt denominator, accepted-paper verdicts by seat/family, physical effects and source-turn return, every veto, native error, cap and noninterference check. Then register a separate source-ranked field deck discrimination experiment.

## Current deck decision

No fixed 60 can be promoted from this work. **32/32 original Top 32 archetypes are identified, but only 29/32 exact original opposing 60s are authenticated**. The missing final ranks are 23, 25 and 28. All candidate comparisons remain developmental; **0 competitive-qualified games and no demonstrated 99.5% fixed-deck win rate**.

**Permanent new files:** `simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs`; `simulation/evaluation/agent41-frozen-v2-paper-contract-portfolio.cjs`; `tests/agent41-paper-prompt-contract-portfolio.test.cjs`. **Modified existing manual workflow:** `.github/workflows/agent41-rank6-grouped-denial-source-panel.yml`, with an explicit paper portfolio input disabled by default.


## 17:39 UTC physical search membership and validator disagreement correction

Independent review of the positive paper prompt statuses exposed another possible false proof: an engine `ChooseCardsPrompt.validate` return value can be mistaken for evidence that the chosen **actual card instance** belongs to the player's deck. This matters for the original rank6 source's **Camping Gear BST** prompt. The shared boundary now verifies exact **object-identity membership of the selected card** in the actual owner's pre-dispatch `deck.cards`, verifies that the stamped search prompt's `player` and `cards` are precisely that owner and own deck, and independently requires one selected card. A foreign physical card is rejected as `PAPER_PROMPT_INVALID` **even if a deliberately permissive native validator returns true**.

Conversely, when independently established printed selection geometry is satisfied but the native `prompt.validate` returns false, the recorded paper state becomes **`PAPER_PROMPT_UNVERIFIED`**, with a distinct **`nativePreflightVetoed`** event and fail-closed native-preflight error. This is now true for both Camping Gear and positively reducer-attributed Volt Cyclone. A native-validator disagreement is evidence of engine incompatibility, **not itself proof that the paper action was illegal**. The boundary is versioned **`agent41-unified-paper-prompt-contract-portfolio-v3-independent-membership`** and preserves the live-only per-trial denominator correction introduced in v2.

Three new pure tests cover (1) a foreign physical deck card that the native validator approves, (2) valid physical own-deck selection whose native validator rejects, and (3) physically valid Volt Cyclone transfer whose native validator rejects. All pass with the earlier pure tests. The latest [manual CI 41332483173](https://github.com/FlareZ123/experiment-01/actions/runs/41332483173) passed **115/115 pure tests**; its later historical v2 source check still refused a current source hash different from the frozen original baseline. The full native 32-arm paper portfolio remains unexecuted and competitive qualification remains zero.


## 17:42 UTC redacted physical choice geometry for four missing interactive prompt families

Agent17's immutable original v2 portfolio documented **146 interactive live-root prompts with no common typed selected-response receipt**: 69 `ChoosePokemonPrompt`, 54 `ChoosePrizePrompt`, 21 `SelectPrompt`, and 2 `OrderCardsPrompt`. These are 72 original source-seat and 74 candidate-seat roots, across the genuine 4,331-prompt denominator. That **historic archive is unchanged**; this subsequent observer is **prospective and default-off**, so there is currently no new native original-field selection evidence.

The [common Store boundary](../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs) now includes an opt-in-live-only, **privacy-redacted `physicalPromptChoiceMetadata`** for those four families. It checks (1) physically occupied in-play Active/Bench Pokémon list identity, prompt-declared side and allowed slots, count and unique selections; (2) physically owned or requested opponent Prize **list identity**, blocked positions, count and distinct selections; (3) submitted native option index against actually offered values; (4) a complete nonrepeating integer permutation across the native card-list length. An allowed null/cancel reply receives an explicit allowance witness. These are checks against **native-declared prompt geometry**, not full independent printed-card text.

The receipt records only `family`, `selectedCount`, `nativeDeclaredGeometry`, a bounded category reason, and two explicit no-certification/privacy flags. It exports **no selected Pokémon or Prize identity, no private option text or chosen index, no physical hidden card ordering and no hidden card names**. A selection outside the native declared geometry is recorded as an observation and remains `PAPER_PROMPT_UNVERIFIED`, preserving the genuine native action for forensic comparison rather than incorrectly declaring printed-card illegality. Geometry is computed only on the per-trial **live Store**, with auxiliary cloned Stores excluded.

Three additional pure regressions exercise valid/invalid physically identified Pokémon targets, Prizes, offered option indices and hidden OrderCards permutations, plus actual original Store audit classification and no-effect acceptance. [Manual CI 41332829343](https://github.com/FlareZ123/experiment-01/actions/runs/41332829343) passed **118/118 pure tests** and then refused the unchanged frozen-v2 code-hash mismatch. This is a **prospective recording capability**. Exactly **zero** original-source prompt choices have been newly recorded in genuine native runs with v4, and **zero** games or complete printed-choice effects have become paper qualified. The common root-ordinal join remains open and the 32-arm native audit dispatch remains blocked.



## 21:55 UTC paper-fidelity status update: independent native counterexamples

Later native Store work by Agent4 and Agent46 supersedes a permissive reading
of the earlier v4 prompt portfolio without changing any old frozen baseline.
The observations below were **genuine staged native Store interactions**,
never original random source-dealt tournament games.

**Original exact rank31 source printing, invalid Roxie payment:** The exact
rank31 60 contains Roxie CEC205 (4), Tapu Lele-GX GRI60 (1), Gengar &
Mimikyu-GX TEU53 (1), Koffing CEC76 (3), Radiant Alakazam SIT59 (1).
Agent4's [both-seat real prompt test](agent4-rank31-roxie-illegal-gx-native-original-20261101.md)
passed [manual compiled CI 41353395812](https://github.com/FlareZ123/experiment-01/actions/runs/41353395812):
the native Roxie `ChooseCardsPrompt.validate([Tapu Lele-GX])` correctly
returned **false**, but genuine original `Store.dispatch` still accepted
and settled that *paper-illegal* GX discard and drew three actual cards in
**both physical seats**. A separate reversible
[owner-payment guard](../../simulation/twinleaf/agent4-roxie-paper-payment-hook.cjs)
passed the already recorded [CI 41354079057](https://github.com/FlareZ123/experiment-01/actions/runs/41354079057):
both-seat invalid GX response is rejected before mutation, while legal
Koffing payment still resolves. The native reducer's independent missing
`DiscardCardsEffect.type` compatibility correction applied to both arms.
The paper D-05 **nonzero payment** rule is separately under review and is
not certified from the GX test.

**Original exact rank31 source, two-source Painful Spoons:** Agent4's
[physical Roxie → Koffing → Radiant Alakazam native triad](agent4-original-rank31-roxie-koffing-alakazam-triad-native-20261101.md)
passed [CI 41352531300](https://github.com/FlareZ123/experiment-01/actions/runs/41352531300).
With actual Koffing Blow-Away Bomb damage counters, the original Store
accepted one Alakazam move from **two separate opponent source Pokémon**
despite printed *from one Pokémon*, creating a victim KO and **two actual
Prize cards**. A reversible single-source paper guard rejected that same
reply with zero Prizes, preserving the victim. This is an impactful staged
semantic divergence on an authenticated original rank31 source 60. It does
not measure whether the original played that turn in its actual tournament
matches. There was also a separate native prompt validator/Store mismatch
for a legal Koffing discard depending on hand order.

**Independent non-field printed optional-damage budget:** Agent46's
[both-seat Froslass UNM native test](../twinleaf/agent46-optional-damage-budget-paper-guard-20261101.md)
passed [CI 41352642800](https://github.com/FlareZ123/experiment-01/actions/runs/41352642800).
An optional native `PutDamagePrompt` accepted **80** own damage where
the printed maximum was **70**, producing a printed-invalid **160**
opponent attack damage and an actual follow-up Prize prompt. The
research-owned reversible guard rejects that over-budget choice before
damage. Froslass, Banette and Walking Wake named in this check do
not appear in the 29 original source 60s; this remains a **general
paper-policy** engine defect, with a different direct relevance level
from the rank31 original printing.

**Unified common portfolio:** Agent46 subsequently developed an optional
partial-damage-budget negative in the shared
[`agent41-paper-prompt-contract-portfolio.cjs`](../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs)
and advanced its audit schema to **v6**. The modification and a new
associated regression exist, but their combined compiled native CI outcome
must be separately checked; do not apply the old v4 archived source hash
to the changed v6 code. No shared 32-arm native paper portfolio has
been requalified. A native `validate` success/failure is **not** proof of
paper-faithful accepted Store effects.

**Release policy:** require owner-visible, original-printed Roxie payment
filter and Alakazam single-source physical movement checks for rank31,
including both seats, genuine next actions, all fail/cap receipts and
complete prompt closure. Keep the zero-prize staged guard outcome separate
from completed legal-turn evidence. The new v6 damage limit is a necessary
negative veto, not positive paper certification of every passing prompt.

The field remains **29/32 original exact 60s and 0 competitively
qualified games**.


## 22:07 UTC: original Ultra Ball two-payment bypass affects 14 original sixties

Agent4 independently preregistered and passed
[compiled native CI 41354915711](https://github.com/FlareZ123/experiment-01/actions/runs/41354915711)
for actual original **rank14 Ultra Ball MEG131** with both physical
Store seats. The native `PlayCardAction` creates an explicit
`ChooseCardsPrompt` requiring **exactly two discarded cards**, and
`prompt.validate([])` correctly returns **false**. Nonetheless
original `Store.dispatch(ResolvePromptAction([]))` accepts the
**zero-payment** response, opens the real search, retrieves a genuine
Regidrago V SIT into hand, and resolves the native ShowCards and
ShuffleDeck prompts. The two Basic Energy cards eligible to pay remain
untouched in hand. The engine has completed a **paper-forbidden free
Pokémon search**, without an exception. See the exact
[original rank14 print report](agent4-original-rank14-ultraball-free-search-native-20261101.md).

The exact 29-opponent field lists contain **14 separate original
60s with this printed Ultra Ball MEG131**: ranks
**4, 5, 8, 9, 12, 14, 16, 18, 20, 21, 22, 27, 30, 32**.
This is card-copy exposure *potential*; source players were not
observed deliberately submitting empty payments in real random games.
It is broader release relevance than the single rank31 Roxie original
printing bug.

A generic native `prompt.validate` call is insufficient as the sole
paper oracle because another demonstrated original rank31 Roxie
hand-order branch falsely rejects a **paper-valid Koffing**, while
separately accepting **paper-illegal GX payment**. The common
release boundary needs independent source-stamped **mandatory-count
and owner-physical card membership** checks plus source-specific
exclusion logic; source read-only audits should expose rejected,
accepted and native-advanced prompt states. Never globally replace
printed legality with a single native `validate` Boolean without
testing the actual Store dispatch. A real two-seat common-bot release
test should include positive legal two-payment Ultra Ball, illegal
zero/one-payment negative, a source-original follow-up Pokémon search
and unchanged opponent response.

**This is a prepared native Store counterexample, not a source-dealt
match or win. Field remains 29/32 originals, zero qualified games.**
