const express = require('express'); 
const router=express.Router();
const gravatar=require('gravatar');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('config')
const {check,validationResult}=require('express-validator');
const User=require('../../models/User')
router.post('/',[
    check('name','name is empty').not().isEmpty(),
    check('email','please enter the email').isEmail(),
    check('password','please enter a password with at least 6 characters').isLength({ min: 6 }),
],

async (req,res)=> {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const{name,email,password}=req.body;
 
    
    //check if user exist
    try {
        let user= await User.findOne({email});
        if(user){
            res.status(400).json({errors:[{msg:'user already exist'}]});
        }

    //get user gravatar 
    const avatar=gravatar.url(email,{
        s:'200',
        r:'pg',
        d:'mm'
    })
    user=new User({
        name,email,avatar,password
    });
    const salt=await bcrypt.genSalt(10);
    user.password= await bcrypt.hash(password, salt);
    await user.save();
    //return Jsonwebtoken
    const payload={
        user:{
            id:user.id
        }
    };
    jwt.sign(payload,config.get('jwtSecret'),
    { expiresIn:360000},
    (error,token)=>{
        if(error) throw error;
        res.json({token});
    }
    ); 

    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');    
    }
    

 } );

module.exports=router;