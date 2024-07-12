const bcrypt = require('bcryptjs');

const db = require("../models");
const Usuario = db.usuarios;

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

/* Decodificador de JWT */
const jwtJsDecode = require('jwt-js-decode');

dotenv.config()

const SECRET = process.env.SECRET;
const TOKEN_EXP_TIME = process.env.TOKEN_EXP_TIME;
const COOKIE_EXP_TIME = process.env.COOKIE_EXP_TIME;

exports.login = (req, res) => {
    try {
        Usuario.findOne({username: req.body.username}, (error, usuario) =>{

            if(!usuario){
                return res.status(401).json({
                    statusCode: 401,
                    message: "Usuário não encontrado!",
                    data: {
                        username: req.body.username
                    }
                })
            }
            const validacaoPassword = bcrypt.compareSync(req.body.password, usuario.password)

            if (!validacaoPassword) {
                return res.status(401).json({
                    statusCode: 401,
                    message: "Senha incorreta!",
                })
            }
            const token = jwt.sign({user_id: usuario.id, username: usuario.username}, SECRET,{
                expiresIn: TOKEN_EXP_TIME
            })

            /* Setando cookie */
            res.clearCookie("usertoken", { domain: 'doe-bel.site', path: '/', maxAge: COOKIE_EXP_TIME });
            res.cookie("usertoken", token, { domain: 'doe-bel.site', path: '/', maxAge: COOKIE_EXP_TIME });

            /* Setando cookie DSV */
            // res.clearCookie("usertoken", { path: '/' });
            // res.cookie("usertoken", token, { maxAge: COOKIE_EXP_TIME }, { path: '/' }); 

            /* Response */
            res.status(200).json({
                statusCode: 200,
                message: "Login realizado com sucesso!"
            })
        })


    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: error.message
        })
    }
}

exports.verificarToken = (req, res, next) => {

    const tokenHeader = req.headers["authorization"];
    const token = tokenHeader && tokenHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            statusCode: 401,
            message: "Não autorizado!",
        })
    }

    try {


        jwt.verify(token, SECRET);

        /* Após autenticar usuário, passa seu ID para as próximas chamadas que serão feitas na API */
        const decodedJwt = jwtJsDecode.decode(token);
        const idUsuario = decodedJwt.payload.user_id;
        const username = decodedJwt.payload.username;
        res.locals.idUsuario = idUsuario;
        res.locals.username = username;

        /* Chama a próxima ação */
        next();
        
    } catch (error) {
        res.status(401).json({
            statusCode: 401,
            message: "Token não valido."
        })
    }

}