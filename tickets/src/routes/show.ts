import { NotFoundError } from '@bb_dev/ticketing_common_service';
import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id',async (req : Request,res : Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if(!ticket) {
        throw new NotFoundError();
    }

    res.send(ticket);
});

export { router as ShowTicketRouter};