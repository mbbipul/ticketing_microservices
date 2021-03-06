import request from 'supertest';
import { app } from '../../app';
import { natasWrapper } from '../../nats-wrapper';
import mongoose, { mongo } from 'mongoose';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the provided id does not exist', async () => {
    await request(app)
        .put('/api/tickets/'+global.generateId())
        .set('Cookie',global.signin())
        .send({
            title : 'concert',
            price : 20
        })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    await request(app)
    .put('/api/tickets/'+global.generateId())
    .send({
        title : 'concert',
        price : 20
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title: "concert",
            price : 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',global.signin())
        .send({
            title : "ghhgf",
            price: 30
        })
        .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: "concert",
            price : 20
        });
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title : "",
            price : 20
        })
        .expect(400);
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            price : 20
        })
        .expect(400);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title : "gggddg",
            price : -20
        })
        .expect(400);
});

it('updates the ticket provided valid inputs' , async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: "concert",
            price : 20
        });
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title : "concert 2",
            price : 100
        })
        .expect(200);
    
    const tikcetResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(tikcetResponse.body.title).toEqual("concert 2");
    expect(tikcetResponse.body.price).toEqual(100);
});

it('publishes an event', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: "concert",
            price : 20
        });
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title : "concert 2",
            price : 100
        })
        .expect(200);
    
      expect(natasWrapper.client.publish).toBeCalled()
  });

  it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: "concert",
            price : 20
        });
    
    const ticket =await Ticket.findById(response.body.id);
    ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title : "concert 2",
            price : 100
        })
        .expect(400);
  });