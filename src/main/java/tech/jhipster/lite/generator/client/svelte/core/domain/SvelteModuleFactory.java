package tech.jhipster.lite.generator.client.svelte.core.domain;

import static tech.jhipster.lite.module.domain.JHipsterModule.append;
import static tech.jhipster.lite.module.domain.JHipsterModule.from;
import static tech.jhipster.lite.module.domain.JHipsterModule.lineBeforeText;
import static tech.jhipster.lite.module.domain.JHipsterModule.moduleBuilder;
import static tech.jhipster.lite.module.domain.JHipsterModule.packageName;
import static tech.jhipster.lite.module.domain.JHipsterModule.path;
import static tech.jhipster.lite.module.domain.JHipsterModule.preCommitCommands;
import static tech.jhipster.lite.module.domain.JHipsterModule.scriptCommand;
import static tech.jhipster.lite.module.domain.JHipsterModule.scriptKey;
import static tech.jhipster.lite.module.domain.JHipsterModule.stagedFilesFilter;
import static tech.jhipster.lite.module.domain.JHipsterModule.to;
import static tech.jhipster.lite.module.domain.npm.JHLiteNpmVersionSource.COMMON;
import static tech.jhipster.lite.module.domain.npm.JHLiteNpmVersionSource.SVELTE;

import java.util.function.Consumer;
import tech.jhipster.lite.module.domain.Indentation;
import tech.jhipster.lite.module.domain.JHipsterModule;
import tech.jhipster.lite.module.domain.JHipsterModule.JHipsterModuleBuilder;
import tech.jhipster.lite.module.domain.file.JHipsterDestination;
import tech.jhipster.lite.module.domain.file.JHipsterSource;
import tech.jhipster.lite.module.domain.properties.JHipsterModuleProperties;
import tech.jhipster.lite.shared.error.domain.Assert;

public class SvelteModuleFactory {

  private static final JHipsterSource SOURCE = from("client/svelte");

  private static final String ENGINES_NEEDLE = "  \"engines\":";

  private static final JHipsterSource PRIMARY_MAIN_SOURCE = SOURCE.append("src/main/webapp/lib/common/primary/app");
  private static final JHipsterDestination PRIMARY_MAIN_DESTINATION = to("src/main/webapp/lib/common/primary/app");
  private static final JHipsterSource CLIENT_COMMON = from("client/common");

