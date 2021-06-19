const path = require("path");
const express = require("express");
const ejs = require("ejs");
const app = express();

const env = require("./utils/environments");
const csv = require("./csvParse"); 
const {createDir} = require("./csvParse")


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));

//create output dir if it is not created
const outputDir = path.join(__dirname, "../output");
const compressedFileDir = path.join(__dirname, "../compressed")
createDir(outputDir);
createDir(compressedFileDir)

app.get("/", csv.mainRoute);
app.post("/upload", csv.uploadCsvFile);

const port = env.port;

app.listen(port, console.log(`Server runing on port ${port}`));
