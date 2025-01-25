package tech.jhipster.lite.generator.server.springboot.database.jooq.domain;

import static tech.jhipster.lite.module.domain.JHipsterModule.artifactId;
import static tech.jhipster.lite.module.domain.JHipsterModule.groupId;
import static tech.jhipster.lite.module.domain.JHipsterModule.mavenPlugin;
import static tech.jhipster.lite.module.domain.JHipsterModule.moduleBuilder;
import static tech.jhipster.lite.module.domain.JHipsterModule.pluginExecution;
import static tech.jhipster.lite.module.domain.mavenplugin.MavenBuildPhase.GENERATE_RESOURCES;

import tech.jhipster.lite.module.domain.JHipsterModule;
import tech.jhipster.lite.module.domain.mavenplugin.MavenPlugin;
import tech.jhipster.lite.module.domain.properties.JHipsterModuleProperties;
import tech.jhipster.lite.shared.error.domain.Assert;

public class JooqModuleFactory {

  public JHipsterModule buildPostgresql(JHipsterModuleProperties properties) {
    //@formatter:off
    return commonModuleBuilder(properties)
      .mavenPlugins()
        .plugin(jooqMavenCodegenPlugin(postgresqlPluginConfiguration(properties)))
        .and()
      .build();
    //@formatter:on
  }

  private static String postgresqlPluginConfiguration(JHipsterModuleProperties properties) {
    return JooqModuleCodegenConfiguration.builder()
      .database(DatabaseType.POSTGRESQL)
      .databaseUrl("jdbc:postgresql://localhost:5432/" + properties.projectBaseName().name())
      .user(properties.projectBaseName().name())
      .inputSchema("public")
      .build()
      .getConfiguration();
  }

  public JHipsterModule buildMariaDB(JHipsterModuleProperties properties) {
    //@formatter:off
    return commonModuleBuilder(properties)
      .mavenPlugins()
        .plugin(jooqMavenCodegenPlugin(mariadbPluginConfiguration(properties)))
        .and()
      .build();
    //@formatter:on
  }

  private static String mariadbPluginConfiguration(JHipsterModuleProperties properties) {
    return JooqModuleCodegenConfiguration.builder()
      .database(DatabaseType.MARIADB)
      .databaseUrl("jdbc:mariadb://localhost:3306/" + properties.projectBaseName().name())
      .user("root")
      .inputSchema(properties.projectBaseName().name())
      .build()
      .getConfiguration();
  }

  public JHipsterModule buildMySQL(JHipsterModuleProperties properties) {
    //@formatter:off
    return commonModuleBuilder(properties)
      .mavenPlugins()
        .plugin(jooqMavenCodegenPlugin(mysqlPluginConfiguration(properties)))
        .and()
      .build();
    //@formatter:on
  }

  private static String mysqlPluginConfiguration(JHipsterModuleProperties properties) {
    return JooqModuleCodegenConfiguration.builder()
      .database(DatabaseType.MYSQL)
      .databaseUrl("jdbc:mysql://localhost:3306/" + properties.projectBaseName().name())
      .user("root")
      .inputSchema(properties.projectBaseName().name())
      .build()
      .getConfiguration();
  }

  public JHipsterModule buildMsSQL(JHipsterModuleProperties properties) {
    //@formatter:off
    return commonModuleBuilder(properties)
      .mavenPlugins()
        .plugin(jooqMavenCodegenPlugin(mssqlPluginConfiguration(properties)))
        .and()
      .build();
    //@formatter:on
  }

  private static String mssqlPluginConfiguration(JHipsterModuleProperties properties) {
    return JooqModuleCodegenConfiguration.builder()
      .database(DatabaseType.MSSQL)
      .databaseUrl("jdbc:sqlserver://localhost:1433;database=" + properties.projectBaseName().name() + ";trustServerCertificate=true")
      .user("SA")
      .inputSchema("model")
      .password("yourStrong(!)Password")
      .getConfiguration();
  }

  public static JHipsterModule.JHipsterModuleBuilder commonModuleBuilder(JHipsterModuleProperties properties) {
    Assert.notNull("properties", properties);

    return moduleBuilder(properties)
      .javaDependencies()
      .addDependency(groupId("org.springframework.boot"), artifactId("spring-boot-starter-jooq"))
      .and();
  }

  private static MavenPlugin jooqMavenCodegenPlugin(String pluginConfiguration) {
    return mavenPlugin()
      .groupId("org.jooq")
      .artifactId("jooq-codegen-maven")
      .versionSlug("jooq")
      .addExecution(pluginExecution().goals("generate").id("jooq-codegen").phase(GENERATE_RESOURCES))
      .configuration(pluginConfiguration)
      .build();
  }
}
