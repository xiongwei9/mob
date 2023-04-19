import { makeObservable, autorun } from "../src";

class Test {
  x = "";
  arr = [1];

  constructor() {
    makeObservable(this);
  }
}

test("observable", () => {
  const test = new Test();

  // test实例的快照存档
  const testObj = {
    x: [] as Array<string>,
    arr: [] as Array<Array<number>>,
  };

  // 更新常量
  autorun(() => {
    testObj.x.push(test.x);
  });
  test.x = "hello";
  test.x = "xx";

  // 更新数组
  autorun(() => {
    testObj.arr.push([...test.arr]);
  });
  test.arr = [1, 2];
  test.arr.push(3);

  expect(testObj.x).toEqual(["", "hello", "xx"]);
  expect(testObj.arr).toEqual([[1], [1, 2], [1, 2, 3]]);
});
