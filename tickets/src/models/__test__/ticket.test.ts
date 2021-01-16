import { Ticket } from "../ticket"

it('implements optimistics concurrency control', async (done) => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 23,
        userId: '122'
    });

    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance!.set({ Price: 10});
    secondInstance!.set({ Price: 15});

    await firstInstance!.save();

    try {
        await secondInstance!.save();
    } catch (error) {
        return done()
    }

    throw new Error('Should not reach this point');

});

it('can update version on multiple save', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 23,
        userId: '122'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});
