"use strict";
exports.__esModule = true;
var express_1 = require("express");
var dotenv_1 = require("dotenv");
var body_parser_1 = require("body-parser");
var path_1 = require("path");
var url_1 = require("url");
var node_child_process_1 = require("node:child_process");
var psuspend_1 = require("psuspend");
dotenv_1["default"].config();
var __filename = url_1.fileURLToPath(import.meta.url);
var __dirname = path_1["default"].dirname(__filename);
var distDir = __dirname + "/dist/";
var port = process.env['PORT'] ? process.env['PORT'] : '8000';
var app = express_1["default"]();
var runSim;
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(body_parser_1["default"].json());
app.use(express_1["default"].static(distDir));
app.listen(port, function () {
    console.log("[server]: Server is running at http://localhost:" + port);
});
app.get("/api/status", function (req, res) {
    res.status(200).json({ status: "UP" });
});
app.get('/api/start-simulation', function (req, res) {
    var args = ["-m", "communication", "fixed", "--gtfs", "--gtfs-folder", "data/20191101/gtfs/", "-r", "data/20191101/requests.csv", "--multimodal", "--log-level", "INFO", "-g", "data/20191101/bus_network_graph_20191101.txt", "--osrm"];
    // const scriptCommand = `python -m communication fixed --gtfs --gtfs-folder "data/20191101/gtfs/" -r "data/20191101/requests.csv" --multimodal --log-level INFO -g "data/20191101/bus_network_graph_20191101.txt" --osrm`
    runSim = node_child_process_1.spawn("python", args, { cwd: "../../" });
    runSim.on('spawn', function () {
        console.log('Started runSim:');
        // console.log(runSim);
        console.log("Spawned child pid: " + (runSim === null || runSim === void 0 ? void 0 : runSim.pid));
    });
    runSim.on('error', function (err) {
        console.error('Exited runSim with error:', err.message);
    });
    runSim.stderr.on('data', function (err) {
        console.log("" + err);
    });
    res.status(200).json({ status: "RUNNING" });
});
app.get('/api/pause-simulation', function (req, res) {
    if (runSim) {
        psuspend_1["default"](runSim, true);
        console.log(runSim.killed);
    }
    res.status(200).json({ status: "PAUSED" });
});
app.get('/api/continue-simulation', function (req, res) {
    if (runSim) {
        psuspend_1["default"](runSim, false);
    }
    res.status(200).json({ status: "RESUMED" });
});
