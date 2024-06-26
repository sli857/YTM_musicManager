import fs from "fs";
import os from "os";
import { Worker } from "worker_threads";

const paths = [];
var lib = [];

const loadFiles = (path) => {
  fs.readdirSync(path).forEach((file) => {
    if (file.toLocaleLowerCase().endsWith(".mp3")) {
      paths.push(path + "/" + file);
    }
  });
};

const splitPath = (paths, n) => {
  var splitted = [];
  for (var i = n; i > 0; i--) {
    splitted.push(paths.splice(0, Math.ceil(paths.length / i)));
  }
  return splitted;
};

const libraryInit = (path) => {
  loadFiles(path);

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

  //finish and exit on all workers done
  var completedJobs = 0;
  const onWorkerDone = () => {
    completedJobs++;
    if (completedJobs === jobs.length) {
      // remove dangling ','
      const stat = fs.statSync(indexPath);
      const size = stat.size;
      fs.truncateSync(indexPath, size - 2);
      // enclose body
      fs.appendFileSync(indexPath, "\n]");

      console.log("All workers completed");
      process.exit(0);
    }
  };

  //assign jobs to each worker
  jobs.forEach((job, i) => {
    const worker = new Worker("./worker.js");
    worker.postMessage(job);
    worker.on("message", (message) => {
      if (message === "done") {
        console.log(`Worker ${i} completed`);
        onWorkerDone();
      }
    });
  });
};

const libraryLoad = (filePath) => {
  if (!fs.existsSync(filePath)) {
    libraryInit("./Library");
    return;
  }
  const index = fs.readFileSync(filePath, "utf-8");
  lib = JSON.parse(index);
  libraryUpdate(lib, filePath);
};

const libraryUpdate = (lib, path) => {
  //update lib
  return;
};

libraryLoad("./Library/index.json");
