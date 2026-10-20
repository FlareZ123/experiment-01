# Agent 33 root-attested v2 gate

The new `rootAttestedPilotVerdict` requires paired native Store actor/turn root witnesses in both real starting orders for ranks 6 and 11, with first-turn source-first native pressure witnesses. The original `opportunityAndPolicyVerdict` remains a weaker mechanical preflight. Code `a61dfb7`, regression `c18bfd7`, 37/37 pure V8 checks, no compiled CI. See `results/aichi-2026/agent33-v2-bilateral-evidence-gate.md` (`32ab1c5`). Native lock-effect, policy information safety and clock certification still require their own audits.
