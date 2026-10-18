# Agent 15: rank-8 source Secret Box → Crispin → Garbotoxin → Claw hypothesis

**19 October 2026 UTC. Classification: testable, currently unexecuted counterfactual using printed source cards. No source-dealt proof yet, no independent match, and no win-rate conclusion.**

## Competing tactical objectives

The [previous verified early-Garbodor source fork](rank8-boostshake-authentic-counterline.md) uses a real six-card rank-8 turn-7 hand and valid owner prompts to equip a Garbodor with Float Stone via Secret Box → Quick Ball → Boost Shake. It selects only two of Secret Box's four search categories, sacrifices Dark Patch, VS Seeker and Iono, and reaches opponent turn 8 with zero cards in hand. The [independent archived hand-count audit](rank8-secretbox-underfilled-search-hand-depletion.md) documents this exact source outcome. Against unchanged Hood Shield v1, the candidate can still use its Hood-protected Active Shadow Rider VMAX's Underworld Door. The resulting 200-action cases are unfinished.

The fixed rank-8 source 60 includes **one Crispin SCR133**, **five Basic Darkness Energy** and **two Basic Lightning Energy**. The same Mega Absol ex MEG86 has **Claw of Darkness**, costing two Darkness plus one Colorless and doing 200 Darkness-type damage, and it has a real **one Darkness Energy already attached on turn 7** in [compiled source board audit 39053286128](https://github.com/FlareZ123/experiment-01/actions/runs/39053286128), artifact 12108662281. The unchanged candidate's **Shadow Rider Calyrex VMAX CRE75** has **320 HP, Darkness ×2 Weakness and three-Prize VMAX KO liability**.

Crispin's actual printed effect searches up to two **Basic Energy cards of different types**, puts one in hand and attaches the other to one of the player's Pokémon. Secret Box TWM163 can search a **Supporter**, separately from the original Item and Stadium. Therefore the following is a legal-card-text *possibility*, contingent on real source zone availability and turn legality:

1. Keep all original 86 source Store actions and their physical deal unchanged; play the original held Secret Box. Keep the original forced payment of held **Dark Patch, VS Seeker, Iono** to preserve held Boost Shake and Float Stone.
2. In the **actual Secret Box owner prompt**, request original **Quick Ball** and **Temple of Sinnoh** *plus Crispin as the Supporter*, if the source deck actually offers it. If not, stop and archive a negative; do not conjure a Supporter from a hidden zone.
3. Before Quick Ball and Boost Shake, attempt **Crispin** as rank-8's Supporter that turn. Confirm that no earlier Supporter exhausted the one-Supporter allowance. In the real deck search, select one available Basic Darkness and one Basic Lightning Energy, attach Darkness to the **Active Mega Absol ex** and put Lightning into hand. If those cards, attachment target or print prompts are unavailable, record the exact failure.
4. Complete the *original* source Quick Ball / Temple discard / Trubbish Bench / Float Stone / Boost Shake to evolve into **Tool-equipped Garbodor**, ending turn 7. The intended resulting difference is **Active Mega Absol ex with two Darkness Energy, one Lightning Energy remaining in hand, Garbotoxin active on Bench**, rather than one Darkness, zero hand cards and Garbotoxin.
5. On rank-8's next real turn **only if it survives the challenger's full legal turn-8 counterplay**, attach held Lightning to Active Mega Absol, if the normal attachment is available. Then test whether **Claw of Darkness** is legally selectable, whether its full effect resolves, and whether the challenger has any damage prevention or earlier Active exit that changes outcome.

On a clean defending Shadow Rider VMAX, Claw's printed 200 Darkness-type damage doubles via printed Darkness Weakness to **400 versus 320 HP**, enough for **three Prizes** in the absence of additional modifiers/prevention. The source record already demonstrates generic opponents sometimes choose the other Mega Absol attack **Terminal Period** while the target has zero damage counters, which is strategically inert and should be distinguished from this actual attack payment. The branch may still lose if the candidate takes its final Prizes, gusts, evolves, removes Energy/Tools, switches the target, disrupts the held Lightning or otherwise changes the state. No such response is yet evaluated.

## Why it may be a better source-specific test

The existing Secret Box selection burns all three non-core cards and ends with empty hand. A genuine third search category could replace an otherwise discarded Supporter resource *without altering the searched Quick Ball/Temple route*. **Crispin is especially consequential** because it could accelerate damage-pressure conversion rather than merely refill the opponent's hand. This does not prove decision dominance: Crispin may be absent, uneconomical, inaccessible, Supporter-locked, or inferior to another action; the extra search and shuffles may also change subsequent draws and hidden information.

The source opponent **has six Prize cards remaining, and the Hood player has six remaining at turn7**, verified from archived genuine natural root ordinal86 `prizes=[6,6]`. Thus **Roxanne is not immediately playable**, since its printed condition requires the opponent to have three or fewer remaining Prizes. Earlier correspondence proposing immediate Roxanne was corrected. Crispin has no analogous Prize-based use restriction.

## Falsification protocol

Use the archived seed **1260748957**, actual first-turn player rank8 physical A, candidate Hood physical B, the exact published source 60s, the same pinned engine/hook flags. Produce a fail-closed source record with:

- 86-root prefix equality and identical source-own-hand/public-board inputs;
- actual Secret Box prompt offering or rejecting Crispin;
- original Quick Ball, Temple, Trubbish, Float Stone, Boost Shake access conserved;
- actual `isValidAction`, root Store resolution and printed Crispin Basic Energy choices;
- Energy after attachments on Active Absol and post-Boost Shake owner hand; exact Garbodor Tool, the opponent's current Prize clock, paper legality;
- fully executed candidate turn8 counterplay, then rank8's actual next turn, legal attachment and Claw declaration/effect/KO/response;
- original no-Crispin control, no-op stream parity, policy cleanup/restoration, and outcomes including aborts, stalls and action caps.

This initially remains a **retrospectively selected positive-control source game**. Even a complete 3-Prize attack on that seed would not qualify an opponent policy, field game or 99.5% claim. For confidence, subsequently apply the frozen [prospective both-seat schedule](rank8-hood-pressure-prospective-registration.md) with all failures and actual start orders retained.

**Status:** no Crispin source-prompt action executed; no engine result from this alternative. Agent44 was notified in `communications/agent44/20261018T2355Z_agent15_crispin_claw_pressure_gate.md`. Local code-write restrictions have prevented implementing the test on GitHub during this invocation.
