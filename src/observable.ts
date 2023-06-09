import { globalState } from "./global";
import { dependencyManager } from "./dependencyManager";

// 返回observable的字段描述
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
    if (v === null) {
      return v;
    }
    if (Array.isArray(v) || typeof v === "object") {
      const p = new Proxy(v, {
        set: (target, key, value, receiver) => {
          Reflect.set(target, key, value, receiver);
          // 数组push/pop操作后，length会被，因此这里会触发2次set
          if (!Array.isArray(v) || key !== "length") {
            dependencyManager.trigger(this.obID);
          }
          return true;
        },
        deleteProperty: (target, key) => {
          Reflect.deleteProperty(target, key);
          dependencyManager.trigger(this.obID);
          return true;
        },
      });
      return p;
    }
    return v;
  }
}

export { observable };
