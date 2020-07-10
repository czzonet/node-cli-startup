#!/usr/bin/env node

export { sum } from "./lib/sum";
import { program } from "commander";

/**
 * 异步主函数
 */
async function main() {
  /** 名称和用法提示 */
  program.name("node-cli-startup").usage("[options]");
  /** 版本号 */
  program.version("1.0.0");

  /** 选项 */
  program
    .option("-d --debug", "output extra debug information")
    .option("-p --pizza-type <type>", "flavour of pizza");

  /** 命令 */
  program
    .command("waitlog <logstr>")
    .description("wait time(ms) and log input string")
    .option("-t --time-ms <time>", "wait time period")
    .action(function (logstr, cmdObj) {
      /** 子参数选项会由该回调参数对象cmdObj的属性传入 */
      waitLog(logstr, cmdObj.timeMs).then();
    });

  /** 额外的帮助信息 */
  program.on("--help", () => {
    console.log("");
    console.log("Example call:");
    console.log("  $ node index.js -h");
  });

  /** 收集剩余参数 异步 */
  program.parseAsync(process.argv);

  /** 调试信息输出 */
  if (program.debug) {
    console.log("program.args: ", program.args);
    console.log("pizza type: ", program.pizzaType);

    console.log("process.argv: ", process.argv);
  }
}

/** 主函数调用 */
main().then();

/**
 * 异步延时打印函数
 */
async function waitLog(logstr: string, timeMs?: number) {
  const timeAsync = new Promise((resolve, reject) =>
    setTimeout(() => resolve(), timeMs || 1000)
  );
  console.log("start waiting...");
  await timeAsync;
  console.log(logstr);
  console.log("wait end");
}
