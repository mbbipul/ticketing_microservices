import express, { Request, Response } from 'express';
import { body , validationResult } from 'express-validator';
import { BadRequestError } from '../errors/bad-request-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';
import { RequestValidationError } from '../errors/request-validation-errors';
import { User } from '../models/user';
import jwt  from 'jsonwebtoken';

const router = express.Router();

router.get('/api/users/signup', (req,res) => {
    res.send('ok signup');
});
router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength({ min : 8 , max : 20})
        .withMessage('Password must be between 8 and 20 characters')
] ,
 async (req : Request , res : Response) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }
    
    const { email,password } = req.body;

    const isUserExists = await User.findOne({ email });

    if ( isUserExists ){
        throw new BadRequestError('Email already is used. Pleae try another email');
    }

    const user = User.build({ email , password});
    await user.save();

    //generate jwt
    const userJwt = jwt.sign({
        id : user.id,
        email : user.email
    },process.env.JWT_KEY!);

    //store it on session object

    req.session = {
        jwt : userJwt
    };

    res.status(201).send(user);
});

export { router as signupRouter };