import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('return error if an user fetch another user orders', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price : 20
    });
    await ticket.save();

    const user = global.signin();
    const { body: order } = await request(app)
            .post('/api/orders')
            .set('Cookie',user)
            .send({
                ticketId: ticket.id
            })
            .expect(201);

    await request(app)
            .get('/api/orders/'+order.id)
            .set('Cookie',global.signin())
            .send()
            .expect(401);
});

it('fetches the order', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price : 20
    });
    await ticket.save();

    const user = global.signin();
    const { body: order } = await request(app)
            .post('/api/orders')
            .set('Cookie',user)
            .send({
                ticketId: ticket.id
            })
            .expect(201);

    const {body: fetchOrder} = await request(app)
            .get('/api/orders/'+order.id)
            .set('Cookie',user)
            .send()
            .expect(200);
    
    expect(fetchOrder.id).toEqual(order.id);
});