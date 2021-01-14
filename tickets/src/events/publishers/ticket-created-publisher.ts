import { Publisher, Subjects , TicketCreatedEvent} from '@bb_dev/ticketing_common_service';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}