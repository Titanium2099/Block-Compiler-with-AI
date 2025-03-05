import { handleRawCodeChunk } from "./codeChunkHandler.js";
import GetSVG from "./parser.js";
import helpers from "./helpers.js";
import showdown from "showdown";

const apiUrl = "http://127.0.0.1:5000";
let authToken;
const converter = new showdown.Converter();
let Gaddon;
const resistanceThreshold = 10;

var mainWorkspace;


window.addEventListener('blockError', (event) => {
  document.AI_INTEGRATION.errorsDetected.push(event.detail);
});

document.AI_INTEGRATION = { //probably the dumbest way to possibly do this, it just make debugging alot easier (will do it properly later)
  AI_currently_blabbering: false,
  currentInputHasAttachment: false,
  attachmentDetails: {
    attachmentText: "",
    attachmentBlocks: "",
  },
  CodeChunks: [],
  AllCodeChunksEverAdded: [],
  processedCodeChunks: [],
  chatHistory: [],
  popupOpen: false,
  canUse: true,
  errorsDetected: [],
  AIModels: [],
};

const originalState = {
  AI_currently_blabbering: false,
  currentInputHasAttachment: false,
  attachmentDetails: {
    attachmentText: "",
    attachmentBlocks: "",
  },
  CodeChunks: [],
  AllCodeChunksEverAdded: [],
  processedCodeChunks: [],
  chatHistory: [],
  popupOpen: false,
  canUse: true,
  errorsDetected: [],
};

Blockly.getMainWorkspace = function () { // I have to do this as the getmainworkspace gets linked to the getSVG parsing one 
  return mainWorkspace;
}

document.addEventListener("mousemove", (event) => {
  document.AI_INTEGRATION.X_COORDINATE = event.clientX;
  document.AI_INTEGRATION.Y_COORDINATE = event.clientY;
});