  public JHipsterModule buildSvelteModule(JHipsterModuleProperties properties) {
    Assert.notNull("properties", properties);

    //@formatter:off
    return moduleBuilder(properties)
      .preCommitActions(stagedFilesFilter("{src/**/,}*.{js,svelte}"), preCommitCommands("eslint --fix", "prettier --write", "npm run check"))
      .gitIgnore()
        .comment("Vite")
        .pattern("vite.config.js.timestamp-*")
        .comment("Env")
        .pattern(".env")
        .pattern(".env.*")
        .pattern("!.env.test")
      .and()
      .packageJson()
        .addDevDependency(packageName("@sveltejs/adapter-static"), SVELTE)
        .addDevDependency(packageName("@sveltejs/kit"), SVELTE)
        .addDevDependency(packageName("@sveltejs/vite-plugin-svelte"), SVELTE)
        .addDevDependency(packageName("@testing-library/jest-dom"), SVELTE)
        .addDevDependency(packageName("@testing-library/svelte"), SVELTE)
        .addDevDependency(packageName("@testing-library/user-event"), SVELTE)
        .addDevDependency(packageName("@vitest/coverage-v8"), SVELTE)
        .addDevDependency(packageName("@vitest/ui"), SVELTE)
        .addDevDependency(packageName("@types/eslint"), SVELTE)
        .addDevDependency(packageName("eslint"), COMMON)
        .addDevDependency(packageName("eslint-config-prettier"), COMMON)
        .addDevDependency(packageName("eslint-plugin-svelte"), SVELTE)
        .addDevDependency(packageName("globals"), COMMON)
        .addDevDependency(packageName("jsdom"), COMMON)
        .addDevDependency(packageName("prettier-plugin-svelte"), SVELTE)
        .addDevDependency(packageName("svelte"), SVELTE)
        .addDevDependency(packageName("svelte-check"), SVELTE)
        .addDevDependency(packageName("typescript"), COMMON)
        .addDevDependency(packageName("vite"), COMMON)
        .addDevDependency(packageName("vitest"), COMMON)
        .addDevDependency(packageName("vitest-sonar-reporter"), COMMON)
        .addScript(scriptKey("start"), scriptCommand("vite dev --port 9000 --open"))
        .addScript(scriptKey("build"), scriptCommand("vite build"))
        .addScript(scriptKey("preview"), scriptCommand("vite preview"))
    		.addScript(scriptKey("check"), scriptCommand("svelte-kit sync && svelte-check --tsconfig ./jsconfig.json"))
        .addScript(scriptKey("lint"), scriptCommand("prettier --check . && eslint ."))
        .addScript(scriptKey("format"), scriptCommand("prettier --write '{,src/**/,cypress/**/}*.{md,json,js,cjs,svelte,css,html,yml}'"))
        .addScript(scriptKey("test"), scriptCommand("vitest run --coverage"))
        .addScript(scriptKey("test:ui"), scriptCommand("vitest --ui --coverage"))
        .addScript(scriptKey("test:watch"), scriptCommand("vitest"))
        .and()
      .optionalReplacements()
        .in(path("package.json"))
          .add(lineBeforeText(ENGINES_NEEDLE), type(properties.indentation()))
          .and()
        .and()
      .files()
        .add(SOURCE.append("src/main/webapp/routes").template("+page.svelte"), to("src/main/webapp/routes/+page.svelte"))
        .add(PRIMARY_MAIN_SOURCE.template("App.svelte"), PRIMARY_MAIN_DESTINATION.append("App.svelte"))
        .add(PRIMARY_MAIN_SOURCE.template("App.spec.js"), PRIMARY_MAIN_DESTINATION.append("App.spec.js"))
        .batch(CLIENT_COMMON, to("."))
          .addFile(".npmrc")
          .and()
        .batch(SOURCE, to("."))
          .addTemplate("svelte.config.js")
          .addTemplate("eslint.config.js")
          .addTemplate("vite.config.js")
          .addFile("vitest-setup.js")
          .addTemplate("jsconfig.json")
          .and()
        .batch(SOURCE.file("src/main/webapp"), to("src/main/webapp"))
          .addTemplate("app.html")
          .and()
        .batch(SOURCE.file("src/main/webapp/assets"), to("src/main/webapp/assets"))
          .addFile("favicon.png")
          .and()
        .batch(SOURCE.file("src/main/webapp/assets/img"), to("src/main/webapp/assets/img"))
          .addFile("jhipster-lite-neon-orange.png")
          .addFile("svelte-logo.png")
          .and()
        .and()
          .apply(patchPrettierConfig(properties))
      .build();
    //@formatter:on
  }

  private Consumer<JHipsterModuleBuilder> patchPrettierConfig(JHipsterModuleProperties properties) {
    //@formatter:off
    return moduleBuilder -> moduleBuilder
      .mandatoryReplacements()
        .in(path(".prettierrc"))
          .add(lineBeforeText("plugins:"), properties.indentation().times(1) + "- prettier-plugin-svelte")
          .add(append(), "\n# Svelte rules:")
          .add(append(), "semi: false")
          .add(append(), "svelteSortOrder: options-scripts-styles-markup")
          .add(append(), "svelteStrictMode: true")
          .and()
        .and();
    //@formatter:on
  }

  private static String type(Indentation indentation) {
    return indentation.spaces() + "\"type\": \"module\",";
  }
}
