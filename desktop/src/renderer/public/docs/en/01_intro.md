# 1. AssociaGo: introduction, access and interface

**AssociaGo** is the desktop management app for associations (APS, ASD, ODV, ETS). Your data stays in a local SQLite database, or in a MariaDB database run by your organization (see chapter 10).

This manual describes the features as they exist in the application. When a feature is only partial, it says so.

## 1.1 First launch and login

### First launch: setting up the association
If there is no association on the computer yet, AssociaGo opens the **Setup New Association** form, split into two sections:

1. **Association details**: *Association Name*, *Type* (APS, ASD, ODV, ETS, Other) and *Fiscal Code (C.F.)*. Below the field you see the expected format for the chosen language: for Italian it is 11 digits.
2. **Administrator access**: *Admin Email* and *Master Password*, at least 6 characters. The eye icon shows or hides the password.

Select **Keep me logged in** if you want to sign in automatically on future launches, then press **Initialize Database**. If a field is missing or the fiscal code does not match the format, a warning appears and nothing is created. When it finishes, you go straight into the application.

### Login
On later launches you see **Select Association** with the associations already used on this computer. You can select them with the mouse or the keyboard (Tab, then Enter).

- Choose the association, enter the password and press **Login**.
- **Keep me logged in** saves the login: on the next launch you get in without a password.
- **Add another association** opens the setup form again.
- The trash icon removes the association from this computer's list, after a confirmation. The data in the database is not deleted.
- The language selector is in the top right corner: IT, EN, ES, DE, FR.

At startup AssociaGo checks the listed associations and removes those that no longer exist in the database in use, for example after switching to another database.

### Password recovery
Press **Forgot password?** on the password screen. The procedure also opens on its own after two wrong passwords.

1. **Are these associations yours?** Choose the association and confirm with **YES**.
2. Enter the **association fiscal code**, then the new password twice (at least 6 characters).
3. **Reset password** saves the new password and signs you in right away.

> Recovery relies on the registered fiscal code. Anyone with access to the computer who knows the fiscal code can reset the password: protect your operating system account.

## 1.2 Interface

### Navigation
The sidebar groups the sections into *Overview*, *People*, *Activities*, *Administration*, *Governance* and *Support*. The button at the bottom collapses it to icons only, and expands it again. Also at the bottom you find the application version. Keyboard users can press Tab on opening to activate **Skip to content**.

### Function search (command palette)
Press **Find a function** in the top bar or <kbd>Ctrl</kbd>+<kbd>K</kbd> (<kbd>⌘</kbd>+<kbd>K</kbd> on macOS). Type the name of a section, or "New Member" to open the registration form directly. Use the arrows to move, Enter to open and Esc to close.

### Light and dark theme
The sun/moon button in the top bar switches the theme and remembers it. You can also choose it in **Settings › General**: there the choice must be confirmed with **Save Preferences**.

### Association menu
The circle with the initials, top right, shows the association's name and email. It contains:
- **Settings**;
- **App Info**: version, AGPLv3 license, disclaimers and the **Donate to support** button;
- **Logout**, which ends the session. If you had chosen *Keep me logged in*, that automatic login is removed.

### Connection to the data engine
AssociaGo uses a local engine that starts together with the application.
- If the engine does not respond at startup, a screen with **Retry** appears.
- If the connection drops while you work, the warning "Backend non raggiungibile" (backend unreachable) appears with **Retry**. Reads are repeated, saves are not: before repeating a save, check whether it had already succeeded.

## 1.3 Dashboard

The **Dashboard** is the first page after login.

### Key indicators
Three cards, each with a link to its section:
1. **Active Members**: number of members with *active* status and number of new members in the current month. The status is the one recorded on the membership: the expiry date is not rechecked automatically.
2. **Treasury Balance**: income minus expenses recorded in Finance, with the current month's total income (green) and expenses (red).
3. **Upcoming Events**: future events that are not cancelled, with the name and date of the next one.

### Recent activity
Shows the last 5 operations: new members, payments, events. **View All** shows up to 20. The arrow next to each row opens the related section.

### Quick actions
- **Register New Member** opens the registration form.
- **Create Event** opens the new event form.
- **Record Payment** takes you to Finance.

If the data does not load, a message with **Retry** appears.

### Manual
This manual opens from the **User Manual** item in the sidebar and follows the interface language.
