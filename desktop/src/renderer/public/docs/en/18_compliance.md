# 18. Compliance and Audit

The compliance tools available today are in the **Settings › Registry** tab: the association's locations, institutional documents and deadlines.

**Audit log.** AssociaGo automatically records every **creation**, **change** and **deletion** of the main data: members and memberships, transactions and invoices, activities, events and participants, assemblies and motions, inventory and loans, volunteers, shifts and reimbursements, coupons, budgets, financial statements, certificates, communications, association profile, signatures and database settings.

To consult it open **Settings › Audit log**. The table, starting from the most recent entry, shows:
- **Date and time** of the operation;
- **Area** (for example Members, Finance, Events);
- **Action**: Created, Updated or Deleted;
- **Record**: the data type and its identification number;
- **Details**: for changes, the names of the changed fields.

You can filter by **Area**, **Action** and date range (**From**, **To**); **Clear filters** goes back to the full list. Entries are split into pages of 25.

What is **not** recorded:
- field values, neither before nor after the change: only their names;
- passwords, access codes, database credentials, logo and signature images;
- who performed the operation: access is per association, not per individual user.

> Each association sees only its own log. The log cannot be edited from the app and is deleted together with the association.

## 18.1 Locations

Fill in the row at the top and press **Add**:
- type: **Registered office**, **Operational site** or **Project site**;
- **Name**, **Address**, **City** and province (**Prov.**).

The table shows **Type**, **Name**, **Address** and **Contacts**. The trash deletes the location.

> The **Contacts** column stays empty: the form has no fields for the location's phone and email.

## 18.2 Documents

To archive the statute, regulations and other deeds:
1. choose the type: **Statute**, **Regulations** or **Attachment**;
2. enter a **Title**;
3. select the file and press **Upload**.

The file is copied into AssociaGo's data folder. The table shows **Type**, **Title** and, in the **File** column, the path where it is stored. The trash deletes both the row and the copied file.

> You cannot open or download the document from the app: to consult it, open the file from the path shown.

## 18.3 Deadlines

To track obligations such as insurance renewals, tax returns or mandatory assemblies:
- **Title** and due date;
- category: **Tax**, **Legal**, **Governance**, **Insurance** or **Other**;
- a numeric field, preset to 30: the days of advance notice.

Press **Add**. The table shows **Title**, **Due date**, **Category** and **Status**. When the obligation is fulfilled press **Mark completed**: the deadline becomes completed and the button disappears. The trash deletes it.

> Deadlines are a reminder to check by hand. The advance notice days are saved, but the app sends no alerts or notifications, does not flag overdue deadlines and does not recreate recurring ones.

> Deletions in this tab (locations, documents, deadlines) are immediate and ask for no confirmation.
