package com.associago.sync;

import com.associago.association.Association;
import com.associago.association.repository.AssociationRepository;
import com.associago.member.Member;
import com.associago.member.repository.MemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Service
public class DatabaseMigrationService {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationService.class);

    private final AssociationRepository associationRepository;
    private final MemberRepository memberRepository;

    public DatabaseMigrationService(AssociationRepository associationRepository, MemberRepository memberRepository) {
        this.associationRepository = associationRepository;
        this.memberRepository = memberRepository;
    }

    public void migrateFromOldDb(String oldDbPath) {
        String url = "jdbc:sqlite:" + oldDbPath;
        logger.info("Starting migration from old database: {}", oldDbPath);

        try (Connection conn = DriverManager.getConnection(url)) {
            if (conn != null) {
                logger.info("Connected to the old database.");
                migrateAssociations(conn);
                migrateMembers(conn);
                // Other migration methods will be called here
            }
        } catch (Exception e) {
            logger.error("Migration failed", e);
        }
    }

    private void migrateAssociations(Connection conn) {
        String sql = "SELECT * FROM associations";
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Association newAssoc = new Association();
                newAssoc.setName(rs.getString("name"));
                // ... map other fields
                associationRepository.save(newAssoc);
                logger.info("Migrated association: {}", newAssoc.getName());
            }
        } catch (Exception e) {
            logger.error("Failed to migrate associations", e);
        }
    }

    private void migrateMembers(Connection conn) {
        String sql = "SELECT * FROM users";
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Member newMember = new Member();
                newMember.setFirstName(rs.getString("first_name"));
                newMember.setLastName(rs.getString("last_name"));
                newMember.setFiscalCode(rs.getString("tax_code"));
                // ... map other fields
                memberRepository.save(newMember);
                logger.info("Migrated member: {} {}", newMember.getFirstName(), newMember.getLastName());
            }
        } catch (Exception e) {
            logger.error("Failed to migrate members", e);
        }
    }
}
