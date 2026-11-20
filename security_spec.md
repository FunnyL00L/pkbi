# Security Specification — Portal Project ECCD PKBI Buleleng

## 1. Data Invariants
1. **Default-Deny Baseline**: Every unspecified Firestore document path MUST deny all reads and writes.
2. **Admin-Only Mutations (Verified Identity)**: Creating, updating, or deleting `villageAgendas`, `deletedSeedAgendas`, `fosterFamilies`, or `admins` requires an authenticated user with `request.auth.token.email_verified == true` who is either the bootstrapped admin (`gedebramanda155@gmail.com`) or exists in `/admins/{request.auth.uid}`.
3. **No Self-Privilege Escalation**: Non-admin signed-in users cannot create or update `/admins/{uid}` to grant themselves `role: "admin"`.
4. **Strict Keys & No Ghost Fields**: Every write must pass `keys().hasAll(...)` and `keys().hasOnly(...)` on create, and `affectedKeys().hasOnly(...)` on update.
5. **Immutable Audit Fields & Server Timestamps**: `createdAt == request.time` on create; `createdAt` and `authorUid` are immutable on update; `updatedAt == request.time` on create and update.
6. **Path Variable Hardening & Size Bounds**: Every single-document ID (`uid`, `agendaId`, `familyId`) must pass `isValidId()` (`^[a-zA-Z0-9_\-]+$`, max 128 chars). Every string field has explicit `.size()` bounds; every array has explicit `.size() <= MAX` bounds.
7. **PII Isolation**: `/admins/{uid}` contains admin email PII and is strictly readable only by the owner (`request.auth.uid == uid`) or verified admin; public collections (`villageAgendas`, `fosterFamilies`) store ONLY initials (never full names, emails, or phone numbers).

## 2. The "Dirty Dozen" Attack Payloads (All Must Be Rejected)
1. **Unauthenticated Create**: Anonymous user attempts to create `/villageAgendas/ag-hack-1`.
2. **Non-Admin Authenticated Write**: Regular signed-in Gmail user (`visitor@example.com`, `email_verified: true`) tries to create `/fosterFamilies/ka-hack-1`.
3. **Email Spoofing (Unverified Admin Email)**: User claims `email: "gedebramanda155@gmail.com"` with `email_verified: false`.
4. **Self-Privilege Escalation**: Regular user writes `/admins/{theirUid}` with `role: "admin"`.
5. **Shadow / Ghost Field Injection**: Admin writes `/villageAgendas/ag-1` including undeclared field `isVerified: true`.
6. **ID Poisoning**: Admin attempts to create document with 200-char or invalid-char ID `../hack!@#`.
7. **Client Timestamp Forgery**: Admin creates `/villageAgendas/ag-2` with forged `createdAt` different from `request.time`.
8. **Immutable Field Tampering**: Admin updates `/villageAgendas/ag-1` attempting to alter `createdAt` or `authorUid`.
9. **Value Poisoning (Wrong Type / Oversized String)**: Admin updates `participants` to `"not-a-number"` or `summary` to 5,000 chars (> 1,200 max).
10. **Unbounded Array Flood**: Admin writes `galleryImages` with 25 entries (> 5 max) or `monthlyGrowth` with 120 entries (> 60 max).
11. **PII Leak Attempt**: Non-admin authenticated user attempts `get` or `list` on `/admins/{otherUid}`.
12. **Author UID Spoofing**: Admin attempts to write `authorUid: "someone-else-uid"` instead of `request.auth.uid`.
