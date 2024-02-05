import { jsPDF } from "jspdf";

const downloadPdf = (chats, name) => {
  const doc = new jsPDF();
  // Set background color
  const backgroundColor = [26, 54, 26];
  doc.setFillColor(...backgroundColor);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, "F");

  let yPosition = 40; // Initial Y position for first line of text after the header
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const maxWidth = pageWidth - margin * 2; // Maximum width of text per line

  doc.setTextColor("white");
  doc.setFontSize(20);
  const title = "Healio";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 20);

  const applyStyle = (text, style) => {
    switch (style) {
      case "b":
        doc.setFont(undefined, "bold");
        break;
      case "i":
        doc.setFont(undefined, "italic");
        break;
      default:
        doc.setFont(undefined, "normal");
    }
    return doc.splitTextToSize(text, maxWidth);
  };

  const addTextWithPageCheck = (htmlText, fontSize, textColor) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(textColor);

    // Simple HTML tag handling
    const tagPatterns = {
      "<br>": "\n",
      "<li>": "\n• ",
      "</li>": "",
      "<ul>": "\n",
      "</ul>": "\n",
      // More tags can be added here
    };

    // Replace simple tags with their text equivalents33
    for (let tag in tagPatterns) {
      htmlText = htmlText.replace(new RegExp(tag, "g"), tagPatterns[tag]);
    }

    // Split the text by new lines to handle different styles potentially
    let fragments = htmlText.split("\n");
    fragments.forEach((fragment) => {
      let lines;
      if (fragment.startsWith("• ")) {
        // Handle bullet points separately
        lines = applyStyle(fragment, "normal");
      } else if (fragment.match(/<b>.*<\/b>/)) {
        // Example for bold text handling
        fragment = fragment.replace(/<\/?b>/g, "");
        lines = applyStyle(fragment, "b");
      } else {
        lines = applyStyle(fragment, "normal");
      }

      lines.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          doc.setFillColor(...backgroundColor);
          doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, "F");
          doc.setTextColor("white");
          doc.setFontSize(20);
          doc.text(title, (pageWidth - titleWidth) / 2, 20);
          yPosition = 40;
        }

        doc.setTextColor(textColor);
        doc.text(line, margin, yPosition);
        yPosition += 7; // Adjust based on actual line height
      });

      yPosition += 7; // Extra space after each fragment
    });
  };

  chats.forEach((chat) => {
    addTextWithPageCheck(`You: ${chat.prompt}`, 14, "black");
    let responseText = chat.response; // Assume responseText might contain simple HTML tags
    addTextWithPageCheck(`Healio: ${responseText}`, 14, "black");
  });

  doc.save(name);
};

export { downloadPdf };
