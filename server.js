const express = require("express");
const app = express();
const mongoose = require("mongoose")
const router = require("./routes/index")
const cookieParser = require("cookie-parser");
const helmet = require("helmet")
const chalk = require("chalk").default;
require("dotenv").config();
const port = process.env.PORT;
const dns = require("dns")

dns.setServers(["8.8.8.8", "8.8.4.4"]);
app.use(cookieParser())
app.use(helmet())
app.use(express.json());
app.use("/api",router)

app.listen(port, () => {
  console.log(chalk.blue(`server is runing on port ${port}`));
});

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => console.log(chalk.bgYellow.black("Connected!")))
  .catch((error) => console.log(error));
