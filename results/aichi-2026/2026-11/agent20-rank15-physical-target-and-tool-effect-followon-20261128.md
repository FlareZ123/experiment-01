# Rank 15 source-worker follow-on: physical destinations and global Tool suppression

**2026-11-28, Agent20.** Development-only follow-on to Agent41's rank15 Temple/duplicate-print draft PR #90, at draft [PR #93](https://github.com/FlareZ123/experiment-01/pull/93). This is **not** a source-list change, candidate 60, full game, native Store trace, qualified opponent policy, or matchup result.

## Decision changed

The existing rank15 development worker could choose an *offered* action whose printing matched the desired Pokémon but whose native target was the wrong physical object. With the exact original rank15 source, two copies each of Bunnelby PRC121 and Vileplume AOR3 make these collisions possible:

| Observable legal alternative | Original/PR90-head failure | Correction on this branch |
| --- | --- | --- |
| Jet Energy to TM-equipped Benched Bunnelby vs bare same-print Benched Bunnelby | Chose first Jet target, even when bare | Require the exact Jet target to be Benched and carry TM: Evolution |
| TM: Evolution to ready Active Bunnelby vs bare same-print Bench Bunnelby | Chose first Tool target, losing this turn's Evolution attack opportunity | Prioritize the actual Active bare Bunnelby if offered |
| Stealthy Hood to a suppressed AOR Vileplume vs unsuppressed identical copy | Scored only first same-print Vileplume, abstained even when suppression was on second | Score exact action target and its live suppression state |
| Free-form Retreat action vs actor-relative BUS destination | First no-printing retreat could be selected, despite specified BUS target later in the frontier | Match the exact Bench index/printing before promoting to BUS |

The state is observable from the worker's own board, action-frontier coordinates, and Ability suppression projection. No hidden deck cards or Prize contents are used. Coordinate-free name-only actions are not granted a fake identity when duplicate visible printings exist.

## False terminal under Jamming Tower

The source has **Choice Belt PAL176**; it adds 30 to attacks into Pokémon V. **Jamming Tower TWM153** makes Pokémon Tools have no effect. Without suppression, a moved source Mega Lopunny ex with Choice Belt has Spiky Hopper `160+30=190` into a non-resistant V; with Jamming Tower the same attack is only **160**, while its moved **Gale Thrust 230** can still take the Knock Out.

For an opposing Shadow Rider Calyrex V at 180 remaining HP with two remaining own Prizes and two attacks offered in Spiky-then-Gale order:

- No Jamming/global Tool suppression: Spiky 190, first-offered immediate-win Spiky is valid.
- Jamming active: Spiky 160 is not a KO; Gale 230 is the immediate winning attack.
- A visible `stadiumAndToolHaveNoEffectTurnsRemaining > 0` nullifies **both** Stadium and Tool effects: it suppresses Jamming Tower but *does not re-enable Choice Belt*. Spiky remains 160, and Gale is the winning attack.
- This same global nullification makes Stealthy Hood ineffective, even when Jamming's own Stadium effect is muted. Do not infer that a muted Jamming re-enables other Tools.

The initially written global-nullification test incorrectly expected Choice Belt to recover when Jamming was muted. That was corrected *before this report and handoff*: the final helper explicitly treats global Tool nullification independently of Stadium action. Paper textual basis comes from the supplied card database's Jamming Tower, Choice Belt, Mega Lopunny ex and Temple of Sinnoh entries.

## Already-evolved Benched Mega's lethal Gale promotion

The physical source includes **two Mega Lopunny ex PFL84**, each with a one-Colorless Gale Thrust and a one-Colorless Retreat Cost. A **stationary** Active Mega with one attached Energy can attack for only 60; a second already-evolved Benched Mega with one Energy can use Gale Thrust for **230** immediately **after it itself retreats into the Active Spot**. This does not rely on incorrectly counting a Basic's earlier movement before evolution as the Stage 1's movement.

At a public Shadow Rider Calyrex V CRE74 with **180 remaining HP**, no defender Tool, and two source Prizes remaining, the existing worker chose offered stationary Gale (60) instead of offered Retreat to the second already-funded Mega (lethal 230). The corrective `terminalGalePromotionTarget` is deliberately narrow: its root opportunity needs a certified `movedFromBenchToActiveThisTurn === false` receipt for the original Mega, the exact printed Shadow Rider V target, actual opponent HP/damage and no defender Tool/unresolved Ability suppression, a 2-Prize terminal window, a funded second *already-evolved* Mega, and a genuinely offered actor-relative retreat. An ambiguous movement receipt, no Bench Energy, opponent Tool or nonterminal Prize state declines the override.

