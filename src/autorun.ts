import { dependencyManager } from "./dependencyManager";

function autorun(handler: () => void) {
  dependencyManager.beginCollect(handler, null);
  handler();
  dependencyManager.endCollect();
}

export { autorun };
