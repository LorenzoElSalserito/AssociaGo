# 6. Assembly Management

Open **Assemblies** from the **Governance** group of the sidebar. Here you record members' assemblies, attendance and motions, and download the minutes.

## 6.1 Assembly list

For each assembly the table shows:
- title and type;
- date and time;
- first-call quorum (as a percentage);
- status.

**Search assemblies...** filters by title. Click a row or **View details** to open the detail page; the other actions are **Edit** and **Delete**.

## 6.2 Creating an assembly

Press **New Assembly** and fill in:
- **Title** (required) and **Description**.
- **Date** (required, with the time), **Start Time** and **End Time**.
- **Location**.
- **Type**: Ordinary or Extraordinary.
- **Status**: Draft, Called, In Progress, Closed or Cancelled. You change the status by hand, by editing the assembly.
- **President** and **Secretary**: free text, not linked to the member list.
- **First Call Quorum (%)** and **Second Call Quorum (%)**: default values 50 and 33.
- **Notes**.

Press **Create** (or **Update** when editing).

## 6.3 Detail page

At the top you find the **Minutes** and **Edit** buttons and four indicators:
- **Status**;
- **Present**: participants recorded as present;
- **Proxy**: participants recorded by proxy;
- **Quorum**: **Reached** or **Not Reached**.

The quorum is calculated by adding those present and proxies and comparing the total with the number of active members. It is reached if the percentage meets the first-call threshold or the second-call one: in practice the lower threshold is enough.

Below are three tabs.

### Participants
Press **Register Presence** and enter:
- **Select Member** (required);
- **Participation Type**: Present, Proxy or Absent;
- **Role**: Member, President, Secretary or Scrutineer;
- **Proxy Receiver**: appears only with the Proxy type; choose the member who receives the proxy;
- **Notes**.

The registration time is saved automatically. The table shows the member's name, participation type, role and proxy receiver. With **Edit** (pencil icon) you change member, type, role, proxy receiver and notes; with **Delete** you remove the registration.

> Those present and proxies determine the quorum and the maximum number of votes you can record on each motion: update attendance before recording votes.

### Motions
Press **Add Motion** and fill in:
- **Title** (required) and **Description**;
- **Voting Type**: Simple Majority, Qualified Majority, Unanimity or Consultative;
- **Order Number**;
- **Planned (on agenda)**;
- **Notes**.

Press **Save Motion**. The table, sorted by order number, shows voting type, votes and **Outcome**. The actions are **Record vote**, **Edit** (all the motion's fields) and **Delete**.

**Record vote** opens a window with **In favour**, **Against** and **Abstentions**. As you type you see the votes cast against the eligible voters (present + proxies) and the computed outcome. The numbers must be whole and not negative, and the total cannot exceed present plus proxies; with nobody present and no proxies the vote cannot be recorded. Press **Save vote**; **Clear vote** sets the motion back to **Pending**.

The program computes the outcome from the voting type:
- **Simple Majority**: approved if votes in favour exceed votes against (a tie means rejected);
- **Qualified Majority**: approved with at least 2/3 in favour of the votes cast, abstentions included;
- **Unanimity**: approved if there are no votes against and at least one in favour;
- **Consultative**: no binding outcome; the motion shows as **Noted**.

If you change the voting type of a motion already voted on, the outcome is recalculated with the recorded votes.

### Documents
Press **Add Document** and enter **Document Name** (required), **Document Type** (Minutes, Call Notice, Attachment, Budget), **Description** and **Mandatory Document**.

> The **File** field is disabled: file upload is not yet available, so only the document name is recorded.

## 6.4 Minutes

**Minutes** downloads an A4 PDF, in the interface language, with:
- title, type, date, location, president and secretary of the assembly;
- first- and second-call quorum and whether it was reached;
- names of those present and of those participating by proxy, with who received the proxy;
- for each motion, in order: voting type, votes in favour, against and abstentions, outcome (Approved, Rejected, Noted or Awaiting vote) and any resolution;
- the signatures of the president and secretary.

Long motions continue on the following pages. For signatures, what chapter 16 describes applies: the image from **Settings › Signatures** appears only if the name entered in the assembly matches that of the saved signature; otherwise the blank line remains for signing by hand.
