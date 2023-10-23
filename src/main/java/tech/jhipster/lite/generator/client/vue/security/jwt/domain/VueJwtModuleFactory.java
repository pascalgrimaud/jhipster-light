package tech.jhipster.lite.generator.client.vue.security.jwt.domain;

import static tech.jhipster.lite.module.domain.JHipsterModule.*;
import static tech.jhipster.lite.module.domain.packagejson.VersionSource.*;

import tech.jhipster.lite.module.domain.JHipsterModule;
import tech.jhipster.lite.module.domain.file.JHipsterDestination;
import tech.jhipster.lite.module.domain.file.JHipsterSource;
import tech.jhipster.lite.module.domain.properties.JHipsterModuleProperties;
import tech.jhipster.lite.module.domain.replacement.TextNeedleBeforeReplacer;
import tech.jhipster.lite.shared.error.domain.Assert;

public class VueJwtModuleFactory {

  private static final JHipsterSource SOURCE = from("client/vue");

  private static final JHipsterSource APP_SOURCE = SOURCE.append("webapp/app");
  private static final JHipsterSource TEST_JAVASCRIPT_SOURCE = SOURCE.append("test/spec");

  private static final JHipsterDestination APP_DESTINATION = to("src/main/webapp/app");
  private static final JHipsterDestination TEST_DESTINATION = to("src/test/javascript/spec/");

  private static final String PROVIDE_REST_AUTH = "app.provide(\"restAuth\", new RestAuth(axios.create({ baseURL: '' })));";
  private static final String PROVIDE_LOCAL_STORAGE_AUTH = "app.provide(\"authStore\", new LocalStorageAuth(localStorage));";
  private static final TextNeedleBeforeReplacer IMPORT_CREATE_APP = lineBeforeText("import { createApp } from 'vue';");

  public JHipsterModule buildModule(JHipsterModuleProperties properties) {
    Assert.notNull("properties", properties);

    //@formatter:off
    return moduleBuilder(properties)
      .packageJson()
      .addType("module")
      .addDependency(packageName("axios"), VUE)
      .addDevDependency(packageName("sass"), VUE)
      .and()
      .files()
      .batch(APP_SOURCE.append("login/primary/loginForm"), APP_DESTINATION.append("login/primary/loginForm/"))
      .addTemplate("index.ts")
      .addTemplate("LoginForm.component.ts")
      .addTemplate("LoginFormVue.vue")
      .addTemplate("login-form.html")
      .and()
      .batch(APP_SOURCE.append("login/primary/loginModal"), APP_DESTINATION.append("login/primary/loginModal/"))
      .addTemplate("index.ts")
      .addTemplate("LoginModal.component.ts")
      .addTemplate("LoginModalVue.vue")
      .addTemplate("login-modal.html")
      .and()
      .add(APP_SOURCE.template("login/domain/Auth.ts"), APP_DESTINATION.append("login/domain/Auth.ts"))
      .add(APP_SOURCE.template("login/domain/AuthRepository.ts"), APP_DESTINATION.append("login/domain/AuthRepository.ts"))
      .add(APP_SOURCE.template("login/domain/UserSession.ts"), APP_DESTINATION.append("login/domain/UserSession.ts"))
      .add(APP_SOURCE.template("login/secondary/LocalStorageAuth.ts"), APP_DESTINATION.append("login/secondary/LocalStorageAuth.ts"))
      .add(APP_SOURCE.template("login/secondary/RestAuth.ts"), APP_DESTINATION.append("login/secondary/RestAuth.ts"))
      .add(TEST_JAVASCRIPT_SOURCE.template("login/secondary/RestAuth.spec.ts"), TEST_DESTINATION.append("login/secondary/RestAuth.spec.ts"))
      .add(TEST_JAVASCRIPT_SOURCE.template("login/secondary/LocalStorageAuth.spec.ts"), TEST_DESTINATION.append("login/secondary/LocalStorageAuth.spec.ts"))
      .add(TEST_JAVASCRIPT_SOURCE.template("login/primary/LoginForm.spec.ts"), TEST_DESTINATION.append("login/primary/LoginForm.spec.ts"))
      .and()
      .mandatoryReplacements()
      .in(path("src/main/webapp/app/common/primary/homepage/Homepage.component.ts"))
        .add(lineBeforeText("export default {"), "import { LoginFormVue } from '@/login/primary/loginForm';" + LINE_BREAK)
        .add(lineBeforeText("data: () => {"), properties.indentation().times(1) + "components: { LoginFormVue }," + LINE_BREAK)
        .and()
      .in(path("src/main/webapp/app/common/primary/homepage/Homepage.html"))
        .add(lineBeforeText("</div>"), properties.indentation().times(1) + "<LoginFormVue />")
        .and()
      .in(path("src/main/webapp/app/main.ts"))
        .add(lineBeforeText("app.mount('#app');"), PROVIDE_REST_AUTH)
        .add(lineBeforeText("app.mount('#app');"), PROVIDE_LOCAL_STORAGE_AUTH)
        .add(IMPORT_CREATE_APP, "import { RestAuth } from './login/secondary/RestAuth';")
        .add(IMPORT_CREATE_APP, "import axios from 'axios';")
        .add(IMPORT_CREATE_APP, "import { LocalStorageAuth } from './login/secondary/LocalStorageAuth';")
        .and()
      .and()
      .build();
    //@formatter:on
  }
}
