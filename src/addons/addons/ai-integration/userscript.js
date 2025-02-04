//WHEN PROCESSING BLOCKS: MAKE SURE THAT ALL SHADOW BLOCKS ARE PRESENT
//ADD SUPPORT FOR LISTS

document.AI_INTEGRATION = {
  AI_currently_blabbering: false,
  currentInputHasAttachment: false,
  attachmentDetails: {
    attachmentText: "",
    attachmentBlocks: "",
  }
};

document.addEventListener("mousemove", (event) => {
  document.AI_INTEGRATION.X_COORDINATE = event.clientX;
  document.AI_INTEGRATION.Y_COORDINATE = event.clientY;
});

function createBasePopup(fileAttached=false,fileAttachedText="Unknown - Entire Sprite") {
  document.AI_INTEGRATION.currentInputHasAttachment = fileAttached;
  document.AI_INTEGRATION.attachmentDetails.attachmentText = fileAttached ? fileAttachedText : "";
  //create new blob
  const blob = new Blob(["<html lang=en><meta charset=UTF-8><style>@keyframes scaleUpDown{0%,100%{transform:scaleY(1) scaleX(1)}50%,90%{transform:scaleY(1.1)}75%{transform:scaleY(.95)}80%{transform:scaleX(.95)}}@keyframes shake{0%,100%{transform:skewX(0) scale(1)}50%{transform:skewX(5deg) scale(.9)}}@keyframes particleUp{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0;top:-100%;transform:scale(.5)}}@keyframes glow{0%,100%{background-color:#ef5a00}50%{background-color:#ff7800}}.fire{width:60px;height:60px;background-color:transparent;margin-left:12px;margin-top:17px;position:absolute}.fire-center{position:absolute;height:100%;width:100%;animation:scaleUpDown 3s ease-out;animation-iteration-count:infinite;animation-fill-mode:both}.fire-center .main-fire{position:absolute;width:100%;height:100%;background-image:radial-gradient(farthest-corner at 10px 0,#d43300 0,#ef5a00 95%);transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-center .particle-fire{position:absolute;top:60%;left:45%;width:2px;height:2px;background-color:#ef5a00;border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-right{height:100%;width:100%;position:absolute;animation:shake 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-right .main-fire{position:absolute;top:15%;right:-25%;width:80%;height:80%;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-right .particle-fire{position:absolute;top:45%;left:50%;width:3.0303030303030303px;height:3.0303030303030303px;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-left{position:absolute;height:100%;width:100%;animation:shake 3s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-left .main-fire{position:absolute;top:15%;left:-20%;width:80%;height:80%;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-left .particle-fire{position:absolute;top:10%;left:20%;width:10%;height:10%;background-color:#ef5a00;border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 3s infinite ease-out 0;animation-fill-mode:both}.fire-bottom .main-fire{position:absolute;top:30%;left:20%;width:75%;height:75%;background-color:#ff7800;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 100% 40%;filter:blur(10px);animation:glow 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}</style><body style=background-color:#111111><div class=fire style=display:table-footer-group><div class=fire-left><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-center><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-right><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-bottom><div class=main-fire></div></div></div></body></html>"], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  //create new div
  const attachedFile = fileAttached ? `<div
          style="border:1px solid #3a3b3b;border-radius:6px;overflow:scroll;display:flex;margin-top:10px;padding:5px;width:fit-content" id="attachedFile">
          <svg fill= none viewBox="0 0 24 24" xmlns= http:// www.w3.org/ 2000/ svg height= 24 width= 24 style= height:16px;color:#87bcde>
              <path
                  d="M2 7V14.7519H4.53246L5.9122 16.0909H8.12402L9.50376 14.7519H22V7H9.50376L8.12402 8.33905H5.9122L4.53246 7H2Z"
                  stroke-linecap= round stroke-linejoin= round stroke= currentcolor stroke-width= 2></path>
          </svg>
          <p
              style='margin:0;margin-right:5px;font-family:"Helvetica Neue",sans-serif;font-size:11px;color:#7b7665'>${fileAttachedText}</p>
          <svg fill= none viewBox="0 0 24 24" xmlns= http:// www.w3.org/ 2000/ svg class= size-6 stroke= currentColor stroke-width= 1.5 style= height:13px;color:#fff;margin-top:auto;margin-bottom:auto;cursor:pointer>
              <path d="M6 18 18 6M6 6l12 12" stroke-linecap= round stroke-linejoin= round></path>
          </svg>
      </div>` : '';
  const div = document.createElement('div');
  div.className = 'container';
  div.style.zIndex = 100000000;
  div.style.position = 'absolute';
  //get current coordinates of mouse
  div.style.left = document.AI_INTEGRATION.X_COORDINATE + 'px';
  div.style.top = document.AI_INTEGRATION.Y_COORDINATE + 'px';

  div.innerHTML = `
  <div style="padding: 5px;display: flex;"><svg fill="none" viewBox="0 0 24 24" xmlns="http://" www.w3.org="" 2000="" svg="" class="size-6" stroke="currentColor" stroke-width="1.5" style="height:19px;color:#fff;margin-top:auto;margin-bottom:auto;cursor:pointer;margin-left: auto;">
                <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
  </div>
  <div class= content id= chat_content>
      <div style= display:flex;flex-direction:column;margin-top:10px>
          <div style= width:79px;height:79px;margin-left:auto;margin-right:auto>
              <iframe src= ${url} style=width:102px;border:0;position:relative;top:-9px;left:-14px;background-color:transparent;z-index:0;height:106px;overflow:hidden></iframe>
          </div>
          <p style= text-align:center;color:#7c7766;font-weight:900;z-index:10>Hi I'm Torchy, How can I help you today?
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

  let offsetX, offsetY, isDragging = false;

  div.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - div.getBoundingClientRect().left;
    offsetY = e.clientY - div.getBoundingClientRect().top;
    div.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      div.style.left = e.clientX - offsetX + 'px';
      div.style.top = e.clientY - offsetY + 40 + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    div.style.cursor = 'grab';
  });
  //add to body
  document.body.appendChild(div);

  var textareaa = document.getElementById('auto-resizing-textarea');

  textareaa.value = "";
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
  document.getElementById('submitChat').addEventListener('click', () => {
    internal
  });
  //add send command for enter + shift
  document.getElementById('auto-resizing-textarea').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      internal();
    }
  });
  
  function internal(){
    if(document.AI_INTEGRATION.AI_currently_blabbering) {
      return;
    }
    document.AI_INTEGRATION.AI_currently_blabbering = true;
    const input = document.getElementById('auto-resizing-textarea');
  
    if(document.AI_INTEGRATION.currentInputHasAttachment) {
      document.getElementById('attachedFile').remove();
      var userMessage = document.createElement('div');
      userMessage.className = 'user-message';
      userMessage.innerHTML = `
                <div class="message">
                    <span>${input.value}</span>
                    <span>
                        <div style="border: 1px solid #3A3B3B;   border-radius: 6px; overflow: scroll; display: flex; margin-top: 10px;padding: 5px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="height: 16px;color: #87BCDE;">
                                <path d="M2 7V14.7519H4.53246L5.9122 16.0909H8.12402L9.50376 14.7519H22V7H9.50376L8.12402 8.33905H5.9122L4.53246 7H2Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="currentcolor"></path>
                            </svg>
                            <p style="margin: 0px;margin-right: 5px;font-size: 11px;">${document.AI_INTEGRATION.attachmentDetails.attachmentText}</p>

                        </div>
                    </span>
                </div>
                `;
      document.getElementById('chat_content').appendChild(userMessage);
    }else{
      var userMessage = document.createElement('div');
      userMessage.className = 'user-message';
      userMessage.innerHTML = `
          <div class="message">${input.value}</div>
      `;
      document.getElementById('chat_content').appendChild(userMessage);
    }


    var loadingDots = document.createElement('div');
    loadingDots.className = 'ai-message';
    loadingDots.id = "AI_is_thinking_what_to_blabber";
    loadingDots.innerHTML = `
                <div class="message" style="width: 22px;">
                    <div class="dot-elastic" style="margin-left: auto;margin-right: auto;"></div>
                </div>
            `;
    document.getElementById('chat_content').appendChild(loadingDots);
    input.value = '';
    //scroll to bottom
    document.getElementById('chat_content').scrollTop = document.getElementById('chat_content').scrollHeight;
  }
}

export default async function ({ addon, console }) {
  const Blockly = await addon.tab.traps.getBlockly();

  //create new CSS (style for popup)
  const style = document.createElement('style');
  style.innerHTML = `* { font-family: "Helvetica Neue", sans-serif; } .container { width: 450px; height: 300px; border: 1px solid #3A3B3B; border-radius: 6px; background-color: #111; display: flex; flex-direction: column; } .content { height: 100%; overflow-y: auto; } .ai-message { max-width: 225px; font-size: 11px; margin-top: 10px; width: fit-content; /*min-width: 110px;*/ } .ai-message .message { color: #7C7766; font-family: "Helvetica Neue", sans-serif; border: 1px solid #3A3B3B; padding: 10px; margin: 0px; margin-left: 10px; border-radius: 10px; font-size: 11px; } .user-message { font-size: 11px; display: flex; max-width: 100%; margin-top: 10px; } .user-message .message { color: #7C7766; font-family: "Helvetica Neue", sans-serif; border: 1px solid #3A3B3B; padding: 10px; border-radius: 10px; margin: 0px; margin-left: auto; margin-right: 10px; max-width: 250px; font-size: 11px; /*min-width: 78px;*/ } .input-container { min-height: 20px; border: 1px solid #3A3B3B; margin: 10px; border-radius: 6px; display: flex; padding: 7.5px; } .input-field { height: 100%; background-color: transparent; border: none; color: #7C7766; margin-left: 8px; font-size: 11px; width: 100%; font-weight: 500; font-family: "Helvetica Neue", sans-serif; outline: none; margin-top: 0px; margin-bottom: 0px; padding: 0px; margin-right: 11px; max-height: 157px; position: relative; top: 2px; } .send-icon { cursor: pointer; } .dot-elastic { position: relative; width: 6px; height: 6px; border-radius: 5px; background-color: #7C7766; color: #7C7766; animation: dot-elastic 1s infinite linear; } .dot-elastic::before, .dot-elastic::after { content: ""; display: inline-block; position: absolute; top: 0; } .dot-elastic::before { left: -10px; width: 6px; height: 6px; border-radius: 5px; background-color: #7C7766; color: #7C7766; animation: dot-elastic-before 1s infinite linear; } .dot-elastic::after { left: 10px; width: 6px; height: 6px; border-radius: 5px; background-color: #7C7766; color: #7C7766; animation: dot-elastic-after 1s infinite linear; } @keyframes dot-elastic-before { 0% { transform: scale(1, 1); } 25% { transform: scale(1, 1.5); } 50% { transform: scale(1, 0.67); } 75% { transform: scale(1, 1); } 100% { transform: scale(1, 1); } } @keyframes dot-elastic { 0% { transform: scale(1, 1); } 25% { transform: scale(1, 1); } 50% { transform: scale(1, 1.5); } 75% { transform: scale(1, 1); } 100% { transform: scale(1, 1); } } @keyframes dot-elastic-after { 0% { transform: scale(1, 1); } 25% { transform: scale(1, 1); } 50% { transform: scale(1, 0.67); } 75% { transform: scale(1, 1.5); } 100% { transform: scale(1, 1); } }`;
  document.head.appendChild(style);

  addon.tab.createBlockContextMenu(
    (items) => {
      items.push({
        enabled: true,
        text: "Explain this Sprite",
        callback: () => {
          console.log("Explain this Sprite");
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
          createBasePopup(true, "Unknown - 25 lines");
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
        },
      });
      return items;
    },
    { blocks: true }
  );

  window.addEventListener('ai-button-clicked', function () {
    console.log('Successfully received');
  });
}
