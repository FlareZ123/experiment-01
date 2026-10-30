# Agent42 preregistration: TAG TEAM three-Prize attack-order exposure

**30 October 2026; registered before execution of any native TAG TEAM three-Prize fork.** This is a synthetic original-Store, both-physical-seat mechanics test to improve a conservative **optional** owner-root arbitration safeguard. No source-dealt or competitively qualified Aichi game is claimed.

## Fixed setup and hypothesis

Use original pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, the existing Agent42 Buddy Pulse two-Prize staged fixture, and its exact source-visible attack/Bench-Energy choice with one change to the target and hero Prize count:

- Hero Active Miraidon ex SVI with three Lightning Energy, payable printed Photon Blaster 220.
- Opponent Active **Gengar & Mimikyu-GX TEU**, 240 HP with **30 prior damage**, a printed TAG TEAM three-Prize bounty. Hero has **three** Prizes remaining; opponent has **two**.
- Hero Benched Regidrago V SIT at 210/220 damage; held Double Dragon Energy ROS, unused normal attachment. Opponent Benched Minun PAR with Buddy Pulse plus Plusle PAR. Both physical seats `0` and `1`, two forked identical detached actor-visible roots per seat.
- **Attack-first fork A:** dispatch Photon Blaster, settle native prompts, expect genuine KO of TAG TEAM, owner receives three final Prizes and is declared winner.
- **Attachment-first fork B:** dispatch Agent41's unguarded selected Bench DDE attachment, expect Minun damage counters KO Regidrago, opponent receives two final Prizes and is declared winner before Photon Blaster.
- **Optional existing two-Prize safeguard branch C:** pass `protectPotentialTwoPrizeAttack:true`. The original v2 helper only protects when `ownPublic.prizeCount === 2`; **preregistered prediction** is that it returns `outside-two-prize-attack-window` and still lets the arbiter attach despite the potential three-Prize winning attack.

Pass condition: real native Store, including TAG TEAM three-Prize rule, agrees across both physical seats and returns winner distinctions with zero prompts/errors; any original engine inability to settle target/Prize is preserved as a negative and not silently repaired.

Also test a **pure, exact visible-paper-profile** option: on a target known to be TAG TEAM and with exactly three own Prizes left, guard potentially finishing fixed-damage attacks only if printed damage >= target remaining HP, and no obvious visible Legacy Energy/Life Dew reduction. Keep all existing two-Prize cases. Preserve two-Prize negative controls, one-Prize opponent targets, non-fixed damage, unknown printing, and opponent hidden-state invariance. Do not silently generalize based on name alone if paper Rule Box metadata is available. Rule-specific alternate Prize changes remain explicitly unmodeled.

## Scope and evidence

TAG TEAM three-Prize rule appears verbatim on English card `sm9-53` Gengar & Mimikyu-GX and in the paper rules. The 29 exact registered original Aichi opponent 60s include `Trevenant & Dusknoir-GX` rank 1, `Gengar & Mimikyu-GX` ranks 4,9,17,31 and `Arceus & Dialga & Palkia-GX` rank 19: six distinct source ranks with known TAG TEAM cards. All these are **potential opposing targets**, not proof that they are promoted or available when a finishing attack is payable.

No broader 60-card performance, 99.5% or win-rate inference from this mechanism fork. Run with existing manual native workflow, no new CI workflow/push trigger, no vendor source modification. Preserve all terminal differences and failure evidence.
