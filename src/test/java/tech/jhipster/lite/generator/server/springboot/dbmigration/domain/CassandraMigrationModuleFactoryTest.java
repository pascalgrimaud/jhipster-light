package tech.jhipster.lite.generator.server.springboot.dbmigration.domain;

import static org.mockito.Mockito.when;
import static tech.jhipster.lite.module.infrastructure.secondary.JHipsterModulesAssertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tech.jhipster.lite.TestFileUtils;
import tech.jhipster.lite.UnitTest;
import tech.jhipster.lite.generator.server.springboot.dbmigration.cassandra.domain.CassandraMigrationModuleFactory;
import tech.jhipster.lite.module.domain.JHipsterModule;
import tech.jhipster.lite.module.domain.JHipsterModulesFixture;
import tech.jhipster.lite.module.domain.docker.DockerImageVersion;
import tech.jhipster.lite.module.domain.docker.DockerImages;
import tech.jhipster.lite.module.domain.properties.JHipsterModuleProperties;

@UnitTest
@ExtendWith(MockitoExtension.class)
class CassandraMigrationModuleFactoryTest {

  @Mock
  private DockerImages dockerImages;

  @InjectMocks
  private CassandraMigrationModuleFactory factory;

  @Test
  void shouldBuildModule() {
    when(dockerImages.get("cassandra")).thenReturn(new DockerImageVersion("cassandra", "4.0.7"));

    JHipsterModuleProperties properties = JHipsterModulesFixture.propertiesBuilder(TestFileUtils.tmpDirForTest())
      .basePackage("tech.jhipster.jhlitest")
      .build();

    JHipsterModule module = factory.buildModule(properties);

    assertThatModuleWithFiles(module, pomFile(), readmeFile(), springFactoriesTest())
      .hasFile("pom.xml")
      .containing(
        """
            <dependency>
              <groupId>org.cassandraunit</groupId>
              <artifactId>cassandra-unit</artifactId>
              <version>${cassandraunit.version}</version>
              <scope>test</scope>
            </dependency>
        """
      )
      .and()
      .hasFiles("src/main/docker/cassandra-migration.yml")
      .hasFiles("src/main/resources/config/cql/create-migration-keyspace.cql")
      .hasFiles("src/main/resources/config/cql/changelog/README.md")
      .hasFiles("documentation/cassandra-migration.md")
      .hasPrefixedFiles("src/main/docker/cassandra/scripts", "autoMigrate.sh", "execute-cql.sh")
      .hasFiles("src/test/java/tech/jhipster/jhlitest/TestCassandraMigrationLoader.java")
      .hasFile("src/test/resources/META-INF/spring.factories")
      .containingInSequence(
        "org.springframework.context.ApplicationListener=tech.jhipster.jhlitest.TestCassandraManager,tech.jhipster.jhlitest.TestCassandraMigrationLoader"
      )
      .and()
      .hasFile("README.md")
      .containing(
        """
        ```bash
        docker compose -f src/main/docker/cassandra-migration.yml up -d
        ```
        """
      )
      .and()
      .hasFile("src/main/docker/cassandra/Cassandra-Migration.Dockerfile")
      .containing("cassandra:4.0.7");
  }

  private ModuleFile springFactoriesTest() {
    return file("src/test/resources/projects/cassandra/spring.factories", "src/test/resources/META-INF/spring.factories");
  }
}
