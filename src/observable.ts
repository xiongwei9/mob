import { dependencyManager } from "./dependency_manager";

/**
 * 创建observable
 * 遍历对象的属性，将其封装成observable属性
 */
function makeObservable<T extends object>(target: T): T {
  for (const name of Reflect.ownKeys(target)) {
    Reflect.defineProperty(target, name, observable(target, name));
  }
  return target;
}

//
function observable<T extends object, U extends keyof T>(
  target: T,
  name: string | symbol
): TypedPropertyDescriptor<T[U]> {
  const value = target[name as U];
  const ob = new Observable(value);
  const descriptor: TypedPropertyDescriptor<T[U]> = {
    enumerable: true,
    configurable: true,
    get: function () {
      return ob.get();
    },
    set: function (v) {
      return ob.set(v);
    },
  };
  return descriptor;
}

const globalState = {
  obIDCounter: 0,
};

class Observable<T> {
  private obID = "";
  private value: T;

  constructor(v: T) {
    this.obID = `ob-${globalState.obIDCounter++}`;
    this.value = this.wrapValue(v);
  }

  get() {
    dependencyManager.collect(this.obID);
    return this.value;
  }

  set(v: T) {
    this.value = this.wrapValue(v);
    dependencyManager.trigger(this.obID);
  }

  private wrapValue(v: T) {
    if (Array.isArray(v)) {
      const p = new Proxy(v, {
        set: (t, key, value, receiver) => {
          Reflect.set(t, key, value, receiver);
          if (key !== "length") {
            dependencyManager.trigger(this.obID);
          }
          return true;
        },
      });
      return p;
    }
    return v;
  }
}

export { makeObservable };
