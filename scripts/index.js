// Handle errors.
let handleError = function (err) {
  console.log("Error: ", err);
};

// Query the container to which the remote stream belong.
let remoteContainer = document.getElementById("remote-container");

// Add video streams to the container.
function addVideoStream(elementId) {
  // Creates a new div for every stream
  let streamDiv = document.createElement("div");
  // Assigns the elementId to the div.
  streamDiv.id = elementId;
  //   streamDiv.classList = "col-lg-6";
  // Takes care of the lateral inversion
  streamDiv.style.transform = "rotateY(180deg)";

  const delbtn = streamDiv.createElement("button");
  delbtn.innerHTML = '<i class="fas fa-trash"></i>';
  // Adds the div to the container.
  remoteContainer.appendChild(streamDiv);
}

function removeStyleAttribute(elementId) {
  document.getElementById(`player_${elementId}`).removeAttribute("style");
  document.getElementById(`video${elementId}`).removeAttribute("style");
}

// Remove the video stream from the container.
function removeVideoStream(elementId) {
  let remoteDiv = document.getElementById(elementId);
  if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
}

let client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

client.init(
  "06feb427bbde4e47a5105694ed767962",
  function () {
    console.log("client initialized");
  },
  function (err) {
    console.log("client init failed ", err);
  }
);

// Join a channel
client.join(
  "00606feb427bbde4e47a5105694ed767962IAAHhNTRtrCTpl7F2+z7xR5TFOvXCSym8MLfEpcvth5OKEOQEggAAAAAEABpDq0k6vSoYAEAAQDq9Khg",
  "myChannel",
  null,
  (uid) => {
    // Create a local stream
    let localStream = AgoraRTC.createStream({
      audio: true,
      video: true,
    });
    // Initialize the local stream
    localStream.init(() => {
      // Play the local stream
      localStream.play("me");
      // Publish the local stream
      client.publish(localStream, handleError);
    }, handleError);

    const muteBtn = document.querySelector(".mute-btn");

    muteBtn.addEventListener("click", function () {
      console.log(localStream.audio);
      localStream.audio = !localStream.audio;
    });

    const endBtn = document.querySelector(".end-btn");

    endBtn.addEventListener("click", function () {
      console.log(localStream.video);
      localStream.video = !localStream.video;
    });
  },
  handleError
);

// Subscribe to the remote stream when it is published
client.on("stream-added", function (evt) {
  client.subscribe(evt.stream, handleError);
});
// Play the remote stream when it is subsribed
client.on("stream-subscribed", function (evt) {
  let stream = evt.stream;
  let streamId = String(stream.getId());
  addVideoStream(streamId);
  //   removeStyleAttribute(streamId);
  stream.play(streamId);
});

// Remove the corresponding view when a remote user unpublishes.
client.on("stream-removed", function (evt) {
  let stream = evt.stream;
  let streamId = String(stream.getId());
  stream.close();
  removeVideoStream(streamId);
});
// Remove the corresponding view when a remote user leaves the channel.
client.on("peer-leave", function (evt) {
  let stream = evt.stream;
  let streamId = String(stream.getId());
  stream.close();
  removeVideoStream(streamId);
});
