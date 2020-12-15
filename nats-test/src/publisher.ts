import { randomBytes } from 'crypto';
import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing',randomBytes(4).toString('hex'),{
    url : 'http://localhost:4222'
});

stan.on('connect',async () => {
    console.log('Publisher connected to NATS');

    const data = {
        id: '123',
        title: 'concert',
        price: 20
    };

    const publisher = new TicketCreatedPublisher(stan);

    try {    
        await publisher.publish(data);
    } catch (error) {
        console.log(error);
    }
});
