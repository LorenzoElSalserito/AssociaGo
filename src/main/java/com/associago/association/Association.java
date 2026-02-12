package com.associago.association;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "associations")
public class Association {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Identity ---
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String slug;

    @Column(nullable = false)
    private String email;

    @Column(name = "password")
    private String password; // Hashed master password

    @Column(name = "tax_code")
    private String taxCode; // Codice Fiscale

    @Column(name = "vat_number")
    private String vatNumber; // Partita IVA

    private String type; // APS, ASD, ODV...

    // --- Contact & Address ---
    private String address;
    private String city;
    private String province;
    
    @Column(name = "zip_code")
    private String zipCode;
    
    private String phone;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    // --- Organization ---
    private String president;
    
    @Column(name = "vice_president")
    private String vicePresident;
    
    private String secretary;
    private String treasurer;

    // --- Files & Assets ---
    @Column(name = "logo")
    @JdbcTypeCode(SqlTypes.VARBINARY)
    private byte[] logo;

    @Column(name = "statute_path")
    private String statutePath;

    @Column(name = "regulation_path")
    private String regulationPath;

    // --- Configuration ---
    @Column(name = "foundation_date")
    private LocalDate foundationDate;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "membership_number_format")
    private String membershipNumberFormat = "YYYY-####";

    @Column(name = "base_membership_fee")
    private Double baseMembershipFee = 0.0;

    // --- Remote Database Config ---
    @Column(name = "use_remote_db")
    private boolean useRemoteDb = false;

    @Column(name = "db_type")
    private String dbType = "sqlite"; // sqlite, mariadb

    @Column(name = "db_host")
    private String dbHost;

    @Column(name = "db_port")
    private Integer dbPort;

    @Column(name = "db_name")
    private String dbName;

    @Column(name = "db_user")
    private String dbUser;

    @Column(name = "db_password")
    private String dbPassword;

    @Column(name = "db_ssl")
    private boolean dbSsl = false;

    // --- Metadata ---
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }

    public String getVatNumber() { return vatNumber; }
    public void setVatNumber(String vatNumber) { this.vatNumber = vatNumber; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPresident() { return president; }
    public void setPresident(String president) { this.president = president; }

    public String getVicePresident() { return vicePresident; }
    public void setVicePresident(String vicePresident) { this.vicePresident = vicePresident; }

    public String getSecretary() { return secretary; }
    public void setSecretary(String secretary) { this.secretary = secretary; }

    public String getTreasurer() { return treasurer; }
    public void setTreasurer(String treasurer) { this.treasurer = treasurer; }

    public byte[] getLogo() { return logo; }
    public void setLogo(byte[] logo) { this.logo = logo; }

    public String getStatutePath() { return statutePath; }
    public void setStatutePath(String statutePath) { this.statutePath = statutePath; }

    public String getRegulationPath() { return regulationPath; }
    public void setRegulationPath(String regulationPath) { this.regulationPath = regulationPath; }

    public LocalDate getFoundationDate() { return foundationDate; }
    public void setFoundationDate(LocalDate foundationDate) { this.foundationDate = foundationDate; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getMembershipNumberFormat() { return membershipNumberFormat; }
    public void setMembershipNumberFormat(String membershipNumberFormat) { this.membershipNumberFormat = membershipNumberFormat; }

    public Double getBaseMembershipFee() { return baseMembershipFee; }
    public void setBaseMembershipFee(Double baseMembershipFee) { this.baseMembershipFee = baseMembershipFee; }

    public boolean isUseRemoteDb() { return useRemoteDb; }
    public void setUseRemoteDb(boolean useRemoteDb) { this.useRemoteDb = useRemoteDb; }

    public String getDbType() { return dbType; }
    public void setDbType(String dbType) { this.dbType = dbType; }

    public String getDbHost() { return dbHost; }
    public void setDbHost(String dbHost) { this.dbHost = dbHost; }

    public Integer getDbPort() { return dbPort; }
    public void setDbPort(Integer dbPort) { this.dbPort = dbPort; }

    public String getDbName() { return dbName; }
    public void setDbName(String dbName) { this.dbName = dbName; }

    public String getDbUser() { return dbUser; }
    public void setDbUser(String dbUser) { this.dbUser = dbUser; }

    public String getDbPassword() { return dbPassword; }
    public void setDbPassword(String dbPassword) { this.dbPassword = dbPassword; }

    public boolean isDbSsl() { return dbSsl; }
    public void setDbSsl(boolean dbSsl) { this.dbSsl = dbSsl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
