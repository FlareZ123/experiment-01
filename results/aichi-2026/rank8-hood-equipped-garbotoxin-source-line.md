# Rank-8 live Garbotoxin: preserve Field Blower, use Hooded Underworld Door

**Agent 15, 18 October 2026. Evidence class:** selected-action, authentic-source mechanic diagnostic. **Not a competitive win-rate sample.**

## Question and fixed source

Can unchanged **Hood Shield v1**, from its already observed genuine rank-8 opponent first-start / candidate second-start deal, use a Stealthy Hood-equipped Shadow Rider Calyrex VMAX's Underworld Door while Garbodor still carries Float Stone, keeping a genuinely held Field Blower for possible later retooling?

The fixed rank-8 Yusuke Kobayashi published 60 is player A. Hood Shield v1 is player B. Seed is **1260748957**, chosen in the earlier turn-order preflight independently of this hypothesis. The source's turn-7 Secret Box / Boost Shake opponent fork uses held resources and printed Store prompts to equip Garbodor before candidate turn 8. Its 86-action source prefix is retained. See [source authenticity and opponent line](rank8-boostshake-authentic-counterline.md). This is a deliberately chosen decision, not evidence that an autonomous opponent often makes it.

The actual candidate turn-8 hand contains **Night Stretcher, Acerola, Mysterious Treasure, Field Blower, Quick Ball, Battle Compressor**. Its Active VMAX wears Stealthy Hood; a Benched VMAX wears Float Stone. The previous generic policy passed in this state. The selected Field Blower response and the post-Blower Psychic recovery are also implemented in the runner.

## Controlled alternative

The opt-in [Hooded Door source reply](../../simulation/twinleaf/rank8-hooded-door-source-reply.cjs) preserves opposing Garbodor's Float Stone and candidate Field Blower through this prepared line:

1. Play genuine held Battle Compressor; search the actual deck and discard one Basic Psychic Energy through its printed prompt.
2. Play genuine held Night Stretcher, select that Basic Psychic Energy in the real discard pile and return it to hand.
3. Announce Underworld Door from the genuine **Hooded Active VMAX**, attach that Energy to the unhooded Benched VMAX via the Store prompt, and check two cards were drawn.
4. Check opposing Garbodor **still holds Float Stone** and candidate **still holds Field Blower**.

Other actions remain with the existing source policies. The witness verifies effect resolution including actual Energy attachment and draw, rather than merely Ability announcement. A test failure remains adverse data. This manually selected, pre-known positive-source line does not establish autonomous response likelihood. Keeping Field Blower for a hypothetical second Float Stone is a possible tactical benefit, still unproven.

[Rank-8 source runner](../../simulation/twinleaf/rank8-boostshake-source-run.cjs) runs both the Field Blower response and this Hood-preserving alternative from the identical source-dealt turn-8 board. Pure [opportunity-predicate tests](../../tests/rank8-hooded-door-source-reply.test.cjs) cover Hood absence, absent opponent Tool, missing own cards, and misattributed Ability source. The existing [manual-only workflow](../../.github/workflows/aichi-hood-interaction.yml) checks parsing, runs tests, and exercises the pinned engine when the hood_rank8_boostshake_fork input is true.

## Execution

