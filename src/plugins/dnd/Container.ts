import { containerKeyExtractor } from './key';
import SortedItems from './structure/SortedItems';
import { orientationToAxis, axisMeasure } from './utils';
import Dragger from './Dragger';
import { GlobalConfig, Config, Containers, Dimension } from '../../types';

class Container {
  public id: string;
  public el: HTMLElement;
  public containers: Containers;
  public children: SortedItems<Dragger>;
  public dndConfig: GlobalConfig;
  public containerConfig: Config;
  public dimension: Dimension;

  constructor({
    el,
    containers,
    dndConfig,
    containerConfig,
  }: {
    el: HTMLElement;
    containers: Containers;
    dndConfig: GlobalConfig;
    containerConfig: Config;
  }) {
    this.el = el;
    this.id = containerKeyExtractor();
    this.containers = containers;
    this.children = new SortedItems<Dragger>({
      sorter: this.sorter.bind(this),
    });
    this.dndConfig = dndConfig;
    this.containerConfig = containerConfig;

    this.containers[this.id] = this;
    this.dimension = {};
  }

  sorter(a: Dragger, b: Dragger): number {
    const { orientation } = this.containerConfig;
    const axis = orientationToAxis[orientation];
    const [minProperty] = axisMeasure[axis];
    return a.dimension[minProperty] - b.dimension[minProperty];
  }

  // used for transition
  addDirectChild(dragger: Dragger) {
    this.children.add(dragger);
    dragger.container = this;
    dragger._teardown = () => {
      const index = this.children.findIndex(child => child === dragger);
      if (index !== -1) this.children.splice(index, 1);
    };
  }

  cleanup() {
    delete this.containers[this.id];
  }
}

export default Container;