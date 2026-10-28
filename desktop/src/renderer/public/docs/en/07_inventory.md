# 7. Inventory Management

Open **Inventory** from the **Activities** group of the sidebar. Here you record the association's assets and equipment and loans to members.

## 7.1 Item list

For each item the table shows:
- name and inventory code;
- category;
- quantity;
- status.

**Search items...** filters by name. Click a row or **View details** to open the detail page; the other actions are **Edit** and **Delete**.

## 7.2 Adding an item

Press **Add Item** and fill in:
- **Item Name** (required) and **Inventory Code** (e.g. INV-001).
- **Description**.
- **Category**: free text, you choose the categories.
- **Quantity** and **Location**.
- **Acquisition Method**: Purchase, Donation, Loan or Unknown.
- **Assigned To (User ID)**: optional, you enter the ID number, not the name.
- **Current Value** and **Depreciation Years**, optional.
- **Condition**: New, Good, Fair, Poor or Broken.
- **Status**: Available, In Use, Loaned, Lost or Disposed.
- **Notes**.

Condition and status are independent: the first describes the physical state, the second where the item is or how it is used.

### Purchase
With **Purchase**, **Purchase Price** and **Purchase Date** appear. On creation, if the price is greater than zero, AssociaGo automatically records an expense in Finance with that amount and the purchase date (or today's date).

> The expense is only created when you add the item: if you later change the price, the transaction is not updated.

### Value and depreciation
The current value is recalculated from the purchase price: if price, purchase date and depreciation years are all present, a fixed amount is subtracted for each year elapsed until it reaches zero; otherwise it equals the purchase price.

> A value entered by hand in **Current Value** is not kept: when read, it is replaced by the calculated value.

Press **Create** (or **Update** when editing).

## 7.3 Detail page

At the top you find the **Edit** button and three indicators: **Quantity**, **Condition** and **Status**. Below the name, category and location appear.

### Loans History
Press **Register Loan** and enter:
- **Select Member** (required);
- **Loan Date** and **Expected Return Date**;
- **Condition on Loan**: New, Good, Fair, Poor or Broken;
- **Notes**.

The table shows **Member ID**, **Loan Date**, **Return Date** (or the expected date followed by "(Exp)" until the item comes back) and status. On ongoing loans press **Return** and confirm: today's date is recorded.

> Recording or closing a loan does not change the item's status or quantity: update them by hand with **Edit**. The condition on return is not recorded.
