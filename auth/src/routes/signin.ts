import express , { Request , Response } from 'express';
import { body  } from 'express-validator';
import jwt from 'jsonwebtoken';

import { BadRequestError } from '../errors/bad-request-error';
import { ValidateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();


router.post('/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),

        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password')
    ],
    ValidateRequest,
    async (req : Request, res : Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser){
            throw new BadRequestError('Invalid credentials');
        }

        const isPasswordMatch = await Password.compare(
            existingUser.password,
            password
        );

        if (!isPasswordMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        //generate jwt
        const userJwt = jwt.sign({
            id : existingUser.id,
            email : existingUser.email
        },process.env.JWT_KEY!);

        //store it on session object

        req.session = {
            jwt : userJwt
        };

        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };