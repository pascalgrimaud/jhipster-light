import { ModuleRank } from '@/module/domain/landscape/ModuleRank';
import { LandscapeElementId } from '../domain/landscape/LandscapeElementId';
import { LandscapeElementType } from '../domain/landscape/LandscapeElementType';
import { LandscapeFeatureSlug } from '../domain/landscape/LandscapeFeatureSlug';
import { LandscapeModule } from '../domain/landscape/LandscapeModule';
import { ModuleSlug } from '../domain/ModuleSlug';
import { RestModulePropertiesDefinitions, toPropertiesDefinitions } from './RestModulePropertiesDefinitions';

export interface RestLandscapeModule {
  type: LandscapeElementType;
  slug: string;
  operation: string;
  properties: RestModulePropertiesDefinitions;
  dependencies?: RestLandscapeDependency[];
  rank: ModuleRank;
}

export interface RestLandscapeDependency {
  slug: string;
  type: LandscapeElementType;
}

export const toLandscapeModule = (module: RestLandscapeModule): LandscapeModule =>
  LandscapeModule.initialState({
    slug: new ModuleSlug(module.slug),
    operation: module.operation,
    properties: toPropertiesDefinitions(module.properties),
    dependencies: toModuleDependencies(module.dependencies),
    rank: module.rank,
  });

const toModuleDependencies = (dependencies: RestLandscapeDependency[] | undefined): LandscapeElementId[] => {
  if (dependencies === undefined) {
    return [];
  }

  return dependencies.map(dependency => {
    switch (dependency.type) {
      case 'FEATURE':
        return new LandscapeFeatureSlug(dependency.slug);
      case 'MODULE':
        return new ModuleSlug(dependency.slug);
    }
  });
};
