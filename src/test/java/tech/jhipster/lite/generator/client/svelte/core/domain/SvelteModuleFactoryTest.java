package tech.jhipster.lite.generator.client.svelte.core.domain;

import static tech.jhipster.lite.module.infrastructure.secondary.JHipsterModulesAssertions.ModuleFile;
import static tech.jhipster.lite.module.infrastructure.secondary.JHipsterModulesAssertions.assertThatModuleWithFiles;
import static tech.jhipster.lite.module.infrastructure.secondary.JHipsterModulesAssertions.file;
import static tech.jhipster.lite.module.infrastructure.secondary.JHipsterModulesAssertions.lintStagedConfigFile;
import static tech.jhipster.lite.module.infrastructure.secondary.JHipsterModulesAssertions.nodeDependency;
import static tech.jhipster.lite.module.infrastructure.secondary.JHipsterModulesAssertions.nodeScript;
import static tech.jhipster.lite.module.infrastructure.secondary.JHipsterModulesAssertions.packageJsonFile;

import org.junit.jupiter.api.Test;
import tech.jhipster.lite.TestFileUtils;
import tech.jhipster.lite.UnitTest;
import tech.jhipster.lite.module.domain.JHipsterModule;
import tech.jhipster.lite.module.domain.JHipsterModulesFixture;
import tech.jhipster.lite.module.domain.properties.JHipsterModuleProperties;

@UnitTest
class SvelteModuleFactoryTest {

  private static final SvelteModuleFactory factory = new SvelteModuleFactory();

  @Test
  void shouldCreateSvelteModule() {
    JHipsterModuleProperties properties = JHipsterModulesFixture.propertiesBuilder(TestFileUtils.tmpDirForTest()).build();

    JHipsterModule module = factory.buildSvelteModule(properties);

    // @formatter:off
    assertThatModuleWithFiles(module, packageJsonFile(), lintStagedConfigFile(), prettierRcFile())
      .hasFile(".gitignore")
        .containing("""
          # Vite
          vite.config.js.timestamp-*
          # Env
          .env
          .env.*
          !.env.test\
          """)
        .and()
      .hasFile("package.json")
        .containing(nodeDependency("@sveltejs/adapter-static"))
        .containing(nodeDependency("@sveltejs/kit"))
        .containing(nodeDependency("@sveltejs/vite-plugin-svelte"))
        .containing(nodeDependency("@testing-library/jest-dom"))
        .containing(nodeDependency("@testing-library/svelte"))
        .containing(nodeDependency("@testing-library/user-event"))
        .containing(nodeDependency("@vitest/coverage-v8"))
        .containing(nodeDependency("@vitest/ui"))
        .containing(nodeDependency("@types/eslint"))
        .containing(nodeDependency("eslint"))
        .containing(nodeDependency("eslint-config-prettier"))
        .containing(nodeDependency("eslint-plugin-svelte"))
        .containing(nodeDependency("globals"))
        .containing(nodeDependency("jsdom"))
        .containing(nodeDependency("prettier-plugin-svelte"))
        .containing(nodeDependency("svelte"))
        .containing(nodeDependency("svelte-check"))
        .containing(nodeDependency("typescript"))
        .containing(nodeDependency("vite"))
        .containing(nodeDependency("vitest"))
        .containing(nodeDependency("vitest-sonar-reporter"))

        .containing(nodeScript("start", "vite dev --port 9000 --open"))
        .containing(nodeScript("build", "vite build"))
        .containing(nodeScript("preview", "vite preview"))
    		.containing(nodeScript("check", "svelte-kit sync && svelte-check --tsconfig ./jsconfig.json"))
        .containing(nodeScript("lint", "prettier --check . && eslint ."))
        .containing(nodeScript("format", "prettier --write '{,src/**/,cypress/**/}*.{md,json,js,cjs,svelte,css,html,yml}'"))
        .containing(nodeScript("test", "vitest run --coverage"))
        .containing(nodeScript("test:ui", "vitest --ui --coverage"))
        .containing(nodeScript("test:watch", "vitest"))

        .containing("\"type\": \"module\"")
        .and()
      .hasFile(".lintstagedrc.cjs")
        .containing(
          """
            module.exports = {
              '{src/**/,}*.{js,svelte}': ['eslint --fix', 'prettier --write', 'npm run check'],
              '*.{md,json,yml,html,css,scss,java,xml,feature}': ['prettier --write'],
            };
            """
        )
      .and()
      .hasFiles("eslint.config.js", ".npmrc", "jsconfig.json", "svelte.config.js", "vite.config.js", "vitest-setup.js")
      .hasPrefixedFiles("src/main/webapp", "app.html")
      .hasPrefixedFiles("src/main/webapp/routes", "+page.svelte")
      .hasPrefixedFiles("src/main/webapp/lib/common/primary/app", "App.spec.js")
      .hasPrefixedFiles("src/main/webapp/lib/common/primary/app", "App.svelte")
      .hasPrefixedFiles("src/main/webapp/assets", "favicon.png")
      .hasPrefixedFiles("src/main/webapp/assets/img", "jhipster-lite-neon-orange.png")
      .hasPrefixedFiles("src/main/webapp/assets/img", "svelte-logo.png");
    // @formatter:on
  }

  public static ModuleFile prettierRcFile() {
    return file("src/test/resources/projects/prettier/.prettierrc", ".prettierrc");
  }
}
