import { makeObservable, autorun } from "../src";

interface testObj {
  n: number;
  m?: number;
  o?: Record<string, number>;
}
class Test {
  x = "";
  arr = [1];
  obj: testObj = {
    n: 1,
  };

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
    obj: [] as Array<testObj>,
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
  test.arr.pop();

  // 更新对象
  autorun(() => {
    testObj.obj.push({ ...test.obj });
  });
  test.obj = { n: 2 };
  test.obj.n = 3;
  test.obj.m = 4; // 添加属性
  delete test.obj.m; // 删除属性
  // test.obj.o = {a:1}
  // test.obj.o.a = 2 // TODO: 对于新增的对象类型属性，需要递归监听

  expect(testObj.x).toEqual(["", "hello", "xx"]);
  expect(testObj.arr).toEqual([[1], [1, 2], [1, 2, 3], [1, 2]]);
  expect(testObj.obj).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }, { n: 3, m: 4 }, { n: 3 }]);
});
