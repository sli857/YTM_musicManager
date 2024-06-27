import fs from "fs";
import os from "os";
import { Worker } from "worker_threads";

var lib = [];

const loadFiles = (path) => {
  const paths = [];
  fs.readdirSync(path).forEach((file) => {
    if (file.toLocaleLowerCase().endsWith(".mp3")) {
      paths.push(path + "/" + file);
    }
  });
  return paths;
};

const splitPath = (paths, n) => {
  var splitted = [];
  for (var i = n; i > 0; i--) {
    splitted.push(paths.splice(0, Math.ceil(paths.length / i)));
  }
  return splitted;
};

const runWorkers = async (jobs, indexPath) => {
  const workerPromises = jobs.map((job, i) => {
    return new Promise((resolve) => {
      const worker = new Worker("./loadWorker.js");
      worker.postMessage(job);
      worker.on("message", (message) => {
        if (message === "done") {
          console.log(`Worker ${i} completed`);
          resolve();
        }
      });
    });
  });

  await Promise.all(workerPromises);

  // remove dangling ',/n'
  const stat = fs.statSync(indexPath);
  const size = stat.size;
  fs.truncateSync(indexPath, size - 2);
  // enclose body
  fs.appendFileSync(indexPath, "\n]");

  console.log("All workers completed");
  process.exit(0);
};

const libraryInit = async (path) => {
  const paths = loadFiles(path);

  //create index.js if not exists
  const indexPath = path + "/index.json";
  if (fs.existsSync(indexPath)) {
    fs.unlinkSync(indexPath);
  }
  fs.writeFileSync(indexPath, "[\n");

  //get # of cores
  const cpus = os.cpus().length;

  //split jobs by # of cores
  const jobs = splitPath(paths, cpus);

  await runWorkers(jobs, indexPath);
};

const libraryLoad = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    await libraryInit("./Library");
  }
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const lib = JSON.parse(data);
    console.log(lib);
    libraryUpdate(lib, "./Library");
    return lib;
  } catch (err) {
    console.error(err);
  }
};

const libraryUpdate = (lib, path) => {
  //update lib
  return;
};

libraryLoad("./Library/index.json");
