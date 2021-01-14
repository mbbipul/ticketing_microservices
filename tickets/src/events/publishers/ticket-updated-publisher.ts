import { Publisher, Subjects, TicketUpdated } from '@bb_dev/ticketing_common_service';

export class TicketUpdatedPublisher extends Publisher<TicketUpdated> {
    readonly subject = Subjects.TicketUpdated;
}