const aiService = require('../utils/ai.service')



module.exports.getReview = async  (req , res) => {
    const {input} = req.body ;

    if(!input){
        return res.status(400).send('input is required') ;
    }

    const response = await aiService(input) ;


    res.send(response)


}