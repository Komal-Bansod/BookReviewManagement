

const UserModel = require("../models/userModel")
const jwt = require("jsonwebtoken")

const isValid = function (value) {
    if (typeof value == undefined || value == null ) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if(typeof value === 'number' && value.toString().trim.length === 0) return false
    return true

}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}


const createUserData = async function (req, res) {
    try {
        let data = req.body
    const { title, name, phone, email, password, address } = data

        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, msg: "Please Enter some data" })
        
            if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "Title is Required" })
        }
       
       const titleEnum = function (title){
           return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1
       }

       if(!titleEnum(title)){
           return res.status(400).send({status:false, msg:"Is not valid title provide Mr, Mrs, Miss "})
       }
       

        if (!isValid(name)) {
            return res.status(400).send({ status: false, msg: "Name is Required" })
        }
     

            if (!(/^([+]\d{2})?\d{10}$/.test(phone)))
                return res.status(400).send({ status: false, msg: "Please Enter  a Valid Phone Number" })
        if (!isValid(phone))
            return res.status(400).send({ status: false, msg: "phone is required" })
        const alreadyExsit = await UserModel.findOne({ phone: data.phone })
        if (alreadyExsit) {
            return res.status(400).send({ status: false, msg: "phone already exit" })
        }
        if (!isValid(email))
        return res.status(400).send({ status: false, msg: "email is required" })
        if (isValid(data.email))
            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(data.email)))
                return res.status(400).send({ status: false, msg: "is not a valid email" })
       
        // let Lowercase = email.toLowerCase()
        // const filterUser = await UserModel.findOne({ email: Lowercase })
        // if (!filterUser) {
        //     return res.status(400).send({ status: false, msg: "no email found" })

        //}
        let alreadyExistEmail = await UserModel.findOne({ email: data.email })
        if (alreadyExistEmail) {
            return res.status(400).send({ status: false, msg: "email already exit" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "Password is Required" })
        }
        if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(data.password))) {
            return res.status(400).send({ status: false, msg: "please provide valid password with one uppercase letter ,one lowercase, one character and one number " })
        }
        if (isValid(data.address.pincode))

            if (!(/^([+]\d{2})?\d{6}$/.test(data.address.pincode)))
                return res.status(400).send({ status: false, msg: "Please Enter  a Valid pincode Number" })


        let savedData = await UserModel.create(data)
        res.status(201).send({status :true, msg:"succesfully run", data: savedData })

    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const loginUser = async function (req, res) {

    try {

        let body = req.body

        if (Object.keys(body) != 0) {
            let userName = req.body.email;
            let passwords = req.body.password;
            if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(userName))) { return res.status(400).send({ status: false, msg: "Please provide a valid email" }) }
            if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(passwords))) {
                return res.status(400).send({ status: false, msg: "please provide valid password with one uppercase letter ,one lowercase, one character and one number " })
            }



            let user = await UserModel.findOne({ email: userName, password: passwords });

            if (!user) {

                return res.status(400).send({
                    status: false,
                    ERROR: "username or the password is not corerct",
                });
            }

            let token = jwt.sign(
                {
                    userId: user._id,
                    email: user._email,
                    iat:Math.floor(Date.now()/1000),
                    ex:Math.floor(Date.now()/1000)+60*60*60

                }, "Group4" 

            );
            res.status(200).setHeader("x-api-token", token);
            return res.status(201).send({ status: "LoggedIn", TOKEN: token });
        }

        else { return res.status(400).send({ ERROR: "Bad Request" }) }

    }
    catch (err) {

        return res.status(500).send({ ERROR: err.message })
    }

};


module.exports.createUserData = createUserData;
module.exports.loginUser = loginUser;