import path from 'path';
import process from 'process';
import cors from 'cors';
import Enqueue from 'express-enqueue';
import compression from 'compression';
import * as dotenv from 'dotenv';
import express from 'express';
import { createVerifiedFetch } from '@helia/verified-fetch'
import { httpGateway } from './node/helia-http-gateway.js';
import {getCustomHelia} from "./node/get-custom-helia.js";
import {contentTypeParser} from "./node/content-type-parser.js";

const helia = await getCustomHelia()
const fetch = await createVerifiedFetch(helia, { contentTypeParser })
const log = helia.logger.forComponent('index')

let __dirname = process.cwd();
dotenv.config();

export const modules = async (app) => {
    const routes = await httpGateway({
        helia,
        fetch
    })
    console.log('ROUTES: ', routes)
    console.log('__dirname', __dirname);

    let whitelist = ["*"]

    let corsOptions = {
        origin: function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1 || whitelist.includes('*')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    };

    app.use(compression());
    app.use(express.json());

    const queue = new Enqueue({
        concurrentWorkers: 4,
        maxSize: 200,
        timeout: 30000
    });

    app.use(await cors({ credentials: true }));
    app.use(queue.getMiddleware());

    app.use((req, res, next) => {
        console.log(`gateway: ${req.method}: ${req.path}`);
        next();
    });

    app.get(`/env.json`, async (req, res) => {
        res.status(200).sendFile(path.join(__dirname, 'env.json'))
    })

    app.get(`/env.mjs`, async (req, res) => {
        res.status(200).sendFile(path.join(__dirname, 'env.mjs'))
    })

    app.get(`/:ns/:address`, async (req, res) => {
        const proxyHost = req.headers["x-forwarded-host"];
        console.log('----------', req)
        console.log('----------', req.header('Host'))
        console.log('----------', req.headers.host)
        console.log('-- 1 --------', req.host)
        // res.status(200).sendFile(path.join(__dirname, '/docs/index.html'));
        await routes[0].handler(req, res)
    });

    app.get(`/:ns/:address/*`, async (req, res) => {
        console.log('-- 2 --------', req)
        console.log('-- 2 --------', req.host)
        // res.status(200).sendFile(path.join(__dirname, '/docs/index.html'));
        await routes[1].handler(req, res)
    });

    app.get(`/`, async (req, res) => {
        await routes[3].handler(req, res)

        // res.status(200).sendFile(path.join(__dirname, '/docs/index.html'));
    });

    app.get(`/*`, async (req, res) => {
        await routes[2].handler(req, res)
        // res.status(200).sendFile(path.join(__dirname, '/docs/index.html'));
    });

    app.use(express.static(`${__dirname}/docs`));

    app.post(`/*`, async (req, res) => {
        console.log('==== POST ====', req.path);
    });

    app.put(`/*`, async (req, res) => {
        console.log('==== PUT ====', req.path);
    });

    app.delete(`/*`, async (req, res) => {
        console.log('==== DELETE ====', req.path);
    });

    app.use(queue.getErrorMiddleware());

    return app
}

export default {
    description: 'server welcomebook'
};