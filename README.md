# RemoteDrivingClient

------------------------------------------------------------------------------------
적용된 기술

1. webRTC
2. webSerial
3. WebSocket(for signalling)
4. react 17.0.2
5. react-router-dom
6. axios

-------------------------- 프로젝트하며 배운 내용 정리 --------------------------------
WebRTC
Real Time Communication<br />
웹/앱에서 별다른 소프트웨어 없이 카메라, 마이크 등을 사용하여 <strong>실시간으로 상호작용</strong>하는 기술.(P2P)
JavaScript 기본 API

WebSerial
웹/앱에서 별다른 소프트웨어 없이 <strong>포트연결된 임베디드 장치로 부터 데이터를 송/수신</strong>할 수 있도록 하는 기술.
JavaScript 기본 API

WebSocket
Web에서 Socket연결을 지원하는 API
UDP통신
JavaScript 기본 API

<hr />
--------------------------WebRTC 과정---------------------------------

우선 두 웹 페이지를 RTC 연결하기 위해서는 몇 가지 작업이 필요하다.
<br />
1. 두 피어(웹 페이지)에서 서로 연결을 하기 위해 SDP, iceCandidiate등의 정보가 필요하다. (간단히 표현하면 "나랑 연결하려면 요기로 들어오면 돼!"에 해당하는 정보)
<br /><br />
2. 1.을 위해 상대 웹에 내 정보를 송신해야 함. 하지만, <strong>연결되지 않은 두 피어에서 정보를 송/수신하는 것을 불가능</strong>함.
<br /><br />
3. 그래서 <strong>내 정보를 전달해줄 서버가 필요</strong>함. 이를 <strong>시그널링 서버</strong>라고 함.
<br /><br />
4. 먼저 각 웹에서 기구축된 시그널링 서버와 <strong>WebSocket</strong>을 통해 연결함.
<br /><br />
5. 한쪽 웹에서 먼저 <strong>규약된 데이터를 송신</strong>하면 시그널링 서버는 이를 <strong>다른 소켓으로 전달</strong>해주는 역할을 함.
<br /><br />
6. 각각의 웹에서 연결을 위한 RTCPeerConnection 객체에 addIceCandidate(candidate), addRemoteDescription(sdp), addLocalDescription(sdp)등의 코드를 사용하여 송수신된 서로의 데이터를 넣음.
<br /><br />
7. 모든 연결이 완료되고 나면 RTCPeerConnection 객체의 dataChannel 객체가 <strong>connected</strong> 상태로 변하며 두 피어간에 데이터를 송수신할 수 있는 상태로 변경
<br /><br />
----------------------시그널링 과정 끝---------------------------
<br />
<hr />
------------------------비디오 데이터 송수신 -----------------------
<br />
1. 비디오 데이터를 송신하는 측에서 <strong>navigator.mediaDevices.getUserDevices(constraints)</strong>를 이용하여 캠 혹은 마이크를 선택함.<br /><br />
2. 위 코드의 결과는 <strong>MediaStream 객체</strong>이며, MediaStream객체의 <strong>.getTracks()</strong> 함수를 이용하여 비디오 혹은 오디오 트랙(MediaStreamTrack 객체 리턴)을 추출한다.<br /><br />
3. peerConnection 객체의 <strong>addTrack(MediaStreamTrack, ...MediaStream)</strong>함수를 이용하면 연결된 상대방 peerConnection 객체의 ontrack 함수를 호출한다. addStream 함수는 deprecated annotation으로 지정되어 있어 미사용 권장<br /><br />
4. 수신받은 측에서는 ontrack 함수에 바인딩된 parameter를 이용하여 [parameter].stream을 이용하여 MediaStream[]을 추출하여 자신의 비디오 tag에 넣어준다.<br /><br />
5. video1.srcObject = event.stream[0]의 이용한다.<br />

-------------- 스트리밍 과정 끝 ---------------------
<hr />

------------- webSerial 사용 과정---------------

1. navigator객체에서 getUserDevices.requestPort() 함수를 이용하여 port와 연결한다.<br /><br />
2. 데이터를 반복하여 read하는 readloop() 함수를 구성한다. 이때 받는 데이터는 {value, done}으로 오게 된다.<br /><br />
3. 실제 받은 데이터는 value에 오기 때문에 value를 열어보는 일이 많다.<br /><br />
4. 이때 데이터는 PipeLine을 타고 오게된다. PipeLine에 StreamConverterPipe 등을 만들어서 넣어주게 되면 받은 데이터를 알아서 parsing해서 받는 것이 가능하다.<br /><br />

-------------- SerialPort로 데이터 읽기 끝 ---------------
<hr />


----------------- 프로젝트 하면서 알게 된 사실 ---------------------
1. axios와 fetch의 



