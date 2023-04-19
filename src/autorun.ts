import { dependencyManager } from "./dependency_manager";

function autorun(handler: () => void) {
  dependencyManager.beginCollect(handler, null);
  handler();
  dependencyManager.endCollect();
}

export { autorun };
