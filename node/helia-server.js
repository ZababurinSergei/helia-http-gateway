import { setMaxListeners } from 'node:events';
export function getFullUrlFromFastifyRequest(request, log) {
    let query = '';
    if (request.query != null) {
        log('request.query:', request.query);
        const pairs = [];
        Object.keys(request.query).forEach((key) => {
            const value = request.query[key];
            pairs.push(`${key}=${value}`);
        });
        if (pairs.length > 0) {
            query += '?' + pairs.join('&');
        }
    }
    return `${request.protocol}://${request.headers.host}${request.url}${query}`;
}
export function getRequestAwareSignal(request, log, options = {}) {
    const url = options.url ?? getFullUrlFromFastifyRequest(request, log)

    const opController = new AbortController()
    setMaxListeners(Infinity, opController.signal)
    const cleanupFn = () => {
      if (request.raw.readableAborted) {
        log.trace('request aborted by client for url "%s"', url)
      } else if (request.raw.destroyed) {
        log.trace('request destroyed for url "%s"', url)
      } else if (request.raw.complete) {
        log.trace('request closed or ended in completed state for url "%s"', url)
      } else {
        log.trace('request closed or ended gracefully for url "%s"', url)
      }

      // we want to stop all further processing because the request is closed
      opController.abort()
    }

    /**
     * The 'close' event is emitted when the stream and any of its underlying resources (a file descriptor, for example) have been closed. The event indicates that no more events will be emitted, and no further computation will occur.
     * A Readable stream will always emit the 'close' event if it is created with the emitClose option.
     *
     * @see https://nodejs.org/api/stream.html#event-close_1
     */
    request.on('close', err => cleanupFn)
    // request.raw.on('close', cleanupFn)

    if (options.timeout != null) {
      setTimeout(() => {
        log.trace('request timed out for url "%s"', url)
        opController.abort()
      }, options.timeout)
    }

    return opController.signal
}
//# sourceMappingURL=helia-server.js.map