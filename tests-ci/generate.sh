#!/bin/bash

show_syntax() {
  echo "Usage: $0 <application>" >&2
  exit 1
}

if [ "$#" -ne 1 ]; then
  show_syntax
fi

if test -f "modulePayload.json"; then
  payloadFile="modulePayload.json"
elif test -f tests-ci/modulePayload.json; then
  payloadFile=tests-ci/modulePayload.json
fi

application=$1

applyModules() {
  for module in $@
  do
    local payload="$(sed "s/APP_NAME/$application/g" $payloadFile)"
    local api="/api/modules/$module/apply-patch"

    echo "curl -o /dev/null -s -w "%{http_code}\n" \
      -X POST \
      -H "accept: */*" \
      -H "Content-Type: application/json" \
      -d "$payload" \
      "http://localhost:7471""$api""

    local status_code=$(curl -o /dev/null -s -w "%{http_code}\n" \
      -X POST \
      -H "accept: */*" \
      -H "Content-Type: application/json" \
      -d "$payload" \
      "http://localhost:7471""$api")

    if [[ $status_code == '40'* || $status_code == '50'* ]]; then
      echo "Error when calling API:" "$status_code" "$api"
      exit 1
    fi;
  done
}

spring_boot() {
  applyModules \
  "init" \
  "maven-java" \
  "github-actions" \
  "java-base" \
  "checkstyle" \
  "jacoco-check-min-coverage" \
  "spring-boot" \
  "logs-spy"
}

spring_boot_mvc() {
  spring_boot

  applyModules \
  "spring-boot-tomcat" \
  "spring-boot-actuator"
}

spring_boot_undertow() {
  spring_boot

  applyModules \
  "spring-boot-undertow" \
  "spring-boot-actuator"
}

spring_boot_webflux() {
  spring_boot

  applyModules \
  "spring-boot-webflux-netty" \
  "spring-boot-actuator"
}

sonar_back() {
  applyModules "sonar-qube-java-backend"
}

sonar_back_front() {
  applyModules "sonar-qube-java-backend-and-frontend"
}

cucumber_with_jwt() {
  applyModules \
  "spring-boot-jwt" \
  "spring-boot-jwt-basic-auth" \
  "springdoc-mvc-openapi" \
  "springdoc-jwt" \
  "spring-boot-cucumber-mvc" \
  "spring-boot-cucumber-jwt-authentication"
}

if [[ $application == 'spring-boot' ]]; then
  spring_boot_mvc
  sonar_back

elif [[ $application == 'fullstack' ]]; then
  spring_boot_mvc
  sonar_back_front

elif [[ $application == 'gradleapp' ]]; then
  applyModules \
    "init" \
    "gradle-java" \
    "java-base" \
    "pagination-domain"

elif [[ $application == 'fullapp' ]]; then
  spring_boot_mvc
  sonar_back_front

  applyModules \
  "prettier" \
  "infinitest-filters" \
  "pagination-domain" \
  "rest-pagination" \
  "jpa-pagination" \
  "spring-boot-async" \
  "spring-boot-devtools" \
  "logstash" \
  "jib" \
  "dockerfile" \
  "java-archunit" \
  "git-information" \
  "github-codespaces" \
  "gitpod" \
  "java-memoizers" \
  "java-enums" \
  "internationalized-errors" \
  "spring-boot-cache" \
  "caffeine-cache"

  cucumber_with_jwt

  applyModules "spring-boot-cucumber-jpa-reset"
  applyModules "application-service-hexagonal-architecture-documentation"

  applyModules "postgresql" "liquibase"

  applyModules \
  "kipe-expression" \
  "kipe-authorization" \
  "dummy-feature" \
  "dummy-jpa-persistence" \
  "dummy-liquibase-changelog" \

  applyModules "ehcache-java-config"

  applyModules "hibernate-2nd-level-cache"

  applyModules "frontend-maven-plugin" "vue-core"

elif [[ $application == 'oauth2app' ]]; then
  spring_boot_mvc
  sonar_back

  applyModules \
  "java-memoizers" \

  applyModules \
  "spring-boot-oauth2" \
  "spring-boot-oauth2-account" \
  "springdoc-mvc-openapi" \
  "springdoc-oauth2"

  applyModules \
  "spring-boot-cucumber-mvc" \
  "spring-boot-cucumber-oauth2-authentication" \
  "kipe-expression" \
  "kipe-authorization" \
  "dummy-feature"

elif [[ $application == 'mysqlapp' ]]; then
  spring_boot_mvc
  sonar_back

  applyModules "mysql" "liquibase"

  cucumber_with_jwt

  applyModules "spring-boot-cucumber-jpa-reset"

  applyModules \
  "kipe-expression" \
  "kipe-authorization" \
  "dummy-feature" \
  "dummy-jpa-persistence" \
  "dummy-liquibase-changelog" \

  applyModules "ehcache-xml-config"

elif [[ $application == 'mariadbapp' ]]; then
  spring_boot_mvc
  sonar_back

  applyModules "springdoc-mvc-openapi"
  applyModules "mariadb" "liquibase"
  applyModules "ehcache-xml-config"

