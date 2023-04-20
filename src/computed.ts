import { globalState } from "./global";

// TODO
function computed<T extends object, K extends keyof T>(
  target: T,
  name: string | symbol
): TypedPropertyDescriptor<T[K]> {
  const getter = target[name as K];
  const cp = new Computed(target, getter);

  const descriptor: TypedPropertyDescriptor<T[K]> = {
    enumerable: true,
    configurable: true,
    get: function () {
      // return cp.get()
      return getter;
    },
  };
  return descriptor;
}

class Computed<T extends object, K extends keyof T> {
  private cpID = "";

  private value: T[K];
  private target: T;
  private getter: unknown;

  constructor(target: T, getter: unknown) {
    this.cpID = `cp-${globalState.cpIDCounter++}`;
    this.target = target;
    this.getter = getter;

    this.value = target[getter as K];
  }

  /**
   * 供外部收集当前对象依赖的时候使用
   */
  get() {
    // this._bindAutoReCompute();
    // dependenceManager.collect(this.cpID);
    return this.value;
  }
}

export { computed };