Previous syntax failure: missing closing parenthesis in the GamePhase import of the post-Blower recovery adapter. Agent 15 fixed this at commit **b4132669f54356c3798edc408860dafc43bb7220**. [Compiled manual CI 39100259496](https://github.com/FlareZ123/experiment-01/actions/runs/39100259496) **passed**, including the existing Field Blower and post-Blower recovery assertions.

The new **preserve-Field-Blower / live Garbotoxin** arm **passed** [manual compiled CI 39100521996](https://github.com/FlareZ123/experiment-01/actions/runs/39100521996), head **b267026bfe952c21c0256a08c375878ff7c37737**. [Artifact 12126347615](https://github.com/FlareZ123/experiment-01/actions/runs/39100521996/artifacts/12126347615) contains the exact JSON, SHA-256 **cf99259504d5aecf0134f4c6b0b79989afe4f8050c324aa71756541719cfb21c** (artifact ZIP SHA-256 e79e113fddea40fb8f828fd50c9aaa9d5f29c670ce4a82dcfaeb36181e5f04ee). Four pure predicate tests, parsing checks and the source runner assertions all passed on the pinned engine.

The six selected source turn-8 root actions were: held **Battle Compressor**, its prompted Psychic Energy discard, held **Night Stretcher**, its prompted Energy retrieval, Active **Underworld Door** Ability, and the prompted Energy attachment to Benched VMAX. The source runner's verified witness reported all four critical facts: **opposing Garbodor still equipped with Float Stone**, **Field Blower retained**, **one Psychic attached**, and **two cards drawn**. The authenticated pre-action candidate hand, source Garbodor Tool, and Active Hood appear directly in the archived witness. The unmodified 86-action source prefix and identical predecision board were asserted against the control and other arms. A later generic policy then played a normal Psychic attachment and passed; the manually selected special sequence completed.

At the same 200-root-action cap, the **selected Hood-only arm** and **selected Blower-plus-recovery arm** both showed remaining Prizes **[rank8 6, candidate 1]**. The **Field-Blower-only arm** showed **[6,6]**. These are divergent, intentionally intervened trajectories within an unfinished bounded simulation; they are **not win/loss results**, do not prove a tactical superiority, and must never be counted as independent matches. The narrow positive claim is that, in this actual dealt game state, the protected Ability can be announced and resolved with the real Garbotoxin Tool left in play.


## Autonomous candidate decision-policy extension (18 October)

The initial tactical branch above used a preselected action sequence. A new [candidate response adapter](../../simulation/twinleaf/hood-garbotoxin-recovery-autonomy.cjs) instead evaluates **every own normal decision** for a visible Tool-equipped opposing Garbodor, an Active Hooded Shadow Rider VMAX, an eligible Benched VMAX and the real-hand Battle Compressor, Night Stretcher and Field Blower resources. It then performs the recovery and Underworld Door actions through actual owner-valid printed-card prompts. It contains no fixed turn number, source rank, or seed in the decision rule. Deck-search cards are selected only when exposed by the legitimate owner search prompt; the opponent's private deck and hand are never read. This remains a deliberately narrow response policy.

[Compiled manual CI 39101288838](https://github.com/FlareZ123/experiment-01/actions/runs/39101288838) **passed** at head **fd6e488ff3aba8080c6a77fc9a67a27cc89b4585**, on the unchanged published source and candidate 60s at seed **1260748957**. [Artifact 12126985865](https://github.com/FlareZ123/experiment-01/actions/runs/39101288838/artifacts/12126985865) archived the source run, with inner JSON SHA-256 **4e2e474b72fbef0983f9ec1c4139c6ebbf0037accbc0822c6830b1698ec3d2e1**. The autonomous adapter recorded an own-hand/public-board opportunity on candidate turn 8 and selected the same six action/prompt sequence as the earlier scripted branch. Live Store effect checks returned \`attached=true\`, \`drawnTwo=true\`, \`retainedFieldBlower=true\`, \`garbodorStillEquipped=true\`. The policy finished in state \`done\`, \`triggered=true\`, \`successfulEffect=true\`. Candidate next normal action was to attach Psychic and pass. Source first 86 actions and fixed predecision board were independently asserted identical to the previous original source run.

The rank-8 **opponent opener is still the deliberately selected Secret Box / Boost Shake line**, with no independent proof that its general automated policy would choose that line. The automatic *candidate* policy is conditional and was only positively exercised on this one previously discovered source deal. No random held-out-seed generalization, true attacking continuation, retooling response, or match competitiveness follows. The terminal at 200-action cap was unfinished, with remaining Prizes **[6,1]**. The opportunity condition is heuristic and can be dominated by other resource uses; it is not an optimizer or a complete gameplay policy.

A follow-up noninterference control is now implemented in the source runner: repeat the **unmodified natural source game** both with the conditional policy enabled and with it absent, require that the policy never triggers, compare the complete root action transcript, then replay the original game after all nested policy adapters restore to check the whole transcript again. That added gate was committed after this successful run and must be executed before accepting the no-op/restoration claim.

## Later attack-payment audit (20 October)

A new [source-dealt post-Door attack-availability audit](rank8-hood-postdoor-attack-availability.md) ran successfully in [compiled manual CI 39348225613](https://github.com/FlareZ123/experiment-01/actions/runs/39348225613) on the same rank-8 seed, 86-root prefix and protected Door line. At the subsequent *actual generic Pass* on turn 8, the Active Shadow Rider VMAX held **only one Psychic Energy**, its printed Max Geist requires three Colorless Energy, and a detached native Store rejected that attack announcement. The recovered Psychic was attached to a Benched VMAX as required by Underworld Door. The earlier assumption that the generic pass necessarily skipped a payable Max Geist was therefore not supported in this state. This identifies earlier Energy funding and positioning as an important policy question, without proving that other earlier sequences or attacks were unavailable, and adds no competitive-qualified game.

## Inference boundary

This repeated seed features manually improved opposing and candidate action sequences. Full-game policies remain unqualified; the pinned Twinleaf engine has known mechanics gaps. The result is not an independent sampled win or loss against rank 8.

**Research-wide status:** 29/32 exact published opponents; zero independently qualified competitive games; 99.5% target unproven.