An unambiguous source-only decision improvement is not a full game: it does not prove the whole turn's subsequently offered attack or establish a matchup win. An isolated native Store promotion → follow-on attack is the next admissibility requirement.

## Colorless source attackers beyond Mega Lopunny

The exact source 60 also carries **Pidgey FLF75** (Peck Off, 10 damage) and **Pidgeot ex OBF164** (Blustery Wind, 120 damage). Both are printed **Colorless Pokémon**. Earlier `printedDamage()` mistakenly granted Powerful Colorless Energy's +20 and Choice Belt's +30 *only* to Mega Lopunny ex. The fix now computes printed/base damage first, then attaches any *live* Colorless-source damage modifiers before target Weakness/Resistance for all three currently modeled attackers: Mega Lopunny ex, Pidgey and Pidgeot ex. It does **not** infer a modifier if suppression or other unknown damage conditions prevent certification.

A live PCE + Choice Belt yields **60 Peck Off** and **170 Blustery Wind** into an unprotected Pokémon V; Jamming Tower reduces the latter to **140**, Temple of Sinnoh reduces it to **150**; a global Stadium-and-Tool-nullifying effect reduces it to **140** irrespective of Jamming/Temple. All examples use card text and actor-visible board modifiers; they are not full attacked-turn / Knock Out receipts. They matter because these cards belong to the *same fixed rank15 source opponent*, rather than being optional speculative off-archetype additions.

## Grand Tree: same-printing Basic age and Active evolution

Grand Tree SCR136 explicitly evolves one of the player's Basic Pokémon *in play*, subject to the prohibition on evolving a Basic put into play this turn. The earlier worker limited target search to Benched Pokémon and compared a selected Grand Tree prompt choice only against the target's **printing**, not its **physical Bench index**. Under a public board with Oddish A placed this turn (Bench index 0) and identical Oddish B established last turn (index 1), it selected A if that token appeared first, even though B was the viable legal evolution target. This directly prevents successful Stage1/Stage2 lock setup.

The correction identifies an established physical target by its `lastPlayedOrEvolvedTurn` and actual Bench index; an indexless same-printing choice is accepted only if it identifies a unique visible Bench printing. It additionally permits an **established Active Basic** when no better eligible Benched target is available and only selects an actor-owned Active token whose zone matches. If the source prompt is explicitly Bench-only, it does not invent an Active selection.

Both-seat constructed cases cover newly planted versus old Oddish in either Bench order, indexless collisions, unique fallback, established Active-only, old Active versus new Bench, new Active versus old Bench, explicitly Bench-restricted negatives, and actual offered `use-stadium` root activation. The correction is a source-policy decision test, not an authenticated pinned Store evolution chain or a game.

## Guzma: retain the promised legal attacker through the second switch

The source's Guzma BUS115 uses an opposing Bench selection followed by a mandatory own Bench promotion. A decisive observed line uses an already-funded Mega Lopunny ex on the Bench to deliver moved Gale Thrust for a two-Prize terminal win. The root `guzmaOpportunity` correctly skipped a candidate Mega with `publicRestrictions.cannotUseAttacksNextTurn` entries; **the actual own-Pokémon `guzmaPrompt` did not**, and promoted the first identically printed restricted Mega rather than the second, legal attacker. On a constructed fully visible board with two Mega, Root planned Bench index1 and the prompt selected Bench index0: a concrete internal action-chain failure.

The change shares `readyGuzmaMega` between the planning root and own-switch prompt. It additionally removes a blanket veto of the source Mega attacker when **Choice Belt** is attached: Belt cannot reduce a base-230 moved Gale Thrust, and Jamming Tower disabling its bonus still leaves 230. Hence a visibly guaranteed base-230 KO remains a terminal Guzma regardless of whether Belt's extra +30 currently applies. Opposing target Tools or unresolved defender modifiers still prevent a certainty claim. Both-seat tests cover restricted first Mega versus legal second Mega, Jamming/Belt present and absent, and defender-Tool conservative negatives.

