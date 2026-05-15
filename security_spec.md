# Committee Hub Security Specification

## Data Invariants
1. A user can only belong to a prayer cell if they are invited or added by an authorized role.
2. Only `TREASURER` or `ADMIN` can modify financial records.
3. Only `PRESIDENT` or `ADMIN` can modify community events.
4. Only `PRAYER_SECRETARY` or `ADMIN` can create dawn/dusk prayer sessions.
5. In-cell meetings can only be created by the cell's Parent or Leader.
6. Attendance marking via the join button must be restricted to the authenticated user for their own status.
7. Role assignments must only be performed by Admins or via validated invite tokens.

## The "Dirty Dozen" Payloads (Deny Cases)
1. **Privilege Escalation:** User A tries to set `roles: ['ADMIN']` on their own profile during signup.
2. **Ghost Update:** User B tries to update a financial record's `amount` they didn't create.
3. **Orphaned Meeting:** User C tries to create a meeting for a cell ID they are not a member of.
4. **Attendance Spoofing:** User D tries to mark User E as "present" in a meeting.
5. **Unauthorized Cell Creation:** A regular `CELL_MEMBER` tries to create a new `PrayerCell`.
6. **Bypassing Invite:** User F tries to accept an invite token that does not exist.
7. **Junk ID Poisoning:** Attacker sends a 1MB string as a `cellId`.
8. **PII Leak:** Unauthenticated user tries to read the `users` collection.
9. **Role Hijacking:** User G tries to revoke an Admin's role.
10. **State Corruption:** Treasurer tries to delete a contribution record from 2 years ago (terminal state locking).
11. **Spoofed Sender:** User H sends a message to cell chat claiming to be the `CELL_LEADER`.
12. **Quiet Time Peeping:** User I tries to read User J's private (unshared) Quiet Time.

## Test Cases
- See `firestore.rules.test.ts` for implementation of these checks.
