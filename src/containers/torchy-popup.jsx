import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import showdown from 'showdown';

const FireAnimation = "<style>@keyframes scaleUpDown{0%,100%{transform:scaleY(1) scaleX(1)}50%,90%{transform:scaleY(1.1)}75%{transform:scaleY(.95)}80%{transform:scaleX(.95)}}@keyframes shake{0%,100%{transform:skewX(0) scale(1)}50%{transform:skewX(5deg) scale(.9)}}@keyframes particleUp{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0;top:-100%;transform:scale(.5)}}@keyframes glow{0%,100%{background-color:#ef5a00}50%{background-color:#ff7800}}.fire{width:60px;height:60px;background-color:transparent;margin-left:8px;margin-top:17px;position:relative;display:block;}.fire-center{position:absolute;height:100%;width:100%;animation:scaleUpDown 3s ease-out;animation-iteration-count:infinite;animation-fill-mode:both}.fire-center .main-fire{position:absolute;width:100%;height:100%;background-image:radial-gradient(farthest-corner at 10px 0,#d43300 0,#ef5a00 95%);transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-center .particle-fire{position:absolute;top:60%;left:45%;width:2px;height:2px;background-color:#ef5a00;border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-right{height:100%;width:100%;position:absolute;animation:shake 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-right .main-fire{position:absolute;top:15%;right:-25%;width:80%;height:80%;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-right .particle-fire{position:absolute;top:45%;left:50%;width:3.0303030303030303px;height:3.0303030303030303px;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-left{position:absolute;height:100%;width:100%;animation:shake 3s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-left .main-fire{position:absolute;top:15%;left:-20%;width:80%;height:80%;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-left .particle-fire{position:absolute;top:10%;left:20%;width:10%;height:10%;background-color:#ef5a00;border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 3s infinite ease-out 0;animation-fill-mode:both}.fire-bottom .main-fire{position:absolute;top:30%;left:20%;width:75%;height:75%;background-color:#ff7800;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 100% 40%;filter:blur(10px);animation:glow 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}</style><div class=fire><div class=fire-left><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-center><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-right><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-bottom><div class=main-fire></div></div></div>";

class TorchyPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      textValue: props.inputValue || '',
      textAreaHeight: '20px',
      textAreaTop: '2px',
      attachment: props.fileAttached ? { text: props.fileAttachedText } : null,
      position: { x: props.X_COORDINATE || 0, y: props.Y_COORDINATE || 0 },
      isDragging: false,
      offset: { x: 0, y: 0 },
      hasMoved: false,
      chatMessages: [],
      AI_currently_blabbering: false,
      currentInputHasAttachment: props.fileAttached,
      attachmentDetails: {
        attachmentText: props.fileAttached ? props.fileAttachedText : "",
        attachmentBlocks: "",
      },
      converter: null,
      chatHistory: [],
      CodeChunks: [],

    };

    this.containerRef = React.createRef();
    this.textareaRef = React.createRef();
    this.chatContentRef = React.createRef(); // Add a ref to the chat content
    this.resistanceThreshold = 5;

    this.handleTextAreaChange = this.handleTextAreaChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleRemoveAttachment = this.handleRemoveAttachment.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleClearChat = this.handleClearChat.bind(this);
    this.handleSubmitChat = this.handleSubmitChat.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.requestChat = this.requestChat.bind(this); // Bind requestChat

  }

  componentDidMount() {
    this.initShowdown();
    if (this.textareaRef.current) {
      this.textareaRef.current.focus();
    }
    this.adjustTextAreaHeight(this.state.textValue);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.textValue !== this.state.textValue) {
      this.adjustTextAreaHeight(this.state.textValue);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  initShowdown() {
    if (typeof showdown !== 'undefined') {
      this.setState({ converter: new showdown.Converter() });
    } else {
      this.intervalId = setInterval(() => {
        if (typeof showdown !== 'undefined') {
          this.setState({ converter: new showdown.Converter() });
          clearInterval(this.intervalId);
        }
      }, 50);
    }
  }

  adjustTextAreaHeight(value) {
    if (value.length > 64 || value.includes('\n')) {
      setTimeout(() => { // Replace setImmediate with setTimeout 0 for better browser compatibility
        if (this.textareaRef.current) { // Check if textareaRef.current is still valid
          const scrollHeight = this.textareaRef.current.scrollHeight;
          this.textareaRef.current.style.height = `${scrollHeight}px`;
          this.setState({ textAreaHeight: `${scrollHeight}px`, textAreaTop: '0px' });
        }
      }, 0); // Using setTimeout with 0 delay is similar to setImmediate
    } else {
      this.setState({ textAreaHeight: '20px', textAreaTop: '2px' });
    }
  }


  handleTextAreaChange(e) {
    const value = e.target.value;
    this.setState({ textValue: value });
    this.adjustTextAreaHeight(value);
  }

  handleClose() {
    this.setState({ isOpen: false });
    this.props.onClose();
  }

  handleRemoveAttachment() {
    this.setState({
      attachment: null,
      currentInputHasAttachment: false,
      attachmentDetails: { attachmentText: "", attachmentBlocks: "" },
    });
  }

  renderAttachedFile() {
    if (this.state.attachment) {
      return (
        <div className="attachedFile" id="attachedFile">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            width="24"
            className="svg"
          >
            <path
              d="M2 7V14.7519H4.53246L5.9122 16.0909H8.12402L9.50376 14.7519H22V7H9.50376L8.12402 8.33905H5.9122L4.53246 7H2Z"
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <p className="texta">{this.state.attachment.text}</p>
          <svg
            id="removeAttachement"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth="1.5"
            className="svg2"
            onClick={this.handleRemoveAttachment}
            style={{ cursor: 'pointer' }}
          >
            <path
              d="M6 18 18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    }
    return null;
  }

  handleMouseDown(e) {
    this.setState({
      isDragging: true,
      hasMoved: false,
      offset: {
        x: e.clientX - this.containerRef.current.offsetLeft,
        y: e.clientY - this.containerRef.current.offsetTop,
      },
    }, () => {
      this.containerRef.current.style.cursor = 'grabbing';
    });
  }

  handleMouseMove(e) {
    if (this.state.isDragging) {
      if (!this.state.hasMoved) {
        const deltaX = Math.abs(e.clientX - Number(this.state.position.x));
        const deltaY = Math.abs(e.clientY - Number(this.state.position.y));
        if (deltaX < this.resistanceThreshold && deltaY < this.resistanceThreshold) {
          return;
        }
        this.setState({ hasMoved: true });
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const divWidth = this.containerRef.current.offsetWidth;
      const divHeight = this.containerRef.current.offsetHeight;
      const tolerance = 10;

      let newLeft = e.clientX - this.state.offset.x;
      let newTop = e.clientY - this.state.offset.y + scrollY;

      if (newLeft < tolerance) newLeft = tolerance;
      if (newTop < scrollY + tolerance) newTop = scrollY + tolerance;
      if (newLeft + divWidth > viewportWidth - tolerance)
        newLeft = viewportWidth - divWidth - tolerance;
      if (newTop + divHeight > scrollY + viewportHeight - tolerance)
        newTop = scrollY + viewportHeight - divHeight - tolerance;

      this.setState({ position: { x: newLeft, y: newTop } });
    }
  }

  handleMouseUp() {
    this.setState({ isDragging: false }, () => {
      this.containerRef.current.style.cursor = 'default';
    });
  }

  handleClearChat() {
    if (window.confirm("Are you sure you want to clear the chat?")) {
      this.setState({ chatMessages: [], chatHistory:[] });
    }
    if (this.props.onClearChat) {
      this.props.onClearChat();
    }
  }

  handleSubmitChat() {
    if (this.state.AI_currently_blabbering) {
      return;
    }

    this.setState({ AI_currently_blabbering: true }, () => {
      const input = this.textareaRef.current;

      if (!input || input.value.trim() === "") {
        this.setState({ AI_currently_blabbering: false });
        return;
      }

      const inputValue = input.value.trim();
      const attachmentData = { ...this.state.attachmentDetails };

      this.setState(prevState => ({
        chatMessages: [
          ...prevState.chatMessages,
          { type: 'user', message: inputValue, attachment: this.state.currentInputHasAttachment ? attachmentData : null },
        ],
      }), () => {
        let customNames = "";
        if (this.props.vm && this.props.vm.runtime && this.props.vm.runtime.getEditingTarget() && this.props.vm.runtime.getEditingTarget().sprite) {
          for (const customName of this.props.vm.runtime.getEditingTarget().sprite.costumes) {
            customNames += customName.name + ", ";
          }

          let soundNames = "";
          for (const soundName of this.props.vm.runtime.getEditingTarget().sprite.sounds) {
            soundNames += soundName.name + ", ";
          }

          const allSpriteNames = this.props.vm.runtime.targets
            .filter(target => target.isSprite && target.getName() !== "Stage")
            .map(sprite => sprite.getName())
            .join(", ");

          const messageContents = inputValue +
            (this.state.currentInputHasAttachment ? "\nAttached Code:" + this.state.attachmentDetails.attachmentBlocks : "") +
            "\n\n\nContext:\nSprite Customes: " + customNames + "\nSprite Sounds: " + soundNames +
            "\nAll Sprites Names: " + allSpriteNames + "\nCurrent Sprite Name:" + this.props.vm.runtime.getEditingTarget().sprite.name;

          input.value = '';
          this.adjustTextAreaHeight('');
          this.setState({ textValue: '' });

          this.requestChat(messageContents);
        }

        input.value = '';
        this.adjustTextAreaHeight('');
        this.setState({
          textValue: '',
          attachment: null,
          currentInputHasAttachment: false,
          attachmentDetails: { attachmentText: "", attachmentBlocks: "" },
          AI_currently_blabbering: false,
        });
      });
    });
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      this.handleSubmitChat();
    }
  }

  renderChatMessages() {
    return this.state.chatMessages.map((message, index) => (
      <div
        key={index}
        className={message.type === 'user' ? 'user-message' : 'ai-message'}
      >
        <div className="message">
          <span>{message.message}</span>
          {message.attachment && (
            <span>
              <div className="FileAttachment">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="svg"
                >
                  <path
                    d="M2 7V14.7519H4.53246L5.9122 16.0909H8.12402L9.50376 14.7519H22V7H9.50376L8.12402 8.33905H5.9122L4.53246 7H2Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    stroke="currentcolor"
                  />
                </svg>
                <p className="p">{message.attachment.attachmentText}</p>
              </div>
            </span>
          )}
        </div>
      </div>
    ));
  }

  // fetchWithTimeout function
  fetchWithTimeout = (url, options = {}, timeout = 5000) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchPromise = fetch(url, { ...options, signal });

    // Set timeout to abort fetch
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return fetchPromise
      .finally(() => clearTimeout(timeoutId));
  }


  requestChat(messageContents) {
    if (!this.chatContentRef.current) {
      console.error("chat_content ref is not available.");
      return;
    }
    if (!window.AI_INTEGRATION) {
      console.error("AI_INTEGRATION is not available.");
      return;
    }
    const authToken = window.AI_INTEGRATION.authToken;
    const apiUrl = window.AI_INTEGRATION.apiUrl; 
    
    const loadingDots = document.createElement('div');
    loadingDots.className = 'ai-message';
    loadingDots.id = "AI_is_thinking_what_to_blabber";
    loadingDots.innerHTML = `
      <div class="message" style="width: 22px;">
        <div class="dot-elastic"></div>
      </div>
    `;
    this.chatContentRef.current.appendChild(loadingDots); // Use the ref
    this.chatContentRef.current.scrollTop = this.chatContentRef.current.scrollHeight; // Use the ref

    this.setState({ CodeChunks: [] });

    const data = {
      api_key: authToken,
      message: messageContents,
      history: this.state.chatHistory,
    };

    this.fetchWithTimeout(apiUrl + "/chat", {
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
          let streamResult = '';

          //remove the loading dots
          if (document.getElementById('AI_is_thinking_what_to_blabber')) {
            document.getElementById('AI_is_thinking_what_to_blabber').remove();
          }

          if (document.getElementById("currentlyBlabberingOnThis") != null) { //fixes a glitch
            document.getElementById("currentlyBlabberingOnThis").remove();
          }
          const aiMessage = document.createElement('div');
          aiMessage.className = 'ai-message';
          aiMessage.innerHTML = `<p class="message" id="currentlyBlabberingOnThis">loading</p>`;
          this.chatContentRef.current.appendChild(aiMessage);

          // Stream the response
          const TIMEOUT_MS = 5000; // 5 seconds timeout read

          const readWithTimeout = (reader) => {
            return Promise.race([
              reader.read(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Read operation timed out")), TIMEOUT_MS)
              ),
            ]);
          };


          const processText = ({ done, value }) => {
            if (done) {
              this.setState(prevState => ({
                AI_currently_blabbering: false,
                chatHistory: [
                  ...prevState.chatHistory,
                  { "role": "user", "message": messageContents },
                  { "role": "assistant", "message": streamResult }
                ],
                currentInputHasAttachment: false,
              }));
              return;
            }
            streamResult += decoder.decode(value, { stream: true });
            const updateMessageContents = () => {
              let edittedStreamResult = streamResult.replace(/```(.*?)```/gs, () => `<div class="codeChunkOverlay"><p>Code block is being processed...</p></div>`);
              edittedStreamResult = edittedStreamResult.replace(/```[\s\S]*$/, "<div><p class=\"animated-text\">currently writing a code block</p></div>");
              if (this.state.converter) {
                edittedStreamResult = this.state.converter.makeHtml(edittedStreamResult);
              }

              if (document.getElementById('currentlyBlabberingOnThis')) {
                document.getElementById('currentlyBlabberingOnThis').innerHTML = edittedStreamResult;
                this.chatContentRef.current.scrollTop = this.chatContentRef.current.scrollHeight;
                readWithTimeout(reader).then(processText);
              }
            };
            if ((streamResult.match(/```/g) || []).length % 2 === 1) { //fixed animation resetting bug
              if (document.getElementById('currentlyBlabberingOnThis') && document.getElementById('currentlyBlabberingOnThis').innerHTML.includes("<div><p class=\"animated-text\">currently writing a code block</p></div>")) {
                readWithTimeout(reader).then(processText);
              } else {
                updateMessageContents();
              }
            } else {
              updateMessageContents();
            }
          };
          readWithTimeout(reader)
            .then(processText)
            .catch(error => {
              console.error("Error reading:", error);
              this.setState({ AI_currently_blabbering: false });
              if (document.getElementById('currentlyBlabberingOnThis')) {
                document.getElementById('currentlyBlabberingOnThis').innerHTML = "<h1 class=\"errorMessage\">Error reading response</h1>";
              } else {
                if (document.getElementById('AI_is_thinking_what_to_blabber')) {
                  document.getElementById('AI_is_thinking_what_to_blabber').remove();
                }
                if (document.getElementById("currentlyBlabberingOnThis")) {
                  document.getElementById("currentlyBlabberingOnThis").remove();
                }
                const aiMessage = document.createElement('div');
                aiMessage.className = 'ai-message';
                aiMessage.innerHTML = `<p class="message" id="currentlyBlabberingOnThis" class="errorMessage">Error reading response</p>`;
                this.chatContentRef.current.appendChild(aiMessage);
              }
            });
        } else {
          console.error('Error:', response.statusText);
          this.setState({ AI_currently_blabbering: false });
          if (document.getElementById('currentlyBlabberingOnThis')) {
            document.getElementById('currentlyBlabberingOnThis').innerHTML = "<h1 class=\"errorMessage\">Error reading response</h1>";
          } else {
            if (document.getElementById('AI_is_thinking_what_to_blabber')) {
              document.getElementById('AI_is_thinking_what_to_blabber').remove();
            }
            if (document.getElementById("currentlyBlabberingOnThis")) {
              document.getElementById("currentlyBlabberingOnThis").remove();
            }
            const aiMessage = document.createElement('div');
            aiMessage.className = 'ai-message';
            aiMessage.innerHTML = `<p class="message" id="currentlyBlabberingOnThis" class="errorMessage">Error reading response</p>`;
            this.chatContentRef.current.appendChild(aiMessage);
          }
        }
      })
      .catch(error => {
        console.error('Request failed', error);
        this.setState({ AI_currently_blabbering: false });
        if (document.getElementById('currentlyBlabberingOnThis')) {
          document.getElementById('currentlyBlabberingOnThis').innerHTML = "<h1 class=\"errorMessage\">Error reading response</h1>";
        } else {
          if (document.getElementById('AI_is_thinking_what_to_blabber')) {
            document.getElementById('AI_is_thinking_what_to_blabber').remove();
          }
          if (document.getElementById("currentlyBlabberingOnThis")) {
            document.getElementById("currentlyBlabberingOnThis").remove();
          }
          const aiMessage = document.createElement('div');
          aiMessage.className = 'ai-message';
          aiMessage.innerHTML = `<p class="message" id="currentlyBlabberingOnThis" class="errorMessage">Error reading response</p>`;
          this.chatContentRef.current.appendChild(aiMessage);
        }
      });
  }



  render() {
    if (!this.state.isOpen) {
      return null;
    }

    if (window.AI_INTEGRATION === undefined || (window.AI_INTEGRATION && (window.AI_INTEGRATION.authToken === undefined || window.AI_INTEGRATION.authToken.trim() === ""))) {
      return (
        <div
          className="container no_api_key"
          id="torchyPopup"
          style={{
            zIndex: 509,
            position: 'absolute',
            left: `${this.state.position.x}px`,
            top: `${this.state.position.y}px`,
          }}
          ref={this.containerRef}
          onMouseDown={this.handleMouseDown}
        >
          <div className="content" id="chat_content" style={{display: "flex", flexDirection: "column"}}>
            <div className="a">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="size-6"
                stroke="currentColor"
                strokeWidth="1.5"
                id="closePopup"
                onClick={this.handleClose}
                style={{ cursor: 'pointer' }}
              >
                <path
                  d="M6 18 18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="b">
              <div className="c" dangerouslySetInnerHTML={{ __html: FireAnimation }}></div>
              <p className="d">
                To use Torchy, please add your API key in the addons page
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="container"
        id="torchyPopup"
        style={{
          zIndex: 509,
          position: 'absolute',
          left: `${this.state.position.x}px`,
          top: `${this.state.position.y}px`,
        }}
        ref={this.containerRef}
        onMouseDown={this.handleMouseDown}
      >
        <div className="headerT">
          <svg
            id="clearChat"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
            onClick={this.handleClearChat}
            style={{ cursor: 'pointer' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
          <svg
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-6"
            stroke="currentColor"
            strokeWidth="1.5"
            id="closePopup"
            onClick={this.handleClose}
            style={{ cursor: 'pointer' }}
          >
            <path
              d="M6 18 18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="content" id="chat_content" ref={this.chatContentRef}>
          <div className="Popup_Header">
            <div className="a" dangerouslySetInnerHTML={{ __html: FireAnimation }}></div>
            <p className="b">Hi I'm Torchy, How can I help you today?</p>
          </div>
          {this.renderChatMessages()}
        </div>
        <div className="input-container" id="chat_box">
          <div className="input-parent">
            <textarea
              className="input-field"
              id="auto-resizing-textarea"
              placeholder="Ask me anything..."
              value={this.state.textValue}
              onChange={this.handleTextAreaChange}
              style={{ height: this.state.textAreaHeight, top: this.state.textAreaTop }}
              ref={this.textareaRef}
              onKeyDown={this.handleKeyDown}
            />
            <svg
              fill="none"
              viewBox="0 0 17 17"
              xmlns="http://www.w3.org/2000/"
              id="submitChat"
              svg
              className="send-icon"
              height="17"
              width="17"
              onClick={this.handleSubmitChat}
              style={{ cursor: 'pointer' }}
            >
              <g clipPath="url(#clip0_147_21)">
                <path
                  d="M2.92172 9.30564L1.08789 3.34619C5.47463 4.62202 9.61134 6.63746 13.3197 9.30564C9.61155 11.9738 5.47507 13.9892 1.08856 15.2651L2.92172 9.30564ZM2.92172 9.30564H7.95788"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="#7C7766"
                  strokeWidth="1.5"
                />
              </g>
              <defs>
                <clipPath id="clip0_147_21">
                  <rect
                    fill="white"
                    height="16.1157"
                    transform="translate(0.132812 0.00830078)"
                    width="16.1157"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>
          {this.renderAttachedFile()}
        </div>
      </div>
    );
  }
}
  
TorchyPopup.propTypes = {
  fileAttached: PropTypes.bool,
  fileAttachedText: PropTypes.string,
  inputValue: PropTypes.string,
  onClose: PropTypes.func,
  X_COORDINATE: PropTypes.number,
  Y_COORDINATE: PropTypes.number,
  onClearChat: PropTypes.func,
  vm: PropTypes.object
};

const mapStateToProps = state => ({
  vm: state.scratchGui.vm
});

export default connect(mapStateToProps)(TorchyPopup);