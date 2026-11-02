# Original rank11 versus rank1: Radiant Eternatus VMAX count, post-lock reply, and observation-horizon reversal

**Agent 1 | 2 November 2026 | retrospective original-60 native Store line | 0 competitively qualified games**

## Question

When the original rank1 Yasunori Kato Shadow Rider faces the original rank11 Wataru Yano Absol/Garbodor, the rank1 owner can genuinely play **Field Blower**, then **Quick Ball** to find **Radiant Eternatus**, then put that Basic on Bench and accept the triggered **Climactic Gate** prompt to place up to two VMAX. Do the actual VMAX choices convert into useful attacking lines after rank11 has an opportunity to restore Garbotoxin? How sensitive is a conclusion to a short simulator action cap?

The earlier [source-locked original owner K1 study](agent1-rank11-postblower-radiant-own-k1-native-20261101.md) established exact own-deck search, native trigger, and two real VMAX placements at the first source turn3 root. It stopped short of post-setup gameplay consequences. This report follows the *same physically original source deal* further, and adds a separately registered fourth arm choosing **one** VMAX instead of two. The extra count choice is legal under Radiant Eternatus's printed **up to 2** wording, and is accepted by the native `CHOOSE_CARD_TO_PUT_ONTO_BENCH` validator with native maximum 2.

### Fixed evidence identity

- Full printed decks: source [rank11 Wataru Yano Absol/Garbodor](original-printed60-admission-v1.json) as physical seat **0** first, recipient [rank1 Yasunori Kato Shadow Rider](benchmark-shadow-rider.md) as physical seat **1** second. All four arms keep these 60-card identities unchanged.
- Frozen retrospectively selected K0 source deal index **299**, game seed **2387754768**. Genuine source first-turn hand SHA256 `5692184381aca7a6f772a8a840e59d14f9b9bca642a3f3bb516776b06b8567cf`, six-original frame [registered separately](registrations/agent32-rank11-six-k0-star-vip-native-20261030.json).
- **Independent full *both-player* physical-deal fingerprint**, including pre-action own zones and all initial cards: `ad5aa3b88bc0e39e0fedd902990b76f7526953b4ff356d08ed43ebe48082ba76` in **all 4/4 arms**, checked in executable assertions. It is observational and unavailable to bot choices.
- Pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All game actions pass genuine Store and pending native prompt validation. No vendor changes.
- The **source first-turn exact 11-action K0 Oranguru/Forest Seal Stone/Star Alchemy/StarVIP/Trubbish/Float Stone/Boost Shake setup** is conditionally approved by an experimental callback in each arm. Original native owner selection is physical and legit for this positive opportunity, but it is an *experimentally privileged, retrospectively selected successful source setup*.
- Rank1's own held Field Blower is genuinely played on turn2, removing rank11 Garbodor's Float Stone; rank1 then plays its genuine Quick Ball. Rank11's original generic policy uses **Back Order and Float Stone on turn3**, restoring Garbotoxin in all four arms. In particular, a successful T2 Climactic Gate **ends the rank1 turn**, so the new VMAX do not automatically receive a further same-turn chance to use Underworld Door after entering the board.

### Native experimental arms

| Original rank1 turn2 choice | Public VMAX at source first T3 root | Native engine terminal by 350 actions | Terminal action / global turn | Source / recipient remaining Prizes |
| --- | ---: | --- | --- | --- |
| Original generic Quick Ball selection **Dialga-GX**, no Radiant | 0 | Rank1 Shadow Rider | 199 / T28 | `[4,0]` |
| Quick Ball selects **Radiant**, generic bot declines its optional Climactic Gate | 0 | **Rank11 Absol/Garbodor** | 215 / T30 | `[0,4]` |
| Quick Ball selects Radiant, accept Climactic Gate, **2 VMAX** chosen in genuine own-deck prompt | 2 | Rank1 Shadow Rider | **283 / T46** | `[1,0]` |
| Same native Radiant line with **1 VMAX** chosen, leaving the second unselected in the owner's deck | 1 | Rank1 Shadow Rider | **195 / T30** | `[3,0]` |

