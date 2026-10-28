import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('Upgrade schema preserves legacy votes, invoices, participants and loans', () => {
  execFileSync('python3', ['-c', `
import sqlite3, pathlib, sys
c = sqlite3.connect(':memory:')
files = sorted(pathlib.Path(sys.argv[1]).glob('V*.sql'), key=lambda p:int(p.name.split('__')[0][1:]))
for p in files:
 if int(p.name.split('__')[0][1:]) <= 32: c.executescript(p.read_text())
c.executescript("""
INSERT INTO assembly_motions(id,assembly_id,title,votes_for,votes_against,votes_abstain,result) VALUES(7,1,'Decisione',8,2,1,'APPROVED');
INSERT INTO invoices(id,association_id,number,date,recipient_name,total_amount,status,pdf_path) VALUES(8,1,'2026-01','2026-01-01','Mario',125,'PAID','original.pdf');
INSERT INTO assembly_participants(id,assembly_id,member_id,is_present,user_association_id,notes) VALUES(9,1,21,1,21,'Preservare presenza');
INSERT INTO inventory_loans(id,item_id,member_id,loan_date,notes) VALUES(10,1,21,'2026-01-01','Preservare prestito');
""")
for p in files:
 if int(p.name.split('__')[0][1:]) > 32: c.executescript(p.read_text())
assert c.execute('SELECT id,votes_in_favor,valid_votes,is_approved,result FROM assembly_motions').fetchone() == (7,8,11,1,'APPROVED')
assert c.execute('SELECT id,amount,issue_date,is_paid,file_path,total_amount FROM invoices').fetchone() == (8,125,'2026-01-01',1,'original.pdf',125)
assert c.execute('SELECT id,member_id,notes FROM assembly_participants').fetchone() == (9,21,'Preservare presenza')
assert c.execute('SELECT id,member_id,notes FROM inventory_loans').fetchone() == (10,21,'Preservare prestito')
c.execute("INSERT INTO assembly_participants(assembly_id,user_association_id,participation_type) VALUES(1,31,'PRESENT')")
c.execute("INSERT INTO inventory_loans(item_id,user_association_id,loan_date) VALUES(1,31,'2026-01-02')")
assert c.execute('SELECT count(*) FROM assembly_participants').fetchone()[0] == 2
assert c.execute('SELECT count(*) FROM inventory_loans').fetchone()[0] == 2
`, fileURLToPath(new URL('../../src/main/resources/db/migration', import.meta.url))]);
});
