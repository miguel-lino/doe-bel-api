module.exports = app => {
    const controller = require("../controllers/anuncio.controllers.js");
    const authControllers = require("../controllers/auth.controllers.js");

    var router = require("express").Router();

    router.get("/", controller.getAll);

    router.get("/minhas-doacoes", authControllers.verificarToken, controller.buscaAnunciosUsuario);

    router.post("/criar", authControllers.verificarToken, controller.criarAnuncio);

    /* Possivel falha: qualquer usuario autenticado poderia excluir itens de outro usuario? */
    router.delete("/:id", authControllers.verificarToken, controller.excluiAnuncio);

    /* Possivel falha: qualquer usuario autenticado poderia editar itens de outro usuario? */
    router.put("/:id", authControllers.verificarToken, controller.editaAnuncio);

    app.use("/anuncios", router);
  };