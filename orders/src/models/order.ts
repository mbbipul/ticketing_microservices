import mongoose from 'mongoose';
import { OrderStatus } from '@bb_dev/ticketing_common_service';
import { TicketDoc } from './ticket';
import { verify } from 'jsonwebtoken';
import { version } from 'node-nats-streaming';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}


interface OrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs : OrderAttrs) : OrderDoc
}

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Cretaed
        },
        expiresAt: {
            type: mongoose.Schema.Types.Date
        },
        ticket: {
            type: mongoose.Types.ObjectId,
            ref: "Ticket"
        }
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    }
);

orderSchema.set('versionKey','version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