function createBasePopup(fileAttached = false, fileAttachedText = "Unknown - Entire Sprite", inputValue = "") {
  if (document.AI_INTEGRATION.popupOpen) {
    return;
  }
  document.AI_INTEGRATION.popupOpen = true;
  document.AI_INTEGRATION.currentInputHasAttachment = fileAttached;
  document.AI_INTEGRATION.attachmentDetails.attachmentText = fileAttached ? fileAttachedText : "";


  //create new div
  const attachedFile = fileAttached ? `<div class="attachedFile" id="attachedFile"><svg fill= none viewBox="0 0 24 24" xmlns=http://www.w3.org/2000/svg height=24 width=24 class="svg"><path d="M2 7V14.7519H4.53246L5.9122 16.0909H8.12402L9.50376 14.7519H22V7H9.50376L8.12402 8.33905H5.9122L4.53246 7H2Z" stroke-linecap= round stroke-linejoin= round stroke= currentcolor stroke-width= 2></path></svg><p class="texta">${fileAttachedText}</p><svg id="removeAttachement" fill= none viewBox="0 0 24 24" xmlns=http://www.w3.org/2000/svg stroke=currentColor stroke-width=1.5 class=svg2><path d="M6 18 18 6M6 6l12 12" stroke-linecap= round stroke-linejoin= round></path></svg></div>` : '';


  if (document.querySelector('.container') != null) { //reopen the popup
    document.querySelector('.container').style.display = '';
    document.querySelector('.container').style.zIndex = 509;
    //FINISH ADDING SUPPORT TO reopening popup
    var textareaa = document.getElementById('auto-resizing-textarea');
    //focus on textarea
    textareaa.focus();

    textareaa.value = inputValue;

    if (document.getElementById('attachedFile') != null) document.getElementById('attachedFile').remove();
    var parsedAttachFile = (new DOMParser()).parseFromString(attachedFile, "text/html");
    document.getElementById("bottomBar").appendChild(parsedAttachFile.body.children[0]);
    helpers.removeAttachmentListener();
    return;
  }
  //create new blob
  const FireAnimation = "<style>@keyframes scaleUpDown{0%,100%{transform:scaleY(1) scaleX(1)}50%,90%{transform:scaleY(1.1)}75%{transform:scaleY(.95)}80%{transform:scaleX(.95)}}@keyframes shake{0%,100%{transform:skewX(0) scale(1)}50%{transform:skewX(5deg) scale(.9)}}@keyframes particleUp{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0;top:-100%;transform:scale(.5)}}@keyframes glow{0%,100%{background-color:#ef5a00}50%{background-color:#ff7800}}.fire{width:60px;height:60px;background-color:transparent;margin-left:8px;margin-top:17px;position:relative;display:block;}.fire-center{position:absolute;height:100%;width:100%;animation:scaleUpDown 3s ease-out;animation-iteration-count:infinite;animation-fill-mode:both}.fire-center .main-fire{position:absolute;width:100%;height:100%;background-image:radial-gradient(farthest-corner at 10px 0,#d43300 0,#ef5a00 95%);transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-center .particle-fire{position:absolute;top:60%;left:45%;width:2px;height:2px;background-color:#ef5a00;border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-right{height:100%;width:100%;position:absolute;animation:shake 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-right .main-fire{position:absolute;top:15%;right:-25%;width:80%;height:80%;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-right .particle-fire{position:absolute;top:45%;left:50%;width:3.0303030303030303px;height:3.0303030303030303px;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-left{position:absolute;height:100%;width:100%;animation:shake 3s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-left .main-fire{position:absolute;top:15%;left:-20%;width:80%;height:80%;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-left .particle-fire{position:absolute;top:10%;left:20%;width:10%;height:10%;background-color:#ef5a00;border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 3s infinite ease-out 0;animation-fill-mode:both}.fire-bottom .main-fire{position:absolute;top:30%;left:20%;width:75%;height:75%;background-color:#ff7800;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 100% 40%;filter:blur(10px);animation:glow 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}</style><div class=fire><div class=fire-left><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-center><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-right><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-bottom><div class=main-fire></div></div></div>";


  if (!document.AI_INTEGRATION.canUse) {
    const div = document.createElement('div');
    div.className = 'container';
    div.id = 'torchyPopup';
    div.style.zIndex = 509;
    div.style.position = 'absolute';
    const divWidth = 452;
    const divHeight = 302;
    const viewportWidth = window.innerWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const tolerance = 10;
    let newLeft = document.AI_INTEGRATION.X_COORDINATE;
    let newTop = document.AI_INTEGRATION.Y_COORDINATE;
    if (newLeft < tolerance) newLeft = tolerance;
    if (newTop < scrollY + tolerance) newTop = scrollY + tolerance;
    if (newLeft + divWidth > viewportWidth - tolerance) newLeft = viewportWidth - divWidth - tolerance;
    if (newTop + divHeight > scrollY + viewportHeight - tolerance) newTop = scrollY + viewportHeight - divHeight - tolerance;
    div.style.left = `${newLeft}px`;
    div.style.top = `${newTop}px`;
    div.innerHTML = `<div class="content no_api_key" id="chat_content">
      <div class="a"><svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="size-6" stroke="currentColor" stroke-width="1.5" id="closePopup">
                <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
  </div><div class="b">
          <div class="c">
             ${FireAnimation}
          </div>
          <p class="d">To use Torchy, please add your API key in the addons page</p></div>
  </div>`;
    document.body.appendChild(div);
    document.getElementById('closePopup').addEventListener('click', () => {
      document.getElementById('torchyPopup').remove();
      document.AI_INTEGRATION.popupOpen = false;
    });
    return;
  }


  const div = document.createElement('div');
  div.className = 'container';
  div.style.zIndex = 509;
  div.style.position = 'absolute';

  const divWidth = 452;
  const divHeight = 302;
  const viewportWidth = window.innerWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const tolerance = 10;
  let newLeft = document.AI_INTEGRATION.X_COORDINATE;
  let newTop = document.AI_INTEGRATION.Y_COORDINATE;
  if (newLeft < tolerance) newLeft = tolerance;
  if (newTop < scrollY + tolerance) newTop = scrollY + tolerance;
  if (newLeft + divWidth > viewportWidth - tolerance) newLeft = viewportWidth - divWidth - tolerance;
  if (newTop + divHeight > scrollY + viewportHeight - tolerance) newTop = scrollY + viewportHeight - divHeight - tolerance;
  div.style.left = `${newLeft}px`;
  div.style.top = `${newTop}px`;
  div.innerHTML = `
  <div class="headerT">
  <svg id="clearChat" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
  <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="size-6" stroke="currentColor" stroke-width="1.5"  id="closePopup">
                <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
  </div>
  <div class= content id= chat_content>
      <div class=Popup_Header>
          <div class=a>
             ${FireAnimation}
          </div>
          <p class=b>Hi I'm Torchy, How can I help you today?
      </div>
  </div>
  <div class=input-container id= chat_box>
      <div class=input-parent>
          <textarea class=input-field id=auto-resizing-textarea placeholder="Ask me anything..."></textarea>
          <svg fill= none viewBox="0 0 17 17" xmlns= http:// www.w3.org/ 2000/ id=submitChat svg class= send-icon height= 17 width= 17>
              <g clip-path= url(#clip0_147_21)>
                  <path
                      d="M2.92172 9.30564L1.08789 3.34619C5.47463 4.62202 9.61134 6.63746 13.3197 9.30564C9.61155 11.9738 5.47507 13.9892 1.08856 15.2651L2.92172 9.30564ZM2.92172 9.30564H7.95788"
                      stroke-linecap= round stroke-linejoin= round stroke=#7C7766 stroke-width= 1.5></path>
              </g>
              <defs>
                  <clipPath id= clip0_147_21>
                      <rect fill= white height= 16.1157 transform="translate(0.132812 0.00830078)" width= 16.1157></rect>
                  </clipPath>
              </defs>
          </svg>
      </div>
      <div class="bottomBar" id="bottomBar">
        <div class="AI_selector">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6 svg">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z">
            </path>
          </svg>
          <select name="AI Model Selector" id="AI_Selector_select">
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6 arrow">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"></path>
          </svg>
        </div>
        ${attachedFile}
      </div>
  </div>`;

  let offsetX, offsetY, isDragging = false, startX, startY, hasMoved = false;

  div.addEventListener('mousedown', (e) => {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = e.clientX - div.offsetLeft;
    offsetY = e.clientY - div.offsetTop;
    div.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      if (!hasMoved) {
        const deltaX = Math.abs(e.clientX - startX);
        const deltaY = Math.abs(e.clientY - startY);
        if (deltaX < resistanceThreshold && deltaY < resistanceThreshold) {
          return;
        }
        hasMoved = true;
      }

      // Get viewport and scroll dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const scrollY = window.scrollY || document.documentElement.scrollTop;

      // Get div dimensions
      const divRect = div.getBoundingClientRect();
      const divWidth = divRect.width;
      const divHeight = divRect.height;

      // Define tolerance
      const tolerance = 10;

      // Calculate new position
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY + scrollY; // Adjust for scrolling

      // Prevent moving out of bounds with tolerance
      if (newLeft < tolerance) newLeft = tolerance;
      if (newTop < scrollY + tolerance) newTop = scrollY + tolerance;
      if (newLeft + divWidth > viewportWidth - tolerance) newLeft = viewportWidth - divWidth - tolerance;
      if (newTop + divHeight > scrollY + viewportHeight - tolerance) newTop = scrollY + viewportHeight - divHeight - tolerance;

      div.style.left = newLeft + 'px';
      div.style.top = newTop + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    div.style.cursor = "default";
  });

  //add to body
  document.body.appendChild(div);

  var textareaa = document.getElementById('auto-resizing-textarea');
  //focus on textarea
  textareaa.focus();

  textareaa.value = inputValue;
  if (textareaa.value.length > 64 || textareaa.value.includes('\n')) { //must be done once in the beginning due to the fact that `inputValue` might be a long string
    textareaa.style.height = 'auto';
    textareaa.style.height = `${textareaa.scrollHeight}px`;
    textareaa.style.top = '0px';
  } else {
    textareaa.style.height = '20px';
    textareaa.style.top = '2px';
  }
  textareaa.addEventListener('input', () => {
    if (textareaa.value.length > 64 || textareaa.value.includes('\n')) { //make sure there is more than one line
      textareaa.style.height = 'auto';
      textareaa.style.height = `${textareaa.scrollHeight}px`;
      textareaa.style.top = '0px';
    } else {
      textareaa.style.height = '20px';
      textareaa.style.top = '2px';
    }
  });

  popupFunctionality();
}


