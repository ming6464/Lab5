const express = require("express");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const exhbs = require("express-handlebars");
const { MulterError } = require("multer");
const { extname } = require("path");
const port = 8099;
const app = express();
let checkUpLoad = false;
let mess = "";
const pathDir = "./uploads";
//multer

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(pathDir)) {
      fs.mkdirSync(pathDir);
    }
    cb(null, pathDir);
  },
  filename: function (req, file, cb) {
    let originName = file.originalname.split(".");
    let name = "";
    let length = originName.length;
    for (let i = 0; i < length - 1; i++) {
      name += originName[i];
    }
    let extname = originName[length - 1];
    let arrExtname = ["jpg", "png", "gif"];
    if (arrExtname.includes(extname)) extname = "jpeg";
    name += "_" + Date.now() + "." + extname;
    cb(null, name);
  },
});
let upSingle = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("myFile");
let upMulple = multer({
  storage: storage,
}).array("myFiles", 10);

//

app.engine(
  "hbs",
  exhbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: "./views/layouts",
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", ".hbs");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("home", {
    checkUpLoad,
  });
});

app.post("/uploadFile", (req, res) => {
  checkUpLoad = true;
  upSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      mess = "Thất bại, file vượt quá 5MB";
    } else if (err && !req.file) {
      mess = "Hãy Chọn file";
    } else mess = "Upload file thành công !";
    res.render("home", { checkUpLoad, mess });
  });
});
app.post("/uploadFiles", (req, res) => {
  checkUpLoad = true;
  upMulple(req, res, (err) => {
    if (err && !req.file) {
      mess = "Hãy chọn files";
    } else mess = "Upload files thành công";
    res.render("home", { mess, checkUpLoad });
  });
});

app.listen(port, (err) => {
  if (err) throw err;
  console.log("Run Port : " + port);
});