All four reached actual native engine terminals without a Store exception, a prompt invalidation, or an action-limit censor at 350. **Zero** terminal qualifies as a real competitive tournament game result.

Distinct real attacking channels explain why looking at VMAX setup alone misses the important difference:

- With **two** early VMAX, rank11's Oranguru V declares twelve native `Psychic` attacks between turns7 and29; at action200 rank11 has only one Prize remaining and rank1 has all six. Rank1 later gets its **first attack only on T36**, then executes **six Max Geist attacks T36–T46**, with the final native win at T46. This is a visible late recovery rather than an initial setup-to-attack conversion.
- With **one** early VMAX, rank1 reaches an attack using **Latias ex Eon Blade at T18**, followed by Eon Blade at T22, T26 and T30. That arm resolves at action195, **88 fewer actions / 16 fewer global turns than the two-VMAX arm**. A freed Bench slot and altered access to Latias are plausible contributors. The code does not isolate Bench capacity from other downstream path changes, draw order, bot decisions, or the extra VMAX's later utility. The observed alternative attack line is a concrete native witness, **not a proof that one VMAX is generally optimal**.
- In the original generic arm, rank1 also eventually reaches Latias ex and uses Eon Blade at T20, T24 and T28, winning at action199. In the Radiant-but-declined arm, source instead uses Crobat V Venomous Fang during turns19–29 and wins natively at action215.

### Action-horizon confound

An earlier replay of the first three arms stopped at **200 actions** under identical physical setup and early native policy. At that cutoff, arm two (Radiant declined) was **censored** with remaining Prizes `[3,4]`; arm three (two VMAX) was also **censored** with `[1,6]`, rank1 on zero Prize progress. A convenient scoring heuristic based on the 200-root Prize lead would have treated the two-VMAX arm as a source-favored result. The 350-root actual Store continuation instead resolves it **in rank1's favor**, after 283 actions and at turn46. The clock-free game-resolution horizon changes the tactical narrative. It also illustrates why **CENSORED is its own category**, not a win or loss.

### Provenance and reproduction

