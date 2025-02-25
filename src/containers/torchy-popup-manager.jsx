import React, { Component } from 'react';
import TorchyPopup from './torchy-popup.jsx';

class TorchyPopupManager extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showPopup: false,
            attachmentDetails: {
                attachmentBlocks: '',
                attachmentText: ''
            },
            X_COORDINATE: 0,
            Y_COORDINATE: 0,
            currentSpriteName: 'Unknown Sprite',
            popupInitialValue: ''
        };

        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleAiButtonClicked = this.handleAiButtonClicked.bind(this);
        this.handleClosePopup = this.handleClosePopup.bind(this);
        this.handleClearChat = this.handleClearChat.bind(this);
    }

    componentDidMount() {
        // Track mouse position globally
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('ai-button-clicked', this.handleAiButtonClicked);
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('ai-button-clicked', this.handleAiButtonClicked);
    }

    handleMouseMove(event) {
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    handleAiButtonClicked() {
        const attachmentBlocks = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace()));
        const SpriteName = vm.runtime.getEditingTarget().sprite.name; // Make sure `vm` is in scope.  Consider passing it as props if needed.

        this.setState({
            attachmentDetails: {
                attachmentBlocks: attachmentBlocks,
                attachmentText: `${SpriteName} - Entire Sprite`
            },
            currentSpriteName: SpriteName,
            popupInitialValue: '',
            showPopup: true,
            X_COORDINATE: this.lastMouseX,
            Y_COORDINATE: this.lastMouseY
        });
    }

    handleClosePopup() {
        this.setState({ showPopup: false });
    }

    handleClearChat() {
        // Implement the logic to clear the chat here
        console.log("Chat cleared!");
    }

    render() {
        const {
            showPopup,
            attachmentDetails,
            X_COORDINATE,
            Y_COORDINATE,
            popupInitialValue
        } = this.state;

        return (
            <>
                {showPopup && (
                    <TorchyPopup
                        fileAttached={true}
                        fileAttachedText={attachmentDetails.attachmentText}
                        inputValue={popupInitialValue}
                        onClose={this.handleClosePopup}
                        X_COORDINATE={X_COORDINATE}
                        Y_COORDINATE={Y_COORDINATE}
                        onClearChat={this.handleClearChat}
                    />
                )}
            </>
        );
    }
}

export default TorchyPopupManager;