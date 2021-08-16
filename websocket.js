

window.onload = function () {
    console.log('onload~~')
    // Create WebSocket connection.
    const socket = new WebSocket('ws://127.0.0.1:5000');
    // const socket = new WebSocket('wss://127.0.0.1:18653/');

    // Connection opened
    socket.addEventListener('open', function (event) {
        console.log('open~~')
        socket.send(JSON.stringify({
            "cmd": "getPrinters",
            "requestID": "123458976",
            "version": "1.0"
        }))
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
        console.log('Message from server ', event.data);
    });

    // Listen for messages
    socket.addEventListener('error', function (error) {
        console.log('Message error ', error);
    });
}