function popupFunctionality() {
  helpers.removeAttachmentListener();
  helpers.updateAIModels();

  document.getElementById('closePopup').addEventListener('click', () => {
    helpers.closePopup();
  });
  document.getElementById('clearChat').addEventListener('click', () => {
    //prompt user if they are sure
    if (confirm("Are you sure you want to clear the chat?")) {
      while (document.getElementById('chat_content').children.length > 1) {
        document.getElementById('chat_content').children[1].remove();
      }
      document.AI_INTEGRATION = originalState;
    }
  });
  document.getElementById('submitChat').addEventListener('click', () => {
    internal();
  });
  //add send command for enter + shift
  document.getElementById('auto-resizing-textarea').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      internal();
    }
  });

  function internal() {
    if (document.AI_INTEGRATION.AI_currently_blabbering) {
      return;
    }
    document.AI_INTEGRATION.AI_currently_blabbering = true;
    const input = document.getElementById('auto-resizing-textarea');

    if (input.value.trim() == "") {
      return;
    }
    if (document.AI_INTEGRATION.currentInputHasAttachment) {
      document.getElementById('attachedFile').remove();
      var userMessage = document.createElement('div');
      userMessage.className = 'user-message';
      var messageDiv = document.createElement('div');
      messageDiv.className = 'message';
      var textSpan = document.createElement('span');
      textSpan.textContent = input.value;
      messageDiv.appendChild(textSpan);
      var fileAttachmentDiv = document.createElement('div');
      fileAttachmentDiv.className = 'FileAttachment';
      var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgElement.setAttribute("width", "24");
      svgElement.setAttribute("height", "24");
      svgElement.setAttribute("viewBox", "0 0 24 24");
      svgElement.setAttribute("fill", "none");
      svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svgElement.classList.add("svg");
      var pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathElement.setAttribute("d", "M2 7V14.7519H4.53246L5.9122 16.0909H8.12402L9.50376 14.7519H22V7H9.50376L8.12402 8.33905H5.9122L4.53246 7H2Z");
      pathElement.setAttribute("stroke-linecap", "round");
      pathElement.setAttribute("stroke-linejoin", "round");
      pathElement.setAttribute("stroke-width", "2");
      pathElement.setAttribute("stroke", "currentcolor");
      svgElement.appendChild(pathElement);
      var attachmentText = document.createElement('p');
      attachmentText.className = 'p';
      attachmentText.textContent = document.AI_INTEGRATION.attachmentDetails.attachmentText;
      fileAttachmentDiv.appendChild(svgElement);
      fileAttachmentDiv.appendChild(attachmentText);
      messageDiv.appendChild(fileAttachmentDiv);
      userMessage.appendChild(messageDiv);      
      document.getElementById('chat_content').appendChild(userMessage);
    } else {
      var userMessage = document.createElement('div');
      userMessage.className = 'user-message';
      //userMessage.innerHTML = `
      //    <div class="message">${input.value}</div>
      //`;
      var message = document.createElement('div');
      message.className = 'message';
      message.innerText = input.value;
      userMessage.appendChild(message);
      document.getElementById('chat_content').appendChild(userMessage);
    }
    var customNames = "";
    for (var customName of vm.runtime.getEditingTarget().sprite.costumes) customNames += customName.name + ", ";
    var soundNames = "";
    for (var soundName of vm.runtime.getEditingTarget().sprite.sounds) soundNames += soundName.name + ", ";
    var allSpriteNames = vm.runtime.targets
      .filter(target => target.isSprite && target.getName() !== "Stage")
      .map(sprite => sprite.getName())
      .join(", ");
    const messageContents = input.value + (document.AI_INTEGRATION.currentInputHasAttachment ? "\nAttached Code:" + document.AI_INTEGRATION.attachmentDetails.attachmentBlocks : "") + "\n\n\nContext:\nSprite Customes: " + customNames + "\nSprite Sounds: " + soundNames + "\nAll Sprites Names: " + allSpriteNames + "\nCurrent Sprite Name:" + vm.runtime.getEditingTarget().sprite.name;
    input.value = '';
    //reset input height
    input.style.height = '20px';
    input.style.top = '2px';

    function requestChat(messageContents) {
      var loadingDots = document.createElement('div');
      loadingDots.className = 'ai-message';
      loadingDots.id = "AI_is_thinking_what_to_blabber";
      loadingDots.innerHTML = `
                <div class="message" style="width: 22px;">
                    <div class="dot-elastic"></div>
                </div>
            `;
      document.getElementById('chat_content').appendChild(loadingDots);
      //scroll to bottom
      document.getElementById('chat_content').scrollTop = document.getElementById('chat_content').scrollHeight;
      document.AI_INTEGRATION.CodeChunks = [];

      var data = {
        api_key: authToken,
        message: messageContents,
        history: document.AI_INTEGRATION.chatHistory,
        ai_model: document.getElementById('AI_Selector_select').value,
      };
      function fetchWithTimeout(url, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchPromise = fetch(url, { ...options, signal });

        // Set timeout to abort fetch
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        return fetchPromise
          .finally(() => clearTimeout(timeoutId));
      }
      fetchWithTimeout(apiUrl + "/chat", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }, 30000)
        .then(response => {
          if (response.ok) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let streamResult = '';

            //remove the loading dots
            document.getElementById('AI_is_thinking_what_to_blabber').remove();
            if (document.getElementById("currentlyBlabberingOnThis") != null) { //fixes a glitch
              document.getElementById("currentlyBlabberingOnThis").remove();
            }
            var aiMessage = document.createElement('div');
            aiMessage.className = 'ai-message';
            aiMessage.innerHTML = `<p class="message `+(Gaddon.tab.redux.state.scratchGui.theme.theme.gui == "light" ? "animated-text-light" : "animated-text")+`" id="currentlyBlabberingOnThis">loading...</p>`;
            document.getElementById('chat_content').appendChild(aiMessage);

            const domParser = new DOMParser();
            // Stream the response
            const TIMEOUT_MS = 60000; // 30 second timeout 
            function readWithTimeout(reader) {
              return Promise.race([
                reader.read(),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Read operation timed out")), TIMEOUT_MS)
                ),
              ]);
            }
            readWithTimeout(reader)
              .then(function processText({ done, value }) {
                if (done) {

                  document.AI_INTEGRATION.AI_currently_blabbering = false;
                  document.AI_INTEGRATION.chatHistory.push({ "role": "user", "message": messageContents });
                  document.AI_INTEGRATION.chatHistory.push({ "role": "assistant", "message": streamResult });
                  document.AI_INTEGRATION.currentInputHasAttachment = false;

                  async function processAndRenderCodeChunks() {
                    var randomId = Math.random().toString(36).substr(2, 5).toUpperCase();
                    document.AI_INTEGRATION.CodeChunks = streamResult.match(/```(.*?)```/gs) || [];
                    document.AI_INTEGRATION.processedCodeChunks = [];

                    const processedChunks = await Promise.all(
                      document.AI_INTEGRATION.CodeChunks.map((chunk, index) =>
                        handleRawCodeChunk(chunk, `${randomId}_${index}`,mainWorkspace)
                      )
                    );

                    document.AI_INTEGRATION.processedCodeChunks = processedChunks;

                    let instanceCount = -1;
                    var editedStreamResult = streamResult.replaceAll(/```(.*?)```/gs, "CODECHUNK23407283947");
                    editedStreamResult = converter.makeHtml(editedStreamResult)
                    editedStreamResult = editedStreamResult.replaceAll("CODECHUNK23407283947", () => {
                      instanceCount++;
                      if (document.AI_INTEGRATION.processedCodeChunks[instanceCount].status == "error") {
                        return "<h1 class=\"errorMessage\">failed to parse Code Chunk</h1><br>"
                      }
                      document.AI_INTEGRATION.AllCodeChunksEverAdded.push(document.AI_INTEGRATION.processedCodeChunks[instanceCount]);
                      let Div = document.createElement('div');
                      Div.id = `TEMPCODEBLOCK${instanceCount}`;
                      Div.style.position = 'absolute';
                      Div.style.opacity = '0';
                      Div.style.pointerEvents = 'none';
                      Div.style.zIndex = '-9999';
                      Div.style.width = '500px';
                      Div.innerHTML = `<div id="CODEBLOCK${instanceCount}">${document.AI_INTEGRATION.processedCodeChunks[instanceCount].blocksAsSVG}</div>`;
                      document.body.appendChild(Div);
                      var codeBlockWidth = [];
                      var codeBlockHeight = [];
                      const theDiv = document.getElementById(`CODEBLOCK${instanceCount}`).children[0];
                      for (var xx = 0; xx < theDiv.children.length; xx++) {
                        codeBlockWidth.push(theDiv.children[xx].children[1].getBBox().width);
                        codeBlockHeight.push(theDiv.children[xx].children[1].getBoundingClientRect().height);
                      }
                      document.getElementById(`TEMPCODEBLOCK${instanceCount}`).remove();

                      let svg = domParser.parseFromString(document.AI_INTEGRATION.processedCodeChunks[instanceCount].blocksAsSVG, "text/html");
                      svg = svg.body.children[0];
                      for (var i = 0; i < svg.children.length; i++) {
                        //svg.setAttribute('viewBox', `0 0 ${codeBlockWidth} ${codeBlockHeight}`);
                        svg.children[i].setAttribute('viewBox', `0 0 ${codeBlockWidth[i]} ${codeBlockHeight[i]}`);
                      }
                      return `<div class="codeChunkOverlay"><div class="insert_button_parent"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 insert_button" uniqueid="${document.AI_INTEGRATION.AllCodeChunksEverAdded.length}"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg></div><div class="codeChunkOverlay_child"><div id="CODEBLOCK_${randomId}_${instanceCount}">${svg.outerHTML}</div></div></div>`;
                    });

                    document.getElementById('currentlyBlabberingOnThis').innerHTML = editedStreamResult;
                    for (let i = 0; i <= instanceCount; i++) { // each code block
                      try {
                        if (document.AI_INTEGRATION.processedCodeChunks[instanceCount].status == "error") {
                          document.getElementById('currentlyBlabberingOnThis').id = '';
                          console.warn("DEBUG: skipping codeblock #" + instanceCount + " due to status failure", document.AI_INTEGRATION.processedCodeChunks[instanceCount])
                          return;
                        }
                        let currentWidth = 150;
                        for (var xx = 0; xx < document.getElementById(`CODEBLOCK_${randomId}_${i}`).children[0].children.length; xx++) { //each top level block
                          const currentElement = document.getElementById(`CODEBLOCK_${randomId}_${i}`).children[0].children[xx];
                          currentElement.style.width = (currentElement.getBoundingClientRect().width * (currentWidth / currentElement.children[1].children[0].getBoundingClientRect().width)) + "px";

                          //THE SMARTED/MOST INSANE CODE THAT WORKS IN THE HISTORY OF JS
                          const currentText = currentElement.querySelector("text");
                          const oldText = currentText.innerHTML;
                          currentText.innerHTML = "a";

                          var currentHeight = currentText.getBoundingClientRect().height;
                          //console.log(currentText);
                          while (currentHeight > 16 && currentWidth > 5) {
                            //console.log("minimizing","currentWidth", currentWidth, "currentHeight", currentHeight);
                            currentWidth -= 5;
                            currentElement.style.width = (currentElement.getBoundingClientRect().width * (currentWidth / currentElement.children[1].children[0].getBoundingClientRect().width)) + "px";
                            currentHeight = currentText.getBoundingClientRect().height;
                          }
                          while (Math.round(currentHeight) < 16 && currentWidth > 5) {
                            //console.log("maximizing","currentWidth", currentWidth, "currentHeight", currentHeight);
                            currentWidth += 1;
                            currentElement.style.width = (currentElement.getBoundingClientRect().width * (currentWidth / currentElement.children[1].children[0].getBoundingClientRect().width)) + "px";
                            currentHeight = currentText.getBoundingClientRect().height;
                          }
                          currentText.innerHTML = oldText;
                        }
                        const currentElement = document.getElementById(`CODEBLOCK_${randomId}_${i}`).children[0];
                        //currentElement.parentElement.parentElement.style = "border: 1px solid var(--ui-tertiary);padding: 5px;padding-top: 10px;margin-bottom: 5px;margin-top: 5px;border-radius: 6px;overflow: auto;";
                        currentElement.parentElement.parentElement.parentElement.children[0].children[0].addEventListener("click", function () {
                          const element = this;
                          function callback() {
                            /*if (this.getAttribute("allowRender") == "false") {
                              return;
                            }*/
                            var workspace = mainWorkspace;
                            var xml = Blockly.Xml.textToDom(document.AI_INTEGRATION.AllCodeChunksEverAdded[element.getAttribute("uniqueid") - 1].BlocksAsXML);
                            //add the variables and lists that don't overlap
                            var [listNames, variableNames, broadcastNames] = helpers.workspaceVariables(true,mainWorkspace);
                            for (var name of document.AI_INTEGRATION.AllCodeChunksEverAdded[element.getAttribute("uniqueid") - 1].variables) {
                              if (!variableNames.includes(name)) {
                                mainWorkspace.createVariable(name, "", null);
                              }
                            }
                            for (var name of document.AI_INTEGRATION.AllCodeChunksEverAdded[element.getAttribute("uniqueid") - 1].lists) {
                              if (!listNames.includes(name)) {
                                mainWorkspace.createVariable(name, "list", null);
                              }
                            }
                            for (var name of document.AI_INTEGRATION.AllCodeChunksEverAdded[element.getAttribute("uniqueid") - 1].broadcasts) {
                              if (!broadcastNames.includes(name)) {
                                mainWorkspace.createVariable(name, "broadcast_msg", null);
                              }
                            }
                            if (replacingBlocksInternal.length > 0) {
                              mainWorkspace.getAllBlocks().forEach(block => {
                                if (block.type == "procedures_definition") {
                                  if (replacingBlocksInternal.includes(block.id)) {
                                    console.log("disposing block", block);
                                    block.dispose();
                                  }
                                }
                              });
                            }

                            var totalWidth = 0;
                            //Blockly.Xml.domToWorkspace(xml, workspace);
                            Array.from(xml.children).forEach(block => {
                              const newBlock = ScratchBlocks.Xml.domToBlock(block, workspace);
                              const x = workspace.scrollX + totalWidth || 0;
                              const y = workspace.scrollY || 0;
                              try {
                                newBlock.moveBy(x, y);
                              } catch (e) {
                                console.error("failed to move block", e);
                              }
                              totalWidth += (newBlock.getBoundingRectangle().bottomRight.x - newBlock.getBoundingRectangle().topLeft.x) + 20;
                            });
                            mainWorkspace.refreshToolboxSelection_();
                            /*const newBlock = ScratchBlocks.Xml.domToBlock(xml, workspace);
                            const x = workspace.scrollX || 0;
                            const y = workspace.scrollY || 0;
                            newBlock.moveBy(x, y);*/
                          }
                          var message = `<p style="font-weight: 900;margin-bottom: 10px;">Adding this code will:</p><ul>`;

                          var [listNames, variableNames] = helpers.workspaceVariables(false,mainWorkspace);
                          var newVariables = [];
                          var newLists = [];
                          var existingVariables = [];
                          var existingLists = [];
                          for (var name of document.AI_INTEGRATION.AllCodeChunksEverAdded[element.getAttribute("uniqueid") - 1].variables) {
                            if (!variableNames.includes(name)) {
                              newVariables.push(name);
                            } else {
                              existingVariables.push(name);
                            }
                          }
                          for (var name of document.AI_INTEGRATION.AllCodeChunksEverAdded[element.getAttribute("uniqueid") - 1].lists) {
                            if (!listNames.includes(name)) {
                              newLists.push(name);
                            } else {
                              existingLists.push(name);
                            }
                          }
                          if (newVariables.length > 0) {
                            message += `<li>Create ${newVariables.length} new ${newVariables.length == 1 ? "variable" : "variables"}: "${newVariables.join('", "')}"</li>`;
                          }
                          if (newLists.length > 0) {
                            message += `<li>Create ${newLists.length} new ${newLists.length == 1 ? "list" : "lists"}: "${newLists.join('", "')}"</li>`;
                          }
                          if (existingVariables.length > 0) {
                            message += `<li>Use ${existingVariables.length} existing ${existingVariables.length == 1 ? "variable" : "variables"}: "${existingVariables.join('", "')}"</li>`;
                          }
                          if (existingLists.length > 0) {
                            message += `<li>Use ${existingLists.length} existing ${existingLists.length == 1 ? "list" : "lists"}: "${existingLists.join('", "')}"</li>`;
                          }
                          var currentWorkspaceBlocks = helpers.getCustomBlockNames(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(mainWorkspace)));
                          var newBlocks = helpers.getCustomBlockNames(document.AI_INTEGRATION.AllCodeChunksEverAdded[element.getAttribute("uniqueid") - 1].BlocksAsXML);
                          //if their are overlapping ones give a warning
                          var replacingBlocks = [];
                          var replacingBlocksInternal = [];
                          var trulyNewBlocks = [];

                          for (var block of newBlocks) {
                            var matchingBlock = currentWorkspaceBlocks.find(currentBlock => currentBlock.customBlockName === block.customBlockName);
                            if (matchingBlock) {
                              replacingBlocks.push("\"" + block.customBlockName.replaceAll("%s", "").replaceAll("%b", "").replaceAll("%n", "").trim() + "\"");
                              replacingBlocksInternal.push(matchingBlock.blockId);
                            } else {
                              trulyNewBlocks.push("\"" + block.customBlockName.replaceAll("%s", "").replaceAll("%b", "").replaceAll("%n", "").trim() + "\"");
                            }
                          }
                          // List truly new blocks
                          if (trulyNewBlocks.length > 0) {
                            message += `<li>Create ${trulyNewBlocks.length} new block${trulyNewBlocks.length == 1 ? "" : "s"}: ${trulyNewBlocks.join(", ")}</li>`;
                          }

                          // List blocks that are being replaced
                          if (replacingBlocks.length > 0) {
                            message += `<li>Replace ${replacingBlocks.length} existing block${replacingBlocks.length == 1 ? "" : "s"}: ${replacingBlocks.join(", ")} <span><p class="errorMessage">(THIS WILL REPLACE YOUR CURRENT BLOCK DEFINITION)</p></span></li>`;
                          }
                          if (message === `<p style="font-weight: 900;margin-bottom: 10px;">Adding this code will:</p><ul>`) {
                            message = `<p>This code does not create/use any variables or lists.</p>`;
                          } else {
                            message += `</ul>`;
                          }
                          const title = "Add Code to Workspace?";
                          ScratchBlocks.prompt(message, null, callback, title, ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE, true);
                        });

                        var errorForChunk = [];
                        for (var xx = 0; xx < document.AI_INTEGRATION.errorsDetected.length; xx++) {
                          if (document.AI_INTEGRATION.errorsDetected[xx].uniqueCommentID == currentElement.parentElement.id.replace("CODEBLOCK_", "")) {
                            errorForChunk.push(document.AI_INTEGRATION.errorsDetected[xx]);
                          }
                        }

                        if (errorForChunk.length == 0) {
                          currentElement.parentElement.style = "width: fit-content;height: fit-content;margin: auto;";
                        } else {
                          console.log(errorForChunk);
                          var div = document.createElement('div');
                          div.innerHTML = `<p style="text-align: center;">A non-fatal issue was detected with this code</p><div style="display: flex;margin: 10px;"></div>`;
                          var button = document.createElement('button');
                          button.style = "margin-left: auto;margin-right: 10px;background-color: transparent;border: 1px solid var(--ui-tertiary);padding: 5px 10px;border-radius: 5px;";
                          button.innerText = "Render Anyways";
                          button.addEventListener("click", function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            currentElement.parentElement.style = "width: fit-content;height: fit-content;margin: auto;";
                            //currentElement.parentElement.parentElement.setAttribute("allowRender", "true");
                            currentElement.parentElement.parentElement.parentElement.children[0].style.display = "";
                            div.remove();
                          });
                          div.children[1].appendChild(button);
                          button = document.createElement('button');
                          button.style = "margin-right: auto;background-color: transparent;border: 1px solid var(--ui-tertiary);padding: 5px 10px;border-radius: 5px;";
                          button.innerText = "Attempt to Repair";
                          button.addEventListener("click", function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            //create new message
                            var userMessage = document.createElement('div');
                            userMessage.className = 'user-message';
                            userMessage.innerHTML = `
                              <div class="message">
                                <span>Attempting to repair code block</span>
                                  <span>
                                      <div class="FileAttachment">
                                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="svg">
                                              <path d="M2 7V14.7519H4.53246L5.9122 16.0909H8.12402L9.50376 14.7519H22V7H9.50376L8.12402 8.33905H5.9122L4.53246 7H2Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="currentcolor"></path>
                                          </svg>
                                          <p class="p">Error Logs</p>
                                      </div>
                                  </span>
                              </div>    
                          `;
                            document.getElementById('chat_content').appendChild(userMessage);
                            requestChat("the following errors occured while trying to parse the code (attempt to fix them):" + errorForChunk.map(error => error.error || "Unknown error").join("\n"));
                          });
                          div.children[1].appendChild(button);
                          currentElement.parentElement.style = "width: 0px; height: 0px; display: none;";
                          currentElement.parentElement.parentElement.appendChild(div);
                          currentElement.parentElement.parentElement.parentElement.children[0].style.display = "none";
                          //currentElement.parentElement.parentElement.parentElement.children[0].children[0].setAttribute("allowRender", "false");
                        }
                      } catch (e) {
                        console.log(e);
                      }
                    }
                    document.getElementById('currentlyBlabberingOnThis').className = 'message';
                    document.getElementById('currentlyBlabberingOnThis').id = '';
                  }
                  processAndRenderCodeChunks();
                  //edittedStreamResult = edittedStreamResult.replace(/CODEBLOCK{(.*?)}/gs, (match, p1) => `<div>CHANGE THIS IN FUTURE</div>`);
                  return;

                }
                document.getElementById('currentlyBlabberingOnThis').className = 'message';
                // Decode the chunk and append to the stream result
                streamResult += decoder.decode(value, { stream: true });

                const animatedTextClass = Gaddon.tab.redux.state.scratchGui.theme.theme.gui == "light" ? "animated-text-light" : "animated-text";
                function updateMessageContents() {
                  var edittedStreamResult = streamResult.replace(/```(.*?)```/gs, () => `<div class="codeChunkOverlay"><p>Currently Processing Code Block</p></div>`);
                  edittedStreamResult = edittedStreamResult.replace(/```[\s\S]*$/, "<div><p class=\"" + animatedTextClass + "\">currently writing a code block</p></div>");
                  edittedStreamResult = converter.makeHtml(edittedStreamResult);
                  document.getElementById('currentlyBlabberingOnThis').innerHTML = edittedStreamResult;
                  document.getElementById('chat_content').scrollTop = document.getElementById('chat_content').scrollHeight;
                  reader.read().then(processText);
                }
                let instanceCount = 0;
                if ((streamResult.match(/```/g) || []).length % 2 == 1) { //fixed animation resetting bug
                  if (document.getElementById('currentlyBlabberingOnThis').innerHTML.includes("<div><p class=\"" + animatedTextClass + "\">currently writing a code block</p></div>")) {
                    reader.read().then(processText);
                  } else {
                    updateMessageContents()
                  }
                } else {
                  updateMessageContents()
                }
              })
              .catch(error => {
                console.error("Error reading:", error);
                document.AI_INTEGRATION.AI_currently_blabbering = false;
                if (document.getElementById('currentlyBlabberingOnThis') != null) {
                  document.getElementById('currentlyBlabberingOnThis').innerHTML = "<h1 class=\"errorMessage\">Error reading response</h1>";
                  document.getElementById('currentlyBlabberingOnThis').className = 'message';
                } else {
                  document.getElementById('AI_is_thinking_what_to_blabber').remove();
                  if (document.getElementById("currentlyBlabberingOnThis") != null) { //fixes a glitch
                    document.getElementById("currentlyBlabberingOnThis").remove();
                  }
                  var aiMessage = document.createElement('div');
                  aiMessage.className = 'ai-message';
                  aiMessage.innerHTML = `<p class="message" id="currentlyBlabberingOnThis" class=\"errorMessage\">Error reading response</p>`;
                  document.getElementById('chat_content').appendChild(aiMessage);
                }
              });
          } else {
            console.error('Error:', response.statusText);
            document.AI_INTEGRATION.AI_currently_blabbering = false;
            if (document.getElementById('currentlyBlabberingOnThis') != null) {
              document.getElementById('currentlyBlabberingOnThis').innerHTML = "<h1 class=\"errorMessage\">Error reading response</h1>";
              document.getElementById('currentlyBlabberingOnThis').className = 'message';
            } else {
              document.getElementById('AI_is_thinking_what_to_blabber').remove();
              if (document.getElementById("currentlyBlabberingOnThis") != null) { //fixes a glitch
                document.getElementById("currentlyBlabberingOnThis").remove();
              }
              var aiMessage = document.createElement('div');
              aiMessage.className = 'ai-message';
              aiMessage.innerHTML = `<p class="message" id="currentlyBlabberingOnThis" class=\"errorMessage\">Error reading response</p>`;
              document.getElementById('chat_content').appendChild(aiMessage);
            }
          }
        })
        .catch(error => {
          console.error('Request failed', error);
          document.AI_INTEGRATION.AI_currently_blabbering = false;
          if (document.getElementById('currentlyBlabberingOnThis') != null) {
            document.getElementById('currentlyBlabberingOnThis').innerHTML = "<h1 class=\"errorMessage\">Error reading response</h1>";
            document.getElementById('currentlyBlabberingOnThis').className = 'message';
          } else {
            document.getElementById('AI_is_thinking_what_to_blabber').remove();
            if (document.getElementById("currentlyBlabberingOnThis") != null) { //fixes a glitch
              document.getElementById("currentlyBlabberingOnThis").remove();
            }
            var aiMessage = document.createElement('div');
            aiMessage.className = 'ai-message';
            aiMessage.innerHTML = `<p class="message" id="currentlyBlabberingOnThis" class=\"errorMessage\">Error reading response</p>`;
            document.getElementById('chat_content').appendChild(aiMessage);
          }
        });
    }
    requestChat(messageContents);
  }
}

