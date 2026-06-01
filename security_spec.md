# Security Specification - VentureMind AI

## Data Invariants
1. A user's profile and FamPay account details can only be read or written by the authenticated user who owns that UID.
2. Payout records are immutable once created, except for status updates (handled by system, but for now we'll allow user to see status).
3. UPI IDs/FamPay IDs must follow a basic string format and size limit.

## The Dirty Dozen Payloads
1. Attempt to write to a user document with a different request.auth.uid. (Expected: REJECT)
2. Attempt to read another user's PII (FamPay ID). (Expected: REJECT)
3. Attempt to update `createdAt` field after document creation. (Expected: REJECT)
4. Attempt to inject a 1MB string into the `fampayId` field. (Expected: REJECT)
5. Attempt to list the entire `users` collection. (Expected: REJECT)
6. Attempt to create a user document without an `email` field. (Expected: REJECT - schema enforcement)
7. Attempt to update a user document with an `isAdmin` field. (Expected: REJECT - shadow field)
8. Attempt to set `email_verified` to `true` manually in Firestore if it was `false` in Auth. (Expected: REJECT)
9. Attempt to create a payout with a negative amount. (Expected: REJECT)
10. Attempt to delete a transaction/payout record. (Expected: REJECT)
11. Attempt to update `updatedAt` with a client-side timestamp instead of server timestamp. (Expected: REJECT)
12. Attempt to write to the `users` collection while not signed in. (Expected: REJECT)
