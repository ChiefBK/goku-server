
export function isValidRequest(request) {
    if (!("type" in request)) {
        return false;
    }

    if (!("model" in request)) {
        return false;
    }

    if (!(("payload" in request || "query" in request) && !("payload" in request && "query" in request))) { // If not XOR (i.e. payload or query keys must be in request but not both)
        return false;
    }

    return true;
}

export function isValidAction(action) {
    if (!("type" in request)) {
        return false;
    }

    if (!("model" in request)) {
        return false;
    }

    if (!(("payload" in request || "query" in request) && !("payload" in request && "query" in request))) { // If not XOR (i.e. payload or query keys must be in request but not both)
        return false;
    }

    return true;
}