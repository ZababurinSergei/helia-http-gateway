'use strict'
const process = require('process');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { PeriodicExportingMetricReader, ConsoleMetricExporter, MeterProvider } = require('@opentelemetry/sdk-metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');

const init = (serviceName, environment) => {
    const options = {
        host:'localhost',
        endpoint: '/v1/traces',
        port: 9468
    };

    console.log('=== METRICS ===', {
        url: 'http://localhost:9468/v1/traces'
    })

    const exporter = new PrometheusExporter(options);

    const consoleExporter = new ConsoleSpanExporter()

    //TODO что бы убрать вывод в консоль надо убрать traceExporter: ''  ( consoleExporter )
    const sdk = new NodeSDK({
        traceExporter: '',
        metricReader: exporter,
        instrumentations: [getNodeAutoInstrumentations()]
    });

    sdk.start()
    process.on('SIGTERM', () => {
        sdk.shutdown()
            .then(() => {
                console.log('Tracing terminated')
            })
            .catch((error) => {
                console.log('Error terminating tracing', error)
            })
            .finally(() => process.exit(0));
    });
}

module.exports = {
    init: init,
}