export default async function ({ addon, console }) {
  const Blockly = await addon.tab.traps.getBlockly();
  //mainWorkspace = Blockly.getMainWorkspace();
  mainWorkspace = addon.tab.traps.getWorkspace();
  window.AAA = mainWorkspace;
  GetSVG.init(Blockly);
  authToken = addon.settings.get("GeminiAPIKey");
  Gaddon = addon;
  //create new CSS (style for popup)
  const style = document.createElement('link');
  style.setAttribute('rel', 'stylesheet');
  style.setAttribute('href', apiUrl + '/main.css');
  document.head.appendChild(style);

  if (authToken === "") {
    document.AI_INTEGRATION.canUse = false;
    window.addEventListener('ai-button-clicked', function () {
      document.AI_INTEGRATION.attachmentDetails.attachmentBlocks = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(mainWorkspace));
      createBasePopup(true, helpers.currentSpriteName() + " - Entire Sprite", "");
    });
    return;
  }else{
    //fetch apiUrl + "/AI_models"
    fetch(apiUrl + "/AI_models", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          console.error('Error:', response.statusText);
          return [];
        }
      })
      .then(data => {
        document.AI_INTEGRATION.AIModels = data;
        helpers.updateAIModels();
      })
      .catch(error => {
        console.error('Request failed', error);
      });
  }
  addon.tab.createBlockContextMenu(
    (items) => {
      items.push({
        enabled: true,
        text: "Explain this Sprite",
        callback: () => {
          console.log("Explain this Sprite");
          document.AI_INTEGRATION.attachmentDetails.attachmentBlocks = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(mainWorkspace));
          createBasePopup(true, helpers.currentSpriteName() + " - Entire Sprite", "Explain this Sprite:");
        },
        separator: true,
      });
      return items;
    },
    { workspace: true }
  );
  addon.tab.createBlockContextMenu(
    (items, block) => {
      items.push({
        text: "Explain this Code",
        enabled: true,
        callback: () => {
          console.log("Explain this block", block);
          console.log(Blockly.Xml.blockToDom(block));
          console.log(Blockly.Xml.domToText(Blockly.Xml.blockToDom(block)));
          document.AI_INTEGRATION.attachmentDetails.attachmentBlocks = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
          createBasePopup(true, helpers.currentSpriteName() + " - Code Block", "Explain this:");
        },
        separator: true,
      });
      return items;
    },
    { blocks: true }
  );
  addon.tab.createBlockContextMenu(
    (items, block) => {
      items.push({
        text: "Debug this Code",
        enabled: true,
        callback: () => {
          console.log("Debug this code", block);
          document.AI_INTEGRATION.attachmentDetails.attachmentBlocks = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
          createBasePopup(true, helpers.currentSpriteName() + " - Code Block", "I have the following issue with my code {REPLACE THIS WITH ISSUE}, please help me debug it:");
        },
      });
      return items;
    },
    { blocks: true }
  );
  addon.tab.createBlockContextMenu(
    (items, block) => {
      items.push({
        text: "New Chat",
        enabled: true,
        callback: () => {
          console.log("New Chat on this block", block);
          document.AI_INTEGRATION.attachmentDetails.attachmentBlocks = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
          createBasePopup(false, "", "");
        },
      });
      return items;
    },
    { blocks: true }
  );

  addon.tab.redux.addEventListener("statechanged", ({ detail }) => {
    if (detail.action.type === "scratch-gui/navigation/ACTIVATE_TAB") {
      const activeTabIndex = detail.action.activeTabIndex;
      //console.log(`Tab changed to index: ${activeTabIndex}`);
      if (activeTabIndex != 0) {
        helpers.closePopup();
      }
    }
  });

  window.addEventListener('ai-button-clicked', function () {
    document.AI_INTEGRATION.attachmentDetails.attachmentBlocks = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(mainWorkspace));
    createBasePopup(true, helpers.currentSpriteName() + " - Entire Sprite", "");
  });
}
