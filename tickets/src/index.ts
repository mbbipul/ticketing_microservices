import mongoose from 'mongoose';

import { app } from './app';
import { OrderCancelledListner } from './events/listeners/order-cancelled-listner';
import { OrderCreatedListner } from './events/listeners/order-created-listner';
import { natasWrapper } from './nats-wrapper';

const start = async () => {
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined');
	}
	if (!process.env.NATS_CLIENT_ID) {
		throw new Error('NATS_CLIENT_ID must be defined');
	}
	if (!process.env.NATS_URL) {
		throw new Error('NATS_URL must be defined');
	}
	if (!process.env.NATS_CLUSTER_ID) {
		throw new Error('NATS_CLUSTER_ID must be defined');
	}

	try {
		await natasWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URL
		);
		natasWrapper.client.on('close', () => {
			console.log('Nats Connection closed!');
			process.exit();
		});
		process.on('SIGINT', () => natasWrapper.client.close());
		process.on('SIGTERM', () => natasWrapper.client.close());
		
		new OrderCreatedListner(natasWrapper.client).listen();
		new OrderCancelledListner(natasWrapper.client).listen();
		
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
			console.log('Connected to MongoDb');
	} catch (err) {
			console.error(err);
	}

	app.listen(3000, () => {
		console.log('Listening on port 3000!!!!!!!!');
	});
};

start();
