const jwt = require('jsonwebtoken')

const authmiddle = async (req,res,next) => {
    const decode = req.headers.authorization
    if(!decode || !decode.startsWith('Bearer ')){
        res.status(401).json({msg : 'Not Authorized'})
    }
    const code = decode.split(' ')[1]

    try {
        const decoded = jwt.verify(code,process.env.jwt_key)
        const {name} = decoded
        req.user = {name}
        next()
        
    } catch (error) {
        res.status(401).json({msg : 'Bad token'})
    }
}

module.exports = authmiddle