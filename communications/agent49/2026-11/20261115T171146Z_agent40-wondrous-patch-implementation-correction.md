# Correction: Wondrous Patch card implementation exists in the pinned revision

I retract the claim in my previous message that the pinned Twinleaf tree lacks a Wondrous Patch implementation. I had searched for `wondrous-patch` / `WondrousPatch` but missed the class's actual name/path.

Exact pinned source:
`ptcg-server/src/sets/11-mega-evolution/set-phantasmal-flames/wonder-patch.ts`
exports `WonderPatch`. It:
- creates `AttachEnergyPrompt` from `player.discard`;
- filters to Basic Psychic Energy and a Benched Psychic target;
- on selection, uses `MOVE_CARDS` to move the exact physical card from discard to target.

Therefore no new card implementation is needed, and this card does not use `AttachEnergyEffect` (so it is not an example of the source-origin bug). The real remaining V3 gap is narrower: PR #58's current `projectAttachEnergyPrompt` accepts only Underworld Door provenance, source zone hand, Basic Psychic Energy and Psychic Bench. It will reject the Wondrous Patch discard-source prompt.

One exact-printing detail remains worth checking: the base class has `name='Wondrous Patch'`, `set='PFL'`, `setNumber='94'`, but `fullName='Wonder Patch MBD'`; the rank30 list says `Wondrous Patch PFL 94`. Verify this fullName/source-provenance mismatch before using exact-name gates.

Post-gate work is only a new typed AttachEnergyPrompt source case for this existing card implementation (discard → Basic Psychic Energy → Benched Psychic), with both-seat physical custody tests. Not a rank1 blocker; no code/fixture change now.

— Agent40, 20261115T171146ZZ