- [Original 200-root native observational run 41415466251](https://github.com/FlareZ123/experiment-01/actions/runs/41415466251), [JSON artifact 13127421800](https://github.com/FlareZ123/experiment-01/actions/runs/41415466251/artifacts/13127421800), CI ZIP SHA256 `5166e7aaf6096ffd059401509bd94869378dcdef969c00a8a9d07c1db09506b7`, frozen execution commit `ef9614f87548401f4bc579abf86256fdeb8d99e3`.
- [Registered 350-root three-arm run 41416017630](https://github.com/FlareZ123/experiment-01/actions/runs/41416017630), [JSON artifact 13127437497](https://github.com/FlareZ123/experiment-01/actions/runs/41416017630/artifacts/13127437497), CI ZIP SHA256 `a24c97fbf9fe4e6af6b64799360a5eccc3e566d9d986569edd41b70aa58bebef`, execution commit `8f14ac1f52b176e098cfd49290fb925f73a3a464`, [pre-run horizon registration](registrations/agent1-rank11-postgate-350-retrospective-20261102.json).
- [Registered four-arm one-VMAX follow-up 41416500514](https://github.com/FlareZ123/experiment-01/actions/runs/41416500514), [JSON artifact 13127552861](https://github.com/FlareZ123/experiment-01/actions/runs/41416500514/artifacts/13127552861), ZIP SHA256 `01ea7513c6561b587c950572d4a812b7a3e2b29b879d6e798fbfc69bc84208fe`, frozen execution commit `b029d990ff652fa3d3525134380fe5e6c4df8187`, [count choice registration](registrations/agent1-rank11-radiant-one-vmax-native-20261102.json).
- Replay scripts are on deliberately frozen forensic branches [350 continuation](https://github.com/FlareZ123/experiment-01/tree/agent1-radiant-postreply-audit-20261102) and [one-VMAX count](https://github.com/FlareZ123/experiment-01/tree/agent1-radiant-one-vmax-20261102), in `simulation/evaluation/agent1-rank11-postblower-radiant-owner-k1-pair.cjs`. The one-VMAX branch adds a default-preserving bounded `radiantVmaxTargetCount:1` owner-search selection to `simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs`; without that option the previous default stays 2. The CI is manual `workflow_dispatch`; no automatic push workflow.

## Actual Aichi May 2026 Open knockout time-out rules

This event rule was already independently documented and implemented by [Agent 41](official-2026-open-clock-swiss-vs-top32-20261029.md) and [Agent 5](agent5-official-aichi-may26-clock-and-terminals-20261031.md); this report supplies a **new native scenario that makes its consequence concrete**, with no claim of discovering a new event regulation. The official Japanese [Champions League 2026 Aichi May event outline](https://www.pokemon-card.com/info/005445.html), *大会形式：ジュニア／シニア／オープンリーグ*, applies to the **Open League** benchmark. Its **Top-32 single-elimination rounds through semifinals have a 25-minute match limit**, while the final has **35 minutes**. At time called before a game ends, play continues through the player who went **second** finishing their turn. If neither player has won, the official knockout rules use remaining Prize-card counts: if either player has **at most two Prizes left**, the player with **fewer remaining Prizes** wins the tiebreak; ties require an extension. When both have at least three remaining, extension continues until one satisfies the stated two-Prize-lead condition. Swiss rounds handle time differently: after the required end turn, a game without a winner is recorded as a **loss for both**. These are *event-specific tournament rules*, and the engine's `GamePhase.FINISHED` alone does not implement them.

The native **two-VMAX** branch has source/recipient remaining Prizes **`[1,6]`** at 200 actions / global T31, and later reaches the recipient's game-engine win only at global T46. Consequently, a 25-minute knockout time call yielding a completed post-call second-player turn at `[1,6]` would favor **rank11 source** under the published tournament tiebreak, whereas completing the engine game at T46 favors **rank1 recipient**. The experiment has no paper time-per-action trace and cannot determine where the 25-minute call would occur; this is a **conditional opposing-winner example**, not an assertion of the actual paper result. The extra one-VMAX branch's earlier T30 completion makes such timing sensitivity a practical part of target-count evaluation.

Any opponent-field win-rate estimate treating all these native terminals as paper wins assumes away an outcome-changing rule. Treat a result as **CLOCK_UNVERIFIED** until timing and the correct Aichi Open stage's adjudication are included.

## Evidence limits and recommended application

**Do not promote a candidate or claim an empirical win rate from these rows.** They are four policy alternatives on **one** original physical game, which was selected retrospectively as a high-opportunity source opener. Different action choices legitimately change later cards, draws, board decisions, attacks, and game trajectories. The full opponent strategy remains an unqualified generic/conditional bot. Source turn-one plan intentionally forces a known feasible combo. Native Store terminal correctness still needs printed effect, payment, randomness, attacker policy, owner-hidden-information and **25-minute paper match clock** assessment. A T46 engine win does not establish a tournament win before time. Source-only replay and paper format limitations apply.

A useful general policy-engineering lesson is that the quantity selected by an optional multi-Bench Ability is itself a discrete decision. An optimizer should compare one and two VMAX against **actual available later attackers, Bench needs, Ability-lock restoration, Supporter/Item opportunity costs and clock-aware completion**. A successful native search and full early Bench can be a strategically awkward line. Target this decision through owner-safe and replayable common two-seat policies, with prospective fresh seeds before any deck-strength comparison.

**Field-wide certification remains at 29/32 authenticated original 60s, zero competitively qualified simulated games, no selected 99.5% fixed-deck winner.**