## Original 15-Pokémon source attack surface, not just Mega Lopunny

The original rank15 60 includes 15 Pokémon printing lines. Before this change, the worker's `printedDamage` only modeled Mega Lopunny's two attacks plus Pidgey Peck Off and Pidgeot ex Blustery Wind. This left **11 additional original-print fixed-damage attacks** opaque, including Oddish Seed Bomb (20), Gloom Drool (30), Vileplume AOR Solar Beam (70), Vileplume BUS Downer Shock (60), Buneary Kick (20), Pidgeotto TEU Gust (30), Pidgeotto MEW Flap (20), Fan Rotom Assault Landing (70 when a Stadium is in play), Budew Itchy Pollen (10), Eldegoss V Float Up (50), and Tatsugiri Surf (50). The attack/printing mappings and costs were read from the supplied complete card pool, not inferred from Pokémon names.

The corrected `sourcePrintedType` and `applyTypedWeaknessResistance` model Grass, Colorless, and Dragon Weakness/Resistance for these source prints. Powerful Colorless +20 applies **only** to Colorless Pokémon; Choice Belt +30 can apply to **any Pokémon type** when hitting a V and its Tool effect is live. A Stadium-nullifying effect does *not* remove a Stadium from play, so Fan Rotom's Assault Landing condition remains satisfied if a muted Stadium is still physically there. With no Stadium, Assault Landing does nothing and cannot be made damaging through PCE/Belt. Attacks printed with no damage (such as Bunnelby's Burrow/Rototiller and Oddish's Stun Spore) are not incorrectly treated as arbitrary 0-damage attacks capable of gaining modifiers.

**Eldegoss V Float Up** shuffles the attacking Pokémon and attached cards back into the deck after attacking. A purported final-Prize Knock Out with **no other own Pokémon in play** therefore also empties the player's board; the worker no longer certifies this as an unqualified terminal win. The attack's 50 printed damage is still available when a Bench Pokémon remains.

The decision impact goes beyond arithmetic: when the source Pidgeot ex holds live PCE+Belt versus a 170-HP-remaining Shadow Rider V, `Blustery Wind` becomes an immediate 170-damage terminal attack ahead of setup; Temple or Jamming can remove the required boost and restore the preference for setup. Budew with live Belt can deliver a 40-damage final-Prize `Itchy Pollen`; Fan Rotom can deliver a boosted terminal `Assault Landing` only when a Stadium exists.

The committed comprehensive source attack test file covers all 11 original fixed-damage cards, typed Weakness, nonmatching resistance, correct PCE/Belt scope, empty/muted Stadium conditions, nondamaging move negatives, Float Up sole-Pokémon loss avoidance, and immediate-Prize attack-versus-setup choices on both physical seats. These remain **constructed actor-only decisions, not authenticated native-Store attack resolution**.

## Eldegoss V Happy Match against source's own Stadium locks

The exact rank15 source includes **Silent Lab PRC140**, **Path to the Peak CRE148**, and **Eldegoss V RCL19**. Eldegoss V's Happy Match Ability triggers when played from hand onto Bench, retrieving a Supporter from the discard. A live Silent Lab makes all Basic Pokémon have no Abilities; a live Path disables the Rule-Box Pokémon V's Ability. Before the patch, `eldCanBench` noticed Path but **not Silent Lab**, and it unconditionally vetoed Path even when global `stadiumAndToolHaveNoEffectTurnsRemaining > 0` was explicitly muting Stadium effects. The worker therefore either wasted an Eldegoss play into its own Silent Lab, or refused a live recovery opportunity when the locking Stadium was inactive.

The new branch checks both relevant Stadiums and the global effect-nullification state, preserving separate protection from the opponent's Active Iron Thorns. Both-seat tests demonstrate actual offered Eldegoss root choices admitted when Happy Match can work and refused when its Ability cannot trigger. They do not prove the subsequent Supporter-retrieval prompt is correctly resolved by the native engine.

## Strict V3 actor decision-contract acceptance

Earlier synthetic action/choice assertions intentionally constructed minimal objects without the complete owner schema. We also built a second fixture using the actual checked-in `agent49-policy-protocol.cjs` validators, including full actor observation/public restrictions, event receipt, prompt source and zone metadata, and action frontier. The production pure `validateRequest` and `validateDecision` jointly admit the revised rank15 worker's:

