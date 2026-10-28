# 2. Member Management

The **Members** section holds the personal records of the people enrolled in the association and their memberships.

## 2.1 Member list

The table shows each member's name, email, role, expiry and status.
- **Search members...** filters by first name, last name or email.
- The actions on each row are **Edit**, **Renew Membership** and **Delete**.
- In **ASD** associations the status of the sports medical certificate is also shown. At the top of the list a warning flags expired certificates and those expiring within 30 days.

## 2.2 New member and editing

Press **Add Member**, or use *Register New Member* from the Dashboard or "New Member" from the function search (<kbd>Ctrl</kbd>+<kbd>K</kbd>).

### Personal details
- **First Name**, **Last Name**, **Date of birth** and **Sex** are required.
- **Cadastral code (e.g. H501)** is the code of the municipality of birth (e.g. H501 for Rome).
- **Fiscal Code** is required. The **Calculate** button derives it from first name, last name, date of birth, sex and cadastral code.
- Contacts: **Email**, **Phone**, **Address**, **City**, **ZIP Code**.

### Membership
- **Card number**: free field.
- **Registration date (payment received)**: required, it cannot be in the future. It also serves as the payment date.
- **Type / Offices**: you can tick more than one (Ordinary member, Founding member, Honorary member, President, Vice president, Secretary, Treasurer, Board member).

### Membership fee
For a new member only, **Record membership fee payment** also creates the income entry in Finance:
- suggested amount €20.00, editable;
- method chosen from Cash, Bank Transfer, POS / Card and PayPal.

When editing, the checkbox is not available: later payments are recorded in Finance. The card format and base fee from Settings are not yet applied automatically in this form.

### Sports medical certificate (ASD only)
The **Sports Medical Certificate** section collects:
- type (Agonistic or Non-Agonistic);
- issue date and expiry date;
- certifying doctor, facility and notes.

## 2.3 Renewal and deletion

- **Renew Membership** asks for confirmation and moves the expiry to **one year from today**. Renewal does not record any payment: the fee must be recorded in Finance.
- **Delete** asks for confirmation and removes the member's membership from this association.

## 2.4 CSV/JSON import and export

Press **Import CSV** to open the **Member import/export** panel. To close it use **Hide CSV Import**.

1. **CSV example** / **JSON example** download a sample file with the expected columns.
2. **Export CSV** / **Export JSON** download all current members.
3. Choose a CSV or JSON file and press **Generate Preview**. The summary shows total, valid and duplicate rows and errors.
4. **Confirm Import** imports all valid rows in a single operation.

Rules:
- if a row is invalid, the import is blocked and no data is written;
- members already present are skipped, without overwriting data;
- limit of 5000 rows and 5 MB per file;
- in the CSV export, cells that start with `=`, `+`, `-` or `@` are protected, so spreadsheets do not run them as formulas.

> The printable membership card is not yet available from the interface.
