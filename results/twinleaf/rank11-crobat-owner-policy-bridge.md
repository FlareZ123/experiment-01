# Rank-11 Crobat owner-policy bridge: source counterexample

**Agent 35, 19 October 2026.** Research classification: historical, source-dealt pinned-engine positive control and an optional portable source policy. **No competitive games are qualified.**

The earlier [source-specific turn-23 Crobat action fork](rank11-turn23-crobat-stone-terminal-counterfactual.md) established a real finishing sequence omitted by the generic rank-11 Mega Absol/Garbodor bot. The new [owner-visible policy](../../simulation/twinleaf/rank11-crobat-terminal-policy.cjs) replaces the turn/seed-specific trigger with observable opportunity conditions. Dark Patch search targets can be inspected only within the source owner's actual Star Alchemy deck-search prompt.

## Historical pinned Store positive control

[Successful manual CI 39226122841](https://github.com/FlareZ123/experiment-01/actions/runs/39226122841) compiled the pinned submodule, passed the first ten pure tests and executed the complete policy-triggered Store action sequence on historical seed 1111464409. [Archival full packet](https://github.com/FlareZ123/experiment-01/actions/runs/39226122841/artifacts/12173542921).

The source was genuine rank 11 in seat A going first, with fixed New Moon Lockbreaker in seat B going second. Both branches had identical first 219 root-action ordinals. In the unmodified branch the candidate ultimately won on turn 36, with Prizes remaining [2,0]. The automatic source-policy branch retrieved Forest Seal Stone through Shopping Center, equipped Crobat V, used Star Alchemy for Dark Patch, attached Darkness through the accepted prompt, retreated Crobat to Active and declared Venomous Fang. The game ended on turn 23 with **rank-11 source victory** and Prizes [0,1]. The accepted attack and Prize resolution are present in the actual Store's public attack transition observer.

The first manual CI [39225548348](https://github.com/FlareZ123/experiment-01/actions/runs/39225548348) exposed a policy audit bug: it looked for Crobat on the Bench after the valid retreat promoted it to Active. The engine still executed the winning attack through its ordinary bot. Commit [ae7eed6](https://github.com/FlareZ123/experiment-01/commit/ae7eed6b26437319400b4c809a7b9ffeebb9e1f0) fixed the audit so that the second CI records the complete deliberate action chain.

## Extended owner-resource classifier

The v2 [implementation](../../simulation/twinleaf/rank11-crobat-terminal-policy.cjs) addresses both frozen candidate archetypes with known public three-Prize targets: Mewtwo & Mew-GX, Shadow Rider Calyrex VMAX, Trevenant & Dusknoir-GX and Gengar & Mimikyu-GX. A conservative 70-damage lethal threshold avoids assuming Darkness Weakness applies. Routes include an already-active powered Crobat, a powered Benched Crobat, a held Dark Patch, an existing Stone on Crobat, a Stone held in hand, and a Stone transferred from another source Pokémon with Shopping Center. The source's own Garbotoxin can block the Forest Seal Stone route. Its genuine Search prompt checks legal Dark Patch presence.

The [17 pure regression tests](../../tests/rank11-crobat-terminal-policy.test.cjs) passed locally. They cover each route and owner-only classification, including an explicit test that throws if the classifier attempts to read the unsearched source deck.

## Strict limits and handoff

This seed was already known before the policy was authored. The historical outcome reversal demonstrates a real weakness in the original opponent decision policy, with **zero prospective game results**. The other route modes have pure-state tests but still require genuine Store confirmation; the original generic bot, effect coverage, match clock and Japanese physical print validation remain unqualified.

For future bilateral comparison, the **same versioned rank-11 source policy** can be applied to both frozen candidate 60s, with a new source-policy fingerprint, genuine held-out deals and explicit no-opportunity logging. Avoid inserting it into a frozen registered cohort after inspecting results. Agent 41 owns integration.

Full exact opponent source coverage remains **29/32** (ranks 23, 25 and 28 missing), and the fixed-deck **99.5% win-rate target remains unproven**.
