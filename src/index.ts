#!/usr/bin/env node

export { sum } from "./lib/sum";
import { program } from "commander";
import * as fs from "fs";
import * as path from "path";
import download from "download-git-repo";
import * as util from "util";
import { exec } from "child_process";

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

  /** 命令：等待并打印 */
  program
    .command("waitlog <logstr>")
    .description("wait time(ms) and log input string")
    .option("-t --time-ms <time>", "wait time period")
    .action(function (logstr, cmdObj) {
      /** 子参数选项会由该回调参数对象cmdObj的属性传入 */
      waitLog(logstr, cmdObj.timeMs).then();
    });

  /** 命令：创建文件夹 */
  program
    .command("mkdir <dir>")
    .description("create dir if not exist")
    .action(function (dir, options) {
      mkdirIfNotExist(dir);
    });

  /** 命令：下载github仓库模板 */
  program
    .command("download <repo>")
    .description("download github repository to temp")
    .action(function (repo, options) {
      downloadRepository(repo).then();
    });

  /** 命令：复制处理文件夹 */
  program
    .command("changedir <dir>")
    .description("copy dir and do something")
    .action(function (dir, options) {
      changeDir(dir);
    });

  /** 命令：创建项目 */
  program
    .command("create <dir>")
    .description("clone and create app")
    .action(function (dir, options) {
      createApp(dir).then();
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

function mkdirIfNotExist(dir: string) {
  const targetPath = path.resolve(process.cwd(), dir);
  // console.log("targetPath", targetPath);

  /** 路径存在并且是文件夹 */
  fs.existsSync(targetPath)
    ? console.log("Warning: " + dir + " already exist,ignore")
    : (fs.mkdirSync(targetPath), console.log("Create dir: " + dir));
}

async function downloadRepository(repo: string) {
  const downloadAsync = new Promise((resolve, reject) =>
    download(repo, "./.tmp", function (err: any) {
      // console.log("err: ", err);
      err ? reject() : resolve();
    })
  );

  console.log("Start downloading ", repo);
  try {
    /** 新建临时文件夹 */
    mkdirIfNotExist(".tmp");
    /** 下载 */
    await downloadAsync;
    console.log("Download completed.");
  } catch (error) {
    console.log("Error: ", error);
  }
}

/** 复制和处理文件夹 */
function changeDir(dir: string) {
  const execPromisify = util.promisify(exec);
  const CWD = path.resolve(process.cwd());

  /** 注意目标目录存在就会到子目录里 */
  const cpDir = async () => execPromisify(`mv ./.tmp ./${dir}`, { cwd: CWD });
  const rmDir = async () =>
    execPromisify(`rm -rf ./${dir}/.git `, { cwd: CWD });

  const handle = async () => {
    await cpDir();
    // await rmDir();
  };

  handle()
    .then((d) => {
      console.log("Change dir ok");
    })
    .catch((error) => {
      console.log("error: ", error);
    });
}
/** 下载模板创建项目 */
async function createApp(dir: string) {
  await downloadRepository("czzonet/vue-template");
  changeDir(dir);
}
