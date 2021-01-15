import { OrderCancelledEvent, Publisher, Subjects } from "@bb_dev/ticketing_common_service";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}