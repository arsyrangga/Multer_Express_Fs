const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, "./db.sqlite"),
  },
});
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname.replaceAll(" ", "-"));
  },
});
const app = express();
const fileFilter = (req, file, cb) => {
  if (file.mimeType != "image/jpeg" && file.size > 50000) {
    cb(null, false);
  } else {
    cb(null, true);
  }
};

const removeImage = async (path) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.log(err);
  }
};

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./public")));
const upload = multer({ storage: storage, fileFilter: fileFilter });

app.get("/api/delete/:id", (req, res) => {
  const { id } = req.params;
  knex("users")
    .where({ id: id })
    .then((result) => {
      removeImage(path.join(__dirname, `./public/uploads/${result[0].avatar}`));
    })
    .catch((err) => {
      console.log(err);
      res.redirect("users");
    });

  knex("users")
    .where({ id: id })
    .del()
    .then((result) => {
      res.redirect("/users");
    });
});

app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/users.html"));
});

//routes
app.post("/api/upload", upload.single("avatar"), (req, res) => {
  const file = req.file;
  const data = req.body;

  knex("users")
    .insert({
      username: data.username,
      password: data.password,
      avatar: file.filename,
      created_at: new Date().toLocaleDateString(),
    })
    .then((result) => {
      res.redirect("/users");
    })
    .catch((err) => {
      res.redirect("/");
    });
});

app.get("/api/users", (req, res) => {
  knex("users")
    .orderBy("id", "desc")
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.listen(8000, () => {
  console.log("listen port 8000");
});
