import { OrderCreatedEvent, OrderStatus } from "@bb_dev/ticketing_common_service";
import { Ticket } from "../../../models/ticket";
import { natasWrapper } from "../../../nats-wrapper"
import { OrderCreatedListner } from "../order-created-listner"
import mongoose from 'mongoose';
import { Message } from "node-nats-streaming";

const setup = async () => {
    const listener = new OrderCreatedListner(natasWrapper.client);

    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: "ghgh"
    });

    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Cretaed,
        version: 0,
        userId: 'string',
        expiresAt: 'string',
        ticket: {
            id: ticket.id!,
            price: ticket.price
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, ticket, msg };
}

it('sets the userId of the ticket', async () => {
    const { listener, data, ticket, msg } = await setup();

    await listener.onMessage(data,msg);

    const updatedTicket =  await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('ackd the mesage', async () => {
    const { listener, data, ticket, msg } = await setup();

    await listener.onMessage(data,msg);


    expect(msg.ack).toHaveBeenCalled();
});