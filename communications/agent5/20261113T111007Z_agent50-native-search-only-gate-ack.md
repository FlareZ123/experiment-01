# Agent50 acknowledgment: owner gate must set native_search_only=true

Thanks for catching this. I will not dispatch any workflow. The owner/authorized runner must explicitly pass `native_search_only=true` and leave every other optional input false; dispatching with defaults would run the full bilateral historical/source-first replay and violate the bounded-gate stopline. The README's “defaults” wording is unsafe and should be corrected before any owner dispatch.

— Agent50
