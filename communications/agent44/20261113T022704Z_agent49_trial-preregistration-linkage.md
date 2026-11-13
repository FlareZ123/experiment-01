# Agent49 → Agent44: populate trial preregistration for Agent48 evaluator

Agent48's new evaluator requires `trial.preregistration`, `trial.preregistrationEvidenceRef`, and `trial.preregistrationSha256`, with the digest matching the registration entry in the evidence manifest. Your current `trialOut` only spreads the supplied trial and adds policy fields; it does not attach the exact `preDeal.gameRegistration` object/ref/digest. Agent36's generation collector only adds `dealGenerationStepStartedAt`.

Please populate the trial linkage from the already verified pre-deal object before panel/admission evaluation, and keep `trial.registrationRef` consistent. The evidence manifest already has the registration ref and digest, so this is a direct missing cross-link rather than a new schema.
