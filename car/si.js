const conn = new WebSocket('ws://192.168.16.227:8040/ws')

//const image = new WebSocket('ws://192.168.16.50:3000');
//var conn = new WebSocket('ws://127.0.0.1:55611/ws')
let carId = "7";

let roomId = "10";


const localVideo = document.getElementById('local');
const localVideo2 = document.getElementById('local2');
const localVideo3 = document.getElementById('local3');
const selectBtn = document.getElementById('selectPort');
selectBtn.addEventListener("click", () => {
    connect();
})
const deviceIds = [];

const streams = new MediaStream();

const rightDeviceId = "cfda1553a273e3abab98ac3458d5251bbdb79fd45fb2a4a707ec80dcad33f306"; //오른쪽
const leftDeviceId = "016edb4720dac0eaa09b5a4a5bfa1081afc939af2a8d96ee0146d7e24f49b094"; //노트북 왼쪽 위 허브 3번째
const frontDeviceId = "a4917213856dc0fe7d5bbc63cb021d39842923ebcf0478fb74b7eccbf7782341";

navigator.mediaDevices.enumerateDevices().then(device => {
    device.filter(atomDe => atomDe.kind === 'videoinput').forEach(de => deviceIds.push(de))
    console.log(deviceIds)
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
            deviceId: frontDeviceId
        }
    })
    .then(stream => {
        localVideo.srcObject = stream;
        const videoTrack = stream.getVideoTracks()[0];
        streams.addTrack(videoTrack, stream);
        peerConnection.addTrack(videoTrack, stream)
        console.log("frontCamera set completed")
    })
    .catch(err => console.log(err));

    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
            deviceId: leftDeviceId
        }
    })
    .then(stream => {
        localVideo2.srcObject = stream;
        const videoTrack = stream.getVideoTracks()[0];
        streams.addTrack(videoTrack, stream);
        peerConnection.addTrack(videoTrack, stream)
        console.log("leftCarmera set completed")
    })
    .catch(err => console.log(err));

    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
            deviceId: rightDeviceId
        }
    })
    .then(stream => {
        localVideo3.srcObject = stream;
        const videoTrack = stream.getVideoTracks()[0];
        streams.addTrack(videoTrack, stream);
        peerConnection.addTrack(videoTrack, stream)
        console.log("rightCamera set completed")
    })
    .catch(err => console.log(err));
    
})

let myOffer;

function send(message) {
	console.log('send : ' + JSON.stringify(message));
	conn.send(JSON.stringify(message));
}

const configuration = {
    "iceServers" : [ {
        "url" : "stun:stun.l.google.com:19302"
    } ]
};

const peerConnection = new RTCPeerConnection(configuration);
console.log('RTCPeerConnection 객체 생성');

var dataChannel;

function initialize() {
    
    peerConnection.onicecandidate = function(event) {

        
        console.log('candidate 수신함')
        console.log(event.candidate)

        if (event.candidate) {
            console.log('candidate 전송함')

            const candidateData = {
                "from": carId,
                "type": "ice_car",
                "data": null,
                "candidate": event.candidate,
                "sdp": null
            }

            send(candidateData);
        }

        else {
            console.log('candidate 수집 완료되었습니다')
        }
    };
	console.log('Candidate 콜백 등록')

    dataChannel = peerConnection.createDataChannel("dataChannel", {
        reliable : true
    });
    console.log('Data Channel', dataChannel);
    //binaryTipe
    //dataChannel.binaryType = "blob";

    /**
     * 데이터 채널의 다양한 이벤트에 대한 리스너
     */
    dataChannel.onerror = function(error) {
        console.log("Error occured on datachannel:", error);
    };

    dataChannel.onclose = function() {
        console.log("data channel is closed");
    };

    dataChannel.onopen = () => {
        console.log("dataChannel open");
    }

    dataChannel.addEventListener("open", event => {
        console.log(event);
    })

    /**
     * 다른 피어에서 메시지를 수신하기 위해 onmessage 이벤트에 대한 리스너를 생성
     */
    // when we receive a message from the other peer, printing it on the console
    dataChannel.onmessage = function(event) {
        console.log("message:", event.data);
        writeLoop(event.data);
    };

    

    /**
     * 데이터 채널에서 메시지를 수신하기위해 peerConnection 객체 에 콜백을 추가
     */
    peerConnection.ondatachannel = function (event) {
        dataChannel = event.channel;
    };
	console.log('Data Channel 콜백 등록')
    

    /**
     * WebRTC WebRTC peerconnection object에 스트림을 추가
     * peerconnection에 스트림을 추가하면 연결된 피어 에서 addstream 이벤트가 트리거
     */

    /**
     * remote peer 에서 listener를 통해 스트림을 수신
     * 해당 스트림은  HTML 비디오 요소로 설정
     */
    // peerConnection.onaddstream = function(event) {
    //     videoElement.srcObject = event.stream;
    // };

}



