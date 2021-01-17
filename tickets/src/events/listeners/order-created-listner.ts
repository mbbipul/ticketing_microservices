import { Listner, OrderCreatedEvent, Subjects } from "@bb_dev/ticketing_common_service";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListner extends Listner<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message ) {
        const ticket = await Ticket.findById(data.ticket.id);
        
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.set({
            orderId: data.id
        });

        await ticket.save();
        new TicketUpdatedPublisher(this.client).publish(
            {
                id: ticket.id!,
                title: ticket.title,
                price: ticket.price,
                userId: ticket.userId,
                orderId: ticket.orderId,
                version: ticket.version
            }
        );

        msg.ack();
    }

}