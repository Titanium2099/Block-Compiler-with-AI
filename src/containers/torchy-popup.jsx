import React, { useState, useEffect, useRef, useCallback } from 'react';
import showdown from 'showdown';

const FireAnimation = "<style>@keyframes scaleUpDown{0%,100%{transform:scaleY(1) scaleX(1)}50%,90%{transform:scaleY(1.1)}75%{transform:scaleY(.95)}80%{transform:scaleX(.95)}}@keyframes shake{0%,100%{transform:skewX(0) scale(1)}50%{transform:skewX(5deg) scale(.9)}}@keyframes particleUp{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0;top:-100%;transform:scale(.5)}}@keyframes glow{0%,100%{background-color:#ef5a00}50%{background-color:#ff7800}}.fire{width:60px;height:60px;background-color:transparent;margin-left:8px;margin-top:17px;position:relative;display:block;}.fire-center{position:absolute;height:100%;width:100%;animation:scaleUpDown 3s ease-out;animation-iteration-count:infinite;animation-fill-mode:both}.fire-center .main-fire{position:absolute;width:100%;height:100%;background-image:radial-gradient(farthest-corner at 10px 0,#d43300 0,#ef5a00 95%);transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-center .particle-fire{position:absolute;top:60%;left:45%;width:2px;height:2px;background-color:#ef5a00;border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-right{height:100%;width:100%;position:absolute;animation:shake 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-right .main-fire{position:absolute;top:15%;right:-25%;width:80%;height:80%;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-right .particle-fire{position:absolute;top:45%;left:50%;width:3.0303030303030303px;height:3.0303030303030303px;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-left{position:absolute;height:100%;width:100%;animation:shake 3s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}.fire-left .main-fire{position:absolute;top:15%;left:-20%;width:80%;height:80%;background-color:#ef5a00;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 60% 40%;filter:drop-shadow(0 0 10px #d43322)}.fire-left .particle-fire{position:absolute;top:10%;left:20%;width:10%;height:10%;background-color:#ef5a00;border-radius:50%;filter:drop-shadow(0 0 10px #d43322);animation:particleUp 3s infinite ease-out 0;animation-fill-mode:both}.fire-bottom .main-fire{position:absolute;top:30%;left:20%;width:75%;height:75%;background-color:#ff7800;transform:scaleX(.8) rotate(45deg);border-radius:0 40% 100% 40%;filter:blur(10px);animation:glow 2s ease-out 0;animation-iteration-count:infinite;animation-fill-mode:both}</style><div class=fire><div class=fire-left><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-center><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-right><div class=main-fire></div><div class=particle-fire></div></div><div class=fire-bottom><div class=main-fire></div></div></div>";

