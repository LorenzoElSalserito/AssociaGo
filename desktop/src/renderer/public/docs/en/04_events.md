# 4. Event Management

The **Events & Coupons** page contains two tabs: **Events** (parties, meetings, fundraisers, conferences) and **Coupons** (see chapter 9).

## 4.1 Event list

For each event the table shows:
- title;
- date;
- location;
- status.

**Search events...** filters the list. Each row has the actions **View details**, **Edit** and **Delete**.

## 4.2 Creating an event

Press **Add Event** and fill in:
- **Event Name** and **Type**, both required. The types are Meeting / Assembly, Party, Fundraiser, Congress, Conference, Other.
- **Status**: Planned, Confirmed, In Progress, Completed or Cancelled. Cancelled events do not appear among the Dashboard's upcoming events.
- **Start Date** (required), **Start Time**, **End Date**, **End Time**.
- **Location**, **Address** and **Description**.
- **Member Cost** and **Non-Member Cost**.
- **Max Participants**. If you leave it empty, places are unlimited.
- The options **Public Event**, **Require Registration** and **Generate Invoice**.

## 4.3 Detail page

### Indicators
- **Registered**: number of registrants, excluding cancelled ones and the waiting list.
- **Checked In**: number of participants who have checked in.
- **Attendance Rate**: checked in divided by registered.
- **Revenue**: sum of the recorded payments; for anyone marked as Paid with no recorded amount, the fee due counts, already discounted.

### Participants
**Add Participant** offers two **participant types**:
- **Member**: chosen from the member list.
- **Guest (External)**: you enter name and email.

The fee due is the **Member Cost** for members and the **Non-Member Cost** for guests. The optional **Coupon code** field applies a discount (see 9.3); the table shows the fee due and, if one was used, the coupon with its discount.

For each participant the table shows status, attendance and payment, with the remove action. The **Search participant by name or email** field filters the rows: useful at the entrance with long lists.

On each row:
- **Check in**: marks the participant as present and records the arrival time, shown below the button. The button becomes **Checked in**; press it again to undo the check-in. Participants whose registration was cancelled cannot check in.
- **Payment status**: from the menu on the row choose Pending, Paid, Waived or Refunded. The change is saved immediately.

After each action the indicators at the top update.

### Certificates
Choose a template and press **Issue Batch**: every participant enrolled as a member receives a certificate. External guests do not receive named certificates.

### CSV Import
Here you import participants from a CSV file. The flow (preview, then confirm) is the same as for activities: see chapter 3.
