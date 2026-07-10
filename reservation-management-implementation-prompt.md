# Implementation Request: Reservation Charges, Payments & Lifecycle Management

## Project Context

This is a Laravel (backend) + React (frontend, Tailwind CSS) hotel booking/management system called "Hotel Booking System." Key existing pieces:

- **Booking flow**: guests submit a booking request via a public form (`Rooms.jsx` → `POST /api/bookings` → `BookingController::store`). Bookings sit as `pending` until an admin confirms them and assigns a room, at which point `BookingController::update` converts the booking into a `Reservation` record (creates the reservation, calculates room_charge/extra_person_charge/tax_amount/total_amount, and records the $45 deposit as a `Payment`).
- **Reservation Management page** (`ReservationManagement.jsx`): admin-facing table showing all reservations, with stat cards for Daily Check-Ins, Daily Check-Outs, and In-House Today (computed client-side from `checkIn`/`checkOut`/`rawStatus` fields). Existing actions per row: Check-In, Check-Out (with a confirm modal), Record Payment, Extend Stay (button exists, modal not built yet), Move Room (modal exists but needs the workflow below).
- Models involved: `Booking`, `Reservation`, `Payment`, `Room`, `RoomType`, `Guest` (reservations currently snapshot guest_name/guest_email/guest_phone directly rather than always creating a `Guest` record — a real `Guest` row is only created at front-desk check-in).
- Auth: token-based (Sanctum), token stored in `sessionStorage` under the key `auth_token` on the frontend.

## What I need built

I want to implement a complete, itemized charges/payment/lifecycle system for reservations, replacing the current single computed `remaining_amount` approach. Below is the full design we've agreed on — please implement it faithfully, flagging any assumption you have to make.

---

### 1. Itemized charges ledger (core change)

Create a `reservation_charges` table instead of relying on stored totals:

- `id`
- `reservation_id` (FK)
- `charge_type` (enum or string: `room`, `extra_person`, `service`, `adjustment`, `carried_over`, `refund`)
- `description` (string, e.g. "Room charge — 3 nights", "Extra person — 2 nights", "Balance carried from Res #123")
- `amount` (decimal; refunds/adjustments can be negative)
- `created_at`

**Balance for any reservation = SUM(charges.amount) − SUM(payments.amount)**, always computed live (a query/accessor), never stored as a static column. Update `Reservation::remainingAmount` (or wherever balance is currently derived) to compute this way instead.

