const express = require("express");
const path = require("path");
const sendScheduleHandler = require("./api/send-schedule");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.all("/api/send-schedule", (req, res) => sendScheduleHandler(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Shift scheduler running on port ${PORT}`));
