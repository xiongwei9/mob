import { makeObservable, PropType } from "../src";

class Test {
  x = "x";

  constructor() {
    makeObservable(this, {
      getX: PropType.Computed,
    });
  }

  get getX() {
    return `hello, ${this.x}`;
  }
}

test("computed", () => {
  const test1 = new Test();
  expect(test1.getX).toBe("hello, x");

  test1.x = "world";
  expect(test1.getX).toBe("hello, world");
});