When a reservation is first created (both from `BookingController::update`'s conversion path, and from any direct "Add Reservation" flow), write the room_charge and extra_person_charge (if applicable) as rows into `reservation_charges` instead of only setting `Reservation.room_charge`/`extra_person_charge` columns. Keep those existing columns if useful for quick display, but the charges table is the source of truth for the modal and for balance math.

### 2. Check Balance modal (new)

- Add a "Check Balance" button in the Balance column of `ReservationManagement.jsx` (visible always, not just when there's a remaining balance — staff should be able to view full charge history any time).
- Clicking it opens a modal showing:
  - Every row from `reservation_charges` for that reservation (type, description, amount).
  - Every row from `payments` for that reservation (amount, method, date).
  - A computed running total / balance due at the bottom.
  - A "Make Payment" button that opens the existing `RecordPayment` component/flow, writing a new row to `payments`, then refreshes this modal's data.
- Build the backend endpoint(s) needed to fetch this itemized data per reservation (e.g. `GET /api/reservations/{id}/ledger` returning `{ charges: [...], payments: [...], balance: number }`).

### 3. Split "Edit" from "Extend Stay" — do not combine

These must be two separate actions/buttons, not one:

- **Edit**: guest name, phone, special requests only. No availability check, no charge changes.
- **Extend Stay**: changes `check_out_date`. Must:
  1. Check if the *same room* is available for the new (extended) date range — no conflicting reservation overlapping those extra nights.
  2. If available: extend in place, and add a **new** `room` charge row (and `extra_person` charge row if guests > 2) scoped only to the *added* nights — do not overwrite/recalculate existing charge rows.
  3. If NOT available: this must hand off to the Move Room flow (see below) rather than failing outright — the guest needs to move to a different room to get the extra nights.

### 4. Move Room workflow (new/expanded)

When a room move happens (whether triggered directly via "Move Room" button, or as a fallback from an unavailable Extend Stay):

1. Open a form/modal to pick the new room (must validate room type compatibility and date-range availability conflicts, reusing the same validation logic already in `BookingController::update`).
2. On confirm:
   - Create a **new** `Reservation` record with the same guest info as the original, but `check_in_date` = today (or the effective move date), same intended `check_out_date` (extended or original), and the new room.
   - Set the **original** reservation's status to a **new distinct status `Moved`** — explicitly NOT `Checked-Out`. This is important: the stat cards on `ReservationManagement.jsx` count `rawStatus === "Checked-Out"` for daily checkouts and use `rawStatus === "Checked-In"` for in-house count. If a moved reservation were marked `Checked-Out`, it would incorrectly inflate the Daily Check-Outs stat and the guest would vanish from In-House Today even though they're still in the hotel. Update any stat/filter logic that currently only checks for `Checked-Out`/`Checked-In` to also handle `Moved` correctly (the guest should count as in-house under the *new* reservation, not the old one).
   - Carry over any remaining unpaid balance from the original reservation onto the new one as a **charge line item** (`charge_type: 'carried_over'`, description like "Balance carried from Reservation #123", amount = original's remaining balance) — not just a copied number.
   - Log the move in a new `room_moves` table: `id`, `old_reservation_id`, `new_reservation_id`, `moved_by` (user id), `moved_at`, `reason`/`remark` (free text, e.g. "Guest requested quieter room", or auto-filled "Extend stay — original room unavailable").
   - Display this move history somewhere sensible in the UI — at minimum, show "Moved from Room X (Reservation #Y)" on the new reservation's detail/ledger view.

### 5. Check-in form (new/refine existing modal)

- Only actionable if `check_in_date` is today (or already past, if you allow late check-in) and status allows it.
- If `adult > 1`, require filling in a profile for each additional guest (name, ID type/number, etc. — reuse whatever guest fields the system already expects at check-in, since guest records are created at this point per existing design).
- At the end of the check-in form, show a **read-only room summary**: total room charges, extra-person charges (only shown/applicable if total guests including children > 2), deposit already paid, and remaining amount due — computed from the ledger (item 1/2), not entered manually.
- **Do not include a payment step in this form.** Payment is handled exclusively through the Check Balance modal (item 2). Check-in should not block on balance being zero.

### 6. Check-out gating

- Check-out button/flow should check the live ledger balance (item 1) before allowing checkout.
- If balance > 0: redirect the user into the Check Balance modal (item 2) instead of allowing checkout, so they can either take payment or explicitly override.
- Decide/implement one of these two policies (your call which is simpler to implement first, but implement the override version with an audit trail if reasonably simple, since a hard block tends to create workarounds in real usage):
  - **Strict**: checkout is fully blocked until balance = 0. No override.
  - **Override with reason** (preferred): keep something like the existing "Check Out Anyway" button, but require entering a short reason/note when balance > 0, and store that reason (e.g. on the reservation or in an audit/log table) so there's a record of why someone checked out with an outstanding balance.

### 7. Migrations needed

Please write Laravel migrations for:
- `reservation_charges` (per schema in item 1)
- `room_moves` (per schema in item 4)
- Any status enum update needed on `reservations` to add `Moved` as a valid `reservation_status` value
- Any audit/reason field needed for override-checkout (item 6), if you implement that path

### 8. Things NOT to change

- Don't touch the existing public booking submission flow (`Rooms.jsx` / `BookingController::store`) — that's stable and out of scope here.
- Don't change how bookings convert to reservations (`BookingController::update`'s conversion logic) except to also write the initial charges as line items instead of (or in addition to) the existing summary columns.
- Preserve the existing `auth_token` sessionStorage-based auth pattern used elsewhere in the frontend — don't introduce a different auth mechanism for these new endpoints.

---

## What to deliver

Please provide, in this order:
1. Migration files for the schema changes.
2. Updated/new Eloquent models and relationships (`ReservationCharge`, `RoomMove`, and any changes to `Reservation`).
3. Backend controller methods/endpoints for: ledger fetch, extend stay, move room, check-in with guest profiles, check-out with balance gating.
4. Frontend: the Check Balance modal component, the split Edit vs Extend Stay UI, the Move Room form (extended for the new record-creation + old-record-status flow), the Check-in form with guest profiles + read-only summary, and check-out gating logic in `ReservationManagement.jsx`.

If anything above is ambiguous or you need to see existing files (e.g. current `Reservation` model, `RecordPayment` component, `MoveRoomModal` component, `AddReservation` component) before proceeding, ask for them rather than guessing at their current shape.
