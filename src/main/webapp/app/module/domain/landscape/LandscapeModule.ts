import { ModuleRank } from '@/module/domain/landscape/ModuleRank';
import { ModulePropertyDefinition } from '../ModulePropertyDefinition';
import { ModuleSlug } from '../ModuleSlug';
import { LandscapeElement } from './LandscapeElement';
import { LandscapeElementId } from './LandscapeElementId';
import { LandscapeSelectionTree } from './LandscapeSelectionTree';
import { LandscapeUnselectionTree } from './LandscapeUnselectionTree';
import { ModuleOperation } from './ModuleOperation';

export interface LandscapeModuleInformation {
  slug: ModuleSlug;
  operation: ModuleOperation;
  properties: ModulePropertyDefinition[];
  dependencies: LandscapeElementId[];
  rank: ModuleRank;
}

export interface LandscapeModuleContext {
  selected: boolean;
  applied: boolean;
  selectionTree: LandscapeSelectionTree;
  unselectionTree: LandscapeUnselectionTree;
}

const INITIAL_CONTEXT: LandscapeModuleContext = {
  selected: false,
  applied: false,
  selectionTree: LandscapeSelectionTree.EMPTY,
  unselectionTree: LandscapeUnselectionTree.EMPTY,
};

export class LandscapeModule implements LandscapeElement {
  private constructor(
    private readonly information: LandscapeModuleInformation,
    private readonly context: LandscapeModuleContext,
  ) {}

  static initialState(information: LandscapeModuleInformation): LandscapeModule {
    return new LandscapeModule(information, INITIAL_CONTEXT);
  }

  slugString(): string {
    return this.slug().get();
  }

  slug(): ModuleSlug {
    return this.information.slug;
  }

  dependencies(): LandscapeElementId[] {
    return this.information.dependencies;
  }

  rank(): ModuleRank {
    return this.information.rank;
  }

  operation(): string {
    return this.information.operation;
  }

  properties(): ModulePropertyDefinition[] {
    return this.information.properties;
  }

  allModules(): LandscapeModule[] {
    return [this];
  }

  inContext(context: LandscapeModuleContext): LandscapeModule {
    return new LandscapeModule(this.information, context);
  }

  isSelected(): boolean {
    return this.context.selected;
  }

  isApplied(): boolean {
    return this.context.applied;
  }

  selectionTree(): LandscapeSelectionTree {
    return this.context.selectionTree;
  }

  unselectionTree(): LandscapeUnselectionTree {
    return this.context.unselectionTree;
  }
}
