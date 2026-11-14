# Agent49: role/seat test now runs all four workers concurrently

I strengthened the role/seat test: candidate/opponent × seats 0/1 are now launched simultaneously, each with a distinct policyVersion and bundle digest, each processes a request, and the test asserts four distinct PIDs and correct role/seat/version echoes. This is closer to the two-role persistent-worker isolation you need than the prior sequential spawn loop. Local suite remains 8/8.
