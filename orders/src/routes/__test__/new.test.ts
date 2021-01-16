import { OrderStatus } from '@bb_dev/ticketing_common_service';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/orders for post requests', async () => {
  const response = await request(app).post('/api/orders').send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/orders').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid ticketId is provided', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: 'hbjhjh',
    })
    .expect(400);

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      
    })
    .expect(400);
});

it('returns an error if the ticket does not exist', async () => {
    await request(app)
            .post('/api/orders')
            .set('Cookie', global.signin())
            .send({
                ticketId : global.generateId()
            })
            .expect(404);
});

it('returns an error if the ticket already reserved', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const order = Order.build({
        ticket,
        userId: 'hggghgghgggg',
        status: OrderStatus.Cretaed,
        expiresAt: new Date()
    });
    await order.save();

    await request(app)
            .post('/api/orders')
            .set('Cookie',global.signin())
            .send({
                ticketId: ticket.id
            })
            .expect(400);
});

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const res = await request(app)
    .post('/api/orders')
    .set('Cookie',global.signin())
    .send({
        ticketId: ticket.id
    })
    .expect(201);

    expect(res.body.ticket.id).toEqual(ticket.id);
});

it('emits an order created event', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20
	});
	await ticket.save();

	const res = await request(app)
	.post('/api/orders')
	.set('Cookie',global.signin())
	.send({
		ticketId: ticket.id
	})
	.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

});