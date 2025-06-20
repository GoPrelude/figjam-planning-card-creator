// This plugin will add cards based on user selection

interface Card {
  title: string;
  content: string;
}

// This shows the HTML page in "ui.html" in a modal
figma.showUI(__html__, { width: 450, height: 400 });

// Listen for selection changes
figma.on("selectionchange", () => {
  const selection = figma.currentPage.selection;
  if (selection.length === 1) {
    const firstSelected = selection[0];
    // Accept only sections and stickies
    const nodeType = firstSelected.type;
    if (nodeType === "SECTION" || nodeType === "STICKY") {
      selectedSection = firstSelected;
      const isSection = firstSelected.type === "SECTION";

      // Handle display name for different node types
      let displayName = firstSelected.name || firstSelected.type;
      if (firstSelected.type === "STICKY") {
        // For sticky notes, get the text content and use just the first line
        const stickyNode = firstSelected as StickyNode;
        if (stickyNode.text && stickyNode.text.characters) {
          const firstLine = stickyNode.text.characters.split("\n")[0].trim();
          displayName = `${firstLine} (Sticky Note)`;
        } else if (firstSelected.name) {
          const firstLine = firstSelected.name.split("\n")[0].trim();
          displayName = `${firstLine} (Sticky Note)`;
        } else {
          displayName = "Sticky Note";
        }
      }

      figma.ui.postMessage({
        type: "selection-found",
        sectionName: displayName,
        isSection: isSection,
      });
    } else {
      selectedSection = null;
      figma.ui.postMessage({ type: "no-selection" });
    }
  } else {
    selectedSection = null;
    figma.ui.postMessage({ type: "no-selection" });
  }
});

// Check initial selection
const initialSelection = figma.currentPage.selection;
let selectedSection: BaseNode | null = null;

// Check if a valid node is selected
if (initialSelection.length === 1) {
  const firstSelected = initialSelection[0];
  // Accept only sections and stickies
  const nodeType = firstSelected.type;
  if (nodeType === "SECTION" || nodeType === "STICKY") {
    selectedSection = firstSelected;
    const isSection = firstSelected.type === "SECTION";

    // Handle display name for different node types
    let displayName = firstSelected.name || firstSelected.type;
    if (firstSelected.type === "STICKY") {
      // For sticky notes, get the text content and use just the first line
      const stickyNode = firstSelected as StickyNode;
      if (stickyNode.text && stickyNode.text.characters) {
        const firstLine = stickyNode.text.characters.split("\n")[0].trim();
        displayName = `${firstLine} (Sticky Note)`;
      } else if (firstSelected.name) {
        const firstLine = firstSelected.name.split("\n")[0].trim();
        displayName = `${firstLine} (Sticky Note)`;
      } else {
        displayName = "Sticky Note";
      }
    }

    figma.ui.postMessage({
      type: "selection-found",
      sectionName: displayName,
      isSection: isSection,
    });
  } else {
    figma.ui.postMessage({ type: "no-selection" });
  }
} else {
  figma.ui.postMessage({ type: "no-selection" });
}

