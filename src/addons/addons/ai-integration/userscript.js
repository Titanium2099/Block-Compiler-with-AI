export default async function ({ addon, console }) {
  const Blockly = await addon.tab.traps.getBlockly();
  addon.self.addEventListener("disabled", update);
  addon.self.addEventListener("reenabled", update);
  addon.tab.createBlockContextMenu(
    (items) => {
      items.push({
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

  window.addEventListener('ai-button-clicked', function() {
    console.log('Successfully received');
  });
}
