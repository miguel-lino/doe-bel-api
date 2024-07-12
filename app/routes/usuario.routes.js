module.exports = app => {
    const controller = require("../controllers/usuario.controllers.js");
    const authControllers = require("../controllers/auth.controllers.js");
  
    var router = require("express").Router();

    // router.get("/", controller.getAll);

    router.get("/meus-dados", authControllers.verificarToken, controller.buscarUsuario);

    router.post("/criar", controller.criarUsuario);

    router.post("/login", authControllers.login);

    router.put("/", authControllers.verificarToken, controller.editarDadosUsuario);

    app.use("/usuarios", router);
  };