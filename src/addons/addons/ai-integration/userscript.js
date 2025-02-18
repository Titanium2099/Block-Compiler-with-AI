//WHEN PROCESSING BLOCKS: MAKE SURE THAT ALL SHADOW BLOCKS ARE PRESENT

import GetSVG from "./parser.js";


const apiUrl = "http://127.0.0.1:5000/chat";
let authToken;
var converter;
const resistanceThreshold = 10;

const xmlParser = new DOMParser();
const xmlSerializer = new XMLSerializer();
const blockParser = new GetSVG();
var mainWorkspace;


window.addEventListener('blockError', (event) => {
  document.AI_INTEGRATION.errorsDetected.push(event.detail);
});

document.AI_INTEGRATION = {
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

const originalState = document.AI_INTEGRATION;

document.addEventListener("mousemove", (event) => {
  document.AI_INTEGRATION.X_COORDINATE = event.clientX;
  document.AI_INTEGRATION.Y_COORDINATE = event.clientY;
});

function currentSpriteName() {
  return document.getElementsByClassName("input_input-form_l9eYg sprite-info_sprite-input_17wjb")[0].value; //hacky way to get the sprite name, should be replaced with a better way
}

function workspaceVariables() {
  var workspace = mainWorkspace;
  var allVariables = workspace.getAllVariables(); // Get all variables
  var lists = allVariables.filter(variable => variable.type === "list");
  var listNames = lists.map(list => list.name);
  var variables = allVariables.filter(variable => variable.type === "");
  var variableNames = variables.map(variable => variable.name);
  return [listNames, variableNames];
}

async function handleRawCodeChunk(codeChunk, uniqueCommentID) {
  let response = {
    "variables": [],
    "lists": [],
    "rawXML": codeChunk,
    "BlocksAsXML": "",
    "blocksAsSVG": "",
    "status": "success",
    "overlappingVars": [],
    "overlappingLists": [],
    "uniqueCommentID": uniqueCommentID,
  }
  try {
    codeChunk = "<BlockChunkdata2938512938>" + codeChunk.replace("```xml", "").replaceAll("```", "") + "</BlockChunkdata2938512938>";
    let xmlCode = xmlParser.parseFromString(codeChunk, "text/xml");
    //check if it successfully parsed
    if (xmlCode.getElementsByTagName("parsererror").length > 0) {
      response.status = "error";
      return response;
    }
    while (xmlCode.getElementsByTagName("variableCreationRequest").length > 0) {
      response.variables.push(xmlCode.getElementsByTagName("variableCreationRequest")[0].textContent);
      //delete the variable creation request
      xmlCode.getElementsByTagName("variableCreationRequest")[0].remove();
    }
    while (xmlCode.getElementsByTagName("listCreationRequest").length > 0) {
      response.lists.push(xmlCode.getElementsByTagName("listCreationRequest")[0].textContent);
      //delete the list creation request
      xmlCode.getElementsByTagName("listCreationRequest")[0].remove();
    }
    for (var x of response.variables) if (mainWorkspace.getVariable(x) != null) response.overlappingVars.push(x)
    for (var x of response.lists) if (mainWorkspace.getVariable(x, "list") != null) response.overlappingLists.push(x)

    response.BlocksAsXML = "<xml>" + xmlSerializer.serializeToString(xmlCode).replace("<BlockChunkdata2938512938>", "").replace("</BlockChunkdata2938512938>", "") + "</xml>";
    response.blocksAsSVG = await blockParser.getSVG(response.BlocksAsXML, uniqueCommentID);
  } catch (e) {
    console.error(e);
    response.status = "error";
  }
  //due to the way that the code is parsed, the variables and lists are added to the workspace and we need to remove them (if they don't overlap)
  response.variables.forEach(variable => {
    if (!response.overlappingVars.includes(variable)) {
      if (mainWorkspace.getVariable(variable) != null) mainWorkspace.deleteVariableById(mainWorkspace.getVariable(variable).getId())
    }
  });
  response.lists.forEach(list => {
    if (!response.overlappingLists.includes(list)) {
      if (mainWorkspace.getVariable(list, "list") != null) mainWorkspace.deleteVariableById(mainWorkspace.getVariable(list, "list").getId())
    }
  });
  return response;
}


function createBasePopup(fileAttached = false, fileAttachedText = "Unknown - Entire Sprite", inputValue = "") {
  if (document.AI_INTEGRATION.popupOpen) {
    return;
  }
  document.AI_INTEGRATION.popupOpen = true;
  document.AI_INTEGRATION.currentInputHasAttachment = fileAttached;
  document.AI_INTEGRATION.attachmentDetails.attachmentText = fileAttached ? fileAttachedText : "";


  //create new div
  const attachedFile = fileAttached ? `<div
          style="border:1px solid var(--ui-tertiary);border-radius:6px;overflow:auto;display:flex;margin-top:10px;padding:5px;width:fit-content" id="attachedFile">
          <svg fill= none viewBox="0 0 24 24" xmlns= http:// www.w3.org/ 2000/ svg height= 24 width= 24 style= height:16px;color:#87bcde>
              <path
                  d="M2 7V14.7519H4.53246L5.9122 16.0909H8.12402L9.50376 14.7519H22V7H9.50376L8.12402 8.33905H5.9122L4.53246 7H2Z"
                  stroke-linecap= round stroke-linejoin= round stroke= currentcolor stroke-width= 2></path>
          </svg>
          <p
              style='margin:0;margin-right:5px;font-family:"Helvetica Neue",sans-serif;font-size:11px;color:#7b7665'>${fileAttachedText}</p>
          <svg id="removeAttachement" fill= none viewBox="0 0 24 24" xmlns= http:// www.w3.org/ 2000/ svg class= size-6 stroke= currentColor stroke-width= 1.5 style= height:13px;color:var(--text-primary);margin-top:auto;margin-bottom:auto;cursor:pointer>
              <path d="M6 18 18 6M6 6l12 12" stroke-linecap= round stroke-linejoin= round></path>
          </svg>
      </div>` : '';


  if (document.querySelector('.container') != null) {
    document.querySelector('.container').style.display = '';
    document.querySelector('.container').style.zIndex = 100000000;
    //FINISH ADDING SUPPORT TO reopening popup
    var textareaa = document.getElementById('auto-resizing-textarea');
    //focus on textarea
    textareaa.focus();

    textareaa.value = inputValue;
    var parsedAttachFile = xmlParser.parseFromString(attachedFile, "text/html");
    document.getElementById("chat_box").appendChild(parsedAttachFile.body.children[0]);
    return;
  }
  //create new blob
  const FireAnimation = "<style>@keyframes scaleUpDown{0%,100%{transform:scaleY(1) scaleX(1)}50%,90%{transform:scaleY(1.1)}75%{transform:scaleY(.95)}80%{transform:scaleX(.95)}}@keyframes shake{0%,100%{transform:skewX(0) scale(1)}50%{transform:skewX(5deg) scale(.9)}}@keyframes particleUp{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0;top:-100%;transform:scale(.5)}}@keyframes glow{0%,100%{background-color:#ef5a00}50%{background-color:#ff7800}}.fire{width:60px;height:60px;background-color:transparent;margin-left:8px;margin-top:17px;position:relative;display:block;}.fire-center{position:absolute;height:100%;width:100%;animation:scaleUpDown 3s ease-out;animation-iteration-count:infinite;animation-fill-mode:both}.fire-center .main-fire{position:absolute;width:100%;height:100%;background-image:radial-gradient(farthest-corner at 10px 0,#d43300 0,#ef5a00 95%);transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-center .particle-fire{position:absolute;top:60%;left:45%;width:2px;height:2px;background-color:#ef5a00;border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-right{height:100%;width:100%;position:absolute;animation:shake 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-right .main-fire{position:absolute;top:15%;right:-25%;width:80%;height:80%;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-right .particle-fire{position:absolute;top:45%;left:50%;width:3.0303030303030303px;height:3.0303030303030303px;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-left{position:absolute;height:100%;width:100%;animation:shake 3s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-left .main-fire{position:absolute;top:15%;left:-20%;width:80%;height:80%;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-left .particle-fire{position:absolute;top:10%;left:20%;width:10%;height:10%;background-color:#ef5a00;border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 3s infinite ease-out 0;animation-fill-mode:both}.fire-bottom .main-fire{position:absolute;top:30%;left:20%;width:75%;height:75%;background-color:#ff7800;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 100% 40%;filter:blur(10px);animation:glow 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}</style><div class=fire><div class=fire-left><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-center><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-right><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-bottom><div class=main-fire></div></div></div>";


  if (!document.AI_INTEGRATION.canUse) {
    const div = document.createElement('div');
    div.className = 'container';
    div.id = 'torchyPopup';
    div.style.zIndex = 100000000;
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
    div.innerHTML = `<div class="content" id="chat_content" style="display: flex;flex-direction: column;">
      <div style="padding: 5px;display: flex;"><svg fill="none" viewBox="0 0 24 24" xmlns="http://" www.w3.org="" 2000="" svg="" class="size-6" stroke="currentColor" stroke-width="1.5" style="height:19px;color:var(--text-primary);margin-top:auto;margin-bottom:auto;cursor:pointer;margin-left: auto;" id="closePopup">
                <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
  </div><div style="display:flex;flex-direction:column;margin:auto;">
          <div style="width:79px;height:79px;margin-left:auto;margin-right:auto;margin-bottom:5px">
             ${FireAnimation}
          </div>
          <p style="text-align:center;color:#7c7766;font-weight:900;z-index:10;user-select:none;pointer-events:none;width: 300px;margin-left: auto;margin-right: auto;">To use Torchy, please add your API key in the addons page</p></div>
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
  div.style.zIndex = 100000000;
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
  <div style="padding: 5px;display: flex;">
  <svg id="clearChat" style="height:19px;color:var(--text-primary);margin-top:auto;margin-bottom:auto;cursor:pointer;margin-left: auto;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
  <svg fill="none" viewBox="0 0 24 24" xmlns="http://" www.w3.org="" 2000="" svg="" class="size-6" stroke="currentColor" stroke-width="1.5" style="height:19px;color:var(--text-primary);margin-top:auto;margin-bottom:auto;cursor:pointer;margin-left: 10px;" id="closePopup">
                <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
  </div>
  <div class= content id= chat_content>
      <div style= display:flex;flex-direction:column;margin-top:10px>
          <div style= width:79px;height:79px;margin-left:auto;margin-right:auto;margin-bottom:5px>
             ${FireAnimation}
          </div>
          <p style= text-align:center;color:#7c7766;font-weight:900;z-index:10;user-select:none;pointer-events:none>Hi I'm Torchy, How can I help you today?
      </div>
  </div>
  <div style= min-height:fit-content;flex-direction:column class= input-container id= chat_box>
      <div style= width:100%;display:flex>
          <textarea class= input-field id= auto-resizing-textarea placeholder="Ask me anything..." style= resize:none;min-height:20px;height:20px;top:2px></textarea>
          <svg fill= none viewBox="0 0 17 17" xmlns= http:// www.w3.org/ 2000/ id=submitChat svg class= send-icon height= 17 width= 17>
              <g clip-path= url(#clip0_147_21)>
                  <path
                      d="M2.92172 9.30564L1.08789 3.34619C5.47463 4.62202 9.61134 6.63746 13.3197 9.30564C9.61155 11.9738 5.47507 13.9892 1.08856 15.2651L2.92172 9.30564ZM2.92172 9.30564H7.95788"
                      stroke-linecap= round stroke-linejoin= round stroke= #7C7766 stroke-width= 1.5></path>
              </g>
              <defs>
                  <clipPath id= clip0_147_21>
                      <rect fill= white height= 16.1157 transform="translate(0.132812 0.00830078)" width= 16.1157></rect>
                  </clipPath>
              </defs>
          </svg>
      </div>
      ${attachedFile}
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
  function defineShowdown() {
    if (typeof showdown != "undefined") {
      converter = new showdown.Converter();
    } else {
      setTimeout(defineShowdown, 10);
    }
  }
  defineShowdown();
  document.getElementById('removeAttachement').addEventListener('click', () => {
    document.getElementById('attachedFile').remove();
    document.AI_INTEGRATION.currentInputHasAttachment = false;
    document.AI_INTEGRATION.attachmentDetails.attachmentText = "";
    document.AI_INTEGRATION.attachmentDetails.attachmentBlocks = "";
  });

  document.getElementById('closePopup').addEventListener('click', () => {
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.container').style.zIndex = -999999;
    document.AI_INTEGRATION.popupOpen = false;
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
    if (e.key === 'Enter' && e.shiftKey) {
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

    if (document.AI_INTEGRATION.currentInputHasAttachment) {
      document.getElementById('attachedFile').remove();
      var userMessage = document.createElement('div');
      userMessage.className = 'user-message';
      userMessage.innerHTML = `
                <div class="message">
                    <span>${input.value}</span>
                    <span>
                        <div style="border: 1px solid var(--ui-tertiary);   border-radius: 6px; overflow: auto; display: flex; margin-top: 10px;padding: 5px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="height: 16px;color: #87BCDE;">
                                <path d="M2 7V14.7519H4.53246L5.9122 16.0909H8.12402L9.50376 14.7519H22V7H9.50376L8.12402 8.33905H5.9122L4.53246 7H2Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="currentcolor"></path>
                            </svg>
                            <p style="margin: 0px;margin-right: 5px;font-size: 11px;">${document.AI_INTEGRATION.attachmentDetails.attachmentText}</p>

                        </div>
                    </span>
                </div>
                `;
      document.getElementById('chat_content').appendChild(userMessage);
    } else {
      var userMessage = document.createElement('div');
      userMessage.className = 'user-message';
      userMessage.innerHTML = `
          <div class="message">${input.value}</div>
      `;
      document.getElementById('chat_content').appendChild(userMessage);
    }
    const messageContents = input.value + "\nAttached Code:" + document.AI_INTEGRATION.attachmentDetails.attachmentBlocks;
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
                    <div class="dot-elastic" style="margin-left: auto;margin-right: auto;"></div>
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
      };
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
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
            aiMessage.innerHTML = `<p class="message" id="currentlyBlabberingOnThis">loading</p>`;
            document.getElementById('chat_content').appendChild(aiMessage);

            const domParser = new DOMParser();
            // Stream the response
            const TIMEOUT_MS = 5000; // 5 seconds timeout read
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
                        handleRawCodeChunk(chunk, `${randomId}_${index}`)
                      )
                    );

                    document.AI_INTEGRATION.processedCodeChunks = processedChunks;

                    let instanceCount = -1;
                    var editedStreamResult = streamResult.replaceAll(/```(.*?)```/gs, "CODECHUNK23407283947");
                    editedStreamResult = converter.makeHtml(editedStreamResult)
                    editedStreamResult = editedStreamResult.replaceAll("CODECHUNK23407283947", () => {
                      instanceCount++;
                      if (document.AI_INTEGRATION.processedCodeChunks[instanceCount].status == "error") {
                        return "<h1 style=\"color: #d0402e;\">failed to parse Code Chunk</h1><br>"
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
                      return `<div uniqueID="${document.AI_INTEGRATION.AllCodeChunksEverAdded.length}"><div id="CODEBLOCK_${randomId}_${instanceCount}">${svg.outerHTML}</div></div>`;
                    });

                    document.getElementById('currentlyBlabberingOnThis').innerHTML = editedStreamResult;
                    for (let i = 0; i <= instanceCount; i++) { // each code block
                      try {
                        if (document.AI_INTEGRATION.processedCodeChunks[instanceCount].status == "error") {
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
                        currentElement.parentElement.parentElement.style = "border: 1px solid var(--ui-tertiary);padding: 5px;padding-top: 10px;margin-bottom: 5px;margin-top: 5px;border-radius: 6px;overflow: auto;";
                        currentElement.parentElement.parentElement.addEventListener("click", function () {
                          if (this.getAttribute("allowRender") == "false") {
                            return;
                          }
                          var workspace = mainWorkspace;
                          var xml = Blockly.Xml.textToDom(document.AI_INTEGRATION.AllCodeChunksEverAdded[this.getAttribute("uniqueID") - 1].BlocksAsXML);
                          //add the variables and lists that don't overlap
                          var [listNames, variableNames] = workspaceVariables();
                          for (var name of document.AI_INTEGRATION.AllCodeChunksEverAdded[this.getAttribute("uniqueID") - 1].variables) {
                            if (!variableNames.includes(name)) {
                              mainWorkspace.createVariable(name, "", null);
                            }
                          }
                          for (var name of document.AI_INTEGRATION.AllCodeChunksEverAdded[this.getAttribute("uniqueID") - 1].lists) {
                            if (!listNames.includes(name)) {
                              mainWorkspace.createVariable(name, "list", null);
                            }
                          }

                          var totalWidth = 0;
                          //Blockly.Xml.domToWorkspace(xml, workspace);
                          Array.from(xml.children).forEach(block => {
                            const newBlock = ScratchBlocks.Xml.domToBlock(block, workspace);
                            const x = workspace.scrollX + totalWidth || 0;
                            const y = workspace.scrollY || 0;
                            newBlock.moveBy(x, y);
                            totalWidth += newBlock.getBoundingRectangle().bottomRight.x + 20;
                          });
                          /*const newBlock = ScratchBlocks.Xml.domToBlock(xml, workspace);
                          const x = workspace.scrollX || 0;
                          const y = workspace.scrollY || 0;
                          newBlock.moveBy(x, y);*/
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
                            currentElement.parentElement.parentElement.setAttribute("allowRender", "true");
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
                                      <div style="border: 1px solid var(--ui-tertiary);   border-radius: 6px; overflow: auto; display: flex; margin-top: 10px;padding: 5px;">
                                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="height: 16px;color: #87BCDE;">
                                              <path d="M2 7V14.7519H4.53246L5.9122 16.0909H8.12402L9.50376 14.7519H22V7H9.50376L8.12402 8.33905H5.9122L4.53246 7H2Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="currentcolor"></path>
                                          </svg>
                                          <p style="margin: 0px;margin-right: 5px;font-size: 11px;">Error Logs</p>
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
                          currentElement.parentElement.parentElement.setAttribute("allowRender", "false");
                        }
                      } catch (e) {
                        console.log(e);
                      }
                    }
                    document.getElementById('currentlyBlabberingOnThis').id = '';
                  }
                  processAndRenderCodeChunks();
                  //edittedStreamResult = edittedStreamResult.replace(/CODEBLOCK{(.*?)}/gs, (match, p1) => `<div>CHANGE THIS IN FUTURE</div>`);
                  return;

                }
                // Decode the chunk and append to the stream result
                streamResult += decoder.decode(value, { stream: true });
                //console.log(streamResult);  // Print or use the response as needed

                let instanceCount = 0;
                var edittedStreamResult = streamResult.replace(/```(.*?)```/gs, () => `CODEBLOCK #${++instanceCount}`);
                edittedStreamResult = edittedStreamResult.replace(/```[\s\S]*$/, "<div><p class=\"animated-text\">currently writing a code block</p></div>");
                edittedStreamResult = converter.makeHtml(edittedStreamResult);
                //FUTURE REPLACE `````` with code block
                document.getElementById('currentlyBlabberingOnThis').innerHTML = edittedStreamResult;
                //document.getElementById('currentlyBlabberingOnThis').innerText = streamResult;
                document.getElementById('chat_content').scrollTop = document.getElementById('chat_content').scrollHeight;
                reader.read().then(processText);
              })
              .catch(error => {
                console.error("Error reading:", error);
                document.AI_INTEGRATION.AI_currently_blabbering = false;
                if (document.getElementById('currentlyBlabberingOnThis') != null) {
                  document.getElementById('currentlyBlabberingOnThis').innerHTML = "<h1 style=\"color: #d0402e;\">Error reading response</h1>";
                } else {
                  document.getElementById('AI_is_thinking_what_to_blabber').remove();
                  if (document.getElementById("currentlyBlabberingOnThis") != null) { //fixes a glitch
                    document.getElementById("currentlyBlabberingOnThis").remove();
                  }
                  var aiMessage = document.createElement('div');
                  aiMessage.className = 'ai-message';
                  aiMessage.innerHTML = `<p class="message" id="currentlyBlabberingOnThis" style=\"color: #d0402e;\">Error reading response</p>`;
                  document.getElementById('chat_content').appendChild(aiMessage);
                }
              });
          } else {
            console.error('Error:', response.statusText);
            document.AI_INTEGRATION.AI_currently_blabbering = false;
            if (document.getElementById('currentlyBlabberingOnThis') != null) {
              document.getElementById('currentlyBlabberingOnThis').innerHTML = "<h1 style=\"color: #d0402e;\">Error reading response</h1>";
            } else {
              document.getElementById('AI_is_thinking_what_to_blabber').remove();
              if (document.getElementById("currentlyBlabberingOnThis") != null) { //fixes a glitch
                document.getElementById("currentlyBlabberingOnThis").remove();
              }
              var aiMessage = document.createElement('div');
              aiMessage.className = 'ai-message';
              aiMessage.innerHTML = `<p class="message" id="currentlyBlabberingOnThis" style=\"color: #d0402e;\">Error reading response</p>`;
              document.getElementById('chat_content').appendChild(aiMessage);
            }
          }
        })
        .catch(error => {
          console.error('Request failed', error);
          document.AI_INTEGRATION.AI_currently_blabbering = false;
          if (document.getElementById('currentlyBlabberingOnThis') != null) {
            document.getElementById('currentlyBlabberingOnThis').innerHTML = "<h1 style=\"color: #d0402e;\">Error reading response</h1>";
          } else {
            document.getElementById('AI_is_thinking_what_to_blabber').remove();
            if (document.getElementById("currentlyBlabberingOnThis") != null) { //fixes a glitch
              document.getElementById("currentlyBlabberingOnThis").remove();
            }
            var aiMessage = document.createElement('div');
            aiMessage.className = 'ai-message';
            aiMessage.innerHTML = `<p class="message" id="currentlyBlabberingOnThis" style=\"color: #d0402e;\">Error reading response</p>`;
            document.getElementById('chat_content').appendChild(aiMessage);
          }
        });
    }
    requestChat(messageContents);
  }
}

