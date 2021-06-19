const csv = require("csvtojson");
const jsonExport = require("jsonexport");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const { uploadCsv, upload } = require("./csvConfig");

const mainRoute = (req, res) => {
  res.render("index");
};

const uploadCsvFile = async (req, res) => {
  var data = await uploadCsv(req, res);

  if (data.status && data.file !== undefined) {
    var file = data.file;
    var csvFilePath = "uploads/" + file.filename;
    var csvData = await csv().fromFile(csvFilePath);

    //group duplicate items
    var rows = groupByKey(csvData, "Class");
    var data = Object.values(rows);

    var mainOutputData = [];
    var duplicateData = [];
    //store all unique classes and get some data from duplicate values
    for (var i = 0; i < data.length; i++) {
      var duplicates = data[i];
      for (var j = 0; j < duplicates.length; j++) {
        var row = duplicates[j];
        if (j == 0) {
          mainOutputData.push(row);
        } else {
          duplicateData.push({
            Video_title: row.Video_title,
            Shoot_Day: row.Shoot_Day,
          });
        }
      }
    }

    //create output dir if it is not created
    const outputDir = path.resolve(__dirname, "../output");
    const compressedFileDir = path.resolve(__dirname, "../compressed");

    //change output data to JSON and CSV
    toCsv(mainOutputData, outputDir);
    toJsonFile(duplicateData, outputDir);

    //compress the folder
    var compressDir = path.join(compressedFileDir, "data.zip");
    var zipFile = await zipDirectory(outputDir, compressDir);
    res.sendFile(compressDir);
  }
};

const toCsv = (data, dir) => {
  jsonExport(data, (err, csv) => {
    if (err) {
      console.log(err);
    } else {
      fs.writeFileSync(path.join(dir, "main_data.csv"), csv);
    }
  });
};

const toJsonFile = (data, dir) => {
  var jsonData = JSON.stringify(data);

  fs.writeFile(path.join(dir, "duplicate_data.json"), jsonData, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const zipDirectory = (source, out) => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
};

//create output folder if it is not created
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const groupByKey = (array, key) => {
  return array.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, {
      [obj[key]]: (hash[obj[key]] || []).concat(obj),
    });
  }, {});
};

module.exports = { uploadCsvFile, mainRoute, createDir };
