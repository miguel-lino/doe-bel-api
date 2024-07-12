const bcrypt = require('bcryptjs');

const db = require("../models");
const Usuario = db.usuarios;

const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config();

const SECRET = process.env.SECRET;
const TOKEN_EXP_TIME = process.env.TOKEN_EXP_TIME;
const COOKIE_EXP_TIME = process.env.COOKIE_EXP_TIME;

exports.getAll = async (req, res) => {
    Usuario.find(function (err, usuarios) {
        if (err) {
            res.status(500).json({
                statusCode: 500,
                message: err.message
            });
        }
        res.status(200).json({
            statusCode: 200,
            data: {
                usuarios
            }
        })
    })
}

exports.buscarUsuario = async (req, res) => {
    Usuario.findById(res.locals.idUsuario, (error, retornoUsr) =>{
        if (error) {
            res.status(500).json({
                statusCode: 500,
                message: err.message
            });
        }
        res.status(200).json({
            statusCode: 200,
            data: {
                retornoUsr
            }
        })
    })
}

exports.criarUsuario = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (
        !email ||
        !email.includes('@') ||
        !email.includes('.') ||
        !password ||
        password.trim().length < 8
      ) {
        res.status(422).json({ message: 'E-mail inválido ou senha curta demais' });
        return;
      }

    try {
        Usuario.findOne({ username: req.body.username }, async (error, retornoUsr) => {
            if (retornoUsr) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Nome de usuário já está em uso!'
                })
                return;
            }
            
            /* Guarda senha criptografada e insere usuário no BD */
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            req.body.password = hashedPassword;

            const novoUsuario = new Usuario(req.body);
            const usuarioSalvo = await novoUsuario.save();

            /* Cria um token para o usuário já entrar no sistema autenticado */
            const token = jwt.sign({user_id: usuarioSalvo.id}, SECRET,{
                expiresIn: TOKEN_EXP_TIME
            })

            /* Setando cookie */
            res.clearCookie("usertoken", { domain: 'doe-bel.site', path: '/', maxAge: COOKIE_EXP_TIME });
            res.cookie("usertoken", token, { domain: 'doe-bel.site', path: '/', maxAge: COOKIE_EXP_TIME });

            /* Setando cookie DSV */
            // res.clearCookie("usertoken", { path: '/' });
            // res.cookie("usertoken", token, { maxAge: COOKIE_EXP_TIME }, { path: '/' }); 

            /* Response */
            res.status(201).json({
                statusCode: 201,
                message: "Usuário criado com sucesso!",
                data: {}
            })
            
        });
    } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: error.message
            });
    }
}

exports.editarDadosUsuario = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
          message: "Data to update can not be empty!"
        });
      }

      const body = req.body;
    
      Usuario.findByIdAndUpdate(res.locals.idUsuario, body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                  message: `Usuário inválido!`
                })
              } else { 
                    res.status(200).json({
                    statusCode: 200,
                    message: "Dados cadastrais editados com sucesso!",
                    data: {
                        body
                    }
                })
            }
        });
}

exports.rotaAutenticada = async (req, res) => {
    res.status(200).json({
        statusCode: 200,
        message: "Rota autenticada",
        data: {
            username: res.locals.username,
            tokenExpTime: TOKEN_EXP_TIME
        }
    })
}

