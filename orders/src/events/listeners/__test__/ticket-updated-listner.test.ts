import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from 'mongoose';
import { TicketUpdated } from "@bb_dev/ticketing_common_service";
import { Message } from "node-nats-streaming";

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 12
    });
    await ticket.save();

    const data: TicketUpdated['data'] = {
        id: ticket.id!,
        version: ticket.version + 1,
        title: 'new concert',
        price: 99,
        userId: "dshjgfhgsdf"
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { msg, data, ticket, listener} ;

}

it('finds, updates, and saves a ticket', async () => {
   const { msg, data, ticket, listener} = await setup();

   await listener.onMessage(data, msg);

   const updatedTicket = await Ticket.findById(ticket.id);

   expect(updatedTicket!.title).toEqual(data.title);
   expect(updatedTicket!.price).toEqual(data.price);
   expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message' , async () => {
    const { msg, data, ticket, listener} = await setup();

    await listener.onMessage(data,msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
    const { msg, data, ticket, listener} = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data,msg);
    } catch (error) {
        
    }
    
    expect(msg.ack).not.toHaveBeenCalled();
});