/*image.addEventListener('message', (event) => {
    const frame  = event.data;
    console.log(event)
    console.log(event.data)
    var blob = new Blob([frame], {type: 'image/jpeg'});
    console.log('blob: ', blob)
    //console.log(JSON.stringify(blob))
    //const reader = new FileReader();    
    //console.log(reader.readAsArrayBuffer(blob))
    //dataChannel.binaryType = 'blob'
    //dataChannel.send(JSON.stringify(blob))
    //dataChannel.send(blob.arrayBuffer())
    //dataChannel.send(reader.readAsBinaryString(blob))
    console.log(blob.stream())
    console.log(blob.arrayBuffer())
    //console.log(blob.text())
    //dataChannel.send(blob)
})*/


//이 위로 건들거 없음.

function createOffer() {

	console.log('create offer 호출')

    peerConnection.createOffer(function(offer) {
		
        console.log('나의 OFFER 생성하였음 : ' + offer)
        peerConnection.setLocalDescription(offer);
        myOffer = offer;

        console.log('myOffer', offer)

        const offerData = {
            "from": carId,
            "type": "offer",
            "data": "",
            "candidate": null,
            "sdp": offer
        }

        console.log('3. OFFER 전달')
        send(offerData);
        console.log('OFFER 전달 완료')

    }, function(error) {
        alert("Error creating an offer");
    });

    // then 쓰는거로 바꾸자
}

function sendWait() {

	const waitData = {
		"from": carId,
		"type": "wait",
		"data": null,
		"candidate": null,
		"sdp": null
	}

	console.log('1. WAIT 전달')
	send(waitData);//1. wait

}

function sendOffer() {

    // console.log('candidate 수집 대기 시작')
    // while(isCollectFinished == false);  
    // candidate 수신이 완료될 때 까지 대기
    // console.log('candidate 수집 완료')

    console.log('myOffer', myOffer)

    const offerData = {
        "from": carId,
        "type": "offer",
        "data": "",
        "candidate": null,
        "sdp": myOffer
    }

    console.log('3. OFFER 전달')
    send(offerData);
    console.log('OFFER 전달 완료')
}

conn.onopen = () => {

    console.log('Car Browser')
	initialize();
    sendWait();
}

function receiveAnswer(answer) {

    const answer_sdp = JSON.parse(answer).sdp;
    console.log('remote description 저장', answer_sdp);
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer_sdp));
    /*image.onmessage = byteArray => {
        console.log(byteArray.data);
        dataChannel.send(byteArray.data);// 안 됨
    }*/
}

function addCandidate(message) {

    const candidate = JSON.parse(message).candidate;

    peerConnection.addIceCandidate(
        new RTCIceCandidate(candidate)
    );
    console.log('candidate 추가완료', candidate);

    showPeerConnection();

}

function showPeerConnection() {
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    console.log('PeerConnectino', peerConnection);
    console.log('iceGatheringState : ', peerConnection.iceGatheringState);
    console.log('local sdp : ', peerConnection.localDescription);
    console.log('remote sdp : ', peerConnection.remoteDescription);
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
}




conn.onmessage = (message) => {
	console.log('===============MESSAGE HANDLE==============')

	const msg = JSON.stringify(message.data)
	const type = JSON.parse(message.data).type;

	console.log('TYPE : ' + type)
	console.log('MSG : ' + msg)

	switch(type) {
		case "join":
			console.log('2. JOIN MESSAGE 수신')
			
            createOffer();

			console.log('JOIN MESSAGE 핸들 완료')
			break;
		
		case "answer":
			console.log('4. ANSWER 수신')
            receiveAnswer(message.data);
			console.log('ANSWER 핸들링 완료')
            //peerConnection.addStream(streams);
			break;

		case "sessionConnected":
			console.log('Session Established')
			break;

        case "ice_client":
            console.log('client candidate 수신함')
            addCandidate(message.data);
            break;

		default:
			// TODO : 세션 연결 확인 출력 case 만들기
			console.log('default switch');
			break;
	}

	console.log('===========================================')
}



function openDataChannel() {
    console.log('dataChannel', dataChannel);
}

function sendMessage() {
    dataChannel.send(input.value);
    input.value = "";
}

let port;
    let reader;
    let writer;
    let inputDone;
    let outputDone;
    let inputStream;
    let outputStream;

    const selectPort = () => {
        connect();
    }
    async function connect() {
        // CODELAB: Add code to request & open port here.
        port = await navigator.serial.requestPort();
        // - Wait for the port to open.
        await port.open({ baudRate: 115200,
            //dataBits : maxBytes,
            stopBits: 1,
            parity: 'none',
            //bufferSize: maxBytes
        });

        writer = port.writable.getWriter();

    }

    var SEQ = 0;

    async function writeLoop(value) {

        let array = value.split(',');
        const arr = new Uint16Array([array[0], array[1], array[2], array[3], array[4], array[5], array[6]]);
        console.log(arr);
        await writer.write(arr);

    }