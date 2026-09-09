const IPV4_REGEX = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;

function maskIPv4(ip) {
    const parts = ip.split('.');

    return `${parts[0]}.${parts[1]}.***.***`;
}

function detectIPv4(input) {
    const matches = [];

    let match;

    while ((match = IPV4_REGEX.exec(input)) !== null) {
        if (match[0].startsWith('192.0.2.')) {
            continue;
        }

        matches.push({
            type: 'ipv4',
            severity: 'medium',
            value: match[0],
            preview: maskIPv4(match[0]),
            index: match.index
        });
    }

    return matches;
}

module.exports = detectIPv4;
