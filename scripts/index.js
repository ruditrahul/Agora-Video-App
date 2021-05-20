

// /**
//  * @name handleFail
//  * @param err - error thrown by any function
//  * @description Helper function to handle errors
//  */
 let handleFail = function(err){
    console.log("Error : ", err);
};

// // Queries the container in which the remote feeds belong
// let remoteContainer= document.getElementById("remote-container");
// let canvasContainer =document.getElementById("canvas-container");
// /**
//  * @name addVideoStream
//  * @param streamId
//  * @description Helper function to add the video stream to "remote-container"
//  */
function addVideoStream(streamId){
    let streamDiv=document.createElement("div"); // Create a new div for every stream
    streamDiv.id=streamId;                       // Assigning id to div
    streamDiv.style.transform="rotateY(180deg)"; // Takes care of lateral inversion (mirror image)
    remoteContainer.appendChild(streamDiv);      // Add new div to container
    console.log(streamId);
}
// /**
//  * @name removeVideoStream
//  * @param evt - Remove event
//  * @description Helper function to remove the video stream from "remote-container"
//  */
// function removeVideoStream (evt) {
//     let stream = evt.stream;
//     stream.stop();
//     let remDiv=document.getElementById(stream.getId());
//     remDiv.parentNode.removeChild(remDiv);
//     console.log("Remote stream is removed " + stream.getId());
// }

// function addCanvas(streamId){
//     let canvas=document.createElement("canvas");
//     canvas.id='canvas'+streamId;
//     canvasContainer.appendChild(canvas);
//     let ctx = canvas.getContext('2d');
//     let video=document.getElementById(`video${streamId}`);

//     video.addEventListener('loadedmetadata', function() {
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//     });

//     video.addEventListener('play', function() {
//         var $this = this; //cache
//         (function loop() {
//             if (!$this.paused && !$this.ended) {
//                 ctx.drawImage($this, 0, 0);
//                 setTimeout(loop, 1000 / 30); // drawing at 30fps
//             }
//         })();
//     }, 0);
// }

// // Client Setup
// // Defines a client for RTC
// let client = AgoraRTC.createClient({
//     mode: 'rtc',
//     codec: "h264"
// });

// // Client Setup
// // Defines a client for Real Time Communication
// client.init("7e36988e319c468ba323d78912c2b5ac",() => console.log("AgoraRTC client initialized") ,handleFail);

// // The client joins the channel
// client.join(null,"any-channel",null, (uid)=>{

//     // Stream object associated with your web cam is initialized
    // let localStream = AgoraRTC.createStream({
    //     streamID: uid,
    //     audio: true,
    //     video: true,
    //     screen: false
    // });

//     // Associates the stream to the client
//     localStream.init(function() {

//         //Plays the localVideo
//         localStream.play('me');

//         //Publishes the stream to the channel
//         client.publish(localStream, handleFail);

//     },handleFail);

// },handleFail);
// //When a stream is added to a channel
// client.on('stream-added', function (evt) {
//     client.subscribe(evt.stream, handleFail);
// });
// //When you subscribe to a stream
// client.on('stream-subscribed', function (evt) {
//     let stream = evt.stream;
//     console.log(stream.getId());
//     addVideoStream(stream.getId());
//     stream.play(stream.getId());
//     addCanvas(stream.getId());
// });
// //When a person is removed from the stream
// client.on('stream-removed',removeVideoStream);
// client.on('peer-leave',removeVideoStream);



var rtc={
    client:null,
    localAudioTrack:null,
    localVideoTrack:null
}

var options={
    appId:"7e36988e319c468ba323d78912c2b5ac",
    channel:"test",
    token:null
}

async function startBasicCall()
{
    rtc.client=AgoraRTC.createClient({mode:"rtc",codec:"vp8"});
    const uid = rtc.client.join(options.appId, options.channel, options.token, null);
    console.log(uid);

    // Create an audio track from the audio sampled by a microphone.
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
// Create a video track from the video captured by a camera.
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    console.log(rtc.localVideoTrack);

// Publish the local audio and video tracks to the channel.
    console.log(rtc);





    rtc.client.on("stream-subscribed", async (user, mediaType) => {
        // Subscribe to a remote user.
        await rtc.client.subscribe(user, mediaType);
        console.log("subscribe success");
      
        // If the subscribed track is video.
        if (mediaType === "video") {
          // Get `RemoteVideoTrack` in the `user` object.
          const remoteVideoTrack = user.videoTrack;
          // Dynamically create a container in the form of a DIV element for playing the remote video track.
          const playerContainer = document.createElement("div");
          // Specify the ID of the DIV container. You can use the `uid` of the remote user.
          playerContainer.id = user.uid.toString();
          playerContainer.style.width = "640px";
          playerContainer.style.height = "480px";
          document.body.append(playerContainer);
      
          // Play the remote video track.
          // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
          remoteVideoTrack.play(playerContainer);
      
          // Or just pass the ID of the DIV container.
          // remoteVideoTrack.play(playerContainer.id);
        }
      
        // If the subscribed track is audio.
        if (mediaType === "audio") {
          // Get `RemoteAudioTrack` in the `user` object.
          const remoteAudioTrack = user.audioTrack;
          // Play the audio track. No need to pass any DOM element.
          remoteAudioTrack.play();
        }
      });

      rtc.client.on("user-unpublished", user => {
        // Get the dynamically created DIV container.
        const playerContainer = document.getElementById(user.uid);
        // Destroy the container.
        playerContainer.remove();
      });

      async function leaveCall() {
        // Destroy the local audio and video tracks.
        rtc.localAudioTrack.close();
        rtc.localVideoTrack.close();
      
        // Traverse all remote users.
        rtc.client.remoteUsers.forEach(user => {
          // Destroy the dynamically created DIV container.
          const playerContainer = document.getElementById(user.uid);
          playerContainer && playerContainer.remove();
        });
      
        // Leave the channel.
        await rtc.client.leave();
      }

    console.log("publish success!");
}

startBasicCall();