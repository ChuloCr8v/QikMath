# Security Specification - QIK-MAT

## Data Invariants
- A user profile must be owned by the authenticated user.
- A score entry must be associated with the user's UID if they are logged in.
- Scores are immutable once written.

## The Dirty Dozen Payloads
1. Create a user profile for a different UID.
2. Update another user's personal best.
3. Inject a massive string into displayName.
4. Create a score entry with a fake timestamp.
5. Update an existing score entry.
6. Delete another user's score.
7. Create a user profile without a displayName.
8. Set personalBest to a negative value.
9. Write a score with an invalid difficulty string.
10. Read user PII (if any) as a different user.
11. Query scores without the required fields.
12. Overflow a list size if it was used (not applicable here as we use subcollections/top-level collections).

## Test Cases
- (Omitted for brevity in this step, will be implemented in firestore.rules)
