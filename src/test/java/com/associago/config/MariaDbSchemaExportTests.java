package com.associago.config;

import jakarta.persistence.Entity;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.tool.schema.spi.SchemaManagementToolCoordinator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import java.util.HashMap;

class MariaDbSchemaExportTests {
    @Test
    @EnabledIfEnvironmentVariable(named="ASSOCIAGO_SCHEMA_EXPORT",matches=".+")
    void exportCurrentMappingForReviewedBaseline() throws Exception {
        var settings=new HashMap<String,Object>();
        settings.put("hibernate.dialect","org.hibernate.dialect.MariaDBDialect");
        settings.put("hibernate.boot.allow_jdbc_metadata_access",false);
        settings.put("hibernate.auto_quote_keyword",true);
        settings.put("hibernate.physical_naming_strategy","org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy");
        settings.put("jakarta.persistence.schema-generation.scripts.action","create");
        settings.put("jakarta.persistence.schema-generation.scripts.create-target",System.getenv("ASSOCIAGO_SCHEMA_EXPORT"));
        settings.put("hibernate.hbm2ddl.delimiter",";");
        var registry=new StandardServiceRegistryBuilder().applySettings(settings).build();
        try {
            var sources=new MetadataSources(registry);
            var scanner=new ClassPathScanningCandidateComponentProvider(false);
            scanner.addIncludeFilter(new AnnotationTypeFilter(Entity.class));
            for(var bean:scanner.findCandidateComponents("com.associago")) sources.addAnnotatedClass(Class.forName(bean.getBeanClassName()));
            SchemaManagementToolCoordinator.process(sources.buildMetadata(),registry,settings,action -> {});
        } finally {StandardServiceRegistryBuilder.destroy(registry);}
    }
}
