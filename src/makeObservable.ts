// import { computed } from "./computed";
import { observable } from "./observable";

enum PropType {
  Observable,
  Computed,
}

/**
 * 创建observable
 * 遍历对象的属性，将其封装成observable属性
 */
function makeObservable<T extends object>(target: T, opts?: Record<string | symbol, PropType>): T {
  for (const name of Reflect.ownKeys(target)) {
    if (!opts || !(name in opts)) {
      Reflect.defineProperty(target, name, observable(target, name));
      continue;
    }
    switch (opts[name]) {
      case PropType.Observable:
        Reflect.defineProperty(target, name, observable(target, name));
        break;
      //   case PropType.Computed:
      //     Reflect.defineProperty(target, name, computed(target, name));
      //     break;
      default:
        throw new Error("[makeObservable] PropType error");
    }
  }
  return target;
}

export { makeObservable, PropType };
