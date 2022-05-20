const jwt = require('jsonwebtoken')
const bookModel = require('../models/bookModel')
const ObjectId = require('mongoose').Types.ObjectId



const authentication = async function (req, res, next) {

    try {
        let token = req.headers["x-api-key"];

        if (!token) {
            return res.status(400).send({ status: false, msg: "token must be present" });
        }
        let decodedToken = jwt.verify(token, "Group4");
        console.log(decodedToken)
        if (req.body.userId) {
            if (decodedToken.userId != req.body.userId) {
                return res.status(400).send({ status: false, msg: "this userId is different from decoded UserId" })
            }
        }

          if(!decodedToken) {
            return res.status(401).send({ status: false, msg: "token is invalid" });
        }
        let time  = Math.floor(Date.now()/1000)
        if(decodedToken.exp<time){
            return res.status(401).send({ status: false, msg: "token is expired,please login again" });
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }


}

const authorize = async function (req, res, next) {
    try {
        let bookId = req.params.bookId
        let token = req.headers["x-api-key"]
        let decodedToken = jwt.verify(token, "Group4")
        if (!bookId) {
            bookId = req.body.bookId
        }

        if (!bookId) {
            return res.status(400).send({ status: false, msg: "bookId is required" })
        }
        if (!ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "bookId invalid" })
        }
        let time  = Math.floor(Date.now()/1000)
        if(decodedToken.exp<time){
            return res.status(401).send({ status: false, msg: "token is expired,please login again" });
        }

        let book = await bookModel.findOne({_id:bookId,isDeleted:false})
        if (!book) return res.status(404).send({ status: false, msg: "that bookId not present in  database" })
        let userValid = decodedToken.userId
        if (userValid != book.userId) {
            return res.status(403).send({ status: false, msg: "you are not authorized to make change" })
        }
        next()

    }
    catch (err) {
        return res.send(500).send({ status: false, msg: err.message })
    }
}

module.exports.authentication = authentication
module.exports.authorize = authorize