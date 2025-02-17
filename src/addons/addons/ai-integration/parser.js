/**
 * thanks to blocks2image for this code (modified for standalone use)
 * @example
 *   const xml = Blockly.Xml.textToDom(`Some block XML here`);
 *   const svgGenerator = new GetSVG(xml,Blockly);
 *   svgGenerator.getSVG().then(svgString => {
 *     console.log(svgString); // Process the exported SVG string here
 *   });
 */
export default class GetSVG {
  constructor() {
    //this.blockXml = blockXml;
    this.exSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.exSVG.setAttribute("xmlns:html", "http://www.w3.org/1999/xhtml");
    this.exSVG.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    this.exSVG.setAttribute("version", "1.1");
  }
  defineBlockly(Blockly) {
    this.Blockly = Blockly;
  }
  // Method to set CSS variables for the element
  setCSSVars(element) {
    for (let property of document.documentElement.style) {
      if (property.startsWith("--editorTheme3-"))
        element.style.setProperty(property, document.documentElement.style.getPropertyValue(property));
    }
  }

  // Method to create style for the SVG
  makeStyle() {
    let style = document.createElement("style");
    style.textContent = `
      .blocklyText {
          fill: ${this.Blockly.Colours.text};
          font-family: "Helvetica Neue", Helvetica, sans-serif;
          font-size: 12pt;
          font-weight: 500;
      }
      .blocklyNonEditableText>text, .blocklyEditableText>text {
          fill: ${this.Blockly.Colours.textFieldText};
      }
      .blocklyDropdownText {
          fill: ${this.Blockly.Colours.text} !important;
      }
    `;
    for (let userstyle of document.querySelectorAll(".scratch-addons-style[data-addons*='editor-theme3']")) {
      if (userstyle.disabled) continue;
      style.textContent += userstyle.textContent;
    }
    return style;
  }

  async getSVG(blockXml,uniqueCommentID) {
    this.blockXml = this.Blockly.Xml.textToDom(blockXml);

    let workspace = this.Blockly.getMainWorkspace(); // Get the existing workspace

    // Store existing block IDs before adding new blocks
    let existingBlockIds = workspace.getAllBlocks().map(block => block.id);


    var returnedData = "<div style=\"display: flex;flex-direction: column;\">";

    for (const blockXml of Array.from(this.blockXml.children)) {
      let block = this.Blockly.Xml.domToBlock(blockXml, workspace,uniqueCommentID);
      returnedData += await this.getSVG_internal(block);
  }
    returnedData += "</div>";
    // Remove only the newly added blocks (keep existing workspace intact)
    workspace.getAllBlocks().forEach(block => {
      if (!existingBlockIds.includes(block.id)) {
        block.dispose(); // Remove only the new block
      }
    });
    return returnedData;
  }
  // Main method to fetch the SVG for a given blockXml
  async getSVG_internal(block) {

    // Get the exported SVG
    let svg = this.selectedBlocks(false, block);

    // Replace &nbsp; whitespace issues
    svg.querySelectorAll("text").forEach(text => {
      text.innerHTML = text.innerHTML.replace(/&nbsp;/g, " ");
    });

    // Replace external images with data URIs
    await this.replaceExternalImages(svg);

    // Export the SVG as a file
    return new XMLSerializer().serializeToString(svg);
  }

  // Method to generate selected blocks SVG
  selectedBlocks(isExportPNG, block) {
    let svg = this.exSVG.cloneNode();

    let svgchild = block.getSvgRoot();
    if (!svgchild) {
      console.error("Block SVG not found");
      return;
    }

    svgchild = svgchild.cloneNode(true);
    let dataShapes = svgchild.getAttribute("data-shapes");
    let translateY = 0;
    const scale = isExportPNG ? 2 : 1;

    if (dataShapes === "c-block c-1 hat") {
      translateY = 20;
    } else if (dataShapes === "hat") {
      translateY = block.CAT_BLOCKS ? 32 : 16;
    }

    svgchild.setAttribute("transform", `translate(0,${scale * translateY}) scale(${scale})`);

    this.setCSSVars(svg);
    svg.append(this.makeStyle());
    svg.append(svgchild);
    return svg;
  }

  // Method to replace external images with data URIs
  async replaceExternalImages(svg) {
    await Promise.all(
      Array.from(svg.querySelectorAll("image")).map(async item => {
        const iconUrl = item.getAttribute("xlink:href");
        if (!iconUrl || iconUrl.startsWith("data:")) return;
        const blob = await (await fetch(iconUrl)).blob();
        const reader = new FileReader();
        const dataUri = await new Promise(resolve => {
          reader.addEventListener("load", () => resolve(reader.result));
          reader.readAsDataURL(blob);
        });
        item.setAttribute("xlink:href", dataUri);
      })
    );
  }
}