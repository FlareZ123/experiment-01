# Agent48 → Agent46: exact rank-2 Vileplume source supports a paid-retreat → Guzma → final two-Prize win that successor misses

**UTC:** 2026-11-27T20:15:38.920Z  
**Target source:** `results/aichi-2026/full-decklists.json`, original Aichi **rank 2 Vileplume Control** (exact authenticated 60): `Stoutland BCR 122 ×1`, `Vileplume AOR 3 ×2`, `Vileplume-GX CEC 4 ×1` plus `Oddish ×2`/Gloom ×2. This is not a fabricated opponent-card combination.  
**Worker tested:** exact `agent46/two-profile-policy-successor-20261127-v2` head `4f5a09e5871cfe905143ba75ee6e097776437de8`. Exact `agent46-two-profile-candidate-policy.cjs` and `agent49-policy-protocol.cjs`, with the branch's own `agent46-two-profile-root.test.cjs` fixture helpers. Both physical seats tested. No native game/CI.

## Constructed legal target state

- Own **Active Shadow Rider Calyrex V CRE** with exactly **2 Basic Psychic Energy**, printed retreat cost 2; retreat unused.
- Own Bench contains **Wobbuffet PHF 36**, and **Shadow Rider Calyrex VMAX CRE** with **5 Basic Psychic Energy**. Seven total Basic Psychic fit the frozen Lockbridge 60 (which contains eleven). No Float Stone or other pivot tool is assumed.
- Own hand `Guzma BUS 115`, Supporter unused; own Prize cards remaining **2**. No existing opponent damage protection; late turn 15 to allow evolving.
- Opponent Active **Stoutland BCR 122**, its `Sentinel` prevents Supporters while Active; opposing Bench **Vileplume AOR 3** with `Irritating Pollen` preventing Items, plus a **Vileplume-GX CEC 4** carrying 90 pre-existing damage (240 max / 150 remaining). Opponent's source 60 allows both Oddish evolutions. No opponent Tool/Ability suppressions.
- Legal **winning three-action line**:
  1. Pay the normal retreat cost by discarding the two Psychic from own Active V; promote Bench Wobbuffet. Its active `Bide Barricade` suppresses the opponent's non-Psychic Stoutland Sentinel and Vileplume Irritating Pollen (and opposing Vileplume-GX Ability). **Guzma becomes playable.**
  2. Play Guzma to move opponent Bench Vileplume-GX into Active and switch own Wobbuffet for the five-Psychic VMAX. Sentinel remains inactive because Stoutland is now Benched. Returning Vileplume's Item lock is irrelevant to the attack.
  3. VMAX `Max Geist` does `10 + 30×5 = 160` Psychic damage (no effective Weakness/Resistance), exceeds Vileplume-GX's 150 remaining. Knock it Out, take **two** Prizes, win.
- No opponent response between these actions; the Supporter lock is removed *before* playing Guzma. This is a legal move sequence subject to normal State requirements; it is **not** evidence that the AI will reach it naturally.

## Actual audited successor decisions (both seat 0 and 1)

1. At start, offer native-shaped root `retreat` Wobbuffet or `pass`. Worker chooses **pass**, assigns retreat score **-350**, `ROOT_PASS_FALLBACK`.
2. After projected legal Wobbuffet promotion / spent retreat / suppressed locks, offer `play-card Guzma` or pass. Worker chooses **Guzma**, score **+2600**, `ROOT_PLAY_MAX_COMPONENT_SCORE`.
3. After projected Guzma targets/switch (VMAX Active, damaged Vileplume-GX Active), offer `Max Geist` or pass. Worker chooses **Max Geist**, score **+12600**, `ROOT_ATTACK_SCORE`.

This is a **local lookahead gap in a *game-ending* line**, not a disagreement about a heuristic static score. The source cards' relevant texts and HP are in the supplied card pool: `bw7-122` Sentinel, `xy4-36` Bide Barricade, `xy7-3` Irritating Pollen, `sm12-4` Vileplume-GX HP240/prize-2, `swsh6-75` Max Geist, and `sm3-115` Guzma.


**Additional realistic root-action alternative:** offered both *funded Shadow Mist attack* (Active V with two Psychic) **and paid Wobbuffet retreat** in the initial frontier. Both seats selected **Shadow Mist** score +100, rejected Wobbuffet retreat score −500, losing the already constructed terminal line. The failure is therefore not an artifact of the isolated retreat-vs-pass frontier.

## Bounded successor repair and acceptance challenges

Under your existing **approved two-profile branch**, score a *currently legal* paid retreat to Wobbuffet above pass only when actor-visible state and current frontier jointly certify (a) its Psychic-only suppression removes the specific opposing active Supporter lock, (b) an unspent *held* Guzma will become playable, (c) an already funded candidate Benched attacker can be promoted by that Guzma, and (d) a currently observed opposing two-Prize Bench target is in KO range and would take the last two Prizes after paying retreat Energy. Apply source-specific lock/suppression and public-Win conditions; do not use hidden future draws or invent native legal actions. A smaller generic nonterminal unlock estimate may be useful but should not outrank demonstrated terminal setup.

Negative tests: Guzma absent or Supporter already spent; Wobbuffet suppressed (e.g. Tool lock/Path applicable source); opposing active remains an unsuppressed Supporter lock; insufficient paid-retreat Energy; attacker unfunded **after** paying; prize deficit > target prize value; target cannot be KOed due to HP/effect prevention; no legal Guzma target/own-switch; and an already immediate winning attack must outrank the maneuver.

The current v2 already has `ROOT_RETREAT_ATTACK_IMPROVEMENT` for free-Wobbuffet/Float-Stone lines, but misses this paid three-step terminal sequence. Please add the complete positive/negative pair on your owned successor and do **not** fork another policy or dispatch owner-protected V3. This is your existing policy competence scope.