- Grand Tree choosing **the established Oddish at Bench index1**, not identically printed newly planted index0, on both physical seats.
- Pidgeot ex's **live PCE+Belt 170-damage** terminal attack into an opponent V at 170 remaining HP, when the attack is offered.
- Its refusal of that false terminal under active Jamming Tower, selecting a visible setup action instead.

The six new cases and **four inherited Agent41 strict-V3 cases** all passed with the exact protocol blob `d8349ae6f3537816b357b8309e9ab140ddec51eb`. This exercises real schema/decision admission code but **still does not initialize, dispatch, or complete a Twinleaf Store**; action-frontier offers and board states are constructed, not native traces.

## A certified final-Prize line can override Vileplume BUS lock preservation

The source's Vileplume BUS6 makes opposing Basic Pokémon unable to attack while BUS remains Active. The original `guzmaOpportunity` **categorically returned null whenever BUS was Active**, even if the opponent had a 2-Prize Shadow Rider V at 180 HP remaining on the Bench, the source had two Prizes remaining and a separately funded Bench Mega Lopunny could move Active through Guzma BUS115 for **230 Gale damage** and take the last Prizes. Keeping the lock cannot improve on ending the game immediately.

The correction still forbids **nonterminal** BUS-sacrificing Guzma, but permits an exactly visible, already-payable, last-Prize two-switch Guzma. Both-seat tests distinguish two own Prizes (terminal Guzma) from three (retain lock).

## Terminal Jet Energy as a physical Bench promotion, not just an attachment

Jet Energy PAL190 provides Colorless Energy and, **when attached from hand to a Benched Pokémon**, immediately switches that Pokémon into the Active Spot. The original worker partially modeled it for TM-equipped Bunnelby and BUS lock but did **not** prioritize Jet to an already-powered Benched Mega as an immediately winning promotion. Furthermore, the earlier narrow `terminalGalePromotionTarget` recognized only a stationary Active Mega, excluding Active BUS Vileplume or Fan Rotom as the outgoing Pokémon.

The new source policy recognizes a physically indexed, ready one-Energy Benched Mega and a fully certifiable last-Prize Gale 230 KO into an unprotected Shadow Rider V. It executes an **offered paid Retreat** first if both paths are available, else an **offered indexed Jet Energy attachment** to that Mega. It can sacrifice BUS only to end the game, respects a Bench Mega's public attack restrictions and an opaque opponent Tool, rejects a nonterminal Prize state, and refuses to classify Jet as a switching effect under active **Temple of Sinnoh**. If Temple is active, ordinary Jet attachment may still be valuable for Energy; it is not misrepresented as a winning switch. Both-seat cases also reject a Jet to the wrong identically printed *unpowered* Mega.

The patch does not invent a future `Gale Thrust` action token before native promotion. Its test asserts only the **first available winning line action**; native Store continuation must establish the moved receipt, newly offered attack, and actual Prize outcome before any game-level claim.

## Grand Tree mixed-chain prompt: an unrelated Gloom must not hide Pidgeot

The prior `grandTreePrompt` deck-search branch used exclusive `if ... else if` based on *any* evolved Pokémon on the board. If one unrelated Gloom was already on the Bench when Grand Tree evolved a Pidgey into Pidgeotto, the second-stage prompt might offer **Pidgeot ex** but the worker would inspect the existing Gloom, search only for Vileplume AOR/BUS, and **abstain** even though Pidgeot ex was the unique native offered continuation. This is a real lost Stage2-search decision, not a hypothetical card substitution.

The correction enumerates all **board-supported evolutionary families** and intersects them with the **actual native offered choices**, preserving preferred AOR/BUS when offered but not allowing an unrelated Gloom or Oddish to mask the selected Pidgeot/Mega evolution. It prefers the source's Pidgeotto TEU Air Mail print over MEW Flap print when both Stage1 selections are offered. Both-seat tests cover this mixed-board wrong decision, Vileplume/Buneary alternatives and a genuinely unsupported offered card. Two further full **strict V3 protocol request/decision** cases pass for native-schema Grand Tree Pidgeot selection while Gloom is on the Bench. The test uses produced user-visible choice tokens, not concealed deck membership.

