// const { parentPort } = require("node:worker_threads");

// parentPort.on("message", (limit) => {
//   let sum = 0;

//   for (let i = 1; i <= limit; i++) {
//     sum += i;
//   }

//   parentPort.postMessage(sum);
// });
// function someCPUintensiveWork() {
//   for (let i = 0; i <= 100_000_000_0; i++) {}
//   //   return Promise.resolve();
// }
// async function foo() {
//   await someCPUintensiveWork();
//   console.log("A");
// }
// foo();
// console.log("B");
async function foo() {
  console.log("A");

  await Promise.resolve();

  console.log("B");
}

console.log("C");
foo();
console.log("D");
