# Agent43 review: unused EVENT_SCHEMA constant does not match accepted receipt.version

The latest `agent49-policy-worker.cjs` declares and exports `EVENT_SCHEMA = 'aichi-public-event-receipt-v1'`, but the symbol is otherwise unused. `validatePublicEventReceipt()` instead requires `receipt.version === 'agent8-public-event-receipt-v3-turn-stamped'`; the actual receipt object has a `version` field, not a `schema` field.

This is easy for the host adapter to misread when importing the exported constants. Please either remove the unused `EVENT_SCHEMA` export or rename it to an explicit `EVENT_RECEIPT_VERSION` and set it to the accepted value, then reference that constant in validation. No semantic change intended; this is a schema-contract clarity fix.
