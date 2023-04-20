type Target = object | null;
type Watcher = null | (() => void);
interface Dependency {
  target: Target;
  watchers: Array<Watcher>;
}

let isCollecting = false;

class DependencyManager {
  /**
   * 存储所有observable和handler的映射关系
   */
  private store: Record<string, Dependency> = {};

  private nowObserver: Watcher = null;
  private nowTarget: Target = null;
  private observerStack: Array<() => void> = [];
  private targetStack: Array<Target> = [];

  /**
   * 触发某个obID的依赖函数
   */
  trigger(obID: string) {
    const ds = this.store[obID];
    if (!ds?.watchers) {
      return;
    }
    ds.watchers.forEach((d) => {
      if (!d) {
        return;
      }
      // 调用watcher时，收集watcher中未收集到的依赖
      // 例如在autorun，若存在if-else分支，初次执行可能存在无法收集到的依赖
      this.beginCollect(d, ds.target);
      d.call(ds.target || this);
      this.endCollect();
    });
  }

  /**
   * 开始收集依赖
   * 缓存当前上下文（observer/target）
   */
  beginCollect(observer: () => void, target: Target) {
    isCollecting = true;
    this.observerStack.push(observer);
    this.targetStack.push(target);
    this.nowObserver = this.observerStack.length > 0 ? this.observerStack[this.observerStack.length - 1] : null;
    this.nowTarget = this.targetStack.length > 0 ? this.targetStack[this.targetStack.length - 1] : null;
  }

  /**
   * 收集依赖
   */
  collect(obID: string) {
    if (this.nowObserver) {
      this._addNowObserver(obID);
    }
    return false;
  }

  /**
   * 结束收集依赖
   */
  endCollect() {
    isCollecting = false;
    this.observerStack.pop();
    this.targetStack.pop();
    this.nowObserver = this.observerStack.length > 0 ? this.observerStack[this.observerStack.length - 1] : null;
    this.nowTarget = this.targetStack.length > 0 ? this.targetStack[this.targetStack.length - 1] : null;
  }

  /**
   * 填一个当前栈中的依赖到 store 中
   */
  private _addNowObserver(obID: string) {
    const currentWatchers = this.store?.[obID]?.watchers ?? [];
    if (currentWatchers.indexOf(this.nowObserver) >= 0) {
      return;
    }
    const dep: Dependency = {
      target: this.nowTarget,
      watchers: [...currentWatchers, this.nowObserver],
    };
    this.store[obID] = dep;
  }
}

const dependencyManager = new DependencyManager();
export { dependencyManager };
