export default class helpers {
    constructor() {
    }
    static closePopup() {
        if (document.querySelector('.container') == null) return;
        document.querySelector('.container').style.display = 'none';
        document.querySelector('.container').style.zIndex = -999999;
        document.AI_INTEGRATION.popupOpen = false;
    }
    static currentSpriteName() {
        return vm.runtime.getEditingTarget().sprite.name;
    }
    static workspaceVariables(includeBroadcast = false, workspace) {
        var allVariables = workspace.getAllVariables(); // Get all variables
        var lists = allVariables.filter(variable => variable.type === "list");
        var listNames = lists.map(list => list.name);
        var variables = allVariables.filter(variable => variable.type === "");
        var variableNames = variables.map(variable => variable.name);
        if (includeBroadcast) {
            var broadcastNames = workspace.getAllVariables().filter(variable => variable.type === "broadcast_msg").map(variable => variable.name);
            return [listNames, variableNames, broadcastNames];
        }
        return [listNames, variableNames];
    }
    static getCustomBlockNames(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        const result = [];

        // Find all blocks of type 'procedures_definition'
        const blocks = xmlDoc.getElementsByTagName("block");

        for (let block of blocks) {
            if (block.getAttribute("type") === "procedures_definition") {
                const blockId = block.getAttribute("id");

                // Find all mutations related to this block
                const mutations = block.getElementsByTagName("mutation");

                for (let mutation of mutations) {
                    if (mutation.hasAttribute("proccode")) {
                        result.push({
                            blockId: blockId,
                            customBlockName: mutation.getAttribute("proccode")
                        });
                    }
                }
            }
        }

        return result;
    }
    static removeAttachmentListener() {
        document.getElementById('removeAttachement').addEventListener('click', () => {
            document.getElementById('attachedFile').remove();
            document.AI_INTEGRATION.currentInputHasAttachment = false;
            document.AI_INTEGRATION.attachmentDetails.attachmentText = "";
            document.AI_INTEGRATION.attachmentDetails.attachmentBlocks = "";
        });
    }
    static updateAIModels(geminiKey, openrouterKey) {
        if (document.getElementById('AI_Selector_select') == null) return;
        for (var i of document.AI_INTEGRATION.AIModels) {
            const canUse = !(i.API_KEY_TYPE == "gemini" && geminiKey == "" || i.API_KEY_TYPE == "openrouter" && openrouterKey == "");

            var option = document.createElement('option');
            option.value = i.id;
            option.text = i.display_name + (canUse ? "" : " (API Key Required)");
            if (i.default && canUse) {
                option.selected = true;
            }
            if (!canUse) {
                option.disabled = true;
            }
            document.getElementById('AI_Selector_select').appendChild(option);

        }
        document.getElementById('infoAboutAIModels').addEventListener('click', () => {
            ScratchBlocks.prompt(`<p>Each AI model has its own advantages and disadvantages</p><ul><li><strong>Gemini 2.0 Pro</strong> (requires Gemini API key): Excellent at explaining code but frequently makes mistakes when writing it.</li><li><strong>Gemini 2.0 Flash (recommended)</strong> (requires Gemini API key): The most tested model for writing code, offering reliable performance.</li><li><strong>Deepseek R1</strong> (requires OpenRouter API key): Poor at writing code but excels at explaining and analyzing issues. However, it has a very slow response time.</li><li><strong>Deepseek V3</strong> (requires OpenRouter API key): sometimes the best model for writing code (either really good or terrible, basically your luck), but limited to 200 messages per day.</li></ul><br><p>if you don't know what you are doing you should probably stick to the Gemini models (preferably 2.0 flash) as they are way faster and are more tested</p>`, null, function () { }, "AI Models", ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE, true);
            setTimeout(() => {
                document.querySelector(".ReactModal__Content--after-open").style.width = "700px";
            }, 100);
        });
    }
    static fetchWithTimeout(url, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchPromise = fetch(url, { ...options, signal });

        // Set timeout to abort fetch
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        return fetchPromise
            .finally(() => clearTimeout(timeoutId));
    }
    static messageErrorOccured(messageContents) {
        document.AI_INTEGRATION.chatHistory.push({ "role": "user", "message": messageContents });
        //document.AI_INTEGRATION.chatHistory.push({ "role": "assistant", "message": "Error reading response" }); //not sure if the AI needs to know that it failed

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

    static isFirstRequest = true;
    static readWithTimeout(reader) {
        const FIRST_TIMEOUT_MS = 6000;
        const DEFAULT_TIMEOUT_MS = 5000;
        const timeout = this.isFirstRequest ? FIRST_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
        this.isFirstRequest = false;

        return Promise.race([
            reader.read(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Read operation timed out")), timeout)
            ),
        ]);
    }
}