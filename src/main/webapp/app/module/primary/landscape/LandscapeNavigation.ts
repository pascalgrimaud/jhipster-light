import { ModuleSlug } from '@/module/domain/ModuleSlug';
import { LandscapeLevel } from '@/module/domain/landscape/LandscapeLevel';

export class LandscapeNavigation {
  private currentModule: number;
  private currentElement: number;
  private currentLevel: number;
  private landscapeElements: Map<string, HTMLElement>;
  private levels: LandscapeLevel[];

  constructor(landscapeElements: Map<string, HTMLElement>, levels: LandscapeLevel[]) {
    this.currentModule = 0;
    this.currentElement = 0;
    this.currentLevel = 0;
    this.landscapeElements = landscapeElements;
    this.levels = levels;
  }

  private level() {
    return this.levels[this.currentLevel];
  }

  private element() {
    return this.level().elements[this.currentElement];
  }

  private module() {
    return this.element().allModules()[this.currentModule];
  }

  public goUp() {
    this.nextElement(true);
  }

  public goDown() {
    this.nextElement(false);
  }

  public goLeft() {
    const current_module = this.module().slug();
    this.currentLevel = this.decrease(this.currentLevel);

    this.calculateDistanceAndUpdate(current_module);
  }

  public goRight() {
    const current_module = this.module().slug();

    this.currentLevel = this.increase(this.currentLevel, this.levels.length - 1);
    this.calculateDistanceAndUpdate(current_module);
  }

  public goToDependencie() {
    if (this.module().dependencies().length == 0) return;

    const element_index = this.levels[this.currentLevel - 1].elements.findIndex(
      e => e.slug().get() == this.module().dependencies()[0].get()
    );
    this.updateCursor(this.currentLevel - 1, element_index, 0);
  }

  public goToDependent() {
    const next_level = this.levels[this.currentLevel + 1];
    const element_index = next_level.elements.findIndex(element => {
      return (
        element.allModules().findIndex(module => {
          return (
            module.dependencies().findIndex(e => {
              return e.get() == this.element().slug().get();
            }) >= 0
          );
        }) >= 0
      );
    });

    if (element_index == -1) return;

    this.updateCursor(this.currentLevel + 1, element_index, 0);
  }

  public getSlug() {
    return this.module().slug();
  }

  private calculateDistanceAndUpdate(current_module: ModuleSlug) {
    const current_module_html = this.landscapeElements.get(current_module.get()) as HTMLElement;

    // calculateDistanceAndUpdate
    let smallest_distance = Infinity;
    // Iterate throw Element and Modules until you get the smallest one.
    this.level().elements.forEach((element, element_index) => {
      element.allModules().forEach((module, index) => {
        const module_html_element = this.landscapeElements.get(module.slug().get()) as HTMLElement;
        // Compare the distance from the currentModule to That Module.
        const distance = Math.abs(module_html_element.getBoundingClientRect().y - current_module_html.getBoundingClientRect().y);
        if (distance < smallest_distance) {
          smallest_distance = distance;
          this.updateCursor(this.currentLevel, element_index, index);
        }
      });
    });
  }

  private increase(value: number, max: number) {
    return value < max ? value + 1 : max;
  }

  private decrease(value: number) {
    return value > 0 ? value - 1 : 0;
  }

  private nextModule(ArrowUp: boolean) {
    const old_value = this.currentModule;
    if (ArrowUp) this.currentModule = this.decrease(this.currentModule);
    else this.currentModule = this.increase(this.currentModule, this.element().allModules().length - 1);

    return this.currentModule != old_value;
  }

  private nextElement(ArrowUp: boolean) {
    if (this.nextModule(ArrowUp)) return;

    if (ArrowUp) {
      this.currentElement = this.decrease(this.currentElement);
      this.currentModule = this.element().allModules().length - 1;
    } else {
      this.currentElement = this.increase(this.currentElement, this.level().elements.length - 1);
      this.currentModule = 0;
    }
  }

  private updateCursor(currentLevel: number, currentElement: number, currentModule: number) {
    this.currentLevel = currentLevel;
    this.currentElement = currentElement;
    this.currentModule = currentModule;
  }
}
