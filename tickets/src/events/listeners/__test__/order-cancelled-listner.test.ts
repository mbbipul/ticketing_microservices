import { Ticket } from "../../../models/ticket";
import { natasWrapper } from "../../../nats-wrapper"
import mongoose from 'mongoose';
import { OrderCancelledEvent } from "@bb_dev/ticketing_common_service";
import { Message } from "node-nats-streaming";
import { OrderCancelledListner } from "../order-cancelled-listner";

const setup = async () => {

    const listener = new OrderCancelledListner(natasWrapper.client);

    const orderId = mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: 'dssff'
    });
    
    ticket.set({orderId});
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id!
        }
    };

    // @ts-ignore

    const msg: Message = {
        ack: jest.fn()
    }

    return { msg, data, orderId, ticket, listener };

}

it('updates the ticket , publishes an event, and acks the message', async () => {
    const { msg, data, orderId, ticket, listener } = await setup();

    await listener.onMessage(data,msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natasWrapper.client.publish).toHaveBeenCalled();
});