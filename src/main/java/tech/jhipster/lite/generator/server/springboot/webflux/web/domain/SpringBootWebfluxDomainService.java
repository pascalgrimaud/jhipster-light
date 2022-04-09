package tech.jhipster.lite.generator.server.springboot.webflux.web.domain;

import static tech.jhipster.lite.generator.server.springboot.webflux.web.domain.SpringBootWebflux.springBootStarterWebfluxDependency;

import tech.jhipster.lite.generator.buildtool.generic.domain.BuildToolService;
import tech.jhipster.lite.generator.project.domain.Project;
import tech.jhipster.lite.generator.server.springboot.common.domain.SpringBootCommonService;

public class SpringBootWebfluxDomainService implements SpringBootWebfluxService {

  private final BuildToolService buildToolService;
  private final SpringBootCommonService springBootCommonService;

  public SpringBootWebfluxDomainService(BuildToolService buildToolService, SpringBootCommonService springBootCommonService) {
    this.buildToolService = buildToolService;
    this.springBootCommonService = springBootCommonService;
  }

  @Override
  public void addSpringBootWebflux(Project project) {
    buildToolService.addDependency(project, springBootStarterWebfluxDependency());
    addProperties(project);
  }

  private void addProperties(Project project) {
    springBootCommonService.addPropertiesComment(project, "Spring Boot Webflux");
    springBootCommonService.addProperties(project, "server.port", project.getServerPort());
    springBootCommonService.addPropertiesTest(project, "server.port", 0);
    springBootCommonService.addPropertiesNewLine(project);
  }
}
