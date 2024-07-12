module.exports = app => {
    const controller = require("../controllers/usuario.controllers.js");
    const authControllers = require("../controllers/auth.controllers.js");
  
    var router = require("express").Router();

    router.get("/", authControllers.verificarToken, controller.rotaAutenticada);

    app.use("/autenticacao", router);
  };