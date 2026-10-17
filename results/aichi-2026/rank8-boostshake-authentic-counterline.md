# Rank-8 authentic early Garbotoxin counterline

**Agent 1, 17 October 2026 UTC.** Source rank 8 (Yusuke Kobayashi, Absol/Garbodor) versus the frozen Hood Shield v1 challenger, physical challenger B playing second. This is a source-dealt, deliberately chosen counterfactual, **not competitive win-rate evidence**.

## Real predecision resources

On seeded physical game `1260748957`, the root Store stream begins with the exact same **86 predecision actions** as the original rank-8 source pilot. At turn 7, just before the opponent's natural Float Stone/Iono sequence, their actual hand contains Boost Shake EVS, Dark Patch ASR, VS Seeker PHF, Iono PAL, Secret Box TWM, Float Stone BKT. Active is Mega Absol ex with Float Stone. Four of eight current Bench slots are occupied by Budew, Crobat V, Squawkabilly ex and Tapu Lele-GX; one more Pokémon can enter immediately.

The original unmodified play attached Float Stone to Lele and played Iono. Its Iono redraw reveals Quick Ball, Temple of Sinnoh, Trubbish and Garbodor as accessible deck cards before that hand reset. The actual fixed deal also has them available during the fork's searches, as checked by real Store prompt validation. No future draws, sorted deck order or hidden Prize contents are needed by the proposed search sequence.

## Source-dealt alternative, resolved by real Store actions and prompts

1. Play held **Secret Box**, discard Dark Patch, VS Seeker and Iono, then take Quick Ball (Item) and Temple of Sinnoh (Stadium), searching permitted restricted categories.
2. Play Quick Ball, discard searched Temple, search **Trubbish** and place it into the fifth occupied Bench position.
3. Attach held **Float Stone** to that Trubbish.
4. Play held **Boost Shake**, search **Garbodor LTR 68** and evolve newly Benched Trubbish immediately. Boost Shake ends the turn.

The given card texts permit each interaction: Secret Box pays three; Quick Ball pays one; Boost Shake explicitly allows newly played Pokémon to evolve and ends the turn; Garbodor's Garbotoxin works while equipped with a Pokémon Tool. The source's `Secret Box`, `Quick Ball` and `Boost Shake` prompts accepted the specified references and the final physical board had Garbodor + Float Stone **before challenger turn 8**.

[Compiled pinned GitHub Actions run 39079577151](https://github.com/FlareZ123/experiment-01/actions/runs/39079577151) passed with source rank8 printed 60 and frozen Hood printed 60, engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Artifact 12118037610](https://github.com/FlareZ123/experiment-01/actions/runs/39079577151/artifacts/12118037610) archives choices and board. At a 200-action cap the original policy had Prizes [6,1] while the forced fork had [6,6]; the generic challenger selected **PassTurn** on turn 8. Neither cap is a match outcome or a strength estimate.

## Strategic cautions

The fork spends the ACE SPEC, three other cards and the Supporter Iono. It loses the source player's immediate Iono disruption and may leave the opponent to respond with **Field Blower**. The original Iono itself refilled the challenger's hand, including an Arven line that accessed Field Blower; that refreshed hand cannot be assumed available after the no-Iono fork. Assess the candidate's actual post-fork hand before postulating its counterplay.

A deliberate superior opponent action can falsify the credibility of the generic-bot response. It does **not** establish an optimal opponent policy or an independently qualified challenger loss. Store's speculative cloning, information-set fairness, Tool-lock interaction and full terminal validation remain open.

The same core Secret Box + Boost Shake + Quick Ball + Garbodor package appears in published Absol/Garbodor ranks **8, 11 and 16**, although the analogous source-dealt line has been proven only for rank 8. Rank 22 has no Boost Shake. See `simulation/twinleaf/rank8-boostshake-source-fork.cjs` and `rank8-boostshake-source-run.cjs`. A follow-up rerun removes pre-search hidden deck/prize observation from the override and adds the genuine turn-8 hand for response analysis.
