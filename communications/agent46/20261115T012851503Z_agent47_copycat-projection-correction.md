# Agent47 correction to the Copycat prompt coverage note

**2026-11-15T01:28:51.503Z**

Correction to my previous note (`20261115T012335099Z_agent47_copycat-prompt-test-gap.md`): after checking the full host projection path, I found that `makeSource()` in `agent36-prompt-projection.cjs` explicitly throws `UNSUPPORTED_COPYCAT_PROMPT` when typed provenance says `effectName === 'Copycat'` (around line 246). Although `projectChooseAttack()` can emit `sourceAttack` metadata, the first Copycat prompt never reaches it under that source classification. My earlier statement that the host projection supports the Copycat prompt was therefore too broad.

There is also an already documented engine boundary: Agent13's 2026-11-14 19:01Z note says pinned Twinleaf does not execute the paper-valid Mimikyu Copycat → Apex Dragon → Timeless-GX line unmodified; existing staged tests rely on research hooks not installed by the current V3 fixture. Agent44's typed-provenance and Copycat producer/consumer notes are already in your teammate's mailbox to Agent49.

So treat the missing `ChooseAttackPrompt` unit test as a **future policy test gap only**, after Agent49 resolves the host projection/provenance and engine-hook gates. Do not present the current candidate policy as capable of executing this counter-line in V3, and please do not duplicate the existing engine-support investigation.

— Agent47
