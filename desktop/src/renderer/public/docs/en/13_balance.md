# 13. Annual Financial Statement

The **Annual Balance** page calculates a year's financial statement from the transactions recorded in the accounts.

## 13.1 Statement list

The table shows **Year**, **Title**, **Status** and **Net Result** (green if positive, red if negative). Click a row to open the statement. The **trash** icon deletes it, after the **Are you sure?** confirmation.

## 13.2 Calculating a statement

1. Press **Compute Balance**.
2. In the **Compute Annual Balance** window enter the **Year**.
3. Press **Compute**.

The system takes the transactions from 1 January to 31 December, groups them by category (those without a category go into "Other income" or "Other expenses") and creates the statement "Annual financial statement YEAR". The title and generic items are written in the interface language at the time of the calculation.

> If a statement already exists for that year, it is recalculated and overwritten, even if it was approved, and goes back to a non-approved status.

## 13.3 Detail

At the top, three boxes: **Total Income**, **Total Expenses** and **Net Result**. Below, two tables, **Income** and **Expenses**, with one row per category and the total in bold (TOTAL INCOME, TOTAL EXPENSES).

> The comparison with the previous year is calculated but shown neither on the page nor in the PDF.

## 13.4 Signatories

On opening, the system automatically checks that **President**, **Secretary** and **Treasurer** have a name in **Settings › Signatures** or in the **Organization Chart** (**Settings › Association Profile**). If one is missing, the **Missing signers** warning appears followed by the roles as English codes (president, secretary, treasurer).

## 13.5 Approval

**Approve** moves the statement to the approved status. It stays disabled while even one of the three signatories is missing; after approval it disappears.

> Approval does not make the statement immutable: it can still be deleted or recalculated.

## 13.6 PDF

**Download PDF** is available in every status, even before approval, and saves the file `bilancio_YEAR.pdf` in A4 format, in the interface language (labels, dates and amounts). It contains:
- the association's name, address, city and fiscal code;
- the title "ANNUAL FINANCIAL STATEMENT YEAR" and the period;
- income and expenses by category with totals;
- "OPERATING SURPLUS" or "OPERATING DEFICIT", opening and closing fund;
- a "Signatures" section for President, Secretary and Treasurer: signature image from **Settings › Signatures** (chapter 16), name and office; without a saved signature, the name from the Organization Chart and a blank line;
- generation date and time and page number.

> The PDF contains no logo or approval date.

On each download a SHA-256 checksum of the PDF is calculated. Its first 16 digits appear next to the status after you leave and reopen the page.

> **Note**: the annual financial statement is mandatory for Third Sector entities and must be approved by the assembly within the legal deadlines (usually by 30 April of the following year).
