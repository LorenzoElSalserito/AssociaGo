# 10. Settings and database

**Settings** opens from the sidebar or from the association menu, top right. There are seven tabs: **Association Profile**, **Finance**, **General**, **Registry**, **Signatures**, **Database** and **Audit log**.

## 10.1 Association Profile

To change the data press **Edit Profile** and, when you are done, **Save Changes**.
- **Identity**: Association Name, Type, Fiscal Code, VAT Number, Foundation Date.
- **Contacts**: Email, Phone, Address, City, Province, ZIP Code.
- **Organization Chart**: President, Vice President, Secretary, Treasurer. These names end up in official documents: the annual financial statement and certificate signatories.
- **Documents**: Statute Path/Link and Regulation Path/Link.
- **Association Logo**: press **Upload New** and choose a PNG or JPG. 500×500 px is recommended.
- **Configuration**: Membership Number Format (`YYYY` for the year, `####` for the sequential number) and Base Membership Fee.

> The card format and base fee are saved, but the member form does not yet apply them automatically (see chapter 2).

## 10.2 Finance

Here you manage **Payment Methods** with **Add Method**:
- **Method Name**;
- **Type**: Cash, Bank Transfer, Online Payment, Other;
- **Active**, i.e. whether the method is available in transactions;
- **Apply Commission**, with **Fixed Commission (€)** and/or **Percentage Commission (%)**.

Each method can be edited or deleted.

## 10.3 General

- **Language**: Italian, English, Spanish, German, French.
- **Theme**: Light or Dark. The choice takes effect after **Save Preferences**. The sun/moon button in the top bar switches the theme instantly.
- **Interface zoom**: 50%, 75%, 100%, 125%, 150%, 175% or 200%. It applies immediately and is remembered.
- **Data Management**: **Backup Now** (see 10.6).
- **App Info**: version, license, disclaimers, **Report Bug** (opens a pre-filled email with the version) and the **Support AssociaGo** box with **Donate to support**.

## 10.4 Registry, Signatures and Audit log

- **Registry**: the association's Locations, Documents and Deadlines (see chapter 18).
- **Signatures**: the institutional signatures (see chapter 16).
- **Audit log**: the list of data creations, changes and deletions, with filters by area, action and dates (see chapter 18).

## 10.5 Database

AssociaGo can work with two types of database:

| | **Local SQLite** (default) | **Remote MariaDB** |
|---|---|---|
| Where the data is | In a file on the computer | On a MariaDB server run by your organization |
| Typical use | A single workstation | Several workstations on the same data |
| Configuration | None | Host, port, database, user, password |

The box at the top shows the database in use: **Active: local SQLite** or **Active: MariaDB**.

### Connecting a MariaDB database
1. Ask your administrator for an **empty, dedicated database** and a user with read, write and table creation permissions.
2. Make a backup (see 10.6).
3. Turn on **Use Remote Database** and fill in **Host**, **Port** (usually 3306), **Database Name**, **Username** and **Password**.
4. If the server requires it, turn on **Use SSL Connection**. AssociaGo verifies the server certificate.
5. Press **Test connection**. AssociaGo opens the connection and tries to write and read back a temporary value. If it succeeds, "Connection verified: read and write succeeded." appears.
6. Press **Save Database Settings**. Saving repeats the test: if the credentials are wrong, the configuration is not saved.
7. **Close and reopen AssociaGo.** The new connection only activates when you reopen it.

The first time it opens on an empty database, AssociaGo creates the tables and shows the first-launch form (chapter 1) so you can create the association on the server.

### Things to know
- **Data is not transferred.** Local SQLite and MariaDB remain two separate stores. To move members from one to the other, use CSV/JSON export and import (chapter 2).
- To go back to SQLite, turn off **Use Remote Database**, save and reopen the app. The local data is still there.
- The database password is never shown again. If you leave the field empty and do not change host, user and database, the saved one remains valid.
- Connection errors do not show internal addresses or credentials.

## 10.6 Backup

**Backup Now** (Settings › General) saves a copy of the database in the `backups` folder of AssociaGo's data (`~/.associago/backups` by default). When it finishes, the file path is shown.

- **SQLite**: a consistent copy of the database (`.db`), created even while the app is in use.
- **MariaDB**: a JSON snapshot (`.json`) of all tables.

The backup only includes the database: logos and external files are not included.

> Restore is not automatic. For SQLite, with the app closed, replace the database file with the copy. The MariaDB JSON snapshot serves as an archive and cannot be imported from the interface.
