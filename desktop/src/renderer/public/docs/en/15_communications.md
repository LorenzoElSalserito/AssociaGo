# 15. Communications

The **Communications** page (sidebar, **Governance** group) is used to prepare and send emails to members. It has two tabs: **Messages** and **Templates**; next to each one a counter shows how many items it contains.

## 15.1 Templates

In the **Templates** tab press **New Template** and fill in:
- **Name** (required; without it the **Create** button stays disabled);
- **Subject**;
- **Body (HTML)**: the message text. You can use the placeholders `{{name}}` (recipient's first and last name) and `{{associationName}}` (association name).

The table shows **Template Name** and **Subject**. The actions on each row are edit (pencil, then **Save**) and delete (trash, with confirmation).

## 15.2 Creating a message

In the **Messages** tab press **New Message**.
- **Apply Template**: appears only if at least one template exists and only for new messages. It copies the template's subject and body into the message.
- **Subject** (required).
- **Sender Name** and **Sender Email**. The email becomes the message sender; if you leave it empty, `noreply@associago.local` is used. The sender name is saved but does not appear in the email.
- **Segment Filter**: free text field. If it contains the word `active` the message goes only to members with an active membership; any other text, or an empty field, means all members of the association with an email address.
- **Message Body (HTML)**, with the same placeholders as templates.

Press **Create**. The message starts in **Draft** status.

The messages table shows **Subject**, **Status**, number of **Recipients** and creation **Date**. Only drafts can be edited (pencil); the trash deletes the message after a confirmation.

## 15.3 Recipients and sending

Click a message to open its detail. For a draft:
1. press **Resolve Recipients**: the app builds the list from the association's members, based on the Segment Filter, and shows how many recipients it found. Each email address appears only once; if you press it again, the list is rebuilt from scratch;
2. press **Send** (active only after resolving recipients) and confirm.

The email is sent as plain text: the content written in the editor is converted keeping paragraphs and line breaks, without formatting. Before an important communication, try sending one to your own address.

## 15.4 Detail and statistics

At the top, four boxes: **Total Recipients**, **Delivered**, **Failed** and **Sent At**. Below you find the **Message Content** and the **Recipients** table with name, email, status (Pending, Sent or Failed) and send time.

"Delivered" means the mail server accepted the email, not that it reached the member's inbox.

When sending finishes, the message moves to **Sent**; if no email was accepted by the server, it moves to **Failed**. For partial sends, check the **Failed** box and the recipients' status column.

## 15.5 Configuring the mail server

There is no screen in the app for the email server: your administrator configures it by setting these environment variables before starting AssociaGo.

| Variable | What it is for | Value if missing |
|---|---|---|
| `SMTP_HOST` | address of the outgoing mail server | `localhost` |
| `SMTP_PORT` | server port (usually 587 or 25) | `25` |
| `SMTP_USER` | mailbox username | empty |
| `SMTP_PASSWORD` | mailbox password | empty |
| `SMTP_AUTH` | `true` if the server requires username and password | `false` |
| `SMTP_TLS` | `true` to use the encrypted STARTTLS connection | `false` |

Without these settings the app looks for a mail server on the computer itself: there almost never is one, so all emails end up as **Failed**.
