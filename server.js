const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const mqtt = require('mqtt');
const assert = require('assert');
const os = require('os');

const DB_URL = process.env.DB_URL | 'mongodb://mongodb-service.mongodb.svc.cluster.local:27017';
const DB_NAME = process.env.DB_NAME | 'UPPM';

const MQTT_DEVICE_URL = process.env.MQTT_URL | 'mqtt://mqtt.default.svc.cluster.local:1883';
const MQTT_ALERT_URL = process.env.MQTT_ALERT_URL | "mqtt://mqtt.default.svc.cluster.local:1883";
const MQTT_SUBSCRIBE_TOPIC = process.env.MQTT_SUBSCRIBE_TOPIC | 'uppm/data';
const MQTT_PUBLISH_TOPIC = process.env.MQTT_SUBSCRIBE_TOPIC | "uppm/alert";
const HOSTNAME = os.hostname();

//const db_client = new MongoClient(DB_URL, {useNewUrlParser: true});
const mqtt_device_client = mqtt.connect(MQTT_DEVICE_URL, {clientID: HOSTNAME});
const mqtt_alert_client = mqtt.connect(MQTT_ALERT_URL, {clientID: HOSTNAME});

//console.log(HOSTNAME);

/*
var db;
db_client.connect((err) => {
    if(err) console.log("Can not connect to mongodb server @" + DB_URL);
    //assert.equal(null, err);
    console.log("Connected successully to server");
    db = client.db(DB_NAME);
});
*/
//MQTT Hook a subscribe to topic
mqtt_device_client.on('connect', () => {
    mqtt_device_client.subscribe(MQTT_SUBSCRIBE_TOPIC);
});

const checkPM = (val) => {
    if(val >= 100) mqtt_alert_client.publish(MQTT_PUBLISH_TOPIC, "[DANGER]");
    else if(val >= 50) mqtt_alert_client.publish(MQTT_PUBLISH_TOPIC, "[WARNING]");
    else mqtt_alert_client.publish(MQTT_PUBLISH_TOPIC, "[NORMAL]");
};

const addData = () => {

};

//Adding data to db server when MQTT get message
//when message is alive
mqtt_device_client.on('message', (topic, msg)=> {
    console.log("TOPIC: " + topic + "MSG: " + msg.toString());
    const data = JSON.parse(msg);

    if(topic === MQTT_SUBSCRIBE_TOPIC){
        //if PM more than limit
        //var message = {};
        //mqtt_client.publish(MQTT_PUBLISH_TOPIC, JSON.stringify(message));
        checkPM(data.PM25);
    }
});

const DIST_DIR = __dirname;
const app = express();

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(express.static(DIST_DIR));

//Main API for this project
app.get('/api', (req,res) => {
    res.end(
        '<!DOCTYPE html>' + 
        '<html>' +
        '<body>' +
        '<h1>example: </h1>' +
        '<table style="width:50%">' +
        '<tr><td>GET by /YYYY-YYYY:</td><td>/api/2005-2006</td></tr>'+
        '<tr><td>GET by /YYYY/MM-YYYY/MM:</td><td>/api/2005/01-2006/02</td></tr>' +
        '<tr><td>GET by /YYYY/MM/DD-YYYY/MM/DD:</td><td>/api/2005/11/20-2020/12/10</td></tr>'+
        '</table>' +
        '</body>' +
        '</html>'
    );
});

//===================================== GET =====================================
//API for get data from YYYY to YYYY
app.get('/api/:stYYYY-:spYYYY', (req,res) => {
    const from = req.params.stYYYY;
    const to = req.params.spYYYY;
    
    res.json({
        "FROM": from,
        "TO": to
    });
});

//API for get data from YYYY/MM to YYYY/MM
app.get('/api/:stYYYY/:stMM-:spYYYY/:spMM', (req,res) => {
    const from = req.params.stYYYY + " " + req.params.stMM;
    const to = req.params.spYYYY + " " + req.params.spMM;

    res.json({
        "FROM": from,
        "TO": to
    });
});

//API for get data from YYYY/MM/DD to YYYY/MM/DD
app.get('/api/:stYYYY/:stMM/:stDD-:spYYYY/:spMM/:spDD', (req,res) => {
    const from = req.params.stYYYY + " " + req.params.stMM + " " + req.params.stDD;
    const to = req.params.spYYYY + " " + req.params.spMM + " " + req.params.spDD;

    res.json({
        "FROM": from,
        "TO": to
    });
});
//===================================== POST =====================================
//URL for CAT LoRa post data to me
app.post('/api', (req,res) => {
    const data = req.body;
    //parser the message to my format,
    //and insert to the db
    json.status(200).end();
});
//================================================================================

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening to ${PORT}....`)
    console.log('Press Ctrl+C to quit.')
});