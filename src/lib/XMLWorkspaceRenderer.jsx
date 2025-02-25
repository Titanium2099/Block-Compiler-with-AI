import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import LazyScratchBlocks from './tw-lazy-scratch-blocks';


const XMLWorkspaceRenderer = ({ xmlCode }) => {
    const workspaceContainerRef = useRef(null);
    const workspaceRef = useRef(null);


    useEffect(() => {
        const initializeWorkspace = async () => {
            if (!workspaceContainerRef.current) {
                return; 
            }

            const ScratchBlocks = LazyScratchBlocks.get();

            if (!ScratchBlocks) {
                console.error("Scratch Blocks not loaded!");
                return;
            }

            const workspaceConfig = {
                "zoom": {
                    "controls": false,
                    "wheel": false,
                    "startScale": 0.9
                },
                "comments": false,
                "collapse": false,
                "scrollbars": true,
                "media": "static/blocks-media/default/",
                "rtl": false
            };

            const oldDefaultToolbox = ScratchBlocks.Blocks.defaultToolbox;
            ScratchBlocks.Blocks.defaultToolbox = null;

            workspaceRef.current = ScratchBlocks.inject(workspaceContainerRef.current, workspaceConfig);
            // HACK to remove the toolbox
            ScratchBlocks.Blocks.defaultToolbox = oldDefaultToolbox;


            if (xmlCode) {
                try {
                    const dom = Blockly.Xml.textToDom(xmlCode);
                    Blockly.Xml.domToWorkspace(dom, workspaceRef.current);
                } catch (error) {
                    console.error("Error parsing XML:", error);
                }
            }


            return () => {
                if (workspaceRef.current) {
                    workspaceRef.current.dispose();
                }
            };
        };
        initializeWorkspace();

    }, [xmlCode]); 


    return (
        <div
            style={{ width: '100%', height: '100%' }} 
            ref={workspaceContainerRef}
        />
    );
};

XMLWorkspaceRenderer.propTypes = {
    xmlCode: PropTypes.string.isRequired,
};

export default XMLWorkspaceRenderer;