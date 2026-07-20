const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const userRoutes = require("./routes/userRouter");
const hostRoutes = require("./routes/hostRouter");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/images/:filename", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "images", req.params.filename));
});

app.use("/", userRoutes);
app.use("/host", hostRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on address http://localhost:${PORT}`);
});