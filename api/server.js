const express = require("express");

const Car = require('./cars/cars-model');

const server = express();

server.use(express.json());

server.get("/", (req, res) => {
    res.status(200).json({ api: "up" });
  });
  
  server.get("/cars", (req, res) => {
    Car.getAll()
      .then(car => {
        res.status(200).json(car);
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });
  
  server.get("/cars/:id", (req, res) => {
    Car.getById(req.params.id)
      .then(car => {
        if(car == null) {
          res.status(404).json({ message: 'car not found' });
          return;
        }
        res.status(200).json(car);
      });
  });
  
  server.post("/cars", (req, res) => {
    Car.insert(req.body)
      .then(car => {
        res.status(201).json(car);
      })
      .catch(error => {
        res.status(500).json(error);
      })
  });
  
  server.delete("/cars/:id", (req, res) => {
    Car.remove(req.params.id)
      .then(car => {
        if(car == null) {
          res.status(404).json({ message: 'car not found' });
          return;
        }
        res.status(200).json(car);
      });
  });
  
  server.put("/cars/:id", (req, res) => {
    Car.update(req.params.id, req.body)
      .then(car => {
        if(car == null) {
          res.status(404).json({ message: 'car not found' });
          return;
        }
        res.status(200).json(car);
      })
      .catch(error => {
        res.status(500).json(error);
      })
  });
  
  module.exports = server;