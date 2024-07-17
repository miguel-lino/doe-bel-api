const db = require("../models");
const Anuncio = db.anuncios;
const Usuario = db.usuarios;

// exports.getAll = async (req, res) => {
//     Anuncio.find(function (err, anuncios) {
//         if (err) {
//             res.status(500).json({
//                 statusCode: 500,
//                 message: err.message
//             });
//         }

//         anuncios = anuncios.filter((x) => x.item_doado === false);

//         res.status(200).json({
//             statusCode: 200,
//             data: {
//                 anuncios
//             }
//         })
//     })
// }

exports.getAll = async (req, res) => {

  /* FAZ JOIN DA COLLECTION DE ANUNCIOS COM A COLLECTION DE USUARIOS -> Para pegar os dados de contato atualizados de cada anunciante */

  // Documentação oficial do Join -> https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/#std-label-lookup-mergeObjects
  // Resolvendo problema: Fazer join de ID string com ID (object id) -> https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/#std-label-lookup-mergeObjects

  Anuncio.aggregate([
      {
        '$lookup': {
          //searching collection name
          'from': 'usuarios',
          //setting variable [searchId] where your string converted to ObjectId
          'let': {"searchId": {$toObjectId: "$item_usuario"}}, 
          //search query with our [searchId] value
          "pipeline":[
            //searching [searchId] value equals your field [_id]
            {"$match": { "$expr": { $eq: [ "$_id", "$$searchId" ] }}}
          ],
          'as': 'usuarios'
        }
    },
    {
        $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$usuarios", 0 ] }, "$$ROOT" ] } }
    },
    { 
        $project: { usuarios: 0 } 
    }
  ], 
  
  // Esta parte é o "Then" da promise, depois que o JOIN voltar do BD, faça algo...
  function(err, anuncios) {

      // Response em caso de erro
      if (err) {
          res.status(500).json({
              statusCode: 500,
              message: err.message
          });
      }

    // Retira informações sensíveis do usuário que não são pertinentes no Anúncio
    anuncios.forEach(element => {
        delete element._id;   // id do usuário
        delete element.username;
        delete element.password;
        delete element.item_usuario; // id do usuário
      });

    // Filtra itens marcados como "doados"
    anuncios = anuncios.filter((x) => x.item_doado === false);

    // Response em caso de sucesso
      res.status(200).json({
          statusCode: 200,
          data: {
              anuncios
          }
      })
  })
}
  

exports.criarAnuncio = async (req, res) => {
    try {
        /* Recupera id do usuario */
        const bodyRequest = req.body;
        bodyRequest.item_usuario = res.locals.idUsuario;
        bodyRequest.item_doado = false;

        /* Salva anuncio no BD */
        const novoAnuncio = new Anuncio(bodyRequest);
        const anuncioSalvo = novoAnuncio.save();

            res.status(201).json({
                statusCode: 201,
                message: "Anuncio criado com sucesso!",
                data: {
                    anuncioSalvo
                }
            })
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: error.message
            });
        }
  
}

exports.buscaAnunciosUsuario = async (req, res) => {
    try {
        Anuncio.find({item_usuario: res.locals.idUsuario}, (error, retornoAnuncios) =>{ 
             res.status(200).json({
                 statusCode: 201,
                 message: "Anuncios recuperados com sucesso!",
                 data: {
                    retornoAnuncios
                 }
             })
         });
         } catch (error) {
             res.status(500).json({
                 statusCode: 500,
                 message: error.message
             });
         }
}

exports.excluiAnuncio = async (req, res) => {
  const id = req.params.id;

  Anuncio.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Anúncio inválido!`
        });
      } else {
        res.send({
          message: "Anuncio excluído com sucesso!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Erro ao excluir anúncio"
      });
    });
};

// exports.excluiAnuncio = (req, res) => {
//     const id = req.params.id;
  
//     Anuncio.findByIdAndRemove(id, { useFindAndModify: false })
//       .then(data => {
//         if (!data) {
//           res.status(404).send({
//             message: `Anúncio inválido!`
//           });
//         } else {
//           res.send({
//             message: "Anuncio excluído com sucesso!"
//           });
//         }
//       })
//       .catch(err => {
//         res.status(500).send({
//           message: "Erro ao excluir anúncio"
//         });
//       });
//   };

  exports.editaAnuncio = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
          message: "Data to update can not be empty!"
        });
      }
    
      const id = req.params.id;
      const body = req.body;

      /* Converte String para Bool */
      body.item_montado = body.item_montado === 'Sim' ? true : false;     
      body.item_retirada = body.item_retirada === 'Sim' ? true : false;     
      body.item_conserto = body.item_conserto === 'Sim' ? true : false;     
      body.item_doado = body.item_doado === 'Sim' ? true : false;     
    
      Anuncio.findByIdAndUpdate(id, body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                  message: `Anúncio inválido!`
                })
              } else { 
                    res.status(200).json({
                    statusCode: 200,
                    message: "Anúncio editado com sucesso!",
                    data: {
                        body
                    }
                })
            }
        });
}

// Carrinho.aggregate([
//   { "$match": { "_id": mongoose.Types.ObjectId(req.params.id) } },
//   {
//     "$lookup": {
//       "from": "produtos",
//       "localField": "produtos._id",
//       "foreignField": "_id",
//       "as": "produtosnocarrinho"
//     }
//   },
//   {
//     "$addFields": {
//       "total": {
//         "$reduce": {
//           "input": "$produtos",
//           "initialValue": 0,
//           "in": { "$add": ["$$value", "$$this.price"] }
//         }
//       }
//     }
//   }
// ])