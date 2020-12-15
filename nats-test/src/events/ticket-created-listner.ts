import { Message } from "node-nats-streaming";
import { Listner } from "./base-listner";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedListener extends Listner<TicketCreatedEvent> {
    readonly  subject = Subjects.TicketCreated;
    queueGroupName = 'payments-service';

    onMessage(data : TicketCreatedEvent['data'], msg : Message){
        console.log('Event Data: ', data.title);
        
        msg.ack();
    }
}