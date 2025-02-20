package tech.jhipster.lite.generator.client.react.security.jwt.domain;

import static tech.jhipster.lite.module.domain.JHipsterModule.*;
import static tech.jhipster.lite.module.domain.npm.JHLiteNpmVersionSource.COMMON;
import static tech.jhipster.lite.module.domain.npm.JHLiteNpmVersionSource.REACT;

import tech.jhipster.lite.module.domain.JHipsterModule;
import tech.jhipster.lite.module.domain.file.JHipsterDestination;
import tech.jhipster.lite.module.domain.file.JHipsterSource;
import tech.jhipster.lite.module.domain.properties.JHipsterModuleProperties;
import tech.jhipster.lite.module.domain.replacement.RegexNeedleBeforeReplacer;
import tech.jhipster.lite.shared.error.domain.Assert;

public class ReactJwtModuleFactory {

  private static final JHipsterSource ROOT = from("client/react/security/jwt");

  private static final JHipsterSource SOURCE = ROOT.append("src");

  private static final JHipsterSource APP_SOURCE = SOURCE.append("main/webapp/app");
  private static final JHipsterSource TEST_JAVASCRIPT_SOURCE = SOURCE.append("test/webapp/unit");

  private static final JHipsterDestination APP_DESTINATION = to("src/main/webapp/app");
  private static final JHipsterDestination COMMON_DESTINATION = APP_DESTINATION.append("common");

  private static final JHipsterDestination TEST_DESTINATION = to("src/test/webapp/unit/");

  private static final RegexNeedleBeforeReplacer LOGIN_FORM_MATCHER = lineBeforeRegex(
    "[  ]{0,10}[<\\/div>]{0,1}\n{0,5}[  ]{0,10}<\\/div>\n{0,5}[  ]{0,10}[);]{0,2}\n{0,5}\\}\n{0,5}[  ]{0,10}export default HomePage;"
  );
  private static final String AUTHENTICATION_STYLE =
    """
      -moz-osx-font-smoothing: grayscale;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;\
    """;

  public JHipsterModule buildModule(JHipsterModuleProperties properties) {
    Assert.notNull("properties", properties);

    //@formatter:off
    return moduleBuilder(properties)
      .packageJson()
        .addDependency(packageName("react-hook-form"), REACT)
        .addDependency(packageName("axios"), REACT)
        .addDependency(packageName("@heroui/react"), REACT)
        .addDevDependency(packageName("autoprefixer"), COMMON)
        .addDevDependency(packageName("sass"), REACT)
        .addDevDependency(packageName("@tailwindcss/vite"), COMMON)
        .addDevDependency(packageName("tailwindcss"), COMMON)
        .and()
      .files()
        .batch(ROOT, to("."))
          .addFile("tailwind.config.js")
          .and()
        .add(APP_SOURCE.template("common/services/storage.ts"), COMMON_DESTINATION.append("services/storage.ts"))
        .add(APP_SOURCE.append("login/primary/loginForm").template("index.tsx"), APP_DESTINATION.append("login/primary/loginForm/index.tsx"))
        .batch(APP_SOURCE.append("login/primary/loginModal"), APP_DESTINATION.append("login/primary/loginModal/"))
          .addTemplate("EyeSlashFilledIcon.tsx")
          .addTemplate("EyeFilledIcon.tsx")
          .addTemplate("index.tsx")
          .addTemplate("interface.d.ts")
          .addTemplate("LoginModal.scss")
          .and()
        .add(APP_SOURCE.template("login/services/login.ts"), APP_DESTINATION.append("login/services/login.ts"))
        .add(TEST_JAVASCRIPT_SOURCE.template("login/services/login.test.ts"), TEST_DESTINATION.append("login/services/login.test.ts"))
        .add(
          TEST_JAVASCRIPT_SOURCE.template("login/primary/loginForm/index.test.tsx"),
          TEST_DESTINATION.append("login/primary/loginForm/index.test.tsx")
        )
        .add(
          TEST_JAVASCRIPT_SOURCE.template("login/primary/loginModal/index.test.tsx"),
          TEST_DESTINATION.append("login/primary/loginModal/index.test.tsx")
        )
        .add(TEST_JAVASCRIPT_SOURCE.template("common/services/storage.test.ts"), TEST_DESTINATION.append("common/services/storage.test.ts"))
        .and()
      .mandatoryReplacements()
        .in(path("vite.config.ts"))
          .add(lineAfterRegex("from 'vite';"), "import tailwindcss from '@tailwindcss/vite';")
          .add(text("plugins: [react(), "), "plugins: [react(), tailwindcss(), ")
          .and()
        .in(path("src/main/webapp/app/home/infrastructure/primary/HomePage.tsx"))
          .add(lineBeforeText("function HomePage() {"), "import LoginForm from '@/login/primary/loginForm';" + LINE_BREAK)
          .add(LOGIN_FORM_MATCHER, properties.indentation().times(4) + "<LoginForm />")
          .and()
        .in(path("src/main/webapp/app/index.tsx"))
          .add(lineBeforeText("import React from 'react';"), "import { HeroUIProvider } from '@heroui/react';")
          .add(regex("\\s+<HomePage />"),
                """

              \t\t<HeroUIProvider>
              \t\t\t<HomePage />
              \t\t</HeroUIProvider>\
              """.replace("\t", properties.indentation().spaces())
          )
          .and()
        .in(path("src/main/webapp/app/index.css"))
          // .add(lineBeforeText("body {"), "@config '../../../../tailwind.config.js';" + LINE_BREAK + "@import 'tailwindcss';" + LINE_BREAK)
          .add(lineBeforeText("body {"), "@import 'tailwindcss';" + LINE_BREAK)
        .and()
      .and()
      .optionalReplacements()
        .in(path("src/main/webapp/app/home/infrastructure/primary/HomePage.css"))
          .add(text("  -moz-osx-font-smoothing: grayscale;"), AUTHENTICATION_STYLE)
          .and()
        .and()
      .build();
    //@formatter:on
  }
}
