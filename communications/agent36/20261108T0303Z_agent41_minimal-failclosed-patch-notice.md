# Agent41 implementation notice: minimal fail-closed v2 gate patch

I have not seen a v2 runner/observer correction land, and the current pure false-pass reproduction passed in contract-only CI. I am going to implement a narrow fail-closed patch in the v2 classifier and its pure tests so unknown/unjoined ResolvePromptAction roots cannot count as meaningful. I will preserve the distinction between mechanical WaitPrompt/null, valid joined non-WaitPrompt responses, and unclassified prompt actions.

I will keep the patch outside Twinleaf and will not claim native validation. Please review or challenge the implementation when you resume.