// Function to find the lowest Y position in the backlog
function findLowestYInBacklog(backlogNode: BaseNode): number {
  let lowestY = 0;

  if ("children" in backlogNode && backlogNode.children.length > 0) {
    for (const child of backlogNode.children) {
      if ("y" in child && "height" in child) {
        const childBottomY = child.y + child.height;
        if (childBottomY > lowestY) {
          lowestY = childBottomY;
        }
      }
    }
  }

  // If backlog has bounds, use that as reference
  if ("absoluteBoundingBox" in backlogNode && backlogNode.absoluteBoundingBox) {
    const backlogBottom =
      backlogNode.absoluteBoundingBox.y +
      backlogNode.absoluteBoundingBox.height;
    if (backlogBottom > lowestY) {
      lowestY = backlogBottom;
    }
  }

  return lowestY;
}

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === "check-selection") {
    const selection = figma.currentPage.selection;
    if (selection.length === 1) {
      // Accept only sections and stickies
      const nodeType = selection[0].type;
      if (nodeType === "SECTION" || nodeType === "STICKY") {
        selectedSection = selection[0];
        const isSection = selection[0].type === "SECTION";
        figma.ui.postMessage({
          type: "selection-found",
          sectionName: selection[0].name || selection[0].type,
          isSection: isSection,
        });
      } else {
        selectedSection = null;
        figma.ui.postMessage({ type: "no-selection" });
      }
    } else {
      selectedSection = null;
      figma.ui.postMessage({ type: "no-selection" });
    }
  }

  if (msg.type === "add-cards") {
    try {
      // Load fonts that sticky notes use
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });

      // Use selected section or show error
      if (!selectedSection) {
        figma.notify("❌ Please select a section first");
        return;
      }

      const targetSection = selectedSection;
      const placement = msg.placement || "inside";

      figma.notify(
        `Adding cards ${placement === "below" ? "below" : "to"} ${
          targetSection.name
        }...`
      );

      // Get starting position
      let startX = 0;
      let startY = 0;

      if (placement === "below") {
        // Place below the selection
        if (
          "absoluteBoundingBox" in targetSection &&
          targetSection.absoluteBoundingBox
        ) {
          startX = targetSection.absoluteBoundingBox.x;
          startY =
            targetSection.absoluteBoundingBox.y +
            targetSection.absoluteBoundingBox.height +
            50;
        } else if (
          "x" in targetSection &&
          "y" in targetSection &&
          "height" in targetSection
        ) {
          startX = targetSection.x;
          startY = targetSection.y + targetSection.height + 50;
        }
      } else {
        // Place inside the section
        if (
          "absoluteBoundingBox" in targetSection &&
          targetSection.absoluteBoundingBox
        ) {
          startX = targetSection.absoluteBoundingBox.x + 20;
          startY = findLowestYInBacklog(targetSection) + 50;
        } else if ("x" in targetSection && "y" in targetSection) {
          startX = targetSection.x + 20;
          startY = targetSection.y + 800; // Default offset if no children
        }
      }

      // Create sticky notes with proper spacing
      const cardWidth = 416; // Standard sticky note width in this board
      const spacing = 20; // Space between cards

      // Get cards from the message
      const cards: Card[] = msg.cards || [];

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const x = startX + i * (cardWidth + spacing);
        const y = startY;

        // Create sticky note
        const sticky = figma.createSticky();

        // Set wide width to match existing sticky notes (416px width)
        sticky.isWideWidth = true;

        // Set text content
        sticky.text.characters = card.content;

        // Format the text with proper semantic sizes and bold text
        try {
          const text = card.content;

          // Set all text to "Small" size (16px) first
          sticky.text.setRangeFontSize(0, text.length, 16);

          // 1. Make title (first line) "Medium" size and bold
          const firstLineEnd = text.indexOf("\n");
          if (firstLineEnd > 0) {
            sticky.text.setRangeFontSize(0, firstLineEnd, 24); // Medium size
            sticky.text.setRangeFontName(0, firstLineEnd, {
              family: "Inter",
              style: "Bold",
            });
          }

          // 2. Find and format "Objective:" as bold (keep Small size)
          const objectiveIndex = text.indexOf("Objective:");
          if (objectiveIndex > -1) {
            sticky.text.setRangeFontName(objectiveIndex, objectiveIndex + 10, {
              family: "Inter",
              style: "Bold",
            });
          }

          // 3. Find and format "Dependency:" as bold and format list items (keep Small size)
          const dependencyIndex = text.indexOf("Dependency:");
          if (dependencyIndex > -1) {
            sticky.text.setRangeFontName(
              dependencyIndex,
              dependencyIndex + 11,
              {
                family: "Inter",
                style: "Bold",
              }
            );

            // Find the dependency list items (lines after "Dependency:" until next empty line or section)
            const dependencyStart = dependencyIndex + 12; // After "Dependency:\n"
            let dependencyEnd = text.indexOf("\n\n", dependencyStart);
            if (dependencyEnd === -1) dependencyEnd = text.length;

            // Format as unordered list if there are dependency items
            if (dependencyEnd > dependencyStart) {
              sticky.text.setRangeListOptions(dependencyStart, dependencyEnd, {
                type: "UNORDERED",
              });
            }
          }

          // 3.5. Find and format "Requirements:" as bold and format list items (keep Small size)
          const requirementsIndex = text.indexOf("Requirements:");
          if (requirementsIndex > -1) {
            sticky.text.setRangeFontName(
              requirementsIndex,
              requirementsIndex + 13,
              {
                family: "Inter",
                style: "Bold",
              }
            );

            // Find the requirements list items (lines after "Requirements:" until next empty line or section)
            const requirementsStart = requirementsIndex + 14; // After "Requirements:\n"
            let requirementsEnd = text.indexOf("\n\n", requirementsStart);
            if (requirementsEnd === -1) requirementsEnd = text.length;

            // Format as unordered list if there are requirements items
            if (requirementsEnd > requirementsStart) {
              sticky.text.setRangeListOptions(
                requirementsStart,
                requirementsEnd,
                { type: "UNORDERED" }
              );
            }
          }

          // 4. Find and format entire "Lift (Days) = X" line as bold and Medium size
          const liftIndex = text.indexOf("Lift (Days) =");
          if (liftIndex > -1) {
            const liftEnd = text.indexOf("\n", liftIndex);
            const liftEndPos = liftEnd > -1 ? liftEnd : text.length;
            sticky.text.setRangeFontName(liftIndex, liftEndPos, {
              family: "Inter",
              style: "Bold",
            });
            sticky.text.setRangeFontSize(liftIndex, liftEndPos, 24); // Medium size for whole line
          }

          // 5. Find and format "Start Date =" as bold (keep Small size)
          const startDateIndex = text.indexOf("Start Date =");
          if (startDateIndex > -1) {
            sticky.text.setRangeFontName(startDateIndex, startDateIndex + 12, {
              family: "Inter",
              style: "Bold",
            });
          }

          // 6. Find and format "End Date =" as bold (keep Small size)
          const endDateIndex = text.indexOf("End Date =");
          if (endDateIndex > -1) {
            sticky.text.setRangeFontName(endDateIndex, endDateIndex + 10, {
              family: "Inter",
              style: "Bold",
            });
          }
        } catch (e) {
          // Text formatting failed, continue without formatting
        }

        // Set position
        sticky.x = x;
        sticky.y = y;

        // Set gray color for backlog items (matches existing gray sticky notes)
        sticky.fills = [
          {
            type: "SOLID",
            color: {
              r: 0.9019607901573181,
              g: 0.9019607901573181,
              b: 0.9019607901573181,
            }, // Exact gray from board
          },
        ];

        // Set author visible for proper text rendering
        sticky.authorVisible = true;

        // Add to parent if placement is inside and target is a section
        if (
          placement === "inside" &&
          "appendChild" in targetSection &&
          targetSection.type === "SECTION"
        ) {
          try {
            (targetSection as SectionNode).appendChild(sticky);
          } catch (e) {
            // Could not append to section, sticky will remain on page
          }
        }
        // If placement is below, sticky notes are already positioned correctly on the page
      }

      // Select the new stickies and zoom to them
      const newStickies = figma.currentPage.findAll(
        (node) =>
          node.type === "STICKY" &&
          cards.some(
            (card) => (node as StickyNode).text.characters === card.content
          )
      ) as SceneNode[];

      if (newStickies.length > 0) {
        figma.currentPage.selection = newStickies;
        figma.viewport.scrollAndZoomIntoView(newStickies);
      }

      figma.notify(
        `✅ Successfully added ${cards.length} card${
          cards.length !== 1 ? "s" : ""
        }!`
      );

      // Close plugin after successful add
      figma.closePlugin();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      figma.notify("❌ Error adding cards: " + errorMessage);
    }
  }

  if (msg.type === "resize") {
    figma.ui.resize(450, msg.height);
  }

  if (msg.type === "cancel") {
    figma.closePlugin();
  }
};

// Handle plugin closing
figma.on("close", () => {
  figma.closePlugin();
});