export default async function ({ addon, console }) {
  const Blockly = await addon.tab.traps.getBlockly();
  mainWorkspace = Blockly.getMainWorkspace();
  blockParser.defineBlockly(Blockly);
  authToken = addon.settings.get("GeminiAPIKey");

  //create new CSS (style for popup)
  const style = document.createElement('style');
  style.innerHTML = `* { font-family: "Helvetica Neue", sans-serif; } .container { width: 450px; height: 300px; border: 1px solid var(--ui-tertiary); border-radius: 6px; background-color: var(--ui-primary); display: flex; flex-direction: column; } .content { height: 100%; overflow-y: auto; } .ai-message { max-width: 337.5px; font-size: 11px; margin-top: 10px; width: fit-content; /*min-width: 110px;*/ } .ai-message .message { color: #7C7766; font-family: "Helvetica Neue", sans-serif; border: 1px solid var(--ui-tertiary); padding: 10px; margin: 0px; margin-left: 10px; border-radius: 10px; font-size: 11px; } .user-message { font-size: 11px; display: flex; max-width: 100%; margin-top: 10px; } .user-message .message { color: #7C7766; font-family: "Helvetica Neue", sans-serif; border: 1px solid var(--ui-tertiary); padding: 10px; border-radius: 10px; margin: 0px; margin-left: auto; margin-right: 10px; max-width: 250px; font-size: 11px; /*min-width: 78px;*/ } .input-container { min-height: 20px; border: 1px solid var(--ui-tertiary); margin: 10px; border-radius: 6px; display: flex; padding: 7.5px; } .ai-message .message *:not(svg):not(svg *) {font-size:11px; } .ai .message h1 {font-size:14px;} .input-field { height: 100%; background-color: transparent; border: none; color: #7C7766; margin-left: 8px; font-size: 11px; width: 100%; font-weight: 500; font-family: "Helvetica Neue", sans-serif; outline: none; margin-top: 0px; margin-bottom: 0px; padding: 0px; margin-right: 11px; max-height: 157px; position: relative; top: 2px; } .send-icon { cursor: pointer; } .dot-elastic { position: relative; width: 6px; height: 6px; border-radius: 5px; background-color: #7C7766; color: #7C7766; animation: dot-elastic 1s infinite linear; } .dot-elastic::before, .dot-elastic::after { content: ""; display: inline-block; position: absolute; top: 0; } .dot-elastic::before { left: -10px; width: 6px; height: 6px; border-radius: 5px; background-color: #7C7766; color: #7C7766; animation: dot-elastic-before 1s infinite linear; } .dot-elastic::after { left: 10px; width: 6px; height: 6px; border-radius: 5px; background-color: #7C7766; color: #7C7766; animation: dot-elastic-after 1s infinite linear; } @keyframes dot-elastic-before { 0% { transform: scale(1, 1); } 25% { transform: scale(1, 1.5); } 50% { transform: scale(1, 0.67); } 75% { transform: scale(1, 1); } 100% { transform: scale(1, 1); } } @keyframes dot-elastic { 0% { transform: scale(1, 1); } 25% { transform: scale(1, 1); } 50% { transform: scale(1, 1.5); } 75% { transform: scale(1, 1); } 100% { transform: scale(1, 1); } } @keyframes dot-elastic-after { 0% { transform: scale(1, 1); } 25% { transform: scale(1, 1); } 50% { transform: scale(1, 0.67); } 75% { transform: scale(1, 1.5); } 100% { transform: scale(1, 1); } } .animated-text{background:linear-gradient(to right,var(--ui-tertiary) 20%,#635f52 40%,#635f52 60%,#393a3a 80%);background-size:200% auto;color:#000;background-clip:text;text-fill-color:transparent;-webkit-background-clip:text;-webkit-text-fill-color:transparent;-webkit-animation:2s linear infinite shine;animation:2s linear infinite shine}@-webkit-keyframes shine{to{background-position:200% center}}@keyframes shine{to{background-position:200% center}}`;
  document.head.appendChild(style);

  const js = document.createElement('script');
  js.src = "https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js";
  document.head.appendChild(js);

  if (authToken === "") {
    document.AI_INTEGRATION.canUse = false;
    window.addEventListener('ai-button-clicked', function () {
      document.AI_INTEGRATION.attachmentDetails.attachmentBlocks = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(mainWorkspace));
      createBasePopup(true, currentSpriteName() + " - Entire Sprite", "");
    });
    return;
  }
  addon.tab.createBlockContextMenu(
    (items) => {
      items.push({
        enabled: true,
        text: "Explain this Sprite",
        callback: () => {
          console.log("Explain this Sprite");
          document.AI_INTEGRATION.attachmentDetails.attachmentBlocks = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(mainWorkspace));
          createBasePopup(true, currentSpriteName() + " - Entire Sprite", "Explain this Sprite:");
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
          createBasePopup(true, currentSpriteName() + " - Code Block", "Explain this:");
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
          createBasePopup(true, currentSpriteName() + " - Code Block", "I have the following issue with my code {REPLACE THIS WITH ISSUE}, please help me debug it:");
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

  window.addEventListener('ai-button-clicked', function () {
    document.AI_INTEGRATION.attachmentDetails.attachmentBlocks = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(mainWorkspace));
    createBasePopup(true, currentSpriteName() + " - Entire Sprite", "");
  });
}
