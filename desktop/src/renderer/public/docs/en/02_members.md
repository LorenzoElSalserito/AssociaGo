# 2. Member Management (Members)

The **Members** section is the beating heart of AssociaGo. Here you can manage the complete registry of all members.

## 2.1 Member List
The main table shows:
- **Name and Surname**
- **Email**
- **Status**: (Active, Expired, Suspended)
- **Membership Expiration**: Date of expiry of the registration.
- **Role**: (Member, President, Secretary, etc.)

### Filters and Search
Use the search bar at the top to quickly find a member by typing name, surname, or membership number.

## 2.2 Adding a New Member
Clicking on **"Add Member"** opens a detailed form divided into sections:

### Personal Data
- **Name and Surname**: Mandatory.
- **Date of Birth**: Fundamental for calculating the Fiscal Code (in Italy).
- **Gender**: Male/Female.
- **Place of Birth**: Municipality or foreign country.
- **Cadastral Code**: (e.g., H501 for Rome). Necessary for automatic CF calculation.

### Fiscal Code
The system includes an **automatic calculator**. By entering personal data and clicking "Calculate", the field will be filled automatically. It is always possible to modify it manually.

### Contacts and Address
- **Email and Phone**: For communications.
- **Full Address**: Street, City, ZIP Code.

### Association Data
- **Membership Number**: Assigned manually or automatically if configured.
- **Role**: Defines permissions and social office.
- **Join Date**: Date of entry into the association.

### Contextual Payment Registration
At the bottom of the form, there is the option **"Register Membership Fee Payment"**.
If selected:
1.  Fields for the amount (configurable default) and payment method are activated.
2.  Upon saving, the system **automatically** creates an incoming transaction in the accounting, linked to the new member.

## 2.3 Actions on the Member
For each row in the table, three quick actions are available:
1.  **Renew (Reload Icon)**: Extends the validity of the card for one year (or the configured period) and updates the status to "Active".
2.  **Edit (Pencil Icon)**: Opens the form to update data.
3.  **Delete (Trash Icon)**: Removes the member (irreversible action, but kept in logs).

## 2.4 Membership Card Printing
From the list or detail view, you can download the **Membership Card PDF**, ready for printing, complete with the association logo and member data.
