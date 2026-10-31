# Agent44: actual pinned Store successfully resolves Secret Box Item -> Boost Shake -> equipped Garbodor

**30 October 2026 | Native semantics experiment, retrospective synthetic deal. No original source-deal outcome, win-rate inference or competitive-qualified game.**

## Question and controlled source fixture

The [prize-aware first-draw resource model](../statistics/agent44-rank8-secretbox-firstturn-connectivity-20261030.md) identified a previously untested line in the **exact registered rank8 Yusuke Kobayashi Absol/Garbodor 60**: the singleton Secret Box can select **Boost Shake** as its Item category, plus a compatible Tool, rather than requiring the sole Boost Shake to already be in hand. Can the **real pinned Twinleaf Store** resolve the actual printed Secret Box and Shake chain, including the Item-search prompt, legal card discard, Basic search, Bench, Tool attachment and immediate first-turn evolution?

The [native experiment adapter](../../simulation/twinleaf/agent44-rank8-box-fetch-shake-native.cjs) starts from the already documented historical source-ranked rank8 versus Hood Shadow Rider deal, seed **1260748957**. That original has a known rank8 turn-seven physical hand with singleton Boost Shake held but another Quick Ball in its deck. It preserves the original first **86** Store actions before the changed branch, then **explicitly swaps the physical singleton Boost Shake in the owner's hand with a physically present Quick Ball from its own deck**. All cards remain in the same player's hand/deck union; the sixty-card multiset remains conserved. This is a researcher's artificial pre-action exchange performed outside any legal turn action, and **the resulting physical deal is deliberately different from the original published game**. It establishes no natural sampling frequency.

The test then drives genuine printed-card native Store actions via a temporary reversible bot hook:

1. Play the actual held **Secret Box**. Resolve its three-card discard by selecting actual held **Dark Patch**, **VS Seeker**, and **Iono** through the original native prompt.
2. On the native owner-deck composite Item/Stadium search, obtain the physical **Boost Shake** and **Temple of Sinnoh** from the actual deck. Each original native prompt's `validate()` must accept the physical objects before dispatch.
3. Play the newly held **Quick Ball**, discard the newly searched Temple of Sinnoh, choose the actual available **Trubbish** in a native search, then Bench that Pokémon into an actual open slot.
4. Attach the previously held **Float Stone** to that Trubbish; play **Boost Shake**, choose the actual native **Garbodor** Evolution from the deck, and resolve the genuine evolution-target prompt.
5. Observe the subsequent opponent-turn state, assert that the Bench has a **Garbodor with Float Stone**, confirm the original unmodified action prefix is identical up to the declared exchange, and run another unmodified control after the adapter to prove reversible bot-hook restoration.

The fixture's exact scripted branch selects Item and Stadium while retaining other available category choices. It validates the specific Item -> Shake outcome; it does not establish that the chosen Stadium is optimal or that every available four-category Box selection would execute.

## Executed CI and result

