import fs from "fs";
import os from "os";
import { Worker } from "worker_threads";

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

const runInitWorkers = async (jobs, indexPath) => {
  const workerPromises = jobs.map((job, i) => {
    return new Promise((resolve) => {
      const worker = new Worker("./utils/worker.js");
      worker.postMessage({ task: "init", job: job });
      worker.on("message", (message) => {
        if (message.status === "done") {
          console.log(`Init worker ${i} completed`);
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

  console.log("All init workers completed");
};

const runUpdateWorkers = async (lib, jobs) => {
  const workerPromises = jobs.map((job, i) => {
    return new Promise((resolve) => {
      const worker = new Worker("./utils/worker.js");
      worker.postMessage({ task: "update", job: job, lib: lib });
      // TODO worker.on();
      worker.on("message", (message) => {
        //console.log(message.toAdd);
        if (message.toAdd.length !== 0) {
          message.toAdd.forEach((item) => {
            lib.push(item);
            console.log(`The following track will be added: ${item.file}`);
          });
        }
        resolve();
      });
    });
  });
  await Promise.all(workerPromises);
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

  await runInitWorkers(jobs, indexPath);
};

const libraryLoad = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    await libraryInit("./Library");
  }
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const lib = JSON.parse(data);
    await libraryUpdate(lib, "./Library");
  } catch (err) {
    console.error(err);
  }
};

const libraryUpdate = async (lib, path) => {
  // delete non-existing records
  lib = await lib.filter((item) => {
    const path = item.file;
    const exist = fs.existsSync(path);
    if (!exist) console.log(`Removed non-existing record: ${path}`);
    return exist;
  });

  // load new files into memory (lib)
  const paths = loadFiles(path);
  const cpus = os.cpus().length;
  const jobs = splitPath(paths, cpus);
  await runUpdateWorkers(lib, jobs);

  // flush updated lib to index.js
  try {
    fs.writeFileSync(
      "./Library/index.json",
      JSON.stringify(lib, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.error(err);
  }
  console.log("Library has been updated. Index.json is up-to-date");
  console.log(`In total: ${lib.length} tracks`);
  return;
};

export { libraryLoad };
