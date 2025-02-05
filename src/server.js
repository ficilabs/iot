const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

// MQTT Configuration
const broker = 'wss://broker.hivemq.com:1883/mqtt';
const clientId = 'server_' + Math.random().toString(16).substr(2, 8);
const topicPrefix = 'ficilabs/';

const mqttClient = mqtt.connect(broker, {
  clientId: clientId,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30000
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe([`${topicPrefix}+input1`]);
  mqttClient.subscribe([`${topicPrefix}+output1`]);
});

mqttClient.on('message', (topic, message) => {
  const topicType = topic.split('/')[1];
  io.emit(topicType, message.toString());
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('toggleInput', (data) => {
    const { lightId, state } = data;
    mqttClient.publish(`${topicPrefix}input${lightId}`, state);
  });
});

module.exports = httpServer;