## Legacy Energy's one-Prize reduction invalidates apparent last-Prize wins

The card list's **Legacy Energy TWM167** states that a Pokémon Knocked Out by damage from an opponent's attack yields **one fewer Prize card**; its effect cannot apply more than once per game. The previous `sourcePrizeValue` used only target card type (V=2, VMAX=3, etc.), so the worker would incorrectly treat a KO against a Shadow Rider V with live Legacy attached as a **two-Prize terminal**, often sacrificing Active BUS's lock via Jet Energy or Guzma to attempt a nonexistent immediate win.

The corrected prize liability is **conservative**. If the opponent's visible target has Legacy Energy attached and **Temple of Sinnoh is not currently suppressing Special Energy effects**, assume Legacy's per-game discount is still unused (because the actor-only projection does not certify prior uses) and reduce the number of Prizes expected by one. This is used consistently in **direct attack terminal detection, Bench gust/Guzma opportunity, and pre-attack Jet/paid Retreat lethal-promotion evaluation**. A live Temple disables the reduction, while a globally disabled Temple does not. The guard is limited to KOs by attack damage, as in its printed text.

A concrete source test: with Active BUS, two source Prizes left, an already-powered Benched Mega, and opposing Shadow Rider V at 180 HP remaining, a Jet into moved Gale230 seems to end the game. **With Legacy attached, it yields only one Prize**; preserving the lock/recovering resources is selected instead. Both-seat tests show the same correction for direct Spiky Hopper and terminal Guzma, plus the case where Temple correctly restores the normal two-Prize value for an attack (but independently disables Jet's switch). This is a deterministic **decision-classification fix**, not a proof of winning a future game.

## Life Dew, Island Challenge Amulet and three-Prize Pokémon

The previous calculation still overcounted **Life Dew PLF107**, an ACE SPEC Pokémon Tool printed in the Black & White card pool that causes one fewer Prize when the attached Pokémon is Knocked Out. For a live Life Dew on a Shadow Rider V with 150 HP remaining, the earlier policy treated a 190-damage Spiky Hopper as an unconditional two-Prize game win, even though the attachment reduces the Prize yield to **one**. The same false terminal could contaminate Guzma and lethal Jet/Retreat evaluation. Under live **Jamming Tower TWM153**, however, Life Dew has no effect and the normal Prizes are once again taken.

The corrected `sourcePrizeValue` accounts for **Life Dew** under live Tool effects, in addition to Legacy Energy's reduction; when both are actually attached it conservatively applies both discounts, bounded at zero. **Island Challenge Amulet CEC194/265** also reduces a Knock Out's Prize yield by one *for an eligible Pokémon-GX or Pokémon-EX* while its Tool effect functions. It does not apply to Pokémon V or modern lowercase Pokémon ex. Damage calculations may now safely continue through a visible **Life Dew** attachment because this Tool alters Prize taking but not attack damage; other opaque defender Tools remain conservatively unmodeled. Guzma and immediate Bench Mega promotion can now consider Life Dew accurately rather than ignoring the target or miscounting the terminal. Under Jamming, the Tool discount is suppressed.

An independent fault was **three-Prize classification**. The prior source policy recognized three Prizes for VMAX and Mega Evolution ex, but assigned only two to **TAG TEAM Pokémon-GX** (for example Mewtwo & Mew-GX UNM71) and **Pokémon V-UNION** (for example Mewtwo V-UNION PR-SW SWSH159). The correction recognizes both printed three-Prize Rule Boxes, including public TAG TEAM/V-UNION subtype information where provided. Both-seat counterexamples demonstrate that a genuine final three-Prize knockout is no longer omitted, and a live Island Amulet can turn a nominal TAG TEAM three-Prize KO into only two.

Tests explicitly contrast live Life Dew, Jamming disabling Life Dew, Life Dew + Legacy, Island Amulet on TAG TEAM-GX, base three-Prize TAG TEAM/V-UNION, and live Life Dew on a one-Prize Pokémon yielding **zero** Prizes. These are **rules/text-grounded expected Prize liabilities and constructed decision branches**, not completed native KO resolutions.

## Reproducible assets

- Policy: `simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs`
- Physical-object tests: `tests/2026-11/agent20-rank15-physical-slot-continuation-heldout.test.cjs` (**10** cases)
- Tool/Stadium tests: `tests/2026-11/agent20-rank15-jamming-belt-terminal-heldout.test.cjs` (**16** cases)
- Terminal Mega promotion: `tests/2026-11/agent20-rank15-terminal-gale-promotion-heldout.test.cjs` (**12** cases)
- Colorless source damage: `tests/2026-11/agent20-rank15-colorless-modifiers-heldout.test.cjs` (**12** cases)
- Grand Tree target age/slot/Active: `tests/2026-11/agent20-rank15-grandtree-physical-evolution-heldout.test.cjs` (**18** cases)
- Guzma own attacker promise, Belt lower-bound and BUS-lock terminal override: `tests/2026-11/agent20-rank15-guzma-prompt-attacker-binding-heldout.test.cjs` (**18** cases)
- Complete original fixed-attack surface: `tests/2026-11/agent20-rank15-source-fixed-attack-damage-heldout.test.cjs` (**80** cases)
- Eldegoss self-Silent Lab/Path root choices: `tests/2026-11/agent20-rank15-eldegoss-self-silent-lab-heldout.test.cjs` (**10** cases)
- Full strict V3 Grand Tree/Pidgeot requests: `tests/2026-11/agent20-rank15-grandtree-pidgeot-strict-v3-heldout.test.cjs` (**8** cases)
- Terminal indexed Jet/Gale from BUS/Fan/Mega Active: `tests/2026-11/agent20-rank15-terminal-jet-gale-promotion-heldout.test.cjs` (**18** cases)
- Grand Tree mixed-evolution-chain choice collision: `tests/2026-11/agent20-rank15-grandtree-mixed-chain-source-heldout.test.cjs` (**12** cases)
- Legacy Energy Prize terminal false positives: `tests/2026-11/agent20-rank15-legacy-energy-prize-terminal-heldout.test.cjs` (**20** cases)
- Life Dew, Island Challenge Amulet and TAG TEAM/V-UNION: `tests/2026-11/agent20-rank15-prize-tools-tagteam-vunion-heldout.test.cjs` (**26** cases)
- Parent strict V3 Temple regressions (not owned by PR93): `tests/2026-11/agent41-rank15-temple-strict-v3-protocol-heldout.test.cjs` (**4** cases)
- Exact final policy blob: `e05044c170bbfcb4701217afb84a04805df05620`
- Exact test blobs: `04aa7326f3d2c3bf18b115ca48d6988021c511cb`, `99418a2ca86cc651773af5cf3248979e4563317c`, `5d99721052439eb84849b4094ad98e0c6bd16132`, `fea7ca06fc33741301619f13dd8782a2ccfcd57a`, `7fa0f188ae3b889e16163fb8af639632dd4816e8`, `7276272a458f1941cdf1e2f5f8261aa93faf1818`, `757fb4f866d5013f6bb6a76eb92a4813ee3c549d`, `b488b4988c93ef88065c87f390dd6320dcade34b`, `259305b66e940632aed10c45708178915d1096d9`, `eac80e65146d35e8e27c40e309dc9cc7f3bb7647`, `63db297a905a12b7f3fdf9238208c1a192b9d236`, `f1e3df15364dc42e4153502b1f122d7fdf229915`, `1a1d9641378968375b26e0f46da3fd08b7359a60`
- Executed both committed test files against the exact policy blob with a JavaScript CommonJS V8 shim for `node:test`, `node:assert/strict`, and the policy module: **264 passed / 0 failed** (252 constructed source cases + 8 new full strict V3 requests + 4 inherited strict V3 requests). This confirms synchronous decision assertions only. The V8 shim is not Node CLI, pinned Twinleaf Store, native protocol, source-deck game, or competitive qualification.

The original PR90 head reproduced the wrong Jet and TM selections and the absent correct Hood decision before the follow-on patch. Neither PR90 nor PR93 should be treated as an admission to main or a frozen policy. Both may be challenged through independent actor-visible native continuation before any owner-approved game. No CI or V3 dispatch was performed here.

## Integration boundary

PR #93 targets PR90's **development branch**, not main, and is intentionally draft. Rank15 ownership remains Agent20/Agent17 per the 27 Nov coordinator disposition. Mainline 32-field policy/admission counters and fixed60 nomination should not be changed by this work.
