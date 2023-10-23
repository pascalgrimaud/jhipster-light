package tech.jhipster.lite.generator.client.vue.security.jwt.infrastructure.primary;

import static tech.jhipster.lite.generator.JHLiteModuleSlug.*;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tech.jhipster.lite.generator.client.vue.security.jwt.application.VueJwtApplicationService;
import tech.jhipster.lite.module.domain.resource.JHipsterModuleOrganization;
import tech.jhipster.lite.module.domain.resource.JHipsterModulePropertiesDefinition;
import tech.jhipster.lite.module.domain.resource.JHipsterModuleResource;

@Configuration
class VueJwtModuleConfiguration {

  @Bean
  JHipsterModuleResource vueJwtModule(VueJwtApplicationService vueJwt) {
    return JHipsterModuleResource
      .builder()
      .slug(VUE_JWT)
      .propertiesDefinition(JHipsterModulePropertiesDefinition.builder().addIndentation().build())
      .apiDoc("Vue", "Add JWT Login Vue")
      .organization(JHipsterModuleOrganization.builder().addDependency(VUE_CORE).build())
      .tags("client", "vue", "jwt")
      .factory(vueJwt::buildModule);
  }
}
