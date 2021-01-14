import { OrderStatus } from '@bb_dev/ticketing_common_service';
import mongoose from 'mongoose';
import { Order } from './order';

interface TicketAttrs {
    title: string,
    price: number
}

interface TicketDoc extends mongoose.Document {
    title: string,
    price: string,
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs) : TicketDoc;
}

const schema = new mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    price : {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc,ret) {
            ret.id = ret._id,
            delete ret._id
        }
    }
});

schema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

schema.methods.isReserved = async function(){
    const isOrderExist = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Cretaed,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });
    return !!isOrderExist;
}

const Ticket = mongoose.model<TicketDoc,TicketModel>('Ticket',schema);

export { Ticket , TicketDoc };