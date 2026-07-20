// Core Module
const path = require('path');

// External Module
const express = require('express');

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const { default: mongoose } = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded());
app.use(storeRouter);
app.use("/host", hostRouter);

app.use(express.static(path.join(rootDir, 'public')))

app.use(errorsController.pageNotFound);

const PORT = 3015;
const DB_PATH = "mongodb://akankshama97_db_user:Maurya9721@ac-n8xfrtj-shard-00-00.vbeekgg.mongodb.net:27017,ac-n8xfrtj-shard-00-01.vbeekgg.mongodb.net:27017,ac-n8xfrtj-shard-00-02.vbeekgg.mongodb.net:27017/airbnb?ssl=true&replicaSet=atlas-t9f0ym-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(DB_PATH).then(() => {
  console.log('Connected to mongoose');
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
});
}).catch(err => {
  console.log('Error while connecting to Mongo: ',err);
})