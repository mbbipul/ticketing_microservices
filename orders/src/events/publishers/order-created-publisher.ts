import { OrderCreatedEvent, Publisher, Subjects } from "@bb_dev/ticketing_common_service";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    
}