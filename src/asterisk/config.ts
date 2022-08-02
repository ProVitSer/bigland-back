export const ARIOUTBOUNDCALLOPERATOR = 'Monitoring';

export const ARIOUTBOUNDCALL = {
    context: 'channel-dump',
    priority: 1,
    extension: '2222',
    appArgs: 'dialed',
}

export const AMIOUTBOUNDCALL = {
    context: 'from-internal',
    async: 'yes',
    priority:'1',
    timeout:'50000',
}