elif [[ $application == 'mssqlapp' ]]; then
  spring_boot_mvc
  sonar_back

  applyModules "springdoc-mvc-openapi"
  applyModules "mssql"

elif [[ $application == 'flywayapp' ]]; then
  spring_boot_mvc
  sonar_back

  applyModules "postgresql" "flyway"

  cucumber_with_jwt

  applyModules "spring-boot-cucumber-jpa-reset"

  applyModules \
  "kipe-expression" \
  "kipe-authorization" \
  "dummy-feature" \
  "dummy-jpa-persistence" \
  "dummy-postgresql-flyway-changelog" \

elif [[ $application == 'undertowapp' ]]; then
  spring_boot_undertow
  sonar_back

  applyModules \
  "mysql" \
  "flyway" \
  "flyway-mysql"

  cucumber_with_jwt
  applyModules "spring-boot-cucumber-jpa-reset"

  applyModules \
  "kipe-expression" \
  "kipe-authorization" \
  "dummy-feature" \
  "dummy-jpa-persistence" \
  "dummy-not-postgresql-flyway-changelog" \

  applyModules "spring-boot-cache"

elif [[ $application == 'eurekaapp' ]]; then
  spring_boot_mvc
  sonar_back

  applyModules \
  "eureka-client" \
  "spring-cloud" \

elif [[ $application == 'consulapp' ]]; then
  spring_boot_undertow
  sonar_back

  applyModules "consul"

elif [[ $application == 'gatewayapp' ]]; then
  spring_boot_webflux
  sonar_back

  applyModules \
  "eureka-client" \
  "spring-cloud" \
  "gateway"

elif [[ $application == 'mongodbapp' ]]; then
  spring_boot_mvc
  sonar_back

  applyModules "mongodb" "mongock"

  cucumber_with_jwt

  applyModules \
  "kipe-expression" \
  "kipe-authorization" \
  "dummy-feature" \
  "dummy-mongodb-persistence"

elif [[ $application == 'redisapp' ]]; then
  spring_boot_mvc
  sonar_back

  applyModules "redis"

  cucumber_with_jwt

elif [[ $application == 'cassandraapp' ]]; then
  spring_boot_mvc
  sonar_back
  cucumber_with_jwt

  applyModules \
  "cassandra" \
  "cassandra-migration" \
  "kipe-expression" \
  "kipe-authorization" \
  "dummy-feature" \
  "dummy-cassandra-persistence"

elif [[ $application == 'neo4japp' ]]; then
  spring_boot_mvc
  sonar_back

  applyModules "neo4j" "neo4j-migrations"

  cucumber_with_jwt

elif [[ $application == 'angularapp' ]]; then
  spring_boot_mvc
  sonar_back_front

  applyModules \
  "frontend-maven-plugin" \
  "angular-core" \

  cucumber_with_jwt

  applyModules "angular-jwt" "angular-health"

elif [[ $application == 'angularoauth2app' ]]; then
  spring_boot_mvc
  sonar_back_front

  applyModules \
  "java-memoizers" \

  applyModules \
  "frontend-maven-plugin" \
  "angular-core" \
  "cypress"

  applyModules \
  "spring-boot-oauth2" \
  "spring-boot-oauth2-account" \
  "springdoc-mvc-openapi" \
  "springdoc-oauth2"

  applyModules "angular-oauth2"

elif [[ $application == 'reactapp' ]]; then
  spring_boot_mvc
  sonar_back_front

  applyModules \
  "frontend-maven-plugin" \
  "react-core" \
  "cypress"

  cucumber_with_jwt

  applyModules "react-jwt"

elif [[ $application == 'vueapp' ]]; then
  spring_boot_mvc
  sonar_back_front

  applyModules \
  "frontend-maven-plugin" \
  "vue-core" \
  "vue-pinia" \
  "cypress"

  cucumber_with_jwt

  applyModules "vue-jwt"

elif [[ $application == 'svelteapp' ]]; then
  spring_boot_mvc
  sonar_back_front

  applyModules \
  "frontend-maven-plugin" \
  "prettier" \
  "svelte-core"

elif [[ $application == 'kafkaapp' ]]; then
  spring_boot_mvc
  sonar_back

   applyModules "spring-boot-kafka" "spring-boot-kafka-akhq"

elif [[ $application == 'pulsarapp' ]]; then
  spring_boot_mvc
  sonar_back

  applyModules "spring-boot-pulsar"

elif [[ $application == 'reactiveapp' ]]; then
  spring_boot_webflux
  sonar_back

  applyModules \
  "springdoc-webflux-openapi"

elif [[ $application == 'customjhlite' ]]; then
  spring_boot
  sonar_back

  applyModules "custom-jhlite"

elif [[ $application == 'typescriptapp' ]]; then
  applyModules \
    "init" \
    "typescript" \
    "optional-typescript"

else
  echo "*** Unknown configuration..."
  exit 1
fi

echo ""
cat "$payloadFile"
echo ""
sleep 5