const TorchyPopup = ({
  fileAttached = false,
  fileAttachedText = 'Unknown - Entire Sprite',
  inputValue = '',
  onClose,
  canUseAI = false,
  X_COORDINATE = 0,
  Y_COORDINATE = 0,
  onClearChat,
  vm,
  requestChat,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [textValue, setTextValue] = useState(inputValue);
  const [textAreaHeight, setTextAreaHeight] = useState('20px');
  const [textAreaTop, setTextAreaTop] = useState('2px');
  const [attachment, setAttachment] = useState(fileAttached ? { text: fileAttachedText } : null);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const [position, setPosition] = useState({ x: X_COORDINATE, y: Y_COORDINATE });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const resistanceThreshold = 5;
  const [hasMoved, setHasMoved] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [AI_currently_blabbering, setAI_currently_blabbering] = useState(false);
  const [currentInputHasAttachment, setCurrentInputHasAttachment] = useState(fileAttached);
  const [attachmentDetails, setAttachmentDetails] = useState({
    attachmentText: fileAttached ? fileAttachedText : "",
    attachmentBlocks: "",
  });
  const [converter, setConverter] = useState(null);


  useEffect(() => {
    const initShowdown = () => {
      setConverter(new showdown.Converter());
    };

    if (typeof showdown !== 'undefined') {
      initShowdown();
    } else {
      const intervalId = setInterval(() => {
        if (typeof showdown !== 'undefined') {
          initShowdown();
          clearInterval(intervalId);
        }
      }, 50);

      return () => clearInterval(intervalId);
    }
  }, []);



  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    adjustTextAreaHeight(textValue);
  }, [textValue]);


  const adjustTextAreaHeight = (value) => {
    if (value.length > 64 || value.includes('\n')) {
       setImmediate(() => {
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
            setTextAreaHeight(`${scrollHeight}px`);
            setTextAreaTop('0px');
       });
    } else {
      setTextAreaHeight('20px');
      setTextAreaTop('2px');
    }
  };


  const handleTextAreaChange = (e) => {
    const value = e.target.value;
    setTextValue(value);
    adjustTextAreaHeight(value);
  };



  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setCurrentInputHasAttachment(false);
    setAttachmentDetails({ attachmentText: "", attachmentBlocks: "" });
  };

  const renderAttachedFile = () => {
    if (attachment) {
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
          <p className="texta">{attachment.text}</p>
          <svg
            id="removeAttachement"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth="1.5"
            className="svg2"
            onClick={handleRemoveAttachment}
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
  };

  // Drag functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setHasMoved(false);
    const startX = e.clientX;
    const startY = e.clientY;
    setOffset({
      x: e.clientX - containerRef.current.offsetLeft,
      y: e.clientY - containerRef.current.offsetTop,
    });
    containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      if (!hasMoved) {
        const deltaX = Math.abs(e.clientX - Number(position.x));
        const deltaY = Math.abs(e.clientY - Number(position.y));
        if (deltaX < resistanceThreshold && deltaY < resistanceThreshold) {
          return;
        }
        setHasMoved(true);
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const divWidth = containerRef.current.offsetWidth;
      const divHeight = containerRef.current.offsetHeight;
      const tolerance = 10;

      let newLeft = e.clientX - offset.x;
      let newTop = e.clientY - offset.y + scrollY;

      if (newLeft < tolerance) newLeft = tolerance;
      if (newTop < scrollY + tolerance) newTop = scrollY + tolerance;
      if (newLeft + divWidth > viewportWidth - tolerance)
        newLeft = viewportWidth - divWidth - tolerance;
      if (newTop + divHeight > scrollY + viewportHeight - tolerance)
        newTop = scrollY + viewportHeight - divHeight - tolerance;

      setPosition({ x: newLeft, y: newTop });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    containerRef.current.style.cursor = 'default';
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset, position]);


  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat?")) {
      setChatMessages([]);
    }
    if (onClearChat) {
      onClearChat();
    }
  };

  const handleSubmitChat = useCallback(() => {
    if (AI_currently_blabbering) {
      return;
    }

    setAI_currently_blabbering(true);
    const input = textareaRef.current;

    if (!input || input.value.trim() === "") {
      setAI_currently_blabbering(false);
      return;
    }

    const inputValue = input.value.trim();
    const attachmentData = { ...attachmentDetails };

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { type: 'user', message: inputValue, attachment: currentInputHasAttachment ? attachmentData : null },
    ]);

    let customNames = "";
    if (vm && vm.runtime && vm.runtime.getEditingTarget() && vm.runtime.getEditingTarget().sprite) {
        for (const customName of vm.runtime.getEditingTarget().sprite.costumes) {
            customNames += customName.name + ", ";
        }

        let soundNames = "";
        for (const soundName of vm.runtime.getEditingTarget().sprite.sounds) {
            soundNames += soundName.name + ", ";
        }

        const allSpriteNames = vm.runtime.targets
            .filter(target => target.isSprite && target.getName() !== "Stage")
            .map(sprite => sprite.getName())
            .join(", ");

        const messageContents = inputValue +
            (currentInputHasAttachment ? "\nAttached Code:" + attachmentDetails.attachmentBlocks : "") +
            "\n\n\nContext:\nSprite Customes: " + customNames + "\nSprite Sounds: " + soundNames +
            "\nAll Sprites Names: " + allSpriteNames + "\nCurrent Sprite Name:" + vm.runtime.getEditingTarget().sprite.name;

            input.value = '';
            adjustTextAreaHeight('');
            setTextValue('');

            if (requestChat) {
                requestChat(messageContents);
            }


    }

    // Reset input state
    input.value = '';
    adjustTextAreaHeight('');
    setTextValue(''); // Update state to reflect cleared textarea
    setAttachment(null); // Clear the attachment
    setCurrentInputHasAttachment(false);
    setAttachmentDetails({ attachmentText: "", attachmentBlocks: "" }); // Clear attachment details
    setAI_currently_blabbering(false);

  }, [AI_currently_blabbering, adjustTextAreaHeight, vm, requestChat, currentInputHasAttachment, attachmentDetails]);



  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSubmitChat();
    }
  };

  // Render chat messages
  const renderChatMessages = () => {
    return chatMessages.map((message, index) => (
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
  };



  if (!isOpen) {
    return null;
  }


  if (!canUseAI) {
    return (
      <div
        className="container no_api_key"
        id="torchyPopup"
        style={{
          zIndex: 509,
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        ref={containerRef}
        onMouseDown={handleMouseDown}
      >
        <div className="content" id="chat_content">
          <div className="a">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
              stroke="currentColor"
              strokeWidth="1.5"
              id="closePopup"
              onClick={handleClose}
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
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      ref={containerRef}
      onMouseDown={handleMouseDown}
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
          onClick={handleClearChat}
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
          onClick={handleClose}
          style={{ cursor: 'pointer' }}
        >
          <path
            d="M6 18 18 6M6 6l12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="content" id="chat_content">
        <div className="Popup_Header">
          <div className="a" dangerouslySetInnerHTML={{ __html: FireAnimation }}></div>
          <p className="b">Hi I'm Torchy, How can I help you today?</p>
        </div>
        {renderChatMessages()}
      </div>
      <div className="input-container" id="chat_box">
        <div className="input-parent">
          <textarea
            className="input-field"
            id="auto-resizing-textarea"
            placeholder="Ask me anything..."
            value={textValue}
            onChange={handleTextAreaChange}
            style={{ height: textAreaHeight, top: textAreaTop }}
            ref={textareaRef}
            onKeyDown={handleKeyDown}
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
            onClick={handleSubmitChat}
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
        {renderAttachedFile()}
      </div>
    </div>
  );
};

export default TorchyPopup;