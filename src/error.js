
export function handleError(reason, request){
    return {
        message: reason,
        request
    }
}