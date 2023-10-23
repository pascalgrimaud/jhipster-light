package tech.jhipster.lite.generator;

import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import tech.jhipster.lite.module.domain.resource.JHipsterModuleSlugFactory;

public enum JHLiteModuleSlug implements JHipsterModuleSlugFactory {
  ANGULAR_CORE("angular-core"),
  ANGULAR_HEALTH("angular-health"),
  ANGULAR_JWT("angular-jwt"),
  ANGULAR_OAUTH_2("angular-oauth2"),
  APPLICATION_SERVICE_HEXAGONAL_ARCHITECTURE_DOCUMENTATION("application-service-hexagonal-architecture-documentation"),
  BANNER_JHIPSTER_V2("banner-jhipster-v2"),
  BANNER_JHIPSTER_V3("banner-jhipster-v3"),
  BANNER_JHIPSTER_V7("banner-jhipster-v7"),
  BANNER_JHIPSTER_V7_REACT("banner-jhipster-v7-react"),
  BANNER_JHIPSTER_V7_VUE("banner-jhipster-v7-vue"),
  CAFFEINE_CACHE("caffeine-cache"),
  CASSANDRA("cassandra"),
  CASSANDRA_MIGRATION("cassandra-migration"),
  CHECKSTYLE("checkstyle"),
  CONSUL("consul"),
  CUSTOM_JHLITE("custom-jhlite"),
  CYPRESS("cypress"),
  DOCKERFILE("dockerfile"),
  DUMMY_CASSANDRA_PERSISTENCE("dummy-cassandra-persistence"),
  DUMMY_FEATURE("dummy-feature"),
  DUMMY_JPA_PERSISTENCE("dummy-jpa-persistence"),
  DUMMY_LIQUIBASE_CHANGELOG("dummy-liquibase-changelog"),
  DUMMY_MONGODB_PERSITENCE("dummy-mongodb-persistence"),
  DUMMY_NOT_POSTGRESQL_FLYWAY_CHANGELOG("dummy-not-postgresql-flyway-changelog"),
  DUMMY_POSTGRESQL_FLYWAY_CHANGELOG("dummy-postgresql-flyway-changelog"),
  EHCACHE_JAVA_CONFIG("ehcache-java-config"),
  EHCACHE_XML_CONFIG("ehcache-xml-config"),
  EUREKA_CLIENT("eureka-client"),
  FLYWAY("flyway"),
  FLYWAY_MYSQL("flyway-mysql"),
  FRONTEND_MAVEN_PLUGIN("frontend-maven-plugin"),
  GATEWAY("gateway"),
  GIT_INFORMATION("git-information"),
  GITHUB_ACTIONS("github-actions"),
  GITHUB_CODESPACES("github-codespaces"),
  GITLAB_CI("gitlab-ci"),
  GITPOD("gitpod"),
  GRADLE_JAVA("gradle-java"),
  GRADLE_WRAPPER("gradle-wrapper"),
  HIBERNATE_2ND_LEVEL_CACHE("hibernate-2nd-level-cache"),
  INFINITEST_FILTERS("infinitest-filters"),
  INIT("init"),
  INTERNATIONALIZED_ERRORS("internationalized-errors"),
  JACOCO_CHECK_MIN_COVERAGE("jacoco-check-min-coverage"),
  JAVA_ARCHUNIT("java-archunit"),
  JAVA_BASE("java-base"),
  JAVA_ENUMS("java-enums"),
  JAVA_MEMOIZERS("java-memoizers"),
  JIB("jib"),
  JPA_PAGINATION("jpa-pagination"),
  KIPE_AUTHORIZATION("kipe-authorization"),
  KIPE_EXPRESSION("kipe-expression"),
  LIQUIBASE("liquibase"),
  LOGSTASH("logstash"),
  LOGS_SPY("logs-spy"),
  MARIADB("mariadb"),
  MAVEN_JAVA("maven-java"),
  MAVEN_WRAPPER("maven-wrapper"),
  MONGOCK("mongock"),
  MONGODB("mongodb"),
  REDIS("redis"),
  MSSQL("mssql"),
  MYSQL("mysql"),
  NEO4J("neo4j"),
  NEO4J_MIGRATIONS("neo4j-migrations"),
  OPTIONAL_TYPESCRIPT("optional-typescript"),
  PAGINATION_DOMAIN("pagination-domain"),
  PLAYWRIGHT("playwright"),
  POSTGRESQL("postgresql"),
  PRETTIER("prettier"),
  REACT_CORE("react-core"),
  REACT_JWT("react-jwt"),
  REST_PAGINATION("rest-pagination"),
  SONAR_QUBE_JAVA_BACKEND("sonar-qube-java-backend"),
  SONAR_QUBE_JAVA_BACKEND_AND_FRONTEND("sonar-qube-java-backend-and-frontend"),
  SPRING_BOOT("spring-boot"),
  SPRING_BOOT_ACTUATOR("spring-boot-actuator"),
  SPRING_BOOT_ASYNC("spring-boot-async"),
  SPRING_BOOT_CACHE("spring-boot-cache"),
  SPRING_BOOT_CUCUMBER_MVC("spring-boot-cucumber-mvc"),
  SPRING_BOOT_CUCUMBER_WEBFLUX("spring-boot-cucumber-webflux"),
  SPRING_BOOT_CUCUMBER_JPA_RESET("spring-boot-cucumber-jpa-reset"),
  SPRING_BOOT_CUCUMBER_JWT_AUTHENTICATION("spring-boot-cucumber-jwt-authentication"),
  SPRING_BOOT_CUCUMBER_OAUTH_2_AUTHENTICATION("spring-boot-cucumber-oauth2-authentication"),
  SPRING_BOOT_DEVTOOLS("spring-boot-devtools"),
  SPRING_BOOT_JWT("spring-boot-jwt"),
  SPRING_BOOT_JWT_BASIC_AUTH("spring-boot-jwt-basic-auth"),
  SPRING_BOOT_KAFKA("spring-boot-kafka"),
  SPRING_BOOT_KAFKA_AKHQ("spring-boot-kafka-akhq"),
  SPRING_BOOT_KAFKA_DUMMY_PRODUCER_CONSUMER("spring-boot-kafka-dummy-producer-consumer"),
  SPRING_BOOT_OAUTH_2("spring-boot-oauth2"),
  SPRING_BOOT_OAUTH_2_ACCOUNT("spring-boot-oauth2-account"),
  SPRING_BOOT_OAUTH_2_AUTH_0("spring-boot-oauth2-auth0"),
  SPRING_BOOT_OAUTH_2_OKTA("spring-boot-oauth2-okta"),
  SPRING_BOOT_PULSAR("spring-boot-pulsar"),
  SPRING_BOOT_MVC_EMPTY("spring-boot-mvc-empty"),
  SPRING_BOOT_TOMCAT("spring-boot-tomcat"),
  SPRING_BOOT_UNDERTOW("spring-boot-undertow"),
  SPRING_BOOT_WEBFLUX_EMPTY("spring-boot-webflux-empty"),
  SPRING_BOOT_WEBFLUX_NETTY("spring-boot-webflux-netty"),
  SPRING_CLOUD("spring-cloud"),
  SPRINGDOC_JWT("springdoc-jwt"),
  SPRINGDOC_MVC_OPENAPI("springdoc-mvc-openapi"),
  SPRINGDOC_OAUTH_2("springdoc-oauth2"),
  SPRINGDOC_OAUTH_2_AUTH_0("springdoc-oauth2-auth0"),
  SPRINGDOC_OAUTH_2_OKTA("springdoc-oauth2-okta"),
  SPRINGDOC_WEBFLUX_OPENAPI("springdoc-webflux-openapi"),
  SVELTE_CORE("svelte-core"),
  TYPESCRIPT("typescript"),
  VUE_CORE("vue-core"),
  VUE_JWT("vue-jwt"),
  VUE_PINIA("vue-pinia");

  private static final Map<String, JHLiteModuleSlug> moduleSlugMap = Stream
    .of(values())
    .collect(Collectors.toMap(JHLiteModuleSlug::get, Function.identity()));
  private final String slug;

  JHLiteModuleSlug(String slug) {
    this.slug = slug;
  }

  @Override
  public String get() {
    return slug;
  }

  public static Optional<JHLiteModuleSlug> fromString(String slug) {
    return Optional.ofNullable(moduleSlugMap.get(slug));
  }
}
