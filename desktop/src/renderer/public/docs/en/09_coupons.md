# 9. Coupons and Discounts

Coupons are discount codes for activities and events. You manage them from three places, which show the same list:
- the **Coupons** item in the **Activities** group of the sidebar;
- the **Coupons** tab of the **Activities & Coupons** page;
- the **Coupons** tab of the **Events & Coupons** page.

## 9.1 Coupon list

For each coupon the table shows:
- **Code**;
- **Discount**: percentage or amount in euros, with the minimum amount if set;
- **Validity**: start and end date (∞ if it does not expire);
- **Uses**: registrations saved with the coupon out of the maximum allowed (∞ if unlimited);
- **Status**: **Active** or **Inactive**.

The actions on each row are **Edit** and **Delete**.

## 9.2 Creating a coupon

Press **Add Coupon** and fill in:
- **Coupon Code** (required), e.g. SUMMER2026.
- **Description**.
- **Discount Type**: Percentage or Fixed Amount.
- **Discount Value** (required).
- **Start Date** (today by default) and **End Date**.
- **Max Uses (0 for unlimited)**.
- **Minimum Amount**.
- **Applicable Activities** and **Applicable Events**: multiple selection. If you choose at least one activity or event, the coupon applies only to those chosen; leave both lists empty to make it valid everywhere.
- **Active**.

Press **Save Coupon**.

## 9.3 Use

You enter the code in the **Coupon code** field of the **Add Participant** form, in both activities and events (members and guests). Case does not matter. Press **Apply** to see price, discount and **amount due** before saving.

The starting price is:
- for activities, the activity cost;
- for events, the member cost for members and the non-member cost for guests.

A percentage discount is rounded to the cent; a fixed discount never exceeds the price, so the amount due never goes below zero.

The coupon is refused, with a message, if:
- the code does not exist in the association;
- it is not **Active**;
- today is before the **Start Date** or after the **End Date** (the end date is included);
- it has reached **Max Uses** (0 = unlimited);
- the price is below the **Minimum Amount**;
- it does not apply to the chosen activity or event (see 9.2).

On saving, the program checks the coupon again: if it is no longer valid in the meantime, the registration is not saved. If it is valid, the participant keeps the coupon, the discount and the amount due, and **Uses** goes up by 1. The coupon appears as a label in the participants table and **Revenue** uses the discounted amount.

> Removing a participant does **not** give back the use: the counter counts the coupons used, including for registrations later deleted. If needed, increase **Max Uses** from the edit form.
