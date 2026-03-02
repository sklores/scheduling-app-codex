const express = require("express");
const path = require("path");
const sendScheduleHandler = require("./api/send-schedule");
const supabaseConfigHandler = require("./api/supabase-config");
const employeeLoginHandler = require("./api/employee-login");
const employeeScheduleHandler = require("./api/employee-schedule");
const bootstrapAdminHandler = require("./api/bootstrap-admin");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.all("/api/send-schedule", (req, res) => sendScheduleHandler(req, res));
app.all("/api/supabase-config", (req, res) => supabaseConfigHandler(req, res));
app.all("/api/employee-login", (req, res) => employeeLoginHandler(req, res));
app.all("/api/employee-schedule", (req, res) => employeeScheduleHandler(req, res));
app.all("/api/bootstrap-admin", (req, res) => bootstrapAdminHandler(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Shift scheduler running on port ${PORT}`));
