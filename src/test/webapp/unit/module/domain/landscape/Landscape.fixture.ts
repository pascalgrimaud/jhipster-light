import { Landscape } from '@/module/domain/landscape/Landscape';
import { LandscapeElementId } from '@/module/domain/landscape/LandscapeElementId';
import { LandscapeFeature } from '@/module/domain/landscape/LandscapeFeature';
import { LandscapeFeatureSlug } from '@/module/domain/landscape/LandscapeFeatureSlug';
import { LandscapeModule } from '@/module/domain/landscape/LandscapeModule';
import { ModuleRank } from '@/module/domain/landscape/ModuleRank';
import { ModulePropertyDefinition } from '@/module/domain/ModulePropertyDefinition';
import { ModuleSlug } from '@/module/domain/ModuleSlug';
import {
  applicationBaseNamePropertyDefinition,
  indentSizePropertyDefinition,
  mandatoryBooleanPropertyDefinitionWithDefault,
  mandatoryBooleanPropertyDefinitionWithoutDefault,
  moduleSlug,
  optionalBooleanPropertyDefinition,
} from '../Modules.fixture';

export const defaultLandscape = (): Landscape =>
  Landscape.initialState([
    {
      elements: [
        initialModule('infinitest', 'Add infinitest filters', [applicationBaseNamePropertyDefinition()], [], 'RANK_S'),
        initialModule('init', 'Add some initial tools', [applicationBaseNamePropertyDefinition()], [], 'RANK_S'),
        initialModule(
          'init-props',
          'Add some initial tools with extra properties',
          [
            applicationBaseNamePropertyDefinition(),
            indentSizePropertyDefinition(),
            mandatoryBooleanPropertyDefinitionWithoutDefault(),
            mandatoryBooleanPropertyDefinitionWithDefault(),
          ],
          [],
        ),
        initialModule('prettier', 'Add prettier', [applicationBaseNamePropertyDefinition()], []),
      ],
    },
    {
      elements: [
        new LandscapeFeature(featureSlug('client'), [
          initialModule('vue', 'Add vue', [], moduleSlugs('init'), 'RANK_S'),
          initialModule('react', 'Add react', [], moduleSlugs('init')),
          initialModule('angular', 'Add angular', [], moduleSlugs('init')),
        ]),
        javaBuildToolFeature(),
      ],
    },
    {
      elements: [
        initialModule('java-base', 'Add base java classes', [], featureSlugs('java-build-tools')),
        initialModule('spring-boot', 'Add spring boot core', [], featureSlugs('java-build-tools')),
        new LandscapeFeature(featureSlug('ci'), [
          initialModule('gitlab-maven', 'Add simple gitlab ci for maven', [], moduleSlugs('maven'), 'RANK_S'),
          initialModule('gitlab-gradle', 'Add simple gitlab ci for gradle', [], moduleSlugs('gradle'), 'RANK_S'),
        ]),
      ],
    },
    {
      elements: [
        new LandscapeFeature(featureSlug('jpa'), [initialModule('postgresql', 'Add PostGreSQL', [], moduleSlugs('spring-boot'))]),
        new LandscapeFeature(featureSlug('spring-mvc'), [
          initialModule('spring-boot-tomcat', 'Add Tomcat', [], moduleSlugs('spring-boot')),
          initialModule('spring-boot-undertow', 'Add Undertow', [], moduleSlugs('spring-boot')),
        ]),
        initialModule('bean-validation-test', 'Add bean validation test tools', [], moduleSlugs('spring-boot')),
        initialModule('build', 'Add build information', [], featureSlugs('ci')),
      ],
    },
    {
      elements: [
        initialModule('sample-feature', 'Add sample feature', [], [featureSlug('spring-mvc'), moduleSlug('bean-validation-test')]),
        initialModule('liquibase', 'Add liquibase', [], featureSlugs('jpa')),
      ],
    },
  ]);

export const javaBuildToolFeature = (): LandscapeFeature =>
  new LandscapeFeature(featureSlug('java-build-tools'), [
    initialModule('maven', 'Add maven', [optionalBooleanPropertyDefinition()], moduleSlugs('init')),
    initialModule('gradle', 'Add gradle', [], moduleSlugs('init')),
  ]);

const initialModule = (
  slug: string,
  operation: string,
  properties: ModulePropertyDefinition[],
  dependencies: LandscapeElementId[],
  rank: ModuleRank = 'RANK_D',
): LandscapeModule =>
  LandscapeModule.initialState({
    slug: moduleSlug(slug),
    operation,
    properties,
    dependencies,
    rank,
  });

const featureSlugs = (...slugs: string[]): LandscapeFeatureSlug[] => slugs.map(featureSlug);

export const featureSlug = (slug: string): LandscapeFeatureSlug => new LandscapeFeatureSlug(slug);
const moduleSlugs = (...slugs: string[]): ModuleSlug[] => slugs.map(moduleSlug);