[Manual pinned native CI run 41146234215](https://github.com/FlareZ123/experiment-01/actions/runs/41146234215) **completed SUCCESS** at checkout commit `68fbfbb4099912148669c956b8e9321918719fb5` on 30 October 2026 at 23:47 UTC. The real pinned Twinleaf server was installed and compiled in the existing Hood-interaction workflow. All three newly added steps ran and passed:

- Syntax check for `agent44-rank8-box-fetch-shake-native.cjs`
- **Exercise genuine Store Secret Box Item-to-Shake under declared synthetic rank8 deal**
- Archive the synthetic Store witness with explicit noncompetitive status

The native script's completion requires exactly the post-exchange original Store sequence, the verified equipped Garbodor, a real opponent reply turn, replay equality after hook restoration, and `stage === 11`. Failure at any of these script assertions would have failed the CI step. Machine-readable JSON was archived as [run artifact 13021531280](https://github.com/FlareZ123/experiment-01/actions/runs/41146234215/artifacts/13021531280), SHA-256 artifact digest `eb5b0f2abe4805846bc074e9c3de9bf77723cbd2ae95bacd1532897c0050ec82`.

**Verified scope:** this exact native Item->Shake Tool-Garbodor mechanics sequence is executable *in the modified native Store state*, and the source multiset is conserved. No independent paper-equivalence review, original unaltered source deal, prospective natural trigger, owner decision-policy comparison, unchanged candidate match result, opponent counterplay effectiveness, paper clock or competitive game outcome was established. The displayed CI **success** is a mechanics witness.

## Integrating into a fair both-seat evaluation

Two separate missing common-policy seams were reported to active integrator Agent41 under `communications/agent41/20261030T234600Z_agent44_box_root_and_category_prompt_gaps.md`:

1. The generic actor-root chooser currently has Quick Ball and Mysterious Treasure Item roots, but lacks a **Secret Box** owner-visible PlayCardAction root.
2. Its companion bounded generic owner search selector currently assumes an integer `options.max`, while the actual Secret Box prompt allocates independent Item/Tool/Supporter/Stadium categories. A category-capped bundle selector with real `prompt.validate()` settlement is needed.

The next decisive test should introduce a **default-off, owner-observation-safe** Box root plus prompt selector under the **identical both-seat** policy, using actual six-Prize assignments and all owner hand/Bench/lock states. Compare Box Item allocation to other connector uses and pay the *actual* three-card discard cost; reject the plan if no viable discard. Commit a preregistered natural-deal cohort and retain all no-trigger/abort cases. Follow the opponent's recovery to a terminal legitimate outcome before any performance claim.

**Benchmark remains 29/32 authenticated original opposing sixties (ranks 23, 25 and 28 missing), zero competitively qualified games, no demonstrated fixed deck attaining 99.5%.**


## Stronger simultaneous Item + Tool search confirmation (23:56 UTC)

After the first native-only Item-fetch proof, the reusable fixture was extended with a **second, independently declared synthetic exchange** in the *same historical source rank8 turn-seven state*: besides moving held Shake into the deck in exchange for Quick Ball, it moves the held Float Stone into that deck and exchanges a physically present Darkness/Lightning Energy from that same deck into the source hand. Hand/deck combined original-card multiset remains unchanged. This artificially forces the required Tool to come through Secret Box's **Tool category** rather than relying on an already held Tool.

The native action sequence now resolves an authentic multi-category **Secret Box selection of Boost Shake (Item) + Float Stone (Tool) + Temple of Sinnoh (Stadium)**, native Quick Ball and Bench actions, Float Stone attachment, native Boost Shake evolution, and the opponent's next decision with a Tool-attached Garbodor. The scripted test requires the 86-Store-action pre-intervention source prefix to match the unmodified control and verifies native bot-hook restoration. As in the initial variant, the researcher's hand/deck swaps are performed outside a legal action and this state **cannot be credited as an unchanged natural source deal**.

The additional native-compiled [run 41146983964](https://github.com/FlareZ123/experiment-01/actions/runs/41146983964) completed **SUCCESS** at pinned checkout commit `21eb05d9d12bb7c8f9d806caadeb41a3e25a7c97` (30 October 2026 at 23:56 UTC). Its syntax, true Store Item-to-Shake event and archived witness steps all individually passed. The second script branch explicitly asserts both swapped source cards, `stage === 11`, Tool-Garbodor actually in play, native Store prefix parity, and restored unmodified replay. The companion source-hand union model is unaffected.

**The new narrower finding is a real pinned Store mechanics witness for Secret Box fetching Item and Tool in one native search**, under researcher-chosen synthetic deal constraints. This is stronger than simply observing the two search categories separately, but it establishes no card availability under a naturally dealt original opening, opponent tactical impact, or game-win rate.

### Timing and scope refinement

The native fixture's deliberately selected state is **global game turn seven**, after the rank-8 source player has already had earlier turns. The accepted Shake line verifies that the pinned Store permits immediate evolution **on the same turn the Trubbish was placed**, with Box Item/Tool search and end-turn settlement. It does **not** directly validate the first player's first-turn restriction exception in this specific fixture; that separate paper-rule exception follows printed Boost Shake text and must be checked in an explicitly first-turn native state if used as a native-test claim. The exact first-seven-plus-draw combinatorics apply to first-turn theoretical resources, but their rates are not inferred from this turn-seven mechanics witness.

### Actual owner-K1 category selector, beyond scripted search (31 October 2026, 00:07 UTC)

A separate [shared, owner-only Secret Box selector](../../simulation/twinleaf/agent44-secretbox-owner-prompt.cjs) now runs **inside the real printed Secret Box search prompt**, before the scripted native resolution in the **two-synthetic-swap** variant. It requires `prompt.cards === owner.deck`, the actual native `prompt.playerId`, four independent search-category caps, actual Shake/Garbodor/Trubbish/Tool availability and Trubbish location, and then calls native `prompt.validate` on the full chosen **Boost Shake (Item) + Float Stone (Tool)** physical object bundle. The fixture requires `ownerK1PromptProof.eligible === true` before it can complete its existing three-category Shake+Float+Temple scripted native choice.

The [manual pinned Store run 41148064602](https://github.com/FlareZ123/experiment-01/actions/runs/41148064602), checkout `81ae7c1c1cc3d17a1e0c35b267e2b0015e2722be`, **completed SUCCESS**. Its native-shaped owner-selector unit tests, syntax check, actual pinned-Store Box -> Shake + Float -> Garbodor result and artifact upload all individually passed. This proves that the reusable selector can accept a genuine owner K1 prompt in that explicitly synthetic search state, in addition to the earlier scripted category acceptance. It still lacks a general K0 owner-root integration, all opponent continuation under competent policies and a naturally dealt source opening. No competitive games were qualified.
