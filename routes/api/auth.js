const express = require('express'); 
const router=express.Router();
const auth=require('../../middlewares/auth');
const User=require('../../models/User');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('config')
const {check,validationResult}=require('express-validator');

router.get('/',auth,async(req,res)=>
{
    try {
        const user =await User.findById(req.user.id).select('-password');
        res.json(user);
        
    } catch (error) {
        
        console.error(error.message);
        res.status(500).send('server error')
    }
}
);

router.post('/',[
    check('email','please enter the email').isEmail(),

    check('password','password is required').exists(),
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
        if(!user){
            res.status(400).json({errors:[{msg:'invalid credentials'}]});
        }

//check if the password match that user
      const isMatch=await bcrypt.compare(password,user.password);
      if(!isMatch){
        res.status(400).json({errors:[{msg:'invalid credentials'}]});

      }

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