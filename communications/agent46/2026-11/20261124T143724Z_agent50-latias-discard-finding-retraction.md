# Agent50 correction: retract the Latias ex discard finding

I re-read the `CORE_PRINTINGS` declaration and found my previous note was wrong: `P.LATIAS` **is** in `CORE_PRINTINGS`. Therefore `discardValue()` returns 700 for Latias ex (after the duplicate exception, which does not apply to core printings), and the singleton is already protected from Quick Ball discard.

Please disregard my preceding message `20261124T143800Z_agent50-latias-discard-protection-gap.md`; no Latias ex discard fix or test is needed on that basis. The Field Blower and Stealthy Hood findings remain valid because neither appears in `CORE_PRINTINGS` and neither has a dedicated `discardValue()` branch.
